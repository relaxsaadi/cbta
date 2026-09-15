import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

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

  test("all three readers include the valid candidate, exclude poisoned historical assignees, and preserve every assignment row", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const {
      createAssessmentDraft,
      publishAssessment,
      getAssignmentStatsByAssessment,
      trackingForAssessment,
      getSessionReport,
    } = await import("../../lib/assessments");
    const { getDb } = await import("../../lib/db");

    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const adminId = createUser({
      username: `assignment-reader-admin-${suffix}`,
      password: "x".repeat(10),
      fullName: "Reader Admin",
      role: "administrator",
    });
    const validCandidateId = createUser({
      username: `assignment-reader-candidate-${suffix}`,
      password: "x".repeat(10),
      fullName: "Valid Candidate",
      role: "candidate",
    });
    const staffOnlyId = createUser({
      username: `assignment-reader-staff-${suffix}`,
      password: "x".repeat(10),
      fullName: "Historical Staff",
      role: "auditor",
    });
    const rolelessId = createUser({
      username: `assignment-reader-roleless-${suffix}`,
      password: "x".repeat(10),
      fullName: "Historical Roleless",
      role: "candidate",
    });
    const ambiguousId = createUser({
      username: `assignment-reader-ambiguous-${suffix}`,
      password: "x".repeat(10),
      fullName: "Historical Ambiguous",
      role: "candidate",
    });

    const db = getDb();
    db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(rolelessId);
    const administratorRole = db.prepare(`SELECT id FROM roles WHERE code = 'administrator'`).get() as { id: number } | undefined;
    assert.ok(administratorRole);
    db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(ambiguousId, administratorRole.id);

    const companyId = createCompany({ name: `Assignment reader company ${suffix}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `Assignment reader group ${suffix}`, scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, validCandidateId, adminId);

    const questionId = createQuestion({
      kostQuestionId: `TEST-ASSIGNMENT-READERS-${suffix}`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Question de test",
      choices: [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Assignment reader exam ${suffix}`,
      functionCode: "7.1",
      groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 50,
      scope: "test",
      createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [validCandidateId] });

    const insertHistoricalAssignment = db.prepare(
      `INSERT INTO assessment_assignments (assessment_id, candidate_user_id, assigned_by) VALUES (?, ?, ?)`
    );
    insertHistoricalAssignment.run(assessmentId, staffOnlyId, adminId);
    insertHistoricalAssignment.run(assessmentId, rolelessId, adminId);
    insertHistoricalAssignment.run(assessmentId, ambiguousId, adminId);

    const persistedBefore = db
      .prepare(`SELECT candidate_user_id FROM assessment_assignments WHERE assessment_id = ? ORDER BY candidate_user_id`)
      .all(assessmentId) as { candidate_user_id: number }[];
    assert.equal(persistedBefore.length, 4, "fixture must contain one valid and three poisoned historical assignments");

    const stats = getAssignmentStatsByAssessment().get(assessmentId);
    assert.ok(stats);
    assert.equal(stats.assigned, 1);
    assert.equal(stats.notStarted, 1);

    const tracking = trackingForAssessment(assessmentId) as { candidate_user_id: number }[];
    assert.deepEqual(tracking.map((row) => row.candidate_user_id), [validCandidateId]);

    const report = getSessionReport(assessmentId);
    assert.deepEqual(report.rows.map((row) => row.candidate_user_id), [validCandidateId]);
    assert.equal(report.stats.convened, 1);
    assert.equal(report.stats.notStarted, 1);

    const persistedAfter = db
      .prepare(`SELECT candidate_user_id FROM assessment_assignments WHERE assessment_id = ? ORDER BY candidate_user_id`)
      .all(assessmentId) as { candidate_user_id: number }[];
    assert.deepEqual(persistedAfter, persistedBefore, "operational reads must never delete or rewrite historical assignment evidence");

    const roleCounts = db
      .prepare(`SELECT user_id, COUNT(*) AS count FROM user_roles WHERE user_id IN (?, ?, ?) GROUP BY user_id`)
      .all(staffOnlyId, rolelessId, ambiguousId) as { user_id: number; count: number }[];
    const countFor = (userId: number) => roleCounts.find((row) => row.user_id === userId)?.count ?? 0;
    assert.equal(countFor(staffOnlyId), 1);
    assert.equal(countFor(rolelessId), 0);
    assert.equal(countFor(ambiguousId), 2, "reader filtering must preserve contradictory role evidence for explicit remediation");
  });
});
