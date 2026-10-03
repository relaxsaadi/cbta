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

function reconciliationTable(text) {
  const parsed = parseCsv(text, TARGET);
  if (parsed.length === 0) throw new Error(`${TARGET}: empty CSV`);

  const headers = parsed[0].map(normalizeHeader);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    throw new Error(`${TARGET}: duplicate header(s): ${[...new Set(duplicateHeaders)].join(', ')}`);
  }

  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const requiredHeaders = [
    'kost_question_id',
    'function',
    'current_individual_fr_status_bucket',
    'current_individual_fr_status_full_text',
    'final_reconciled_status',
    'reason',
    'next_action',
  ];
  for (const header of requiredHeaders) {
    if (!indexByHeader.has(header)) throw new Error(`${TARGET}: missing required header ${header}`);
  }

  const idIndex = indexByHeader.get('kost_question_id');
  const rows = [];
  const seen = new Set();

  for (let i = 1; i < parsed.length; i += 1) {
    const values = parsed[i];
    if (values.length !== headers.length) {
      throw new Error(`${TARGET}: CSV row ${i + 1} has ${values.length} column(s), expected ${headers.length}`);
    }

    const id = (values[idIndex] ?? '').trim();
    if (!id) throw new Error(`${TARGET}: non-empty CSV row ${i + 1} is missing KOST_Question_ID`);
    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/i.test(id)) {
      throw new Error(`${TARGET}: invalid question id at CSV row ${i + 1}: ${id}`);
    }
    if (seen.has(id)) throw new Error(`${TARGET}: duplicate question id: ${id}`);
    seen.add(id);

    rows.push({ id, values, rowNumber: i + 1 });
  }

  return { rows, indexByHeader };
}

function valueFor(table, record, header) {
  const index = table.indexByHeader.get(header);
  return index === undefined ? '' : (record.values[index] ?? '').trim();
}

function functionFromQuestionId(id) {
  const match = /^Q-(7\.(?:10|[1-9]))-\d{3}$/i.exec(id);
  return match?.[1] ?? '';
}

function findViolations(text) {
  const table = reconciliationTable(text);
  const violations = [];

  for (const row of table.rows) {
    const declaredFunction = valueFor(table, row, 'function');
    const expectedFunction = functionFromQuestionId(row.id);
    if (declaredFunction !== expectedFunction) {
      violations.push({
        id: row.id,
        structural: true,
        reason: `FUNCTION ${declaredFunction || '(missing)'} does not match question ID function ${expectedFunction}`,
      });
      continue;
    }

    const evidenceText = row.values.join('\n');
    const missingDirectEvidence = MISSING_DIRECT_EVIDENCE_PATTERNS.some((pattern) => pattern.test(evidenceText));
    const statusBucket = valueFor(table, row, 'current_individual_fr_status_bucket');
    const statusFull = valueFor(table, row, 'current_individual_fr_status_full_text');
    const finalStatus = valueFor(table, row, 'final_reconciled_status');
    const reason = valueFor(table, row, 'reason');
    const nextAction = valueFor(table, row, 'next_action');

    const claimsFrozen =
      /^FROZEN\b/i.test(statusBucket)
      || /^FROZEN\b/i.test(finalStatus)
      || /FROZEN FR \/ SOURCE VERIFIED/i.test(statusFull);
    const claimsImportEligible = /Import-eligible for V2/i.test(nextAction);
    const claimsConfirmedGap =
      /^GAP\b/i.test(statusBucket)
      && /FR SOURCE GAP CONFIRMED/i.test([statusFull, finalStatus, reason].join('\n'));

    if (missingDirectEvidence && (claimsFrozen || claimsImportEligible || claimsConfirmedGap)) {
      violations.push({ id: row.id, claimsFrozen, claimsImportEligible, claimsConfirmedGap });
    }
  }

  return violations;
}

