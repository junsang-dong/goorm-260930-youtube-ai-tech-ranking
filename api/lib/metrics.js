export const SUBSCRIBER_MIN = 10_000;
export const RANKING_LIMIT = 50;

export function weeklyGrowthRate(todayViews, baseViews) {
  if (todayViews == null || baseViews == null) return null;
  const today = Number(todayViews);
  const base = Number(baseViews);
  if (!Number.isFinite(today) || !Number.isFinite(base) || base <= 0) return null;
  const gain = Math.max(0, today - base);
  return (gain / base) * 100;
}

export function roundScore(score) {
  return Math.round(Number(score) * 10) / 10;
}

export function selectWeeklyGrowthRanking(rows, { limit = RANKING_LIMIT } = {}) {
  const eligible = [];
  for (const row of rows) {
    const subscribers = row.subscriberCount == null ? null : Number(row.subscriberCount);
    if (subscribers == null || !Number.isFinite(subscribers) || subscribers < SUBSCRIBER_MIN) continue;
    const score = weeklyGrowthRate(row.todayViewCount, row.baseViewCount);
    if (score == null) continue;
    eligible.push({ ...row, score });
  }

  eligible.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return String(left.channelId).localeCompare(String(right.channelId));
  });

  return eligible.slice(0, limit).map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}
