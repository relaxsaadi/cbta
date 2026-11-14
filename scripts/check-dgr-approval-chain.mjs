#!/usr/bin/env node

/**
 * Fail-closed DGR/CBTA approval-chain guard.
 *
 * This checker does not decide regulatory correctness and never approves a
 * question. It requires terminal FR technical review before terminal EN
 * bilingual review, rejects contradictory FR→EN review chronology, and rejects
 * durable APPROVED claims that skip the repository's documented source,
 * qualified-FR-review, qualified bilingual-review, or final-signoff gates.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const idPattern = /^Q-7\.(?:10|[1-9])-\d{3}$/i;

const normalize = (value = "") => value.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
const isApproved = (value = "") => /^APPROVED\b/i.test(normalize(value));

function isPlaceholder(value = "") {
  return /(?:^|\b)(?:pending|tbd|todo|unknown|unnamed|reviewer|name|credential|qualification|à renseigner|a renseigner|non renseigné|non renseigne)(?:\b|$)|[<>]/i.test(normalize(value));
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
  if (!text || text.length < 3) return false;
  if (/(?:^|\b)(?:pending|tbd|todo|unknown|unnamed|à renseigner|a renseigner|non renseigné|non renseigne)(?:\b|$)|[<>]/i.test(text)) return false;
  return /\bDGR\b|\bCBTA\b|dangerous\s+goods|marchandises\s+dangereuses/i.test(text);
}

function looksExplicitlyBilingual(value = "") {
  const text = normalize(value);
  if (!text || /(?:^|\b)(?:pending|tbd|todo|unknown|unnamed|à renseigner|a renseigner|non renseigné|non renseigne)(?:\b|$)|[<>]/i.test(text)) return false;
  return /\bbilingual\b|\bbilingue\b|\bFR\s*[\/+&-]\s*EN\b|\bEN\s*[\/+&-]\s*FR\b|French\s*[\/+&-]\s*English|English\s*[\/+&-]\s*French|fran[cç]ais\s*[\/+&-]\s*anglais|anglais\s*[\/+&-]\s*fran[cç]ais/i.test(text);
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

function terminalFrSourceState(value = "") {
  const text = normalize(value).toUpperCase();
  if (!text) return false;
  if (/SOURCE GAP|SOURCE CONFLICT|PARTIALLY CONFIRMED|STALE CITATION|\bDRAFT\b|SOURCE REQUIRED|NOT YET VERIFIED/.test(text)) return false;
  return /^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/.test(text);
}

function completedReview(value, kind) {
  const text = normalize(value);
  const re = kind === "fr"
    ? /FR TECHNICAL REVIEW COMPLETE\s*\(reviewed by\s+([^)]*)\)/i
    : /BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/i;
  const body = text.match(re)?.[1]?.trim() ?? "";
  if (!body) return { ok: false, reason: `${kind.toUpperCase()} completion marker/reviewer missing` };

  const date = body.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  if (!date) return { ok: false, reason: `${kind.toUpperCase()} ISO review date missing` };
  if (!isRealNonFutureIsoDate(date)) {
    return { ok: false, reason: `${kind.toUpperCase()} review date is impossible or in the future` };
  }

  const beforeDate = body.slice(0, body.indexOf(date)).replace(/[;,\-–—]+\s*$/g, "").trim();
  const parts = beforeDate.split(/\s*,\s*/).filter(Boolean);
  const name = parts[0] ?? "";
  if (!looksLikeFullName(name)) return { ok: false, reason: `${kind.toUpperCase()} full reviewer name missing/placeholder` };

  const credential = parts.slice(1).join(", ").trim();
  if (!looksLikeDgrCredential(credential)) {
    return {
      ok: false,
      reason: kind === "fr"
        ? "FR reviewer DGR/CBTA role/credential missing"
        : "EN reviewer bilingual DGR/CBTA role/credential missing",
    };
  }
  if (kind === "en" && !looksExplicitlyBilingual(credential)) {
    return { ok: false, reason: "EN reviewer credential does not explicitly establish bilingual competence" };
  }
  return { ok: true, date };
}

