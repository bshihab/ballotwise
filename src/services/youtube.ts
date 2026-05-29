import { config, features } from '@/services/config';
import type { Candidate, VideoRecommendation } from '@/types';

/**
 * Candidate video recommendations via the YouTube Data API v3.
 * Without a key, returns a single "search on YouTube" fallback link.
 */

const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

function query(candidate: Candidate): string {
  return `${candidate.name} ${candidate.office} candidate`;
}

export function youtubeSearchUrl(candidate: Candidate): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query(candidate))}`;
}

export async function getVideos(candidate: Candidate): Promise<VideoRecommendation[]> {
  if (!features.liveYoutube) {
    return [
      {
        id: 'search',
        title: `Search YouTube for ${candidate.name}`,
        channelTitle: 'YouTube',
        thumbnailUrl: '',
        url: youtubeSearchUrl(candidate),
      },
    ];
  }

  try {
    const qs = new URLSearchParams({
      part: 'snippet',
      q: query(candidate),
      type: 'video',
      maxResults: '5',
      safeSearch: 'moderate',
      relevanceLanguage: 'en',
      key: config.youtubeApiKey,
    });
    const res = await fetch(`${SEARCH_URL}?${qs.toString()}`);
    if (!res.ok) throw new Error(`YouTube ${res.status}`);
    const data = await res.json();
    return (data.items ?? [])
      .filter((it: any) => it.id?.videoId)
      .map(
        (it: any): VideoRecommendation => ({
          id: it.id.videoId,
          title: it.snippet?.title ?? 'Video',
          channelTitle: it.snippet?.channelTitle ?? '',
          thumbnailUrl: it.snippet?.thumbnails?.medium?.url ?? it.snippet?.thumbnails?.default?.url ?? '',
          url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
        }),
      );
  } catch (err) {
    console.warn('[youtube] failed, returning search link:', err);
    return [
      { id: 'search', title: `Search YouTube for ${candidate.name}`, channelTitle: 'YouTube', thumbnailUrl: '', url: youtubeSearchUrl(candidate) },
    ];
  }
}
