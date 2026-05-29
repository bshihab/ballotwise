# Ballotwise

Find the candidates who match your values — on your **actual** ballot.

Ballotwise is a cross-platform (iOS + Android) React Native app built with Expo.
It walks a voter through:

1. **Location** — use GPS or type an address.
2. **Elections** — see the active elections for that address.
3. **Questionnaire** — a short alignment quiz across 10 policy areas.
4. **Ballot** — your real ballot, styled like a paper optical-scan ballot, with
   each candidate **ranked by how well they match your answers**.
5. **Candidate detail** — an AI-generated neutral summary, a per-issue alignment
   breakdown, and recommended YouTube videos.
6. **Chatbot** — ask follow-up questions about any candidate.

## Tech

- **Expo SDK 56** / React Native 0.85 / React 19 / TypeScript
- **Expo Router** (file-based navigation, `src/app/`)
- **Zustand** + AsyncStorage for persisted state
- **Google Civic Information API** for elections + ballots (`electionQuery`,
  `voterInfoQuery`)
- **Anthropic Claude** for candidate summaries + chatbot (with prompt caching)
- **YouTube Data API v3** for video recommendations

> The app runs fully on **bundled mock data with zero API keys**, so you can
> develop the entire flow offline. Add keys to switch each feature to live data.

## Getting started

```bash
npm install
cp .env.example .env   # optional — fill in keys to enable live data
npm run ios            # or: npm run android / npm run web
```

## Configuration

All config is read from `EXPO_PUBLIC_*` env vars (see `.env.example`):

| Variable | Enables | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_GOOGLE_CIVIC_API_KEY` | Live elections + ballot | Enable "Civic Information API" in Google Cloud |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | Video recommendations | YouTube Data API v3 |
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | AI summaries + chatbot | **Dev only** — see security note |
| `EXPO_PUBLIC_AI_PROXY_URL` | AI via your backend | Preferred for production |
| `EXPO_PUBLIC_ANTHROPIC_MODEL` | Override model | Defaults to `claude-sonnet-4-6` |

### Security note on the Anthropic key

Anything prefixed `EXPO_PUBLIC_` is inlined into the client bundle and is **not
secret**. That is fine for the Google/YouTube keys (restrict them by app in the
Google console). For Anthropic, put the key in `.env` for local development
**only**. For a real release, run a tiny backend that holds the key and set
`EXPO_PUBLIC_AI_PROXY_URL` to it — `src/services/ai.ts` prefers the proxy when
set. The proxy should accept `{ system, messages, model }` and return `{ text }`.

## Known limitations / roadmap

- Google's **Representatives API was retired (2025-04-30)**; Ballotwise uses the
  still-supported Elections + `voterInfoQuery` endpoints.
- Civic data does not include policy positions, so live candidates' stances are
  **estimated from party** (clearly labeled in the UI). Swap in a positions
  provider (Ballotpedia / BallotReady / Vote Smart) in
  `src/services/stanceEstimation.ts` for real records.
- Mock candidates are **fictional** by design.

## Project structure

```
src/
  app/            # Expo Router screens (location → elections → quiz → ballot → candidate → chat)
  components/     # BallotCard, MatchBadge, PartyTag, Button, Card, ...
  data/           # questions.ts (quiz), mockElections.ts (sample data)
  services/       # civic, elections (provider), matching, ai, youtube, stanceEstimation
  store/          # Zustand store (persisted)
  types/          # shared domain types
```
