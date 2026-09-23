#!/usr/bin/env node

/**
 * Compatibility entrypoint for the DGR readiness artifact guard.
 *
 * The durable question-bank and EN-review artifacts use Markdown list fields
 * such as `- **FR status:** ...` and `- **Approval:** ...`. The historical
 * readiness parser in `check-dgr-readiness-artifacts-core.mjs` expects those
 * metadata fields without a list marker. Normalize only the parser-visible
 * metadata prefix in memory, then execute the unchanged core checker.
 *
 * Before the full artifact pass, normal readiness execution also runs the
 * canonical matrix review-evidence checker. This keeps standalone use of this
 * entrypoint fail-closed on the same EN bilingual-review semantics as the
 * canonical workflow: generic APPROVED / COMPLETE / COMPLETED / REVIEWED /
 * EN REVIEWED values cannot stand in for an explicit completed bilingual
 * review. The dedicated core fixture mode is left isolated so its own
 * regression fixtures can still be exercised deterministically.
 *
 * This shim does not mutate repository files, regulatory content, source
 * evidence, reviewer evidence, or approval states. It exists only so the
 * fail-closed readiness checker measures the states that are actually written
 * in the artifacts instead of reporting list-form fields as missing.
 */

import fs from "node:fs";
import path from "node:path";

const originalReadFileSync = fs.readFileSync.bind(fs);

const itemArtifactName = /^DGR_(?:PRODUCTION_BANK|EN_REVIEW_PACKAGE)_7\.(?:10|[1-9])\.md$/i;
const parserVisibleBulletField =
  /^(\s*)[-+*]\s+(\*\*(?:FR status|Approval|Qualified reviewer|Reviewer|Reviewed by|Review date|Reviewed on):\*\*)/gmi;

export function normalizeReadinessItemFieldSyntax(text) {
  return text.replace(parserVisibleBulletField, "$1$2");
}

function runCompatibilityFixtures() {
  const cases = [
    ["- **FR status:** `FROZEN FR / SOURCE VERIFIED`", "**FR status:** `FROZEN FR / SOURCE VERIFIED`"],
    ["+ **Approval:** APPROVED", "**Approval:** APPROVED"],
    ["* **Reviewer:** Jane Doe", "**Reviewer:** Jane Doe"],
    ["  - **Review date:** 2026-09-07", "  **Review date:** 2026-09-07"],
    ["**FR status:** DRAFT", "**FR status:** DRAFT"],
    ["- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED", "- **EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED"],
  ];

  for (const [input, expected] of cases) {
    const actual = normalizeReadinessItemFieldSyntax(input);
    if (actual !== expected) {
      throw new Error(`readiness Markdown-field compatibility fixture failed: ${JSON.stringify(input)}`);
    }
  }

  console.log("DGR readiness Markdown-field compatibility fixtures: PASS");
}

runCompatibilityFixtures();

fs.readFileSync = function patchedReadFileSync(file, ...rest) {
  const value = originalReadFileSync(file, ...rest);
  if (typeof value !== "string") return value;

  const basename = path.basename(String(file));
  if (!itemArtifactName.test(basename)) return value;

  return normalizeReadinessItemFieldSyntax(value);
};

const reviewStateFixtureMode = process.argv.includes("--test-review-state-policy");
if (!reviewStateFixtureMode) {
  // Keep direct/manual invocation of the readiness artifact guard aligned with
  // the stricter canonical EN bilingual-review semantics. This checker exits
  // non-zero on generic completion labels or invalid reviewer evidence.
  await import("./check-dgr-matrix-review-evidence.mjs");
}

await import("./check-dgr-readiness-artifacts-core.mjs");
