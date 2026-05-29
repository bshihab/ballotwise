/**
 * Core domain types for Ballotwise.
 *
 * These are intentionally provider-agnostic: the Google Civic service maps the
 * Civic API shapes into these, and the mock provider produces the same shapes,
 * so the UI never has to know where the data came from.
 */

/** A normalized US street address used for ballot lookups. */
export interface Address {
  line1: string;
  city: string;
  state: string; // 2-letter code
  zip: string;
}

export function formatAddress(a: Address): string {
  return `${a.line1}, ${a.city}, ${a.state} ${a.zip}`.trim();
}

/** An election the voter is eligible to participate in. */
export interface Election {
  id: string; // Civic electionId or mock id
  name: string;
  electionDay: string; // ISO date (YYYY-MM-DD)
  ocdDivisionId?: string;
  /** Best-effort governing-level label for grouping/badges. */
  level?: 'federal' | 'state' | 'local' | 'unknown';
}

/** A single position/measure being voted on within an election. */
export interface Contest {
  id: string;
  office: string; // e.g. "U.S. Senate", "Mayor"
  level: 'federal' | 'state' | 'local' | 'unknown';
  district?: string; // human-readable district / scope
  /** Number of seats up for election (most are 1). */
  numberElected?: number;
  candidates: Candidate[];
}

/**
 * Policy axes the questionnaire scores users and candidates on.
 * Each is a -2..+2 scale where the meaning of the poles is defined per-issue
 * in `data/questions.ts`.
 */
export type IssueKey =
  | 'economy'
  | 'healthcare'
  | 'immigration'
  | 'environment'
  | 'guns'
  | 'education'
  | 'criminal_justice'
  | 'social'
  | 'foreign_policy'
  | 'housing';

export type StanceMap = Partial<Record<IssueKey, number>>; // each value in [-2, 2]

export interface Candidate {
  id: string;
  name: string;
  party?: string;
  contestId: string;
  office: string;
  photoUrl?: string;
  website?: string;
  /** Short factual bio when available from the data source. */
  bio?: string;
  /** Candidate stances on each issue axis (-2..+2). */
  stances: StanceMap;
  /** Source-provided channels (used to seed video search, etc). */
  channels?: { type: string; id: string }[];
}

/** A questionnaire item. */
export interface Question {
  id: string;
  issue: IssueKey;
  /** The proposition shown to the user. Agreement = +weight on this issue. */
  prompt: string;
  /**
   * Maps a "strongly agree" answer to a stance direction on the issue axis.
   * +1 means agreeing pushes the user toward the +2 pole; -1 toward -2.
   */
  direction: 1 | -1;
  /** Relative importance of this question within its issue (default 1). */
  weight?: number;
}

/** A user's answer on the 5-point Likert scale, stored as -2..+2. */
export type AnswerValue = -2 | -1 | 0 | 1 | 2;

export type Answers = Record<string, AnswerValue>; // questionId -> value

/** Result of matching a user's profile against a candidate. */
export interface MatchResult {
  candidateId: string;
  /** Overall alignment 0-100. */
  score: number;
  /** Per-issue alignment 0-100 for the issues both sides have data on. */
  byIssue: { issue: IssueKey; score: number; userValue: number; candidateValue: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** True while the assistant message is still streaming/loading. */
  pending?: boolean;
}

export interface VideoRecommendation {
  id: string; // youtube video id
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
}
