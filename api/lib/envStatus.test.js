import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyYoutube } from './envStatus.js';

test('유효한 YouTube 응답은 성공으로 분류한다', () => {
  assert.equal(classifyYoutube(200, '').state, 'ok');
});

test('잘못된 키와 미활성 API를 구분한다', () => {
  assert.equal(classifyYoutube(400, 'keyInvalid').state, 'invalid');
  assert.match(classifyYoutube(403, 'accessNotConfigured').detail, /켜져 있지 않습니다/);
});

test('할당량 초과는 키가 유효하다는 경고로 분류한다', () => {
  const result = classifyYoutube(403, 'quotaExceeded');
  assert.equal(result.state, 'warning');
  assert.match(result.detail, /유효합니다/);
});

test('키 제한은 비밀값을 포함하지 않는 안내로 분류한다', () => {
  const result = classifyYoutube(403, 'API_KEY_HTTP_REFERRER_BLOCKED');
  assert.equal(result.state, 'warning');
  assert.doesNotMatch(result.detail, /AIza|key=/);
});
