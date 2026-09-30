import { categoryLabel, normalizeCategory } from '../shared/categories.js';
import { getSql } from './lib/db.js';
import { queryOf, sendError } from './lib/http.js';
import { roundScore } from './lib/metrics.js';

function toNumber(value) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isoDate(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(value);
  }
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : String(value).slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const query = { ...(req.query ?? {}), ...queryOf(req) };
    if ((query.period ?? 'weekly') !== 'weekly' || (query.metric ?? 'growth_rate') !== 'growth_rate') {
      res.status(400).json({ error: 'Only weekly growth_rate is available' });
      return;
    }

    const sub = normalizeCategory(query.sub ?? 'all');
    if (!sub) {
      res.status(400).json({ error: 'Unknown sub category' });
      return;
    }

    const sql = getSql();
    const rows = await sql`
      SELECT
        r.ranking_date,
        r.rank,
        r.prev_rank,
        r.score,
        r.channel_id,
        c.handle,
        c.title,
        c.thumbnail_url,
        c.sub_category,
        s.subscriber_count,
        s.view_count,
        b.view_count AS base_view_count
      FROM rankings r
      JOIN channels c ON c.id = r.channel_id
      LEFT JOIN channel_snapshots s
        ON s.channel_id = r.channel_id
       AND s.snapshot_date = r.ranking_date
      LEFT JOIN channel_snapshots b
        ON b.channel_id = r.channel_id
       AND b.snapshot_date = r.ranking_date - 7
      WHERE r.period = 'weekly'
        AND r.metric = 'growth_rate'
        AND r.ranking_date = (
          SELECT MAX(ranking_date)
          FROM rankings
          WHERE period = 'weekly'
            AND metric = 'growth_rate'
        )
        AND (${sub} = 'all' OR c.sub_category = ${sub})
      ORDER BY r.rank
      LIMIT 50
    `;

    const rankingDate = isoDate(rows[0]?.ranking_date);

    res.status(200).json({
      rankingDate,
      period: 'weekly',
      metric: 'growth_rate',
      sub,
      items: rows.map((row) => {
        const viewCount = toNumber(row.view_count);
        const baseViewCount = toNumber(row.base_view_count);
        return {
          rank: Number(row.rank),
          prevRank: row.prev_rank == null ? null : Number(row.prev_rank),
          channelId: row.channel_id,
          handle: row.handle,
          title: row.title,
          thumbnailUrl: row.thumbnail_url,
          subCategory: categoryLabel(row.sub_category),
          subCategoryCode: row.sub_category,
          score: roundScore(row.score),
          subscriberCount: toNumber(row.subscriber_count),
          viewCount,
          baseViewCount,
        };
      }),
    });
  } catch (error) {
    sendError(res, error);
  }
}
