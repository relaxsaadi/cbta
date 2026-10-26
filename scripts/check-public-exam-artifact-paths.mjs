#!/usr/bin/env node
/**
 * Public-repository tripwire for known DGR examination-content artifact paths.
 *
 * IMPORTANT: this is a narrow file-path merge check, not a secret scanner,
 * retroactive content withdrawal, push-time protection, or proof that all
 * assessment material is confidential. See GitHub issue #340.
 */
import { execFileSync } from "node:child_process";

const restrictedArtifact = /(?:^|\/)DGR_(?:PRODUCTION_BANK|EN_REVIEW_PACKAGE)_7\.(?:[1-9]|10)\.md$/i;

function isRestricted(path) {
  return restrictedArtifact.test(path.replaceAll("\\", "/"));
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
    ["docs/DGR_PRODUCTION_BANK_7.1.md.bak", false],
  ];
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
  const exposed = tracked.filter(isRestricted);
  if (exposed.length) {
    console.error("RELEASE BLOCKED: known answer-key-bearing exam artifacts are tracked in this PUBLIC repository:");
    for (const path of exposed) console.error(` - ${path}`);
    console.error(
      "Move confidential exam material to owner-authorized restricted storage; do not commit replacements or keys here. " +
      "Removing paths from a branch cannot retract public history. See issue #340."
    );
    process.exitCode = 1;
  } else {
    console.log(
      "Known DGR bank/reviewer-package paths are absent from tracked files. " +
      "This does NOT prove confidentiality: other paths, Git history, forks, artifacts, and runtime exposure remain unassessed."
    );
  }
}
