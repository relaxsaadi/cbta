#!/usr/bin/env node

/**
 * Independent per-function Stage 2A blueprint structural coverage guard.
 *
 * This is a structural governance check only. It does not validate IATA DGR
 * text, source correctness, reviewer qualifications, ANAC/IATA approval, or
 * production readiness.
 *
 * Invariants:
 * - Functions 7.1 through 7.10 each have their own dedicated Stage 2A
 *   blueprint artifact;
 * - each blueprint identifies its own function;
 * - every recognized blueprint task table contains exactly one task-identifier
 *   header alias, in the first column;
 * - every canonical official task ID from that function's dedicated official
 *   task-set artifact is represented in an actual blueprint task table;
 * - blueprint task tables contain no duplicate or foreign task IDs.
 *
 * Whole-document prose mentions deliberately do not count as structural
 * coverage. Intentional combined pools such as `7.1 + 7.2 (combined)` are
 * supported and count as one structural representation of each canonical ID.
 *
 * The guard deliberately does not require invented numeric ceilings. A
 * blueprint may preserve explicit SOURCE GAP / NOT RECOVERED states when a
 * historical source-yield value is unavailable.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const taskIdRe = /\b\d+(?:\.\d+){1,2}\b/g;
const taskIdHeaderAliases = new Set(["id", "official task", "task id", "sub-task id", "subtask id"]);

let failed = false;

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    fail(`missing required artifact: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanCell(value) {
  return value
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function parseMarkdownCells(line) {
  if (!line.trimStart().startsWith("|")) return null;
  const trimmed = line.trim();
  const body = trimmed.endsWith("|") ? trimmed.slice(1, -1) : trimmed.slice(1);
  return body.split("|").map((cell) => cleanCell(cell));
}

function taskIdHeaderCount(cells) {
  return cells.filter((cell) => taskIdHeaderAliases.has(cell.toLowerCase())).length;
}

function officialTaskIds(text, fn, label, report = fail) {
  const ids = [];
  for (const line of text.split(/\r?\n/)) {
    const cells = parseMarkdownCells(line);
    if (!cells || cells.length < 2) continue;
    const functionCell = cells[0];
    const taskCell = cells[1];
    if (functionCell !== fn) continue;
    if (!/^\d+(?:\.\d+){1,2}$/.test(taskCell)) continue;
    ids.push(taskCell);
  }

  const unique = [...new Set(ids)];
  if (!unique.length) report(`${label}: no canonical official task rows parsed for Function ${fn}`);
  if (unique.length !== ids.length) report(`${label}: duplicate official task IDs detected for Function ${fn}`);
  return unique;
}

function blueprintTaskIds(text, label, report = fail) {
  const ids = [];
  let inTaskTable = false;
  let lineNumber = 0;

  for (const line of text.split(/\r?\n/)) {
    lineNumber += 1;
    const cells = parseMarkdownCells(line);
    if (!cells) {
      inTaskTable = false;
      continue;
    }

    const firstCell = (cells[0] ?? "").trim();
    const lower = firstCell.toLowerCase();

    if (!inTaskTable) {
      if (taskIdHeaderAliases.has(lower)) {
        const identifierColumns = taskIdHeaderCount(cells);
        if (identifierColumns !== 1) {
          report(
            `${label}: task-table header at line ${lineNumber} has ${identifierColumns} task-identifier header columns; expected exactly one in the first column`,
          );
          inTaskTable = false;
        } else {
          inTaskTable = true;
        }
      }
      continue;
    }

    if (/^:?-{3,}:?$/.test(firstCell)) continue;
    if (!firstCell || /\b(?:subtotal|total)\b/i.test(firstCell)) continue;

    const matches = firstCell.match(taskIdRe) ?? [];
    if (!matches.length) continue;
    ids.push(...matches);
  }

  if (!ids.length) report(`${label}: no structural task rows parsed from ID/Official task tables`);
  return ids;
}

function structuralCoverageErrors(taskIds, blueprintIds, label) {
  const errors = [];
  const officialSet = new Set(taskIds);
  const counts = new Map();

  for (const id of blueprintIds) counts.set(id, (counts.get(id) ?? 0) + 1);

  const missing = taskIds.filter((id) => !counts.has(id));
  const duplicates = [...counts.entries()]
    .filter(([id, count]) => officialSet.has(id) && count > 1)
    .map(([id]) => id);
  const foreign = [...counts.keys()].filter((id) => !officialSet.has(id));

  if (missing.length) errors.push(`${label}: missing canonical task row(s): ${missing.join(", ")}`);
  if (duplicates.length) errors.push(`${label}: duplicate canonical task row(s): ${duplicates.join(", ")}`);
  if (foreign.length) errors.push(`${label}: foreign/non-canonical task row(s): ${foreign.join(", ")}`);
  return errors;
}

function runRegressionFixtures() {
  const fixtureErrors = [];
  const collect = (message) => fixtureErrors.push(message);
  const expectHeaderRejected = (name, text) => {
    const observed = [];
    blueprintTaskIds(text, name, (message) => observed.push(message));
    if (!observed.some((message) => message.includes("task-identifier header columns; expected exactly one"))) {
      collect(`${name}: ambiguous task-identifier header was not rejected`);
    }
  };

  const official = `| Function | Task | Wording |\n|---|---|---|\n| 7.9 | 0.1.1 | A |\n| 7.9 | 0.1.2 | B |`;
  const officialIds = officialTaskIds(official, "7.9", "fixture official", collect);

  const proseOnly = `# Function 7.9\nNarrative mentions 0.1.2 but it is not structurally allocated.\n\n| ID | Sub-task |\n|---|---|\n| 0.1.1 | A |`;
  const proseIds = blueprintTaskIds(proseOnly, "fixture prose", collect);
  const proseErrors = structuralCoverageErrors(officialIds, proseIds, "fixture prose");
  if (!proseErrors.some((message) => message.includes("0.1.2"))) {
    collect("fixture prose: prose-only task mention incorrectly satisfied structural coverage");
  }

  const combinedOfficial = `| Function | Task | Wording |\n|---|---|---|\n| 7.2 | 7.1 | Accident |\n| 7.2 | 7.2 | Incident |`;
  const combinedOfficialIds = officialTaskIds(combinedOfficial, "7.2", "fixture combined official", collect);
  const combinedBlueprint = `# Function 7.2\n\n| ID | Sub-task |\n|---|---|\n| 7.1 + 7.2 (combined) | Shared source-supported pool |`;
  const combinedIds = blueprintTaskIds(combinedBlueprint, "fixture combined", collect);
  const combinedErrors = structuralCoverageErrors(combinedOfficialIds, combinedIds, "fixture combined");
  if (combinedErrors.length) collect(`fixture combined: intentional combined row rejected: ${combinedErrors.join("; ")}`);

  const alternateAliasBlueprint = `# Function 7.9\n\n| Official task | Sub-task |\n|---|---|\n| 0.1.1 | A |\n| 0.1.2 | B |`;
  const alternateAliasIds = blueprintTaskIds(alternateAliasBlueprint, "fixture alternate alias", collect);
  const alternateAliasErrors = structuralCoverageErrors(officialIds, alternateAliasIds, "fixture alternate alias");
  if (alternateAliasErrors.length) {
    collect(`fixture alternate alias: valid alternate identifier alias rejected: ${alternateAliasErrors.join("; ")}`);
  }

  expectHeaderRejected(
    "fixture duplicate exact identifier header",
    `# Function 7.9\n\n| ID | ID | Sub-task |\n|---|---|---|\n| 0.1.1 | 9.9.9 | A |`,
  );

  expectHeaderRejected(
    "fixture duplicate mixed identifier aliases",
    `# Function 7.9\n\n| ID | Task ID | Sub-task |\n|---|---|---|\n| 0.1.1 | 9.9.9 | A |`,
  );

  const foreignBlueprint = `# Function 7.9\n\n| ID | Sub-task |\n|---|---|\n| 0.1.1 | A |\n| 0.1.2 | B |\n| 9.9.9 | Foreign copied row |`;
  const foreignIds = blueprintTaskIds(foreignBlueprint, "fixture foreign", collect);
  const foreignErrors = structuralCoverageErrors(officialIds, foreignIds, "fixture foreign");
  if (!foreignErrors.some((message) => message.includes("9.9.9"))) {
    collect("fixture foreign: foreign task row was not rejected");
  }

  const duplicateBlueprint = `# Function 7.9\n\n| ID | Sub-task |\n|---|---|\n| 0.1.1 | A |\n| 0.1.1 | Duplicate |\n| 0.1.2 | B |`;
  const duplicateIds = blueprintTaskIds(duplicateBlueprint, "fixture duplicate", collect);
  const duplicateErrors = structuralCoverageErrors(officialIds, duplicateIds, "fixture duplicate");
  if (!duplicateErrors.some((message) => message.includes("duplicate canonical task row"))) {
    collect("fixture duplicate: duplicate canonical task row was not rejected");
  }

  if (fixtureErrors.length) {
    for (const message of fixtureErrors) console.error(`ERROR: ${message}`);
    console.error("DGR Stage 2A blueprint coverage regression fixtures: FAIL");
    process.exit(1);
  }

  console.log("DGR Stage 2A blueprint coverage regression fixtures: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

for (const fn of functions) {
  const taskPath = `docs/DGR_OFFICIAL_TASK_SET_${fn}.md`;
  const blueprintPath = `docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`;
  const taskText = read(taskPath);
  const blueprintText = read(blueprintPath);

  if (!taskText || !blueprintText) continue;

  if (!new RegExp(`Function\\s+${escapeRegExp(fn)}\\b`, "i").test(blueprintText)) {
    fail(`${blueprintPath}: does not identify itself as Function ${fn}`);
  }

  const taskIds = officialTaskIds(taskText, fn, taskPath);
  const blueprintIds = blueprintTaskIds(blueprintText, blueprintPath);
  const errors = structuralCoverageErrors(taskIds, blueprintIds, blueprintPath);
  for (const message of errors) fail(message);

  if (!errors.length) {
    console.log(`Function ${fn}: blueprint structurally covers ${taskIds.length} canonical task IDs`);
  }
}

if (failed) {
  console.error("DGR Stage 2A blueprint coverage gate: FAIL");
  process.exit(1);
}

console.log("DGR Stage 2A blueprint coverage gate: PASS");
