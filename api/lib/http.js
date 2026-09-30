export function requireBearer(req, secret) {
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
}

export function sendError(res, error) {
  const status = error.statusCode || 500;
  const body = { error: status === 500 ? 'Internal error' : error.message };
  if (status === 500 && error.message && error.message !== 'Internal error') {
    body.error = error.message;
  }
  res.status(status).json(body);
}

export function queryOf(req) {
  const url = new URL(req.url || '/', 'http://localhost');
  return Object.fromEntries(url.searchParams.entries());
}
