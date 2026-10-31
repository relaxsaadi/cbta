#!/usr/bin/env node

/**
 * Fail-closed CBTA official-task coverage gate for Functions 7.1–7.10.
 *
 * The source/competency matrix cannot prove that it is complete by comparing
 * only against itself. This companion guard requires a separate canonical
 * official-task set for each function, derived from that function's own
 * current CBTA task table/source, then requires exact task-ID equality between
 * that set and the matrix.
 *
 * This script does not validate licensed IATA DGR regulatory text, does not
 * infer ANAC/IATA approval, and does not mark any question APPROVED.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const canonicalOfficialTaskHeaders = ["function", "official task id", "cbta task-source reference"];
let failed = false;

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function absolutePath(relativePath) {
  return path.join(root, relativePath);
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

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value).sort();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function extractDelimitedSection(relativePath, startMarker, endMarker, label) {
  const absolute = absolutePath(relativePath);
  if (!fs.existsSync(absolute)) return null;
  const text = fs.readFileSync(absolute, "utf8");
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start < 0 && end < 0) return null;
  if (start < 0 || end < 0 || end <= start) {
    fail(`${relativePath}: malformed ${label} markers`);
    return "";
  }
  return text.slice(start + startMarker.length, end);
}

function officialTaskSetCandidates(fn) {
  if (fn === "7.1") {
    return [
      "docs/RECOVERED_STAGE2A_CONTEXT.md",
      "docs/DGR_STAGE_2B_STATUS.md",
      "docs/DGR_PRODUCTION_BANK_7.1.md",
    ];
  }
  return [
    `docs/DGR_STAGE1_FUNCTION_${fn}_DRAFT.md`,
    `docs/DGR_STAGE1_FUNCTION_${fn}_CROSSVALIDATION.md`,
    `docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`,
  ];
}

function matrixCandidates(fn) {
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

function readOfficialTaskSet(fn) {
  const dedicated = `docs/DGR_OFFICIAL_TASK_SET_${fn}.md`;
  if (fs.existsSync(absolutePath(dedicated))) {
    return { label: dedicated, text: fs.readFileSync(absolutePath(dedicated), "utf8") };
  }

  const startMarker = `<!-- DGR_OFFICIAL_TASK_SET:${fn}:START -->`;
  const endMarker = `<!-- DGR_OFFICIAL_TASK_SET:${fn}:END -->`;
  for (const candidate of officialTaskSetCandidates(fn)) {
    const section = extractDelimitedSection(candidate, startMarker, endMarker, `official task-set Function ${fn}`);
    if (section !== null) return { label: `${candidate} embedded official task set`, text: section };
  }

  fail(
    `${fn}: missing canonical official task set; expected ${dedicated} or a section delimited by ${startMarker} / ${endMarker}`,
  );
  return { label: `Function ${fn} official task set`, text: "" };
}

function readMatrix(fn) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  if (fs.existsSync(absolutePath(dedicated))) {
    return { label: dedicated, text: fs.readFileSync(absolutePath(dedicated), "utf8") };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;
  for (const candidate of matrixCandidates(fn)) {
    const section = extractDelimitedSection(candidate, startMarker, endMarker, `source/competency matrix Function ${fn}`);
    if (section !== null) return { label: `${candidate} embedded matrix`, text: section };
  }

  fail(
    `${fn}: missing source/competency matrix; expected ${dedicated} or a section delimited by ${startMarker} / ${endMarker}`,
  );
  return { label: `Function ${fn} source/competency matrix`, text: "" };
}

function parseTaskTable(text, fn, artifactLabel, requireTaskSource) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  let found = false;
  const taskIds = [];

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map(normalizedHeader);

    if (requireTaskSource) {
      const looksLikeCanonicalOfficialTaskHeader = canonicalOfficialTaskHeaders.every((header) => normalized.includes(header));
      const isExactCanonicalOfficialTaskHeader =
        normalized.length === canonicalOfficialTaskHeaders.length &&
        normalized.every((header, index) => header === canonicalOfficialTaskHeaders[index]);

      if (looksLikeCanonicalOfficialTaskHeader && !isExactCanonicalOfficialTaskHeader) {
        fail(
          `${artifactLabel}: canonical official-task header must be exactly Function | Official task ID | CBTA task-source reference, with each field exactly once and no extras`,
        );
        continue;
      }
    }

    const functionIndex = normalized.findIndex((header) => header === "function");
    const taskIndex = normalized.findIndex((header) => header === "official task id");
    const taskSourceIndex = normalized.findIndex((header) => header === "cbta task-source reference");
    if (functionIndex < 0 || taskIndex < 0 || (requireTaskSource && taskSourceIndex < 0)) continue;

    if (found) {
      fail(`${artifactLabel}: more than one canonical task table found; keep exactly one`);
      continue;
    }
    found = true;

    const separator = markdownTableCells(lines[i + 1] ?? "");
    if (!isMarkdownSeparatorRow(separator, headers.length)) {
      fail(`${artifactLabel}: canonical task header is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;
      const functionCell = (cells[functionIndex] ?? "").trim();
      const taskId = (cells[taskIndex] ?? "").trim();
      const taskSource = taskSourceIndex >= 0 ? (cells[taskSourceIndex] ?? "").trim() : "";

      if (!taskId || /^[-–—]+$/.test(taskId)) {
        fail(`${artifactLabel}: row ${j + 1} has no Official task ID`);
        continue;
      }
      if (functionCell !== fn) {
        fail(`${artifactLabel}: task ${taskId} declares Function "${functionCell}" instead of ${fn}`);
      }
      if (requireTaskSource && !taskSource) {
        fail(`${artifactLabel}: task ${taskId} is missing CBTA task-source reference`);
      }
      taskIds.push(taskId);
    }
  }

  if (!found) {
    fail(
      `${artifactLabel}: no canonical task table found; required headers are Function | Official task ID${requireTaskSource ? " | CBTA task-source reference" : ""}`,
    );
    return [];
  }

  const dupes = duplicates(taskIds);
  if (dupes.length) fail(`${artifactLabel}: duplicate Official task ID row(s): ${dupes.join(", ")}`);
  if (!taskIds.length) fail(`${artifactLabel}: canonical task table has no task rows`);
  return uniqueSorted(taskIds);
}

const summary = [];
for (const fn of functions) {
  const expectedArtifact = readOfficialTaskSet(fn);
  const matrixArtifact = readMatrix(fn);
  const expected = parseTaskTable(expectedArtifact.text, fn, expectedArtifact.label, true);
  const actual = parseTaskTable(matrixArtifact.text, fn, matrixArtifact.label, false);

  const missing = difference(expected, actual);
  const extra = difference(actual, expected);
  if (missing.length) {
    fail(`${fn}: matrix omits ${missing.length} canonical official task(s): ${missing.join(", ")}`);
  }
  if (extra.length) {
    fail(`${fn}: matrix contains ${extra.length} task(s) absent from the canonical official task set: ${extra.join(", ")}`);
  }

  summary.push({ fn, expected: expected.length, actual: actual.length, missing: missing.length, extra: extra.length });
}

console.log("\nCBTA official-task coverage summary");
console.log("Function | Expected tasks | Matrix tasks | Missing | Extra");
console.log("---------|----------------|--------------|---------|------");
for (const row of summary) {
  console.log(
    `${row.fn.padEnd(8)} | ${String(row.expected).padStart(14)} | ${String(row.actual).padStart(12)} | ${String(row.missing).padStart(7)} | ${String(row.extra).padStart(5)}`,
  );
}

if (failed) {
  console.error("\nOFFICIAL TASK COVERAGE CHECK: FAIL");
  console.error(
    "A failing result is expected until each function has an independently derived machine-checkable official task set and an exact-coverage source/competency matrix.",
  );
  process.exit(1);
}

console.log("OFFICIAL TASK COVERAGE CHECK: PASS (task-set equality only; not regulatory correctness or approval)");
