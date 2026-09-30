import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categoryLabel, normalizeCategory } from '../../shared/categories.js';
import { getSql } from '../lib/db.js';
import { requireBearer, sendError } from '../lib/http.js';
import { channelRecord, listChannelByHandle } from '../lib/youtube.js';

async function readSeedFile() {
  const path = join(dirname(fileURLToPath(import.meta.url)), '../../seed/channels.json');
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    const error = new Error('seed/channels.json must be an array');
    error.statusCode = 500;
    throw error;
  }
  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireBearer(req, process.env.ADMIN_SECRET);
    const sql = getSql();
    const seeds = await readSeedFile();
    const inserted = [];
    const failed = [];

    for (const seed of seeds) {
      const code = normalizeCategory(seed.subCategory);
      if (!seed.handle || !code || code === 'all') {
        failed.push({ handle: seed.handle ?? null, error: 'Invalid handle or subCategory' });
        continue;
      }
      try {
        const item = await listChannelByHandle(seed.handle);
        if (!item) {
          failed.push({ handle: seed.handle, error: 'Channel not found' });
          continue;
        }
        const channel = channelRecord(item);
        await sql`
          INSERT INTO channels (id, handle, title, thumbnail_url, uploads_playlist_id, sub_category, is_active)
          VALUES (
            ${channel.id},
            ${channel.handle ?? seed.handle},
            ${channel.title},
            ${channel.thumbnailUrl},
            ${channel.uploadsPlaylistId},
            ${code},
            TRUE
          )
          ON CONFLICT (id) DO UPDATE SET
            handle = EXCLUDED.handle,
            title = EXCLUDED.title,
            thumbnail_url = EXCLUDED.thumbnail_url,
            uploads_playlist_id = EXCLUDED.uploads_playlist_id,
            sub_category = EXCLUDED.sub_category,
            is_active = TRUE
        `;
        inserted.push({
          id: channel.id,
          handle: channel.handle ?? seed.handle,
          title: channel.title,
          subCategory: categoryLabel(code),
        });
      } catch (error) {
        failed.push({ handle: seed.handle, error: error.message });
      }
    }

    res.status(200).json({ ok: true, inserted, failed });
  } catch (error) {
    sendError(res, error);
  }
}
