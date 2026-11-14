#!/usr/bin/env node

/**
 * Regression fixtures for the independent official-task coverage gate.
 *
 * These fixtures use synthetic task IDs only. They do not validate or reproduce
 * licensed IATA DGR/CBTA content and do not imply regulatory approval.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const checkerPath = fileURLToPath(new URL("./check-dgr-official-task-coverage.mjs", import.meta.url));

function taskId(fn, suffix) {
  return `SYN-${fn}-${suffix}`;
}

function officialTaskSet(fn, includeSeparator = true) {
  const lines = [
    "| Function | Official task ID | CBTA task-source reference |",
  ];
  if (includeSeparator) lines.push("|:---|---:|:---:|");
  lines.push(
    `| ${fn} | ${taskId(fn, "A")} | synthetic-source-A |`,
    `| ${fn} | ${taskId(fn, "B")} | synthetic-source-B |`,
  );
  return `${lines.join("\n")}\n`;
}

function duplicateHeaderOfficialTaskSet(fn) {
  return [
    "| Function | Official task ID | CBTA task-source reference | Official task ID |",
    "|---|---|---|---|",
    `| ${fn} | ${taskId(fn, "A")} | synthetic-source-A | SYN-CONFLICT-A |`,
    `| ${fn} | ${taskId(fn, "B")} | synthetic-source-B | SYN-CONFLICT-B |`,
    "",
  ].join("\n");
}

function matrix(fn, includeSeparator = true) {
  const lines = [
    "| Function | Official task ID |",
  ];
  if (includeSeparator) lines.push("|---|---|");
  lines.push(
    `| ${fn} | ${taskId(fn, "A")} |`,
    `| ${fn} | ${taskId(fn, "B")} |`,
  );
  return `${lines.join("\n")}\n`;
}

function buildFixture(root, malformedFunction = null) {
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs, { recursive: true });
  for (const fn of functions) {
    const validSeparator = fn !== malformedFunction;
    fs.writeFileSync(path.join(docs, `DGR_OFFICIAL_TASK_SET_${fn}.md`), officialTaskSet(fn, validSeparator));
    fs.writeFileSync(path.join(docs, `DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`), matrix(fn, validSeparator));
  }
}

function runChecker(root) {
  return spawnSync(process.execPath, [checkerPath], {
    cwd: root,
    encoding: "utf8",
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`OFFICIAL TASK COVERAGE REGRESSION: FAIL — ${message}`);
    process.exit(1);
  }
}

const validRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dgr-task-coverage-valid-"));
const malformedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dgr-task-coverage-malformed-"));
const duplicateHeaderRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dgr-task-coverage-duplicate-header-"));

try {
  buildFixture(validRoot);
  const valid = runChecker(validRoot);
  assert(
    valid.status === 0,
    `well-formed synthetic task sets should pass; stderr=${JSON.stringify(valid.stderr)}`,
  );

  buildFixture(malformedRoot, "7.2");
  const malformed = runChecker(malformedRoot);
  assert(malformed.status !== 0, "missing Markdown separators must fail closed");
  assert(
    malformed.stderr.includes("valid Markdown separator row"),
    `malformed-separator failure should be explicit; stderr=${JSON.stringify(malformed.stderr)}`,
  );

  buildFixture(duplicateHeaderRoot);
  fs.writeFileSync(
    path.join(duplicateHeaderRoot, "docs", "DGR_OFFICIAL_TASK_SET_7.2.md"),
    duplicateHeaderOfficialTaskSet("7.2"),
  );
  const duplicateHeader = runChecker(duplicateHeaderRoot);
  assert(duplicateHeader.status !== 0, "duplicate canonical official-task headers must fail closed");
  assert(
    duplicateHeader.stderr.includes("canonical official-task header must be exactly"),
    `duplicate-header failure should be explicit; stderr=${JSON.stringify(duplicateHeader.stderr)}`,
  );

  console.log("OFFICIAL TASK COVERAGE REGRESSION: PASS");
} finally {
  fs.rmSync(validRoot, { recursive: true, force: true });
  fs.rmSync(malformedRoot, { recursive: true, force: true });
  fs.rmSync(duplicateHeaderRoot, { recursive: true, force: true });
}
