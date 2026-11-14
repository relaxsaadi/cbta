#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = "docs/DGR_REVIEWER_REGISTRY.md";
const expectedHeaders = [
  "reviewer id",
  "full name",
  "record type",
  "dgr/cbta qualification evidence",
  "bilingual fr/en evidence",
  "admission state",
  "admission date",
  "evidence reference",
  "active",
];
const unresolvedBilingualRefRe =
  /(?:^[-–—]+$)|\b(?:PENDING|TBD|TODO|UNKNOWN|N\/?A|NONE|MISSING|UNVERIFIED|UNCONFIRMED|NOT\s+VERIFIED|NOT\s+YET\s+VERIFIED|NO\s+EVIDENCE|NO\s+REFERENCE|WITHOUT\s+EVIDENCE|ABSENT|EXPIRED|REVOKED)\b/i;

function normalize(value = "") {
  return String(value).replace(/[`*_]/g, " ").replace(/\s+/g, " ").trim();
}

function markdownCells(line) {
  const text = line.trim();
  if (!text.startsWith("|") || !text.endsWith("|")) return [];
  return text.slice(1, -1).split("|").map((cell) => cell.trim());
}

function isMarkdownSeparatorRow(line, expectedCells) {
  const cells = markdownCells(line);
  return (
    expectedCells > 0 &&
    cells.length === expectedCells &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function bilingualRefs(value) {
  const text = normalize(value);
  const refs = [];
  const pattern = /(?:^|[;,])\s*bilingual-ref\s*=\s*([^;,]*)/giu;
  for (const match of text.matchAll(pattern)) refs.push(normalize(match[1] ?? ""));
  return refs;
}

export function validateBilingualEvidenceReferences(text, artifact = registryPath) {
  const errors = [];
  const lines = String(text ?? "").split(/\r?\n/);
  let found = false;

  for (let i = 0; i < lines.length; i += 1) {
    const headers = markdownCells(lines[i]);
    if (!headers.length) continue;
    const normalizedHeaders = headers.map((cell) => normalize(cell).toLowerCase());
    if (
      normalizedHeaders.length !== expectedHeaders.length ||
      !normalizedHeaders.every((cell, index) => cell === expectedHeaders[index])
    ) {
      continue;
    }

    if (found) {
      errors.push(`${artifact}: more than one canonical reviewer registry table found`);
      continue;
    }
    found = true;

    if (!isMarkdownSeparatorRow(lines[i + 1] ?? "", headers.length)) {
      errors.push(
        `${artifact}: reviewer registry header is not followed by a valid same-width Markdown separator`,
      );
      continue;
    }

    const idIndex = normalizedHeaders.indexOf("reviewer id");
    const bilingualIndex = normalizedHeaders.indexOf("bilingual fr/en evidence");
    const evidenceIndex = normalizedHeaders.indexOf("evidence reference");

    for (let j = i + 2; j < lines.length; j += 1) {
      const cells = markdownCells(lines[j]);
      if (!cells.length) break;
      if (cells.length !== headers.length) {
        errors.push(
          `${artifact}: registry row ${j + 1} has ${cells.length} cell(s), expected ${headers.length}`,
        );
        continue;
      }

      const reviewerId = normalize(cells[idIndex] ?? "").toUpperCase();
      if (!reviewerId || /^[-–—]+$/.test(reviewerId)) continue;

      const bilingual = normalize(cells[bilingualIndex] ?? "").toUpperCase();
      if (bilingual !== "YES") continue;

      const refs = bilingualRefs(cells[evidenceIndex] ?? "");
      if (refs.length !== 1) {
        errors.push(
          `${artifact}: ${reviewerId}: Bilingual FR/EN evidence=YES requires exactly one traceable bilingual-ref=<non-secret reference> segment in Evidence reference`,
        );
        continue;
      }

      if (!refs[0] || unresolvedBilingualRefRe.test(refs[0])) {
        errors.push(
          `${artifact}: ${reviewerId}: bilingual-ref must identify owner-reviewed bilingual FR/EN evidence and cannot contain pending, missing, unverified or otherwise unresolved evidence semantics`,
        );
      }
    }
  }

  if (!found) errors.push(`${artifact}: missing canonical reviewer registry table`);
  return errors;
}

function fixtureRegistry({ bilingual = "YES", evidence = "qualification-ref=DGR-cred-001; bilingual-ref=owner-reviewed-language-evidence-BR-001" } = {}) {
  return [
    "| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |",
    "|---|---|---|---|---|---|---|---|---|",
    `| DGR-RVW-0001 | Jane Doe | HUMAN | DGR/CBTA Instructor credential reviewed | ${bilingual} | OWNER VERIFIED | 2026-09-06 | ${evidence} | YES |`,
  ].join("\n");
}

function expect(name, errors, shouldFail) {
  if ((errors.length > 0) !== shouldFail) {
    throw new Error(
      `${name}: expected fail=${shouldFail}, got ${errors.length}: ${errors.join(" | ")}`,
    );
  }
}

function fixtures() {
  expect(
    "valid-traceable-bilingual-reference",
    validateBilingualEvidenceReferences(fixtureRegistry(), "fixture.md"),
    false,
  );
  expect(
    "yes-without-bilingual-reference",
    validateBilingualEvidenceReferences(
      fixtureRegistry({ evidence: "qualification-ref=DGR-cred-001" }),
      "fixture.md",
    ),
    true,
  );

  for (const unresolvedRef of [
    "PENDING",
    "N/A",
    "NONE",
    "PENDING owner review",
    "language evidence UNVERIFIED",
    "NO EVIDENCE ON FILE",
    "reference MISSING from owner record",
    "language evidence NOT YET VERIFIED",
  ]) {
    expect(
      `yes-with-unresolved-reference:${unresolvedRef}`,
      validateBilingualEvidenceReferences(
        fixtureRegistry({
          evidence: `qualification-ref=DGR-cred-001; bilingual-ref=${unresolvedRef}`,
        }),
        "fixture.md",
      ),
      true,
    );
  }

  expect(
    "yes-with-duplicate-reference",
    validateBilingualEvidenceReferences(
      fixtureRegistry({ evidence: "qualification-ref=DGR-cred-001; bilingual-ref=BR-001; bilingual-ref=BR-002" }),
      "fixture.md",
    ),
    true,
  );
  expect(
    "no-bilingual-claim-needs-no-reference",
    validateBilingualEvidenceReferences(
      fixtureRegistry({ bilingual: "NO", evidence: "qualification-ref=DGR-cred-001" }),
      "fixture.md",
    ),
    false,
  );
  expect(
    "pending-bilingual-claim-needs-no-reference",
    validateBilingualEvidenceReferences(
      fixtureRegistry({ bilingual: "PENDING", evidence: "qualification-ref=DGR-cred-001" }),
      "fixture.md",
    ),
    false,
  );
  console.log("DGR reviewer bilingual evidence-reference regression fixtures: PASS");
}

function repositoryCheck() {
  const absolute = path.join(root, registryPath);
  if (!fs.existsSync(absolute)) {
    console.error(`ERROR: ${registryPath}: missing controlled reviewer registry`);
    process.exit(1);
  }

  const errors = validateBilingualEvidenceReferences(
    fs.readFileSync(absolute, "utf8"),
    registryPath,
  );

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(
      `\nDGR REVIEWER BILINGUAL EVIDENCE-REFERENCE CHECK: FAIL (${errors.length} issue(s))`,
    );
    process.exit(1);
  }

  console.log("DGR REVIEWER BILINGUAL EVIDENCE-REFERENCE CHECK: PASS");
  console.log(
    "PASS validates traceable recorded bilingual-evidence references only; real bilingual competence, credential authenticity and regulatory judgment remain human responsibilities.",
  );
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
