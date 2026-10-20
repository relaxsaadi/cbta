#!/usr/bin/env node

/**
 * Fail-closed structural question-ID guard for the historical Function 7.1
 * Stage 2B status ledger.
 *
 * `check-dgr-readiness-artifacts.mjs` historically recovers Function 7.1
 * pilot IDs by scanning every Q-7.1-NNN token in DGR_STAGE_2B_STATUS.md.
 * This companion guard makes that broad recovery safe: every such token must
 * also exist as a row in a canonical Function 7.1 status table. Narrative
 * prose therefore cannot masquerade as a durable bank/status record.
 *
 * This is a structural consistency check only. It does not validate IATA DGR
 * content, source correctness, human review, or ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relativePath = "docs/DGR_STAGE_2B_STATUS.md";

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

function inspectStage71(text) {
  const errors = [];
  const structuralIds = [];
  const lines = text.split(/\r?\n/);
  let tableCount = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map(normalizedHeader);

    const idIndex = normalized.indexOf("id");
    const frIndex = normalized.indexOf("fr status");
    const typeIndex = normalized.indexOf("type");
    const sourceIndex = normalized.indexOf("current source basis");
    const enIndex = normalized.indexOf("en status");
    const approvalIndex = normalized.indexOf("approval");
    if ([idIndex, frIndex, typeIndex, sourceIndex, enIndex, approvalIndex].some((index) => index < 0)) continue;

    tableCount += 1;
    const separator = markdownTableCells(lines[i + 1] ?? "");
    if (!isMarkdownSeparatorRow(separator, headers.length)) {
      errors.push(`line ${i + 1}: canonical Function 7.1 status header is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(`line ${j + 1}: Function 7.1 status row width does not match its header`);
        continue;
      }

      const id = (cells[idIndex] ?? "").trim();
      if (!/^Q-7\.1-\d{3}$/i.test(id)) {
        errors.push(`line ${j + 1}: canonical Function 7.1 status row has invalid ID "${id}"`);
        continue;
      }
      structuralIds.push(id.toUpperCase());
    }
  }

  if (!tableCount) {
    errors.push("no canonical Function 7.1 status table found");
  }

  const duplicateIds = duplicates(structuralIds);
  if (duplicateIds.length) {
    errors.push(`duplicate structural Function 7.1 status row(s): ${duplicateIds.join(", ")}`);
  }

  const textualIds = uniqueSorted(
    [...text.matchAll(/\bQ-7\.1-\d{3}\b/gi)].map((match) => match[0].toUpperCase()),
  );
  const structuralSet = new Set(structuralIds);
  const proseOnlyIds = textualIds.filter((id) => !structuralSet.has(id));
  if (proseOnlyIds.length) {
    errors.push(
      `Function 7.1 prose/non-structural question ID(s) would be consumed by broad allIds() recovery: ${proseOnlyIds.join(", ")}`,
    );
  }

  return {
    errors,
    structuralIds: uniqueSorted(structuralIds),
    textualIds,
    tableCount,
  };
}

function fixtureTable(rows, separator = "|---|---|---|---|---|---|") {
  return [
    "| ID | FR status | Type | Current source basis | EN status | Approval |",
    separator,
    ...rows,
  ].join("\n");
}

function runRegressionFixtures() {
  const valid = inspectStage71([
    "# Synthetic Function 7.1 status",
    fixtureTable([
      "| Q-7.1-001 | DRAFT | MCQ | SOURCE GAP | PENDING | PENDING REVIEWER + DATE |",
    ]),
    "Narrative reference to Q-7.1-001 is allowed because a structural row exists.",
  ].join("\n\n"));
  if (valid.errors.length) {
    console.error(`STAGE 7.1 QUESTION-ID STRUCTURE REGRESSION: FAIL — valid fixture rejected: ${valid.errors.join("; ")}`);
    process.exit(1);
  }

  const proseOnly = inspectStage71([
    fixtureTable([
      "| Q-7.1-001 | DRAFT | MCQ | SOURCE GAP | PENDING | PENDING REVIEWER + DATE |",
    ]),
    "Narrative-only Q-7.1-002 must not become a canonical bank record.",
  ].join("\n\n"));
  if (!proseOnly.errors.some((error) => error.includes("Q-7.1-002"))) {
    console.error("STAGE 7.1 QUESTION-ID STRUCTURE REGRESSION: FAIL — prose-only ID did not fail closed");
    process.exit(1);
  }

  const malformedSeparator = inspectStage71([
    "| ID | FR status | Type | Current source basis | EN status | Approval |",
    "| Q-7.1-001 | DRAFT | MCQ | SOURCE GAP | PENDING | PENDING REVIEWER + DATE |",
  ].join("\n"));
  if (!malformedSeparator.errors.some((error) => error.includes("valid Markdown separator"))) {
    console.error("STAGE 7.1 QUESTION-ID STRUCTURE REGRESSION: FAIL — data row accepted as separator");
    process.exit(1);
  }

  const duplicate = inspectStage71(fixtureTable([
    "| Q-7.1-001 | DRAFT | MCQ | SOURCE GAP | PENDING | PENDING REVIEWER + DATE |",
    "| Q-7.1-001 | DRAFT | MCQ | SOURCE GAP | PENDING | PENDING REVIEWER + DATE |",
  ]));
  if (!duplicate.errors.some((error) => error.includes("duplicate structural"))) {
    console.error("STAGE 7.1 QUESTION-ID STRUCTURE REGRESSION: FAIL — duplicate structural ID did not fail closed");
    process.exit(1);
  }

  console.log("STAGE 7.1 QUESTION-ID STRUCTURE REGRESSION: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

const absolutePath = path.join(root, relativePath);
if (!fs.existsSync(absolutePath)) {
  console.error(`ERROR: missing required artifact: ${relativePath}`);
  process.exit(1);
}

const result = inspectStage71(fs.readFileSync(absolutePath, "utf8"));
for (const error of result.errors) console.error(`ERROR: ${relativePath}: ${error}`);

console.log(
  `Function 7.1 Stage 2B structural status: ${result.structuralIds.length} structural ID(s), ${result.textualIds.length} unique textual ID token(s), ${result.tableCount} canonical table(s).`,
);

if (result.errors.length) {
  console.error("STAGE 7.1 QUESTION-ID STRUCTURE CHECK: FAIL");
  console.error("This result is structural only; it does not decide regulatory correctness or approval.");
  process.exit(1);
}

console.log("STAGE 7.1 QUESTION-ID STRUCTURE CHECK: PASS (structural provenance only)");
