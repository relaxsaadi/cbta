#!/usr/bin/env node

/**
 * Fail-closed structural guard for question-item headings across the current
 * Function 7.1–7.10 production banks and EN review packages.
 *
 * The full readiness checker intentionally derives per-function populations
 * from structural Markdown headings. A canonical question heading that names
 * another function, is malformed, duplicated, is moved outside the canonical
 * H2–H4 question-heading range, is indented away from the readiness parser's
 * column-1 contract, is expressed with Setext heading syntax, or is hidden
 * behind Markdown decoration must therefore be rejected rather than silently
 * falling outside the readiness population.
 *
 * This guard is structural only. It does not validate IATA DGR content,
 * source correctness, translation quality, human review, or ANAC/IATA
 * approval. Narrative cross-references to another function remain allowed;
 * only structural question-item headings are function-bound.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const functions = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"];

function leadingQuestionToken(text) {
  let candidate = String(text ?? "").trim();

  // The canonical readiness population parser requires the question ID to be
  // the first plain-text token in the heading. Detect common Markdown wrappers
  // around a leading Q-7.* token as question-like too so decoration cannot make
  // an item silently disappear from readiness. The wrapper remains on the
  // extracted token's trailing edge, causing canonicalQuestionId() to reject it
  // as malformed instead of normalizing a non-canonical heading into acceptance.
  if (!/^Q-7\./i.test(candidate)) {
    candidate = candidate.replace(/^(?:(?:\*\*|__|~~|`|\[)\s*)+/, "");
    if (!/^Q-7\./i.test(candidate)) return "";
  }

  return candidate.match(/^(Q-7\.[^\s—–]+)/i)?.[1] ?? "";
}

function structuralQuestionHeading(line) {
  // CommonMark ATX headings may be indented by up to three spaces. The
  // canonical readiness population parser intentionally requires the heading
  // marker at column 1, so detect legal 1–3-space indentation here and reject
  // it explicitly instead of allowing a rendered question heading to vanish
  // from the machine-readiness population.
  const match = line.match(/^( {0,3})(#{1,6})\s+(.+)$/);
  if (!match) return null;

  const token = leadingQuestionToken(match[3]);
  if (!token) return null;

  return {
    syntax: "atx",
    indent: match[1].length,
    level: match[2].length,
    token,
  };
}

function structuralSetextQuestionHeading(line, underlineLine) {
  // CommonMark Setext headings render a paragraph followed by an = or -
  // underline as H1/H2. The readiness population parser deliberately accepts
  // only canonical ATX H2–H4 question headings. Detect a Q-7.* Setext heading
  // explicitly so it cannot render as a heading to a human while disappearing
  // from the machine-readiness population.
  const content = line.match(/^( {0,3})(.+?)\s*$/);
  const underline = String(underlineLine ?? "").match(/^ {0,3}(=+|-+)\s*$/);
  if (!content || !underline) return null;

  const token = leadingQuestionToken(content[2]);
  if (!token) return null;

  return {
    syntax: "setext",
    indent: content[1].length,
    level: underline[1].startsWith("=") ? 1 : 2,
    token,
  };
}

function canonicalQuestionId(token) {
  const match = token.match(/^Q-(7\.(?:10|[1-9]))-(\d{3})$/i);
  if (!match) return null;
  return {
    id: `Q-${match[1]}-${match[2]}`.toUpperCase(),
    fn: match[1],
  };
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

function recordStructuralQuestion({ structural, index, expectedFn, errors, ids }) {
  if (structural.syntax === "setext") {
    errors.push(
      `line ${index + 1}: structural question heading uses Setext Markdown heading syntax; canonical readiness questions must use column-1 ATX H2–H4 headings`,
    );
  }

  if (structural.indent > 0) {
    errors.push(
      `line ${index + 1}: structural question heading is indented by ${structural.indent} space(s); canonical readiness headings must start at column 1`,
    );
  }

  if (structural.level < 2 || structural.level > 4) {
    errors.push(
      `line ${index + 1}: structural question heading uses H${structural.level}; canonical readiness headings must use H2–H4`,
    );
  }

  const parsed = canonicalQuestionId(structural.token);
  if (!parsed) {
    errors.push(`line ${index + 1}: malformed structural question ID heading "${structural.token}"`);
    return;
  }

  ids.push(parsed.id);
  if (parsed.fn !== expectedFn) {
    errors.push(
      `line ${index + 1}: foreign-function structural question heading ${parsed.id} appears in Function ${expectedFn} artifact`,
    );
  }
}

function inspectArtifact(text, expectedFn, artifactLabel) {
  const errors = [];
  const ids = [];
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const setext = structuralSetextQuestionHeading(lines[index], lines[index + 1]);
    if (setext) {
      recordStructuralQuestion({ structural: setext, index, expectedFn, errors, ids });
      continue;
    }

    const structural = structuralQuestionHeading(lines[index]);
    if (!structural) continue;
    recordStructuralQuestion({ structural, index, expectedFn, errors, ids });
  }

  const duplicates = duplicateValues(ids);
  if (duplicates.length) {
    errors.push(`duplicate structural question heading(s): ${duplicates.join(", ")}`);
  }

  return { artifactLabel, errors, ids };
}

function assertFixture(name, condition, detail) {
  if (condition) return;
  console.error(`QUESTION-HEADING FUNCTION-BINDING REGRESSION: FAIL — ${name}: ${detail}`);
  process.exit(1);
}

function runRegressionFixtures() {
  const valid = inspectArtifact([
    "# Synthetic Function 7.2 bank",
    "Narrative cross-reference Q-7.1-001 is allowed.",
    "## Q-7.2-001 — First item",
    "### Q-7.2-002 — Second item",
  ].join("\n"), "7.2", "valid");
  assertFixture("valid artifact", valid.errors.length === 0, valid.errors.join("; "));

  const foreignHeading = inspectArtifact([
    "## Q-7.2-001 — Correct item",
    "## Q-7.3-001 — Wrong-function item",
  ].join("\n"), "7.2", "foreign");
  assertFixture(
    "foreign-function heading",
    foreignHeading.errors.some((error) => error.includes("foreign-function")),
    "foreign structural item did not fail closed",
  );

  const duplicateHeading = inspectArtifact([
    "## Q-7.4-001 — First copy",
    "### Q-7.4-001 — Duplicate copy",
  ].join("\n"), "7.4", "duplicate");
  assertFixture(
    "duplicate heading",
    duplicateHeading.errors.some((error) => error.includes("duplicate structural")),
    "duplicate structural ID did not fail closed",
  );

  const malformedHeading = inspectArtifact("## Q-7.5-01 — malformed", "7.5", "malformed");
  assertFixture(
    "malformed heading",
    malformedHeading.errors.some((error) => error.includes("malformed structural")),
    "malformed structural question ID did not fail closed",
  );

  const unsupportedHeadingLevel = inspectArtifact("##### Q-7.6-001 — hidden by readiness H2-H4 parser", "7.6", "heading-level");
  assertFixture(
    "unsupported question heading level",
    unsupportedHeadingLevel.errors.some((error) => error.includes("canonical readiness headings must use H2–H4")),
    "H5 question heading could disappear from readiness population without failing closed",
  );

  const decoratedHeading = inspectArtifact("## **Q-7.7-001** — hidden by readiness plain-ID parser", "7.7", "decorated-heading");
  assertFixture(
    "decorated structural question heading",
    decoratedHeading.errors.some((error) => error.includes("malformed structural")),
    "Markdown decoration around a leading question ID could make the item disappear from readiness without failing closed",
  );

  const linkedHeading = inspectArtifact("## [Q-7.8-001](https://example.invalid/item) — hidden by readiness plain-ID parser", "7.8", "linked-heading");
  assertFixture(
    "linked structural question heading",
    linkedHeading.errors.some((error) => error.includes("malformed structural")),
    "Markdown link decoration around a leading question ID could make the item disappear from readiness without failing closed",
  );

  const indentedHeading = inspectArtifact("  ## Q-7.9-001 — valid Markdown heading hidden by readiness column-1 parser", "7.9", "indented-heading");
  assertFixture(
    "indented structural question heading",
    indentedHeading.errors.some((error) => error.includes("must start at column 1")),
    "1–3-space-indented Markdown question heading could disappear from readiness without failing closed",
  );

  const setextHeading = inspectArtifact([
    "Q-7.10-001 — rendered Markdown H2 hidden by readiness ATX parser",
    "------------------------------------------------------------",
  ].join("\n"), "7.10", "setext-heading");
  assertFixture(
    "Setext structural question heading",
    setextHeading.errors.some((error) => error.includes("Setext Markdown heading syntax")),
    "Setext H2 question heading could disappear from readiness population without failing closed",
  );

  const decoratedSetextHeading = inspectArtifact([
    "**Q-7.8-002** — decorated rendered Markdown H2 hidden by readiness parser",
    "--------------------------------------------------------------------",
  ].join("\n"), "7.8", "decorated-setext-heading");
  assertFixture(
    "decorated Setext structural question heading",
    decoratedSetextHeading.errors.some((error) => error.includes("Setext Markdown heading syntax")),
    "decorated Setext question heading could disappear from readiness population without failing closed",
  );

  const narrativeForeign = inspectArtifact([
    "## Q-7.10-001 — Valid item",
    "This rationale compares the result with Q-7.9-007; that prose reference is allowed.",
  ].join("\n"), "7.10", "narrative");
  assertFixture("foreign narrative cross-reference", narrativeForeign.errors.length === 0, narrativeForeign.errors.join("; "));

  console.log("QUESTION-HEADING FUNCTION-BINDING REGRESSION: PASS");
}

if (process.argv.includes("--test")) {
  runRegressionFixtures();
  process.exit(0);
}

let failed = false;
let totalHeadings = 0;

for (const fn of functions) {
  for (const kind of ["DGR_PRODUCTION_BANK", "DGR_EN_REVIEW_PACKAGE"]) {
    const relativePath = `docs/${kind}_${fn}.md`;
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`ERROR: missing required artifact: ${relativePath}`);
      failed = true;
      continue;
    }

    const result = inspectArtifact(fs.readFileSync(absolutePath, "utf8"), fn, relativePath);
    totalHeadings += result.ids.length;
    for (const error of result.errors) {
      console.error(`ERROR: ${relativePath}: ${error}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("QUESTION-HEADING FUNCTION-BINDING CHECK: FAIL");
  console.error("This result is structural only; it does not decide regulatory correctness or approval.");
  process.exit(1);
}

console.log(`Question-heading function binding: ${totalHeadings} structural heading occurrence(s) checked across 20 artifacts.`);
console.log("QUESTION-HEADING FUNCTION-BINDING CHECK: PASS (structural provenance only)");
