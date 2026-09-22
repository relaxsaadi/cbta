#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const RECONCILIATION = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const IMPORT_CANDIDATES = 'docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv';

// Keep this explicit-admission policy aligned with
// check-dgr-direct-item-tier-a-provenance.mjs. This downstream gate does not
// infer regulatory correctness; it only prevents the operational import list
// from advertising an item as import-eligible when durable text admits that
// the item's own current-DGR verification/search was not performed.
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

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (inQuotes) throw new Error(`${label}: unterminated quoted CSV field`);
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase();
}

function tableFromCsv(text, label, idHeader) {
  const parsed = parseCsv(text, label);
  if (parsed.length === 0) throw new Error(`${label}: empty CSV`);

  const headers = parsed[0].map(normalizeHeader);
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const idIndex = indexByHeader.get(idHeader);
  if (idIndex === undefined) throw new Error(`${label}: missing required header ${idHeader}`);

  const rows = [];
  const byId = new Map();
  const duplicateIds = [];

  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    const id = (values[idIndex] ?? '').trim();
    if (!id) continue;
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/i.test(id)) {
      throw new Error(`${label}: invalid question id at CSV row ${i + 1}: ${id}`);
    }

    const record = { id, values, rowNumber: i + 1 };
    rows.push(record);
    if (byId.has(id)) duplicateIds.push(id);
    else byId.set(id, record);
  }

  return { rows, byId, duplicateIds: [...new Set(duplicateIds)].sort(), indexByHeader };
}

function valueFor(table, record, header) {
  const index = table.indexByHeader.get(header);
  return index === undefined ? '' : (record.values[index] ?? '').trim();
}

function hasMissingDirectEvidence(text) {
  return MISSING_DIRECT_EVIDENCE_PATTERNS.some((pattern) => pattern.test(text));
}

function findViolations(reconciliationText, importText) {
  const reconciliation = tableFromCsv(
    reconciliationText,
    RECONCILIATION,
    'kost_question_id',
  );
  const imports = tableFromCsv(importText, IMPORT_CANDIDATES, 'kost_id');
  const violations = [];

  if (reconciliation.duplicateIds.length > 0) {
    violations.push({
      id: 'RECONCILIATION_DUPLICATES',
      reason: `duplicate reconciliation IDs: ${reconciliation.duplicateIds.join(', ')}`,
    });
  }
  if (imports.duplicateIds.length > 0) {
    violations.push({
      id: 'IMPORT_DUPLICATES',
      reason: `duplicate import-candidate IDs: ${imports.duplicateIds.join(', ')}`,
    });
  }

  for (const importRow of imports.rows) {
    const eligibility = valueFor(imports, importRow, 'import_eligible').toUpperCase();
    if (eligibility !== 'YES' && eligibility !== 'NO') {
      violations.push({ id: importRow.id, reason: `invalid IMPORT_ELIGIBLE value: ${eligibility || '(empty)'}` });
      continue;
    }
    if (eligibility !== 'YES') continue;

    const blocker = valueFor(imports, importRow, 'blocker');
    if (blocker) {
      violations.push({ id: importRow.id, reason: 'IMPORT_ELIGIBLE=YES while BLOCKER is non-empty' });
    }

    const importFrStatus = valueFor(imports, importRow, 'fr_status');
    if (!/FROZEN FR\s*\/\s*SOURCE VERIFIED/i.test(importFrStatus)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES without FROZEN FR / SOURCE VERIFIED import status (${importFrStatus || 'missing'})`,
      });
    }

    const reconciliationRow = reconciliation.byId.get(importRow.id);
    if (!reconciliationRow) {
      violations.push({ id: importRow.id, reason: 'IMPORT_ELIGIBLE=YES but no per-item reconciliation row exists' });
      continue;
    }

    const reconciliationStatus = valueFor(reconciliation, reconciliationRow, 'status');
    if (reconciliationStatus && !/\bFROZEN\b/i.test(reconciliationStatus)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES but reconciliation status is ${reconciliationStatus}`,
      });
    }

    const evidenceText = [
      ...reconciliationRow.values,
      ...importRow.values,
    ].join('\n');

    if (hasMissingDirectEvidence(evidenceText)) {
      violations.push({
        id: importRow.id,
        reason: 'IMPORT_ELIGIBLE=YES while durable evidence explicitly admits missing item-specific current-DGR verification/search',
      });
    }
  }

  return violations;
}

