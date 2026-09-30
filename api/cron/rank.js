import { getSql } from '../lib/db.js';
import { addDays, kstDate } from '../lib/dates.js';
import { requireBearer, sendError } from '../lib/http.js';
import { roundScore, selectWeeklyGrowthRanking } from '../lib/metrics.js';

async function loadRows(sql, today, weekAgo) {
  return sql`
    SELECT
      c.id AS channel_id,
      t.subscriber_count,
      t.view_count AS today_view_count,
      b.view_count AS base_view_count
    FROM channels c
    JOIN channel_snapshots t
      ON t.channel_id = c.id
     AND t.snapshot_date = ${today}
    LEFT JOIN channel_snapshots b
      ON b.channel_id = c.id
     AND b.snapshot_date = ${weekAgo}
    WHERE c.is_active = TRUE
  `;
}

async function previousRanks(sql, today) {
  const rows = await sql`
    SELECT channel_id, rank
    FROM rankings
    WHERE period = 'weekly'
      AND metric = 'growth_rate'
      AND ranking_date = (
        SELECT MAX(ranking_date)
        FROM rankings
        WHERE period = 'weekly'
          AND metric = 'growth_rate'
          AND ranking_date < ${today}
      )
  `;
  return new Map(rows.map((row) => [row.channel_id, row.rank]));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireBearer(req, process.env.CRON_SECRET);
    const sql = getSql();
    const today = kstDate();
    const weekAgo = addDays(today, -7);
    const rows = await loadRows(sql, today, weekAgo);
    const ranked = selectWeeklyGrowthRanking(
      rows.map((row) => ({
        channelId: row.channel_id,
        subscriberCount: row.subscriber_count,
        todayViewCount: row.today_view_count,
        baseViewCount: row.base_view_count,
      })),
    );
    const prev = await previousRanks(sql, today);

    const statements = [
      sql`
        DELETE FROM rankings
        WHERE ranking_date = ${today}
          AND period = 'weekly'
          AND metric = 'growth_rate'
      `,
      ...ranked.map(
        (row) => sql`
          INSERT INTO rankings (ranking_date, period, metric, rank, channel_id, score, prev_rank)
          VALUES (
            ${today},
            'weekly',
            'growth_rate',
            ${row.rank},
            ${row.channelId},
            ${roundScore(row.score)},
            ${prev.get(row.channelId) ?? null}
          )
        `,
      ),
    ];
    await sql.transaction(statements);

    res.status(200).json({
      ok: true,
      rankingDate: today,
      period: 'weekly',
      metric: 'growth_rate',
      count: ranked.length,
    });
  } catch (error) {
    sendError(res, error);
  }
}
