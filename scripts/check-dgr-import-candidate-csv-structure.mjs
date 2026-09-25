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

function inspectCsv(text, label, idHeader) {
  const rows = parseCsv(text, label);
  if (rows.length === 0) return [`${label}: empty CSV`];

  const headers = rows[0].map(normalizeHeader);
  const issues = [];
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length > 0) {
    issues.push(`${label}: duplicate header(s): ${[...new Set(duplicateHeaders)].join(', ')}`);
  }

  const idIndex = headers.indexOf(idHeader);
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

    if (!/^Q-7\.(?:10|[1-9])-\d{3}$/i.test(id)) {
      issues.push(`${label}: CSV row ${csvRow} has invalid question id ${id}`);
    }
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

  console.log('PASS: import/reconciliation CSV structural regression fixtures');
}

if (process.argv.includes('--test')) {
  runSelfTest();
  process.exit(0);
}

const root = process.cwd();
const issues = [];

for (const artifact of ARTIFACTS) {
  const absolute = path.join(root, artifact.path);
  if (!fs.existsSync(absolute)) {
    issues.push(`${artifact.path}: missing required artifact`);
    continue;
  }

  try {
    issues.push(...inspectCsv(fs.readFileSync(absolute, 'utf8'), artifact.path, artifact.idHeader));
  } catch (error) {
    issues.push(`${artifact.path}: parse failure: ${error.message}`);
  }
}

if (issues.length > 0) {
  console.error('ERROR: DGR import/reconciliation CSV structure is not safe as a controlled authority.');
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log('PASS: import/reconciliation CSV rows have strict quoting, stable width, valid IDs, and no non-empty blank-ID rows.');
