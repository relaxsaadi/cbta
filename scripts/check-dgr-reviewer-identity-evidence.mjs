#!/usr/bin/env node

/**
 * Fail-closed named-reviewer identity guard for DGR/CBTA Functions 7.1-7.10.
 *
 * The surrounding governance gates already validate source state, reviewer
 * credentials, bilingual competence and review dates. This companion guard
 * closes a narrower identity ambiguity: a multi-word role label such as
 * "Regulatory Specialist" must never satisfy a requirement for a named human
 * verifier/reviewer merely because it contains two alphabetic tokens.
 *
 * This checker does not validate licensed IATA text, infer regulatory
 * correctness, create reviewer evidence, promote approval state or imply
 * ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const isoDateRe = /\b\d{4}-\d{2}-\d{2}\b/g;
const nonVerifiedFrRe = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|NOT VERIFIED|UNVERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED|NOT ATTEMPTED|UNATTEMPTED/i;
const nonCompleteEnRe = /NOT YET REVIEWED|NOT REVIEWED|REVIEW REQUIRED|BILINGUAL TECHNICAL REVIEW REQUIRED|\bPENDING\b|\bDRAFT\b|SOURCE GAP|SOURCE CONFLICT/i;

const roleTokenRe = /^(?:dgr|cbta|iata|anac|reviewer|review|reviewed|instructor|instructeur|trainer|formateur|verifier|vérificateur|verificateur|verified|auditor|auditeur|regulatory|réglementaire|reglementaire|specialist|spécialiste|specialiste|manager|responsable|lead|supervisor|superviseur|coordinator|coordinateur|officer|agent|expert|consultant|technical|technique|quality|qualité|qualite|compliance|conformité|conformite|training|formation|qualified|qualifié|qualifie|bilingual|bilingue|senior|junior|staff|team|operator|opérateur|operateur|admin|administrator|administrateur|personnel|dangerous|goods|marchandises|dangereuses|approved)$/iu;
const nameParticleRe = /^(?:de|du|des|le|la|ben|bin|ibn|el|al|van|von|da|di|del|della|dos|das)$/iu;

function normalize(value = "") {
  return String(value).replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
}

function markdownCells(line) {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((cell) => cell.trim());
}

function isMarkdownSeparatorRow(line, expectedCells) {
  const cells = markdownCells(line);
  return expectedCells > 0 && cells.length === expectedCells && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
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
      /^(?:COMPLETE|COMPLETED|APPROVED)\b/i.test(text),
  );
}

function strictCivilNonFutureDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const instant = new Date(Date.UTC(year, month - 1, day));
  if (
    instant.getUTCFullYear() !== year ||
    instant.getUTCMonth() !== month - 1 ||
    instant.getUTCDate() !== day
  ) return false;
  return value <= new Date().toISOString().slice(0, 10);
}

function nameSegmentFromEvidence(value, { approval = false } = {}) {
  let text = normalize(value);
  if (approval) text = text.replace(/^APPROVED\b\s*[:\-–—]?\s*/i, "");
  text = text.replace(isoDateRe, " ").trim();
  text = text.replace(/^[,;:\-–—\s]+/, "");
  return text.split(/\s+[—–-]\s+|\s*,\s*|\s*;\s*|\s*\(/, 1)[0].trim();
}