function runSelfTest() {
  const sampledReconciliation = `KOST_Question_ID,Function,Status,Reason,Next_Action\r\nQ-7.3-040,7.3,FROZEN,"FROZEN FR / SOURCE VERIFIED. A representative sample was spot-verified. This item's own specific citation was not independently re-read this pass.",Import-eligible for V2\r\n`;
  const eligibleImport = `KOST_ID,FUNCTION,FR_STATUS,SOURCE_REFERENCE,FULL_TEXT_RECOVERABLE,CORRECT_ANSWER_RECOVERABLE,IMPORT_ELIGIBLE,BLOCKER\r\nQ-7.3-040,7.3,"FROZEN FR / SOURCE VERIFIED.\nMultiline evidence with a doubled ""quote"" and comma, retained.",§9.6.1,YES,YES,YES,\r\n`;
  const ineligibleImport = eligibleImport.replace(',YES,YES,YES,', ',YES,YES,NO,"direct evidence hold"');
  const directReconciliation = sampledReconciliation.replace(
    "A representative sample was spot-verified. This item's own specific citation was not independently re-read this pass.",
    "Live Bookshelf DGR 67th Edition 2026 check performed directly for this item's tested claim.",
  );
  const unknownImport = eligibleImport.replace(/Q-7\.3-040/g, 'Q-7.3-041');

  const sampled = findViolations(sampledReconciliation, eligibleImport);
  if (!sampled.some((v) => v.id === 'Q-7.3-040' && /missing item-specific/i.test(v.reason))) {
    throw new Error('Regression fixture failed: sampled-only import-eligible row was not rejected.');
  }

  const held = findViolations(sampledReconciliation, ineligibleImport);
  if (held.length !== 0) {
    throw new Error(`Regression fixture failed: truthful import hold was rejected: ${JSON.stringify(held)}`);
  }

  const direct = findViolations(directReconciliation, eligibleImport);
  if (direct.length !== 0) {
    throw new Error(`Regression fixture failed: direct-evidence import row was rejected: ${JSON.stringify(direct)}`);
  }

  const unknown = findViolations(directReconciliation, unknownImport);
  if (!unknown.some((v) => v.id === 'Q-7.3-041' && /no per-item reconciliation row/i.test(v.reason))) {
    throw new Error('Regression fixture failed: import-eligible row without reconciliation evidence was not rejected.');
  }

  console.log('PASS: V2 import-candidate provenance regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const root = process.cwd();
const reconciliationPath = path.join(root, RECONCILIATION);
const importPath = path.join(root, IMPORT_CANDIDATES);

for (const required of [reconciliationPath, importPath]) {
  if (!fs.existsSync(required)) {
    console.error(`ERROR: missing required artifact: ${path.relative(root, required)}`);
    process.exit(1);
  }
}

let violations;
try {
  violations = findViolations(
    fs.readFileSync(reconciliationPath, 'utf8'),
    fs.readFileSync(importPath, 'utf8'),
  );
} catch (error) {
  console.error(`ERROR: import-candidate provenance check could not parse controlled artifacts: ${error.message}`);
  process.exit(1);
}

if (violations.length > 0) {
  console.error('ERROR: V2 import-candidate artifact is not safe as production import authority.');
  for (const violation of violations) {
    console.error(` - ${violation.id}: ${violation.reason}`);
  }
  console.error('Regenerate import eligibility only after direct per-item current-DGR provenance is reconciled.');
  console.error('See docs/DGR_IMPORT_CANDIDATE_PROVENANCE_CORRECTION_2026-09-22.md.');
  process.exit(1);
}

console.log('PASS: every V2 import-eligible row is consistent with direct per-item provenance evidence.');