function runSelfTest() {
  const header = 'KOST_Question_ID,Function,CBTA_Subtask,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Historical_Topic_Analysis_Conclusion,Bookshelf_Evidence_Found,DGR_Reference,Evidence_Location_File,Tested_Claim_Supported,Full_Text_Recoverable,Correct_Answer_Recoverable,Final_Reconciled_Status,Reason,Next_Action';
  const sampled = `${header}\r\nQ-7.8-047,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YES,§9.6.1,bank.md,YES,YES,YES,FROZEN,"A representative sample of this citation pattern was independently spot-verified. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const missingRepresentativeWording = `${header}\r\nQ-7.9-004,7.9,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YES,§9.6.1,bank.md,YES,YES,YES,FROZEN,"This item's own specific citation was not independently re-read during this pass.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const sampledConfirmedGap = `${header}\r\nQ-7.3-017,7.3,0.1.4,GAP,"FR SOURCE GAP CONFIRMED (cross-applied)",,YES,§1.0,bank.md,N/A,YES,YES,"FR SOURCE GAP CONFIRMED","A representative sample was spot-verified. This item's own specific citation was not independently re-read this pass but follows the same verified batch pattern.",Retain Tier B only\r\n`;
  const crossAppliedWithoutSearch = `${header}\r\nQ-7.2-002,7.2,0.1.4,GAP,"FR SOURCE GAP CONFIRMED",,YES,§1.0,bank.md,N/A,YES,YES,"FR SOURCE GAP CONFIRMED","Prior Tier-A research from another item is cross-applied here; this item was not re-searched from scratch.",Retain Tier B only\r\n`;
  const direct = `${header}\r\nQ-7.8-048,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YES,§9.6.1,bank.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly for this item's tested claim.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const directConfirmedGap = `${header}\r\nQ-7.2-008,7.2,3.4.2,GAP,"FR SOURCE GAP CONFIRMED",,YES,§1.0,bank.md,N/A,YES,YES,"FR SOURCE GAP CONFIRMED","This item's tested claim was searched directly in the current DGR 67th Edition 2026 text and no supporting provision was located; searched sections are recorded item-by-item.",Retain Tier B only\r\n`;
  const quotedMultilineFakeBoundary = `${header}\r\nQ-7.8-048,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YES,§9.6.1,bank.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly. Embedded audit note follows:\nQ-7.9-999,not-a-real-row\nStill the same quoted Reason field.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const quoteInsideUnquoted = `${header}\r\nQ-7.8-048,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED",,YE"S",§9.6.1,bank.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;
  const trailingAfterQuoted = `${header}\r\nQ-7.8-048,7.8,,FROZEN,"FROZEN FR / SOURCE VERIFIED"NO,,YES,§9.6.1,bank.md,YES,YES,YES,FROZEN,"Live Bookshelf check performed directly.",Import-eligible for V2 (pending reviewer sign-off)\r\n`;

  const sampledViolations = findViolations(sampled);
  const missingRepresentativeWordingViolations = findViolations(missingRepresentativeWording);
  const sampledConfirmedGapViolations = findViolations(sampledConfirmedGap);
  const crossAppliedWithoutSearchViolations = findViolations(crossAppliedWithoutSearch);
  const directViolations = findViolations(direct);
  const directConfirmedGapViolations = findViolations(directConfirmedGap);
  const quotedBoundaryViolations = findViolations(quotedMultilineFakeBoundary);

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
  if (quotedBoundaryViolations.length !== 0) {
    throw new Error('Regression fixture failed: quoted multiline field containing Q-like text was misparsed as a new CSV row.');
  }

  let malformedQuoteRejected = false;
  try {
    findViolations(quoteInsideUnquoted);
  } catch (error) {
    malformedQuoteRejected = /unexpected quote inside unquoted csv field/i.test(error.message);
  }
  if (!malformedQuoteRejected) {
    throw new Error('Regression fixture failed: quote inside an unquoted field was not rejected by the direct-provenance parser.');
  }

  let trailingAfterQuoteRejected = false;
  try {
    findViolations(trailingAfterQuoted);
  } catch (error) {
    trailingAfterQuoteRejected = /unexpected character after closing csv quote/i.test(error.message);
  }
  if (!trailingAfterQuoteRejected) {
    throw new Error('Regression fixture failed: trailing text after a closing quote was not rejected by the direct-provenance parser.');
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

try {
  const text = fs.readFileSync(targetPath, 'utf8');
  const violations = findViolations(text);

  if (violations.length > 0) {
    const structural = violations.filter((v) => v.structural);
    if (structural.length > 0) {
      console.error('ERROR: direct Tier-A provenance gate found reconciliation identity/function structural inconsistencies.');
      for (const v of structural) console.error(` - ${v.id}: ${v.reason}`);
    }

    const provenance = violations.filter((v) => !v.structural);
    if (provenance.length > 0) {
      console.error('ERROR: direct Tier-A provenance is missing while the row is treated as source-verified/import-eligible/confirmed-gap.');
      for (const v of provenance) {
        const claimedStates = [
          v.claimsFrozen ? 'FROZEN/source-verified' : null,
          v.claimsImportEligible ? 'import-eligible' : null,
          v.claimsConfirmedGap ? 'FR SOURCE GAP CONFIRMED' : null,
        ].filter(Boolean).join(', ');
        console.error(` - ${v.id}: direct item-specific current-DGR evidence required before ${claimedStates} readiness status.`);
      }
    }

    console.error('See docs/DGR_TIER_A_DIRECT_EVIDENCE_CORRECTION_2026-09-22.md.');
    process.exit(1);
  }

  console.log('PASS: no explicit missing-direct-evidence terminal promotions detected in per-item reconciliation.');
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
