#!/usr/bin/env node

/**
 * Fail-closed evidence-artifact binding gate for DGR Functions 7.1–7.10.
 *
 * Per-item reconciliation metadata can only be defensible if its referenced
 * Evidence_Location_File is not merely an arbitrary existing docs file. Every
 * terminal regulatory row must point to a durable, in-repo, non-circular text
 * artifact that explicitly names that exact KOST question ID.
 *
 * This gate checks traceability only. It does not reproduce licensed IATA text,
 * decide regulatory correctness, approve a question, or imply ANAC/IATA
 * approval. Current-edition/direct-read semantics remain enforced by the
 * companion Tier-A provenance gates.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TARGET = 'docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv';
const root = process.cwd();

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
    'evidence_location_file',
    'final_reconciled_status',
    'reason',
    'next_action',
  ];
  for (const header of requiredHeaders) {
    if (!indexByHeader.has(header)) throw new Error(`${label}: missing required header ${header}`);
  }

  const idIndex = indexByHeader.get('kost_question_id');
  const seen = new Set();
  const rows = [];

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

  return frozen || importEligible || confirmedGap;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function artifactNamesExactQuestionId(text, id) {
  const escaped = escapeRegExp(id);
  return new RegExp(`(?:^|[^A-Z0-9.-])${escaped}(?![A-Z0-9.-])`, 'im').test(text);
}

function isStrictlyInside(parentDir, candidatePath) {
  const relative = path.relative(parentDir, candidatePath);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function firstSymlinkInPath(parentDir, candidatePath) {
  const relative = path.relative(parentDir, candidatePath);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;

  let current = parentDir;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) return current;
  }
  return null;
}

function validate(text, { rootDir = root } = {}) {
  const table = tableFromCsv(text, TARGET);
  const violations = [];
  const docsDir = path.resolve(rootDir, 'docs');
  const reconciliationPath = path.resolve(rootDir, TARGET);

  if (!fs.existsSync(docsDir) || !fs.lstatSync(docsDir).isDirectory() || fs.lstatSync(docsDir).isSymbolicLink()) {
    throw new Error('docs/: expected a real in-repository directory, not a missing path or symlink');
  }
  const realDocsDir = fs.realpathSync(docsDir);

  for (const row of table.rows) {
    const expectedFunction = functionFromQuestionId(row.id);
    const declaredFunction = valueFor(table, row, 'function');
    if (declaredFunction !== expectedFunction) {
      violations.push({ id: row.id, reason: `FUNCTION ${declaredFunction || '(missing)'} does not match question ID function ${expectedFunction}` });
      continue;
    }

    if (!claimsTerminalRegulatoryState(table, row)) continue;

    const evidenceLocation = valueFor(table, row, 'evidence_location_file');
    if (!evidenceLocation) {
      violations.push({ id: row.id, reason: 'terminal regulatory state without Evidence_Location_File' });
      continue;
    }

    if (path.isAbsolute(evidenceLocation)) {
      violations.push({ id: row.id, reason: `Evidence_Location_File must be a repository-relative docs path: ${evidenceLocation}` });
      continue;
    }

    const candidatePath = path.resolve(rootDir, path.normalize(evidenceLocation));
    if (!isStrictlyInside(docsDir, candidatePath)) {
      violations.push({ id: row.id, reason: `Evidence_Location_File escapes or does not identify a docs artifact: ${evidenceLocation}` });
      continue;
    }

    if (candidatePath === reconciliationPath) {
      violations.push({ id: row.id, reason: 'Evidence_Location_File is circular: the reconciliation CSV cannot serve as its own per-item evidence artifact' });
      continue;
    }

    if (!fs.existsSync(candidatePath)) {
      violations.push({ id: row.id, reason: `Evidence_Location_File does not exist: ${evidenceLocation}` });
      continue;
    }

    let symlinkPath;
    try {
      symlinkPath = firstSymlinkInPath(docsDir, candidatePath);
    } catch (error) {
      violations.push({ id: row.id, reason: `Evidence_Location_File path cannot be safely inspected: ${evidenceLocation} (${error instanceof Error ? error.message : String(error)})` });
      continue;
    }
    if (symlinkPath) {
      violations.push({ id: row.id, reason: `Evidence_Location_File must not traverse a symlink: ${evidenceLocation}` });
      continue;
    }

    let realCandidatePath;
    try {
      realCandidatePath = fs.realpathSync(candidatePath);
    } catch (error) {
      violations.push({ id: row.id, reason: `Evidence_Location_File real path cannot be resolved: ${evidenceLocation} (${error instanceof Error ? error.message : String(error)})` });
      continue;
    }
    if (!isStrictlyInside(realDocsDir, realCandidatePath)) {
      violations.push({ id: row.id, reason: `Evidence_Location_File resolves outside the real docs directory: ${evidenceLocation}` });
      continue;
    }

    const stat = fs.lstatSync(candidatePath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      violations.push({ id: row.id, reason: `Evidence_Location_File must be a regular in-repo file, not a symlink/directory: ${evidenceLocation}` });
      continue;
    }

    let artifactText;
    try {
      artifactText = fs.readFileSync(candidatePath, 'utf8');
    } catch (error) {
      violations.push({ id: row.id, reason: `Evidence_Location_File is not readable as UTF-8 text: ${evidenceLocation} (${error instanceof Error ? error.message : String(error)})` });
      continue;
    }

    if (!artifactNamesExactQuestionId(artifactText, row.id)) {
      violations.push({ id: row.id, reason: `Evidence_Location_File exists but does not explicitly bind this exact question ID: ${evidenceLocation}` });
    }
  }

  return violations;
}

function runSelfTest() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dgr-evidence-binding-'));
  const docsDir = path.join(tempRoot, 'docs');
  fs.mkdirSync(docsDir, { recursive: true });

  const header = 'KOST_Question_ID,Function,Current_Individual_FR_Status_Bucket,Current_Individual_FR_Status_Full_Text,Evidence_Location_File,Final_Reconciled_Status,Reason,Next_Action';
  const row = (id, functionId, bucket, evidenceLocation, final = 'FROZEN', reason = 'Direct per-item evidence recorded.', nextAction = 'Import-eligible for V2 (pending reviewer sign-off)') =>
    `${header}\r\n${id},${functionId},${bucket},"FROZEN FR / SOURCE VERIFIED",${evidenceLocation},${final},"${reason}","${nextAction}"\r\n`;

  try {
    fs.writeFileSync(path.join(docsDir, 'bound.md'), '# Evidence\n\n## Q-7.8-048\nPer-item verification record.\n', 'utf8');
    fs.writeFileSync(path.join(docsDir, 'unrelated.md'), '# Evidence\n\n## Q-7.8-049\nDifferent item.\n', 'utf8');
    fs.writeFileSync(path.join(tempRoot, 'outside.md'), '# Q-7.8-048\nOutside docs.\n', 'utf8');

    const valid = row('Q-7.8-048', '7.8', 'FROZEN', 'docs/bound.md');
    if (validate(valid, { rootDir: tempRoot }).length !== 0) {
      throw new Error('Regression fixture failed: correctly bound evidence artifact was rejected.');
    }

    const unrelated = row('Q-7.8-048', '7.8', 'FROZEN', 'docs/unrelated.md');
    const unrelatedViolations = validate(unrelated, { rootDir: tempRoot });
    if (!unrelatedViolations.some((violation) => /does not explicitly bind/i.test(violation.reason))) {
      throw new Error('Regression fixture failed: unrelated existing docs artifact was accepted as per-item evidence.');
    }

    const outside = row('Q-7.8-048', '7.8', 'FROZEN', 'outside.md');
    const outsideViolations = validate(outside, { rootDir: tempRoot });
    if (!outsideViolations.some((violation) => /escapes|docs artifact/i.test(violation.reason))) {
      throw new Error('Regression fixture failed: evidence outside docs/ was not rejected.');
    }

    const externalDir = path.join(tempRoot, 'external-evidence');
    fs.mkdirSync(externalDir, { recursive: true });
    fs.writeFileSync(path.join(externalDir, 'bound-outside.md'), '# Q-7.8-048\nOutside evidence reached through a symlinked docs subdirectory.\n', 'utf8');
    const symlinkDir = path.join(docsDir, 'escape-link');
    fs.symlinkSync(externalDir, symlinkDir, 'dir');
    const symlinkTraversal = row('Q-7.8-048', '7.8', 'FROZEN', 'docs/escape-link/bound-outside.md');
    const symlinkViolations = validate(symlinkTraversal, { rootDir: tempRoot });
    if (!symlinkViolations.some((violation) => /symlink|real docs directory/i.test(violation.reason))) {
      throw new Error('Regression fixture failed: intermediate symlink traversal outside docs/ was accepted as in-repo evidence.');
    }

    fs.writeFileSync(path.join(docsDir, path.basename(TARGET)), valid, 'utf8');
    const circular = row('Q-7.8-048', '7.8', 'FROZEN', TARGET);
    const circularViolations = validate(circular, { rootDir: tempRoot });
    if (!circularViolations.some((violation) => /circular/i.test(violation.reason))) {
      throw new Error('Regression fixture failed: reconciliation self-reference was not rejected.');
    }

    const draft = `${header}\r\nQ-7.3-001,7.3,DRAFT,"DRAFT — SOURCE REQUIRED",docs/missing.md,DRAFT,"No terminal source claim.",Hold\r\n`;
    if (validate(draft, { rootDir: tempRoot }).length !== 0) {
      throw new Error('Regression fixture failed: non-terminal DRAFT row was incorrectly forced through evidence-artifact binding.');
    }

    console.log('PASS: per-item evidence-artifact binding regression fixtures');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
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
    console.error('ERROR: terminal DGR reconciliation rows are not durably bound to their claimed per-item evidence artifacts.');
    for (const violation of violations) console.error(` - ${violation.id}: ${violation.reason}`);
    console.error('Do not promote source verification, confirmed source gaps, or V2 import eligibility until every terminal item points to a non-circular in-repo docs artifact that explicitly names that exact question ID.');
    process.exit(1);
  }

  console.log('PASS: every terminal DGR reconciliation row is explicitly bound to its referenced in-repo per-item evidence artifact.');
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
