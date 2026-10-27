import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canBypassBasicForLegacyCron } from '../lib/cron-query-scope.ts';

const secret = 'synthetic-unit-test-only';
const accepts = (method, pathname, suppliedSecret = secret, configuredSecret = secret, browserExposedSecret) =>
  canBypassBasicForLegacyCron(method, pathname, suppliedSecret, configuredSecret, browserExposedSecret);

test('only explicitly named legacy GET cron handlers can bypass Basic', () => {
  for (const pathname of [
    '/api/agents/africa-scan', '/api/agents/followup',
    '/api/agents/linkedin-outreach', '/api/agents/send-email',
    '/api/prospects/scan',
  ]) assert.equal(accepts('GET', pathname), true, pathname);
});

test('query credentials never authenticate dashboards, streams, arbitrary APIs or writes', () => {
  for (const pathname of [
    '/dashboard', '/dashboard/intel', '/dashboard/instructors',
    '/api/agent/intel/send', '/api/agent/intel/stream',
    '/api/instructors/scan/stream', '/api/agents/send-email/other',
    '/api/agents',
  ]) assert.equal(accepts('GET', pathname), false, pathname);
  for (const pathname of ['/api/agents/send-email', '/api/prospects/scan']) {
    assert.equal(accepts('POST', pathname), false);
    assert.equal(accepts('DELETE', pathname), false);
  }
});

test('missing, empty, incorrect or unconfigured cron tokens fail closed', () => {
  assert.equal(accepts('GET', '/api/agents/send-email', null), false);
  assert.equal(accepts('GET', '/api/agents/send-email', ''), false);
  assert.equal(accepts('GET', '/api/agents/send-email', 'wrong'), false);
  assert.equal(accepts('GET', '/api/agents/send-email', '', ''), false);
  assert.equal(accepts('GET', '/api/agents/send-email', null, undefined), false);
});

test('browser-public and server cron credentials must never alias for query bypass', () => {
  const endpoint = '/api/agents/send-email';
  // All tokens below are synthetic test values.
  assert.equal(accepts('GET', endpoint, secret, secret, secret), false);
  assert.equal(accepts('GET', endpoint, secret, secret, 'other-public-synthetic'), true);
  assert.equal(accepts('GET', endpoint, secret, secret, undefined), true);
  assert.equal(accepts('GET', endpoint, secret, secret, ''), true);
  assert.equal(accepts('POST', endpoint, secret, secret, 'other-public-synthetic'), false);
});
