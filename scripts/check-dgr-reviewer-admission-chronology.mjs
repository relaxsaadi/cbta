#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const functions = ['7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9','7.10'];
const registryPath = 'docs/DGR_REVIEWER_REGISTRY.md';
const reviewerRefRe = /\breviewer-id\s*=\s*(DGR-RVW-\d{4,})\b/giu;
const isoDateRe = /\b\d{4}-\d{2}-\d{2}\b/g;
const nonVerifiedFrRe = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|NOT VERIFIED|UNVERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED|NOT ATTEMPTED|UNATTEMPTED/i;
const nonCompleteEnRe = /NOT YET REVIEWED|NOT REVIEWED|REVIEW REQUIRED|BILINGUAL TECHNICAL REVIEW REQUIRED|\bPENDING\b|\bDRAFT\b|SOURCE GAP|SOURCE CONFLICT/i;
const registryHeaders = [
  'reviewer id',
  'full name',
  'record type',
  'dgr/cbta qualification evidence',
  'bilingual fr/en evidence',
  'admission state',
  'admission date',
  'evidence reference',
  'active',
];

function normalize(value = '') {
  return String(value).replace(/[`*_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function canonicalName(value = '') {
  return normalize(value).normalize('NFKC').toLocaleLowerCase('en-US');
}

function markdownCells(line) {
  const text = String(line ?? '').trim();
  if (!text.startsWith('|') || !text.endsWith('|')) return [];
  return text.slice(1,-1).split('|').map((cell)=>cell.trim());
}

function isSeparator(line, width) {
  const cells = markdownCells(line);
  return width > 0 && cells.length === width && cells.every((cell)=>/^:?-{3,}:?$/.test(cell));
}

function realNonFutureIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const instant = new Date(Date.UTC(year, month - 1, day));
  if (instant.getUTCFullYear() !== year || instant.getUTCMonth() !== month - 1 || instant.getUTCDate() !== day) return false;
  return value <= new Date().toISOString().slice(0,10);
}

function claimsFrVerified(value) {
  const text = normalize(value);
  if (!text || nonVerifiedFrRe.test(text)) return false;
  return /FROZEN.*SOURCE VERIFIED|FR SOURCE VERIFIED|SOURCE VERIFIED|\bVERIFIED\b/i.test(text);
}

function claimsEnComplete(value) {
  const text = normalize(value);
  if (!text || nonCompleteEnRe.test(text)) return false;
  return Boolean(
    /BILINGUAL(?: TECHNICAL)? REVIEW (?:COMPLETE|COMPLETED)/i.test(text) ||
    /EN BILINGUAL REVIEW (?:COMPLETE|COMPLETED)/i.test(text) ||
    /\bEN REVIEWED\b/i.test(text) ||
    /^REVIEWED\b/i.test(text) ||
    /^(?:COMPLETE|COMPLETED|APPROVED)\b/i.test(text)
  );
}

function parseRegistry(text, artifact = registryPath) {
  const errors = [];
  const records = new Map();
  const lines = String(text ?? '').split(/\r?\n/);
  let found = false;

  for (let i=0;i<lines.length;i+=1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map((cell)=>normalize(cell).toLowerCase());
    if (normalized.length !== registryHeaders.length || !normalized.every((cell,index)=>cell === registryHeaders[index])) continue;
    if (found) {
      errors.push(`${artifact}: more than one canonical reviewer registry table found`);
      continue;
    }
    found = true;
    if (!isSeparator(lines[i+1] ?? '', headers.length)) {
      errors.push(`${artifact}: reviewer registry header lacks a valid same-width Markdown separator`);
      continue;
    }
    for (let j=i+2;j<lines.length;j+=1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`${artifact}: registry row ${j+1} width mismatch`);
        continue;
      }
      const id = normalize(cells[0] ?? '').toUpperCase();
      if (!id || /^[-–—]+$/.test(id)) continue;
      records.set(id, {
        id,
        fullName: normalize(cells[1] ?? ''),
        admission: normalize(cells[5] ?? '').toUpperCase(),
        admissionDate: normalize(cells[6] ?? ''),
        active: normalize(cells[8] ?? '').toUpperCase(),
      });
    }
  }

  if (!found) errors.push(`${artifact}: missing canonical reviewer registry table`);
  return {errors, records};
}

function displayedNameBeforeReviewerId(value = '') {
  let text = normalize(value).replace(/^APPROVED\b\s*[:\-–—]?\s*/i, '');
  const match = reviewerRefRe.exec(text);
  reviewerRefRe.lastIndex = 0;
  if (!match || match.index == null) return '';
  return text.slice(0, match.index).replace(/[\s,;:\-–—]+$/g, '').trim();
}

function chronologyErrors(value, label, registry) {
  const errors = [];
  const text = normalize(value);
  const refs = [...text.matchAll(reviewerRefRe)].map((match)=>(match[1] ?? '').toUpperCase());
  if (refs.length !== 1) {
    errors.push(`${label}: terminal review/sign-off must contain exactly one reviewer-id=DGR-RVW-#### reference`);
    return errors;
  }
  const record = registry.get(refs[0]);
  if (!record) {
    errors.push(`${label}: reviewer reference ${refs[0]} is not present in ${registryPath}`);
    return errors;
  }
  if (record.admission !== 'OWNER VERIFIED' || record.active !== 'YES' || !realNonFutureIsoDate(record.admissionDate)) {
    errors.push(`${label}: reviewer ${refs[0]} lacks an active OWNER VERIFIED record with a real non-future Admission date`);
    return errors;
  }
  const displayedName = displayedNameBeforeReviewerId(text);
  if (!displayedName || canonicalName(displayedName) !== canonicalName(record.fullName)) {
    errors.push(`${label}: displayed reviewer name "${displayedName || 'missing'}" does not match ${refs[0]} registry full name "${record.fullName || 'missing'}"`);
  }
  const dates = [...text.matchAll(isoDateRe)].map((match)=>match[0]);
  if (dates.length !== 1 || !realNonFutureIsoDate(dates[0])) {
    errors.push(`${label}: terminal review/sign-off must contain exactly one real non-future ISO date`);
    return errors;
  }
  if (dates[0] < record.admissionDate) {
    errors.push(`${label}: recorded date ${dates[0]} predates reviewer ${refs[0]} owner admission date ${record.admissionDate}`);
  }
  return errors;
}

function embeddedMatrixCandidates(fn) {
  if (fn === '7.1') return ['docs/DGR_STAGE_2B_STATUS.md','docs/RECOVERED_STAGE2A_CONTEXT.md','docs/DGR_PRODUCTION_BANK_7.1.md'];
  return [`docs/DGR_STAGE1_FUNCTION_${fn}_DRAFT.md`,`docs/DGR_STAGE1_FUNCTION_${fn}_CROSSVALIDATION.md`,`docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`,`docs/DGR_PRODUCTION_BANK_${fn}.md`];
}

function readMatrix(fn) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  if (fs.existsSync(path.join(root,dedicated))) return {label:dedicated,text:fs.readFileSync(path.join(root,dedicated),'utf8')};
  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;
  for (const candidate of embeddedMatrixCandidates(fn)) {
    const absolute = path.join(root,candidate);
    if (!fs.existsSync(absolute)) continue;
    const text = fs.readFileSync(absolute,'utf8');
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start < 0 && end < 0) continue;
    if (start < 0 || end < 0 || end <= start) return {label:`${candidate} embedded matrix`,text:'',discoveryError:'malformed embedded matrix markers'};
    return {label:`${candidate} embedded matrix`,text:text.slice(start + startMarker.length,end)};
  }
  return {label:`Function ${fn} source/competency matrix`,text:'',discoveryError:'missing matrix'};
}

