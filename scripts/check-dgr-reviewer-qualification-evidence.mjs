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

const qualificationFamilyRe = /\b(?:DGR|CBTA|Dangerous Goods|Marchandises dangereuses)\b/i;
const unresolvedQualificationRe =
  /\b(?:PENDING|TBD|TODO|UNKNOWN|MISSING|UNVERIFIED|UNCONFIRMED|NOT\s+VERIFIED|NOT\s+YET\s+VERIFIED|NOT\s+QUALIFIED|NOT\s+CONFIRMED|EXPIRED|REVOKED|LAPSED)\b|\bNO\s+(?:(?:DGR|CBTA|Dangerous Goods|Marchandises dangereuses)\s+)?QUALIFICATION\b|\bWITHOUT\s+(?:(?:DGR|CBTA|Dangerous Goods|Marchandises dangereuses)\s+)?QUALIFICATION\b|\b(?:QUALIFICATION|CREDENTIAL)\s+(?:PENDING|MISSING|UNVERIFIED|NOT\s+VERIFIED|EXPIRED|REVOKED)\b/i;

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

export function hasAffirmativeQualificationEvidence(value) {
  const text = normalize(value);
  if (!text || !qualificationFamilyRe.test(text)) return false;
  if (unresolvedQualificationRe.test(text)) return false;
  return true;
}

export function validateActiveOwnerVerifiedQualificationEvidence(
  text,
  artifact = registryPath,
) {
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
    const qualificationIndex = normalizedHeaders.indexOf("dgr/cbta qualification evidence");
    const admissionIndex = normalizedHeaders.indexOf("admission state");
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

      const qualification = normalize(cells[qualificationIndex] ?? "");
      if (!hasAffirmativeQualificationEvidence(qualification)) {
        errors.push(
          `${artifact}: ${reviewerId}: active OWNER VERIFIED reviewer requires affirmative recorded DGR/CBTA qualification evidence; unresolved, negative, expired or revoked wording is not qualification evidence`,
        );
      }
    }
  }

  if (!found) errors.push(`${artifact}: missing canonical reviewer registry table`);
  return errors;
}

function fixtureRegistry(qualification, { admission = "OWNER VERIFIED", active = "YES" } = {}) {
  return [
    "| Reviewer ID | Full name | Record type | DGR/CBTA qualification evidence | Bilingual FR/EN evidence | Admission state | Admission date | Evidence reference | Active |",
    "|---|---|---|---|---|---|---|---|---|",
    `| DGR-RVW-0001 | Jane Doe | HUMAN | ${qualification} | YES | ${admission} | 2026-09-06 | owner-reviewed credential ref | ${active} |`,
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
  for (const qualification of [
    "DGR/CBTA Instructor credential reviewed",
    "Dangerous Goods instructor qualification checked by owner",
    "Marchandises dangereuses — qualification instructeur contrôlée",
  ]) {
    expect(
      `valid:${qualification}`,
      validateActiveOwnerVerifiedQualificationEvidence(fixtureRegistry(qualification), "fixture.md"),
      false,
    );
  }

  for (const qualification of [
    "DGR qualification pending",
    "CBTA credential not verified",
    "No DGR qualification on file",
    "Dangerous Goods qualification missing",
    "DGR credential expired",
    "CBTA qualification revoked",
    "Qualification checked",
  ]) {
    expect(
      `invalid:${qualification}`,
      validateActiveOwnerVerifiedQualificationEvidence(fixtureRegistry(qualification), "fixture.md"),
      true,
    );
  }

  expect(
    "inactive-pending-record-may-remain",
    validateActiveOwnerVerifiedQualificationEvidence(
      fixtureRegistry("DGR qualification pending", { admission: "PENDING", active: "NO" }),
      "fixture.md",
    ),
    false,
  );

  console.log("DGR active reviewer qualification-evidence regression fixtures: PASS");
}

function repositoryCheck() {
  const absolute = path.join(root, registryPath);
  if (!fs.existsSync(absolute)) {
    console.error(`ERROR: ${registryPath}: missing controlled reviewer registry`);
    process.exit(1);
  }

  const errors = validateActiveOwnerVerifiedQualificationEvidence(
    fs.readFileSync(absolute, "utf8"),
    registryPath,
  );

  if (errors.length) {
    errors.forEach((error) => console.error(`ERROR: ${error}`));
    console.error(
      `\nDGR ACTIVE REVIEWER QUALIFICATION-EVIDENCE CHECK: FAIL (${errors.length} issue(s))`,
    );
    process.exit(1);
  }

  console.log("DGR ACTIVE REVIEWER QUALIFICATION-EVIDENCE CHECK: PASS");
  console.log(
    "PASS validates recorded qualification semantics only; real-world identity, credential authenticity, regulatory competence and owner admission remain human responsibilities.",
  );
}

if (process.argv.includes("--test")) fixtures();
else repositoryCheck();
