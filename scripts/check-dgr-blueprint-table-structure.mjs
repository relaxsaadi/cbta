#!/usr/bin/env node

/**
 * Fail-closed Markdown-table structure guard for Stage 2A blueprints.
 *
 * This companion guard is intentionally structural only. It does not validate
 * IATA DGR regulatory text, source correctness, reviewer qualifications,
 * ANAC/IATA approval, or production readiness.
 *
 * Invariants for every Function 7.1 through 7.10 blueprint task table:
 * - a recognized task-table header must contain exactly one task-identifier
 *   header alias, in the first column;
 * - a recognized task-table header must be immediately followed by a real
 *   Markdown separator row;
 * - the separator width must equal the header width;
 * - every contiguous pipe-delimited row belonging to that table must preserve
 *   the same column width.
 *
 * The existing blueprint coverage guard remains responsible for canonical
 * task-ID presence, duplicate detection, foreign IDs, and combined pools.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const taskIdHeaderAliases = new Set(["id", "official task", "task id", "sub-task id", "subtask id"]);

let failed = false;

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function cleanCell(value) {
  return value
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function parseMarkdownCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed.slice(1, -1).split("|").map((cell) => cleanCell(cell));
}

function isMarkdownSeparatorRow(cells, expectedWidth) {
  if (!cells || cells.length !== expectedWidth) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function taskIdHeaderCount(header) {
  return header.filter((cell) => taskIdHeaderAliases.has(cell.toLowerCase())).length;
}

function validateBlueprintTableStructure(text, label, report = fail) {
  const lines = text.split(/\r?\n/);
  let taskTables = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const header = parseMarkdownCells(lines[i]);
    if (!header?.length) continue;

    const firstHeader = (header[0] ?? "").toLowerCase();
    if (!taskIdHeaderAliases.has(firstHeader)) continue;

    taskTables += 1;
    const identifierColumns = taskIdHeaderCount(header);
    if (identifierColumns !== 1) {
      report(
        `${label}: task-table header at line ${i + 1} has ${identifierColumns} task-identifier header columns; expected exactly one in the first column`,
      );
    }

    const expectedWidth = header.length;
    const separator = parseMarkdownCells(lines[i + 1] ?? "");
    if (!isMarkdownSeparatorRow(separator, expectedWidth)) {
      report(
        `${label}: task-table header at line ${i + 1} is not followed by a valid ${expectedWidth}-column Markdown separator row`,
      );
      continue;
    }

    let j = i + 2;
    for (; j < lines.length; j += 1) {
      const row = parseMarkdownCells(lines[j]);
      if (!row) break;
      if (row.length !== expectedWidth) {
        report(
          `${label}: task-table row ${j + 1} has ${row.length} columns; expected ${expectedWidth}`,
        );
      }
    }

    i = j - 1;
  }

  if (!taskTables) report(`${label}: no recognized Stage 2A task table found`);
  return taskTables;
}

function runRegressionFixtures() {
  const errors = [];
  const expectClean = (name, text) => {
    const observed = [];
    validateBlueprintTableStructure(text, name, (message) => observed.push(message));
    if (observed.length) errors.push(`${name}: valid fixture rejected: ${observed.join("; ")}`);
  };
  const expectRejected = (name, text, expectedFragment) => {
    const observed = [];
    validateBlueprintTableStructure(text, name, (message) => observed.push(message));
    if (!observed.some((message) => message.includes(expectedFragment))) {
      errors.push(`${name}: malformed fixture was not rejected as expected (${expectedFragment})`);
    }
  };

  expectClean(
    "fixture valid",
    `# Function 7.9\n\n| ID | Sub-task | Count |\n|---|---|---|\n| 0.1.1 | A | 1 |\n| 0.1.2 | B | 1 |\n| **0.1 subtotal** | | **2** |`,
  );

  expectClean(
    "fixture alternate identifier alias",
    `# Function 7.1\n\n| Official task | Recovered source-yield ceiling | Blueprint state |\n|---|---|---|\n| 0.1.1 | 2 | RECOVERED |`,
  );

  expectClean(
    "fixture combined",
    `# Function 7.2\n\n| ID | Sub-task | Count |\n|---|---|---|\n| 7.1 + 7.2 (combined pool) | Shared source-supported pool | 2 |`,
  );

  expectRejected(
    "fixture duplicate exact identifier header",
    `# Function 7.9\n\n| ID | ID | Sub-task |\n|---|---|---|\n| 0.1.1 | 9.9.9 | A |`,
    "task-identifier header columns; expected exactly one",
  );

  expectRejected(
    "fixture duplicate mixed identifier aliases",
    `# Function 7.9\n\n| ID | Task ID | Sub-task |\n|---|---|---|\n| 0.1.1 | 9.9.9 | A |`,
    "task-identifier header columns; expected exactly one",
  );

  expectRejected(
    "fixture missing separator",
    `# Function 7.9\n\n| ID | Sub-task |\n| 0.1.1 | A |\n| 0.1.2 | B |`,
    "not followed by a valid",
  );

  expectRejected(
    "fixture data row as separator",
    `# Function 7.9\n\n| ID | Sub-task | Count |\n| 0.1.1 | A | 1 |\n| 0.1.2 | B | 1 |`,
    "not followed by a valid",
  );

  expectRejected(
    "fixture wrong-width separator",
    `# Function 7.9\n\n| ID | Sub-task | Count |\n|---|---|\n| 0.1.1 | A | 1 |`,
    "not followed by a valid",
  );

  expectRejected(
    "fixture wrong-width data row",
    `# Function 7.9\n\n| ID | Sub-task | Count |\n|---|---|---|\n| 0.1.1 | A |\n| 0.1.2 | B | 1 |`,
    "columns; expected",
  );

  if (errors.length) {
    for (const message of errors) console.error(`ERROR: ${message}`);
    console.error("DGR Stage 2A blueprint-table structure regression fixtures: FAIL");
    process.exit(1);
  }

  console.log("DGR Stage 2A blueprint-table structure regression fixtures: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

for (const fn of functions) {
  const relativePath = `docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`;
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`missing required blueprint: ${relativePath}`);
    continue;
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const count = validateBlueprintTableStructure(text, relativePath);
  if (count) console.log(`Function ${fn}: validated ${count} Stage 2A task table(s)`);
}

if (failed) {
  console.error("DGR Stage 2A blueprint-table structural consistency gate: FAIL");
  process.exit(1);
}

console.log("DGR Stage 2A blueprint-table structural consistency gate: PASS");
