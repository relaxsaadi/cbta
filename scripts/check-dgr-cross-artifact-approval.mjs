#!/usr/bin/env node

/**
 * Cross-artifact approval consistency guard for DGR/CBTA 7.1-7.10.
 *
 * This checker never approves questions. It only rejects durable APPROVED
 * claims that are not consistently represented across the production-bank/
 * status layer and the separate EN review-package layer.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const idPattern = /^Q-7\.(?:10|[1-9])-\d{3}$/i;

const normalize = (value = "") => value.replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
const isApproved = (value = "") => /^APPROVED\b/i.test(normalize(value));

function isPlaceholder(value = "") {
  const text = normalize(value);
  return !text || /(?:^|\b)(?:pending|tbd|todo|unknown|unnamed|reviewer|name|credential|qualification|à renseigner|a renseigner|non renseigné|non renseigne)(?:\b|$)|[<>]/i.test(text);
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
  if (!text || /(?:^|\b)(?:pending|tbd|todo|unknown|unnamed|à renseigner|a renseigner|non renseigné|non renseigne)(?:\b|$)|[<>]/i.test(text)) return false;
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
  if (instant.getUTCFullYear() !== year || instant.getUTCMonth() !== month - 1 || instant.getUTCDate() !== day) return false;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return instant.getTime() <= todayUtc;
}

function completedBilingualReview(value = "") {
  const text = normalize(value);
  const body = text.match(/BILINGUAL TECHNICAL REVIEW COMPLETE(?:D)?\s*\(reviewed by\s+([^)]*)\)/i)?.[1]?.trim() ?? "";
  if (!body) return { ok: false, reason: "canonical bilingual completion marker/reviewer missing" };
  const date = body.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  if (!date) return { ok: false, reason: "EN ISO review date missing" };
  if (!isRealNonFutureIsoDate(date)) return { ok: false, reason: "EN review date is impossible or in the future" };
  const beforeDate = body.slice(0, body.indexOf(date)).replace(/[;,\-–—]+\s*$/g, "").trim();
  const parts = beforeDate.split(/\s*,\s*/).filter(Boolean);
  const name = parts[0] ?? "";
  const credential = parts.slice(1).join(", ").trim();
  if (!looksLikeFullName(name)) return { ok: false, reason: "full EN reviewer name missing/placeholder" };
  if (!looksLikeDgrCredential(credential)) return { ok: false, reason: "EN reviewer DGR/CBTA role or credential missing" };
  if (!looksExplicitlyBilingual(credential)) return { ok: false, reason: "EN reviewer credential does not explicitly establish bilingual competence" };
  return { ok: true };
}

