#!/usr/bin/env node

/**
 * Fail-closed review-evidence guard for the canonical DGR/CBTA 7.1-7.10
 * source/competency matrices.
 *
 * This checker validates only governance evidence attached to states that
 * claim FR source verification or completed EN bilingual review. A terminal
 * EN review requires an explicit bilingual-review completion state, a terminal
 * FR source-verification state on the same row, and chronology that does not
 * predate FR verification. Generic APPROVED / COMPLETE / REVIEWED labels do
 * not satisfy the separate EN bilingual-review gate. Explicit DRAFT /
 * SOURCE GAP / SOURCE CONFLICT / PENDING states remain representable.
 * It never validates licensed IATA text, changes review state, or infers
 * ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const isoDateRe = /\b\d{4}-\d{2}-\d{2}\b/g;
const nonTerminalRe = /\b(?:pending|tbd|todo|not yet|non renseign|à renseigner|a renseigner|required|review required)\b/i;
const nonVerifiedFrRe = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|NOT VERIFIED|UNVERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED|NOT ATTEMPTED|UNATTEMPTED/i;
const nonCompleteEnRe = /NOT YET REVIEWED|NOT REVIEWED|REVIEW REQUIRED|BILINGUAL TECHNICAL REVIEW REQUIRED|\bPENDING\b|\bDRAFT\b|SOURCE GAP|SOURCE CONFLICT/i;

function normalize(value = "") {
  return String(value).replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
}

function markdownCells(line) {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((cell) => cell.trim());
}

function normalizedHeader(value) {
  return normalize(value).toLowerCase();
}

function isMarkdownSeparatorRow(line, expectedCells) {
  const cells = markdownCells(line);
  if (cells.length !== expectedCells || expectedCells === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function claimsFrVerified(value) {
  const text = normalize(value);
  if (!text || nonVerifiedFrRe.test(text)) return false;
  return /FROZEN.*SOURCE VERIFIED|FR SOURCE VERIFIED|SOURCE VERIFIED|\bVERIFIED\b/i.test(text);
}

function claimsEnComplete(value) {
  const text = normalize(value);
  if (!text || nonCompleteEnRe.test(text)) return false;
  return Boolean(
    /^BILINGUAL(?: TECHNICAL)? REVIEW (?:COMPLETE|COMPLETED)\b/i.test(text) ||
      /^EN BILINGUAL(?: TECHNICAL)? REVIEW (?:COMPLETE|COMPLETED)\b/i.test(text),
  );
}

function isGenericEnCompletion(value) {
  const text = normalize(value);
  if (!text || nonCompleteEnRe.test(text) || claimsEnComplete(text)) return false;
  return /^(?:EN\s+)?REVIEWED\b|^(?:COMPLETE|COMPLETED|APPROVED)\b/i.test(text);
}

function strictCivilDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function todayIsoUtc() {
  return new Date().toISOString().slice(0, 10);
}

function singleReviewDate(value = "") {
  const dates = [...normalize(value).matchAll(isoDateRe)].map((match) => match[0]);
  if (dates.length !== 1) return "";
  const date = dates[0];
  if (!strictCivilDate(date) || date > todayIsoUtc()) return "";
  return date;
}

function reviewerEvidenceErrors(value, label, { requireDgr = false, requireBilingualDgr = false } = {}) {
  const text = normalize(value);
  const errors = [];
  const dates = [...text.matchAll(isoDateRe)].map((match) => match[0]);

  if (dates.length !== 1) {
    errors.push(`${label}: expected exactly one ISO review date, found ${dates.length}`);
    return errors;
  }

  const date = dates[0];
  if (!strictCivilDate(date)) {
    errors.push(`${label}: review date ${date} is not a real civil date`);
  } else if (date > todayIsoUtc()) {
    errors.push(`${label}: review date ${date} is in the future`);
  }

  const reviewer = text
    .replace(isoDateRe, " ")
    .replace(/[|;,()\-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!reviewer || nonTerminalRe.test(reviewer)) {
    errors.push(`${label}: claimed-complete state lacks non-pending reviewer identity evidence`);
    return errors;
  }

  const nameTokens = reviewer
    .split(/\s+/)
    .filter((token) => /[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(token))
    .filter((token) => !/^(?:dgr|cbta|iata|reviewer|instructor|instructeur|verifier|vérificateur|bilingual|bilingue|technical|technique|fr|en)$/i.test(token));
  if (nameTokens.length < 2) {
    errors.push(`${label}: reviewer evidence does not identify a full named person`);
  }

  if (requireDgr || requireBilingualDgr) {
    if (!/\b(?:DGR|CBTA)\b|dangerous\s+goods|marchandises\s+dangereuses/i.test(text)) {
      errors.push(`${label}: claimed-complete review lacks explicit DGR/CBTA role or credential evidence`);
    }
  }

  if (requireBilingualDgr) {
    if (!/(?:\bbilingu(?:al|e)?\b|\bFR\s*[/&+\-]\s*EN\b|\bEN\s*[/&+\-]\s*FR\b|french.*english|english.*french|fran[cç]ais.*anglais|anglais.*fran[cç]ais)/i.test(text)) {
      errors.push(`${label}: completed EN review lacks explicit bilingual FR/EN competence evidence`);
    }
  }

  return errors;
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

function readMatrix(fn, readFile = (relative) => fs.readFileSync(path.join(root, relative), "utf8")) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  if (fs.existsSync(path.join(root, dedicated))) {
    return { label: dedicated, text: readFile(dedicated) };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;

  for (const candidate of embeddedMatrixCandidates(fn)) {
    if (!fs.existsSync(path.join(root, candidate))) continue;
    const text = readFile(candidate);
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start < 0 && end < 0) continue;
    if (start < 0 || end < 0 || end <= start) {
      return { label: `${candidate} embedded matrix`, text: "", discoveryError: "malformed embedded matrix markers" };
    }
    return {
      label: `${candidate} embedded matrix`,
      text: text.slice(start + startMarker.length, end),
    };
  }

  return { label: `Function ${fn} source/competency matrix`, text: "", discoveryError: "missing matrix" };
}

function validateMatrixText(text, fn, artifact) {
  const errors = [];
  const lines = text.split(/\r?\n/);
  let found = false;
  let checkedRows = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalized = headers.map(normalizedHeader);

    const functionIndex = normalized.indexOf("function");
    const taskIndex = normalized.indexOf("official task id");
    const frStateIndex = normalized.indexOf("fr source-verification state");
    const frReviewerIndex = normalized.indexOf("fr verifier + date");
    const enStateIndex = normalized.indexOf("en bilingual-review state");
    const enReviewerIndex = normalized.indexOf("en reviewer + date");

    if ([functionIndex, taskIndex, frStateIndex, frReviewerIndex, enStateIndex, enReviewerIndex].some((index) => index < 0)) continue;

    if (found) {
      errors.push(`${artifact}: more than one canonical matrix review-evidence table found`);
      continue;
    }
    found = true;

    if (!isMarkdownSeparatorRow(lines[i + 1] ?? "", headers.length)) {
      errors.push(`${artifact}: matrix header is not followed by a valid Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;

      const declaredFunction = normalize(cells[functionIndex] ?? "");
      const taskId = normalize(cells[taskIndex] ?? "");
      if (!taskId || /^[-–—]+$/.test(taskId)) continue;
      checkedRows += 1;

      if (declaredFunction !== fn) {
        errors.push(`${artifact}: task ${taskId} declares Function "${declaredFunction}" instead of ${fn}`);
      }

      const frState = cells[frStateIndex] ?? "";
      const frReviewer = cells[frReviewerIndex] ?? "";
      const enState = cells[enStateIndex] ?? "";
      const enReviewer = cells[enReviewerIndex] ?? "";
      const frVerified = claimsFrVerified(frState);
      const enComplete = claimsEnComplete(enState);

      if (isGenericEnCompletion(enState)) {
        errors.push(`${artifact}: task ${taskId}: generic EN review state "${normalize(enState)}" cannot satisfy or stand in for the separate bilingual-review gate; use an explicit BILINGUAL ... REVIEW COMPLETE state only after that human review is actually complete`);
      }

      if (frVerified) {
        errors.push(
          ...reviewerEvidenceErrors(frReviewer, `${artifact}: task ${taskId} FR verification`, {
            requireDgr: true,
          }),
        );
      }
      if (enComplete) {
        errors.push(
          ...reviewerEvidenceErrors(enReviewer, `${artifact}: task ${taskId} EN bilingual review`, {
            requireBilingualDgr: true,
          }),
        );
        if (!frVerified) {
          errors.push(`${artifact}: task ${taskId} terminal EN bilingual review requires terminal FR source verification on the same matrix row`);
        }
      }
      if (frVerified && enComplete) {
        const frDate = singleReviewDate(frReviewer);
        const enDate = singleReviewDate(enReviewer);
        if (frDate && enDate && enDate < frDate) {
          errors.push(`${artifact}: task ${taskId} EN bilingual review date ${enDate} predates FR source-verification date ${frDate}`);
        }
      }
    }
  }

  if (!found) {
    errors.push(`${artifact}: no canonical matrix with FR/EN review-evidence columns found`);
  }
  return { errors, checkedRows };
}

function fixtureMatrix({ frState, frReviewer, enState, enReviewer }) {
  return [
    "| Function | Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |",
    "|---|---|---|---|---|---|",
    `| 7.2 | 0.1.1 | ${frState} | ${frReviewer} | ${enState} | ${enReviewer} |`,
  ].join("\n");
}

function expectFixture(name, values, shouldFail) {
  const { errors } = validateMatrixText(fixtureMatrix(values), "7.2", `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function runFixtures() {
  const valid = {
    frState: "FROZEN FR / SOURCE VERIFIED",
    frReviewer: "Jane Doe — DGR/CBTA Instructor — 2026-09-06",
    enState: "BILINGUAL TECHNICAL REVIEW COMPLETE",
    enReviewer: "John Smith — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-06",
  };

  expectFixture("valid-complete", valid, false);
  expectFixture("valid-explicit-en-bilingual-complete", {
    ...valid,
    enState: "EN BILINGUAL REVIEW COMPLETED",
  }, false);
  expectFixture("pending-states-remain-representable", {
    frState: "DRAFT / NOT YET VERIFIED",
    frReviewer: "pending",
    enState: "BILINGUAL TECHNICAL REVIEW REQUIRED",
    enReviewer: "pending",
  }, false);
  expectFixture("fr-terminal-en-pending", {
    ...valid,
    enState: "BILINGUAL TECHNICAL REVIEW REQUIRED",
    enReviewer: "pending",
  }, false);
  expectFixture("en-terminal-fr-pending", {
    ...valid,
    frState: "DRAFT / NOT YET VERIFIED",
    frReviewer: "pending",
  }, true);
  expectFixture("ordered-fr-then-en", {
    ...valid,
    frReviewer: "Jane Doe — DGR/CBTA Instructor — 2026-09-05",
    enReviewer: "John Smith — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-06",
  }, false);
  expectFixture("en-before-fr", {
    ...valid,
    frReviewer: "Jane Doe — DGR/CBTA Instructor — 2026-09-06",
    enReviewer: "John Smith — Bilingual DGR/CBTA Reviewer FR/EN — 2026-09-05",
  }, true);
  expectFixture("fr-no-dgr-credential", { ...valid, frReviewer: "Jane Doe — Trainer — 2026-09-06" }, true);
  expectFixture("fr-dangerous-goods-credential", { ...valid, frReviewer: "Jane Doe — Dangerous Goods Instructor — 2026-09-06" }, false);
  expectFixture("fr-impossible-date", { ...valid, frReviewer: "Jane Doe — DGR Instructor — 2026-02-31" }, true);
  expectFixture("fr-future-date", { ...valid, frReviewer: "Jane Doe — DGR Instructor — 2999-01-01" }, true);
  expectFixture("en-impossible-date", { ...valid, enReviewer: "John Smith — Bilingual DGR Reviewer FR/EN — 2026-02-31" }, true);
  expectFixture("en-future-date", { ...valid, enReviewer: "John Smith — Bilingual DGR Reviewer FR/EN — 2999-01-01" }, true);
  expectFixture("en-no-dgr-credential", { ...valid, enReviewer: "John Smith — Bilingual Reviewer FR/EN — 2026-09-06" }, true);
  expectFixture("en-no-bilingual-evidence", { ...valid, enReviewer: "John Smith — DGR/CBTA Reviewer — 2026-09-06" }, true);
  expectFixture("en-pending-reviewer", { ...valid, enReviewer: "pending DGR bilingual reviewer — 2026-09-06" }, true);
  expectFixture("fr-not-full-name", { ...valid, frReviewer: "Reviewer — DGR Instructor — 2026-09-06" }, true);

  for (const genericEnState of ["APPROVED", "COMPLETE", "COMPLETED", "REVIEWED", "EN REVIEWED"]) {
    expectFixture(`generic-en-state-rejected:${genericEnState}`, {
      ...valid,
      enState: genericEnState,
    }, true);
  }

  const firstTaskMasqueradingAsSeparator = [
    "| Function | Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |",
    "| 7.2 | 0.1.1 | FROZEN FR / SOURCE VERIFIED | pending | BILINGUAL TECHNICAL REVIEW COMPLETE | pending |",
    "| 7.2 | 0.1.2 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending |",
  ].join("\n");
  const malformedSeparator = validateMatrixText(firstTaskMasqueradingAsSeparator, "7.2", "first-task-as-separator.md");
  if (malformedSeparator.errors.length === 0) {
    throw new Error("first-task-as-separator: expected malformed table to fail closed");
  }

  console.log("DGR matrix review-evidence regression fixtures: PASS");
}

function repositoryCheck() {
  const errors = [];
  let checkedRows = 0;

  for (const fn of functions) {
    const matrix = readMatrix(fn);
    if (matrix.discoveryError) {
      errors.push(`${matrix.label}: ${matrix.discoveryError}`);
      continue;
    }
    const result = validateMatrixText(matrix.text, fn, matrix.label);
    errors.push(...result.errors);
    checkedRows += result.checkedRows;
  }

  for (const error of errors) console.error(`ERROR: ${error}`);
  console.log(`Checked ${checkedRows} source/competency matrix row(s) across Functions 7.1-7.10 for claimed-complete FR/EN review evidence.`);

  if (errors.length) {
    console.error(`DGR MATRIX REVIEW-EVIDENCE CHECK: FAIL (${errors.length} issue(s))`);
    console.error("This is a governance-evidence check only; it does not decide regulatory correctness or approval.");
    process.exit(1);
  }

  console.log("DGR MATRIX REVIEW-EVIDENCE CHECK: PASS");
  console.log("PASS requires explicit bilingual completion semantics for terminal EN matrix states; it does not promote any pending FR/EN state and does not imply ANAC/IATA approval.");
}

if (process.argv.includes("--test")) runFixtures();
else repositoryCheck();
