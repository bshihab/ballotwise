import { ISSUE_ORDER, QUESTIONS } from '@/data/questions';
import type { Answers, Candidate, IssueKey, MatchResult, StanceMap } from '@/types';

const MAX_DISTANCE = 4; // |(-2) - (+2)|

/**
 * Collapse questionnaire answers into a per-issue stance profile in [-2, 2].
 * Each answer contributes `value * direction * weight`; results are averaged
 * per issue over the questions that were actually answered.
 */
export function buildProfile(answers: Answers): StanceMap {
  const sums: Partial<Record<IssueKey, { total: number; weight: number }>> = {};

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) continue;
    const w = q.weight ?? 1;
    const contribution = a * q.direction * w;
    const bucket = (sums[q.issue] ??= { total: 0, weight: 0 });
    bucket.total += contribution;
    bucket.weight += w;
  }

  const profile: StanceMap = {};
  for (const issue of ISSUE_ORDER) {
    const b = sums[issue];
    if (b && b.weight > 0) {
      // total is already in [-2*weight, 2*weight]; divide by weight -> [-2, 2]
      profile[issue] = clamp(b.total / b.weight, -2, 2);
    }
  }
  return profile;
}

/**
 * Score one candidate against the user's profile. Issues the user feels more
 * strongly about (larger |value|) are weighted more, with a baseline so weakly
 * held views still count a little.
 */
export function scoreCandidate(profile: StanceMap, candidate: Candidate): MatchResult {
  const byIssue: MatchResult['byIssue'] = [];
  let weightedSum = 0;
  let weightTotal = 0;

  for (const issue of ISSUE_ORDER) {
    const userValue = profile[issue];
    const candidateValue = candidate.stances[issue];
    if (userValue === undefined || candidateValue === undefined) continue;

    const distance = Math.abs(userValue - candidateValue);
    const issueScore = Math.round((1 - distance / MAX_DISTANCE) * 100);
    const importance = Math.max(0.25, Math.abs(userValue) / 2); // 0.25..1

    byIssue.push({ issue, score: issueScore, userValue, candidateValue });
    weightedSum += issueScore * importance;
    weightTotal += importance;
  }

  const score = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  // Surface the most divergent issues first for the breakdown view.
  byIssue.sort((a, b) => a.score - b.score);

  return { candidateId: candidate.id, score, byIssue };
}

export function rankCandidates(profile: StanceMap, candidates: Candidate[]): MatchResult[] {
  return candidates
    .map((cand) => scoreCandidate(profile, cand))
    .sort((a, b) => b.score - a.score);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
