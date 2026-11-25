#!/usr/bin/env node

/**
 * Strict deterministic cross-field guard for the 7.1–7.10 source/competency
 * matrices. This script validates evidence syntax/governance consistency only;
 * it never validates or reproduces licensed IATA DGR text and never infers
 * ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";
import {
  hasIataDgrSourceIdentity,
  validateTierAEvidenceForFrState,
} from "./lib/dgr-matrix-tier-a-policy.mjs";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
let failed = false;
let checkedRows = 0;

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

function validateSourceIdentityPolicyRegressions() {
  const accepted = [
    "DGR 67th Edition 2026 §5.0.1",
    "IATA DGR 67th Edition 2026 §5.0.1",
    "IATA Dangerous Goods Regulations 67th Edition 2026 §5.0.1",
    "SOURCE VERIFIED — IATA Dangerous Goods Regulations 67th Edition 2026 Table 2.3.A",
  ];
  const rejected = [
    "Company IATA Dangerous Goods Regulations Manual 67th Edition 2026 §5.0.1",
    "Local Guide to IATA Dangerous Goods Regulations 67th Edition 2026 §5.0.1",
    "IATA Dangerous Goods Regulations Training Manual 67th Edition 2026 §5.0.1",
    "Dangerous Goods Regulations Company Manual IATA 67th Edition 2026 §5.0.1",
  ];

  for (const evidence of accepted) {
    if (!hasIataDgrSourceIdentity(evidence)) {
      fail(`Tier-A source-identity regression rejected canonical direct source form: ${evidence}`);
    }
  }
  for (const evidence of rejected) {
    if (hasIataDgrSourceIdentity(evidence)) {
      fail(`Tier-A source-identity regression accepted third-party/full-title embedding: ${evidence}`);
    }
  }
}

function embeddedMatrixCandidates(fn) {
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
  if (fs.existsSync(absolutePath(dedicated))) {
    return { label: dedicated, text: fs.readFileSync(absolutePath(dedicated), "utf8") };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;

  for (const candidate of embeddedMatrixCandidates(fn)) {
    if (!fs.existsSync(absolutePath(candidate))) continue;
    const text = fs.readFileSync(absolutePath(candidate), "utf8");
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start < 0 && end < 0) continue;
    if (start < 0 || end < 0 || end <= start) {
      fail(`${candidate}: malformed source/competency matrix markers for Function ${fn}`);
      return { label: `${candidate} embedded matrix`, text: "" };
    }
    return {
      label: `${candidate} embedded matrix`,
      text: text.slice(start + startMarker.length, end),
    };
  }

  fail(`${fn}: source/competency matrix is missing; strict Tier-A cross-field validation cannot run`);
  return { label: `Function ${fn} source/competency matrix`, text: "" };
}

function validateMatrix(fn, artifactLabel, text) {
  if (!text) return;

  const lines = text.split(/\r?\n/);
  let foundTable = false;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map(normalizedHeader);

    const functionIndex = normalized.indexOf("function");
    const taskIndex = normalized.indexOf("official task id");
    const tierAIndex = normalized.indexOf("current iata dgr tier a evidence");
    const frStateIndex = normalized.indexOf("fr source-verification state");
    const frVerifierIndex = normalized.indexOf("fr verifier + date");

    if ([functionIndex, taskIndex, tierAIndex, frStateIndex, frVerifierIndex].some((index) => index < 0)) continue;

    if (foundTable) {
      fail(`${artifactLabel}: more than one candidate canonical matrix table found`);
      continue;
    }
    foundTable = true;

    const separator = markdownTableCells(lines[i + 1] ?? "");
    if (!separator.length) {
      fail(`${artifactLabel}: matrix header is not followed by a Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;

      const functionCell = (cells[functionIndex] ?? "").trim();
      const taskId = (cells[taskIndex] ?? "").trim();
      const tierAEvidence = (cells[tierAIndex] ?? "").trim();
      const frState = (cells[frStateIndex] ?? "").trim();
      const frVerifier = (cells[frVerifierIndex] ?? "").trim();

      if (!taskId || /^[-–—]+$/.test(taskId)) {
        fail(`${artifactLabel}: matrix row ${j + 1} has no Official task ID`);
        continue;
      }
      if (functionCell !== fn) {
        fail(`${artifactLabel}: task ${taskId} declares Function "${functionCell}" instead of ${fn}`);
      }

      checkedRows += 1;
      for (const error of validateTierAEvidenceForFrState({ tierAEvidence, frState, frVerifier })) {
        fail(`${artifactLabel}: task ${taskId}: ${error}`);
      }
    }
  }

  if (!foundTable) {
    fail(`${artifactLabel}: no matrix table with Function / Official task ID / Tier-A evidence / FR state / FR verifier columns found`);
  }
}

validateSourceIdentityPolicyRegressions();

for (const fn of functions) {
  const matrix = readMatrix(fn);
  validateMatrix(fn, matrix.label, matrix.text);
}

console.log(`Checked ${checkedRows} source/competency matrix row(s) across Functions 7.1–7.10.`);

if (failed) {
  console.error("STRICT TIER-A MATRIX CHECK: FAIL");
  console.error("This is a deterministic governance/syntax result only; it does not decide regulatory correctness.");
  process.exit(1);
}

console.log("STRICT TIER-A MATRIX CHECK: PASS (syntax/governance only)");
