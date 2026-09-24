#!/usr/bin/env node

/**
 * Fail-closed promotion guard for DGR/CBTA Functions 7.1–7.10.
 *
 * An operational V2 import row must never be IMPORT_ELIGIBLE=YES while its
 * current FR/import or reconciliation status still carries an explicit
 * unresolved source state such as SOURCE GAP or SOURCE CONFLICT. Historical
 * OLD STATUS prose is excluded, but the latest explicit NEW STATUS in a
 * reconciliation block is authoritative and must not be ignored.
 *
 * This guard checks status semantics only; it does not decide regulatory
 * correctness, reproduce licensed IATA text, or approve any question.
 */

import fs from 'node:fs';
import path from 'node:path';

const RECONCILIATION = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const IMPORT_CANDIDATES = 'docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv';

const UNRESOLVED_SOURCE_STATE = /\b(?:SOURCE\s+GAP|SOURCE\s+CONFLICT|PARTIALLY\s+CONFIRMED|SOURCE\s+REQUIRED|NOT\s+YET\s+VERIFIED|DRAFT)\b/i;
const UNRESOLVED_BUCKET = /^(?:GAP|CONFLICT|SOURCE\s+GAP|SOURCE\s+CONFLICT)\b/i;
const RECONCILIATION_MARKER_RE = /(?:^|\r?\n)\s*\*\*Reconciliation\b/gi;
const NEW_STATUS_RE = /\bNEW\s+STATUS\s*:\s*([^\r\n]*?)(?=(?:[.;]\s*(?:SOURCE|RATIONALE|EVIDENCE|BASIS|NOTE)\s*:)|\b(?:OLD|NEW)\s+STATUS\s*:|$)/gi;

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

function tableFromCsv(text, label, idHeader, requiredHeaders) {
  const parsed = parseCsv(text, label);
  if (parsed.length === 0) throw new Error(`${label}: empty CSV`);

  const headers = parsed[0].map((value) => value.trim().toLowerCase());
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label}: duplicate header(s): ${[...new Set(duplicates)].join(', ')}`);
  }

  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  for (const header of [idHeader, ...requiredHeaders]) {
    if (!indexByHeader.has(header)) throw new Error(`${label}: missing required header ${header}`);
  }

  const idIndex = indexByHeader.get(idHeader);
  const rows = [];
  const byId = new Map();
  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    if (values.length !== headers.length) {
      throw new Error(`${label}: CSV row ${i + 1} has ${values.length} column(s), expected ${headers.length}`);
    }
    const id = (values[idIndex] ?? '').trim().toUpperCase();
    if (!id) continue;
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/.test(id)) {
      throw new Error(`${label}: invalid question id at CSV row ${i + 1}: ${id}`);
    }
    if (byId.has(id)) throw new Error(`${label}: duplicate question id: ${id}`);
    const record = { id, values, rowNumber: i + 1 };
    rows.push(record);
    byId.set(id, record);
  }

  return { rows, byId, indexByHeader };
}

function valueFor(table, row, header) {
  const index = table.indexByHeader.get(header);
  return index === undefined ? '' : (row.values[index] ?? '').trim();
}

function currentStatusSegment(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';

  const markers = [...text.matchAll(RECONCILIATION_MARKER_RE)];
  if (markers.length === 0) return text;

  const latestMarker = markers[markers.length - 1];
  const latestBlock = text.slice(latestMarker.index ?? 0);
  const newStatuses = [...latestBlock.matchAll(NEW_STATUS_RE)];
  if (newStatuses.length > 0) {
    return String(newStatuses[newStatuses.length - 1][1] ?? '').trim();
  }

  // A reconciliation block with no explicit NEW STATUS is ambiguous. Inspect
  // the block itself rather than blindly trusting the pre-reconciliation text.
  // This is fail-closed for import promotion while still excluding OLD STATUS
  // whenever a later authoritative NEW STATUS is actually recorded.
  return latestBlock.trim();
}

function unresolvedCurrentState(value) {
  return UNRESOLVED_SOURCE_STATE.test(currentStatusSegment(value));
}

function findViolations(reconciliationText, importText) {
  const reconciliation = tableFromCsv(
    reconciliationText,
    RECONCILIATION,
    'kost_question_id',
    [
      'current_individual_fr_status_bucket',
      'current_individual_fr_status_full_text',
      'final_reconciled_status',
    ],
  );
  const imports = tableFromCsv(
    importText,
    IMPORT_CANDIDATES,
    'kost_id',
    ['fr_status', 'import_eligible'],
  );

  const violations = [];
  for (const importRow of imports.rows) {
    const eligibility = valueFor(imports, importRow, 'import_eligible').toUpperCase();
    if (eligibility !== 'YES' && eligibility !== 'NO') {
      violations.push({ id: importRow.id, reason: `invalid IMPORT_ELIGIBLE value: ${eligibility || '(empty)'}` });
      continue;
    }
    if (eligibility !== 'YES') continue;

    const importFrStatus = valueFor(imports, importRow, 'fr_status');
    if (unresolvedCurrentState(importFrStatus)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES while current import FR_STATUS is unresolved: ${currentStatusSegment(importFrStatus)}`,
      });
    }

    const reconciliationRow = reconciliation.byId.get(importRow.id);
    if (!reconciliationRow) {
      violations.push({ id: importRow.id, reason: 'IMPORT_ELIGIBLE=YES but no reconciliation row exists' });
      continue;
    }

    const bucket = valueFor(reconciliation, reconciliationRow, 'current_individual_fr_status_bucket');
    const currentFull = valueFor(reconciliation, reconciliationRow, 'current_individual_fr_status_full_text');
    const finalStatus = valueFor(reconciliation, reconciliationRow, 'final_reconciled_status');

    if (UNRESOLVED_BUCKET.test(bucket) || unresolvedCurrentState(bucket)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES while reconciliation FR status bucket is unresolved: ${bucket || '(missing)'}`,
      });
    }
    if (unresolvedCurrentState(currentFull)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES while reconciliation current FR status is unresolved: ${currentStatusSegment(currentFull)}`,
      });
    }
    if (unresolvedCurrentState(finalStatus)) {
      violations.push({
        id: importRow.id,
        reason: `IMPORT_ELIGIBLE=YES while final reconciliation status is unresolved: ${currentStatusSegment(finalStatus)}`,
      });
    }
  }

  return violations;
}

