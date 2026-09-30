import { createHash } from 'node:crypto';

const PROBE_CHANNEL_ID = 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
const CACHE_MS = 60_000;

let cached = null;
let pending = null;

function present(value) {
  return Boolean(value && String(value).trim());
}

function fingerprint(env) {
  return createHash('sha256')
    .update(
      ['YOUTUBE_API_KEY', 'DATABASE_URL', 'CRON_SECRET', 'ADMIN_SECRET']
        .map((name) => String(env[name] ?? ''))
        .join('\0'),
    )
    .digest('hex');
}

export function classifyYoutube(status, reason) {
  if (reason === 'keyInvalid' || reason === 'badRequest' && status === 400) {
    return {
      state: 'invalid',
      detail: 'YouTube가 이 키를 거부했습니다. 복사한 값을 다시 확인해 주세요.',
    };
  }
  if (reason === 'accessNotConfigured') {
    return {
      state: 'invalid',
      detail: '키는 전달됐지만, 이 프로젝트에서 YouTube Data API가 켜져 있지 않습니다.',
    };
  }
  if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
    return {
      state: 'warning',
      detail: '키는 유효합니다. 오늘 할당량을 모두 사용했습니다.',
    };
  }
  if (/BLOCKED|Referer|referer|ipReferer/i.test(reason)) {
    return {
      state: 'warning',
      detail: '키는 있지만 요청이 키 제한(IP, 리퍼러, 앱)에 막혔습니다.',
    };
  }
  if (status === 200) {
    return {
      state: 'ok',
      detail: 'YouTube Data API가 키를 수락했습니다.',
    };
  }
  return {
    state: 'invalid',
    detail: '키 확인 요청이 실패했습니다. 잠시 후 새로고침해 주세요.',
  };
}

async function youtubeReason(response) {
  try {
    const data = await response.json();
    return data?.error?.errors?.[0]?.reason || '';
  } catch {
    return '';
  }
}

async function checkYoutube(apiKey) {
  if (!present(apiKey)) {
    return {
      id: 'YOUTUBE_API_KEY',
      label: 'YouTube API 키',
      state: 'missing',
      detail: '비어 있습니다. 채널 수집을 하려면 키를 넣어 주세요.',
    };
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id');
  url.searchParams.set('id', PROBE_CHANNEL_ID);
  url.searchParams.set('key', String(apiKey).trim());

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const reason = response.ok ? '' : await youtubeReason(response);
    const classified = classifyYoutube(response.status, reason);
    return { id: 'YOUTUBE_API_KEY', label: 'YouTube API 키', ...classified };
  } catch {
    return {
      id: 'YOUTUBE_API_KEY',
      label: 'YouTube API 키',
      state: 'invalid',
      detail: 'YouTube에 확인 요청을 보내지 못했습니다. 네트워크를 확인해 주세요.',
    };
  }
}

async function checkDatabase(databaseUrl) {
  if (!present(databaseUrl)) {
    return {
      id: 'DATABASE_URL',
      label: '데이터베이스',
      state: 'missing',
      detail: '비어 있습니다. 주간 성장률 대신 YouTube에서 바로 가져온 채널과 영상을 표시합니다.',
    };
  }

  const url = String(databaseUrl).trim();
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return {
      id: 'DATABASE_URL',
      label: '데이터베이스',
      state: 'invalid',
      detail: 'PostgreSQL 연결 주소 형식이 아닙니다.',
    };
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    await sql`SELECT 1 AS ok`;
    return {
      id: 'DATABASE_URL',
      label: '데이터베이스',
      state: 'ok',
      detail: 'Neon PostgreSQL에 연결되었습니다.',
    };
  } catch {
    return {
      id: 'DATABASE_URL',
      label: '데이터베이스',
      state: 'invalid',
      detail: '연결에 실패했습니다. 주소와 인증 정보를 확인해 주세요.',
    };
  }
}

function checkSecret(id, label, value, usage) {
  if (!present(value)) {
    return {
      id,
      label,
      state: 'missing',
      detail: `비어 있습니다. ${usage}`,
    };
  }
  return {
    id,
    label,
    state: 'set',
    detail: `입력되어 있습니다. ${usage} 외부 서비스로 검증하는 값은 아닙니다.`,
  };
}

async function computeEnvStatus(env) {
  const [youtube, database] = await Promise.all([
    checkYoutube(env.YOUTUBE_API_KEY),
    checkDatabase(env.DATABASE_URL),
  ]);

  return {
    items: [
      youtube,
      database,
      checkSecret('CRON_SECRET', 'Cron 비밀값', env.CRON_SECRET, '수집·랭킹 API를 보호할 때 사용합니다.'),
      checkSecret('ADMIN_SECRET', '관리자 비밀값', env.ADMIN_SECRET, '채널 등록 API를 보호할 때 사용합니다.'),
    ],
  };
}

export function getEnvStatus(env = process.env) {
  const finger = fingerprint(env);
  if (cached && cached.finger === finger && Date.now() - cached.at < CACHE_MS) {
    return Promise.resolve(cached.value);
  }
  if (pending && pending.finger === finger) return pending.promise;

  const promise = computeEnvStatus(env)
    .then((value) => {
      cached = { finger, at: Date.now(), value };
      return value;
    })
    .finally(() => {
      if (pending?.promise === promise) pending = null;
    });

  pending = { finger, promise };
  return promise;
}

export function resetEnvStatusCache() {
  cached = null;
  pending = null;
}
