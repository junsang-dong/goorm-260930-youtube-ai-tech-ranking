# 버티컬 랭킹 보드 기술 명세서

**한국 AI·테크 교육 채널 랭킹 (코드명: K-TechRank)**

- 버전: v1.0 (MVP)
- 작성일: 2026-09-30
- 작성: 동준상 · 넥스트플랫폼
- 용도: 바이브코딩 실무활용 강의 — YouTube Data API 기반 앱 기획 → 빌드 → Vercel 배포 실습

---

## 1. 제품 개요

### 1.1 한 줄 정의

한국 AI·테크 교육 YouTube 채널 50~200개를 수동 큐레이션하고, 매일 수집한 통계로 **일간·주간 성장률 랭킹**을 제공하는 버티컬 랭킹 웹앱이다.

### 1.2 벤치마크와 차별화

| 항목 | PlayBoard | K-TechRank |
|------|-----------|------------|
| 범위 | 전 세계 · 전 카테고리 | 한국 · AI/테크 교육 단일 버티컬 |
| 채널 발굴 | 대규모 자동 수집 | 수동 시드 큐레이션 (50~200개) |
| 핵심 지표 | 조회수 + 좋아요×10 인기 점수 | 조회수 증가량 · 주간 성장률 · 신규 영상 화제성 |
| 수익 모델 | 구독 SaaS + 광고 | 무료 랭킹(SEO) + 유료 뉴스레터 + 스폰서 배너 |
| 운영 비용 | 대규모 인프라 | Vercel Hobby + Neon Free 기준 월 $0 시작 |

### 1.3 설계 원칙

1. **search.list를 사용하지 않는다** — 채널 ID를 시드로 보유하므로 검색 비용(100 units/회)이 필요 없다.
2. **ID 기반 배치 조회** — `channels.list`, `videos.list`는 ID 50개를 1회 호출(1 unit)로 묶는다.
3. **방법론 공개** — PlayBoard처럼 랭킹 산식을 About 페이지에 공개해 신뢰를 확보한다.
4. **버티컬 교체 가능 구조** — 카테고리 설정과 시드 파일만 바꾸면 재테크, K-뷰티 등 다른 버티컬로 복제할 수 있게 만든다.

---

## 2. 사용자와 핵심 시나리오

| 사용자 | 목적 | 핵심 화면 |
|--------|------|-----------|
| AI 학습자 · 일반 시청자 | 요즘 뜨는 AI 교육 채널 찾기 | 랭킹 보드 |
| 크리에이터 | 경쟁 채널 대비 내 위치 확인 | 채널 상세 |
| 교육 기업 · 마케터 | 협업·광고 후보 채널 탐색 | 주간 랭킹 + 뉴스레터 |
| 스폰서(교육 서비스, SaaS) | 타깃 오디언스 대상 노출 | 스폰서 배너 슬롯 |

**대표 시나리오:** 사용자가 검색으로 "AI 유튜브 채널 순위"를 찾아 유입 → 주간 성장률 TOP 20 확인 → 채널 상세에서 30일 추이 그래프 확인 → 뉴스레터 구독 신청.

---

## 3. 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────┐
│  Vercel                                                  │
│                                                          │
│  [Vercel Cron] ──(매일 06:00 KST)──▶ /api/cron/collect   │
│                                         │                │
│                                         ▼                │
│                              YouTube Data API v3          │
│                    (channels.list · playlistItems.list    │
│                               · videos.list)             │
│                                         │                │
│                                         ▼                │
│                              /api/cron/rank (랭킹 계산)   │
│                                         │                │
│  [React + Vite SPA] ◀── /api/rankings ──┤                │
│   · 랭킹 보드                            │                │
│   · 채널 상세        ◀── /api/channels ──┤                │
│   · 뉴스레터 신청    ──▶ /api/subscribe ─┤                │
└─────────────────────────────────────────┼────────────────┘
                                          ▼
                                 Neon PostgreSQL
