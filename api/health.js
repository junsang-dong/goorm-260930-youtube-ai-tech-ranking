import { getEnvStatus } from './lib/envStatus.js';
import { sendError } from './lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const status = await getEnvStatus(process.env);
    res.status(200).json(status);
  } catch (error) {
    sendError(res, error);
  }
}
