#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const RECONCILIATION = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const FUNCTIONS = ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10'];
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

function parseCsv(text, label) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let quotedFieldClosed = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
          quotedFieldClosed = true;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      if (field.length > 0 || quotedFieldClosed) {
        throw new Error(`${label}: unexpected quote inside unquoted CSV field at character ${i + 1}`);
      }
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
      quotedFieldClosed = false;
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      quotedFieldClosed = false;
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else {
      if (quotedFieldClosed) {
        throw new Error(`${label}: unexpected character after closing CSV quote at character ${i + 1}`);
      }
      field += ch;
    }
  }

  if (inQuotes) throw new Error(`${label}: unterminated quoted CSV field`);
  if (field.length > 0 || row.length > 0 || quotedFieldClosed) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function normalize(value = '') {
  return String(value).replace(/[`*_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function reconciliationMap(text, label = RECONCILIATION) {
  const parsed = parseCsv(text, label);
  if (parsed.length < 2) throw new Error(`${label}: empty reconciliation CSV`);
  const headers = parsed[0].map((value) => String(value).trim().toLowerCase());
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    throw new Error(`${label}: duplicate header(s): ${[...new Set(duplicateHeaders)].join(', ')}`);
  }
  const required = [
    'kost_question_id',
    'function',
    'current_individual_fr_status_bucket',
    'current_individual_fr_status_full_text',
    'reason',
    'next_action',
  ];
  const index = new Map(headers.map((header, i) => [header, i]));
  for (const header of required) {
    if (!index.has(header)) throw new Error(`${label}: missing required header ${header}`);
  }

  const byId = new Map();
  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    const csvRow = i + 1;
    if (values.length !== headers.length) {
      throw new Error(`${label}: CSV row ${csvRow} has ${values.length} columns; expected ${headers.length}`);
    }
    const id = normalize(values[index.get('kost_question_id')] ?? '').toUpperCase();
    if (!id) throw new Error(`${label}: CSV row ${csvRow} is non-empty but kost_question_id is blank`);
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/.test(id)) {
      throw new Error(`${label}: invalid question id at CSV row ${csvRow}: ${id}`);
    }
    if (byId.has(id)) throw new Error(`${label}: duplicate question id ${id}`);
    byId.set(id, {
      function: normalize(values[index.get('function')] ?? ''),
      bucket: normalize(values[index.get('current_individual_fr_status_bucket')] ?? '').toUpperCase(),
      full: normalize(values[index.get('current_individual_fr_status_full_text')] ?? ''),
      evidenceText: values.map((value) => String(value ?? '')).join('\n'),
    });
  }
  return byId;
}

function classifyStatus(text) {
  const status = normalize(text).toUpperCase();
  if (!status) return 'MISSING';
  if (/\b(?:TIER[ _]A[ _]PROVENANCE[ _]UNRESOLVED|SOURCE[ _]GAP[ _]UNRESOLVED|DIRECT[ _]ITEM[ _]EVIDENCE[ _]REQUIRED)\b/.test(status)) return 'UNRESOLVED';
  if (/^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/.test(status)) return 'FROZEN';
  if (/\bSOURCE GAP\b/.test(status)) return 'GAP';
  if (/\bCONFLICT\b/.test(status)) return 'CONFLICT';
  if (/^DRAFT\b/.test(status) || /\bTIER B ONLY\b/.test(status)) return 'DRAFT';
  return 'OTHER';
}

function expectedClass(row) {
  const terminal = row.bucket === 'FROZEN' || row.bucket === 'GAP'
    || /^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/i.test(row.full)
    || /FR SOURCE GAP CONFIRMED/i.test(row.full);
  const missingDirectEvidence = MISSING_DIRECT_EVIDENCE_PATTERNS.some(
    (pattern) => pattern.test(row.evidenceText ?? ''),
  );
  if (terminal && missingDirectEvidence) return 'UNRESOLVED';
  if (row.bucket === 'FROZEN') return 'FROZEN';
  if (row.bucket === 'GAP') return 'GAP';
  if (row.bucket.includes('CONFLICT')) return 'CONFLICT';
  if (row.bucket === 'DRAFT') return 'DRAFT';
  const fromFull = classifyStatus(row.full);
  if (fromFull !== 'OTHER' && fromFull !== 'MISSING') return fromFull;
  return `UNKNOWN:${row.bucket || row.full || 'EMPTY'}`;
}

function parsePackage(text, artifact) {
  const headingRe = /^###\s+(Q-7\.(?:10|[1-9])-\d{3})\b.*$/gim;
  const matches = [...String(text).matchAll(headingRe)];
  const items = [];
  const seen = new Set();
  const errors = [];

  for (let i = 0; i < matches.length; i += 1) {
    const id = matches[i][1].toUpperCase();
    const start = matches[i].index ?? 0;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? text.length : text.length;
    const block = text.slice(start, end);
    if (seen.has(id)) {
      errors.push(`${artifact}: duplicate item heading ${id}`);
      continue;
    }
    seen.add(id);
    const statusMatches = [...block.matchAll(/(?:^|\n)\s*-?\s*\*\*FR status:\*\*\s*`([^`\n]+)`/gi)];
    if (statusMatches.length !== 1) {
      errors.push(`${artifact}: ${id}: expected exactly one per-item **FR status:** backtick field, found ${statusMatches.length}`);
      continue;
    }
    items.push({ id, status: normalize(statusMatches[0][1]) });
  }
  if (matches.length === 0) errors.push(`${artifact}: no Q-7.x item headings found`);
  return { items, errors };
}

export function validatePackageAgainstReconciliation(packageText, functionId, reconciliation, artifact = `package-${functionId}.md`) {
  const { items, errors } = parsePackage(packageText, artifact);
  const expectedPrefix = `Q-${functionId}-`;
  const packageIds = new Set(items.map((item) => item.id));

  for (const id of reconciliation.keys()) {
    if (id.startsWith(expectedPrefix) && !packageIds.has(id)) {
      errors.push(`${artifact}: missing current reconciliation item ${id}`);
    }
  }

  for (const item of items) {
    if (!item.id.startsWith(expectedPrefix)) {
      errors.push(`${artifact}: ${item.id}: item function does not match package Function ${functionId}`);
      continue;
    }
    const row = reconciliation.get(item.id);
    if (!row) {
      errors.push(`${artifact}: ${item.id}: missing from current per-item reconciliation`);
      continue;
    }
    if (row.function !== functionId) {
      errors.push(`${artifact}: ${item.id}: reconciliation Function ${row.function || '(missing)'} does not match ${functionId}`);
    }
    const expected = expectedClass(row);
    const actual = classifyStatus(item.status);
    if (expected.startsWith('UNKNOWN:')) {
      errors.push(`${artifact}: ${item.id}: unsupported canonical FR status bucket/full text (${expected.slice(8)})`);
      continue;
    }
    if (actual !== expected) {
      errors.push(`${artifact}: ${item.id}: stale FR status mirror — package=${actual} (${item.status}); effective reconciliation=${expected} (${row.full || row.bucket})`);
    }
  }
  return errors;
}

function fixtureCsv(rows) {
  return [
    'KOST_Question_ID,Function,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Reason,Next_Action',
    ...rows,
  ].join('\n');
}

function fixturePackage(functionId, rows) {
  return [
    `# EN package ${functionId}`,
    ...rows.flatMap(([id, status]) => [
      `### ${id} — fixture`,
      `- **FR status:** \`${status}\``,
      '- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`',
      '- **Approval:** `PENDING REVIEWER + DATE`',
    ]),
  ].join('\n');
}

function expect(name, errors, shouldFail) {
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(' | ')}`);
  }
}

function expectReconciliationFailure(name, csv, pattern) {
  let rejected = false;
  try {
    reconciliationMap(csv, `${name}.csv`);
  } catch (error) {
    rejected = pattern.test(error.message);
  }
  if (!rejected) throw new Error(`${name}: malformed reconciliation CSV was not rejected as expected`);
}

function fixtures() {
  const fixtureHeader = 'KOST_Question_ID,Function,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Reason,Next_Action';
  expectReconciliationFailure(
    'quote-inside-unquoted-field-fails',
    `${fixtureHeader}\nQ-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct evid"ence,Next action`,
    /unexpected quote inside unquoted csv field/i,
  );
  expectReconciliationFailure(
    'trailing-text-after-quoted-field-fails',
    `${fixtureHeader}\nQ-7.2-001,7.2,FROZEN,"FROZEN FR / SOURCE VERIFIED"BROKEN,Direct evidence,Next action`,
    /unexpected character after closing csv quote/i,
  );
  expectReconciliationFailure(
    'duplicate-header-fails',
    `${fixtureHeader},Reason\nQ-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct evidence,Next action,Duplicate`,
    /duplicate header/i,
  );
  expectReconciliationFailure(
    'blank-id-row-fails',
    `${fixtureHeader}\n,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct evidence,Next action`,
    /kost_question_id is blank/i,
  );
  expectReconciliationFailure(
    'short-row-fails',
    `${fixtureHeader}\nQ-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct evidence`,
    /has 5 columns; expected 6/i,
  );
  expectReconciliationFailure(
    'long-row-fails',
    `${fixtureHeader}\nQ-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct evidence,Next action,EXTRA`,
    /has 7 columns; expected 6/i,
  );

  const reconciliation = reconciliationMap(
    fixtureCsv([
      'Q-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,Direct item-specific Bookshelf check performed,Import-eligible after reviewer sign-off',
      'Q-7.2-002,7.2,GAP,FR SOURCE GAP CONFIRMED — DGR silent by design,Direct item-specific current-DGR search performed,Retain Tier B only',
      'Q-7.2-003,7.2,DRAFT,DRAFT — Tier B only,Direct evidence pending,Obtain direct evidence',
      "Q-7.2-004,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED,This item's own specific citation was not independently re-read this pass,Direct item evidence required",
    ]),
    'fixture.csv',
  );
  const completePackage = [
    ['Q-7.2-001', 'FROZEN FR / SOURCE VERIFIED'],
    ['Q-7.2-002', 'FR SOURCE GAP CONFIRMED — DGR silent by design'],
    ['Q-7.2-003', 'DRAFT — Tier B only'],
    ['Q-7.2-004', 'TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED'],
  ];
  expect('current-mixed-statuses-pass', validatePackageAgainstReconciliation(
    fixturePackage('7.2', completePackage), '7.2', reconciliation, 'fixture.md'), false);
  expect('omitted-current-item-fails', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-001', 'FROZEN FR / SOURCE VERIFIED'],
    ['Q-7.2-002', 'FR SOURCE GAP CONFIRMED — DGR silent by design'],
    ['Q-7.2-003', 'DRAFT — Tier B only'],
  ]), '7.2', reconciliation, 'fixture.md'), true);
  expect('stale-draft-over-frozen-fails', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-001', 'DRAFT — Tier B only, SOURCE REQUIRED for Tier A'],
  ]), '7.2', reconciliation, 'fixture.md'), true);
  expect('stale-draft-over-gap-fails', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-002', 'DRAFT — Tier B only'],
  ]), '7.2', reconciliation, 'fixture.md'), true);
  expect('missing-direct-evidence-requires-unresolved-mirror', validatePackageAgainstReconciliation(
    fixturePackage('7.2', completePackage), '7.2', reconciliation, 'fixture.md'), false);
  expect('missing-direct-evidence-rejects-frozen-mirror', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-004', 'FROZEN FR / SOURCE VERIFIED'],
  ]), '7.2', reconciliation, 'fixture.md'), true);
  expect('missing-fr-status-fails', validatePackageAgainstReconciliation(
    '### Q-7.2-001 — fixture\n- **EN status:** `BILINGUAL TECHNICAL REVIEW REQUIRED`',
    '7.2', reconciliation, 'fixture.md'), true);
  expect('wrong-function-fails', validatePackageAgainstReconciliation(fixturePackage('7.3', [
    ['Q-7.2-001', 'FROZEN FR / SOURCE VERIFIED'],
  ]), '7.3', reconciliation, 'fixture.md'), true);
  console.log('DGR EN-package FR-status mirror regression fixtures: PASS');
}

