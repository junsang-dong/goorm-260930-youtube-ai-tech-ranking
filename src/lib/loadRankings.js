import sample from '../data/sampleRankings.json';

export function filterSample(sub) {
  const items = sub === 'all'
    ? sample.items
    : sample.items.filter((item) => item.subCategoryCode === sub);

  return {
    rankingDate: sample.rankingDate,
    period: sample.period,
    metric: sample.metric,
    sub,
    items,
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  const type = response.headers.get('content-type') || '';
  if (!response.ok || !type.includes('application/json')) return null;
  return response.json();
}

export async function loadRankings(sub) {
  try {
    const board = await fetchJson(`/api/board?sub=${encodeURIComponent(sub)}`);
    if (board?.source === 'youtube' && Array.isArray(board.items)) return board;

    const stored = await fetchJson(
      `/api/rankings?period=weekly&metric=growth_rate&sub=${encodeURIComponent(sub)}`,
    );
    if (stored && Array.isArray(stored.items) && stored.items.length > 0) {
      return { ...stored, source: 'live' };
    }
  } catch {
    // 샘플 랭킹으로 넘어간다.
  }
  return { ...filterSample(sub), source: 'sample' };
}
