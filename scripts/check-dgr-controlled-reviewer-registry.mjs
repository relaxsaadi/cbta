#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const functions = ['7.1','7.2','7.3','7.4','7.5','7.6','7.7','7.8','7.9','7.10'];
const registryPath = 'docs/DGR_REVIEWER_REGISTRY.md';
const isoDateRe = /\b\d{4}-\d{2}-\d{2}\b/g;
const reviewerRefRe = /\breviewer-id\s*=\s*(DGR-RVW-\d{4,})\b/giu;
const nonVerifiedFrRe = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|NOT VERIFIED|UNVERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED|NOT ATTEMPTED|UNATTEMPTED/i;
const nonCompleteEnRe = /NOT YET REVIEWED|NOT REVIEWED|REVIEW REQUIRED|BILINGUAL TECHNICAL REVIEW REQUIRED|\bPENDING\b|\bDRAFT\b|SOURCE GAP|SOURCE CONFLICT/i;
const qualificationRe = /\b(?:DGR|CBTA|Dangerous Goods|Marchandises dangereuses)\b/i;
const expectedRegistryHeaders = [
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

function markdownCells(line) {
  const text = line.trim();
  if (!text.startsWith('|') || !text.endsWith('|')) return [];
  return text.slice(1,-1).split('|').map((cell)=>cell.trim());
}

function isMarkdownSeparatorRow(line, expectedCells) {
  const cells = markdownCells(line);
  return expectedCells > 0 && cells.length === expectedCells && cells.every((cell)=>/^:?-{3,}:?$/.test(cell));
}

function strictCivilNonFutureDate(value) {
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
  const lines = text.split(/\r?\n/);
  let found = false;

  for (let i=0;i<lines.length;i+=1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalizedHeaders = headers.map((cell)=>normalize(cell).toLowerCase());
    if (normalizedHeaders.length !== expectedRegistryHeaders.length || !normalizedHeaders.every((cell,index)=>cell === expectedRegistryHeaders[index])) continue;
    if (found) {
      errors.push(`${artifact}: more than one canonical reviewer registry table found`);
      continue;
    }
    found = true;
    if (!isMarkdownSeparatorRow(lines[i+1] ?? '', headers.length)) {
      errors.push(`${artifact}: reviewer registry header is not followed by a valid same-width Markdown separator`);
      continue;
    }

    for (let j=i+2;j<lines.length;j+=1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`${artifact}: registry row ${j+1} has ${cells.length} cell(s), expected ${headers.length}`);
        continue;
      }
      const [rawId,rawName,rawType,rawQualification,rawBilingual,rawAdmission,rawAdmissionDate,rawEvidence,rawActive] = cells;
      const id = normalize(rawId).toUpperCase();
      if (!id || /^[-–—]+$/.test(id)) continue;
      const fullName = normalize(rawName);
      const recordType = normalize(rawType).toUpperCase();
      const qualification = normalize(rawQualification);
      const bilingual = normalize(rawBilingual).toUpperCase();
      const admission = normalize(rawAdmission).toUpperCase();
      const admissionDate = normalize(rawAdmissionDate);
      const evidenceReference = normalize(rawEvidence);
      const active = normalize(rawActive).toUpperCase();

      if (!/^DGR-RVW-\d{4,}$/.test(id)) errors.push(`${artifact}: row ${j+1} has invalid Reviewer ID "${id}"`);
      if (records.has(id)) errors.push(`${artifact}: duplicate Reviewer ID ${id}`);
      if (!fullName || /^(?:pending|tbd|unknown|n\/a)$/i.test(fullName)) errors.push(`${artifact}: ${id}: Full name must be an explicit recorded person name`);
      if (recordType !== 'HUMAN') errors.push(`${artifact}: ${id}: Record type must be HUMAN`);
      if (!qualificationRe.test(qualification)) errors.push(`${artifact}: ${id}: DGR/CBTA qualification evidence is missing`);
      if (!['YES','NO','PENDING'].includes(bilingual)) errors.push(`${artifact}: ${id}: Bilingual FR/EN evidence must be YES, NO, or PENDING`);
      if (!['OWNER VERIFIED','PENDING'].includes(admission)) errors.push(`${artifact}: ${id}: Admission state must be OWNER VERIFIED or PENDING`);
      if (!['YES','NO'].includes(active)) errors.push(`${artifact}: ${id}: Active must be YES or NO`);
      if (admission === 'OWNER VERIFIED') {
        if (!strictCivilNonFutureDate(admissionDate)) errors.push(`${artifact}: ${id}: OWNER VERIFIED admission requires a real non-future Admission date`);
        if (!evidenceReference || /^(?:pending|tbd|unknown|n\/a)$/i.test(evidenceReference)) errors.push(`${artifact}: ${id}: OWNER VERIFIED admission requires a non-secret evidence reference`);
      } else if (active === 'YES') {
        errors.push(`${artifact}: ${id}: PENDING reviewer cannot be Active=YES`);
      }
      records.set(id,{id,fullName,recordType,qualification,bilingual,admission,admissionDate,evidenceReference,active});
    }
  }

  if (!found) errors.push(`${artifact}: missing canonical reviewer registry table`);
  return {errors,records};
}

