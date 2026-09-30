import { getSql } from '../lib/db.js';
import { kstDate } from '../lib/dates.js';
import { requireBearer, sendError } from '../lib/http.js';
import {
  channelRecord,
  listChannelsByIds,
  listPlaylistVideoIds,
  listVideosByIds,
  mapPool,
  videoRecord,
} from '../lib/youtube.js';

async function saveChannel(sql, channel, snapshotDate) {
  await sql`
    UPDATE channels
    SET title = ${channel.title},
        thumbnail_url = ${channel.thumbnailUrl},
        uploads_playlist_id = ${channel.uploadsPlaylistId},
        handle = COALESCE(${channel.handle}, handle)
    WHERE id = ${channel.id}
  `;
  await sql`
    INSERT INTO channel_snapshots (channel_id, snapshot_date, subscriber_count, view_count, video_count)
    VALUES (
      ${channel.id},
      ${snapshotDate},
      ${channel.subscriberCount},
      ${channel.viewCount},
      ${channel.videoCount}
    )
    ON CONFLICT (channel_id, snapshot_date) DO UPDATE SET
      subscriber_count = EXCLUDED.subscriber_count,
      view_count = EXCLUDED.view_count,
      video_count = EXCLUDED.video_count
  `;
}

async function saveVideo(sql, video, snapshotDate) {
  await sql`
    INSERT INTO videos (id, channel_id, title, published_at, thumbnail_url)
    VALUES (
      ${video.id},
      ${video.channelId},
      ${video.title},
      ${video.publishedAt},
      ${video.thumbnailUrl}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      published_at = EXCLUDED.published_at,
      thumbnail_url = EXCLUDED.thumbnail_url
  `;
  await sql`
    INSERT INTO video_snapshots (video_id, snapshot_date, view_count, like_count, comment_count)
    VALUES (
      ${video.id},
      ${snapshotDate},
      ${video.viewCount},
      ${video.likeCount},
      ${video.commentCount}
    )
    ON CONFLICT (video_id, snapshot_date) DO UPDATE SET
      view_count = EXCLUDED.view_count,
      like_count = EXCLUDED.like_count,
      comment_count = EXCLUDED.comment_count
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireBearer(req, process.env.CRON_SECRET);
    const sql = getSql();
    const snapshotDate = kstDate();
    const channels = await sql`
      SELECT id, uploads_playlist_id
      FROM channels
      WHERE is_active = TRUE
    `;
    const ids = channels.map((row) => row.id).filter((id) => !String(id).startsWith('UC_SAMPLE_'));
    const listed = await listChannelsByIds(ids);
    const records = listed.map(channelRecord);

    for (const channel of records) {
      await saveChannel(sql, channel, snapshotDate);
    }

    const playlistJobs = records.filter((channel) => channel.uploadsPlaylistId);
    const playlistResults = await mapPool(playlistJobs, 10, async (channel) => {
      const items = await listPlaylistVideoIds(channel.uploadsPlaylistId);
      return items.map((item) => ({
        videoId: item.contentDetails?.videoId,
        channelId: channel.id,
      })).filter((item) => item.videoId);
    });
    const playlistVideos = playlistResults.flat();
    const videoItems = await listVideosByIds(playlistVideos.map((item) => item.videoId));
    const channelByVideo = new Map(playlistVideos.map((item) => [item.videoId, item.channelId]));

    for (const item of videoItems) {
      const channelId = channelByVideo.get(item.id);
      if (!channelId) continue;
      await saveVideo(sql, videoRecord(item, channelId), snapshotDate);
    }

    res.status(200).json({
      ok: true,
      snapshotDate,
      channels: records.length,
      videos: videoItems.length,
    });
  } catch (error) {
    sendError(res, error);
  }
}
