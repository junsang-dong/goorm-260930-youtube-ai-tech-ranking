import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { getEnvStatus } from './api/lib/envStatus.js';
import { getLiveBoard } from './api/lib/liveBoard.js';

// 로컬 개발 서버에서 /api/health 와 /api/board 만 직접 처리한다.

function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        if (path === '/api/health' && req.method === 'GET') {
          try {
            const env = loadEnv(server.config.mode, process.cwd(), '');
            const status = await getEnvStatus(env);
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(status));
          } catch {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: '환경 상태를 확인하지 못했습니다.' }));
          }
          return;
        }
        if (path === '/api/board' && req.method === 'GET') {
          try {
            const env = loadEnv(server.config.mode, process.cwd(), '');
            const sub = new URL(req.url, 'http://localhost').searchParams.get('sub') ?? 'all';
            const board = await getLiveBoard({ apiKey: env.YOUTUBE_API_KEY, sub });
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(board));
          } catch (error) {
            const status = error.statusCode || 500;
            res.statusCode = status;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              error: status === 503 || status === 400 ? error.message : 'YouTube 채널을 가져오지 못했습니다.',
            }));
          }
          return;
        }
        if (path === '/api' || path.startsWith('/api/')) {
          res.statusCode = 404;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Use vercel dev to run API routes' }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [localApi(), react()],
  optimizeDeps: {
    exclude: ['@neondatabase/serverless'],
  },
});
