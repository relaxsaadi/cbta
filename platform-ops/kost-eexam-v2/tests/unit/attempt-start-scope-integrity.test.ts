import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// #65 — Synthetic fixtures are not reviewed regulatory material. Previously
// published non-production content must not become a new production-context
// candidate attempt simply because a scope label drifts after publication.
describe("candidate attempt start checks persisted scope authority", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");

  before(() => setupTestDb());
  let seq = 0;

  function publishedFixture(scope: "demo" | "test" = "demo") {
    const n = ++seq;
    const admin = createUser({
      username: `start.scope.admin.${n}`, password: "x".repeat(12),
      fullName: "Synthetic Admin", role: "administrator",
    });
    const candidate = createUser({
      username: `start.scope.candidate.${n}`, password: "x".repeat(12),
      fullName: "Synthetic Candidate", role: "candidate",
    });
    const companyId = createCompany({ name: `Start scope company ${n}`, scope, createdBy: admin });
    const groupId = createGroup({ companyId, name: `Start scope group ${n}`, scope, createdBy: admin });
    addCandidateToGroup(groupId, candidate, admin);
    const questionId = createQuestion({
      kostQuestionId: `TEST-START-SCOPE-${n}`, functionCode: "7.8",
      qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "[TEST] Synthetic question", choices: [
        { key: "A", text: "A" }, { key: "B", text: "B" },
      ],
      correctAnswer: ["A"], createdBy: admin,
    });
    const assessmentId = createAssessmentDraft({
      type: "exercice", name: `Synthetic scope test ${n}`,
      functionCode: "7.8", groupId, questionSource: "manual",
      manualQuestionIds: [questionId], questionCount: 1,
      durationMinutes: 15, passThresholdPct: 80,
      scope, createdBy: admin,
    });
    publishAssessment(assessmentId, admin);
    return { companyId, groupId, assessmentId, candidate };
  }

  function attemptCount(assessmentId: number) {
    return (getDb().prepare("SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ?").get(assessmentId) as { n: number }).n;
  }

  test("matching demo/test scopes still allow a new candidate attempt", () => {
    for (const scope of ["demo", "test"] as const) {
      const f = publishedFixture(scope);
      const attempt = startAttempt(f.assessmentId, f.candidate, {});
      assert.equal(attempt.status, "in_progress");
      assert.equal(attemptCount(f.assessmentId), 1);
    }
  });

  test("published demo cannot start a new attempt after group becomes production", () => {
    const f = publishedFixture();
    getDb().prepare("UPDATE groups SET scope = 'production' WHERE id = ?").run(f.groupId);
    assert.throws(() => startAttempt(f.assessmentId, f.candidate, {}), /périmètre.*incohérent/);
    assert.equal(attemptCount(f.assessmentId), 0);
  });

  test("published demo cannot start a new attempt after company becomes production", () => {
    const f = publishedFixture();
    getDb().prepare("UPDATE companies SET scope = 'production' WHERE id = ?").run(f.companyId);
    assert.throws(() => startAttempt(f.assessmentId, f.candidate, {}), /périmètre.*incohérent/);
    assert.equal(attemptCount(f.assessmentId), 0);
  });

  test("a running attempt retains resume continuity despite later scope drift", () => {
    const f = publishedFixture();
    const first = startAttempt(f.assessmentId, f.candidate, {});
    getDb().prepare("UPDATE groups SET scope = 'production' WHERE id = ?").run(f.groupId);
    const resumed = startAttempt(f.assessmentId, f.candidate, {});
    assert.equal(resumed.id, first.id);
    assert.equal(attemptCount(f.assessmentId), 1);
  });
});
