#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS = [
  {
    path: 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv',
    idHeader: 'kost_question_id',
  },
  {
    path: 'docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv',
    idHeader: 'kost_id',
  },
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

function normalizeHeader(value) {
  return value.trim().toLowerCase();
}

function inspectCsv(text, label, idHeader, collectedIds = null) {
  const rows = parseCsv(text, label);
  if (rows.length === 0) return [`${label}: empty CSV`];

  const headers = rows[0].map(normalizeHeader);
  const issues = [];
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    issues.push(`${label}: duplicate header(s): ${[...new Set(duplicateHeaders)].join(', ')}`);
  }

  const idIndex = headers.indexOf(idHeader);
  const functionIndex = headers.indexOf('function');
  const seenIds = new Map();
  if (functionIndex === -1) {
    issues.push(`${label}: missing required header function`);
  }
  if (idIndex === -1) {
    issues.push(`${label}: missing required header ${idHeader}`);
    return issues;
  }

  for (let i = 1; i < rows.length; i += 1) {
    const values = rows[i];
    const csvRow = i + 1;

    if (values.length !== headers.length) {
      issues.push(`${label}: CSV row ${csvRow} has ${values.length} columns; expected ${headers.length}`);
    }

    const id = (values[idIndex] ?? '').trim();
    if (!id) {
      issues.push(`${label}: CSV row ${csvRow} is non-empty but ${idHeader} is blank`);
      continue;
    }

    const normalizedId = id.toUpperCase();
    if (collectedIds) collectedIds.add(normalizedId);
    if (seenIds.has(normalizedId)) {
      issues.push(`${label}: CSV row ${csvRow} duplicates ${idHeader} ${id} from row ${seenIds.get(normalizedId)}`);
    } else {
      seenIds.set(normalizedId, csvRow);
    }

    const match = /^Q-(7\.(?:10|[1-9]))-\d{3}$/i.exec(id);
    if (!match) {
      issues.push(`${label}: CSV row ${csvRow} has invalid question id ${id}`);
    } else if (functionIndex >= 0 && (values[functionIndex] ?? '').trim() !== match[1]) {
      issues.push(`${label}: CSV row ${csvRow} FUNCTION does not match question ID ${id}`);
    }
  }

  return issues;
}

// Both controlled registries must describe the same complete provisional item set.
// Without this check, deleting a NO/blocked row from only one CSV can pass
// the import-eligibility checks while silently losing an audit record.
function compareIdSets(leftIds, rightIds, leftLabel, rightLabel) {
  const issues = [];
  const onlyLeft = [...leftIds].filter((id) => !rightIds.has(id)).sort();
  const onlyRight = [...rightIds].filter((id) => !leftIds.has(id)).sort();
  if (onlyLeft.length) {
    issues.push(`${rightLabel}: missing ${onlyLeft.length} question ID(s) from ${leftLabel}: ${onlyLeft.slice(0, 10).join(', ')}${onlyLeft.length > 10 ? ', ...' : ''}`);
  }
  if (onlyRight.length) {
    issues.push(`${leftLabel}: missing ${onlyRight.length} question ID(s) from ${rightLabel}: ${onlyRight.slice(0, 10).join(', ')}${onlyRight.length > 10 ? ', ...' : ''}`);
  }
  return issues;
}

