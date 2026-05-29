/**
 * Runtime configuration, read from EXPO_PUBLIC_* env vars (see .env.example).
 *
 * NOTE on secrets: anything prefixed EXPO_PUBLIC_ is inlined into the client
 * bundle and is therefore NOT secret. That's fine for the Google Civic and
 * YouTube keys (restrict them by app/referrer in the Google Cloud console).
 *
 * For the Anthropic key this is acceptable for local development ONLY. For a
 * real release you should set EXPO_PUBLIC_AI_PROXY_URL to a small backend that
 * holds the key server-side; ai.ts will prefer the proxy when it is set.
 */

const env = process.env;

export const config = {
  googleCivicApiKey: env.EXPO_PUBLIC_GOOGLE_CIVIC_API_KEY ?? '',
  youtubeApiKey: env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '',

  anthropicApiKey: env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  /** If set, AI calls go here instead of directly to Anthropic. */
  aiProxyUrl: env.EXPO_PUBLIC_AI_PROXY_URL ?? '',
  anthropicModel: env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
};

export const features = {
  /** Use live Google Civic data when a key is present, else mock data. */
  get liveCivic() {
    return config.googleCivicApiKey.length > 0;
  },
  get liveYoutube() {
    return config.youtubeApiKey.length > 0;
  },
  get liveAi() {
    return config.anthropicApiKey.length > 0 || config.aiProxyUrl.length > 0;
  },
};
