#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const TARGET = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const SAMPLE_ONLY_PHRASES = [
  "this item's own specific citation was not independently re-read",
  'representative sample of this citation pattern',
];

function rowsFromCsvText(text) {
  const starts = [...text.matchAll(/(?:^|\r?\n)(Q-7\.\d+-\d{3}),/gm)].map((m) => ({
    id: m[1],
    index: m.index + (m[0].startsWith('\n') || m[0].startsWith('\r\n') ? m[0].length - m[1].length - 1 : 0),
  }));

  // Use the question-ID matches only as durable row boundaries. The CSV contains
  // quoted multiline fields, so a naive split on newlines is not safe.
  return starts.map((entry, i) => {
    const start = text.indexOf(entry.id + ',', entry.index);
    const end = i + 1 < starts.length
      ? text.indexOf(starts[i + 1].id + ',', start + entry.id.length + 1)
      : text.length;
    return { id: entry.id, raw: text.slice(start, end) };
  });
}

function findViolations(text) {
  const rows = rowsFromCsvText(text);
  const violations = [];

  for (const { id, raw } of rows) {
    const lower = raw.toLowerCase();
    const sampledOnly = SAMPLE_ONLY_PHRASES.every((phrase) => lower.includes(phrase));
    const claimsFrozen = /,FROZEN,/.test(raw) || /FROZEN FR \/ SOURCE VERIFIED/i.test(raw);
    const claimsImportEligible = /Import-eligible for V2/i.test(raw);

    if (sampledOnly && (claimsFrozen || claimsImportEligible)) {
      violations.push({ id, claimsFrozen, claimsImportEligible });
    }
  }

  return violations;
}

function runSelfTest() {
  const sampled = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.8-047,7.8,FROZEN,"FROZEN FR / SOURCE VERIFIED. A representative sample of this citation pattern was independently spot-verified. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const direct = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.8-048,7.8,FROZEN,"FROZEN FR / SOURCE VERIFIED. Live Bookshelf check performed directly for this item's tested claim.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;

  const sampledViolations = findViolations(sampled);
  const directViolations = findViolations(direct);

  if (sampledViolations.length !== 1 || sampledViolations[0].id !== 'Q-7.8-047') {
    throw new Error('Regression fixture failed: sampled-only FROZEN row was not rejected.');
  }
  if (directViolations.length !== 0) {
    throw new Error('Regression fixture failed: direct item-specific evidence was incorrectly rejected.');
  }

  console.log('PASS: direct Tier-A provenance regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const root = process.cwd();
const targetPath = path.join(root, TARGET);
if (!fs.existsSync(targetPath)) {
  console.error(`ERROR: missing required reconciliation artifact: ${TARGET}`);
  process.exit(1);
}

const text = fs.readFileSync(targetPath, 'utf8');
const violations = findViolations(text);

if (violations.length > 0) {
  console.error('ERROR: sampled-only Tier-A provenance is being treated as direct source verification/import eligibility.');
  for (const v of violations) {
    console.error(` - ${v.id}: direct item-specific current-DGR evidence required before FROZEN/import-eligible readiness status.`);
  }
  console.error('See docs/DGR_TIER_A_DIRECT_EVIDENCE_CORRECTION_2026-09-22.md.');
  process.exit(1);
}

console.log('PASS: no sampled-only Tier-A promotions detected in per-item reconciliation.');
