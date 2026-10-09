#!/usr/bin/env node

/**
 * Fail-closed Markdown-table structure guard for canonical CBTA official-task
 * sets covering Functions 7.1 through 7.10.
 *
 * This companion guard is intentionally structural only. It does not validate
 * licensed IATA DGR regulatory text, Tier-A evidence, reviewer qualifications,
 * ANAC/IATA approval, or production readiness.
 *
 * Invariants for each canonical official-task table:
 * - exactly one recognized table is present in the dedicated task-set artifact;
 * - the recognized header contains exactly the canonical governance columns
 *   `Function | Official task ID | CBTA task-source reference`, in that order,
 *   with no duplicate or extra columns;
 * - the recognized header is immediately followed by a real Markdown
 *   separator row of the same width;
 * - every contiguous pipe-delimited data row preserves the header width.
 *
 * The existing official-task coverage gate remains responsible for Function
 * identity, task IDs, source-reference presence, duplicates, and exact equality
 * between the independent task set and the source/competency matrix.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const canonicalHeaders = ["function", "official task id", "cbta task-source reference"];
let failed = false;

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function cleanCell(value) {
  return value
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarkdownCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed.slice(1, -1).split("|").map((cell) => cleanCell(cell));
}

function normalized(value) {
  return cleanCell(value).toLowerCase();
}

function isCanonicalHeader(cells) {
  if (!cells?.length) return false;
  const headers = cells.map(normalized);
  return (
    headers.length === canonicalHeaders.length &&
    headers.every((header, index) => header === canonicalHeaders[index])
  );
}

function looksLikeCanonicalHeader(cells) {
  if (!cells?.length) return false;
  const headers = cells.map(normalized);
  return canonicalHeaders.every((required) => headers.includes(required));
}

function isMarkdownSeparatorRow(cells, expectedWidth) {
  if (!cells || cells.length !== expectedWidth) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function validateOfficialTaskTableStructure(text, label, report = fail) {
  const lines = text.split(/\r?\n/);
  let tables = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const header = parseMarkdownCells(lines[i]);
    if (!header) continue;

    if (looksLikeCanonicalHeader(header) && !isCanonicalHeader(header)) {
      report(
        `${label}: official-task header at line ${i + 1} must be exactly Function | Official task ID | CBTA task-source reference, with each canonical column exactly once and no extras`,
      );
      continue;
    }

    if (!isCanonicalHeader(header)) continue;

    tables += 1;
    const expectedWidth = header.length;
    const separator = parseMarkdownCells(lines[i + 1] ?? "");
    if (!isMarkdownSeparatorRow(separator, expectedWidth)) {
      report(
        `${label}: canonical official-task header at line ${i + 1} is not followed by a valid ${expectedWidth}-column Markdown separator row`,
      );
      continue;
    }

    let j = i + 2;
    for (; j < lines.length; j += 1) {
      const row = parseMarkdownCells(lines[j]);
      if (!row) break;
      if (row.length !== expectedWidth) {
        report(
          `${label}: canonical official-task row ${j + 1} has ${row.length} columns; expected ${expectedWidth}`,
        );
      }
    }

    i = j - 1;
  }

  if (!tables) report(`${label}: no canonical official-task table found`);
  if (tables > 1) report(`${label}: found ${tables} canonical official-task tables; expected exactly one`);
  return tables;
}

function runRegressionFixtures() {
  const errors = [];

  const expectClean = (name, text) => {
    const observed = [];
    validateOfficialTaskTableStructure(text, name, (message) => observed.push(message));
    if (observed.length) errors.push(`${name}: valid fixture rejected: ${observed.join("; ")}`);
  };

  const expectRejected = (name, text, expectedFragment) => {
    const observed = [];
    validateOfficialTaskTableStructure(text, name, (message) => observed.push(message));
    if (!observed.some((message) => message.includes(expectedFragment))) {
      errors.push(`${name}: malformed fixture was not rejected as expected (${expectedFragment})`);
    }
  };

  expectClean(
    "fixture valid",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference |\n|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 |\n| 7.2 | 0.1.2 | TABLEAU 7.2.A, p.23 |`,
  );

  expectRejected(
    "fixture duplicate Function header",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference | Function |\n|---|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 | 7.9 |`,
    "must be exactly Function | Official task ID | CBTA task-source reference",
  );

  expectRejected(
    "fixture duplicate task ID header",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference | Official task ID |\n|---|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 | 9.9.9 |`,
    "must be exactly Function | Official task ID | CBTA task-source reference",
  );

  expectRejected(
    "fixture duplicate task-source header",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference | CBTA task-source reference |\n|---|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 | conflicting source |`,
    "must be exactly Function | Official task ID | CBTA task-source reference",
  );

  expectRejected(
    "fixture extra header",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference | Notes |\n|---|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 | unexpected |`,
    "must be exactly Function | Official task ID | CBTA task-source reference",
  );

  expectRejected(
    "fixture reordered header",
    `# Canonical task set\n\n| Official task ID | Function | CBTA task-source reference |\n|---|---|---|\n| 0.1.1 | 7.2 | TABLEAU 7.2.A, p.23 |`,
    "must be exactly Function | Official task ID | CBTA task-source reference",
  );

  expectRejected(
    "fixture data row as separator",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference |\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 |\n| 7.2 | 0.1.2 | TABLEAU 7.2.A, p.23 |`,
    "not followed by a valid",
  );

  expectRejected(
    "fixture wrong-width separator",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference |\n|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 |`,
    "not followed by a valid",
  );

  expectRejected(
    "fixture short data row",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference |\n|---|---|---|\n| 7.2 | 0.1.1 |\n| 7.2 | 0.1.2 | TABLEAU 7.2.A, p.23 |`,
    "columns; expected",
  );

  expectRejected(
    "fixture wide data row",
    `# Canonical task set\n\n| Function | Official task ID | CBTA task-source reference |\n|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 | unexpected |\n| 7.2 | 0.1.2 | TABLEAU 7.2.A, p.23 |`,
    "columns; expected",
  );

  expectRejected(
    "fixture duplicate canonical table",
    `| Function | Official task ID | CBTA task-source reference |\n|---|---|---|\n| 7.2 | 0.1.1 | TABLEAU 7.2.A, p.23 |\n\n| Function | Official task ID | CBTA task-source reference |\n|---|---|---|\n| 7.2 | 0.1.2 | TABLEAU 7.2.A, p.23 |`,
    "expected exactly one",
  );

  if (errors.length) {
    for (const message of errors) console.error(`ERROR: ${message}`);
    console.error("DGR official-task table structure regression fixtures: FAIL");
    process.exit(1);
  }

  console.log("DGR official-task table structure regression fixtures: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

for (const fn of functions) {
  const relativePath = `docs/DGR_OFFICIAL_TASK_SET_${fn}.md`;
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing required canonical official-task set: ${relativePath}`);
    continue;
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const count = validateOfficialTaskTableStructure(text, relativePath);
  if (count === 1) console.log(`Function ${fn}: canonical official-task table structure validated`);
}

if (failed) {
  console.error("DGR official-task table structural consistency gate: FAIL");
  process.exit(1);
}

console.log("DGR official-task table structural consistency gate: PASS");
