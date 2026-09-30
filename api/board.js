import { getLiveBoard } from './lib/liveBoard.js';
import { queryOf } from './lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const query = { ...(req.query ?? {}), ...queryOf(req) };
    const board = await getLiveBoard({
      apiKey: process.env.YOUTUBE_API_KEY,
      sub: query.sub ?? 'all',
    });
    res.status(200).json(board);
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 503 || status === 400
      ? error.message
      : 'YouTube 채널을 가져오지 못했습니다.';
    res.status(status).json({ error: message });
  }
}
