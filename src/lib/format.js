export function formatScore(score) {
  const number = Number(score);
  if (!Number.isFinite(number)) return '—';
  const sign = number > 0 ? '+' : '';
  return `${sign}${number.toFixed(1)}%`;
}

export function formatSubscribers(count) {
  if (count == null) return '비공개';
  const number = Number(count);
  if (!Number.isFinite(number)) return '비공개';
  if (number >= 10000) {
    const man = number / 10000;
    const text = Number.isInteger(man) ? String(man) : man.toFixed(1).replace(/\.0$/, '');
    return `${text}만`;
  }
  return number.toLocaleString('ko-KR');
}

export function formatCount(count) {
  if (count == null || !Number.isFinite(Number(count))) return null;
  return Number(count).toLocaleString('ko-KR');
}

export function viewGain(viewCount, baseViewCount) {
  if (viewCount == null || baseViewCount == null) return null;
  return Math.max(0, Number(viewCount) - Number(baseViewCount));
}

export function formatRankingDate(isoDate) {
  if (!isoDate) return '';
  return String(isoDate).slice(0, 10).replaceAll('-', '.');
}

export function formatPublished(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 10).replaceAll('-', '.');
}

export function youtubeUrl(handle) {
  if (!handle) return null;
  const name = String(handle).startsWith('@') ? handle : `@${handle}`;
  return `https://www.youtube.com/${name}`;
}

export function rankMove(rank, prevRank) {
  if (prevRank == null) return { type: 'new' };
  const diff = Number(prevRank) - Number(rank);
  if (diff > 0) return { type: 'up', diff };
  if (diff < 0) return { type: 'down', diff: Math.abs(diff) };
  return { type: 'same' };
}
