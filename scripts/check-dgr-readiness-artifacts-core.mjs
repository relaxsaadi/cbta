#!/usr/bin/env node

/**
 * Deterministic DGR/CBTA readiness artifact guard.
 *
 * This script deliberately does not decide regulatory correctness. It checks
 * durable repository invariants that must be true before the 7.1–7.10
 * question-bank program can be described as ready:
 *
 * 1. required per-function governance artifacts exist;
 * 2. every function has a machine-checkable source/competency matrix (either a
 *    dedicated canonical file or an explicitly delimited embedded section),
 *    every matrix row identifies its official task and source/evidence state,
 *    and every production-bank question maps to at least one matrix row;
 * 3. every drafted production-bank question ID has exactly one EN review
 *    package entry, with no extra EN-only IDs;
 * 4. a currently FROZEN item fails readiness when its durable provenance says
 *    only a representative sample was checked or its own citation was not
 *    independently re-read; historical notes on truthfully downgraded items
 *    remain auditable without blocking readiness merely by existing;
 * 5. overlapping FR-bank / EN-package items must mirror the effective FR
 *    governance state. An EN package may conservatively mirror UNRESOLVED
 *    instead of a historically FROZEN/GAP bank label only when the same bank
 *    item itself admits non-item-specific evidence; that bank item still fails
 *    the separate provenance gate. Partial states likewise mirror UNRESOLVED;
 *    absence of such evidence never permits a silent status downgrade;
 * 6. an APPROVED item must carry a non-pending named reviewer and an ISO
 *    review date in the same item block, and table-based status registers may
 *    not bypass that requirement.
 *
 * It does NOT:
 * - validate licensed IATA DGR text;
 * - infer ANAC/IATA approval;
 * - mark any question APPROVED;
 * - equate FR source verification with EN bilingual review completion.
 *
 * Run from repository root:
 *   node scripts/check-dgr-readiness-artifacts.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { validateTierAEvidenceForFrState } from "./lib/dgr-matrix-tier-a-policy.mjs";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

let failed = false;
const rows = [];

function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function absolutePath(relativePath) {
  return path.join(root, relativePath);
}

function readRequired(relativePath) {
  const absolute = absolutePath(relativePath);
  if (!fs.existsSync(absolute)) {
    fail(`missing required artifact: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headingIds(text, fn) {
  const escaped = escapeRegExp(fn);
  const re = new RegExp(`^#{2,4}\\s+(Q-${escaped}-\\d{3})\\b`, "gmi");
  const ids = [];
  for (const match of text.matchAll(re)) ids.push(match[1]);
  return ids;
}

function allIds(text, fn) {
  const escaped = escapeRegExp(fn);
  const re = new RegExp(`\\bQ-${escaped}-\\d{3}\\b`, "gi");
  return [...text.matchAll(re)].map((m) => m[0]);
}

function anyQuestionIds(text) {
  return [...text.matchAll(/\bQ-7\.(?:10|[1-9])-\d{3}\b/gi)].map((m) => m[0]);
}

function duplicates(ids) {
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort();
}

function uniqueSorted(ids) {
  return [...new Set(ids)].sort();
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((id) => !rightSet.has(id));
}

function itemBlocks(text, fn) {
  const escaped = escapeRegExp(fn);
  const re = new RegExp(`^#{2,4}\\s+(Q-${escaped}-\\d{3})\\b.*$`, "gmi");
  const matches = [...text.matchAll(re)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    return { id: match[1], text: text.slice(start, end) };
  });
}

function assertApprovedHasReviewerAndDate(text, fn, artifactLabel) {
  for (const block of itemBlocks(text, fn)) {
    if (!/^\s*\*\*Approval:\*\*\s*APPROVED\b/im.test(block.text)) continue;

    const reviewerMatch = block.text.match(/^\s*\*\*(?:Qualified reviewer|Reviewer|Reviewed by):\*\*\s*(.+)$/im);
    const reviewDateMatch = block.text.match(/^\s*\*\*(?:Review date|Reviewed on):\*\*\s*(\d{4}-\d{2}-\d{2})\b/im);
    const reviewer = reviewerMatch?.[1]?.trim() ?? "";
    const reviewerLooksPending = !reviewer || /pending|tbd|todo|reviewer\s*\+\s*date/i.test(reviewer);

    if (reviewerLooksPending || !reviewDateMatch) {
      fail(`${artifactLabel}: ${block.id} is APPROVED without a non-pending named reviewer and ISO review date`);
    }
  }
}

function markdownTableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return [];
  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
}

function assertTableApprovalsHaveReviewerAndDate(text, artifactLabel) {
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;

    const idIndex = headers.findIndex((header) => /^ID$/i.test(header));
    const approvalIndex = headers.findIndex((header) => /^Approval$/i.test(header));
    if (idIndex < 0 || approvalIndex < 0) continue;

    const reviewerIndex = headers.findIndex((header) => /^(?:Qualified reviewer|Reviewer|Reviewed by)$/i.test(header));
    const reviewDateIndex = headers.findIndex((header) => /^(?:Review date|Reviewed on)$/i.test(header));

    // Skip the Markdown separator row, then inspect the contiguous table body.
    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;

      const id = cells[idIndex] ?? "";
      const approval = cells[approvalIndex] ?? "";
      if (!/^Q-7\.(?:10|[1-9])-\d{3}\b/i.test(id) || !/^APPROVED\b/i.test(approval)) continue;

      const reviewer = reviewerIndex >= 0 ? (cells[reviewerIndex] ?? "").trim() : "";
      const reviewDate = reviewDateIndex >= 0 ? (cells[reviewDateIndex] ?? "").trim() : "";
      const reviewerLooksPending = !reviewer || /pending|tbd|todo|reviewer\s*\+\s*date/i.test(reviewer);
      const hasIsoDate = /^\d{4}-\d{2}-\d{2}\b/.test(reviewDate);

      if (reviewerLooksPending || !hasIsoDate) {
        fail(`${artifactLabel}: ${id} table row is APPROVED without explicit named reviewer + ISO review date columns`);
      }
    }
  }
}

function hasRepresentativeEvidenceCaveat(text) {
  return (
    /(?:item['’]s\s+)?own specific citation was not independently re-read/i.test(text) ||
    /(?:item['’]s\s+)?own specific citation was not independently read/i.test(text) ||
    /specific current-dgr citation was not independently (?:re-)?read/i.test(text) ||
    /not independently (?:re-)?searched/i.test(text) ||
    /not re-searched from scratch/i.test(text) ||
    /representative sample(?: of this citation pattern)?/i.test(text)
  );
}

function latestFrStatus(blockText) {
  const matches = [...blockText.matchAll(/^\s*\*\*FR status:\*\*\s*(.+)$/gmi)];
  return matches.length ? matches.at(-1)[1].trim() : "";
}

function frStatusClass(value) {
  const normalized = value
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  if (!normalized) return "";
  // The current EN packages use an explicit conservative provenance hold.
  // Classify that before matching historical FR source-gap/frozen wording.
  if (/\b(?:TIER[ _]A[ _]PROVENANCE[ _]UNRESOLVED|SOURCE[ _]GAP[ _]UNRESOLVED|DIRECT[ _]ITEM[ _]EVIDENCE[ _]REQUIRED)\b/.test(normalized)) return "UNRESOLVED";
  if (/FROZEN FR\s*\/\s*SOURCE VERIFIED/.test(normalized)) return "FROZEN FR / SOURCE VERIFIED";
  if (/SOURCE CONFLICT/.test(normalized)) return "SOURCE CONFLICT";
  if (/SOURCE GAP/.test(normalized)) return "SOURCE GAP";
  if (/PARTIALLY CONFIRMED|PARTIAL(?:LY)? CONFIRMED/.test(normalized)) return "PARTIALLY CONFIRMED";
  if (/STALE CITATION/.test(normalized)) return "STALE CITATION";
  if (/NOT ATTEMPTED|UNATTEMPTED/.test(normalized)) return "NOT ATTEMPTED";
  if (/\bDRAFT\b|SOURCE REQUIRED/.test(normalized)) return "DRAFT";
  return "";
}

function frStatusById(text, fn) {
  const result = new Map();
  for (const block of itemBlocks(text, fn)) {
    result.set(block.id, frStatusClass(latestFrStatus(block.text)));
  }
  return result;
}

function frStatusDriftItems(bankText, enText, fn) {
  const bankStatuses = frStatusById(bankText, fn);
  const enStatuses = frStatusById(enText, fn);
  const bankBlocks = new Map(itemBlocks(bankText, fn).map((block) => [block.id, block.text]));
  const drift = [];

  for (const [id, bankStatus] of bankStatuses) {
    if (!enStatuses.has(id)) continue;
    const enStatus = enStatuses.get(id) ?? "";

    if (!bankStatus) {
      drift.push(`${id} (bank FR status unclassified/missing)`);
      continue;
    }
    if (!enStatus) {
      drift.push(`${id} (EN package FR status unclassified/missing; bank=${bankStatus})`);
      continue;
    }
    if (bankStatus === enStatus) continue;

    // A conservative EN provenance hold is correct for an explicitly partial
    // FR bank item. It is also correct for a historically terminal bank item
    // whose own record admits sampling/non-independent citation checking.
    // IMPORTANT: frozenRepresentativeEvidenceItems still FAILS those FROZEN
    // records; this exception only prevents a second, misleading drift error.
    const admittedUnresolved =
      enStatus === "UNRESOLVED" &&
      (bankStatus === "PARTIALLY CONFIRMED" ||
        ((bankStatus === "FROZEN FR / SOURCE VERIFIED" || bankStatus === "SOURCE GAP") &&
          hasRepresentativeEvidenceCaveat(bankBlocks.get(id) ?? "")));
    if (admittedUnresolved) continue;

    drift.push(`${id} (bank=${bankStatus}; EN=${enStatus})`);
  }

  return drift;
}


// The first 12 Function 7.1 pilot items have no production-bank headings.
// Their authoritative FR status is recorded in the Stage 2B status table,
// while the EN package has per-item headings. Check that source-of-record
// explicitly rather than allowing Q001–Q012 to escape the mirror gate.
function pilot71StatusRecord(statusTable) {
  const lines = statusTable.split(/\r?\n/);
  const found = new Map();
  const errors = [];
  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]).map(normalizedHeader);
    const idIndex = headers.indexOf("id");
    const statusIndex = headers.indexOf("fr status");
    if (idIndex < 0 || statusIndex < 0) continue;
    if (!markdownTableCells(lines[i + 1] ?? "").length) {
      errors.push("pilot source table lacks a Markdown separator");
      continue;
    }
    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownTableCells(lines[j]);
      if (!cells.length) break;
      const id = (cells[idIndex] ?? "").trim();
      if (!/^Q-7\.1-(?:00[1-9]|01[0-2])$/.test(id)) continue;
      const status = (cells[statusIndex] ?? "").trim();
      if (found.has(id)) errors.push(id + " has duplicate FR pilot status rows");
      if (!status || !frStatusClass(status)) errors.push(id + " has missing/unclassified FR pilot status");
      found.set(id, status);
    }
  }
  for (let n = 1; n <= 12; n += 1) {
    const id = "Q-7.1-" + String(n).padStart(3, "0");
    if (!found.has(id)) errors.push(id + " missing from authoritative pilot status table");
  }
  const blocks = [...found.entries()]
    .map(([id, status]) => "### " + id + " — pilot\n**FR status:** " + status + "\n")
    .join("\n");
  return { blocks, errors };
}

function frozenRepresentativeEvidenceItems(text, fn) {
  return itemBlocks(text, fn)
    .filter((block) => /^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/i.test(latestFrStatus(block.text)))
    .filter((block) => hasRepresentativeEvidenceCaveat(block.text))
    .map((block) => block.id);
}

function normalizedHeader(value) {
  return value
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const matrixHeaders = [
  ["Function", /^function$/],
  ["Official task ID", /^official task id$/],
  ["Competency/task description", /^competency\/task description$/],
  ["CBTA task-source reference", /^cbta task-source reference$/],
  ["Local source evidence", /^local source evidence$/],
  ["Current IATA DGR Tier A evidence", /^current iata dgr tier a evidence$/],
  ["FR source-verification state", /^fr source-verification state$/],
  ["FR verifier + date", /^fr verifier \+ date$/],
  ["Production question IDs", /^production question ids$/],
  ["EN bilingual-review state", /^en bilingual-review state$/],
  ["EN reviewer + date", /^en reviewer \+ date$/],
  ["Notes / limitations", /^notes \/ limitations$/],
];

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

function readSourceCompetencyMatrix(fn) {
  const dedicated = `docs/DGR_SOURCE_COMPETENCY_MATRIX_${fn}.md`;
  if (fs.existsSync(absolutePath(dedicated))) {
    return { label: dedicated, text: fs.readFileSync(absolutePath(dedicated), "utf8") };
  }

  const startMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:START -->`;
  const endMarker = `<!-- DGR_SOURCE_COMPETENCY_MATRIX:${fn}:END -->`;

  for (const candidate of embeddedMatrixCandidates(fn)) {
    const absolute = absolutePath(candidate);
    if (!fs.existsSync(absolute)) continue;
    const text = fs.readFileSync(absolute, "utf8");
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

  fail(
    `${fn}: missing source/competency matrix; expected ${dedicated} or a machine-checkable section delimited by ${startMarker} / ${endMarker}`,
  );
  return { label: `Function ${fn} source/competency matrix`, text: "" };
}

function splitReviewerAndDate(value) {
  const text = value.trim();
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  const reviewer = text
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
    .replace(/[|;,/()\-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { reviewer, date };
}

function reviewerAndDateLooksComplete(value) {
  const { reviewer, date } = splitReviewerAndDate(value);
  return Boolean(
    reviewer &&
    date &&
    !/pending|tbd|todo|not yet|non renseign|à renseigner|a renseigner/i.test(reviewer),
  );
}

function normalizedGovernanceState(value) {
  return value
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function isPositiveFrVerificationState(value) {
  const normalized = normalizedGovernanceState(value);
  return Boolean(
    /^FROZEN FR\s*\/\s*SOURCE VERIFIED\b/.test(normalized) ||
    /^FR SOURCE VERIFIED\b/.test(normalized) ||
    /^SOURCE VERIFIED\b/.test(normalized) ||
    /^VERIFIED\b/.test(normalized)
  );
}

function isPositiveEnReviewState(value) {
  const normalized = normalizedGovernanceState(value);
  return Boolean(
    /^(?:EN\s+)?REVIEWED\b/.test(normalized) ||
    /^(?:COMPLETE|COMPLETED|APPROVED)\b/.test(normalized) ||
    /^BILINGUAL(?: TECHNICAL)? REVIEW (?:COMPLETE|COMPLETED)\b/.test(normalized)
  );
}

function runFrStatusMirrorRegressionFixtures() {
  const block = (id, status, note = "") =>
    `### ${id} — fixture\n**FR status:** ${status}\n${note}\n`;
  const strictFrozen = block("Q-7.2-001", "FROZEN FR / SOURCE VERIFIED");
  const sampledFrozen = block("Q-7.2-002", "FROZEN FR / SOURCE VERIFIED",
    "This item's own specific citation was not independently re-read.");
  const sampledGap = block("Q-7.2-003", "FR SOURCE GAP CONFIRMED",
    "The item was not re-searched from scratch.");
  const partial = block("Q-7.2-004", "PARTIALLY CONFIRMED — citation pending");
  const conservative = (id) => block(id,
    "TIER_A_PROVENANCE_UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED");

  const assertNoDrift = (name, bank, en) => {
    const drift = frStatusDriftItems(bank, en, "7.2");
    if (drift.length) throw new Error(`${name}: unexpected FR mirror drift: ${drift.join("; ")}`);
  };
  const assertDrift = (name, bank, en) => {
    if (!frStatusDriftItems(bank, en, "7.2").length) {
      throw new Error(`${name}: unsafe FR mirror drift not rejected`);
    }
  };
  assertNoDrift("verified-frozen-mirror", strictFrozen, strictFrozen);
  assertNoDrift("sampled-frozen-has-unresolved-en-mirror", sampledFrozen, conservative("Q-7.2-002"));
  assertNoDrift("unsearched-gap-has-unresolved-en-mirror", sampledGap, conservative("Q-7.2-003"));
  assertNoDrift("partially-confirmed-has-unresolved-en-mirror", partial, conservative("Q-7.2-004"));
  assertDrift("frozen-without-caveat-cannot-downgrade", strictFrozen, conservative("Q-7.2-001"));
  assertDrift("draft-cannot-claim-frozen", block("Q-7.2-005", "DRAFT — Tier B only"),
    block("Q-7.2-005", "FROZEN FR / SOURCE VERIFIED"));
  assertDrift("frozen-with-caveat-cannot-be-draft", sampledFrozen,
    block("Q-7.2-002", "DRAFT — Tier B only"));
  if (frozenRepresentativeEvidenceItems(sampledFrozen, "7.2").join() !== "Q-7.2-002") {
    throw new Error("sampled FROZEN item must retain its independent provenance blocker");
  }
  // The pilot 7.1 source-of-record is a TABLE, not a production-bank item.
  // A changed EN mirror or a missing pilot row must not disappear behind
  // otherwise complete 19/19 ID coverage.
  const pilotIds = Array.from({ length: 12 }, (_unused, n) =>
    "Q-7.1-" + String(n + 1).padStart(3, "0"));
  const pilotTable = [
    "| ID | FR status |",
    "| --- | --- |",
    ...pilotIds.map((id, n) => "| " + id + " | " +
      (n === 0 ? "FR SOURCE GAP CONFIRMED" : "FROZEN FR / SOURCE VERIFIED") + " |"),
  ].join("\n");
  const pilotRecord = pilot71StatusRecord(pilotTable);
  if (pilotRecord.errors.length) throw new Error("valid pilot table rejected: " + pilotRecord.errors.join("; "));
  const pilotEn = pilotIds.map((id, n) => "### " + id + " — EN fixture\n**FR status:** " +
    (n === 0 ? "FR SOURCE GAP CONFIRMED" : "FROZEN FR / SOURCE VERIFIED") + "\n").join("\n");
  if (frStatusDriftItems(pilotRecord.blocks, pilotEn, "7.1").length) {
    throw new Error("matching Function 7.1 pilot source/EN statuses rejected");
  }
  const changedEn = pilotEn.replace(
    "### Q-7.1-002 — EN fixture\n**FR status:** FROZEN FR / SOURCE VERIFIED",
    "### Q-7.1-002 — EN fixture\n**FR status:** DRAFT",
  );
  if (!frStatusDriftItems(pilotRecord.blocks, changedEn, "7.1").length) {
    throw new Error("Function 7.1 pilot EN status drift was not detected");
  }
  const missingPilot = pilot71StatusRecord(
    pilotTable.replace("| Q-7.1-003 | FROZEN FR / SOURCE VERIFIED |\n", ""));
  if (!missingPilot.errors.some((error) => error.includes("Q-7.1-003 missing"))) {
    throw new Error("missing Function 7.1 pilot source row was not detected");
  }

  console.log("DGR effective FR-status mirror regression fixtures: PASS");
}

function runReviewStateRegressionFixtures() {
  const frNegative = [
    "DRAFT",
    "DRAFT / NOT YET VERIFIED",
    "NOT YET VERIFIED",
    "SOURCE REQUIRED",
    "SOURCE GAP",
    "SOURCE CONFLICT",
    "STALE CITATION",
    "PARTIALLY CONFIRMED",
  ];
  const enNegative = [
    "NOT YET REVIEWED",
    "BILINGUAL TECHNICAL REVIEW REQUIRED",
    "PENDING",
    "DRAFT",
  ];
  const frPositive = [
    "FROZEN FR / SOURCE VERIFIED",
    "FR SOURCE VERIFIED",
    "SOURCE VERIFIED",
    "VERIFIED",
  ];
  const enPositive = [
    "REVIEWED",
    "EN REVIEWED",
    "COMPLETED",
    "COMPLETE",
    "APPROVED",
    "BILINGUAL TECHNICAL REVIEW COMPLETED",
  ];

  for (const state of frNegative) {
    if (isPositiveFrVerificationState(state)) {
      throw new Error(`FR negative state misclassified as positive: ${state}`);
    }
  }
  for (const state of enNegative) {
    if (isPositiveEnReviewState(state)) {
      throw new Error(`EN negative state misclassified as positive: ${state}`);
    }
  }
  for (const state of frPositive) {
    if (!isPositiveFrVerificationState(state)) {
      throw new Error(`FR positive state misclassified as negative: ${state}`);
    }
  }
  for (const state of enPositive) {
    if (!isPositiveEnReviewState(state)) {
      throw new Error(`EN positive state misclassified as negative: ${state}`);
    }
  }

  runFrStatusMirrorRegressionFixtures();
  console.log("DGR review-state semantic regression fixtures: PASS");
}

function isExplicitNonVerifiedEvidence(value) {
  return /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED/i.test(value);
}

function looksLikeCurrentTierAEvidence(value) {
  const hasEdition = /\b67(?:th|e|ème|eme)\b|67th edition|67e édition/i.test(value);
  const hasYear = /\b2026\b/.test(value);
  return hasEdition && hasYear;
}

function parseSourceCompetencyMatrix(text, fn, artifactLabel) {
  if (!text) return { tasks: [], questionIds: [] };

  const lines = text.split(/\r?\n/);
  let foundTable = false;
  const tasks = [];
  const questionIds = [];

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownTableCells(lines[i]);
    if (!headers.length) continue;

    const normalized = headers.map(normalizedHeader);
    const indexes = new Map();
    let matchesMatrix = true;

    for (const [label, matcher] of matrixHeaders) {
      const index = normalized.findIndex((header) => matcher.test(header));
      if (index < 0) {
        matchesMatrix = false;
        break;
      }
      indexes.set(label, index);
    }
    if (!matchesMatrix) continue;

    if (foundTable) {
      fail(`${artifactLabel}: more than one canonical source/competency matrix table found; keep exactly one canonical table`);
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

      const get = (label) => (cells[indexes.get(label)] ?? "").trim();
      const functionCell = get("Function");
      const taskId = get("Official task ID");
      const description = get("Competency/task description");
      const taskSource = get("CBTA task-source reference");
      const localEvidence = get("Local source evidence");
      const tierAEvidence = get("Current IATA DGR Tier A evidence");
      const frState = get("FR source-verification state");
      const frVerifier = get("FR verifier + date");
      const productionIdsCell = get("Production question IDs");
      const enState = get("EN bilingual-review state");
      const enReviewer = get("EN reviewer + date");
      const notes = get("Notes / limitations");

      if (!taskId || /^[-–—]+$/.test(taskId)) {
        fail(`${artifactLabel}: matrix row ${j + 1} has no Official task ID`);
        continue;
      }

      tasks.push(taskId);

      if (functionCell !== fn) {
        fail(`${artifactLabel}: task ${taskId} declares Function "${functionCell}" instead of ${fn}`);
      }
      if (!description) fail(`${artifactLabel}: task ${taskId} is missing Competency/task description`);
      if (!taskSource) fail(`${artifactLabel}: task ${taskId} is missing CBTA task-source reference`);
      if (!localEvidence) fail(`${artifactLabel}: task ${taskId} is missing Local source evidence`);
      if (!tierAEvidence) {
        fail(`${artifactLabel}: task ${taskId} is missing current Tier A evidence or an explicit non-verified source state`);
      } else if (!isExplicitNonVerifiedEvidence(tierAEvidence) && !looksLikeCurrentTierAEvidence(tierAEvidence)) {
        fail(
          `${artifactLabel}: task ${taskId} Tier A evidence is neither explicitly non-verified nor identified as DGR 67th Edition 2026`,
        );
      }
      if (!frState) fail(`${artifactLabel}: task ${taskId} is missing FR source-verification state`);
      if (!enState) fail(`${artifactLabel}: task ${taskId} is missing EN bilingual-review state`);
      if (!notes) warn(`${artifactLabel}: task ${taskId} has an empty Notes / limitations cell`);

      for (const error of validateTierAEvidenceForFrState({ tierAEvidence, frState, frVerifier })) {
        fail(`${artifactLabel}: task ${taskId}: ${error}`);
      }

      if (isPositiveFrVerificationState(frState) && !reviewerAndDateLooksComplete(frVerifier)) {
        fail(`${artifactLabel}: task ${taskId} claims FR verification without a named verifier + ISO date`);
      }
      if (isPositiveEnReviewState(enState) && !reviewerAndDateLooksComplete(enReviewer)) {
        fail(`${artifactLabel}: task ${taskId} claims completed EN review without a named reviewer + ISO date`);
      }

      const rowText = cells.join(" | ");
      if (/\bAPPROVED\b/i.test(rowText)) {
        const qualifiedIndex = normalized.findIndex((header) =>
          /^(?:qualified reviewer \+ date|qualified reviewer|reviewer qualification \+ date)$/.test(header),
        );
        const qualifiedValue = qualifiedIndex >= 0 ? (cells[qualifiedIndex] ?? "").trim() : "";
        if (!reviewerAndDateLooksComplete(qualifiedValue)) {
          fail(
            `${artifactLabel}: task ${taskId} contains APPROVED without an explicit named qualified reviewer + ISO date`,
          );
        }
      }

      const ids = anyQuestionIds(productionIdsCell);
      const foreignIds = ids.filter((id) => !id.toUpperCase().startsWith(`Q-${fn}-`.toUpperCase()));
      if (foreignIds.length) {
        fail(`${artifactLabel}: task ${taskId} maps foreign-function question ID(s): ${foreignIds.join(", ")}`);
      }
      questionIds.push(...ids);
    }
  }

  if (!foundTable) {
    fail(
      `${artifactLabel}: no canonical matrix table found with all required headers from DGR_SOURCE_COMPETENCY_MATRIX_REQUIREMENTS.md`,
    );
    return { tasks: [], questionIds: [] };
  }

  const taskDupes = duplicates(tasks);
  if (taskDupes.length) {
    fail(`${artifactLabel}: duplicate canonical Official task ID row(s): ${taskDupes.join(", ")}`);
  }

  if (!tasks.length) {
    fail(`${artifactLabel}: canonical matrix table has no task rows`);
  }

  return { tasks: uniqueSorted(tasks), questionIds: uniqueSorted(questionIds) };
}

if (process.argv.includes("--test-review-state-policy")) {
  runReviewStateRegressionFixtures();
  process.exit(0);
}

// Presence checks. Function 7.1 has a recovered Stage 2A/pilot history rather
// than the later per-function Stage 1 naming convention; 7.2–7.10 use their
// own Stage 1 draft/cross-validation + Stage 2A blueprint artifacts.
for (const relativePath of [
  "docs/DGR_STAGE_2B_STATUS.md",
  "docs/DGR_SOURCE_REGISTER.md",
  "docs/RECOVERED_STAGE2A_CONTEXT.md",
  "docs/DGR_SOURCE_COMPETENCY_MATRIX_REQUIREMENTS.md",
]) {
  readRequired(relativePath);
}

for (const fn of functions.slice(1)) {
  for (const relativePath of [
    `docs/DGR_STAGE1_FUNCTION_${fn}_DRAFT.md`,
    `docs/DGR_STAGE1_FUNCTION_${fn}_CROSSVALIDATION.md`,
    `docs/DGR_STAGE2A_FUNCTION_${fn}_BLUEPRINT.md`,
  ]) {
    readRequired(relativePath);
  }
}

const stage71 = readRequired("docs/DGR_STAGE_2B_STATUS.md");
assertTableApprovalsHaveReviewerAndDate(stage71, "docs/DGR_STAGE_2B_STATUS.md");

let totalBank = 0;
let totalEn = 0;
let totalMissing = 0;
let totalExtra = 0;
let totalProvenanceBlockers = 0;
let totalFrStatusDrift = 0;
let totalMatrixTasks = 0;
let totalMatrixMissingLinks = 0;
let totalMatrixExtraIds = 0;

for (const fn of functions) {
  const bankPath = `docs/DGR_PRODUCTION_BANK_${fn}.md`;
  const enPath = `docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`;
  const bank = readRequired(bankPath);
  const en = readRequired(enPath);

  const bankHeadingList = headingIds(bank, fn);
  const enHeadingList = headingIds(en, fn);

  // Function 7.1's production-bank file is an expansion file (Q013–Q019).
  // The frozen pilot Q001–Q012 is durably enumerated in DGR_STAGE_2B_STATUS.
  const canonicalBankIds = uniqueSorted(
    fn === "7.1" ? [...bankHeadingList, ...allIds(stage71, fn)] : bankHeadingList,
  );
  const enIds = uniqueSorted(enHeadingList);

  const matrixArtifact = readSourceCompetencyMatrix(fn);
  const matrix = parseSourceCompetencyMatrix(matrixArtifact.text, fn, matrixArtifact.label);
  const matrixMissingLinks = matrixArtifact.text ? difference(canonicalBankIds, matrix.questionIds) : [];
  const matrixExtraIds = matrixArtifact.text ? difference(matrix.questionIds, canonicalBankIds) : [];

  const bankDupes = duplicates(bankHeadingList);
  const enDupes = duplicates(enHeadingList);
  const missing = difference(canonicalBankIds, enIds);
  const extra = difference(enIds, canonicalBankIds);
  const provenanceBlockers = frozenRepresentativeEvidenceItems(bank, fn);
  const pilotRecord = fn === "7.1" ? pilot71StatusRecord(stage71) : null;
  for (const issue of pilotRecord?.errors ?? []) fail("7.1 pilot status: " + issue);
  const frStatusDrift = [
    ...frStatusDriftItems(bank, en, fn),
    ...(pilotRecord ? frStatusDriftItems(pilotRecord.blocks, en, fn) : []),
  ];

  if (bankDupes.length) fail(`${bankPath}: duplicate question headings: ${bankDupes.join(", ")}`);
  if (enDupes.length) fail(`${enPath}: duplicate EN question headings: ${enDupes.join(", ")}`);
  if (missing.length) fail(`${fn}: EN package missing ${missing.length} bank ID(s): ${missing.join(", ")}`);
  if (extra.length) fail(`${fn}: EN package has ${extra.length} extra ID(s) not in canonical bank: ${extra.join(", ")}`);

  if (matrixMissingLinks.length) {
    fail(`${fn}: source/competency matrix does not map ${matrixMissingLinks.length} canonical bank ID(s): ${matrixMissingLinks.join(", ")}`);
  }
  if (matrixExtraIds.length) {
    fail(`${fn}: source/competency matrix maps ${matrixExtraIds.length} non-bank/extra ID(s): ${matrixExtraIds.join(", ")}`);
  }

  if (provenanceBlockers.length > 0) {
    // This is intentionally a readiness failure, not an automatic downgrade.
    // A FROZEN state must be backed by direct item-specific current Tier-A
    // evidence. If the item is truthfully downgraded to GAP/PARTIAL/DRAFT/
    // CONFLICT, its historical representative-sample note may remain for audit
    // history without creating a false permanent blocker.
    fail(`${fn}: ${provenanceBlockers.length} FROZEN item(s) still rely on representative/non-item-specific evidence: ${provenanceBlockers.join(", ")}`);
  }

  if (frStatusDrift.length > 0) {
    fail(`${fn}: ${frStatusDrift.length} overlapping bank/EN item(s) have stale or missing mirrored FR status: ${frStatusDrift.join("; ")}`);
  }

  assertApprovedHasReviewerAndDate(bank, fn, bankPath);
  assertApprovedHasReviewerAndDate(en, fn, enPath);
  assertTableApprovalsHaveReviewerAndDate(bank, bankPath);
  assertTableApprovalsHaveReviewerAndDate(en, enPath);

  rows.push({
    fn,
    bank: canonicalBankIds.length,
    en: enIds.length,
    missing: missing.length,
    extra: extra.length,
    matrixTasks: matrix.tasks.length,
    matrixMissingLinks: matrixMissingLinks.length,
    matrixExtraIds: matrixExtraIds.length,
    provenanceBlockers: provenanceBlockers.length,
    frStatusDrift: frStatusDrift.length,
  });
  totalBank += canonicalBankIds.length;
  totalEn += enIds.length;
  totalMissing += missing.length;
  totalExtra += extra.length;
  totalMatrixTasks += matrix.tasks.length;
  totalMatrixMissingLinks += matrixMissingLinks.length;
  totalMatrixExtraIds += matrixExtraIds.length;
  totalProvenanceBlockers += provenanceBlockers.length;
  totalFrStatusDrift += frStatusDrift.length;
}

console.log("\nDGR/CBTA readiness artifact summary");
console.log("Function | Bank | EN | Missing EN | Extra EN | Matrix tasks | Missing matrix links | Extra matrix IDs | Frozen provenance | FR↔EN drift");
console.log("---------|------|----|------------|----------|--------------|----------------------|------------------|-------------------|------------");
for (const row of rows) {
  console.log(
    `${row.fn.padEnd(8)} | ${String(row.bank).padStart(4)} | ${String(row.en).padStart(2)} | ${String(row.missing).padStart(10)} | ${String(row.extra).padStart(8)} | ${String(row.matrixTasks).padStart(12)} | ${String(row.matrixMissingLinks).padStart(20)} | ${String(row.matrixExtraIds).padStart(16)} | ${String(row.provenanceBlockers).padStart(17)} | ${String(row.frStatusDrift).padStart(10)}`,
  );
}
console.log("---------|------|----|------------|----------|--------------|----------------------|------------------|-------------------|------------");
console.log(
  `TOTAL    | ${String(totalBank).padStart(4)} | ${String(totalEn).padStart(2)} | ${String(totalMissing).padStart(10)} | ${String(totalExtra).padStart(8)} | ${String(totalMatrixTasks).padStart(12)} | ${String(totalMatrixMissingLinks).padStart(20)} | ${String(totalMatrixExtraIds).padStart(16)} | ${String(totalProvenanceBlockers).padStart(17)} | ${String(totalFrStatusDrift).padStart(10)}`,
);

if (failed) {
  console.error("\nREADINESS ARTIFACT CHECK: FAIL");
  console.error("A failing result is expected while documented regulatory/bilingual blockers remain open. Do not treat this as an approval or regulatory-correctness engine.");
  process.exit(1);
}

warn("Artifact consistency passed, but this does not prove regulatory correctness, qualified human review, build/test/security readiness, or ANAC/IATA approval.");
console.log("READINESS ARTIFACT CHECK: PASS (artifact consistency only)");
