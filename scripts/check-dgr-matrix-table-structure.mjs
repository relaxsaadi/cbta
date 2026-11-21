#!/usr/bin/env node

/**
 * Fail-closed structural guard for canonical DGR/CBTA source/competency
 * matrices across Functions 7.1-7.10.
 *
 * This checker validates Markdown table structure only. It does not validate
 * licensed IATA DGR content, decide regulatory correctness, promote review
 * state, or imply ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

const requiredHeaders = [
  "function",
  "official task id",
  "competency/task description",
  "cbta task-source reference",
  "local source evidence",
  "current iata dgr tier a evidence",
  "fr source-verification state",
  "fr verifier + date",
  "production question ids",
  "en bilingual-review state",
  "en reviewer + date",
  "notes / limitations",
];

function normalize(value = "") {
  return String(value)
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cells(line = "") {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((value) => value.trim());
}

function isMarkdownSeparator(line, expectedCells) {
  const row = cells(line);
  return (
    expectedCells > 0 &&
    row.length === expectedCells &&
    row.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")))
  );
}

function isCanonicalMatrixHeaderCandidate(headers) {
  const normalized = headers.map(normalize);
  return requiredHeaders.every((required) => normalized.includes(required));
}

function canonicalHeaderErrors(headers, artifact, lineNumber) {
  const errors = [];
  const normalized = headers.map(normalize);
  const unknown = normalized.filter((header) => !requiredHeaders.includes(header));
  const duplicate = requiredHeaders.filter(
    (required) => normalized.filter((header) => header === required).length > 1,
  );

  if (headers.length !== requiredHeaders.length || unknown.length || duplicate.length) {
    const details = [];
    if (duplicate.length) details.push(`duplicate required header(s): ${duplicate.join(", ")}`);
    if (unknown.length) details.push(`unknown/extra header(s): ${unknown.join(", ")}`);
    if (headers.length !== requiredHeaders.length) {
      details.push(`found ${headers.length} column(s), expected exactly ${requiredHeaders.length}`);
    }
    errors.push(
      `${artifact}: canonical matrix header at line ${lineNumber} must contain every required governance column exactly once and no extras (${details.join("; ")})`,
    );
  }

  return errors;
}

function validateMatrixText(text, artifact) {
  const errors = [];
  const lines = text.split(/\r?\n/);
  let found = false;
  let rows = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = cells(lines[i]);
    if (!headers.length || !isCanonicalMatrixHeaderCandidate(headers)) continue;

    const headerErrors = canonicalHeaderErrors(headers, artifact, i + 1);
    if (headerErrors.length) {
      errors.push(...headerErrors);
      continue;
    }

    if (found) {
      errors.push(`${artifact}: more than one canonical source/competency matrix table found`);
      continue;
    }
    found = true;

    if (!isMarkdownSeparator(lines[i + 1] ?? "", headers.length)) {
      errors.push(`${artifact}: canonical matrix header at line ${i + 1} is not followed by a valid same-width Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      rows += 1;
      if (row.length !== headers.length) {
        errors.push(`${artifact}: canonical matrix row ${j + 1} has ${row.length} cell(s), expected ${headers.length}`);
      }
    }
  }

  if (!found) {
    errors.push(`${artifact}: no canonical source/competency matrix table with the full required header was found`);
  } else if (rows === 0) {
    errors.push(`${artifact}: canonical source/competency matrix table has no data rows`);
  }

  return errors;
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

function readMatrix(fn) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  const dedicatedAbs = path.join(root, dedicated);
  if (fs.existsSync(dedicatedAbs)) {
    return { label: dedicated, text: fs.readFileSync(dedicatedAbs, "utf8") };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;

  for (const candidate of matrixCandidates(fn)) {
    const absolute = path.join(root, candidate);
    if (!fs.existsSync(absolute)) continue;
    const text = fs.readFileSync(absolute, "utf8");
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start < 0 && end < 0) continue;
    if (start < 0 || end < 0 || end <= start) {
      return {
        label: `${candidate} embedded matrix`,
        text: "",
        discoveryError: "malformed embedded matrix markers",
      };
    }
    return {
      label: `${candidate} embedded matrix`,
      text: text.slice(start + startMarker.length, end),
    };
  }

  return {
    label: `Function ${fn} source/competency matrix`,
    text: "",
    discoveryError: "missing matrix",
  };
}

function fixtureHeader() {
  return `| ${requiredHeaders.join(" | ")} |`;
}

function fixtureRow(values = []) {
  const cellsOut = requiredHeaders.map((_, index) => values[index] ?? `v${index + 1}`);
  return `| ${cellsOut.join(" | ")} |`;
}

function expect(name, text, shouldFail) {
  const errors = validateMatrixText(text, `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  const header = fixtureHeader();
  const separator = `| ${requiredHeaders.map(() => "---").join(" | ")} |`;
  const row = fixtureRow(["7.2", "0.1.1"]);

  expect("valid-matrix", [header, separator, row].join("\n"), false);
  expect("first-data-row-cannot-be-separator", [header, row, fixtureRow(["7.2", "0.1.2"])].join("\n"), true);
  expect(
    "wrong-width-separator",
    [header, `| ${requiredHeaders.slice(1).map(() => "---").join(" | ")} |`, row].join("\n"),
    true,
  );

  const shortRow = `| ${requiredHeaders.slice(0, -1).map((_, index) => (index === 0 ? "7.2" : index === 1 ? "0.1.1" : `v${index + 1}`)).join(" | ")} |`;
  expect("short-data-row", [header, separator, shortRow].join("\n"), true);

  const wideRow = row.replace(/\|\s*$/, "| extra |");
  expect("wide-data-row", [header, separator, wideRow].join("\n"), true);

  const alignedSeparator = `| ${requiredHeaders.map((_, index) => (index % 2 ? "---:" : ":---")).join(" | ")} |`;
  expect("aligned-separator", [header, alignedSeparator, row].join("\n"), false);

  const duplicateHeaders = [...requiredHeaders, "current iata dgr tier a evidence"];
  const duplicateHeader = `| ${duplicateHeaders.join(" | ")} |`;
  const duplicateSeparator = `| ${duplicateHeaders.map(() => "---").join(" | ")} |`;
  const duplicateRow = `| ${duplicateHeaders.map((_, index) => (index === 0 ? "7.2" : index === 1 ? "0.1.1" : `v${index + 1}`)).join(" | ")} |`;
  expect("duplicate-governance-header", [duplicateHeader, duplicateSeparator, duplicateRow].join("\n"), true);

  const extraHeaders = [...requiredHeaders, "shadow notes"];
  const extraHeader = `| ${extraHeaders.join(" | ")} |`;
  const extraSeparator = `| ${extraHeaders.map(() => "---").join(" | ")} |`;
  const extraRow = `| ${extraHeaders.map((_, index) => (index === 0 ? "7.2" : index === 1 ? "0.1.1" : `v${index + 1}`)).join(" | ")} |`;
  expect("unknown-extra-header", [extraHeader, extraSeparator, extraRow].join("\n"), true);

  console.log("DGR matrix-table structure regression fixtures: PASS");
}

function repositoryCheck() {
  const errors = [];

  for (const fn of functions) {
    const matrix = readMatrix(fn);
    if (matrix.discoveryError) {
      errors.push(`${matrix.label}: ${matrix.discoveryError}`);
      continue;
    }
    errors.push(...validateMatrixText(matrix.text, matrix.label));
  }

  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    console.error(`\nDGR MATRIX-TABLE STRUCTURE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR MATRIX-TABLE STRUCTURE CHECK: PASS");
  console.log("PASS validates canonical matrix Markdown structure only; regulatory evidence/review/approval remain separate gates.");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