function runSelfTest() {
  const reconciliationHeader = 'KOST_Question_ID,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Final_Reconciled_Status';
  const importHeader = 'KOST_ID,FR_STATUS,IMPORT_ELIGIBLE';

  const safeReconciliation = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED",FROZEN\r\n`;
  const safeImport = `${importHeader}\r\nQ-7.10-001,"FROZEN FR / SOURCE VERIFIED",YES\r\n`;
  if (findViolations(safeReconciliation, safeImport).length !== 0) {
    throw new Error('Regression fixture failed: clean FROZEN import state was rejected.');
  }

  const conflictImport = safeImport.replace(
    '"FROZEN FR / SOURCE VERIFIED"',
    '"FROZEN FR / SOURCE VERIFIED — SOURCE CONFLICT"',
  );
  if (!findViolations(safeReconciliation, conflictImport).some((v) => /current import FR_STATUS is unresolved/i.test(v.reason))) {
    throw new Error('Regression fixture failed: SOURCE CONFLICT hidden behind a FROZEN import prefix was accepted.');
  }

  const conflictFinal = safeReconciliation.replace(',FROZEN\r\n', ',"FROZEN — SOURCE CONFLICT"\r\n');
  if (!findViolations(conflictFinal, safeImport).some((v) => /final reconciliation status is unresolved/i.test(v.reason))) {
    throw new Error('Regression fixture failed: SOURCE CONFLICT hidden behind a FROZEN final-status prefix was accepted.');
  }

  const gapBucket = safeReconciliation.replace(',FROZEN,"FROZEN FR / SOURCE VERIFIED",', ',GAP,"FR SOURCE GAP CONFIRMED",');
  const gapViolations = findViolations(gapBucket, safeImport);
  if (!gapViolations.some((v) => /FR status bucket is unresolved/i.test(v.reason))) {
    throw new Error('Regression fixture failed: GAP reconciliation bucket was accepted for an import-eligible row.');
  }

  const historicalResolvedReconciliation = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-08-29):** OLD STATUS: DRAFT — SOURCE REQUIRED for Tier A. NEW STATUS: FROZEN FR / SOURCE VERIFIED",FROZEN\r\n`;
  const historicalResolvedImport = `${importHeader}\r\nQ-7.10-001,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-08-29):** OLD STATUS: STALE CITATION / SOURCE CONFLICT. NEW STATUS: FROZEN FR / SOURCE VERIFIED",YES\r\n`;
  if (findViolations(historicalResolvedReconciliation, historicalResolvedImport).length !== 0) {
    throw new Error('Regression fixture failed: resolved historical OLD STATUS prose was misclassified as current unresolved state.');
  }

  const resolvedWithHistoricalRationale = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-09-24):** OLD STATUS: SOURCE CONFLICT. NEW STATUS: FROZEN FR / SOURCE VERIFIED. SOURCE: direct current-edition evidence. RATIONALE: prior SOURCE CONFLICT resolved by the new check.",FROZEN\r\n`;
  if (findViolations(resolvedWithHistoricalRationale, safeImport).length !== 0) {
    throw new Error('Regression fixture failed: metadata after a resolved NEW STATUS was misclassified as the current status.');
  }

  const latestConflictReconciliation = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-09-24):** OLD STATUS: FROZEN FR / SOURCE VERIFIED. NEW STATUS: SOURCE CONFLICT — direct Tier-A evidence requires re-check. SOURCE: current reconciliation pass.",FROZEN\r\n`;
  const latestConflictViolations = findViolations(latestConflictReconciliation, safeImport);
  if (!latestConflictViolations.some((v) => /reconciliation current FR status is unresolved/i.test(v.reason))) {
    throw new Error('Regression fixture failed: latest NEW STATUS=SOURCE CONFLICT was hidden by stale pre-reconciliation FROZEN prose.');
  }

  const multiReconciliation = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-09-22):** OLD STATUS: FROZEN. NEW STATUS: SOURCE CONFLICT.\n\n**Reconciliation (2026-09-24):** OLD STATUS: SOURCE CONFLICT. NEW STATUS: FROZEN FR / SOURCE VERIFIED",FROZEN\r\n`;
  if (findViolations(multiReconciliation, safeImport).length !== 0) {
    throw new Error('Regression fixture failed: the latest resolved NEW STATUS did not supersede an older reconciliation conflict.');
  }

  const ambiguousReconciliation = `${reconciliationHeader}\r\nQ-7.10-001,FROZEN,"FROZEN FR / SOURCE VERIFIED.\n\n**Reconciliation (2026-09-24):** SOURCE CONFLICT requires owner review before a NEW STATUS is recorded",FROZEN\r\n`;
  if (!findViolations(ambiguousReconciliation, safeImport).some((v) => /reconciliation current FR status is unresolved/i.test(v.reason))) {
    throw new Error('Regression fixture failed: reconciliation block without NEW STATUS was treated as safely resolved.');
  }

  const supersededStaleCitation = safeImport.replace(
    '"FROZEN FR / SOURCE VERIFIED"',
    '"FROZEN FR / SOURCE VERIFIED — wording corrected, stale KOST citation superseded"',
  );
  if (findViolations(safeReconciliation, supersededStaleCitation).length !== 0) {
    throw new Error('Regression fixture failed: explicitly superseded stale citation was misclassified as unresolved.');
  }

  const heldImport = conflictImport.replace(',YES\r\n', ',NO\r\n');
  if (findViolations(safeReconciliation, heldImport).length !== 0) {
    throw new Error('Regression fixture failed: truthful non-importable SOURCE CONFLICT state was rejected.');
  }

  console.log('PASS: unresolved SOURCE GAP/CONFLICT current-state import regression fixtures');
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
  console.error(`ERROR: unresolved source-state import check could not parse controlled artifacts: ${error.message}`);
  process.exit(1);
}

if (violations.length > 0) {
  console.error('ERROR: unresolved current DGR source states are not eligible for V2 import.');
  for (const violation of violations) console.error(` - ${violation.id}: ${violation.reason}`);
  console.error('Keep SOURCE GAP/SOURCE CONFLICT items on explicit hold until the conflict/gap is genuinely resolved and current-source evidence supports promotion.');
  process.exit(1);
}

console.log('PASS: no V2 import-eligible row carries an explicit unresolved current SOURCE GAP/CONFLICT state.');
