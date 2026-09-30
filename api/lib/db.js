import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    const error = new Error('DATABASE_URL is not set');
    error.statusCode = 503;
    throw error;
  }
  return neon(url);
}
