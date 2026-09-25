#!/usr/bin/env node

/**
 * Fail-closed structural guard for durable item-form DGR governance metadata.
 *
 * Semantic DGR parsers read a single FR status / EN status / Approval value
 * from each structural Q-7.x-xxx block. A second metadata field with the same
 * label would therefore create ambiguous human-visible state even though a
 * downstream parser may consume only the first occurrence.
 *
 * This guard requires item-form FR status, EN status and Approval metadata to
 * occur at most once per structural question block. It accepts the plain and
 * Markdown-list forms already used by the repository. It does not decide
 * regulatory correctness, verify Tier-A evidence, approve questions, or imply
 * ANAC/IATA approval.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];
const questionHeadingRe = /^#{2,4}\s+(Q-7\.(?:10|[1-9])-\d{3})\b.*$/gmi;
const governanceFieldRe = /^\s*(?:[-+*]\s+)?\*\*(FR status|EN status|Approval):\*\*\s*.*$/gim;

function itemBlocks(text) {
  const matches = [...text.matchAll(questionHeadingRe)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length;
    return {
      id: match[1].toUpperCase(),
      text: text.slice(start, end),
    };
  });
}

function duplicateFields(block) {
  const counts = new Map();
  for (const match of block.matchAll(governanceFieldRe)) {
    const label = match[1].toLowerCase();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([label, count]) => ({ label, count }));
}

function validateText(text, artifact) {
  const errors = [];
  for (const item of itemBlocks(text)) {
    for (const duplicate of duplicateFields(item.text)) {
      errors.push(
        `${artifact}: ${item.id}: duplicate item governance field "${duplicate.label}" occurs ${duplicate.count} times`,
      );
    }
  }
  return errors;
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : null;
}

function repositoryCheck() {
  const artifacts = ["docs/DGR_STAGE_2B_STATUS.md"];
  for (const fn of functions) {
    artifacts.push(`docs/DGR_PRODUCTION_BANK_${fn}.md`);
    artifacts.push(`docs/DGR_EN_REVIEW_PACKAGE_${fn}.md`);
  }

  const errors = [];
  for (const artifact of artifacts) {
    const text = read(artifact);
    if (text !== null) errors.push(...validateText(text, artifact));
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(`\nDGR ITEM-METADATA STRUCTURE CHECK: FAIL (${errors.length} issue(s))`);
    process.exit(1);
  }

  console.log("DGR ITEM-METADATA STRUCTURE CHECK: PASS");
  console.log("PASS validates only item-form governance-field uniqueness; regulatory correctness and approval remain separate gates.");
}

function expect(name, text, shouldFail) {
  const errors = validateText(text, `${name}.md`);
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(`${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`);
  }
}

function fixtures() {
  expect(
    "valid-single-list-fields",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT — SOURCE REQUIRED\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n`,
    false,
  );

  expect(
    "duplicate-fr-list-form",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT — SOURCE REQUIRED\n- **FR status:** FROZEN FR / SOURCE VERIFIED\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n`,
    true,
  );

  expect(
    "duplicate-en-plain-form",
    `### Q-7.2-001 — synthetic\n**FR status:** DRAFT\n**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**EN status:** BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by Jane Doe, Bilingual DGR Reviewer FR/EN, 2026-09-08)\n**Approval:** PENDING REVIEWER + DATE\n`,
    true,
  );

  expect(
    "duplicate-approval-contradiction",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n- **Approval:** APPROVED — Jane Doe, 2026-09-08\n`,
    true,
  );

  expect(
    "mixed-list-plain-duplicate",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**Approval:** PENDING REVIEWER + DATE\n- **Approval:** APPROVED — Jane Doe, 2026-09-08\n`,
    true,
  );

  expect(
    "narrative-mentions-ignored",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\nNarrative note: Approval: remains pending and FR status should not be inferred from this sentence.\n`,
    false,
  );

  expect(
    "separate-question-blocks-independent",
    `### Q-7.2-001 — synthetic\n- **FR status:** DRAFT\n- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n- **Approval:** PENDING REVIEWER + DATE\n\n### Q-7.2-002 — synthetic\n**FR status:** DRAFT\n**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED\n**Approval:** PENDING REVIEWER + DATE\n`,
    false,
  );

  console.log("DGR item-metadata structure regression fixtures: PASS");
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
