import {
  formatCount,
  formatPublished,
  formatScore,
  formatSubscribers,
  rankMove,
  viewGain,
  youtubeUrl,
} from '../lib/format.js';

const PODIUM = {
  1: { bar: 'bg-[#F59E0B]', badge: 'bg-[#FEF3C7] text-[#B45309]' },
  2: { bar: 'bg-[#94A3B8]', badge: 'bg-[#F1F5F9] text-[#475569]' },
  3: { bar: 'bg-[#F97316]', badge: 'bg-[#FFEDD5] text-[#9A3412]' },
};

const TINT = {
  llm: 'bg-sky-100 text-primary',
  vibe: 'bg-indigo-100 text-primary',
  ml: 'bg-cyan-100 text-primary',
  cloud: 'bg-slate-200 text-primary',
  career: 'bg-amber-50 text-amber-900',
};

function Move({ rank, prevRank }) {
  const move = rankMove(rank, prevRank);
  if (move.type === 'up') {
    return <span className="font-mono text-[11px] font-bold tabular-nums text-highlight">▲ {move.diff}</span>;
  }
  if (move.type === 'down') {
    return <span className="font-mono text-[11px] font-bold tabular-nums text-fall">▼ {move.diff}</span>;
  }
  if (move.type === 'new') {
    return <span className="font-mono text-[11px] font-bold text-highlight">NEW</span>;
  }
  return <span className="font-mono text-[11px] text-faint">—</span>;
}

export default function RankingCard({ item }) {
  const podium = PODIUM[item.rank];
  const gain = viewGain(item.viewCount, item.baseViewCount);
  const views = formatCount(item.viewCount);
  const link = youtubeUrl(item.handle);
  const initial = item.title?.replace(/^샘플\s*/, '').trim()?.[0] ?? '?';

  return (
    <article className="relative overflow-hidden rounded-xl border border-line bg-white p-3.5 shadow-card">
      <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${podium?.bar ?? 'bg-line'}`} />
      <div className="flex items-center gap-3">
        <div className="flex w-8 shrink-0 flex-col items-center">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-sm font-bold tabular-nums ${
              podium?.badge ?? 'bg-transparent text-slate-500'
            }`}
          >
            {item.rank}
          </div>
          <div className="mt-1">
            {item.live ? (
              <span className="font-mono text-[11px] font-bold text-highlight">LIVE</span>
            ) : (
              <Move rank={item.rank} prevRank={item.prevRank} />
            )}
          </div>
        </div>

        <div className={`relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-lg ${TINT[item.subCategoryCode] ?? 'bg-surface-container text-primary'}`}>
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-headline text-lg font-bold">
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-body text-[15px] font-semibold leading-5 text-ink">{item.title}</h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            {item.handle ? (
              <span className="truncate font-mono text-[11px] text-muted">{item.handle}</span>
            ) : null}
            <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              {item.subCategory}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-[22px] font-bold leading-none tabular-nums text-accent">
            {item.scoreKind === 'buzz' ? formatCount(item.score) : formatScore(item.score)}
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">
            {item.scoreKind === 'buzz' ? '7일 화제성' : '주간 성장률'}
          </p>
        </div>
      </div>

      {item.videos?.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {item.videos.map((video) => (
            <li key={video.id}>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-canvas px-2 py-1.5 hover:bg-surface-low"
              >
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt="" className="h-12 w-[77px] shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-12 w-[77px] shrink-0 rounded bg-surface-container" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">{video.title}</span>
                  <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-muted">
                    {formatPublished(video.publishedAt)}
                    {video.viewCount != null ? ` · ${formatCount(video.viewCount)}회` : ''}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-surface-low px-2.5 py-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tabular-nums text-muted">
          <span>구독자</span>
          <span className="font-semibold text-ink">{formatSubscribers(item.subscriberCount)}</span>
          {views ? (
            <>
              <span className="text-faint">총 조회수</span>
              <span className="font-semibold text-ink">{views}</span>
            </>
          ) : null}
          {gain != null ? (
            <span className="font-semibold text-accent">+{formatCount(gain)}</span>
          ) : null}
        </div>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.title} YouTube 채널 열기`}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-accent hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 5h5v5" />
              <path d="M19 5 10 14" />
              <path d="M19 13v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
            </svg>
          </a>
        ) : null}
      </div>
    </article>
  );
}
