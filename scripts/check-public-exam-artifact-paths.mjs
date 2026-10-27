#!/usr/bin/env node
/**
 * Public-repository tripwire for known DGR examination-content artifact paths and keyed Markdown sections.
 *
 * IMPORTANT: this is a narrow file-path merge check, not a secret scanner,
 * retroactive content withdrawal, push-time protection, or proof that all
 * assessment material is confidential. See GitHub issue #340.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

// A valid function number must not be followed by another digit. This also
// blocks filename-copy suffixes such as "-backup", "_copy", or " (copy)".
const restrictedArtifact = /(?:^|\/)DGR_(?:PRODUCTION_BANK|EN_REVIEW_PACKAGE)_7\.(?:10|[1-9])(?![0-9])/i;

function isRestricted(path) {
  return restrictedArtifact.test(path.replaceAll("\\", "/"));
}

// A renamed Markdown question bank can evade a filename-only detector.
// Detect only high-confidence keyed item sections; this is a tripwire, not a
// guarantee that every answer-key style or exported format is recognized.
// Never print source excerpts, correct answers, or rationales to CI logs.
const questionHeading = /^\s{0,3}#{1,6}\s+Q-7\.(?:10|[1-9])-\d{3}(?!\d)(?:\s|$)/gmi;
const candidateTextExtensions = /\.(?:md|markdown|txt)$/i;
const MAX_TEXT_BYTES = 16 * 1024 * 1024;

function containsKeyedDgrSection(text) {
  const headings = [...text.matchAll(questionHeading)];
  for (let i = 0; i < headings.length; i += 1) {
    const start = headings[i].index;
    const end = i + 1 < headings.length ? headings[i + 1].index : text.length;
    const section = text.slice(start, end);
    if (/\*\*Stem\s*\(FR\)\s*:/i.test(section)
      && /\*\*Options\s*:/i.test(section)
      && /\*\*Correct answer rationale\s*:/i.test(section)) {
      return true;
    }
  }
  return false;
}

function selfTest() {
  const cases = [
    ["docs/DGR_PRODUCTION_BANK_7.1.md", true],
    ["docs/DGR_PRODUCTION_BANK_7.10.md", true],
    ["archive/docs/DGR_EN_REVIEW_PACKAGE_7.8.md", true],
    ["docs/DGR_EN_REVIEW_PACKAGE_7.2.MD", true],
    ["docs/DGR_SOURCE_COMPETENCY_MATRIX_7.2.md", false],
    ["docs/DGR_STAGE2A_FUNCTION_7.2_BLUEPRINT.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.11.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.100.md", false],
    ["docs/DGR_PRODUCTION_BANK_7.1-copy.md", true],
    ["docs/DGR_PRODUCTION_BANK_7.10_backup.md", true],
    ["archive/DGR_EN_REVIEW_PACKAGE_7.2 (copy).md", true],
    ["docs/DGR_PRODUCTION_BANK_7.1.md.bak", true],
    ["docs/DGR_PRODUCTION_BANK_7.3.txt", true],
  ];
  const renamedKeyedMarkdown = [
    "## Q-7.2-001 — synthetic fixture",
    "**Stem (FR):** synthetic",
    "**Options:** synthetic",
    "**Correct answer rationale:** synthetic only",
  ].join("\n");
  const nonKeyedMarkdown = [
    "## Q-7.2-001 — synthetic fixture",
    "Reviewer guidance: do not include answer keys.",
    "A note mentions correct answer rationale as a concept, not an item field.",
  ].join("\n");
  if (!containsKeyedDgrSection(renamedKeyedMarkdown)
    || containsKeyedDgrSection(nonKeyedMarkdown)
    || containsKeyedDgrSection("No item headings; **Stem (FR):** x **Options:** y **Correct answer rationale:** z")) {
    throw new Error("Exam-content keyed Markdown regression fixture failed.");
  }
  const failures = cases.filter(([name, expected]) => isRestricted(name) !== expected);
  if (failures.length) {
    console.error("Exam-content path guard self-test FAILED.");
    process.exitCode = 1;
    return;
  }
  console.log("Exam-content path guard self-test passed.");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  const tracked = execFileSync("git", ["ls-files", "--cached", "-z"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  }).split("\0").filter(Boolean);
  const exposedPaths = tracked.filter(isRestricted);
  const keyedContent = [];
  const unscannedLargeText = [];
  for (const file of tracked) {
    if (isRestricted(file) || !candidateTextExtensions.test(file)) continue;
    const stat = statSync(file);
    if (!stat.isFile()) continue;
    if (stat.size > MAX_TEXT_BYTES) {
      unscannedLargeText.push(file);
      continue; // Fail closed below; never silently bless unscanned text.
    }
    if (containsKeyedDgrSection(readFileSync(file, "utf8"))) keyedContent.push(file);
  }
  if (exposedPaths.length || keyedContent.length || unscannedLargeText.length) {
    console.error("RELEASE BLOCKED: public repository exam-content boundary requires remediation.");
    for (const file of exposedPaths) console.error(` - known exam-bank path: ${file}`);
    for (const file of keyedContent) console.error(` - keyed DGR question section in renamed text file: ${file}`);
    for (const file of unscannedLargeText) console.error(` - oversized text file needs confidential-content review: ${file}`);
    console.error(
      "Transfer confidential examination content to owner-authorized restricted storage. " +
      "Already-fetched public copies are not retractable. See issue #340."
    );
    process.exitCode = 1;
  } else {
    console.log(
      "Known DGR artifact paths and high-confidence keyed Markdown question sections not found. " +
      "This does NOT prove confidentiality: alternate formats, history, forks, artifacts, and runtime exposure remain unassessed."
    );
  }
}
