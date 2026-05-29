import type { Candidate, IssueKey, StanceMap } from '@/types';

/**
 * Rough party-based stance priors, on the same -2..+2 axes as the questionnaire.
 *
 * IMPORTANT: this is a heuristic, not the candidate's actual record. It exists
 * so live Google Civic candidates (who arrive with no policy data) still produce
 * a match. The UI labels any candidate scored this way as "estimated from party"
 * so users know to verify. Replace with a real positions API (Ballotpedia /
 * BallotReady / Vote Smart) for accuracy.
 */
const PARTY_PRIORS: Record<string, StanceMap> = {
  Democratic: { economy: 1, healthcare: 2, immigration: 1, environment: 2, guns: 1, education: 2, criminal_justice: 1, social: 2, foreign_policy: 0, housing: 1 },
  Republican: { economy: -2, healthcare: -1, immigration: -2, environment: -1, guns: -2, education: -1, criminal_justice: -2, social: -2, foreign_policy: 1, housing: -1 },
  Libertarian: { economy: -2, healthcare: -2, immigration: 1, environment: 0, guns: -2, education: -1, criminal_justice: 1, social: 1, foreign_policy: -2, housing: -1 },
  Green: { economy: 2, healthcare: 2, immigration: 2, environment: 2, guns: 1, education: 2, criminal_justice: 2, social: 2, foreign_policy: -1, housing: 2 },
};

export function estimatePartyStances(party?: string | null): StanceMap | null {
  if (!party) return null;
  const key = Object.keys(PARTY_PRIORS).find((k) => party.toLowerCase().includes(k.toLowerCase()));
  return key ? { ...PARTY_PRIORS[key] } : null;
}

/** True if the candidate's stances were filled in by estimation rather than real data. */
export function isEstimated(c: Candidate): boolean {
  return c.__estimated === true;
}

/**
 * Ensure a candidate has usable stances. Returns the same object if it already
 * has real stances; otherwise fills from party priors and flags it.
 */
export function withEstimatedStances(c: Candidate): Candidate {
  const hasReal = Object.keys(c.stances).length > 0;
  if (hasReal) return c;
  const est = estimatePartyStances(c.party);
  if (!est) return c;
  return { ...c, stances: est, __estimated: true };
}

// Augment Candidate with the runtime-only flag without polluting the core type.
declare module '@/types' {
  interface Candidate {
    __estimated?: boolean;
  }
}

export type { IssueKey };