function runSelfTest() {
  const good = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,YES\r\n';
  const goodQuoted = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,"YES"\r\n';
  const blankId = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\n,7.3,YES\r\n';
  const shortRow = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3\r\n';
  const longRow = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,YES,EXTRA\r\n';
  const quoteInsideUnquoted = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,YE"S"\r\n';
  const trailingAfterQuoted = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,"YES"NO\r\n';
  const duplicateId = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.3,NO\r\nQ-7.3-040,7.3,YES\r\n';
  const wrongFunction = 'KOST_ID,FUNCTION,IMPORT_ELIGIBLE\r\nQ-7.3-040,7.2,YES\r\n';
  const missingFunctionHeader = 'KOST_ID,IMPORT_ELIGIBLE\r\nQ-7.3-040,NO\r\n';

  if (inspectCsv(good, 'fixture.csv', 'kost_id').length !== 0) {
    throw new Error('Regression fixture failed: valid CSV was rejected.');
  }

  if (inspectCsv(goodQuoted, 'fixture.csv', 'kost_id').length !== 0) {
    throw new Error('Regression fixture failed: valid quoted CSV field was rejected.');
  }

  if (!inspectCsv(blankId, 'fixture.csv', 'kost_id').some((issue) => /kost_id is blank/i.test(issue))) {
    throw new Error('Regression fixture failed: non-empty row with blank ID was not rejected.');
  }

  if (!inspectCsv(shortRow, 'fixture.csv', 'kost_id').some((issue) => /expected 3/i.test(issue))) {
    throw new Error('Regression fixture failed: short CSV row was not rejected.');
  }

  if (!inspectCsv(longRow, 'fixture.csv', 'kost_id').some((issue) => /expected 3/i.test(issue))) {
    throw new Error('Regression fixture failed: long CSV row was not rejected.');
  }

  let malformedQuoteRejected = false;
  try {
    inspectCsv(quoteInsideUnquoted, 'fixture.csv', 'kost_id');
  } catch (error) {
    malformedQuoteRejected = /unexpected quote inside unquoted csv field/i.test(error.message);
  }
  if (!malformedQuoteRejected) {
    throw new Error('Regression fixture failed: quote inside an unquoted field was not rejected.');
  }

  let trailingAfterQuoteRejected = false;
  try {
    inspectCsv(trailingAfterQuoted, 'fixture.csv', 'kost_id');
  } catch (error) {
    trailingAfterQuoteRejected = /unexpected character after closing csv quote/i.test(error.message);
  }
  if (!trailingAfterQuoteRejected) {
    throw new Error('Regression fixture failed: trailing text after a closing quote was not rejected.');
  }

  if (!inspectCsv(duplicateId, 'fixture.csv', 'kost_id').some((issue) => /duplicates kost_id Q-7\.3-040 from row 2/i.test(issue))) {
    throw new Error('Regression fixture failed: duplicate question ID was accepted.');
  }
  if (!inspectCsv(wrongFunction, 'fixture.csv', 'kost_id').some((issue) => /FUNCTION does not match question ID/i.test(issue))) {
    throw new Error('Regression fixture failed: question ID/FUNCTION mismatch was accepted.');
  }

  if (!inspectCsv(missingFunctionHeader, 'fixture.csv', 'kost_id').some((issue) => /missing required header function/i.test(issue))) {
    throw new Error('Regression fixture failed: missing FUNCTION column was accepted.');
  }

  const matching = new Set(['Q-7.3-040', 'Q-7.3-041']);
  if (compareIdSets(matching, new Set(matching), 'reconciliation', 'import').length !== 0) {
    throw new Error('Regression fixture failed: matching item sets were rejected.');
  }
  const missingImport = compareIdSets(matching, new Set(['Q-7.3-040']), 'reconciliation', 'import');
  if (!missingImport.some((issue) => /Q-7\.3-041/.test(issue))) {
    throw new Error('Regression fixture failed: dropped blocked/import-ineligible item was not detected.');
  }
  const extraImport = compareIdSets(new Set(['Q-7.3-040']), matching, 'reconciliation', 'import');
  if (!extraImport.some((issue) => /Q-7\.3-041/.test(issue))) {
    throw new Error('Regression fixture failed: extra import item without reconciliation was not detected.');
  }

  console.log('PASS: import/reconciliation CSV structural regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const root = process.cwd();
const issues = [];
const idsByArtifact = new Map();

for (const artifact of ARTIFACTS) {
  const absolute = path.join(root, artifact.path);
  if (!fs.existsSync(absolute)) {
    issues.push(`${artifact.path}: missing required artifact`);
    continue;
  }

  try {
    const ids = new Set();
    issues.push(...inspectCsv(fs.readFileSync(absolute, 'utf8'), artifact.path, artifact.idHeader, ids));
    idsByArtifact.set(artifact.path, ids);
  } catch (error) {
    issues.push(`${artifact.path}: parse failure: ${error.message}`);
  }
}

if (issues.length === 0 && idsByArtifact.size === ARTIFACTS.length) {
  issues.push(...compareIdSets(
    idsByArtifact.get(ARTIFACTS[0].path),
    idsByArtifact.get(ARTIFACTS[1].path),
    ARTIFACTS[0].path,
    ARTIFACTS[1].path,
  ));
}

if (issues.length > 0) {
  console.error('ERROR: DGR import/reconciliation CSV structure is not safe as a controlled authority.');
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log('PASS: import/reconciliation CSVs have strict quoting, stable widths, function-bound unique IDs, and identical item populations.');
