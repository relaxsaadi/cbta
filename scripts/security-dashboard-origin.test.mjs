import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isSafeDashboardMutation } from '../lib/dashboard-origin.ts'

const targetOrigin = 'https://dgr.example.test'
const input = (overrides = {}) => ({
  pathname: '/api/agents/send-email',
  method: 'POST',
  requestOrigin: targetOrigin,
  referer: null,
  fetchSite: 'same-origin',
  targetOrigin,
  ...overrides,
})

test('same-origin dashboard API mutations are allowed', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(isSafeDashboardMutation(input({ method })), true, method)
  }
  assert.equal(isSafeDashboardMutation(input({ requestOrigin: null, referer: targetOrigin + '/dashboard/agent' })), true)
  assert.equal(isSafeDashboardMutation(input({ fetchSite: null })), true)
})

test('cross-site and same-site origin spoofing is rejected for mutations', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(isSafeDashboardMutation(input({ method, requestOrigin: 'https://evil.example.test' })), false)
    assert.equal(isSafeDashboardMutation(input({ method, requestOrigin: 'https://other.dgr.example.test' })), false)
  }
  assert.equal(isSafeDashboardMutation(input({ requestOrigin: 'https://evil.example.test', referer: targetOrigin + '/dashboard' })), false)
  for (const fetchSite of ['cross-site', 'same-site', 'none']) {
    assert.equal(isSafeDashboardMutation(input({ fetchSite })), false, fetchSite)
  }
})

test('missing, null, invalid and unrelated origin evidence fails closed', () => {
  for (const requestOrigin of ['null', 'garbage', 'https://attacker.test']) {
    assert.equal(isSafeDashboardMutation(input({ requestOrigin })), false, requestOrigin)
  }
  assert.equal(isSafeDashboardMutation(input({ requestOrigin: null, referer: null })), false)
  assert.equal(isSafeDashboardMutation(input({ requestOrigin: '', referer: '' })), false)
})

test('read-only GET and dashboard page access do not require mutation origin', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    assert.equal(isSafeDashboardMutation(input({ method, requestOrigin: null, fetchSite: 'cross-site' })), true)
  }
  assert.equal(isSafeDashboardMutation(input({ pathname: '/dashboard', requestOrigin: null, fetchSite: 'cross-site' })), true)
})

test('guard is invoked from the successful Basic-auth middleware branch', () => {
  const code = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8')
  const basicValid = code.indexOf('if (suppliedUser === expectedUser && suppliedPass === expectedPass)')
  assert.ok(basicValid > 0, 'authenticated Basic branch must exist')
  const guardedBranch = code.slice(basicValid, basicValid + 700)
  assert.match(guardedBranch, /if \(!isSafeDashboardMutation\(\{/)
  assert.match(guardedBranch, /requestOrigin: req\.headers\.get\('origin'\)/)
  assert.match(guardedBranch, /fetchSite: req\.headers\.get\('sec-fetch-site'\)/)
  assert.match(guardedBranch, /status: 403/)
  assert.ok(code.indexOf("req.method === 'GET'") < basicValid, 'Vercel cron GET exception must remain separate')
})
