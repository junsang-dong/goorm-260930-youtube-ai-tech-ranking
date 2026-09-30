import test from 'node:test';
import assert from 'node:assert/strict';
import { buzzScore, qualifyChannel, videoBuzz } from './qualify.js';

const now = Date.parse('2026-09-30T00:00:00Z');

function video(daysAgo, viewCount, likeCount) {
  return {
    publishedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    viewCount,
    likeCount,
  };
}

test('구독자 1,000명 미만이거나 90일 업로드가 3개 미만이면 제외한다', () => {
  const videos = [video(1, 10, 1), video(10, 10, 1), video(20, 10, 1)];
  assert.equal(qualifyChannel({ subscriberCount: 999, videos, now }).qualified, false);
  assert.equal(qualifyChannel({ subscriberCount: 1000, videos: videos.slice(0, 2), now }).qualified, false);
  assert.equal(qualifyChannel({ subscriberCount: null, videos, now }).qualified, false);
  assert.equal(qualifyChannel({ subscriberCount: 1000, videos, now }).qualified, true);
});

test('7일 화제성은 조회수와 좋아요 10배를 더하고 비공개 좋아요는 빠진다', () => {
  assert.equal(videoBuzz({ viewCount: 100, likeCount: 2 }), 120);
  assert.equal(videoBuzz({ viewCount: 100, likeCount: null }), 100);
  assert.equal(buzzScore([video(1, 100, 2), video(8, 999, 9)], now), 120);
});
