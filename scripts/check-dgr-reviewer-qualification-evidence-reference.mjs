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

const unresolvedQualificationRefRe =
  /(?:^[-–—]+$)|\b(?:PENDING|TBD|TODO|UNKNOWN|N\/?A|NONE|MISSING|UNVERIFIED|UNCONFIRMED|NOT\s+VERIFIED|NOT\s+YET\s+VERIFIED|NO\s+EVIDENCE|NO\s+REFERENCE|WITHOUT\s+EVIDENCE|ABSENT|EXPIRED|REVOKED|LAPSED|NOT\s+QUALIFIED|NOT\s+CONFIRMED)\b|\b(?:QUALIFICATION|CREDENTIAL)\s+(?:PENDING|MISSING|UNVERIFIED|NOT\s+VERIFIED|EXPIRED|REVOKED)\b|\bNO\s+(?:(?:DGR|CBTA|Dangerous Goods|Marchandises dangereuses)\s+)?QUALIFICATION\b/i;

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

function qualificationRefs(value) {
  const text = normalize(value);
  const refs = [];
  const pattern = /(?:^|[;,])\s*qualification-ref\s*=\s*([^;,]*)/giu;
  for (const match of text.matchAll(pattern)) refs.push(normalize(match[1] ?? ""));
  return refs;
}

export function validateQualificationEvidenceReferences(text, artifact = registryPath) {
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
    const admissionIndex = normalizedHeaders.indexOf("admission state");
    const evidenceIndex = normalizedHeaders.indexOf("evidence reference");
    const activeIndex = normalizedHeaders.indexOf("active");

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

      const admission = normalize(cells[admissionIndex] ?? "").toUpperCase();
      const active = normalize(cells[activeIndex] ?? "").toUpperCase();
      if (admission !== "OWNER VERIFIED" || active !== "YES") continue;

      const refs = qualificationRefs(cells[evidenceIndex] ?? "");
      if (refs.length !== 1) {
        errors.push(
          `${artifact}: ${reviewerId}: active OWNER VERIFIED reviewer requires exactly one traceable qualification-ref=<non-secret reference> segment in Evidence reference`,
        );
        continue;
      }

      if (!refs[0] || unresolvedQualificationRefRe.test(refs[0])) {
        errors.push(
          `${artifact}: ${reviewerId}: qualification-ref must identify owner-reviewed DGR/CBTA qualification evidence and cannot contain pending, missing, unverified, expired, revoked, negative or otherwise unresolved evidence semantics`,
        );
      }
    }
  }

  if (!found) errors.push(`${artifact}: missing canonical reviewer registry table`);
  return errors;
}

function fixtureRegistry({
  admission = "OWNER VERIFIED",
  active = "YES",
  evidence = "qualification-ref=owner-reviewed-DGR-credential-QR-001; bilingual-ref=owner-reviewed-language-evidence-BR-001",
} = {}) {
  return [
    "| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |",
    "|---|---|---|---|---|---|---|---|---|",
    `| DGR-RVW-0001 | Jane Doe | HUMAN | DGR/CBTA Instructor credential reviewed | YES | ${admission} | 2026-09-06 | ${evidence} | ${active} |`,
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
    "valid-traceable-qualification-reference",
    validateQualificationEvidenceReferences(fixtureRegistry(), "fixture.md"),
    false,
  );
  expect(
    "owner-verified-without-qualification-reference",
    validateQualificationEvidenceReferences(
      fixtureRegistry({ evidence: "bilingual-ref=owner-reviewed-language-evidence-BR-001" }),
      "fixture.md",
    ),
    true,
  );

  for (const unresolvedRef of [
    "PENDING",
    "N/A",
    "NONE",
    "credential PENDING owner review",
    "qualification evidence UNVERIFIED",
    "NO EVIDENCE ON FILE",
    "reference MISSING from owner record",
    "credential EXPIRED",
    "qualification REVOKED",
    "NOT QUALIFIED",
  ]) {
    expect(
      `owner-verified-with-unresolved-reference:${unresolvedRef}`,
      validateQualificationEvidenceReferences(
        fixtureRegistry({
          evidence: `qualification-ref=${unresolvedRef}; bilingual-ref=owner-reviewed-language-evidence-BR-001`,
        }),
        "fixture.md",
      ),
      true,
    );
  }

  expect(
    "owner-verified-with-duplicate-qualification-reference",
    validateQualificationEvidenceReferences(
      fixtureRegistry({
        evidence: "qualification-ref=QR-001; qualification-ref=QR-002; bilingual-ref=BR-001",
      }),
      "fixture.md",
    ),
    true,
  );

  expect(
    "pending-inactive-record-needs-no-qualification-reference",
    validateQualificationEvidenceReferences(
      fixtureRegistry({
        admission: "PENDING",
        active: "NO",
        evidence: "—",
      }),
      "fixture.md",
    ),
    false,
  );

  console.log("DGR reviewer qualification evidence-reference regression fixtures: PASS");
}

function repositoryCheck() {
  const absolute = path.join(root, registryPath);
  if (!fs.existsSync(absolute)) {
    console.error(`ERROR: ${registryPath}: missing controlled reviewer registry`);
    process.exit(1);
  }

  const errors = validateQualificationEvidenceReferences(
    fs.readFileSync(absolute, "utf8"),
    registryPath,
  );

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(
      `\nDGR REVIEWER QUALIFICATION EVIDENCE-REFERENCE CHECK: FAIL (${errors.length} issue(s))`,
    );
    process.exit(1);
  }

  console.log("DGR REVIEWER QUALIFICATION EVIDENCE-REFERENCE CHECK: PASS");
  console.log(
    "PASS validates a traceable recorded qualification-evidence reference only; credential authenticity, real regulatory competence and owner admission remain human responsibilities.",
  );
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