function finalApprovalDate(value = "") {
  const text = normalize(value);
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  if (!isApproved(text) || !date || !isRealNonFutureIsoDate(date)) return "";
  const body = text.replace(/^APPROVED\b\s*[:\-–—]?\s*/i, "");
  const name = body.slice(0, body.indexOf(date)).replace(/[;,\-–—]+\s*$/g, "").trim();
  return looksLikeFullName(name) ? date : "";
}

function finalApprovalComplete(value = "") {
  return Boolean(finalApprovalDate(value));
}

function field(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`^\\s*(?:[-+*]\\s+)?\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "im"))?.[1]?.trim() ?? "";
}

function itemRecords(text, artifact, kind) {
  const re = /^#{2,4}\s+(Q-7\.(?:10|[1-9])-\d{3})\b.*$/gmi;
  const matches = [...text.matchAll(re)];
  return matches.map((match, i) => {
    const start = match.index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
    const block = text.slice(start, end);
    return { id: match[1].toUpperCase(), fr: field(block, "FR status"), en: field(block, "EN status"), approval: field(block, "Approval"), artifact, kind, format: "item" };
  });
}

function cells(line) {
  const t = line.trim();
  return t.startsWith("|") && t.endsWith("|") ? t.slice(1, -1).split("|").map((v) => v.trim()) : [];
}

function tableRecords(text, artifact, kind) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const headers = cells(lines[i]);
    const h = headers.map((v) => normalize(v).toLowerCase());
    const idx = { id: h.indexOf("id"), fr: h.indexOf("fr status"), en: h.indexOf("en status"), approval: h.indexOf("approval") };
    if (Object.values(idx).some((v) => v < 0) || !cells(lines[i + 1] ?? "").length) continue;
    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      const id = normalize(row[idx.id] ?? "").toUpperCase();
      if (!idPattern.test(id)) continue;
      out.push({ id, fr: row[idx.fr] ?? "", en: row[idx.en] ?? "", approval: row[idx.approval] ?? "", artifact, kind, format: "table" });
    }
  }
  return out;
}

const recordsFromText = (text, artifact, kind) => [...itemRecords(text, artifact, kind), ...tableRecords(text, artifact, kind)];

function reviewSequenceErrors(record) {
  const fr = completedReview(record.fr, "fr");
  const en = completedReview(record.en, "en");
  if (en.ok && !fr.ok) {
    return [`Gate 3 sequence invalid: terminal EN bilingual review recorded before a valid terminal FR technical review (${fr.reason})`];
  }
  if (fr.ok && en.ok && en.date < fr.date) {
    return [`Gate 3 chronology invalid: EN bilingual review date ${en.date} predates FR technical review date ${fr.date}`];
  }
  return [];
}

function approvedRecordErrors(record) {
  if (!isApproved(record.approval)) return [];
  const errors = [];
  if (!terminalFrSourceState(record.fr)) errors.push("Gate 1 direct current FROZEN FR / SOURCE VERIFIED state missing or unresolved source state present");
  const fr = completedReview(record.fr, "fr");
  if (!fr.ok) errors.push(`Gate 2 incomplete: ${fr.reason}`);
  const en = completedReview(record.en, "en");
  if (!en.ok) errors.push(`Gate 3 incomplete: ${en.reason}`);
  const approvalDate = finalApprovalDate(record.approval);
  if (!finalApprovalComplete(record.approval)) errors.push("Gate 4 accountable reviewer full name + real non-future ISO date missing");

  if (approvalDate && fr.ok && approvalDate < fr.date) {
    errors.push(`Gate 4 chronology invalid: final approval date ${approvalDate} predates FR technical review date ${fr.date}`);
  }
  if (approvalDate && en.ok && approvalDate < en.date) {
    errors.push(`Gate 4 chronology invalid: final approval date ${approvalDate} predates EN bilingual review date ${en.date}`);
  }
  return errors;
}

function validate(records, crossArtifact = true) {
  const errors = [];
  for (const record of records) {
    for (const error of reviewSequenceErrors(record)) errors.push(`${record.artifact}: ${record.id} (${record.format}) — ${error}`);
    for (const error of approvedRecordErrors(record)) errors.push(`${record.artifact}: ${record.id} (${record.format}) — ${error}`);
  }
  if (!crossArtifact) return errors;

  const byId = new Map();
  for (const record of records) (byId.get(record.id) ?? (byId.set(record.id, []), byId.get(record.id))).push(record);
  for (const [id, set] of byId) {
    if (!set.some((r) => isApproved(r.approval))) continue;
    const explicit = set.filter((r) => normalize(r.approval));
    const stale = explicit.filter((r) => !isApproved(r.approval));
    if (stale.length) errors.push(`${id}: APPROVED conflicts with pending/non-approved duplicate record(s): ${stale.map((r) => `${r.artifact} (${normalize(r.approval)})`).join("; ")}`);
    if (!set.some((r) => r.kind === "bank")) errors.push(`${id}: APPROVED has no durable bank/status record`);
    if (!set.some((r) => r.kind === "en")) errors.push(`${id}: APPROVED has no separate EN review-package record`);
  }
  return errors;
}

function read(relative) {
  const p = path.join(root, relative);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function repositoryCheck() {
  const records = [];
  records.push(...recordsFromText(read("docs/DGR_STAGE_2B_STATUS.md"), "docs/DGR_STAGE_2B_STATUS.md", "bank"));
  for (const fn of functions) {
    const bank = `docs/DGR_PRODUCTION_BANK_${fn}.md`;
    const en = `docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`;
    records.push(...recordsFromText(read(bank), bank, "bank"));
    records.push(...recordsFromText(read(en), en, "en"));
  }
  const errors = validate(records, true);
  if (errors.length) {
    errors.forEach((e) => console.error(`ERROR: ${e}`));
    console.error(`\nDGR APPROVAL-CHAIN CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }
  const approved = new Set(records.filter((r) => isApproved(r.approval)).map((r) => r.id));
  console.log(`DGR APPROVAL-CHAIN CHECK: PASS (${approved.size} APPROVED item(s) observed)`);
  console.log("PASS validates terminal FR→EN sequencing, review chronology, and the final sign-off chain; it does not prove regulatory correctness or ANAC/IATA approval.");
}

