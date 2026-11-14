#!/usr/bin/env node

/**
 * Fail-closed review-evidence semantics guard for the DGR/CBTA 7.1–7.10
 * readiness program.
 *
 * This checker does not decide regulatory correctness and never promotes a
 * question. It makes the matrix/status evidence layer consistent with the
 * repository's qualified-review workflow by rejecting completion claims that
 * rely on placeholders, impossible/future dates, generic EN completion labels,
 * or EN reviewer credentials that do not explicitly establish both DGR/CBTA
 * standing and bilingual competence.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

const normalize = (value = "") => value.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();

function isPlaceholder(value = "") {
  const text = normalize(value);
  if (!text || /[<>]/.test(text)) return true;
  return /^(?:pending(?:\s+reviewer(?:\s*\+\s*date)?)?|tbd|todo|unknown|unnamed|reviewer(?:\s*\+\s*date)?|name|credential|qualification|not yet(?:\s+(?:reviewed|verified))?|à renseigner|a renseigner|non renseigné|non renseigne)$/i.test(text);
}

function isRealNonFutureIsoDate(value = "") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  const instant = new Date(Date.UTC(year, month - 1, day));
  if (
    instant.getUTCFullYear() !== year ||
    instant.getUTCMonth() !== month - 1 ||
    instant.getUTCDate() !== day
  ) return false;

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return instant.getTime() <= todayUtc;
}

function looksLikeFullName(value = "") {
  const text = normalize(value);
  if (!text || isPlaceholder(text)) return false;
  const words = text.match(/[\p{L}][\p{L}'’.-]*/gu) ?? [];
  if (words.length < 2) return false;
  const generic = /^(?:IATA|ANAC|KOST|reviewer|instructor|auditor|admin|administrator|team|staff|operator)$/i;
  return !words.every((word) => generic.test(word));
}

function looksLikeDgrCredential(value = "") {
  const text = normalize(value);
  if (!text || isPlaceholder(text)) return false;
  return /\bDGR\b|\bCBTA\b|dangerous\s+goods|marchandises\s+dangereuses/i.test(text);
}

function looksExplicitlyBilingual(value = "") {
  const text = normalize(value);
  if (!text || isPlaceholder(text)) return false;
  return /\bbilingual\b|\bbilingue\b|\bFR\s*[\/+&-]\s*EN\b|\bEN\s*[\/+&-]\s*FR\b|French\s*[\/+&-]\s*English|English\s*[\/+&-]\s*French|fran[cç]ais\s*[\/+&-]\s*anglais|anglais\s*[\/+&-]\s*fran[cç]ais/i.test(text);
}

function splitEvidence(value = "") {
  const text = normalize(value);
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  const beforeDate = date
    ? text.slice(0, text.indexOf(date)).replace(/[;,\-–—]+\s*$/g, "").trim()
    : text;
  const parts = beforeDate.split(/\s*,\s*/).filter(Boolean);
  return {
    text,
    date,
    name: parts[0] ?? "",
    credential: parts.slice(1).join(", ").trim(),
  };
}

function namedVerifierWithRealDate(value = "") {
  const { text, date } = splitEvidence(value);
  if (!text || isPlaceholder(text)) return { ok: false, reason: "named verifier is missing or placeholder" };
  if (!date) return { ok: false, reason: "ISO date is missing" };
  if (!isRealNonFutureIsoDate(date)) return { ok: false, reason: "date is impossible or in the future" };
  const withoutDate = normalize(text.replace(date, "").replace(/[;,\-–—]+\s*$/g, ""));
  if (!withoutDate || isPlaceholder(withoutDate)) return { ok: false, reason: "named verifier is missing or placeholder" };
  return { ok: true };
}

function qualifiedFrReviewerEvidence(value = "") {
  const evidence = splitEvidence(value);
  if (!looksLikeFullName(evidence.name)) return { ok: false, reason: "full FR reviewer name missing/placeholder" };
  if (!looksLikeDgrCredential(evidence.credential)) return { ok: false, reason: "FR reviewer DGR/CBTA role or credential missing" };
  if (!evidence.date) return { ok: false, reason: "FR review ISO date missing" };
  if (!isRealNonFutureIsoDate(evidence.date)) return { ok: false, reason: "FR review date is impossible or in the future" };
  return { ok: true };
}