function looksLikeNamedPerson(segment) {
  const tokens = segment.match(/[\p{L}][\p{L}'’.-]*/gu) ?? [];
  if (tokens.some((token) => roleTokenRe.test(token))) return false;
  const nameTokens = tokens.filter((token) => !nameParticleRe.test(token));
  return nameTokens.length >= 2;
}

function identityEvidenceErrors(value, label, options = {}) {
  const text = normalize(value);
  const errors = [];
  const dates = [...text.matchAll(isoDateRe)].map((match) => match[0]);
  if (dates.length !== 1 || !strictCivilNonFutureDate(dates[0])) {
    errors.push(`${label}: named-reviewer evidence must contain exactly one real non-future ISO date`);
  }

  const segment = nameSegmentFromEvidence(text, options);
  if (!looksLikeNamedPerson(segment)) {
    errors.push(`${label}: reviewer identity is missing, role-only, or contains a role/title token ("${segment || "empty"}")`);
  }
  return errors;
}

function embeddedMatrixCandidates(fn) {
  if (fn === "7.1") {
    return [
      "docs/DGR_STAGE_2B_STATUS.md",
      "docs/RECOVERED_STAGE2A_CONTEXT.md",
      "docs/DGR_PRODUCTION_BANK_7.1.md",
    ];
  }
  return [
    `docs/DGR_STAGE1_FUNCTION_${fn}_DRAFT.md`,
    `docs/DGR_STAGE1_FUNCTION_${fn}_CROSSVALIDATION.md`,
    `docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`,
    `docs/DGR_PRODUCTION_BANK_${fn}.md`,
  ];
}

function readMatrix(fn) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  if (fs.existsSync(path.join(root, dedicated))) {
    return { label: dedicated, text: fs.readFileSync(path.join(root, dedicated), "utf8") };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;
  for (const candidate of embeddedMatrixCandidates(fn)) {
    const absolute = path.join(root, candidate);
    if (!fs.existsSync(absolute)) continue;
    const text = fs.readFileSync(absolute, "utf8");
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start < 0 && end < 0) continue;
    if (start < 0 || end < 0 || end <= start) {
      return { label: `${candidate} embedded matrix`, text: "", discoveryError: "malformed embedded matrix markers" };
    }
    return { label: `${candidate} embedded matrix`, text: text.slice(start + startMarker.length, end) };
  }

  return { label: `Function ${fn} source/competency matrix`, text: "", discoveryError: "missing matrix" };
}

function validateMatrixText(text, fn, artifact) {
  const errors = [];
  const lines = text.split(/\r?\n/);
  let found = false;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map((cell) => normalize(cell).toLowerCase());
    const functionIndex = normalized.indexOf("function");
    const taskIndex = normalized.indexOf("official task id");
    const frStateIndex = normalized.indexOf("fr source-verification state");
    const frReviewerIndex = normalized.indexOf("fr verifier + date");
    const enStateIndex = normalized.indexOf("en bilingual-review state");
    const enReviewerIndex = normalized.indexOf("en reviewer + date");
    if ([functionIndex, taskIndex, frStateIndex, frReviewerIndex, enStateIndex, enReviewerIndex].some((index) => index < 0)) continue;

    if (found) {
      errors.push(`${artifact}: more than one canonical matrix identity table found`);
      continue;
    }
    found = true;
    if (!isMarkdownSeparatorRow(lines[i + 1] ?? "", headers.length)) {
      errors.push(`${artifact}: matrix header is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`${artifact}: matrix row ${j + 1} has ${cells.length} cell(s), expected ${headers.length}`);
        continue;
      }
      const declaredFunction = normalize(cells[functionIndex] ?? "");
      const taskId = normalize(cells[taskIndex] ?? "");
      if (!taskId || /^[-–—]+$/.test(taskId)) continue;
      if (declaredFunction !== fn) {
        errors.push(`${artifact}: task ${taskId} declares Function "${declaredFunction}" instead of ${fn}`);
      }
      if (claimsFrVerified(cells[frStateIndex] ?? "")) {
        errors.push(...identityEvidenceErrors(cells[frReviewerIndex] ?? "", `${artifact}: task ${taskId} FR verifier`));
      }
      if (claimsEnComplete(cells[enStateIndex] ?? "")) {
        errors.push(...identityEvidenceErrors(cells[enReviewerIndex] ?? "", `${artifact}: task ${taskId} EN reviewer`));
      }
    }
  }

  if (!found) errors.push(`${artifact}: no canonical matrix with FR/EN reviewer identity columns found`);
  return errors;
}

function validateStructuredReviewArtifacts(text, artifact) {
  const errors = [];
  const completionPatterns = [
    ["FR technical review", /FR TECHNICAL REVIEW COMPLETE\s*\(reviewed by\s+([^)]*)\)/gim],
    ["EN bilingual review", /BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/gim],
  ];
  for (const [label, pattern] of completionPatterns) {
    for (const match of text.matchAll(pattern)) {
      errors.push(...identityEvidenceErrors(match[1] ?? "", `${artifact}: ${label}`));
    }
  }

  for (const match of text.matchAll(/^\s*(?:[-+*]\s+)?\*\*Approval:\*\*\s*(.+)$/gim)) {
    const value = match[1] ?? "";
    if (/^APPROVED\b/i.test(normalize(value))) {
      errors.push(...identityEvidenceErrors(value, `${artifact}: final APPROVED sign-off`, { approval: true }));
    }
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length || !isMarkdownSeparatorRow(lines[i + 1] ?? "", headers.length)) continue;
    const normalized = headers.map((cell) => normalize(cell).toLowerCase());
    const approvalIndex = normalized.indexOf("approval");
    if (approvalIndex < 0) continue;
    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`${artifact}: approval table row ${j + 1} has ${cells.length} cell(s), expected ${headers.length}`);
        continue;
      }
      const approvalValue = cells[approvalIndex] ?? "";
      if (/^APPROVED\b/i.test(normalize(approvalValue))) {
        errors.push(...identityEvidenceErrors(approvalValue, `${artifact}: table APPROVED row ${j + 1}`, { approval: true }));
      }
    }
  }

  return errors;
}

function repositoryCheck() {
  const errors = [];
  for (const fn of functions) {
    const matrix = readMatrix(fn);
    if (matrix.discoveryError) errors.push(`${matrix.label}: ${matrix.discoveryError}`);
    else errors.push(...validateMatrixText(matrix.text, fn, matrix.label));
  }

  const artifacts = ["docs/DGR_STAGE_2B_STATUS.md"];
  for (const fn of functions) {
    artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`);
    artifacts.push(`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  }
  for (const artifact of artifacts) {
    const absolute = path.join(root, artifact);
    if (!fs.existsSync(absolute)) continue;
    errors.push(...validateStructuredReviewArtifacts(fs.readFileSync(absolute, "utf8"), artifact));
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR REVIEWER IDENTITY-EVIDENCE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR REVIEWER IDENTITY-EVIDENCE CHECK: PASS");
  console.log("PASS validates only recorded human-name evidence syntax; it does not prove reviewer qualification, regulatory correctness or ANAC/IATA approval.");
}

function fixtureMatrix({ frState, frReviewer, enState, enReviewer }) {
  return [
    "| Function | Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |",
    "|---|---|---|---|---|---|",
    `| 7.2 | 0.1.1 | ${frState} | ${frReviewer} | ${enState} | ${enReviewer} |`,
  ].join("\n");
}

function expectMatrix(name, values, shouldFail) {
  const errors = validateMatrixText(fixtureMatrix(values), "7.2", `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function expectArtifact(name, text, shouldFail) {
  const errors = validateStructuredReviewArtifacts(text, `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  const validMatrix = {
    frState: "FROZEN FR / SOURCE VERIFIED",
    frReviewer: "Jane Doe — 2026-09-06",
    enState: "BILINGUAL TECHNICAL REVIEW COMPLETE",
    enReviewer: "John Smith — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-06",
  };
  expectMatrix("valid-named-reviewers", validMatrix, false);
  expectMatrix("role-only-fr-reviewer", { ...validMatrix, frReviewer: "Regulatory Specialist — 2026-09-06" }, true);
  expectMatrix("role-only-en-reviewer", { ...validMatrix, enReviewer: "Regulatory Specialist — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-06" }, true);
  expectMatrix("role-token-inside-fr-identity", { ...validMatrix, frReviewer: "Aviation Safety Officer — 2026-09-06" }, true);
  expectMatrix("role-token-inside-en-identity", { ...validMatrix, enReviewer: "Aviation Safety Officer — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-06" }, true);
  expectMatrix("hyphenated-real-name", { ...validMatrix, frReviewer: "Jean-Pierre Dupont — 2026-09-06" }, false);
  expectMatrix("pending-states-remain-representable", {
    frState: "DRAFT / NOT YET VERIFIED",
    frReviewer: "pending",
    enState: "BILINGUAL TECHNICAL REVIEW REQUIRED",
    enReviewer: "pending",
  }, false);

  const validItem = `## Q-7.2-001\n\n**FR status:** FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR/CBTA Reviewer FR/EN, 2026-09-06)\n**Approval:** APPROVED — Jane Doe, 2026-09-06\n`;
  const validListItem = validItem.replaceAll("\n**", "\n- **");
  expectArtifact("valid-item", validItem, false);
  expectArtifact("valid-list-form-item", validListItem, false);
  expectArtifact("role-only-list-form-final-approval", validListItem.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Regulatory Specialist, 2026-09-06"), true);
  expectArtifact("role-only-fr-completion", validItem.replace("Jane Doe, DGR/CBTA Instructor", "Regulatory Specialist, DGR/CBTA Instructor"), true);
  expectArtifact("role-only-en-completion", validItem.replace("John Smith, Bilingual DGR/CBTA Reviewer FR/EN", "Regulatory Specialist, Bilingual DGR/CBTA Reviewer FR/EN"), true);
  expectArtifact("role-only-final-approval", validItem.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Regulatory Specialist, 2026-09-06"), true);
  expectArtifact("aviation-safety-officer-fr-completion", validItem.replace("Jane Doe, DGR/CBTA Instructor", "Aviation Safety Officer, DGR/CBTA Instructor"), true);
  expectArtifact("aviation-safety-officer-en-completion", validItem.replace("John Smith, Bilingual DGR/CBTA Reviewer FR/EN", "Aviation Safety Officer, Bilingual DGR/CBTA Reviewer FR/EN"), true);
  expectArtifact("aviation-safety-officer-final-approval", validItem.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Aviation Safety Officer, 2026-09-06"), true);

  console.log("DGR reviewer identity-evidence regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