function firstIdentitySegment(value,{approval=false}={}) {
  let text = normalize(value);
  if (approval) text = text.replace(/^APPROVED\b\s*[:\-–—]?\s*/i,'');
  text = text.replace(isoDateRe,' ').trim();
  text = text.replace(/^[,;:\-–—\s]+/,'');
  return text.split(/\s+[—–-]\s+|\s*,\s*|\s*;\s*|\s*\(/,1)[0].trim();
}

function reviewerReferenceErrors(value,label,registry,{requireBilingual=false,approval=false}={}) {
  const text = normalize(value);
  const errors = [];
  const refs = [...text.matchAll(reviewerRefRe)].map((match)=>(match[1] ?? '').toUpperCase());
  if (refs.length !== 1) {
    errors.push(`${label}: terminal review/sign-off must contain exactly one reviewer-id=DGR-RVW-#### reference`);
    return errors;
  }
  const id = refs[0];
  const record = registry.get(id);
  if (!record) {
    errors.push(`${label}: reviewer reference ${id} is not present in ${registryPath}`);
    return errors;
  }
  if (record.recordType !== 'HUMAN' || record.admission !== 'OWNER VERIFIED' || record.active !== 'YES') {
    errors.push(`${label}: reviewer ${id} is not an active owner-verified HUMAN reviewer record`);
  }
  if (!qualificationRe.test(record.qualification)) errors.push(`${label}: reviewer ${id} lacks recorded DGR/CBTA qualification evidence`);
  if (requireBilingual && record.bilingual !== 'YES') errors.push(`${label}: reviewer ${id} lacks OWNER-VERIFIED bilingual FR/EN evidence`);

  const identity = firstIdentitySegment(text,{approval});
  if (normalize(identity).toLocaleLowerCase('fr') !== normalize(record.fullName).toLocaleLowerCase('fr')) {
    errors.push(`${label}: identity segment "${identity || 'empty'}" does not exactly match registry Full name for ${id}`);
  }
  const dates = [...text.matchAll(isoDateRe)].map((match)=>match[0]);
  if (dates.length !== 1 || !strictCivilNonFutureDate(dates[0])) {
    errors.push(`${label}: terminal review/sign-off must contain exactly one real non-future ISO review date`);
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

function validateMatrixText(text,fn,artifact,registry) {
  const errors = [];
  const lines = text.split(/\r?\n/);
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
    if (found) { errors.push(`${artifact}: more than one canonical matrix reviewer table found`); continue; }
    found = true;
    if (!isMarkdownSeparatorRow(lines[i+1] ?? '',headers.length)) { errors.push(`${artifact}: canonical matrix header lacks a valid same-width separator`); continue; }
    for (let j=i+2;j<lines.length;j+=1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) { errors.push(`${artifact}: matrix row ${j+1} width mismatch`); continue; }
      const declaredFunction = normalize(cells[functionIndex] ?? '');
      const taskId = normalize(cells[taskIndex] ?? '');
      if (!taskId || /^[-–—]+$/.test(taskId)) continue;
      if (declaredFunction !== fn) errors.push(`${artifact}: task ${taskId} declares Function "${declaredFunction}" instead of ${fn}`);
      if (claimsFrVerified(cells[frStateIndex] ?? '')) errors.push(...reviewerReferenceErrors(cells[frReviewerIndex] ?? '',`${artifact}: task ${taskId} FR verifier`,registry));
      if (claimsEnComplete(cells[enStateIndex] ?? '')) errors.push(...reviewerReferenceErrors(cells[enReviewerIndex] ?? '',`${artifact}: task ${taskId} EN reviewer`,registry,{requireBilingual:true}));
    }
  }
  if (!found) errors.push(`${artifact}: no canonical matrix reviewer table found`);
  return errors;
}

function validateStructuredReviewArtifacts(text,artifact,registry) {
  const errors = [];
  const completionPatterns = [
    ['FR technical review',/FR TECHNICAL REVIEW COMPLETE\s*\(reviewed by\s+([^)]*)\)/gim,false],
    ['EN bilingual review',/BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/gim,true],
  ];
  for (const [label,pattern,requireBilingual] of completionPatterns) {
    for (const match of text.matchAll(pattern)) errors.push(...reviewerReferenceErrors(match[1] ?? '',`${artifact}: ${label}`,registry,{requireBilingual}));
  }
  for (const match of text.matchAll(/^\s*(?:[-+*]\s+)?\*\*Approval:\*\*\s*(.+)$/gim)) {
    const value = match[1] ?? '';
    if (/^APPROVED\b/i.test(normalize(value))) errors.push(...reviewerReferenceErrors(value,`${artifact}: final APPROVED sign-off`,registry,{approval:true}));
  }
  const lines = text.split(/\r?\n/);
  for (let i=0;i<lines.length;i+=1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length || !isMarkdownSeparatorRow(lines[i+1] ?? '',headers.length)) continue;
    const normalized = headers.map((cell)=>normalize(cell).toLowerCase());
    const approvalIndex = normalized.indexOf('approval');
    if (approvalIndex < 0) continue;
    for (let j=i+2;j<lines.length;j+=1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) { errors.push(`${artifact}: approval table row ${j+1} width mismatch`); continue; }
      const value = cells[approvalIndex] ?? '';
      if (/^APPROVED\b/i.test(normalize(value))) errors.push(...reviewerReferenceErrors(value,`${artifact}: table APPROVED row ${j+1}`,registry,{approval:true}));
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
  const parsedRegistry = parseRegistry(fs.readFileSync(absoluteRegistry,'utf8'));
  errors.push(...parsedRegistry.errors);
  for (const fn of functions) {
    const matrix = readMatrix(fn);
    if (matrix.discoveryError) errors.push(`${matrix.label}: ${matrix.discoveryError}`);
    else errors.push(...validateMatrixText(matrix.text,fn,matrix.label,parsedRegistry.records));
  }
  const artifacts = ['docs/DGR_STAGE_2B_STATUS.md'];
  for (const fn of functions) artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`,`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  for (const artifact of artifacts) {
    const absolute = path.join(root,artifact);
    if (!fs.existsSync(absolute)) continue;
    errors.push(...validateStructuredReviewArtifacts(fs.readFileSync(absolute,'utf8'),artifact,parsedRegistry.records));
  }
  if (errors.length) {
    errors.forEach((error)=>console.error(`ERROR: ${error}`));
    console.error(`\nDGR CONTROLLED REVIEWER-REFERENCE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }
  console.log('DGR CONTROLLED REVIEWER-REFERENCE CHECK: PASS');
  console.log('PASS validates controlled recorded reviewer references only; real-world identity, credential authenticity and regulatory correctness remain human responsibilities.');
}

function fixtureRegistry() {
  return [
    '| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |',
    '|---|---|---|---|---|---|---|---|---|',
    '| DGR-RVW-0001 | Jane Doe | HUMAN | DGR/CBTA Instructor credential reviewed | YES | OWNER VERIFIED | 2026-09-06 | owner-reviewed credential ref | YES |',
    '| DGR-RVW-0002 | John Smith | HUMAN | Dangerous Goods instructor credential reviewed | NO | OWNER VERIFIED | 2026-09-06 | owner-reviewed credential ref | YES |',
  ].join('\n');
}

function fixtureMatrix({frState='DRAFT',frReviewer='pending',enState='BILINGUAL TECHNICAL REVIEW REQUIRED',enReviewer='pending'}={}) {
  return [
    '| Function | Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |',
    '|---|---|---|---|---|---|',
    `| 7.2 | 0.1.1 | ${frState} | ${frReviewer} | ${enState} | ${enReviewer} |`,
  ].join('\n');
}

function expect(name,errors,shouldFail) {
  if ((errors.length>0)!==shouldFail) throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(' | ')}`);
}

function fixtures() {
  const parsed = parseRegistry(fixtureRegistry(),'fixture-registry.md');
  expect('valid-registry',parsed.errors,false);
  const registry = parsed.records;
  expect('pending-matrix',validateMatrixText(fixtureMatrix(), '7.2','pending.md',registry),false);
  expect('valid-fr-reference',validateMatrixText(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06'}),'7.2','valid-fr.md',registry),false);
  expect('role-only-fr-without-reference',validateMatrixText(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'Flight Operations, DGR/CBTA Instructor, 2026-09-06'}),'7.2','role-only-fr.md',registry),true);
  expect('mismatched-name',validateMatrixText(fixtureMatrix({frState:'FROZEN FR / SOURCE VERIFIED',frReviewer:'Flight Operations, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06'}),'7.2','mismatched-name.md',registry),true);
  expect('valid-bilingual',validateMatrixText(fixtureMatrix({enState:'BILINGUAL TECHNICAL REVIEW COMPLETE',enReviewer:'Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR/CBTA Reviewer FR/EN, 2026-09-06'}),'7.2','valid-en.md',registry),false);
  expect('non-bilingual-record',validateMatrixText(fixtureMatrix({enState:'BILINGUAL TECHNICAL REVIEW COMPLETE',enReviewer:'John Smith, reviewer-id=DGR-RVW-0002, Bilingual DGR/CBTA Reviewer FR/EN, 2026-09-06'}),'7.2','non-bilingual.md',registry),true);
  const validArtifact = '**FR status:** FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor, 2026-09-06)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR/CBTA Reviewer FR/EN, 2026-09-06)\n**Approval:** APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001, 2026-09-06\n';
  expect('valid-artifact',validateStructuredReviewArtifacts(validArtifact,'valid-artifact.md',registry),false);
  expect('flight-operations-fr',validateStructuredReviewArtifacts(validArtifact.replace('Jane Doe, reviewer-id=DGR-RVW-0001, DGR/CBTA Instructor','Flight Operations, DGR/CBTA Instructor'),'flight-operations-fr.md',registry),true);
  expect('flight-operations-en',validateStructuredReviewArtifacts(validArtifact.replace('Jane Doe, reviewer-id=DGR-RVW-0001, Bilingual DGR/CBTA Reviewer FR/EN','Flight Operations, Bilingual DGR/CBTA Reviewer FR/EN'),'flight-operations-en.md',registry),true);
  expect('flight-operations-approval',validateStructuredReviewArtifacts(validArtifact.replace('APPROVED — Jane Doe, reviewer-id=DGR-RVW-0001, 2026-09-06','APPROVED — Flight Operations, 2026-09-06'),'flight-operations-approval.md',registry),true);
  console.log('DGR controlled reviewer-reference regression fixtures: PASS');
}

if (process.argv.includes('--test')) fixtures();
else repositoryCheck();