function qualifiedBilingualReviewerEvidence(value = "") {
  const evidence = splitEvidence(value);
  if (!looksLikeFullName(evidence.name)) return { ok: false, reason: "full EN reviewer name missing/placeholder" };
  if (!looksLikeDgrCredential(evidence.credential)) return { ok: false, reason: "EN reviewer DGR/CBTA role or credential missing" };
  if (!looksExplicitlyBilingual(evidence.credential)) return { ok: false, reason: "EN reviewer credential does not explicitly establish bilingual competence" };
  if (!evidence.date) return { ok: false, reason: "EN review ISO date missing" };
  if (!isRealNonFutureIsoDate(evidence.date)) return { ok: false, reason: "EN review date is impossible or in the future" };
  return { ok: true };
}

function normalizedState(value = "") {
  return normalize(value).toUpperCase();
}

function isPositiveFrSourceVerification(value = "") {
  const state = normalizedState(value);
  return (
    /^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/.test(state) ||
    /^FR SOURCE VERIFIED\b/.test(state) ||
    /^SOURCE VERIFIED\b/.test(state) ||
    /^VERIFIED\b/.test(state)
  );
}

function isCanonicalBilingualReviewComplete(value = "") {
  return /^BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\b/i.test(normalize(value));
}

function isGenericEnCompletion(value = "") {
  const state = normalizedState(value);
  return (
    /^(?:EN\s+)?REVIEWED\b/.test(state) ||
    /^(?:COMPLETE|COMPLETED|APPROVED)\b/.test(state)
  );
}

function cells(line) {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((cell) => cell.trim());
}

function normalizedHeaders(headers) {
  return headers.map((header) => normalize(header).toLowerCase());
}

function headerMatches(headers, label) {
  const expected = label.toLowerCase();
  return normalizedHeaders(headers)
    .map((header, index) => (header === expected ? index : -1))
    .filter((index) => index >= 0);
}

function isMarkdownSeparatorRow(line, expectedCells) {
  const row = cells(line);
  return expectedCells > 0 && row.length === expectedCells && row.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function validateMatrixText(text, artifact) {
  const errors = [];
  const lines = text.split(/\r?\n/);
  let found = false;

  const semanticHeaders = {
    task: "Official task ID",
    frState: "FR source-verification state",
    frVerifier: "FR verifier + date",
    enState: "EN bilingual-review state",
    enReviewer: "EN reviewer + date",
  };

  for (let i = 0; i < lines.length; i += 1) {
    const headers = cells(lines[i]);
    if (!headers.length) continue;

    const matches = Object.fromEntries(
      Object.entries(semanticHeaders).map(([key, label]) => [key, headerMatches(headers, label)]),
    );
    if (Object.values(matches).some((indexes) => indexes.length === 0)) continue;

    if (found) {
      errors.push(`${artifact}: more than one matrix review-evidence table found`);
      continue;
    }
    found = true;

    const ambiguous = Object.entries(matches).filter(([, indexes]) => indexes.length !== 1);
    if (ambiguous.length) {
      for (const [key, indexes] of ambiguous) {
        errors.push(`${artifact}: matrix header at line ${i + 1} contains ${indexes.length} occurrences of governance field "${semanticHeaders[key]}"; exactly one is required`);
      }
      continue;
    }

    const indexes = Object.fromEntries(
      Object.entries(matches).map(([key, values]) => [key, values[0]]),
    );

    if (!isMarkdownSeparatorRow(lines[i + 1] ?? "", headers.length)) {
      errors.push(`${artifact}: matrix header at line ${i + 1} is not followed by a valid same-width Markdown separator row`);
      continue;
    }

    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      if (row.length !== headers.length) {
        errors.push(`${artifact}: matrix row ${j + 1} has ${row.length} cell(s), expected ${headers.length}`);
        continue;
      }

      const task = normalize(row[indexes.task] ?? "") || `row ${j + 1}`;
      const frState = row[indexes.frState] ?? "";
      const frVerifier = row[indexes.frVerifier] ?? "";
      const enState = row[indexes.enState] ?? "";
      const enReviewer = row[indexes.enReviewer] ?? "";

      if (isPositiveFrSourceVerification(frState)) {
        const result = namedVerifierWithRealDate(frVerifier);
        if (!result.ok) errors.push(`${artifact}: task ${task}: FR source-verification completion evidence invalid — ${result.reason}`);
      }

      if (isCanonicalBilingualReviewComplete(enState)) {
        const result = qualifiedBilingualReviewerEvidence(enReviewer);
        if (!result.ok) errors.push(`${artifact}: task ${task}: EN bilingual-review completion evidence invalid — ${result.reason}`);
      } else if (isGenericEnCompletion(enState)) {
        errors.push(`${artifact}: task ${task}: generic EN state "${normalize(enState)}" cannot replace the explicit BILINGUAL TECHNICAL REVIEW COMPLETE gate`);
      }
    }
  }

  if (!found) errors.push(`${artifact}: canonical matrix review-evidence columns not found`);
  return errors;
}

