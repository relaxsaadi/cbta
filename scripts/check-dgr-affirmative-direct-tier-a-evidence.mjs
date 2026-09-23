#!/usr/bin/env node

/**
 * Fail-closed affirmative per-item Tier-A evidence gate for Functions 7.1–7.10.
 *
 * The older direct-provenance guard rejects rows that explicitly admit missing
 * item-specific evidence. That is necessary but not sufficient: silence about
 * a missing direct read/search is not affirmative proof that one happened.
 *
 * This companion gate therefore requires every reconciliation row that claims
 * a terminal regulatory state (FROZEN/source-verified, import-eligible, or a
 * confirmed current-DGR source gap) to carry durable positive evidence of an
 * item-specific check against the current IATA DGR 67th Edition 2026 source.
 *
 * This script validates governance/provenance metadata only. It does not read
 * or reproduce licensed IATA text, decide regulatory correctness, approve a
 * question, or imply ANAC/IATA approval.
 */

import fs from 'node:fs';
import path from 'node:path';

const TARGET = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const root = process.cwd();

const NON_DIRECT_EVIDENCE_RE = /\brepresentative\s+(?:sample|evidence|spot[- ]?check)\b|\bspot[- ]?verified\s+batch\s+(?:citation|evidence|pattern)\b|\bbatch\s+(?:citation|evidence|pattern)\b|\bcross[- ]?appl(?:ied|y)\b|\bnot\s+independently\s+(?:re[- ]?read|read|verified|checked|searched|re[- ]?searched)\b|\bnot\s+re[- ]?searched\s+from\s+scratch\b|\bfollows?\s+(?:the\s+)?same\s+verified\s+(?:batch\s+)?pattern\b/i;

