import { mockCandidateById, mockContests, MOCK_ELECTIONS } from '@/data/mockElections';
import * as civic from '@/services/civic';
import { config, features } from '@/services/config';
import { withEstimatedStances } from '@/services/stanceEstimation';
import type { Address, Candidate, Contest, Election } from '@/types';

/**
 * Single entry point the UI uses for election data. Transparently switches
 * between live Google Civic data (when a key is set) and bundled mock data.
 */

export interface DataSourceInfo {
  live: boolean;
  label: string;
}

export function dataSource(): DataSourceInfo {
  return features.liveCivic
    ? { live: true, label: 'Live ballot data (Google Civic)' }
    : { live: false, label: 'Sample data — add a Google Civic key for your real ballot' };
}

export async function getElections(_address?: Address): Promise<Election[]> {
  if (!features.liveCivic) return MOCK_ELECTIONS;
  try {
    const elections = await civic.fetchElections();
    return elections.length ? elections : MOCK_ELECTIONS;
  } catch (err) {
    console.warn('[elections] live fetch failed, using mock:', err);
    return MOCK_ELECTIONS;
  }
}

/** Returns the ballot (contests + candidates) with stances guaranteed present. */
export async function getBallot(electionId: string, address?: Address): Promise<Contest[]> {
  let contests: Contest[];
  if (features.liveCivic && address) {
    try {
      contests = await civic.fetchBallot(address, electionId);
      if (!contests.length) contests = mockContests(electionId);
    } catch (err) {
      console.warn('[elections] live ballot failed, using mock:', err);
      contests = mockContests(electionId);
    }
  } else {
    contests = mockContests(electionId);
  }

  return contests.map((contest) => ({
    ...contest,
    candidates: contest.candidates.map(withEstimatedStances),
  }));
}

const candidateCache = new Map<string, Candidate>();

/** Cache candidates as ballots load so detail/chat screens can resolve by id. */
export function cacheCandidates(contests: Contest[]): void {
  for (const contest of contests) {
    for (const cand of contest.candidates) candidateCache.set(cand.id, cand);
  }
}

export function getCandidate(id: string): Candidate | undefined {
  return candidateCache.get(id) ?? withEstimatedStancesSafe(mockCandidateById(id));
}

function withEstimatedStancesSafe(c?: Candidate): Candidate | undefined {
  return c ? withEstimatedStances(c) : undefined;
}

export { config };