function validateMatrix(text, fn, artifact, registry) {
  const errors = [];
  const lines = String(text ?? '').split(/\r?\n/);
  let found = false;
  for (let i=0;i<lines.length;i+=1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map((cell)=>normalize(cell).toLowerCase());
    const functionIndex = normalized.indexOf('function');
    const taskIndex = normalized.indexOf('official task id');
    const frStateIndex = normalized.indexOf('fr source-verification state');
    const frReviewerIndex = normalized.indexOf('fr verifier + date');
    const enStateIndex = normalized.indexOf('en bilingual-review state');
    const enReviewerIndex = normalized.indexOf('en reviewer + date');
    if ([functionIndex,taskIndex,frStateIndex,frReviewerIndex,enStateIndex,enReviewerIndex].some((index)=>index<0)) continue;
    if (found) {
      errors.push(`${artifact}: more than one canonical matrix reviewer table found`);
      continue;
    }
    found = true;
    if (!isSeparator(lines[i+1] ?? '', headers.length)) {
      errors.push(`${artifact}: canonical matrix reviewer table lacks a valid same-width Markdown separator`);
      continue;
    }
    for (let j=i+2;j<lines.length;j+=1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`${artifact}: matrix row ${j+1} width mismatch`);
        continue;
      }
      const taskId = normalize(cells[taskIndex] ?? '');
      if (!taskId || /^[-–—]+$/.test(taskId)) continue;
      if (normalize(cells[functionIndex] ?? '') !== fn) errors.push(`${artifact}: task ${taskId} declares wrong Function`);
      if (claimsFrVerified(cells[frStateIndex] ?? '')) errors.push(...chronologyErrors(cells[frReviewerIndex] ?? '',`${artifact}: task ${taskId} FR verifier`,registry));
      if (claimsEnComplete(cells[enStateIndex] ?? '')) errors.push(...chronologyErrors(cells[enReviewerIndex] ?? '',`${artifact}: task ${taskId} EN reviewer`,registry));
    }
  }
  if (!found) errors.push(`${artifact}: no canonical matrix reviewer table found`);
  return errors;
}

