import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const assessmentsSource = readFileSync(
  fileURLToPath(new URL("../../lib/assessments.ts", import.meta.url)),
  "utf8"
);

function functionSlice(startMarker: string, endMarker?: string): string {
  const start = assessmentsSource.indexOf(startMarker);
  assert.ok(start >= 0, `${startMarker} must exist`);
  const end = endMarker ? assessmentsSource.indexOf(endMarker, start + startMarker.length) : assessmentsSource.length;
  assert.ok(end > start, `${endMarker ?? "EOF"} must follow ${startMarker}`);
  return assessmentsSource.slice(start, end);
}

function assertCanonicalCandidateGuard(source: string): void {
  assert.match(source, /FROM assessment_assignments aa/);
  assert.match(source, /JOIN user_roles ur ON ur\.user_id = aa\.candidate_user_id/);
  assert.match(source, /JOIN roles cr ON cr\.id = ur\.role_id AND cr\.code = 'candidate'/);
  assert.match(
    source,
    /\(SELECT COUNT\(\*\) FROM user_roles urc WHERE urc\.user_id = aa\.candidate_user_id\) = 1/
  );
  assert.doesNotMatch(source, /DELETE FROM assessment_assignments/);
}

describe("Historical assessment assignments — operational readers fail closed (#78/#245)", () => {
  test("assignment dashboard stats require exactly one persisted candidate role", () => {
    const source = functionSlice(
      "export function getAssignmentStatsByAssessment",
      "export function isAssessmentOpenNow"
    );
    assertCanonicalCandidateGuard(source);
  });

  test("tracking table excludes staff, roleless and multi-role historical assignees without deleting evidence", () => {
    const source = functionSlice(
      "export function trackingForAssessment",
      "export interface SessionReportRow"
    );
    assertCanonicalCandidateGuard(source);
  });

  test("global session report/PDF stats use the same canonical-candidate boundary", () => {
    const source = functionSlice("export function getSessionReport");
    assertCanonicalCandidateGuard(source);
    assert.match(source, /convened: rows\.length/);
    assert.match(source, /average: scores\.length > 0/);
  });
});
