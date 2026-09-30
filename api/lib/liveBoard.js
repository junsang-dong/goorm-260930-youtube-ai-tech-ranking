import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categoryLabel, normalizeCategory } from '../../shared/categories.js';
import { kstDate } from './dates.js';
import { buzzScore, qualifyChannel } from './qualify.js';
import {
  channelRecord,
  listChannelByHandle,
  listPlaylistVideoIds,
  listVideosByIds,
  mapPool,
  videoRecord,
} from './youtube.js';

const CACHE_MS = 3 * 60 * 1000;
const seedPath = join(dirname(fileURLToPath(import.meta.url)), '../../seed/channels.json');

let cached = null;
let pending = null;

function readSeeds() {
  const parsed = JSON.parse(readFileSync(seedPath, 'utf8'));
  if (!Array.isArray(parsed)) {
    const error = new Error('seed/channels.json must be an array');
    error.statusCode = 500;
    throw error;
  }
  return parsed;
}

async function collectBoard(apiKey) {
  const seeds = readSeeds()
    .map((seed) => ({
      handle: seed.handle,
      subCategoryCode: normalizeCategory(seed.subCategory),
    }))
    .filter((seed) => seed.handle && seed.subCategoryCode && seed.subCategoryCode !== 'all');

  const channels = (await mapPool(seeds, 5, async (seed) => {
    const item = await listChannelByHandle(seed.handle, apiKey);
    if (!item) return null;
    return { ...channelRecord(item), subCategoryCode: seed.subCategoryCode };
  })).filter(Boolean);

  const playlists = await mapPool(
    channels.filter((channel) => channel.uploadsPlaylistId),
    5,
    async (channel) => {
      const items = await listPlaylistVideoIds(channel.uploadsPlaylistId, apiKey);
      return items
        .map((item) => item.contentDetails?.videoId)
        .filter(Boolean)
        .map((videoId) => ({ videoId, channelId: channel.id }));
    },
  );
  const playlistVideos = playlists.flat();
  const channelByVideo = new Map(playlistVideos.map((item) => [item.videoId, item.channelId]));
  const videoItems = await listVideosByIds(playlistVideos.map((item) => item.videoId), apiKey);
  const videosByChannel = new Map();

  for (const item of videoItems) {
    const channelId = channelByVideo.get(item.id);
    if (!channelId) continue;
    const video = videoRecord(item, channelId);
    const list = videosByChannel.get(channelId) ?? [];
    list.push(video);
    videosByChannel.set(channelId, list);
  }

  const now = Date.now();
  const qualified = channels.flatMap((channel) => {
    const videos = (videosByChannel.get(channel.id) ?? [])
      .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));
    const check = qualifyChannel({ subscriberCount: channel.subscriberCount, videos, now });
    if (!check.qualified) return [];
    return [{
      channelId: channel.id,
      handle: channel.handle,
      title: channel.title,
      thumbnailUrl: channel.thumbnailUrl,
      subCategory: categoryLabel(channel.subCategoryCode),
      subCategoryCode: channel.subCategoryCode,
      subscriberCount: channel.subscriberCount,
      viewCount: channel.viewCount,
      score: buzzScore(videos, now),
      scoreKind: 'buzz',
      live: true,
      prevRank: null,
      recentUploadCount: check.recentUploadCount,
      videos: videos.slice(0, 3).map((video) => ({
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
      })),
    }];
  });

  qualified.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return String(left.channelId).localeCompare(String(right.channelId));
  });

  return qualified.map((item, index) => ({ ...item, rank: index + 1 }));
}

function fingerprint(apiKey) {
  return createHash('sha256').update(String(apiKey)).digest('hex');
}

async function loadQualified(apiKey) {
  const finger = fingerprint(apiKey);
  if (cached && cached.finger === finger && Date.now() - cached.at < CACHE_MS) {
    return cached.items;
  }
  if (pending && pending.finger === finger) return pending.promise;

  const promise = collectBoard(apiKey)
    .then((items) => {
      cached = { finger, at: Date.now(), items };
      return items;
    })
    .finally(() => {
      if (pending?.promise === promise) pending = null;
    });
  pending = { finger, promise };
  return promise;
}

export async function getLiveBoard({ apiKey, sub = 'all' }) {
  const category = normalizeCategory(sub);
  if (!category) {
    const error = new Error('Unknown sub category');
    error.statusCode = 400;
    throw error;
  }
  if (!apiKey || !String(apiKey).trim()) {
    const error = new Error('YOUTUBE_API_KEY is not set');
    error.statusCode = 503;
    throw error;
  }

  const items = await loadQualified(String(apiKey).trim());
  const filtered = category === 'all'
    ? items
    : items.filter((item) => item.subCategoryCode === category);

  return {
    source: 'youtube',
    rankingDate: kstDate(),
    period: 'weekly',
    metric: 'buzz',
    sub: category,
    note: '구독자 1,000명 이상, 최근 90일 업로드 3개 이상인 채널입니다. 점수는 최근 7일 영상의 조회수 + 좋아요×10입니다.',
    items: filtered,
  };
}
