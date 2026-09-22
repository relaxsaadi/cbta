#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const TARGET = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';

// A row cannot claim direct Tier-A closure — including a confirmed current-DGR
// absence/source-gap conclusion — if its own durable text admits that the
// item's specific current-DGR citation/search was not independently performed.
// Keep these predicates intentionally one-way: they only detect explicit
// admissions of missing direct evidence; they never infer approval, a source
// gap, or regulatory correctness from a citation or batch/sample statement.
const MISSING_DIRECT_EVIDENCE_PATTERNS = [
  /this item's own specific citation was not independently re-read/i,
  /this item's own specific citation was not independently read/i,
  /specific current-dgr citation was not independently re-read/i,
  /specific current-dgr citation was not independently read/i,
  /own specific citation was not independently re-read/i,
  /own specific citation was not independently read/i,
  /not independently re-searched/i,
  /not independently searched/i,
  /not re-searched from scratch/i,
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
    const missingDirectEvidence = MISSING_DIRECT_EVIDENCE_PATTERNS.some((pattern) => pattern.test(raw));
    const claimsFrozen = /,FROZEN,/.test(raw) || /FROZEN FR \/ SOURCE VERIFIED/i.test(raw);
    const claimsImportEligible = /Import-eligible for V2/i.test(raw);
    const claimsConfirmedGap = /,GAP,/.test(raw) && /FR SOURCE GAP CONFIRMED/i.test(raw);

    if (missingDirectEvidence && (claimsFrozen || claimsImportEligible || claimsConfirmedGap)) {
      violations.push({ id, claimsFrozen, claimsImportEligible, claimsConfirmedGap });
    }
  }

  return violations;
}

function runSelfTest() {
  const sampled = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.8-047,7.8,FROZEN,"FROZEN FR / SOURCE VERIFIED. A representative sample of this citation pattern was independently spot-verified. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const missingRepresentativeWording = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.9-004,7.9,FROZEN,"FROZEN FR / SOURCE VERIFIED. This item's own specific citation was not independently re-read during this pass.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const sampledConfirmedGap = `KOST_Question_ID,Function,Subtask,Status,Reason,Next_Action\r\nQ-7.3-017,7.3,0.1.4,GAP,"FR SOURCE GAP CONFIRMED (cross-applied). A representative sample was spot-verified. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern.",Retain Tier B only\r\n`;
  const crossAppliedWithoutSearch = `KOST_Question_ID,Function,Subtask,Status,Reason,Next_Action\r\nQ-7.2-002,7.2,0.1.4,GAP,"FR SOURCE GAP CONFIRMED. Prior Tier-A research from another item is cross-applied here; this item was not re-searched from scratch.",Retain Tier B only\r\n`;
  const direct = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.8-048,7.8,FROZEN,"FROZEN FR / SOURCE VERIFIED. Live Bookshelf check performed directly for this item's tested claim.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const directConfirmedGap = `KOST_Question_ID,Function,Subtask,Status,Reason,Next_Action\r\nQ-7.2-008,7.2,3.4.2,GAP,"FR SOURCE GAP CONFIRMED. This item's tested claim was searched directly in the current DGR 67th Edition 2026 text and no supporting provision was located; searched sections are recorded item-by-item.",Retain Tier B only\r\n`;

  const sampledViolations = findViolations(sampled);
  const missingRepresentativeWordingViolations = findViolations(missingRepresentativeWording);
  const sampledConfirmedGapViolations = findViolations(sampledConfirmedGap);
  const crossAppliedWithoutSearchViolations = findViolations(crossAppliedWithoutSearch);
  const directViolations = findViolations(direct);
  const directConfirmedGapViolations = findViolations(directConfirmedGap);

  if (sampledViolations.length !== 1 || sampledViolations[0].id !== 'Q-7.8-047') {
    throw new Error('Regression fixture failed: sampled-only FROZEN row was not rejected.');
  }
  if (
    missingRepresentativeWordingViolations.length !== 1
    || missingRepresentativeWordingViolations[0].id !== 'Q-7.9-004'
  ) {
    throw new Error('Regression fixture failed: explicit missing-direct-read admission was not rejected.');
  }
  if (
    sampledConfirmedGapViolations.length !== 1
    || sampledConfirmedGapViolations[0].id !== 'Q-7.3-017'
    || !sampledConfirmedGapViolations[0].claimsConfirmedGap
  ) {
    throw new Error('Regression fixture failed: sampled-only confirmed SOURCE GAP row was not rejected.');
  }
  if (
    crossAppliedWithoutSearchViolations.length !== 1
    || crossAppliedWithoutSearchViolations[0].id !== 'Q-7.2-002'
    || !crossAppliedWithoutSearchViolations[0].claimsConfirmedGap
  ) {
    throw new Error('Regression fixture failed: cross-applied confirmed SOURCE GAP without an item-specific search was not rejected.');
  }
  if (directViolations.length !== 0) {
    throw new Error('Regression fixture failed: direct item-specific evidence was incorrectly rejected.');
  }
  if (directConfirmedGapViolations.length !== 0) {
    throw new Error('Regression fixture failed: directly established SOURCE GAP was incorrectly rejected.');
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
  console.error('ERROR: direct Tier-A provenance is missing while the row is treated as source-verified/import-eligible/confirmed-gap.');
  for (const v of violations) {
    const claimedStates = [
      v.claimsFrozen ? 'FROZEN/source-verified' : null,
      v.claimsImportEligible ? 'import-eligible' : null,
      v.claimsConfirmedGap ? 'FR SOURCE GAP CONFIRMED' : null,
    ].filter(Boolean).join(', ');
    console.error(` - ${v.id}: direct item-specific current-DGR evidence required before ${claimedStates} readiness status.`);
  }
  console.error('See docs/DGR_TIER_A_DIRECT_EVIDENCE_CORRECTION_2026-09-22.md.');
  process.exit(1);
}

console.log('PASS: no explicit missing-direct-evidence terminal promotions detected in per-item reconciliation.');
