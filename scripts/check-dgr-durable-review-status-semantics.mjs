#!/usr/bin/env node

/**
 * Fail-closed durable-status semantics guard for DGR/CBTA Functions 7.1–7.10.
 *
 * The production-bank and EN-review artifacts commonly encode metadata as
 * Markdown list items (`- **FR status:** ...`). This guard deliberately parses
 * both list-form and plain metadata so terminal human-review claims cannot be
 * hidden from CI by formatting alone.
 *
 * It does not decide regulatory correctness, validate licensed IATA text, or
 * promote any question. It only validates the evidence shape attached to
 * durable FR/EN review-completion claims.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

const normalize = (value = "") => value.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();

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
  const words = normalize(value).match(/[\p{L}][\p{L}'’.-]*/gu) ?? [];
  if (words.length < 2) return false;
  const generic = /^(?:IATA|ANAC|KOST|reviewer|instructor|auditor|admin|administrator|team|staff|operator)$/i;
  return !words.every((word) => generic.test(word));
}

function looksLikeDgrCredential(value = "") {
  return /\bDGR\b|\bCBTA\b|dangerous\s+goods|marchandises\s+dangereuses/i.test(normalize(value));
}

function looksExplicitlyBilingual(value = "") {
  return /\bbilingual\b|\bbilingue\b|\bFR\s*[\/+&-]\s*EN\b|\bEN\s*[\/+&-]\s*FR\b|French\s*[\/+&-]\s*English|English\s*[\/+&-]\s*French|fran[cç]ais\s*[\/+&-]\s*anglais|anglais\s*[\/+&-]\s*fran[cç]ais/i.test(normalize(value));
}

function parseReviewerEvidence(value = "") {
  const text = normalize(value);
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  const beforeDate = date
    ? text.slice(0, text.indexOf(date)).replace(/[;,\-–—]+\s*$/g, "").trim()
    : text;
  const parts = beforeDate.split(/\s*,\s*/).filter(Boolean);
  return {
    name: parts[0] ?? "",
    credential: parts.slice(1).join(", ").trim(),
    date,
  };
}

function qualifiedFrReviewer(value = "") {
  const evidence = parseReviewerEvidence(value);
  if (!looksLikeFullName(evidence.name)) return false;
  if (!looksLikeDgrCredential(evidence.credential)) return false;
  return isRealNonFutureIsoDate(evidence.date);
}

function qualifiedBilingualReviewer(value = "") {
  const evidence = parseReviewerEvidence(value);
  if (!looksLikeFullName(evidence.name)) return false;
  if (!looksLikeDgrCredential(evidence.credential)) return false;
  if (!looksExplicitlyBilingual(evidence.credential)) return false;
  return isRealNonFutureIsoDate(evidence.date);
}

function field(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s*(?:[-*+]\\s+)?\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "im");
  return block.match(pattern)?.[1]?.trim() ?? "";
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

function isGenericEnCompletion(value = "") {
  const state = normalize(value).toUpperCase();
  return /^(?:EN\s+)?REVIEWED\b/.test(state) || /^(?:COMPLETE|COMPLETED|APPROVED)\b/.test(state);
}

function validateText(text, artifact) {
  const errors = [];

  for (const item of itemBlocks(text)) {
    const fr = field(item.text, "FR status");
    const en = field(item.text, "EN status");

    if (/FR TECHNICAL REVIEW COMPLETE\b/i.test(fr)) {
      const body = completionBody(fr, "FR TECHNICAL REVIEW COMPLETE");
      if (!body || !qualifiedFrReviewer(body)) {
        errors.push(`${artifact}: ${item.id}: FR terminal review requires full named DGR/CBTA reviewer + real non-future ISO date`);
      }
    }

    if (/BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\b/i.test(en)) {
      const body = completionBody(en, "BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?");
      if (!body || !qualifiedBilingualReviewer(body)) {
        errors.push(`${artifact}: ${item.id}: EN terminal review requires full named bilingual DGR/CBTA reviewer + real non-future ISO date`);
      }
    } else if (isGenericEnCompletion(en)) {
      errors.push(`${artifact}: ${item.id}: generic EN completion state "${normalize(en)}" cannot replace BILINGUAL TECHNICAL REVIEW COMPLETE`);
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
    for (const artifact of [`docs/DGR_PRODUCTION_BANK_${fn}.md`, `docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`]) {
      const text = read(artifact);
      if (text !== null) errors.push(...validateText(text, artifact));
    }
  }

  const stage = read("docs/DGR_STAGE_2B_STATUS.md");
  if (stage !== null) errors.push(...validateText(stage, "docs/DGR_STAGE_2B_STATUS.md"));

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`DGR DURABLE REVIEW-STATUS SEMANTICS CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR DURABLE REVIEW-STATUS SEMANTICS CHECK: PASS");
  console.log("PASS validates durable FR/EN review-status evidence shape only; it does not prove regulatory correctness or ANAC/IATA approval.");
}

function expectErrors(name, text, expectedCount) {
  const errors = validateText(text, `${name}.md`);
  if (errors.length !== expectedCount) {
    throw new Error(`${name}: expected ${expectedCount} error(s), got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  expectErrors(
    "pending-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT — SOURCE REQUIRED\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n`,
    0,
  );

  expectErrors(
    "invalid-fr-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** FR TECHNICAL REVIEW COMPLETE (reviewed by Reviewer, 2026-09-08)\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n`,
    1,
  );

  expectErrors(
    "invalid-en-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, DGR Reviewer, 2026-09-08)\n`,
    1,
  );

  expectErrors(
    "generic-en-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** APPROVED\n`,
    1,
  );

  expectErrors(
    "valid-terminal-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-08)\n- **EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR/CBTA Reviewer, 2026-09-08)\n`,
    0,
  );

  expectErrors(
    "valid-terminal-plain-form",
    `### Q-7.2-001 — synthetic\n**FR status:** FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-08)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR/CBTA Reviewer, 2026-09-08)\n`,
    0,
  );

  console.log("DGR durable review-status semantics regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
