import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import type { Scope } from "../../lib/scope";

describe("Production question admissibility — readiness blocker #7", async () => {
  const { getDb } = await import("../../lib/db");
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const {
    admissibleCountFor,
    listAssessmentAdmissibleQuestionIds,
    createAssessmentDraft,
    publishAssessment,
    getAssessment,
    getSnapshots,
  } = await import("../../lib/assessments");

  let admin: number;
  let groupId: number;
  let pendingId: number;
  let approvedWithoutDateId: number;
  let approvedDatedId: number;

  function seedQuestion(kostQuestionId: string): number {
    return createQuestion({
      kostQuestionId,
      functionCode: "7.1",
      qtype: "true_false",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `${kostQuestionId} — test`,
      choices: [
        { key: "true", text: "Vrai" },
        { key: "false", text: "Faux" },
      ],
      correctAnswer: ["true"],
      createdBy: admin,
    });
  }

  function createDraft(scope: Scope, questionCount: number): number {
    return createAssessmentDraft({
      type: "test",
      name: `Admission ${scope} ${questionCount}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope,
      createdBy: admin,
    });
  }

  before(() => {
    setupTestDb();
    admin = createUser({ username: "review-gate.admin", password: "x".repeat(10), fullName: "Review Gate Admin", role: "administrator" });
    const candidate = createUser({ username: "review-gate.candidate", password: "x".repeat(10), fullName: "Review Gate Candidate", role: "candidate" });
    const companyId = createCompany({ name: "Review Gate Co", scope: "production", createdBy: admin });
    groupId = createGroup({ companyId, name: "Review Gate Group", scope: "production", createdBy: admin });
    addCandidateToGroup(groupId, candidate, admin);

    pendingId = seedQuestion("Q-REVIEW-GATE-PENDING");
    approvedWithoutDateId = seedQuestion("Q-REVIEW-GATE-NODATE");
    approvedDatedId = seedQuestion("Q-REVIEW-GATE-DATED");

    const db = getDb();
    db.prepare(`UPDATE questions SET reviewer_status = 'APPROVED', review_date = NULL WHERE id = ?`).run(approvedWithoutDateId);
    db.prepare(`UPDATE questions SET reviewer_status = 'APPROVED', review_date = '2026-08-31' WHERE id = ?`).run(approvedDatedId);
  });

  test("production excludes PENDING and APPROVED-without-date while non-production preserves the existing source gate", () => {
    assert.deepEqual(listAssessmentAdmissibleQuestionIds("7.1", "production"), [approvedDatedId]);
    assert.equal(admissibleCountFor("7.1", "production"), 1);

    const expectedNonProduction = [pendingId, approvedWithoutDateId, approvedDatedId].sort((a, b) => a - b);
    assert.deepEqual(listAssessmentAdmissibleQuestionIds("7.1", "demo").sort((a, b) => a - b), expectedNonProduction);
    assert.deepEqual(listAssessmentAdmissibleQuestionIds("7.1", "test").sort((a, b) => a - b), expectedNonProduction);
  });

  test("production draft creation fails closed when the requested count would require a PENDING/unreviewed question", () => {
    assert.throws(() => createDraft("production", 2), /supérieur au nombre de questions admissibles disponibles \(1\)/);

    const id = createDraft("production", 1);
    const pool = getDb().prepare(`SELECT question_id FROM assessment_question_pool WHERE assessment_id = ?`).all(id) as { question_id: number }[];
    assert.deepEqual(pool.map((r) => r.question_id), [approvedDatedId]);
  });

  test("a forged scope is rejected at the library boundary before an assessment row is created", () => {
    const beforeCount = (getDb().prepare(`SELECT COUNT(*) AS n FROM assessments`).get() as { n: number }).n;
    assert.throws(() => createDraft("forged" as Scope, 1), /Périmètre d'évaluation invalide/);
    const afterCount = (getDb().prepare(`SELECT COUNT(*) AS n FROM assessments`).get() as { n: number }).n;
    assert.equal(afterCount, beforeCount);
  });

  test("publication revalidates reviewer approval immediately before snapshot and rolls back if approval changed", () => {
    const assessmentId = createDraft("production", 1);
    getDb().prepare(`UPDATE questions SET reviewer_status = 'PENDING', review_date = NULL WHERE id = ?`).run(approvedDatedId);

    assert.throws(() => publishAssessment(assessmentId, admin), /Publication impossible/);
    assert.equal(getAssessment(assessmentId)?.status, "draft");
    assert.deepEqual(getSnapshots(assessmentId), []);

    // Restore the fixture only; this is test data, never an application-side
    // auto-promotion path. The production code under test never changes a
    // reviewer status.
    getDb().prepare(`UPDATE questions SET reviewer_status = 'APPROVED', review_date = '2026-08-31' WHERE id = ?`).run(approvedDatedId);
  });
});