function field(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`^\\s*\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "im"))?.[1]?.trim() ?? "";
}

function itemBlocks(text) {
  const re = /^#{2,4}\s+(Q-7\.(?:10|[1-9])-\d{3})\b.*$/gmi;
  const matches = [...text.matchAll(re)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    return { id: match[1].toUpperCase(), text: text.slice(start, end) };
  });
}

function completionBody(status, marker) {
  const match = normalize(status).match(new RegExp(`${marker}\\s*\\(reviewed by\\s+([^)]*)\\)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function validateDurableStatusText(text, artifact) {
  const errors = [];
  for (const item of itemBlocks(text)) {
    const fr = field(item.text, "FR status");
    const en = field(item.text, "EN status");

    if (/FR TECHNICAL REVIEW COMPLETE\b/i.test(fr)) {
      const body = completionBody(fr, "FR TECHNICAL REVIEW COMPLETE");
      if (!body) {
        errors.push(`${artifact}: ${item.id}: FR technical-review completion marker is missing parseable reviewer evidence`);
      } else {
        const result = qualifiedFrReviewerEvidence(body);
        if (!result.ok) errors.push(`${artifact}: ${item.id}: ${result.reason}`);
      }
    }

    if (/BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\b/i.test(en)) {
      const body = completionBody(en, "BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?");
      if (!body) {
        errors.push(`${artifact}: ${item.id}: EN bilingual-review completion marker is missing parseable reviewer evidence`);
      } else {
        const result = qualifiedBilingualReviewerEvidence(body);
        if (!result.ok) errors.push(`${artifact}: ${item.id}: ${result.reason}`);
      }
    } else if (isGenericEnCompletion(en)) {
      errors.push(`${artifact}: ${item.id}: generic EN state "${normalize(en)}" cannot replace the explicit bilingual technical-review completion marker`);
    }
  }
  return errors;
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : null;
}

function repositoryCheck() {
  const errors = [];

  for (const fn of functions) {
    const matrix = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
    const matrixText = read(matrix);
    if (matrixText === null) errors.push(`${matrix}: missing required source/competency matrix`);
    else errors.push(...validateMatrixText(matrixText, matrix));

    for (const artifact of [`docs/DGR_PRODUCTION_BANK_${fn}.md`, `docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`]) {
      const text = read(artifact);
      if (text !== null) errors.push(...validateDurableStatusText(text, artifact));
    }
  }

  const stage = read("docs/DGR_STAGE_2B_STATUS.md");
  if (stage !== null) errors.push(...validateDurableStatusText(stage, "docs/DGR_STAGE_2B_STATUS.md"));

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR REVIEW-EVIDENCE SEMANTICS CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR REVIEW-EVIDENCE SEMANTICS CHECK: PASS");
  console.log("PASS validates only durable review-evidence semantics; it does not prove regulatory correctness or ANAC/IATA approval.");
}

function expect(name, fn, expectedOk) {
  const result = fn();
  const ok = typeof result === "boolean" ? result : Boolean(result?.ok);
  if (ok !== expectedOk) throw new Error(`${name}: expected ok=${expectedOk}, got ${ok}${result?.reason ? ` (${result.reason})` : ""}`);
}

