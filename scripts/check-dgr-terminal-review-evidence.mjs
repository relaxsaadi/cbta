#!/usr/bin/env node

/**
 * Fail-closed terminal review-evidence guard for DGR/CBTA Functions 7.1-7.10.
 *
 * Existing governance gates validate names, DGR/CBTA credentials, bilingual
 * competence, real/non-future dates, source state and the Gate 1->4 chain.
 * This companion guard closes one narrower ambiguity: once a canonical FR/EN
 * review marker or an APPROVED value records its ISO date, that date must be
 * the terminal substantive token and it must be the only ISO date in that
 * evidence value. Text such as `..., 2026-09-06, PENDING` therefore fails.
 *
 * This checker never approves content and does not validate licensed IATA text.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const isoDatePattern = /\b\d{4}-\d{2}-\d{2}\b/g;

const normalize = (value = "") => value.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
const isApproved = (value = "") => /^APPROVED\b/i.test(normalize(value));

function substantiveTail(value) {
  return /[\p{L}\p{N}]/u.test(value);
}

function terminalDateErrors(value, label) {
  const text = normalize(value);
  const dates = [...text.matchAll(isoDatePattern)].map((match) => ({ value: match[0], index: match.index ?? -1 }));
  const errors = [];

  if (dates.length !== 1) {
    errors.push(`${label}: expected exactly one ISO date, found ${dates.length}`);
    return errors;
  }

  const date = dates[0];
  const tail = text.slice(date.index + date.value.length).trim();
  if (tail && substantiveTail(tail)) {
    errors.push(`${label}: substantive trailing text appears after terminal review/sign-off date: "${tail}"`);
  }

  return errors;
}

function markdownCells(line) {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((cell) => cell.trim());
}

function validateArtifact(text, artifact) {
  const errors = [];

  const completionPatterns = [
    ["FR technical review", /FR TECHNICAL REVIEW COMPLETE\s*\(reviewed by\s+([^)]*)\)/gim],
    ["EN bilingual review", /BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/gim],
  ];

  for (const [label, pattern] of completionPatterns) {
    for (const match of text.matchAll(pattern)) {
      errors.push(...terminalDateErrors(match[1] ?? "", `${artifact}: ${label} completion evidence`));
    }
  }

  for (const match of text.matchAll(/^\s*\*\*Approval:\*\*\s*(.+)$/gim)) {
    const value = match[1] ?? "";
    if (isApproved(value)) {
      errors.push(...terminalDateErrors(value, `${artifact}: APPROVED field`));
    }
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const approvalIndex = headers.map((cell) => normalize(cell).toLowerCase()).indexOf("approval");
    if (approvalIndex < 0 || !markdownCells(lines[i + 1] ?? "").length) continue;

    for (let j = i + 2; j < lines.length; j += 1) {
      const row = markdownCells(lines[j]);
      if (!row.length) break;
      const value = row[approvalIndex] ?? "";
      if (isApproved(value)) {
        errors.push(...terminalDateErrors(value, `${artifact}: table APPROVED row ${j + 1}`));
      }
    }
  }

  return errors;
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : null;
}

function repositoryCheck() {
  const errors = [];
  const artifacts = ["docs/DGR_STAGE_2B_STATUS.md"];
  for (const fn of functions) {
    artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`);
    artifacts.push(`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  }

  for (const artifact of artifacts) {
    const text = read(artifact);
    if (text === null) continue;
    errors.push(...validateArtifact(text, artifact));
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR TERMINAL REVIEW-EVIDENCE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR TERMINAL REVIEW-EVIDENCE CHECK: PASS");
  console.log("PASS validates only terminal-date evidence syntax; it does not prove regulatory correctness or ANAC/IATA approval.");
}

function expect(name, text, shouldFail) {
  const errors = validateArtifact(text, `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  const valid = `## Q-7.2-001\n\n**FR status:** FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)\n**Approval:** APPROVED — Jane Doe, 2026-09-06\n`;

  expect("valid-terminal-evidence", valid, false);
  expect(
    "fr-trailing-pending",
    valid.replace("DGR/CBTA Instructor, 2026-09-06)", "DGR/CBTA Instructor, 2026-09-06, PENDING)"),
    true,
  );
  expect(
    "en-trailing-todo",
    valid.replace("Bilingual DGR Reviewer, 2026-09-06)", "Bilingual DGR Reviewer, 2026-09-06, TODO)"),
    true,
  );
  expect(
    "approval-trailing-pending",
    valid.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Jane Doe, 2026-09-06, PENDING"),
    true,
  );
  expect(
    "multiple-review-dates",
    valid.replace("DGR/CBTA Instructor, 2026-09-06)", "DGR/CBTA Instructor, 2026-09-05, 2026-09-06)"),
    true,
  );
  expect(
    "ordinary-pending",
    `## Q-7.2-002\n\n**FR status:** DRAFT\n**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**Approval:** PENDING REVIEWER + DATE\n`,
    false,
  );

  console.log("DGR terminal review-evidence regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