function validateStructuredArtifacts(text, artifact, registry) {
  const errors = [];
  for (const match of String(text ?? '').matchAll(/FR TECHNICAL REVIEW COMPLETE\s*\(reviewed by\s+([^)]*)\)/gim)) {
    errors.push(...chronologyErrors(match[1] ?? '',`${artifact}: FR technical review`,registry));
  }
  for (const match of String(text ?? '').matchAll(/BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/gim)) {
    errors.push(...chronologyErrors(match[1] ?? '',`${artifact}: EN bilingual review`,registry));
  }
  for (const match of String(text ?? '').matchAll(/^\s*(?:[-+*]\s+)?\*\*Approval:\*\*\s*(.+)$/gim)) {
    const value = match[1] ?? '';
    if (/^APPROVED\b/i.test(normalize(value))) errors.push(...chronologyErrors(value,`${artifact}: final APPROVED sign-off`,registry));
  }
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i=0;i<lines.length;i+=1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length || !isSeparator(lines[i+1] ?? '',headers.length)) continue;
    const normalized = headers.map((cell)=>normalize(cell).toLowerCase());
    const approvalIndex = normalized.indexOf('approval');
    if (approvalIndex < 0) continue;
    for (let j=i+2;j<lines.length;j+=1) {
      const row = markdownCells(lines[j]);
      if (!row.length) break;
      if (row.length !== headers.length) {
        errors.push(`${artifact}: approval table row ${j+1} width mismatch`);
        continue;
      }
      const value = row[approvalIndex] ?? '';
      if (/^APPROVED\b/i.test(normalize(value))) errors.push(...chronologyErrors(value,`${artifact}: table APPROVED row ${j+1}`,registry));
    }
  }
  return errors;
}

