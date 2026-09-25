#!/usr/bin/env node

/**
 * Fail-closed structural guard for durable DGR approval tables.
 *
 * The semantic approval-chain checker reads Markdown tables by starting two
 * lines after a recognised header. This companion guard ensures that the line
 * in between is a real Markdown separator, so a first data row can never be
 * mistaken for the separator and silently skipped.
 *
 * It also prevents duplicate governance-sensitive header fields from creating
 * ambiguous human-visible state while downstream semantic parsers consume only
 * the first matching column.
 *
 * This checker validates table structure only. It does not decide regulatory
 * correctness, verify Tier-A evidence, approve questions, or imply ANAC/IATA
 * approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const requiredApprovalHeaders = ["id", "fr status", "en status", "approval"];

function normalize(value = "") {
  return String(value).replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
}

function cells(line = "") {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((value) => value.trim());
}

function isMarkdownSeparator(line, expectedCells) {
  const row = cells(line);
  return expectedCells > 0 && row.length === expectedCells && row.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function normalizedHeaders(headers) {
  return headers.map((value) => normalize(value).toLowerCase());
}

function isApprovalHeader(headers) {
  const normalized = normalizedHeaders(headers);
  return requiredApprovalHeaders.every((required) => normalized.includes(required));
}

function duplicateGovernanceHeaders(headers) {
  const normalized = normalizedHeaders(headers);
  return requiredApprovalHeaders.filter(
    (required) => normalized.filter((header) => header === required).length > 1,
  );
}

function validateText(text, artifact) {
  const errors = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const headers = cells(lines[i]);
    if (!headers.length || !isApprovalHeader(headers)) continue;

    const duplicates = duplicateGovernanceHeaders(headers);
    if (duplicates.length) {
      errors.push(
        `${artifact}: approval table header at line ${i + 1} contains duplicate governance column(s): ${duplicates.join(", ")}`,
      );
      continue;
    }

    const separator = lines[i + 1] ?? "";
    if (!isMarkdownSeparator(separator, headers.length)) {
      errors.push(`${artifact}: approval table header at line ${i + 1} is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      if (row.length !== headers.length) {
        errors.push(`${artifact}: approval table row ${j + 1} has ${row.length} cell(s), expected ${headers.length}`);
      }
    }
  }

  return errors;
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
}

function repositoryCheck() {
  const artifacts = ["docs/DGR_STAGE_2B_STATUS.md"];
  for (const fn of functions) {
    artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`);
    artifacts.push(`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  }

  const errors = [];
  for (const artifact of artifacts) {
    const text = read(artifact);
    if (!text) continue;
    errors.push(...validateText(text, artifact));
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR APPROVAL-TABLE STRUCTURE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR APPROVAL-TABLE STRUCTURE CHECK: PASS");
  console.log("PASS validates only durable approval-table Markdown structure; semantic approval and regulatory evidence remain separate gates.");
}

function expect(name, text, shouldFail) {
  const errors = validateText(text, `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  expect(
    "valid-approval-table",
    `| ID | FR status | EN status | Approval |\n|---|---|---|---|\n| Q-7.3-001 | DRAFT | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |\n`,
    false,
  );

  expect(
    "valid-approval-table-with-review-columns",
    `| ID | FR status | EN status | Approval | Qualified reviewer | Review date |\n|---|---|---|---|---|---|\n| Q-7.3-001 | DRAFT | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE | — | — |\n`,
    false,
  );

  expect(
    "duplicate-approval-header",
    `| ID | FR status | EN status | Approval | Approval |\n|---|---|---|---|---|\n| Q-7.3-001 | DRAFT | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE | APPROVED — Jane Doe, 2026-09-06 |\n`,
    true,
  );

  expect(
    "duplicate-fr-status-header",
    `| ID | FR status | FR status | EN status | Approval |\n|---|---|---|---|---|\n| Q-7.3-001 | DRAFT | FROZEN FR / SOURCE VERIFIED | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |\n`,
    true,
  );

  expect(
    "first-data-row-cannot-be-separator",
    `| ID | FR status | EN status | Approval |\n| Q-7.3-001 | FROZEN FR / SOURCE VERIFIED | BILINGUAL TECHNICAL REVIEW REQUIRED | APPROVED — Jane Doe, 2026-09-06 |\n`,
    true,
  );

  expect(
    "wrong-width-separator",
    `| ID | FR status | EN status | Approval |\n|---|---|---|\n| Q-7.3-001 | DRAFT | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |\n`,
    true,
  );

  expect(
    "aligned-separator",
    `| ID | FR status | EN status | Approval |\n|:---|---:|:---:|---|\n| Q-7.3-001 | DRAFT | BILINGUAL TECHNICAL REVIEW REQUIRED | PENDING REVIEWER + DATE |\n`,
    false,
  );

  console.log("DGR approval-table structure regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
