#!/usr/bin/env node

/**
 * Fail-closed provenance-locator guard for the canonical CBTA official task
 * sets used by Functions 7.1–7.10.
 *
 * This validates only that each structural task row remains tied to its own
 * function-specific CBTA TABLEAU, the same task/leaf identifier, and a page
 * locator that a human reviewer can reopen. It does not validate licensed
 * IATA text, regulatory correctness, or ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
let failed = false;
let checkedRows = 0;

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function markdownTableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return [];
  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
}

function normalizedHeader(value) {
  return value
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isMarkdownSeparatorRow(cells, expectedWidth) {
  if (cells.length !== expectedWidth) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function locatorErrors({ fn, taskId, taskSource }) {
  const errors = [];
  const expectedTable = `TABLEAU ${fn}.A`;
  const tablePattern = new RegExp(`\\bTABLEAU\\s+${escapeRegExp(fn)}\\.A\\b`, "i");
  const taskLocatorPattern = new RegExp(
    `\\b(?:row|leaf(?:\\s+row)?)\\s+${escapeRegExp(taskId)}(?=$|[\\s,;:()])`,
    "i",
  );
  const pagePattern = /\b(?:PDF\s+|S1\s+|printed\s+)?p{1,2}\.?\s*\d+(?:\s*[–—-]\s*\d+)?\b/i;

  if (!taskSource.trim()) {
    errors.push("CBTA task-source reference is empty");
    return errors;
  }
  if (!tablePattern.test(taskSource)) {
    errors.push(`CBTA task-source reference must point to ${expectedTable}`);
  }
  if (!taskLocatorPattern.test(taskSource)) {
    errors.push(`CBTA task-source reference must identify task/leaf ${taskId}`);
  }
  if (!pagePattern.test(taskSource)) {
    errors.push("CBTA task-source reference must include a page locator (p./pp.)");
  }
  return errors;
}

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function validateTaskSet(fn) {
  const relativePath = `docs/DGR_OFFICIAL_TASK_SET_${fn}.md`;
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`${relativePath}: dedicated canonical official task set is missing`);
    return;
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const lines = text.split(/\r?\n/);
  let found = false;
  const taskIds = [];

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map(normalizedHeader);
    const functionIndex = normalized.indexOf("function");
    const taskIndex = normalized.indexOf("official task id");
    const sourceIndex = normalized.indexOf("cbta task-source reference");
    if ([functionIndex, taskIndex, sourceIndex].some((index) => index < 0)) continue;

    if (found) {
      fail(`${relativePath}: more than one canonical official-task table found`);
      continue;
    }
    found = true;

    const separator = markdownTableCells(lines[i + 1] ?? "");
    if (!isMarkdownSeparatorRow(separator, headers.length)) {
      fail(`${relativePath}: canonical task header is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;
      const functionCell = (cells[functionIndex] ?? "").trim();
      const taskId = (cells[taskIndex] ?? "").trim();
      const taskSource = (cells[sourceIndex] ?? "").trim();

      if (!taskId || /^[-–—]+$/.test(taskId)) {
        fail(`${relativePath}: row ${j + 1} has no Official task ID`);
        continue;
      }
      if (functionCell !== fn) {
        fail(`${relativePath}: task ${taskId} declares Function "${functionCell}" instead of ${fn}`);
      }
      taskIds.push(taskId);
      checkedRows += 1;

      for (const error of locatorErrors({ fn, taskId, taskSource })) {
        fail(`${relativePath}: task ${taskId}: ${error}`);
      }
    }
  }

  if (!found) {
    fail(`${relativePath}: no canonical table with Function / Official task ID / CBTA task-source reference headers found`);
  }
  if (!taskIds.length) {
    fail(`${relativePath}: canonical task table has no task rows`);
  }
  const dupes = duplicates(taskIds);
  if (dupes.length) {
    fail(`${relativePath}: duplicate Official task ID row(s): ${dupes.join(", ")}`);
  }
}

function runRegressionFixtures() {
  const validRow = locatorErrors({
    fn: "7.2",
    taskId: "SYN-7.2-A",
    taskSource: "Synthetic CBTA locator, TABLEAU 7.2.A, Block 0 row SYN-7.2-A, PDF p.27",
  });
  if (validRow.length) {
    console.error(`TASK SOURCE LOCATOR REGRESSION: FAIL — valid row locator rejected: ${validRow.join("; ")}`);
    process.exit(1);
  }

  const validLeaf = locatorErrors({
    fn: "7.6",
    taskId: "SYN-7.6-A",
    taskSource: "Synthetic CBTA locator, TABLEAU 7.6.A, only active Block 6 leaf SYN-7.6-A, PDF p.32",
  });
  if (validLeaf.length) {
    console.error(`TASK SOURCE LOCATOR REGRESSION: FAIL — valid leaf locator rejected: ${validLeaf.join("; ")}`);
    process.exit(1);
  }

  const wrongTable = locatorErrors({
    fn: "7.2",
    taskId: "SYN-7.2-A",
    taskSource: "Synthetic CBTA locator, TABLEAU 7.1.A, Block 0 row SYN-7.2-A, PDF p.27",
  });
  if (!wrongTable.some((error) => error.includes("TABLEAU 7.2.A"))) {
    console.error("TASK SOURCE LOCATOR REGRESSION: FAIL — wrong-function TABLEAU locator did not fail closed");
    process.exit(1);
  }

  const wrongRow = locatorErrors({
    fn: "7.2",
    taskId: "SYN-7.2-A",
    taskSource: "Synthetic CBTA locator, TABLEAU 7.2.A, Block 0 row SYN-7.2-B, PDF p.27",
  });
  if (!wrongRow.some((error) => error.includes("task/leaf SYN-7.2-A"))) {
    console.error("TASK SOURCE LOCATOR REGRESSION: FAIL — mismatched task locator did not fail closed");
    process.exit(1);
  }

  const missingPage = locatorErrors({
    fn: "7.2",
    taskId: "SYN-7.2-A",
    taskSource: "Synthetic CBTA locator, TABLEAU 7.2.A, Block 0 row SYN-7.2-A",
  });
  if (!missingPage.some((error) => error.includes("page locator"))) {
    console.error("TASK SOURCE LOCATOR REGRESSION: FAIL — missing page locator did not fail closed");
    process.exit(1);
  }

  console.log("TASK SOURCE LOCATOR REGRESSION: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

for (const fn of functions) validateTaskSet(fn);

console.log(`Checked ${checkedRows} canonical CBTA task-source locator row(s) across Functions 7.1–7.10.`);

if (failed) {
  console.error("TASK SOURCE LOCATOR CHECK: FAIL");
  console.error("This is a structural provenance-locator result only; it does not decide regulatory correctness or approval.");
  process.exit(1);
}

console.log("TASK SOURCE LOCATOR CHECK: PASS (structural provenance only)");
