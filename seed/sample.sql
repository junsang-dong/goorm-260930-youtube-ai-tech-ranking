-- 샘플 스냅샷. 채널명과 수치는 가상 데이터다.
-- 오늘(KST)과 7일 전 조회수를 넣어 주간 성장률이 바로 계산된다.
-- UC_SAMPLE_13 은 구독자 1만 미만, UC_SAMPLE_14 는 스냅샷이 하루뿐이라 랭킹에서 빠진다.

INSERT INTO channels (id, handle, title, thumbnail_url, sub_category, is_active)
VALUES
  ('UC_SAMPLE_01', '@sample-vibe-01', '샘플 바이브코더', NULL, 'vibe', TRUE),
  ('UC_SAMPLE_02', '@sample-llm-02', '샘플 LLM 랩', NULL, 'llm', TRUE),
  ('UC_SAMPLE_03', '@sample-ml-03', '샘플 데이터 스쿨', NULL, 'ml', TRUE),
  ('UC_SAMPLE_04', '@sample-cloud-04', '샘플 클라우드 노트', NULL, 'cloud', TRUE),
  ('UC_SAMPLE_05', '@sample-career-05', '샘플 커리어 가이드', NULL, 'career', TRUE),
  ('UC_SAMPLE_06', '@sample-llm-06', '샘플 프롬프트 공작소', NULL, 'llm', TRUE),
  ('UC_SAMPLE_07', '@sample-vibe-07', '샘플 에이전트 실험실', NULL, 'vibe', TRUE),
  ('UC_SAMPLE_08', '@sample-ml-08', '샘플 ML 파이프라인', NULL, 'ml', TRUE),
  ('UC_SAMPLE_09', '@sample-cloud-09', '샘플 인프라 다이어리', NULL, 'cloud', TRUE),
  ('UC_SAMPLE_10', '@sample-career-10', '샘플 자격증 브리핑', NULL, 'career', TRUE),
  ('UC_SAMPLE_11', '@sample-llm-11', '샘플 챗봇 강의실', NULL, 'llm', TRUE),
  ('UC_SAMPLE_12', '@sample-vibe-12', '샘플 코딩 어시스턴트', NULL, 'vibe', TRUE),
  ('UC_SAMPLE_13', '@sample-llm-13', '샘플 소형 채널', NULL, 'llm', TRUE),
  ('UC_SAMPLE_14', '@sample-vibe-14', '샘플 신규 채널', NULL, 'vibe', TRUE)
ON CONFLICT (id) DO UPDATE SET
  handle = EXCLUDED.handle,
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  is_active = EXCLUDED.is_active;

INSERT INTO channel_snapshots (channel_id, snapshot_date, subscriber_count, view_count, video_count)
VALUES
  ('UC_SAMPLE_01', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 128000, 1415400, 86),
  ('UC_SAMPLE_01', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 120000, 1050000, 84),
  ('UC_SAMPLE_02', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 86000, 981920, 120),
  ('UC_SAMPLE_02', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 84000, 760000, 117),
  ('UC_SAMPLE_03', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 54000, 520800, 64),
  ('UC_SAMPLE_03', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 52000, 420000, 62),
  ('UC_SAMPLE_04', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 210000, 2832000, 210),
  ('UC_SAMPLE_04', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 208000, 2400000, 208),
  ('UC_SAMPLE_05', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 95000, 701500, 150),
  ('UC_SAMPLE_05', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 94000, 610000, 148),
  ('UC_SAMPLE_06', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 42000, 203400, 40),
  ('UC_SAMPLE_06', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 40000, 180000, 38),
  ('UC_SAMPLE_07', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 31000, 105450, 28),
  ('UC_SAMPLE_07', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 30000, 95000, 27),
  ('UC_SAMPLE_08', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 67000, 588600, 90),
  ('UC_SAMPLE_08', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 66000, 540000, 88),
  ('UC_SAMPLE_09', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 150000, 1177000, 175),
  ('UC_SAMPLE_09', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 149000, 1100000, 173),
  ('UC_SAMPLE_10', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 88000, 346500, 200),
  ('UC_SAMPLE_10', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 87000, 330000, 198),
  ('UC_SAMPLE_11', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 25000, 82400, 33),
  ('UC_SAMPLE_11', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 25000, 80000, 32),
  ('UC_SAMPLE_12', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 19000, 200000, 70),
  ('UC_SAMPLE_12', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 19000, 210000, 70),
  ('UC_SAMPLE_13', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 4200, 18000, 12),
  ('UC_SAMPLE_13', ((NOW() AT TIME ZONE 'Asia/Seoul')::date - 7), 3000, 10000, 10),
  ('UC_SAMPLE_14', (NOW() AT TIME ZONE 'Asia/Seoul')::date, 22000, 45000, 4)
ON CONFLICT (channel_id, snapshot_date) DO UPDATE SET
  subscriber_count = EXCLUDED.subscriber_count,
  view_count = EXCLUDED.view_count,
  video_count = EXCLUDED.video_count;

-- 어제 순위. 오늘 prev_rank 와 같은 값이라, 랭킹 크론을 다시 돌려도 변동 표시가 유지된다.
INSERT INTO rankings (ranking_date, period, metric, rank, channel_id, score, prev_rank)
VALUES
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 1, 'UC_SAMPLE_03', 26.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 2, 'UC_SAMPLE_02', 25.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 3, 'UC_SAMPLE_06', 16.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 4, 'UC_SAMPLE_01', 15.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 5, 'UC_SAMPLE_05', 14.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 6, 'UC_SAMPLE_04', 12.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 7, 'UC_SAMPLE_09', 8.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 8, 'UC_SAMPLE_08', 7.5, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 9, 'UC_SAMPLE_07', 6.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 10, 'UC_SAMPLE_11', 4.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 11, 'UC_SAMPLE_12', 2.0, NULL),
  (((NOW() AT TIME ZONE 'Asia/Seoul')::date - 1), 'weekly', 'growth_rate', 12, 'UC_SAMPLE_10', 1.0, NULL)
ON CONFLICT (ranking_date, period, metric, rank) DO UPDATE SET
  channel_id = EXCLUDED.channel_id,
  score = EXCLUDED.score,
  prev_rank = EXCLUDED.prev_rank;

INSERT INTO rankings (ranking_date, period, metric, rank, channel_id, score, prev_rank)
VALUES
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 1, 'UC_SAMPLE_01', 34.8, 4),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 2, 'UC_SAMPLE_02', 29.2, 2),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 3, 'UC_SAMPLE_03', 24.0, 1),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 4, 'UC_SAMPLE_04', 18.0, 6),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 5, 'UC_SAMPLE_05', 15.0, 5),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 6, 'UC_SAMPLE_06', 13.0, 3),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 7, 'UC_SAMPLE_07', 11.0, 9),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 8, 'UC_SAMPLE_08', 9.0, 8),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 9, 'UC_SAMPLE_09', 7.0, 7),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 10, 'UC_SAMPLE_10', 5.0, 12),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 11, 'UC_SAMPLE_11', 3.0, 10),
  ((NOW() AT TIME ZONE 'Asia/Seoul')::date, 'weekly', 'growth_rate', 12, 'UC_SAMPLE_12', 0.0, 11)
ON CONFLICT (ranking_date, period, metric, rank) DO UPDATE SET
  channel_id = EXCLUDED.channel_id,
  score = EXCLUDED.score,
  prev_rank = EXCLUDED.prev_rank;