function field(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`^\\s*(?:[-+*]\\s+)?\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "im"))?.[1]?.trim() ?? "";
}

function itemRecords(text, artifact, kind) {
  const re = /^#{2,4}\s+(Q-7\.(?:10|[1-9])-\d{3})\b.*$/gmi;
  const matches = [...text.matchAll(re)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    const block = text.slice(start, end);
    return { id: match[1].toUpperCase(), en: field(block, "EN status"), approval: field(block, "Approval"), artifact, kind, format: "item" };
  });
}

function cells(line) {
  const text = line.trim();
  return text.startsWith("|") && text.endsWith("|") ? text.slice(1, -1).split("|").map((value) => value.trim()) : [];
}

function isMarkdownSeparator(row, width) {
  return row.length === width && row.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function approvalTableHeader(line) {
  const headers = cells(line);
  const normalized = headers.map((value) => normalize(value).toLowerCase());
  const idIndex = normalized.indexOf("id");
  const enIndex = normalized.indexOf("en status");
  const approvalIndex = normalized.indexOf("approval");
  if (idIndex < 0 || enIndex < 0 || approvalIndex < 0) return null;
  return { headers, idIndex, enIndex, approvalIndex };
}

function tableStructureErrors(text, artifact) {
  const lines = text.split(/\r?\n/);
  const errors = [];
  for (let i = 0; i < lines.length; i += 1) {
    const header = approvalTableHeader(lines[i]);
    if (!header) continue;
    const separator = cells(lines[i + 1] ?? "");
    if (!isMarkdownSeparator(separator, header.headers.length)) {
      errors.push(`${artifact}: approval table header at line ${i + 1} is not followed by a valid same-width Markdown separator`);
      continue;
    }
    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      if (row.length !== header.headers.length) {
        errors.push(`${artifact}: approval table row at line ${j + 1} has ${row.length} column(s); expected ${header.headers.length}`);
      }
    }
  }
  return errors;
}

function tableRecords(text, artifact, kind) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const header = approvalTableHeader(lines[i]);
    if (!header) continue;
    const separator = cells(lines[i + 1] ?? "");
    if (!isMarkdownSeparator(separator, header.headers.length)) continue;
    for (let j = i + 2; j < lines.length; j += 1) {
      const row = cells(lines[j]);
      if (!row.length) break;
      if (row.length !== header.headers.length) continue;
      const id = normalize(row[header.idIndex] ?? "").toUpperCase();
      if (!idPattern.test(id)) continue;
      out.push({ id, en: row[header.enIndex] ?? "", approval: row[header.approvalIndex] ?? "", artifact, kind, format: "table" });
    }
  }
  return out;
}

const recordsFromText = (text, artifact, kind) => [...itemRecords(text, artifact, kind), ...tableRecords(text, artifact, kind)];

function validate(records) {
  const errors = [];
  const byId = new Map();
  for (const record of records) {
    if (!byId.has(record.id)) byId.set(record.id, []);
    byId.get(record.id).push(record);
  }
  for (const [id, set] of byId) {
    if (!set.some((record) => isApproved(record.approval))) continue;
    const bankRecords = set.filter((record) => record.kind === "bank");
    const enRecords = set.filter((record) => record.kind === "en");
    if (!bankRecords.some((record) => isApproved(record.approval))) {
      errors.push(`${id}: APPROVED exists outside the durable bank/status layer; no bank/status record is itself APPROVED`);
    }
    for (const record of bankRecords) {
      if (!isApproved(record.approval)) {
        errors.push(`${record.artifact}: ${id} (${record.format}) — contradictory/non-approved durable bank/status state for APPROVED item`);
      }
    }
    if (!enRecords.length) {
      errors.push(`${id}: APPROVED has no separate EN review-package record`);
      continue;
    }
    if (!enRecords.some((record) => completedBilingualReview(record.en).ok)) {
      errors.push(`${id}: separate EN review package has no canonical completed qualified bilingual DGR/CBTA review`);
    }
    for (const record of enRecords) {
      const result = completedBilingualReview(record.en);
      if (!result.ok) {
        errors.push(`${record.artifact}: ${id} (${record.format}) — contradictory/non-complete EN package state for APPROVED item: ${result.reason}`);
      }
    }
  }
  return errors;
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
}

function repositoryArtifacts() {
  const artifacts = [{ path: "docs/DGR_STAGE_2B_STATUS.md", kind: "bank" }];
  for (const fn of functions) {
    artifacts.push({ path: `docs/DGR_PRODUCTION_BANK_${fn}.md`, kind: "bank" });
    artifacts.push({ path: `docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`, kind: "en" });
  }
  return artifacts;
}

function repositoryCheck() {
  const records = [];
  const structuralErrors = [];
  for (const artifact of repositoryArtifacts()) {
    const text = read(artifact.path);
    structuralErrors.push(...tableStructureErrors(text, artifact.path));
    records.push(...recordsFromText(text, artifact.path, artifact.kind));
  }
  const errors = [...structuralErrors, ...validate(records)];
  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR CROSS-ARTIFACT APPROVAL CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }
  const approved = new Set(records.filter((record) => isApproved(record.approval)).map((record) => record.id));
  console.log(`DGR CROSS-ARTIFACT APPROVAL CHECK: PASS (${approved.size} APPROVED item(s) observed)`);
  console.log("PASS validates only cross-artifact approval consistency; it does not prove regulatory correctness or ANAC/IATA approval.");
}

function fixtureState(bankText, enText) {
  const specs = [
    { text: bankText, artifact: "bank.md", kind: "bank" },
    { text: enText, artifact: "en.md", kind: "en" },
  ];
  const records = [];
  const errors = [];
  for (const spec of specs) {
    errors.push(...tableStructureErrors(spec.text, spec.artifact));
    records.push(...recordsFromText(spec.text, spec.artifact, spec.kind));
  }
  errors.push(...validate(records));
  return { records, errors };
}

function expect(name, bankText, enText, shouldFail) {
  const { errors } = fixtureState(bankText, enText);
  if ((errors.length > 0) !== shouldFail) throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
}

function fixtures() {
  const completeStatus = "BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by John Smith, Bilingual DGR Reviewer, 2026-09-06)";
  const bankApproved = `## Q-7.2-001\n\n**EN status:** ${completeStatus}\n**Approval:** APPROVED — Jane Doe, 2026-09-06\n`;
  const bankPending = bankApproved.replace("APPROVED — Jane Doe, 2026-09-06", "PENDING REVIEWER + DATE");
  const enComplete = `## Q-7.2-001\n\n**EN status:** ${completeStatus}\n**Approval:**\n`;
  const enPending = enComplete.replace(completeStatus, "BILINGUAL TECHNICAL REVIEW REQUIRED");
  const enBlank = `## Q-7.2-001\n\n**EN status:**\n**Approval:**\n`;
  const enApproved = enComplete.replace("**Approval:**", "**Approval:** APPROVED — Jane Doe, 2026-09-06");
  const listForm = (text) => text.replace(/^\*\*(EN status|Approval):\*\*/gm, "- **$1:**");
  expect("valid-cross-artifact", bankApproved, enComplete, false);
  expect("valid-list-form-cross-artifact", listForm(bankApproved), listForm(enComplete), false);
  expect("list-form-bank-approved-en-pending", listForm(bankApproved), listForm(enPending), true);
  expect("list-form-en-only-approved-bank-pending", listForm(bankPending), listForm(enApproved), true);
  expect("bank-approved-en-pending", bankApproved, enPending, true);
  expect("en-only-approved-bank-pending", bankPending, enApproved, true);
  expect("bank-approved-no-en-record", bankApproved, "", true);
  const contradictoryBank = `${bankApproved}\n${bankPending}`;
  expect("contradictory-bank-record", contradictoryBank, enComplete, true);
  const contradictoryEn = `${enComplete}\n## Q-7.2-001\n\n**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**Approval:**\n`;
  expect("contradictory-en-record", bankApproved, contradictoryEn, true);
  const blankDuplicateEn = `${enComplete}\n${enBlank}`;
  expect("blank-duplicate-en-record", bankApproved, blankDuplicateEn, true);
  expect("ordinary-pending", bankPending, enPending, false);
  expect("ordinary-list-form-pending", listForm(bankPending), listForm(enPending), false);

  const validTableBank = `| ID | EN status | Approval |\n| --- | --- | --- |\n| Q-7.2-001 | ${completeStatus} | APPROVED — Jane Doe, 2026-09-06 |\n`;
  expect("valid-table", validTableBank, enComplete, false);
  const firstDataAsSeparator = `| ID | EN status | Approval |\n| Q-7.2-001 | ${completeStatus} | APPROVED — Jane Doe, 2026-09-06 |\n`;
  expect("first-data-row-cannot-masquerade-as-separator", firstDataAsSeparator, enComplete, true);
  const wrongWidthSeparator = `| ID | EN status | Approval |\n| --- | --- |\n| Q-7.2-001 | ${completeStatus} | APPROVED — Jane Doe, 2026-09-06 |\n`;
  expect("wrong-width-separator", wrongWidthSeparator, enComplete, true);
  const wrongWidthData = `| ID | EN status | Approval |\n| --- | --- | --- |\n| Q-7.2-001 | ${completeStatus} | APPROVED — Jane Doe, 2026-09-06 | extra |\n`;
  expect("wrong-width-data-row", wrongWidthData, enComplete, true);

  console.log("DGR cross-artifact approval regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
