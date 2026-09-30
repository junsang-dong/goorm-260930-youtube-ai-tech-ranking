const API = 'https://www.googleapis.com/youtube/v3';
const BATCH_SIZE = 50;

export function chunk(items, size) {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function requireApiKey(apiKey = process.env.YOUTUBE_API_KEY) {
  if (!apiKey || !String(apiKey).trim()) {
    const error = new Error('YOUTUBE_API_KEY is not set');
    error.statusCode = 503;
    throw error;
  }
  return String(apiKey).trim();
}

async function getJson(path, params, apiKey) {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set('key', requireApiKey(apiKey));
  for (const [name, value] of Object.entries(params)) {
    if (value != null && value !== '') url.searchParams.set(name, value);
  }
  const response = await fetch(url);
  if (!response.ok) {
    const detail = (await response.text()).replace(/key=[^&\s"]+/gi, 'key=redacted');
    const error = new Error(`YouTube ${path} failed (${response.status}): ${detail.slice(0, 180)}`);
    error.statusCode = 502;
    throw error;
  }
  return response.json();
}

export function toCount(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.trunc(number);
}

export async function listChannelsByIds(ids, apiKey) {
  const items = [];
  for (const batch of chunk(ids, BATCH_SIZE)) {
    const data = await getJson('channels', {
      part: 'snippet,statistics,contentDetails',
      id: batch.join(','),
      maxResults: String(BATCH_SIZE),
    }, apiKey);
    items.push(...(data.items ?? []));
  }
  return items;
}

export async function listChannelByHandle(handle, apiKey) {
  const data = await getJson('channels', {
    part: 'snippet,statistics,contentDetails',
    forHandle: String(handle).replace(/^@/, ''),
  }, apiKey);
  return data.items?.[0] ?? null;
}

export async function listPlaylistVideoIds(playlistId, apiKey) {
  const data = await getJson('playlistItems', {
    part: 'contentDetails,snippet',
    playlistId,
    maxResults: '10',
  }, apiKey);
  return data.items ?? [];
}

export async function listVideosByIds(ids, apiKey) {
  const items = [];
  for (const batch of chunk(ids, BATCH_SIZE)) {
    const data = await getJson('videos', {
      part: 'snippet,statistics',
      id: batch.join(','),
      maxResults: String(BATCH_SIZE),
    }, apiKey);
    items.push(...(data.items ?? []));
  }
  return items;
}

export function channelRecord(item) {
  const stats = item.statistics ?? {};
  const hidden = stats.hiddenSubscriberCount === true;
  return {
    id: item.id,
    title: item.snippet?.title ?? item.id,
    handle: item.snippet?.customUrl ? `@${String(item.snippet.customUrl).replace(/^@/, '')}` : null,
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? null,
    subscriberCount: hidden ? null : toCount(stats.subscriberCount),
    viewCount: toCount(stats.viewCount) ?? 0,
    videoCount: toCount(stats.videoCount),
  };
}

export function videoRecord(item, channelId) {
  const stats = item.statistics ?? {};
  return {
    id: item.id,
    channelId,
    title: item.snippet?.title ?? null,
    publishedAt: item.snippet?.publishedAt ?? null,
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
    viewCount: toCount(stats.viewCount),
    likeCount: Object.prototype.hasOwnProperty.call(stats, 'likeCount') ? toCount(stats.likeCount) : null,
    commentCount: toCount(stats.commentCount),
  };
}