const DIRECT_ITEM_SIGNAL_RE = /\b(?:live\s+(?:authenticated\s+)?(?:iata\s+)?(?:digital\s+publications\s+)?bookshelf\s+(?:check|read|search)|(?:checked|read|searched|verified|re[- ]?checked|re[- ]?read|re[- ]?searched)\s+directly|direct(?:ly)?\s+(?:checked|read|searched|verified|re[- ]?checked|re[- ]?read|re[- ]?searched)|individually\s+verified|item[- ]specific\s+(?:check|read|search|verification|evidence)|this\s+item(?:'s)?\s+(?:own\s+)?(?:tested\s+claim\s+)?(?:was\s+)?(?:checked|read|searched|verified|re[- ]?checked|re[- ]?read|re[- ]?searched))\b/i;

function normalizeHeader(value) {
  return value.trim().toLowerCase();
}

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

function tableFromCsv(text, label) {
  const parsed = parseCsv(text, label);
  if (parsed.length === 0) throw new Error(`${label}: empty CSV`);

  const headers = parsed[0].map(normalizeHeader);
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label}: duplicate header(s): ${[...new Set(duplicates)].join(', ')}`);
  }

  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const requiredHeaders = [
    'kost_question_id',
    'function',
    'current_individual_fr_status_bucket',
    'current_individual_fr_status_full_text',
    'bookshelf_evidence_found',
    'dgr_reference',
    'evidence_location_file',
    'final_reconciled_status',
    'reason',
    'next_action',
  ];
  for (const header of requiredHeaders) {
    if (!indexByHeader.has(header)) throw new Error(`${label}: missing required header ${header}`);
  }

  const rows = [];
  const seen = new Set();
  const idIndex = indexByHeader.get('kost_question_id');

  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    if (values.length !== headers.length) {
      throw new Error(`${label}: CSV row ${i + 1} has ${values.length} column(s), expected ${headers.length}`);
    }

    const id = (values[idIndex] ?? '').trim();
    if (!id) throw new Error(`${label}: non-empty CSV row ${i + 1} is missing KOST_Question_ID`);
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/i.test(id)) {
      throw new Error(`${label}: invalid question id at CSV row ${i + 1}: ${id}`);
    }
    if (seen.has(id)) throw new Error(`${label}: duplicate question id: ${id}`);
    seen.add(id);
    rows.push({ id, values, rowNumber: i + 1 });
  }

  return { rows, indexByHeader };
}

function valueFor(table, row, header) {
  const index = table.indexByHeader.get(header);
  return index === undefined ? '' : (row.values[index] ?? '').trim();
}

function functionFromQuestionId(id) {
  return /^Q-(7\.(?:10|[1-9]))-\d{3}$/i.exec(id)?.[1] ?? '';
}

function claimsTerminalRegulatoryState(table, row) {
  const bucket = valueFor(table, row, 'current_individual_fr_status_bucket');
  const full = valueFor(table, row, 'current_individual_fr_status_full_text');
  const final = valueFor(table, row, 'final_reconciled_status');
  const reason = valueFor(table, row, 'reason');
  const nextAction = valueFor(table, row, 'next_action');

  const frozen = /^FROZEN\b/i.test(bucket) || /^FROZEN\b/i.test(final) || /FROZEN FR\s*\/\s*SOURCE VERIFIED\b/i.test(full);
  const importEligible = /Import-eligible for V2/i.test(nextAction);
  const confirmedGap = /^GAP\b/i.test(bucket) && /FR SOURCE GAP CONFIRMED/i.test([full, final, reason].join('\n'));

  return { frozen, importEligible, confirmedGap, any: frozen || importEligible || confirmedGap };
}

function hasCurrentDgr67Edition2026(text) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ');
  const dgrThenEdition = /\b(?:IATA\s+)?DGR\b.{0,96}\b67(?:th|e|ème|eme)\b.{0,96}\b2026\b/i;
  const editionThenDgr = /\b67(?:th|e|ème|eme)\b.{0,96}\b2026\b.{0,96}\b(?:IATA\s+)?DGR\b/i;
  return dgrThenEdition.test(normalized) || editionThenDgr.test(normalized);
}

function hasConcreteDgrReference(value) {
  const text = String(value ?? '').trim();
  if (!text || /^(?:n\/?a|none|—|-)$/i.test(text)) return false;
  return /§\s*\d|\b(?:table|tableau|appendix|appendice|figure|fig\.?|page|p\.)\b|\b[1-9]\d?(?:\.\d+){1,5}\b/i.test(text);
}

function validate(text, { checkFiles = true } = {}) {
  const table = tableFromCsv(text, TARGET);
  const violations = [];

  for (const row of table.rows) {
    const expectedFunction = functionFromQuestionId(row.id);
    const declaredFunction = valueFor(table, row, 'function');
    if (declaredFunction !== expectedFunction) {
      violations.push({ id: row.id, reason: `FUNCTION ${declaredFunction || '(missing)'} does not match question ID function ${expectedFunction}` });
      continue;
    }

    const claims = claimsTerminalRegulatoryState(table, row);
    if (!claims.any) continue;

    const evidenceText = row.values.join('\n');
    const bookshelf = valueFor(table, row, 'bookshelf_evidence_found').toUpperCase();
    const dgrReference = valueFor(table, row, 'dgr_reference');
    const evidenceLocation = valueFor(table, row, 'evidence_location_file');

    if (bookshelf !== 'YES') {
      violations.push({ id: row.id, reason: `terminal regulatory state without Bookshelf_Evidence_Found=YES (${bookshelf || 'missing'})` });
    }
    if (!hasConcreteDgrReference(dgrReference)) {
      violations.push({ id: row.id, reason: `terminal regulatory state without a concrete per-item DGR_Reference (${dgrReference || 'missing'})` });
    }
    if (!evidenceLocation) {
      violations.push({ id: row.id, reason: 'terminal regulatory state without Evidence_Location_File' });
    } else if (checkFiles) {
      const normalized = path.normalize(evidenceLocation);
      const insideDocs = normalized.startsWith(`docs${path.sep}`) && !normalized.includes(`..${path.sep}`);
      if (!insideDocs || !fs.existsSync(path.join(root, normalized))) {
        violations.push({ id: row.id, reason: `Evidence_Location_File is not a present in-repo docs artifact: ${evidenceLocation}` });
      }
    }
    if (!hasCurrentDgr67Edition2026(evidenceText)) {
      violations.push({ id: row.id, reason: 'terminal regulatory state lacks explicit per-item IATA DGR 67th Edition 2026 binding' });
    }
    if (NON_DIRECT_EVIDENCE_RE.test(evidenceText)) {
      violations.push({ id: row.id, reason: 'terminal regulatory state contains representative/batch/cross-applied or otherwise non-direct evidence wording' });
    } else if (!DIRECT_ITEM_SIGNAL_RE.test(evidenceText)) {
      violations.push({ id: row.id, reason: 'terminal regulatory state lacks an affirmative item-specific direct read/search/verification signal' });
    }
  }

  return violations;
}

function runSelfTest() {
  const header = 'KOST_Question_ID,Function,CBTA_Subtask,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Historical_Topic_Analysis_Conclusion,Bookshelf_Evidence_Found,DGR_Reference,Evidence_Location_File,Tested_Claim_Supported,Full_Text_Recoverable,Correct_Answer_Recoverable,Final_Reconciled_Status,Reason,Next_Action';
  const direct = `${header}\r\nQ-7.8-048,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED — DGR 67th Edition 2026 §9.6.1",,YES,§9.6.1,docs/example.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly for this item's tested claim.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const ambiguousBatch = `${header}\r\nQ-7.8-047,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED — DGR 67th Edition 2026 §9.6.1",,YES,§9.6.1,docs/example.md,YES,YES,YES,FROZEN,"Individually verified against current DGR 67th Edition 2026 text (live Bookshelf check or independently spot-verified batch citation).",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const missingEditionYear = `${header}\r\nQ-7.9-004,7.9,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YES,§9.6.1,docs/example.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly against current DGR 67e AM1.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const directGap = `${header}\r\nQ-7.2-008,7.2,0.1.4,GAP,"FR SOURCE GAP CONFIRMED — IATA DGR 67th Edition 2026 §1.0",,YES,§1.0,docs/example.md,N/A,YES,YES,"FR SOURCE GAP CONFIRMED","This item's tested claim was searched directly in the current IATA DGR 67th Edition 2026 text and no supporting provision was located.",Retain Tier B only\r\n`;
  const draft = `${header}\r\nQ-7.3-001,7.3,,DRAFT,"DRAFT — SOURCE REQUIRED",,NO,,docs/example.md,NO,YES,YES,DRAFT,"No direct source claim yet.",Hold\r\n`;

  if (validate(direct, { checkFiles: false }).length !== 0) {
    throw new Error('Regression fixture failed: affirmative direct current-edition evidence was rejected.');
  }
  const ambiguous = validate(ambiguousBatch, { checkFiles: false });
  if (!ambiguous.some((v) => /batch|non-direct/i.test(v.reason))) {
    throw new Error('Regression fixture failed: ambiguous direct-or-batch evidence was not rejected.');
  }
  const missingEdition = validate(missingEditionYear, { checkFiles: false });
  if (!missingEdition.some((v) => /67th Edition 2026 binding/i.test(v.reason))) {
    throw new Error('Regression fixture failed: missing explicit 2026 edition binding was not rejected.');
  }
  if (validate(directGap, { checkFiles: false }).length !== 0) {
    throw new Error('Regression fixture failed: directly searched current-edition SOURCE GAP was rejected.');
  }
  if (validate(draft, { checkFiles: false }).length !== 0) {
    throw new Error('Regression fixture failed: non-terminal DRAFT row was incorrectly promoted into the affirmative-evidence gate.');
  }

  console.log('PASS: affirmative per-item Tier-A evidence regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const targetPath = path.join(root, TARGET);
if (!fs.existsSync(targetPath)) {
  console.error(`ERROR: missing required reconciliation artifact: ${TARGET}`);
  process.exit(1);
}

try {
  const violations = validate(fs.readFileSync(targetPath, 'utf8'));
  if (violations.length > 0) {
    console.error('ERROR: affirmative direct current-edition Tier-A evidence is incomplete for terminal per-item states.');
    for (const violation of violations) console.error(` - ${violation.id}: ${violation.reason}`);
    console.error('Do not promote source verification, confirmed source gaps, or V2 import eligibility until each affected item has durable direct IATA DGR 67th Edition 2026 evidence.');
    process.exit(1);
  }

  console.log('PASS: every terminal per-item reconciliation state has affirmative direct IATA DGR 67th Edition 2026 evidence metadata.');
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