function repositoryCheck() {
  const errors = [];
  const absoluteRegistry = path.join(root,registryPath);
  if (!fs.existsSync(absoluteRegistry)) {
    console.error(`ERROR: ${registryPath}: missing controlled reviewer registry`);
    process.exit(1);
  }
  const parsed = parseRegistry(fs.readFileSync(absoluteRegistry,'utf8'));
  errors.push(...parsed.errors);
  for (const fn of functions) {
    const matrix = readMatrix(fn);
    if (matrix.discoveryError) errors.push(`${matrix.label}: ${matrix.discoveryError}`);
    else errors.push(...validateMatrix(matrix.text,fn,matrix.label,parsed.records));
  }
  const artifacts = ['docs/DGR_STAGE_2B_STATUS.md'];
  for (const fn of functions) artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`,`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  for (const artifact of artifacts) {
    const absolute = path.join(root,artifact);
    if (fs.existsSync(absolute)) errors.push(...validateStructuredArtifacts(fs.readFileSync(absolute,'utf8'),artifact,parsed.records));
  }
  if (errors.length) {
    errors.forEach((error)=>console.error(`ERROR: ${error}`));
    console.error(`\nDGR REVIEWER ADMISSION CHRONOLOGY CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }
  console.log('DGR REVIEWER ADMISSION CHRONOLOGY CHECK: PASS');
  console.log('PASS means terminal review/sign-off identity is bound to the referenced active OWNER VERIFIED reviewer and dates do not predate owner admission; it does not prove regulatory correctness or reviewer competence.');
}

function fixtureRegistry() {
  return [
    '| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |',
    '|---|---|---|---|---|---|---|---|---|',
    '| DGR-RVW-0001 | Jane Doe | HUMAN | DGR/CBTA Instructor credential reviewed | YES | OWNER VERIFIED | 2026-09-06 | qualification-ref=QR-001; bilingual-ref=BR-001 | YES |',
  ].join('\n');
}

function fixtureMatrix({frState='DRAFT',frReviewer='pending',enState='BILINGUAL TECHNICAL REVIEW REQUIRED',enReviewer='pending'}={}) {
  return [
    '| Function | Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |',
    '|---|---|---|---|---|---|',
    `| 7.2 | 0.1.1 | ${frState} | ${frReviewer} | ${enState} | ${enReviewer} |`,
  ].join('\n');
}

function expect(name, errors, shouldFail) {
  if ((errors.length > 0) !== shouldFail) throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(' | ')}`);
}

function fixtures() {
  const parsed = parseRegistry(fixtureRegistry(),'fixture-registry.md');
  expect('valid-registry',parsed.errors,false);
  const registry = parsed.records;
  expect('same-day-fr',validateMatrix(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06'}),'7.2','same-day-fr.md',registry),false);
  expect('pre-admission-fr',validateMatrix(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-05'}),'7.2','pre-admission-fr.md',registry),true);
  expect('mismatched-name-fr',validateMatrix(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'John Smith, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06'}),'7.2','mismatched-name-fr.md',registry),true);
  expect('same-day-en',validateMatrix(fixtureMatrix({enState:'BILINGUAL TECHNICAL REVIEW COMPLETE',enReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer, 2026-09-06'}),'7.2','same-day-en.md',registry),false);
  expect('pre-admission-en',validateMatrix(fixtureMatrix({enState:'BILINGUAL TECHNICAL REVIEW COMPLETE',enReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer, 2026-09-05'}),'7.2','pre-admission-en.md',registry),true);
  expect('mismatched-name-en',validateMatrix(fixtureMatrix({enState:'BILINGUAL TECHNICAL REVIEW COMPLETE',enReviewer:'John Smith, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer, 2026-09-06'}),'7.2','mismatched-name-en.md',registry),true);
  const validArtifact = '**FR status:** FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer, 2026-09-06)\n**Approval:** APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001, 2026-09-06\n';
  expect('same-day-artifact',validateStructuredArtifacts(validArtifact,'valid.md',registry),false);
  expect('pre-admission-fr-artifact',validateStructuredArtifacts(validArtifact.replace('DGR/CBTA Instructor, 2026-09-06','DGR/CBTA Instructor, 2026-09-05'),'pre-fr.md',registry),true);
  expect('pre-admission-en-artifact',validateStructuredArtifacts(validArtifact.replace('Bilingual DGR Reviewer, 2026-09-06','Bilingual DGR Reviewer, 2026-09-05'),'pre-en.md',registry),true);
  expect('pre-admission-approval',validateStructuredArtifacts(validArtifact.replace('APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001, 2026-09-06','APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001, 2026-09-05'),'pre-approval.md',registry),true);
  expect('borrowed-id-fr-artifact',validateStructuredArtifacts(validArtifact.replace('reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor','reviewed by John Smith, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor'),'borrowed-id-fr.md',registry),true);
  expect('borrowed-id-en-artifact',validateStructuredArtifacts(validArtifact.replace('reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer','reviewed by John Smith, reviewer-id=DGR-RVW-0001, Bilingual DGR Reviewer'),'borrowed-id-en.md',registry),true);
  expect('borrowed-id-approval',validateStructuredArtifacts(validArtifact.replace('APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001','APPROVED — John Smith, reviewer-id=DGR-RVW-0001'),'borrowed-id-approval.md',registry),true);
  console.log('DGR reviewer admission chronology regression fixtures: PASS');
}

if (process.argv.includes('--test')) fixtures();
else repositoryCheck();
