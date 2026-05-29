import { config, features } from '@/services/config';
import { IssueMeta } from '@/data/questions';
import { isEstimated } from '@/services/stanceEstimation';
import type { Candidate, ChatMessage, Contest } from '@/types';

/**
 * Claude-powered candidate summaries and chatbot.
 *
 * Two transports:
 *   1. aiProxyUrl set  -> POST { system, messages, model } to your backend.
 *   2. anthropicApiKey -> call the Anthropic Messages API directly (dev only).
 * Prompt caching (cache_control) is applied to the system block so repeated
 * turns about the same candidate reuse the cached context.
 *
 * With neither configured, returns clearly-labeled stub text so the UI works.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

function candidateContext(candidate: Candidate, contest?: Contest): string {
  const stanceLines = Object.entries(candidate.stances)
    .map(([issue, val]) => {
      const meta = IssueMeta[issue as keyof typeof IssueMeta];
      if (!meta || val === undefined) return null;
      const lean = val > 0 ? meta.posPole : val < 0 ? meta.negPole : 'mixed/centrist';
      return `- ${meta.label}: leans "${lean}" (${val > 0 ? '+' : ''}${val})`;
    })
    .filter(Boolean)
    .join('\n');

  return [
    `Candidate: ${candidate.name}`,
    `Party: ${candidate.party ?? 'Unknown'}`,
    `Office sought: ${candidate.office}${contest?.district ? ` (${contest.district})` : ''}`,
    candidate.bio ? `Bio: ${candidate.bio}` : null,
    candidate.website ? `Website: ${candidate.website}` : null,
    stanceLines ? `Positions on a -2..+2 scale:\n${stanceLines}` : null,
    isEstimated(candidate)
      ? 'NOTE: These positions are ESTIMATED from the candidate\'s party, not a verified record.'
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}

const SYSTEM_BASE = `You are Ballotwise's nonpartisan voting assistant. You help a voter understand a specific candidate.
Rules:
- Be strictly neutral. Never tell the user who to vote for.
- Only use the candidate facts provided in this conversation. If positions are marked ESTIMATED, say so and encourage verifying with the candidate's official sources.
- Keep answers concise and plain-spoken (2-4 short paragraphs max).
- If asked something not covered by the provided info, say you don't have that on record and suggest where to look.`;

async function callClaude(
  systemContext: string,
  messages: AnthropicMessage[],
  maxTokens = 600,
): Promise<string> {
  // Proxy transport (recommended for production).
  if (config.aiProxyUrl) {
    const res = await fetch(config.aiProxyUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ system: systemContext, messages, model: config.anthropicModel, maxTokens }),
    });
    if (!res.ok) throw new Error(`AI proxy ${res.status}`);
    const data = await res.json();
    return data.text ?? data.content ?? '';
  }

  // Direct transport (dev only — key is in the bundle).
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: maxTokens,
      // Cache the (stable) system context so follow-up turns are cheaper.
      system: [{ type: 'text', text: systemContext, cache_control: { type: 'ephemeral' } }],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const block = Array.isArray(data.content) ? data.content.find((b: any) => b.type === 'text') : null;
  return block?.text ?? '';
}

export async function generateSummary(candidate: Candidate, contest?: Contest): Promise<string> {
  const system = `${SYSTEM_BASE}\n\n${candidateContext(candidate, contest)}`;
  if (!features.liveAi) return stubSummary(candidate);
  try {
    return await callClaude(
      system,
      [{ role: 'user', content: 'Give me a short, neutral 3-sentence overview of this candidate and what they emphasize.' }],
      300,
    );
  } catch (err) {
    console.warn('[ai] summary failed:', err);
    return stubSummary(candidate);
  }
}

export async function chat(
  candidate: Candidate,
  history: ChatMessage[],
  contest?: Contest,
): Promise<string> {
  const system = `${SYSTEM_BASE}\n\n${candidateContext(candidate, contest)}`;
  const messages: AnthropicMessage[] = history
    .filter((m) => !m.pending)
    .map((m) => ({ role: m.role, content: m.content }));
  if (!features.liveAi) return stubChat(candidate, messages.at(-1)?.content ?? '');
  try {
    return await callClaude(system, messages, 600);
  } catch (err) {
    console.warn('[ai] chat failed:', err);
    return stubChat(candidate, messages.at(-1)?.content ?? '');
  }
}

// ---- Offline stubs -------------------------------------------------------

function stubSummary(c: Candidate): string {
  const top = Object.entries(c.stances)
    .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))
    .slice(0, 2)
    .map(([k]) => IssueMeta[k as keyof typeof IssueMeta]?.label)
    .filter(Boolean)
    .join(' and ');
  return `${c.name} (${c.party ?? 'Independent'}) is running for ${c.office}. ${
    c.bio ?? `Based on the available profile, ${c.name} emphasizes ${top || 'a range of issues'}.`
  } (Add an Anthropic API key to enable the live AI assistant.)`;
}

function stubChat(c: Candidate, q: string): string {
  return `I'm running in offline demo mode, so I can only share the profile on file for ${c.name} (${c.party ?? 'Independent'}), who is running for ${c.office}. You asked: "${q}". Add an Anthropic API key (or set EXPO_PUBLIC_AI_PROXY_URL) to chat with the live assistant.`;
}
