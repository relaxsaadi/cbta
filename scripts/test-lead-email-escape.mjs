// Regression guard for a user-controlled source field in Resend HTML.
// Run: node scripts/test-lead-email-escape.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(
  new URL('../app/api/leads/route.ts', import.meta.url),
  'utf8'
);

// Source is supplied by an unauthenticated caller; never interpolate it raw
// into the notification's HTML body.
assert.match(
  route,
  /Source<\/td><td>\$\{escapeHtml\(source \|\| 'direct'\)\}<\/td>/,
  'Resend email source must be HTML-escaped'
);
assert.doesNotMatch(
  route,
  /Source<\/td><td>\$\{source \|\| 'direct'\}/,
  'Unescaped source would allow HTML injection into internal notifications'
);
console.log('Lead email HTML source-escaping regression: PASS');
