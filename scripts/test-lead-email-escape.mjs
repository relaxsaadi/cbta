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

// #406 privacy regression: never emit untrusted provider payloads or prospect
// contact fields through request diagnostics, even after a failed DB insert.
assert.match(
  route, /supabasePersisted:\s*!error/,
  'the diagnostic must report DB persistence truthfully'
);
assert.doesNotMatch(
  route, /console\.info\([^\n]*\{\s*email\b/,
  'do not log prospect email at request completion'
);
assert.doesNotMatch(
  route, /console\.error\([^\n]*error\.message/,
  'DB error details may disclose personal data'
);
assert.doesNotMatch(
  route, /console\.error\([^\n]*ghlData/,
  'GHL response bodies may disclose personal data'
);
assert.doesNotMatch(
  route, /console\.info\([^\n]*ghlData/,
  'do not log provider contact identifiers'
);
assert.doesNotMatch(
  route, /await ghlRes\.json\(\)/,
  'do not parse unused provider response bodies solely for logging'
);
console.log('Lead PII-safe diagnostics regression: PASS');
