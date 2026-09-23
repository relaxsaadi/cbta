#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const RECONCILIATION = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const FUNCTIONS = ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10'];

function parseCsv(text, label) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else field += ch;
  }

  if (inQuotes) throw new Error(`${label}: unterminated quoted CSV field`);
  if (field.length > 0 || row.length > 0) {
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
  const required = [
    'kost_question_id',
    'function',
    'current_individual_fr_status_bucket',
    'current_individual_fr_status_full_text',
  ];
  const index = new Map(headers.map((header, i) => [header, i]));
  for (const header of required) {
    if (!index.has(header)) throw new Error(`${label}: missing required header ${header}`);
  }

  const byId = new Map();
  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    const id = normalize(values[index.get('kost_question_id')] ?? '').toUpperCase();
    if (!id) continue;
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/.test(id)) {
      throw new Error(`${label}: invalid question id at CSV row ${i + 1}: ${id}`);
    }
    if (byId.has(id)) throw new Error(`${label}: duplicate question id ${id}`);
    byId.set(id, {
      function: normalize(values[index.get('function')] ?? ''),
      bucket: normalize(values[index.get('current_individual_fr_status_bucket')] ?? '').toUpperCase(),
      full: normalize(values[index.get('current_individual_fr_status_full_text')] ?? ''),
    });
  }
  return byId;
}

function classifyStatus(text) {
  const status = normalize(text).toUpperCase();
  if (!status) return 'MISSING';
  if (/^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/.test(status)) return 'FROZEN';
  if (/\bSOURCE GAP\b/.test(status)) return 'GAP';
  if (/\bCONFLICT\b/.test(status)) return 'CONFLICT';
  if (/^DRAFT\b/.test(status) || /\bTIER B ONLY\b/.test(status)) return 'DRAFT';
  return 'OTHER';
}

function expectedClass(row) {
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
      errors.push(`${artifact}: ${item.id}: stale FR status mirror — package=${actual} (${item.status}); reconciliation=${expected} (${row.full || row.bucket})`);
    }
  }
  return errors;
}

function fixtureCsv(rows) {
  return [
    'KOST_Question_ID,Function,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text',
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

function fixtures() {
  const reconciliation = reconciliationMap(
    fixtureCsv([
      'Q-7.2-001,7.2,FROZEN,FROZEN FR / SOURCE VERIFIED',
      'Q-7.2-002,7.2,GAP,FR SOURCE GAP CONFIRMED — DGR silent by design',
      'Q-7.2-003,7.2,DRAFT,DRAFT — Tier B only',
    ]),
    'fixture.csv',
  );
  expect('current-mixed-statuses-pass', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-001', 'FROZEN FR / SOURCE VERIFIED'],
    ['Q-7.2-002', 'FR SOURCE GAP CONFIRMED — DGR silent by design'],
    ['Q-7.2-003', 'DRAFT — Tier B only'],
  ]), '7.2', reconciliation, 'fixture.md'), false);
  expect('stale-draft-over-frozen-fails', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-001', 'DRAFT — Tier B only, SOURCE REQUIRED for Tier A'],
  ]), '7.2', reconciliation, 'fixture.md'), true);
  expect('stale-draft-over-gap-fails', validatePackageAgainstReconciliation(fixturePackage('7.2', [
    ['Q-7.2-002', 'DRAFT — Tier B only'],
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
    console.error('EN review packages may preserve independent EN-review states, but any duplicated FR status must mirror the current per-item reconciliation. This gate never promotes EN review or regulatory approval.');
    process.exit(1);
  }

  console.log('DGR EN-PACKAGE FR-STATUS MIRROR CHECK: PASS');
  console.log('PASS means duplicated FR status labels in EN packages match current reconciliation buckets only; it does not prove Tier-A correctness, bilingual equivalence, reviewer qualification, or approval.');
}

if (process.argv.includes('--test')) fixtures();
else repositoryCheck();
