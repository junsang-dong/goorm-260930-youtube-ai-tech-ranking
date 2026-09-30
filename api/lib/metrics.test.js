import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addDays, kstDate } from './dates.js';
import { weeklyGrowthRate, selectWeeklyGrowthRanking, roundScore } from './metrics.js';

test('한국 시간 기준 7일 전 날짜를 계산한다', () => {
  assert.equal(addDays('2026-09-30', -7), '2026-09-23');
  assert.match(kstDate(), /^\d{4}-\d{2}-\d{2}$/);
});

test('주간 성장률은 조회수 감소를 0으로 처리한다', () => {
  assert.equal(weeklyGrowthRate(200000, 210000), 0);
  assert.equal(roundScore(weeklyGrowthRate(1415400, 1050000)), 34.8);
});

test('기준 조회수가 없으면 성장률을 계산하지 않는다', () => {
  assert.equal(weeklyGrowthRate(45000, null), null);
  assert.equal(weeklyGrowthRate(45000, 0), null);
});

test('구독자 1만 미만과 스냅샷이 부족한 채널은 랭킹에서 빠진다', () => {
  const ranked = selectWeeklyGrowthRanking([
    {
      channelId: 'UC_BIG',
      subscriberCount: 20000,
      todayViewCount: 1100,
      baseViewCount: 1000,
    },
    {
      channelId: 'UC_SMALL',
      subscriberCount: 4200,
      todayViewCount: 18000,
      baseViewCount: 10000,
    },
    {
      channelId: 'UC_NEW',
      subscriberCount: 22000,
      todayViewCount: 45000,
      baseViewCount: null,
    },
  ]);

  assert.deepEqual(ranked.map((row) => row.channelId), ['UC_BIG']);
  assert.equal(ranked[0].rank, 1);
  assert.equal(roundScore(ranked[0].score), 10);
});

test('동점이면 채널 ID 오름차순으로 순위를 매긴다', () => {
  const ranked = selectWeeklyGrowthRanking([
    { channelId: 'UC_B', subscriberCount: 10000, todayViewCount: 200, baseViewCount: 100 },
    { channelId: 'UC_A', subscriberCount: 10000, todayViewCount: 200, baseViewCount: 100 },
  ]);
  assert.deepEqual(
    ranked.map((row) => row.channelId),
    ['UC_A', 'UC_B'],
  );
});

test('샘플 랭킹 점수는 스냅샷 산식과 같다', async () => {
  const sample = JSON.parse(await readFile(new URL('../../src/data/sampleRankings.json', import.meta.url), 'utf8'));
  const ranked = selectWeeklyGrowthRanking(
    sample.items.map((item) => ({
      channelId: item.channelId,
      subscriberCount: item.subscriberCount,
      todayViewCount: item.viewCount,
      baseViewCount: item.baseViewCount,
    })),
  );

  assert.equal(ranked.length, sample.items.length);
  ranked.forEach((row, index) => {
    const item = sample.items[index];
    assert.equal(row.channelId, item.channelId);
    assert.equal(row.rank, item.rank);
    assert.equal(roundScore(row.score), item.score);
  });
});

test('YouTube 클라이언트는 search 엔드포인트를 호출하지 않는다', async () => {
  const source = await readFile(new URL('./youtube.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\/search/);
  assert.match(source, /channels/);
  assert.match(source, /playlistItems/);
  assert.match(source, /videos/);
});
