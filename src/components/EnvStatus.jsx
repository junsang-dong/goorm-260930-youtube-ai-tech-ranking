import { useEffect, useState } from 'react';

const TONE = {
  ok: 'bg-emerald-50 text-emerald-800',
  set: 'bg-sky-50 text-sky-900',
  missing: 'bg-amber-50 text-amber-900',
  warning: 'bg-amber-50 text-amber-900',
  invalid: 'bg-rose-50 text-rose-800',
};

const MARK = {
  ok: '유효',
  set: '입력됨',
  missing: '비어 있음',
  warning: '확인 필요',
  invalid: '유효하지 않음',
};

export default function EnvStatus() {
  const [status, setStatus] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health')
      .then(async (response) => {
        const type = response.headers.get('content-type') || '';
        if (!response.ok || !type.includes('application/json')) throw new Error('unavailable');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-xl border border-line bg-white p-3.5 shadow-card" aria-label="환경변수 상태">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-headline text-base font-bold text-primary">실행 환경</h2>
        <p className="font-mono text-[11px] text-faint">키 값은 표시하지 않음</p>
      </div>
      {failed ? (
        <p className="mt-2 text-[13px] text-fall">환경 상태를 확인하지 못했습니다.</p>
      ) : status == null ? (
        <p className="mt-2 text-[13px] text-muted">환경변수를 확인하는 중입니다.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {status.items?.map((item) => (
            <li key={item.id} className="rounded-lg bg-canvas px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-ink">{item.label}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${TONE[item.state] ?? TONE.warning}`}>
                  {MARK[item.state] ?? '확인 필요'}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
