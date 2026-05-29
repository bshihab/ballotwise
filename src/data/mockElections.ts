import type { Candidate, Contest, Election } from '@/types';

/**
 * Bundled sample data so the entire flow works with zero API keys.
 * Candidates are fictional on purpose — this keeps the demo free of real-person
 * claims. When a Google Civic key is configured, live data replaces all of this.
 */

export const MOCK_ELECTIONS: Election[] = [
  { id: 'mock-state-2026', name: '2026 Statewide General Election', electionDay: '2026-11-03', level: 'state' },
  { id: 'mock-city-2026', name: 'Springfield Municipal Election', electionDay: '2026-06-09', level: 'local' },
];

function c(
  partial: Omit<Candidate, 'contestId' | 'office'> & { stances: Candidate['stances'] },
  contestId: string,
  office: string,
): Candidate {
  return { ...partial, contestId, office };
}

const senate: Contest = {
  id: 'mock-senate',
  office: 'U.S. Senate',
  level: 'federal',
  district: 'Statewide',
  numberElected: 1,
  candidates: [],
};
senate.candidates = [
  c(
    {
      id: 'sen-rivera',
      name: 'Dana Rivera',
      party: 'Democratic',
      website: 'https://example.com/rivera',
      bio: 'State legislator and former public-school teacher running on healthcare access and climate investment.',
      stances: { economy: 1, healthcare: 2, immigration: 2, environment: 2, guns: 2, education: 2, criminal_justice: 1, social: 2, foreign_policy: 1, housing: 2 },
    },
    senate.id,
    senate.office,
  ),
  c(
    {
      id: 'sen-clarke',
      name: 'Tom Clarke',
      party: 'Republican',
      website: 'https://example.com/clarke',
      bio: 'Small-business owner focused on tax cuts, border security, and energy independence.',
      stances: { economy: -2, healthcare: -2, immigration: -2, environment: -1, guns: -2, education: -1, criminal_justice: -2, social: -2, foreign_policy: 1, housing: -1 },
    },
    senate.id,
    senate.office,
  ),
  c(
    {
      id: 'sen-okafor',
      name: 'Ada Okafor',
      party: 'Independent',
      website: 'https://example.com/okafor',
      bio: 'Independent economist campaigning on fiscal restraint paired with criminal-justice reform.',
      stances: { economy: -1, healthcare: 0, immigration: 1, environment: 1, guns: 0, education: 1, criminal_justice: 2, social: 1, foreign_policy: -1, housing: 1 },
    },
    senate.id,
    senate.office,
  ),
];

const governor: Contest = {
  id: 'mock-governor',
  office: 'Governor',
  level: 'state',
  district: 'Statewide',
  numberElected: 1,
  candidates: [],
};
governor.candidates = [
  c(
    {
      id: 'gov-bennett',
      name: 'Marcus Bennett',
      party: 'Republican',
      bio: 'Two-term mayor emphasizing public safety and lower state taxes.',
      stances: { economy: -2, healthcare: -1, immigration: -1, environment: -1, guns: -1, education: -1, criminal_justice: -2, social: -1, foreign_policy: 0, housing: 0 },
    },
    governor.id,
    governor.office,
  ),
  c(
    {
      id: 'gov-lindqvist',
      name: 'Sara Lindqvist',
      party: 'Democratic',
      bio: 'Former attorney general focused on housing affordability and clean energy jobs.',
      stances: { economy: 1, healthcare: 1, immigration: 1, environment: 2, guns: 1, education: 2, criminal_justice: 1, social: 2, foreign_policy: 0, housing: 2 },
    },
    governor.id,
    governor.office,
  ),
  c(
    {
      id: 'gov-patel',
      name: 'Raj Patel',
      party: 'Libertarian',
      bio: 'Engineer running on deregulation, school choice, and limited government.',
      stances: { economy: -2, healthcare: -2, immigration: 1, environment: 0, guns: -2, education: -2, criminal_justice: 1, social: 1, foreign_policy: -2, housing: -1 },
    },
    governor.id,
    governor.office,
  ),
];

const mayor: Contest = {
  id: 'mock-mayor',
  office: 'Mayor of Springfield',
  level: 'local',
  district: 'City of Springfield',
  numberElected: 1,
  candidates: [],
};
mayor.candidates = [
  c(
    {
      id: 'may-nguyen',
      name: 'Linh Nguyen',
      party: 'Nonpartisan',
      bio: 'City council member championing transit, affordable housing, and small business.',
      stances: { economy: 1, healthcare: 1, environment: 2, education: 2, criminal_justice: 1, social: 2, housing: 2 },
    },
    mayor.id,
    mayor.office,
  ),
  c(
    {
      id: 'may-foster',
      name: 'Greg Foster',
      party: 'Nonpartisan',
      bio: 'Local business leader prioritizing public safety, roads, and balanced budgets.',
      stances: { economy: -1, healthcare: 0, environment: 0, education: -1, criminal_justice: -2, social: -1, housing: 0 },
    },
    mayor.id,
    mayor.office,
  ),
];

const schoolBoard: Contest = {
  id: 'mock-school-board',
  office: 'School Board, District 4',
  level: 'local',
  district: 'Springfield USD',
  numberElected: 1,
  candidates: [],
};
schoolBoard.candidates = [
  c(
    { id: 'sb-ramos', name: 'Elena Ramos', party: 'Nonpartisan', bio: 'Parent and PTA leader focused on increasing classroom funding.', stances: { education: 2, social: 1, economy: 1 } },
    schoolBoard.id,
    schoolBoard.office,
  ),
  c(
    { id: 'sb-walsh', name: 'Brian Walsh', party: 'Nonpartisan', bio: 'Retired principal advocating for school choice and curriculum transparency.', stances: { education: -2, social: -1, economy: -1 } },
    schoolBoard.id,
    schoolBoard.office,
  ),
];

const CONTESTS_BY_ELECTION: Record<string, Contest[]> = {
  'mock-state-2026': [senate, governor],
  'mock-city-2026': [mayor, schoolBoard],
};

export function mockContests(electionId: string): Contest[] {
  return CONTESTS_BY_ELECTION[electionId] ?? [senate, governor, mayor, schoolBoard];
}

const ALL_CANDIDATES: Candidate[] = [
  ...senate.candidates,
  ...governor.candidates,
  ...mayor.candidates,
  ...schoolBoard.candidates,
];

export function mockCandidateById(id: string): Candidate | undefined {
  return ALL_CANDIDATES.find((x) => x.id === id);
}
