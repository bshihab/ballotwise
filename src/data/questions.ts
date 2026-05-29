import type { IssueKey, Question } from '@/types';

/**
 * Metadata for each policy axis. `negPole`/`posPole` describe what -2 and +2
 * mean on the issue's stance scale; the questionnaire and the candidate data
 * both use this same scale, which is what makes matching meaningful.
 */
export const IssueMeta: Record<IssueKey, { label: string; negPole: string; posPole: string }> = {
  economy: { label: 'Economy & Taxes', negPole: 'Free-market, lower taxes', posPole: 'More regulation, higher taxes on wealth' },
  healthcare: { label: 'Healthcare', negPole: 'Private / market-based', posPole: 'Government-guaranteed coverage' },
  immigration: { label: 'Immigration', negPole: 'Tighter restrictions', posPole: 'More open / pathway to citizenship' },
  environment: { label: 'Climate & Environment', negPole: 'Limited intervention', posPole: 'Aggressive climate action' },
  guns: { label: 'Guns', negPole: 'Fewer restrictions', posPole: 'Stricter gun control' },
  education: { label: 'Education', negPole: 'School choice / local control', posPole: 'More public funding' },
  criminal_justice: { label: 'Criminal Justice', negPole: 'Tough-on-crime', posPole: 'Reform / rehabilitation' },
  social: { label: 'Social Issues', negPole: 'Traditional / conservative', posPole: 'Progressive' },
  foreign_policy: { label: 'Foreign Policy', negPole: 'Restraint / fewer commitments', posPole: 'Active global engagement' },
  housing: { label: 'Housing', negPole: 'Market-driven supply', posPole: 'Public investment & tenant protections' },
};

export const ISSUE_ORDER: IssueKey[] = [
  'economy',
  'healthcare',
  'immigration',
  'environment',
  'guns',
  'education',
  'criminal_justice',
  'social',
  'foreign_policy',
  'housing',
];

/**
 * Questionnaire. Agreement with a prompt moves the user toward the issue's
 * +pole when `direction` is 1, and toward the -pole when it is -1.
 */
export const QUESTIONS: Question[] = [
  // Economy
  { id: 'eco1', issue: 'economy', direction: 1, prompt: 'The wealthy and large corporations should pay higher taxes to fund public programs.' },
  { id: 'eco2', issue: 'economy', direction: -1, prompt: 'Cutting business regulations is the best way to grow the economy and create jobs.' },

  // Healthcare
  { id: 'hc1', issue: 'healthcare', direction: 1, prompt: 'The government should guarantee health coverage for everyone.' },
  { id: 'hc2', issue: 'healthcare', direction: -1, prompt: 'Healthcare works best when it is driven by private competition and choice.' },

  // Immigration
  { id: 'im1', issue: 'immigration', direction: 1, prompt: 'Undocumented immigrants already here should have a pathway to citizenship.' },
  { id: 'im2', issue: 'immigration', direction: -1, prompt: 'Border security should be tightened and immigration levels reduced.' },

  // Environment
  { id: 'en1', issue: 'environment', direction: 1, prompt: 'The government should aggressively invest in clean energy to fight climate change, even at economic cost.' },
  { id: 'en2', issue: 'environment', direction: -1, prompt: 'Environmental rules should not get in the way of energy production and jobs.' },

  // Guns
  { id: 'gn1', issue: 'guns', direction: 1, prompt: 'We need stricter gun laws, including expanded background checks.' },
  { id: 'gn2', issue: 'guns', direction: -1, prompt: 'Law-abiding citizens should face fewer restrictions on owning firearms.' },

  // Education
  { id: 'ed1', issue: 'education', direction: 1, prompt: 'Public schools should receive significantly more funding.' },
  { id: 'ed2', issue: 'education', direction: -1, prompt: 'Parents should be able to use public funds for private or charter schools.' },

  // Criminal justice
  { id: 'cj1', issue: 'criminal_justice', direction: 1, prompt: 'The justice system should focus more on rehabilitation than on punishment.' },
  { id: 'cj2', issue: 'criminal_justice', direction: -1, prompt: 'Tougher sentencing and more policing are needed to keep communities safe.' },

  // Social
  { id: 'so1', issue: 'social', direction: 1, prompt: 'Government should actively protect the rights of LGBTQ+ people and reproductive choice.' },
  { id: 'so2', issue: 'social', direction: -1, prompt: 'Public policy should reflect traditional family and religious values.' },

  // Foreign policy
  { id: 'fp1', issue: 'foreign_policy', direction: 1, prompt: 'The US should stay actively engaged abroad, including supporting allies militarily.' },
  { id: 'fp2', issue: 'foreign_policy', direction: -1, prompt: 'The US should pull back from foreign conflicts and focus on problems at home.' },

  // Housing
  { id: 'ho1', issue: 'housing', direction: 1, prompt: 'Government should fund affordable housing and strengthen tenant protections.' },
  { id: 'ho2', issue: 'housing', direction: -1, prompt: 'The best fix for housing costs is removing rules so the market can build more.' },
];