function expect(name, text, shouldFail) {
  const errors = validate(recordsFromText(text, `${name}.md`, "bank"), false);
  if ((errors.length > 0) !== shouldFail) throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
}

function fixtures() {
  const valid = `## Q-7.2-001 — fixture\n\n**FR status:** FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06)\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)\n**Approval:** APPROVED — Jane Doe, 2026-09-06\n`;
  const validList = valid.replaceAll("\n**", "\n- **");
  const ordered = valid
    .replace("Jane Doe, DGR/CBTA Instructor, 2026-09-06", "Jane Doe, DGR/CBTA Instructor, 2026-09-04")
    .replace("John Smith, Bilingual DGR Reviewer, 2026-09-06", "John Smith, Bilingual DGR Reviewer, 2026-09-05");
  const enBeforeFr = valid.replace("John Smith, Bilingual DGR Reviewer, 2026-09-06", "John Smith, Bilingual DGR Reviewer, 2026-09-05");
  const pendingOrdered = ordered.replace("APPROVED — Jane Doe, 2026-09-06", "PENDING REVIEWER + DATE");
  const pendingEnBeforeFr = enBeforeFr.replace("APPROVED — Jane Doe, 2026-09-06", "PENDING REVIEWER + DATE");
  const pendingFrOnly = valid
    .replace("BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)", "BILINGUAL TECHNICAL REVIEW REQUIRED")
    .replace("APPROVED — Jane Doe, 2026-09-06", "PENDING REVIEWER + DATE");
  const pendingEnOnly = valid
    .replace(" — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06)", "")
    .replace("APPROVED — Jane Doe, 2026-09-06", "PENDING REVIEWER + DATE");
  const approvalBeforeEn = ordered
    .replace("John Smith, Bilingual DGR Reviewer, 2026-09-05", "John Smith, Bilingual DGR Reviewer, 2026-09-06")
    .replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Jane Doe, 2026-09-05");
  const approvalBeforeFr = valid.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Jane Doe, 2026-09-05");
  const gap = valid.replace("Q-7.2-001", "Q-7.2-002").replace("FROZEN FR / SOURCE VERIFIED", "FR SOURCE GAP CONFIRMED — Tier B/C basis retained");
  expect("valid-approved-chain", valid, false);
  expect("ordered-approved-chain", ordered, false);
  expect("valid-list-form-approved-chain", validList, false);
  expect("en-review-before-fr-review", enBeforeFr, true);
  expect("pending-ordered-fr-en-reviews", pendingOrdered, false);
  expect("pending-en-review-before-fr-review", pendingEnBeforeFr, true);
  expect("pending-fr-review-only", pendingFrOnly, false);
  expect("pending-en-review-without-fr-review", pendingEnOnly, true);
  expect("approval-before-en-review", approvalBeforeEn, true);
  expect("approval-before-fr-review", approvalBeforeFr, true);
  expect("list-form-source-gap-approved", validList.replace("FROZEN FR / SOURCE VERIFIED", "FR SOURCE GAP CONFIRMED — Tier B/C basis retained"), true);
  expect("list-form-pending-en-review", validList.replace("BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)", "BILINGUAL TECHNICAL REVIEW REQUIRED"), true);
  expect("source-gap-approved", gap, true);
  expect("draft-approved", valid.replace("FROZEN FR / SOURCE VERIFIED", "DRAFT — Tier A required"), true);
  expect("missing-fr-review", valid.replace(" — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06)", ""), true);
  expect("missing-fr-credential", valid.replace("Jane Doe, DGR/CBTA Instructor, 2026-09-06", "Jane Doe, Trainer, 2026-09-06"), true);
  expect("pending-en-review", valid.replace("BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)", "BILINGUAL TECHNICAL REVIEW REQUIRED"), true);
  expect("missing-en-credential", valid.replace("John Smith, Bilingual DGR Reviewer, 2026-09-06", "John Smith, 2026-09-06"), true);
  expect("missing-en-bilingual-competence", valid.replace("John Smith, Bilingual DGR Reviewer, 2026-09-06", "John Smith, DGR Reviewer, 2026-09-06"), true);
  expect("impossible-fr-date", valid.replaceAll("2026-09-06", "2026-02-31"), true);
  expect("future-en-date", valid.replace("John Smith, Bilingual DGR Reviewer, 2026-09-06", "John Smith, Bilingual DGR Reviewer, 2999-01-01"), true);
  expect("future-final-date", valid.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Jane Doe, 2999-01-01"), true);
  expect("generic-final-reviewer", valid.replace("APPROVED — Jane Doe, 2026-09-06", "APPROVED — Reviewer, 2026-09-06"), true);
  expect("ordinary-pending-item", `## Q-7.2-003\n\n**FR status:** DRAFT\n**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**Approval:** PENDING REVIEWER + DATE\n`, false);
  expect("ordinary-list-form-pending-item", `## Q-7.2-004\n\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n`, false);
  expect("table-approved-before-en-review", `| ID | FR status | Type | Current source basis | EN status | Approval |\n|---|---|---|---|---|---|\n| Q-7.3-001 | FROZEN FR / SOURCE VERIFIED | MCQ | fixture | BILINGUAL TECHNICAL REVIEW REQUIRED | APPROVED — Jane Doe, 2026-09-06 |\n`, true);
  expect("table-approved-missing-bilingual-competence", `| ID | FR status | EN status | Approval |\n|---|---|---|---|\n| Q-7.3-002 | FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, DGR/CBTA Instructor, 2026-09-06) | BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, DGR Reviewer, 2026-09-06) | APPROVED — Jane Doe, 2026-09-06 |\n`, true);
  console.log("DGR approval-chain regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();