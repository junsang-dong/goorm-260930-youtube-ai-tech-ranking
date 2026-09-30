-- K-TechRank schema (Neon PostgreSQL)
-- 명세 5절. 재실행해도 기존 테이블은 유지한다.

CREATE TABLE IF NOT EXISTS channels (
  id              TEXT PRIMARY KEY,
  handle          TEXT,
  title           TEXT NOT NULL,
  thumbnail_url   TEXT,
  uploads_playlist_id TEXT,
  sub_category    TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  added_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_snapshots (
  channel_id      TEXT REFERENCES channels(id),
  snapshot_date   DATE NOT NULL,
  subscriber_count BIGINT,
  view_count      BIGINT NOT NULL,
  video_count     INT,
  PRIMARY KEY (channel_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS videos (
  id              TEXT PRIMARY KEY,
  channel_id      TEXT REFERENCES channels(id),
  title           TEXT,
  published_at    TIMESTAMPTZ,
  thumbnail_url   TEXT
);

CREATE TABLE IF NOT EXISTS video_snapshots (
  video_id        TEXT REFERENCES videos(id),
  snapshot_date   DATE NOT NULL,
  view_count      BIGINT,
  like_count      BIGINT,
  comment_count   BIGINT,
  PRIMARY KEY (video_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS rankings (
  ranking_date    DATE NOT NULL,
  period          TEXT NOT NULL,
  metric          TEXT NOT NULL,
  rank            INT NOT NULL,
  channel_id      TEXT REFERENCES channels(id),
  score           NUMERIC,
  prev_rank       INT,
  PRIMARY KEY (ranking_date, period, metric, rank)
);

CREATE TABLE IF NOT EXISTS subscribers (
  email           TEXT PRIMARY KEY,
  plan            TEXT DEFAULT 'free',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  image_url       TEXT,
  link_url        TEXT,
  start_date      DATE,
  end_date        DATE
);
