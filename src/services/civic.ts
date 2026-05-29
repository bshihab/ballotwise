import { config } from '@/services/config';
import type { Address, Candidate, Contest, Election } from '@/types';
import { formatAddress } from '@/types';

/**
 * Google Civic Information API v2 client.
 *
 * Only the still-supported endpoints are used:
 *   - GET /elections          -> list active elections
 *   - GET /voterinfo          -> the voter's ballot (contests + candidates)
 * The Representatives endpoint was turned down on 2025-04-30 and is not used.
 *
 * Civic does NOT provide policy stances; those are estimated downstream from
 * party (see services/stanceEstimation.ts) so matching still works on live data.
 */

const BASE = 'https://www.googleapis.com/civicinfo/v2';

interface CivicElection {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

interface CivicCandidate {
  name: string;
  party?: string;
  candidateUrl?: string;
  photoUrl?: string;
  channels?: { type: string; id: string }[];
}

interface CivicContest {
  type?: string;
  office?: string;
  level?: string[];
  district?: { name?: string; scope?: string };
  numberElected?: string;
  candidates?: CivicCandidate[];
}

function mapLevel(level?: string[]): Contest['level'] {
  if (!level || level.length === 0) return 'unknown';
  const l = level[0];
  if (l === 'country') return 'federal';
  if (l === 'administrativeArea1' || l === 'administrativeArea2') return 'state';
  if (l === 'locality' || l === 'subLocality1' || l === 'special') return 'local';
  return 'unknown';
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: config.googleCivicApiKey });
  const res = await fetch(`${BASE}${path}?${qs.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Civic API ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function fetchElections(): Promise<Election[]> {
  const data = await get<{ elections?: CivicElection[] }>('/elections', {});
  return (data.elections ?? [])
    // electionId 2000 is Google's "test election" sentinel; drop it.
    .filter((e) => e.id !== '2000')
    .map((e) => ({
      id: e.id,
      name: e.name,
      electionDay: e.electionDay,
      ocdDivisionId: e.ocdDivisionId,
      level: 'unknown' as const,
    }));
}

export async function fetchBallot(address: Address, electionId: string): Promise<Contest[]> {
  const data = await get<{ contests?: CivicContest[] }>('/voterinfo', {
    address: formatAddress(address),
    electionId,
  });

  const contests = (data.contests ?? []).filter((c) => c.office && c.candidates?.length);

  return contests.map((c, idx): Contest => {
    const office = c.office ?? 'Contest';
    const contestId = `${electionId}:${idx}:${office}`.replace(/\s+/g, '-');
    const level = mapLevel(c.level);
    const candidates: Candidate[] = (c.candidates ?? []).map(
      (cand, cIdx): Candidate => ({
        id: `${contestId}:${cIdx}`,
        name: cand.name,
        party: cand.party,
        contestId,
        office,
        website: cand.candidateUrl,
        photoUrl: cand.photoUrl,
        channels: cand.channels,
        stances: {}, // filled by stance estimation
      }),
    );
    return {
      id: contestId,
      office,
      level,
      district: c.district?.name,
      numberElected: c.numberElected ? Number(c.numberElected) : 1,
      candidates,
    };
  });
}