function repositoryCheck() {
  const root = process.cwd();
  const reconciliationPath = path.join(root, RECONCILIATION);
  if (!fs.existsSync(reconciliationPath)) {
    console.error(`ERROR: missing ${RECONCILIATION}`);
    process.exit(1);
  }
  let reconciliation;
  try {
    reconciliation = reconciliationMap(fs.readFileSync(reconciliationPath, 'utf8'));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
  const errors = [];
  for (const functionId of FUNCTIONS) {
    const artifact = `docs/DGR_EN_REVIEW_PACKAGE_${functionId}.md`;
    const absolute = path.join(root, artifact);
    if (!fs.existsSync(absolute)) {
      errors.push(`${artifact}: missing controlled EN review package`);
      continue;
    }
    errors.push(...validatePackageAgainstReconciliation(
      fs.readFileSync(absolute, 'utf8'), functionId, reconciliation, artifact));
  }
  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR EN-PACKAGE FR-STATUS MIRROR CHECK: FAIL (${errors.length} issue(s))`);
    console.error('EN review packages must include every current per-item reconciliation ID for their function and may preserve independent EN-review states, but duplicated FR status must mirror the effective current per-item state. Explicit admissions of missing direct current-DGR evidence force an UNRESOLVED mirror rather than a terminal FROZEN/GAP label. This gate never promotes EN review or regulatory approval.');
    process.exit(1);
  }
  console.log('DGR EN-PACKAGE FR-STATUS MIRROR CHECK: PASS');
  console.log('PASS means every current per-item reconciliation ID is represented and duplicated FR status labels in EN packages match the effective current per-item state only; it does not prove Tier-A correctness, bilingual equivalence, reviewer qualification, or approval.');
}

if (process.argv.includes('--test')) fixtures();
else repositoryCheck();
