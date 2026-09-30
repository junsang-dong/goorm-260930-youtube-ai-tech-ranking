import { useEffect, useState } from 'react';
import { formatRankingDate } from '../lib/format.js';
import { loadRankings } from '../lib/loadRankings.js';
import CategoryFilter from './CategoryFilter.jsx';
import EnvStatus from './EnvStatus.jsx';
import RankingCard from './RankingCard.jsx';

export default function RankingBoard() {
  const [sub, setSub] = useState('all');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    loadRankings(sub).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [sub]);

  const items = data?.items ?? [];
  const sample = data?.source === 'sample';
  const youtube = data?.source === 'youtube';
  const heading = youtube ? '최근 영상 화제성' : '주간 성장률';

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-board items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-headline text-lg font-bold tracking-tight text-primary">K-TechRank</span>
          </div>
          <div className="flex items-center gap-2">
            {sample ? (
              <span className="rounded-full bg-amber-100 px-2 py-1 font-mono text-[11px] font-semibold text-amber-800">
                샘플 데이터
              </span>
            ) : null}
            {youtube ? (
              <span className="rounded-full bg-sky-100 px-2 py-1 font-mono text-[11px] font-semibold text-sky-900">
                YouTube 실시간
              </span>
            ) : null}
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {data ? formatRankingDate(data.rankingDate) : '불러오는 중'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-board flex-col gap-4 px-4 pb-8 pt-4">
        <div>
          <p className="font-headline text-xl font-bold text-primary">{heading}</p>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            {youtube
              ? 'YouTube에서 가져온 한국 AI·테크 교육 채널과 최근 영상입니다.'
              : '한국 AI·테크 교육 채널의 7일 조회수 성장률입니다.'}
          </p>
        </div>

        <EnvStatus />

        <CategoryFilter value={sub} onChange={setSub} />

        <div className="flex items-start gap-2 rounded-lg bg-surface-low p-3">
          <p className="text-[13px] leading-5 text-muted">
            {data?.note ? data.note : (
              <>
                <span className="font-semibold text-ink">구독자 1만+</span>
                {' '}
                채널만 포함합니다. 주간 성장률 = (오늘 총조회수 − 7일 전 총조회수) ÷ 7일 전 총조회수 × 100.
                조회수가 줄면 증가량은 0으로 계산합니다.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between font-mono text-[11px] text-faint">
          <span>TOP {items.length} · {heading}</span>
          {sample ? <span>가상 샘플 · 실제 채널 통계가 아닙니다</span> : null}
          {youtube ? <span>방금 YouTube에서 수집</span> : null}
          {!sample && !youtube && data ? <span>최신 스냅샷</span> : null}
        </div>

        {data == null ? (
          <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">채널과 영상을 불러오는 중입니다.</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-line bg-white px-4 py-8 text-center text-sm text-muted">이 분야의 랭킹이 없습니다.</p>
        ) : (
          <section className="flex flex-col gap-2" aria-label={heading}>
            {items.map((item) => (
              <RankingCard key={item.channelId} item={item} />
            ))}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-board px-4 pb-10 text-center text-[12px] leading-5 text-muted">
        데이터 출처: YouTube Data API. 채널과 영상 원본은 YouTube에서 제공합니다.
        {' '}
        <a
          className="text-accent underline"
          href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube API 서비스 약관
        </a>
      </footer>
    </div>
  );
}