function fixtures() {
  expect("valid-source-verifier", () => namedVerifierWithRealDate("Bookshelf verifier, 2026-09-06"), true);
  expect("impossible-source-date", () => namedVerifierWithRealDate("Bookshelf verifier, 2026-02-31"), false);
  expect("future-source-date", () => namedVerifierWithRealDate("Bookshelf verifier, 2999-01-01"), false);
  expect("valid-fr-reviewer", () => qualifiedFrReviewerEvidence("Jane Doe, DGR/CBTA Instructor, 2026-09-06"), true);
  expect("valid-bilingual-reviewer", () => qualifiedBilingualReviewerEvidence("John Smith, Bilingual DGR Reviewer, 2026-09-06"), true);
  expect("missing-dgr-credential", () => qualifiedBilingualReviewerEvidence("John Smith, Bilingual Reviewer, 2026-09-06"), false);
  expect("missing-bilingual-credential", () => qualifiedBilingualReviewerEvidence("John Smith, DGR Reviewer, 2026-09-06"), false);
  expect("impossible-en-date", () => qualifiedBilingualReviewerEvidence("John Smith, Bilingual DGR Reviewer, 2026-02-31"), false);
  expect("future-en-date", () => qualifiedBilingualReviewerEvidence("John Smith, Bilingual DGR Reviewer, 2999-01-01"), false);

  if (!isCanonicalBilingualReviewComplete("BILINGUAL TECHNICAL REVIEW COMPLETE")) {
    throw new Error("canonical EN completion marker was not recognized");
  }
  for (const state of ["REVIEWED", "EN REVIEWED", "COMPLETE", "COMPLETED", "APPROVED"]) {
    if (!isGenericEnCompletion(state)) throw new Error(`generic EN completion fixture was not recognized: ${state}`);
    if (isCanonicalBilingualReviewComplete(state)) throw new Error(`generic EN completion fixture was incorrectly accepted as canonical: ${state}`);
  }
  if (isGenericEnCompletion("BILINGUAL TECHNICAL REVIEW REQUIRED")) {
    throw new Error("pending bilingual review state was incorrectly treated as complete");
  }

  const validMatrix = `| Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |\n|---|---|---|---|---|\n| 0.1.1 | FROZEN FR / SOURCE VERIFIED | Bookshelf verifier, 2026-09-06 | BILINGUAL TECHNICAL REVIEW COMPLETE | John Smith, Bilingual DGR Reviewer, 2026-09-06 |\n`;
  if (validateMatrixText(validMatrix, "valid-matrix.md").length) throw new Error("valid matrix review evidence was rejected");

  const genericMatrix = validMatrix.replace("BILINGUAL TECHNICAL REVIEW COMPLETE", "COMPLETE");
  if (!validateMatrixText(genericMatrix, "generic-matrix.md").length) throw new Error("generic EN COMPLETE state was accepted");

  const noBilingualMatrix = validMatrix.replace("Bilingual DGR Reviewer", "DGR Reviewer");
  if (!validateMatrixText(noBilingualMatrix, "no-bilingual-matrix.md").length) throw new Error("EN DGR-only credential was accepted without bilingual evidence");

  const duplicateFrStateMatrix = `| Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date | FR source-verification state |\n|---|---|---|---|---|---|\n| 0.1.1 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending | FROZEN FR / SOURCE VERIFIED |\n`;
  if (!validateMatrixText(duplicateFrStateMatrix, "duplicate-fr-state-header.md").length) {
    throw new Error("duplicate FR source-verification header was accepted");
  }

  const duplicateTaskMatrix = `| Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date | Official task ID |\n|---|---|---|---|---|---|\n| 0.1.1 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending | 9.9.9 |\n`;
  if (!validateMatrixText(duplicateTaskMatrix, "duplicate-task-header.md").length) {
    throw new Error("duplicate Official task ID header was accepted");
  }

  const firstTaskAsSeparator = `| Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |\n| 0.1.1 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending |\n| 0.1.2 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending |\n`;
  if (!validateMatrixText(firstTaskAsSeparator, "first-task-as-separator.md").length) {
    throw new Error("first matrix task row was accepted as Markdown separator");
  }

  const wideRowMatrix = `| Official task ID | FR source-verification state | FR verifier + date | EN bilingual-review state | EN reviewer + date |\n|---|---|---|---|---|\n| 0.1.1 | DRAFT / NOT YET VERIFIED | pending | BILINGUAL TECHNICAL REVIEW REQUIRED | pending | shadow |\n`;
  if (!validateMatrixText(wideRowMatrix, "wide-row.md").length) {
    throw new Error("wide matrix row was accepted by review-evidence semantics parser");
  }

  console.log("DGR review-evidence semantics regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();