```

### 3.1 기술 스택

| 레이어 | 선택 | 선택 이유 |
|--------|------|-----------|
| 프론트엔드 | React 19 + Vite 6 + Tailwind CSS | 기존 PlayRank · GitHub Stars Ranker와 동일 스택 |
| 차트 | Recharts | 채널 30일 추이 라인 차트 |
| 백엔드 | Vercel Serverless Functions (`/api/*`) | API 키를 서버에만 보관 |
| 스케줄러 | Vercel Cron Jobs | Hobby 플랜에서 일 1회 실행 가능 |
| DB | Neon PostgreSQL (`@neondatabase/serverless`) | 서버리스 친화, Free 티어 |
| 뉴스레터(Phase 2) | Resend 또는 스티비 | 이메일 발송 |
| AI 인사이트(Phase 2) | Claude API | 주간 랭킹 변동 요약문 생성 |

---

## 4. YouTube Data API 설계

### 4.1 사용 엔드포인트

| 엔드포인트 | 용도 | 비용 | 호출 단위 |
|-----------|------|------|-----------|
| `channels.list` (`forHandle`) | 시드 등록 시 @핸들 → 채널 ID 변환 | 1 unit | 채널 1개 (등록 시 1회만) |
| `channels.list` (`id`) | 구독자·총조회수·영상수, 업로드 재생목록 ID | 1 unit | 채널 ID 최대 50개 |
| `playlistItems.list` | 채널별 최근 업로드 영상 ID 목록 | 1 unit | 채널 1개 (maxResults=10) |
| `videos.list` (`id`) | 최근 영상의 조회수·좋아요·댓글수 | 1 unit | 영상 ID 최대 50개 |

`search.list`는 사용하지 않는다. 2026년 6월부터 search.list는 별도 버킷(일 100회)으로 분리되어 있어 대량 운영에 부적합하다.

### 4.2 일일 quota 계산 (채널 200개 기준)

| 단계 | 계산 | units |
|------|------|-------|
| 채널 통계 | 200 ÷ 50 = 4회 | 4 |
| 업로드 목록 | 200채널 × 1회 | 200 |
| 영상 통계 | 최근 영상 약 2,000개 ÷ 50 = 40회 | 40 |
| **합계** | | **약 244 units/일** |

기본 할당 10,000 units의 약 2.4%만 사용하므로, 개발 중 반복 테스트 여유가 충분하다. quota는 태평양 시간 자정(한국 시간 16:00 또는 17:00)에 초기화된다.

### 4.3 호출 예시

```js
// 1) 채널 통계 배치 조회 (ID 50개 = 1 unit)
GET https://www.googleapis.com/youtube/v3/channels
  ?part=snippet,statistics,contentDetails
  &id=UCxxxx,UCyyyy,...
  &key=${YOUTUBE_API_KEY}

// 응답에서 업로드 재생목록 ID 추출
item.contentDetails.relatedPlaylists.uploads   // "UUxxxx..."

// 2) 최근 업로드 영상 10개
GET https://www.googleapis.com/youtube/v3/playlistItems
  ?part=contentDetails
  &playlistId=UUxxxx
  &maxResults=10
  &key=${YOUTUBE_API_KEY}

// 3) 영상 통계 배치 조회 (ID 50개 = 1 unit)
GET https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,statistics
  &id=vid1,vid2,...
  &key=${YOUTUBE_API_KEY}
```

### 4.4 데이터 해석 시 주의사항

- **구독자 수는 반올림 값이다.** 공개 API의 `subscriberCount`는 유효숫자 3자리로 축약되어 제공되므로(예: 12,345 → 12,300), 구독자 증가량은 일간 랭킹 지표로 쓰기에 거칠다. 핵심 지표는 **조회수 증가량**으로 삼고 구독자는 참고 지표로만 표시한다.
- `hiddenSubscriberCount`가 true인 채널은 구독자 표시를 "비공개"로 처리한다.
- 좋아요 수는 채널 단위가 아닌 **영상 단위**로만 제공되므로, 화제성 점수는 최근 영상 합산으로 계산한다.
- 좋아요 수를 비공개로 설정한 영상은 `likeCount` 필드가 없다 — 0이 아니라 null로 저장한다.

---

## 5. 데이터베이스 스키마 (Neon PostgreSQL)

```sql
-- 시드 채널 (큐레이션 대상)
CREATE TABLE channels (
  id              TEXT PRIMARY KEY,          -- UC로 시작하는 채널 ID
  handle          TEXT,                      -- @handle
  title           TEXT NOT NULL,
  thumbnail_url   TEXT,
  uploads_playlist_id TEXT,
  sub_category    TEXT,                      -- 'LLM 활용', '바이브코딩', '데이터/ML' 등
  is_active       BOOLEAN DEFAULT TRUE,
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 채널 일일 스냅샷
CREATE TABLE channel_snapshots (
  channel_id      TEXT REFERENCES channels(id),
  snapshot_date   DATE NOT NULL,
  subscriber_count BIGINT,                   -- 반올림 값 (참고용)
  view_count      BIGINT NOT NULL,
  video_count     INT,
  PRIMARY KEY (channel_id, snapshot_date)
);

-- 최근 영상
CREATE TABLE videos (
  id              TEXT PRIMARY KEY,
  channel_id      TEXT REFERENCES channels(id),
  title           TEXT,
  published_at    TIMESTAMPTZ,
  thumbnail_url   TEXT
);

-- 영상 일일 스냅샷
CREATE TABLE video_snapshots (
  video_id        TEXT REFERENCES videos(id),
  snapshot_date   DATE NOT NULL,
  view_count      BIGINT,
  like_count      BIGINT,                    -- 비공개 시 NULL
  comment_count   BIGINT,
  PRIMARY KEY (video_id, snapshot_date)
);

-- 계산된 랭킹 (조회 성능용)
CREATE TABLE rankings (
  ranking_date    DATE NOT NULL,
  period          TEXT NOT NULL,             -- 'daily' | 'weekly'
  metric          TEXT NOT NULL,             -- 'view_gain' | 'growth_rate' | 'buzz'
  rank            INT NOT NULL,
  channel_id      TEXT REFERENCES channels(id),
  score           NUMERIC,
  prev_rank       INT,                       -- 순위 변동 표시용
  PRIMARY KEY (ranking_date, period, metric, rank)
);

-- 뉴스레터 구독자 (Phase 2)
CREATE TABLE subscribers (
  email           TEXT PRIMARY KEY,
  plan            TEXT DEFAULT 'free',       -- 'free' | 'premium'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 스폰서 배너 (Phase 2)
CREATE TABLE sponsors (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  image_url       TEXT,
  link_url        TEXT,
  start_date      DATE,
  end_date        DATE
);
```

---

## 6. 랭킹 산식

모든 산식은 About 페이지에 그대로 공개한다.

| 랭킹 탭 | 지표 | 산식 | 비고 |
|---------|------|------|------|
| 일간 조회수 급상승 | `view_gain` (daily) | 오늘 총조회수 − 어제 총조회수 | 대형 채널에 유리 |
| 주간 성장률 | `growth_rate` (weekly) | (오늘 총조회수 − 7일 전 총조회수) ÷ 7일 전 총조회수 × 100 | 구독자 1만 이상만 포함 (소형 채널 % 왜곡 방지) |
| 신규 영상 화제성 | `buzz` (weekly) | 최근 7일 업로드 영상의 Σ(조회수 + 좋아요 × 10) | PlayBoard 인기 점수 방식 차용 |

**예외 처리 규칙**

- 스냅샷이 2일 미만인 신규 등록 채널은 "NEW" 배지로 표시하고 랭킹에서 제외한다.
- 조회수가 감소한 경우(YouTube의 스팸 조회수 정정 등)는 증가량 0으로 처리한다.
- 순위 변동은 `prev_rank`와 비교해 ▲▼ 및 숫자로 표시한다.

---

## 7. API 엔드포인트 명세

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/cron/collect` | 전체 채널·영상 통계 수집 | `CRON_SECRET` |
| GET | `/api/cron/rank` | 랭킹 계산 후 `rankings` 저장 | `CRON_SECRET` |
| GET | `/api/rankings?period=weekly&metric=growth_rate&sub=all` | 랭킹 목록 (TOP 50) | 공개 |
| GET | `/api/channels/:id` | 채널 상세 + 30일 스냅샷 + 최근 영상 | 공개 |
| POST | `/api/subscribe` | 뉴스레터 구독 신청 | 공개 (Phase 2) |
| POST | `/api/admin/seed` | @핸들 목록으로 채널 등록 | `ADMIN_SECRET` |

### 7.1 `/api/rankings` 응답 예시

```json
{
  "rankingDate": "2026-09-30",
  "period": "weekly",
  "metric": "growth_rate",
  "items": [
    {
      "rank": 1,
      "prevRank": 4,
      "channelId": "UCxxxx",
      "title": "채널명",
      "thumbnailUrl": "https://...",
      "subCategory": "바이브코딩",
      "score": 12.4,
      "subscriberCount": 128000
    }
  ]
}
```

### 7.2 Cron 설정 (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/collect", "schedule": "0 21 * * *" },
    { "path": "/api/cron/rank",    "schedule": "30 21 * * *" }
  ]
}
```

UTC 21:00 = 한국 시간 06:00. 수집이 끝난 30분 뒤 랭킹을 계산한다.

### 7.3 Cron 보안 처리

```js
// api/cron/collect.js
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // 수집 로직
}
```

Vercel은 `CRON_SECRET` 환경변수가 설정되어 있으면 Cron 호출 시 이 값을 Authorization 헤더로 자동 전송한다.

---

## 8. 프론트엔드 명세

### 8.1 페이지 구성

| 경로 | 페이지 | 주요 컴포넌트 |
|------|--------|---------------|
| `/` | 랭킹 보드 | `PeriodTabs`(일간/주간), `MetricTabs`, `SubCategoryFilter`, `RankingTable`, `SponsorBanner` |
| `/channel/:id` | 채널 상세 | `ChannelHeader`, `ViewTrendChart`(30일), `RecentVideos`, `RankHistory` |
| `/newsletter` | 뉴스레터 | `SubscribeForm`, `SampleIssue` |
| `/about` | 방법론 | 랭킹 산식, 데이터 갱신 주기, 채널 등록 요청 안내 |
| `/privacy` | 개인정보처리방침 | YouTube API 서비스 약관 준수 필수 페이지 |

### 8.2 랭킹 테이블 컬럼

| 순위 | 변동 | 채널(썸네일+이름) | 세부 분야 | 지표값 | 구독자 |
|------|------|-------------------|-----------|--------|--------|

- 1~3위는 메달 배지, 순위 상승은 ▲(초록), 하락은 ▼(빨강)으로 표시
- 채널명 클릭 시 `/channel/:id`, 외부 링크 아이콘 클릭 시 YouTube 채널로 이동

### 8.3 디자인 토큰

| 토큰 | 값 | 용도 |
|------|----|----|
| `--primary` | #1E3A5F | 헤더, 제목 |
| `--accent` | #1A56A4 | 탭 활성, 링크 |
| `--highlight` | #0EA5E9 | 순위 상승, 배지 |
| 폰트 | Pretendard 또는 맑은 고딕 | 본문 |

### 8.4 SEO 고려사항

수익 모델의 1차 유입원이 검색이므로 SEO는 필수 요건이다.

- MVP(Vite SPA): `index.html`에 title·description·OG 태그를 채우고, `sitemap.xml`과 `robots.txt`를 `public/`에 배치한다.
- 한계: SPA는 채널 상세 페이지별 메타 태그가 크롤러에 잘 노출되지 않는다.
- Phase 3에서 Next.js(ISR)로 전환해 채널별 정적 페이지를 생성하는 것을 권장한다.

---

## 9. 환경변수

| 변수 | 용도 | 노출 범위 |
|------|------|-----------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 | 서버 전용 |
| `DATABASE_URL` | Neon 연결 문자열 | 서버 전용 |
| `CRON_SECRET` | Cron 엔드포인트 보호 | 서버 전용 |
| `ADMIN_SECRET` | 시드 등록 API 보호 | 서버 전용 |
| `ANTHROPIC_API_KEY` | 주간 인사이트 생성 (Phase 2) | 서버 전용 |

`VITE_` 접두사를 붙이면 브라우저 번들에 노출되므로 **어떤 키에도 `VITE_`를 붙이지 않는다.** 이 부분은 강의에서 반드시 짚고 넘어갈 보안 포인트다.

---

## 10. 시드 채널 등록

### 10.1 시드 파일 형식 (`seed/channels.json`)

```json
[
  { "handle": "@example-ai-channel", "subCategory": "LLM 활용" },
  { "handle": "@example-vibe-coding", "subCategory": "바이브코딩" },
  { "handle": "@example-ml-lab", "subCategory": "데이터/ML" }
]
```

### 10.2 세부 분야 분류 (예시)

| 코드 | 분야 |
|------|------|
| `llm` | LLM 활용 · 생성형 AI 도구 |
| `vibe` | 바이브코딩 · AI 코딩 도구 |
| `ml` | 데이터 · 머신러닝 |
| `cloud` | 클라우드 · 인프라 |
| `career` | IT 커리어 · 자격증 |

### 10.3 큐레이션 기준

- 한국어 콘텐츠 중심, 최근 90일 내 업로드 3개 이상
- 구독자 1,000명 이상
- AI·테크 교육 콘텐츠 비중 50% 이상
- 등록 요청은 About 페이지 폼으로 받고 운영자가 수동 승인

---

## 11. 준수 사항 (YouTube API 서비스 약관)

상용 운영 전에 반드시 최신 YouTube API Services Terms of Service와 Developer Policies 원문을 확인한다. 설계 단계에서 반영할 항목은 다음과 같다.

- **데이터 보관 기간:** API로 받은 데이터는 일정 기간 내 갱신하거나 삭제해야 한다는 규정이 있다. 원본 스냅샷은 롤링 기간만 보관하고, 장기 추이는 계산된 지표 위주로 남기는 구조를 검토한다. 장기 시계열 보관이 사업의 핵심이 되면 Google의 API 감사(Audit) 절차를 거치는 것이 안전하다.
- **quota 편법 금지:** 복수 프로젝트나 API 키로 할당량을 늘리는 것은 약관 위반이다.
- **출처 표시:** 페이지 하단에 YouTube 데이터 출처를 명시하고 채널·영상 링크는 YouTube 원본으로 연결한다.
- **개인정보처리방침:** `/privacy` 페이지를 제공하고 YouTube 약관 링크를 포함한다.

---

## 12. 구현 로드맵

| Phase | 범위 | 기간 | 산출물 |
|-------|------|------|--------|
| **1. MVP (오늘 강의)** | 시드 20개 · 수집 Cron · 주간 성장률 랭킹 1종 · Vercel 배포 | 3~4시간 | 배포 URL |
| 2. 수익화 기반 | 랭킹 3종 · 채널 상세 · 뉴스레터 구독 · 스폰서 배너 · Claude 주간 인사이트 | 1~2주 | 뉴스레터 1호 발행 |
| 3. 성장 | Next.js ISR 전환 · 채널 200개 확장 · 유료 뉴스레터 결제 | 2~4주 | 유료 구독 오픈 |
| 4. 복제 | 버티컬 설정 분리 → 재테크 · K-뷰티 랭킹 파생 | 1주/버티컬 | 멀티 버티컬 |

### 12.1 Phase 1 강의 진행 순서 (약 3시간 30분)

| 시간 | 단계 | 내용 |
|------|------|------|
| 20분 | 준비 | Google Cloud 프로젝트 생성 → YouTube Data API v3 활성화 → API 키 발급 |
| 20분 | DB | Neon 프로젝트 생성 → 스키마 실행 |
| 60분 | 빌드 | Claude Code로 수집 API · 랭킹 API · 랭킹 보드 UI 생성 |
| 30분 | 로컬 테스트 | `vercel dev`로 수집 1회 수동 실행 → 랭킹 확인 |
| 30분 | 배포 | GitHub 푸시 → Vercel Import → 환경변수 등록 → Cron 확인 |
| 30분 | 회고 | quota 사용량 확인, 오류 사례 공유 |

**실습 팁:** 성장률 계산에는 최소 2일치 스냅샷이 필요하다. 강의 당일에는 수집을 1회만 실행하므로, 미리 준비한 샘플 스냅샷 SQL(어제 날짜 데이터)을 넣어 랭킹 화면을 확인하게 한다.

---

## 13. 바이브코딩 시작 프롬프트 (Claude Code용)

```
너는 풀스택 개발자다. 아래 명세로 "K-TechRank" 앱을 만든다.

[스택] React 19 + Vite 6 + Tailwind CSS, Vercel Serverless Functions(/api), Neon PostgreSQL(@neondatabase/serverless)

[1단계] /api/cron/collect.js
- channels 테이블의 활성 채널 ID를 50개씩 묶어 YouTube channels.list(part=snippet,statistics,contentDetails) 호출
- channel_snapshots에 오늘 날짜로 upsert
- 각 채널 uploads 재생목록에서 playlistItems.list(maxResults=10) 호출
- 영상 ID를 50개씩 묶어 videos.list 호출 → videos, video_snapshots upsert
- search.list는 절대 사용하지 않는다
- Authorization 헤더가 Bearer ${CRON_SECRET}이 아니면 401

[2단계] /api/cron/rank.js
- 주간 성장률 = (오늘 총조회수 - 7일 전 총조회수) / 7일 전 총조회수 × 100
- 구독자 1만 미만 제외, 스냅샷 부족 채널 제외
- rankings 테이블에 TOP 50 저장, prev_rank 포함

[3단계] /api/rankings.js — period, metric 쿼리 파라미터로 랭킹 반환

[4단계] 프론트엔드 랭킹 보드
- 일간/주간 탭, 순위 변동 ▲▼, 1~3위 메달
- 색상: #1E3A5F(헤더), #1A56A4(강조), #0EA5E9(액센트)
- 모바일 반응형

[규칙] API 키는 서버에서만 사용하고 VITE_ 접두사를 쓰지 않는다. 각 단계 완료 후 테스트 방법을 알려준다.
```

---

## 14. 트러블슈팅 예상 항목

| 증상 | 원인 | 해결 |
|------|------|------|
| `403 quotaExceeded` | 테스트 반복으로 일 할당 소진 | 태평양 시간 자정(한국 16~17시) 초기화 대기, 캐시 활용 |
| `403 accessNotConfigured` | API 미활성화 | Google Cloud Console에서 YouTube Data API v3 활성화 |
| `400 keyInvalid` | 키 복사 오류 또는 제한 설정 | 키 재확인, API 제한에서 YouTube Data API 허용 |
| 랭킹이 비어 있음 | 스냅샷 1일치뿐 | 샘플 스냅샷 SQL 삽입 |
| Cron이 실행되지 않음 | Preview 배포에서는 Cron 미작동 | Production 배포에서 확인 |
| 함수 타임아웃 | 채널 200개 순차 호출 | `Promise.all`로 10개씩 병렬 처리 |
| 브라우저에서 API 키 노출 | `VITE_` 접두사 사용 | 서버 함수로 이동 후 키 재발급 |

---

## 15. 성공 지표 (KPI)

| 단계 | 지표 | 목표 |
|------|------|------|
| MVP | 배포 완료 · Cron 7일 연속 성공 | 100% |
| 트래픽 | 월 방문자 | 3개월 내 5,000명 |
| 뉴스레터 | 무료 구독자 | 3개월 내 500명 |
| 수익화 | 유료 전환율 · 스폰서 계약 | 3% · 월 1건 |

---

*작성: 동준상 · 넥스트플랫폼 · naebon@naver.com · nextplatform.net*
