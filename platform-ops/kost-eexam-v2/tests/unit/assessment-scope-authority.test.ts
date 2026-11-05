import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Synthetic fixtures only. A source-verification marker here is not IATA
// regulatory evidence, and no human-review or approval state is fabricated.
describe("assessment scope must match persisted company/group boundary (#65)", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, getAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  before(() => setupTestDb());

  type Scope = "production" | "demo" | "test";
  let seq = 0;
  function fixture(scope: Scope) {
    const n = ++seq;
    const admin = createUser({
      username: `scope.admin.${n}`, password: "x".repeat(12),
      fullName: "Synthetic Admin", role: "administrator",
    });
    const candidate = createUser({
      username: `scope.candidate.${n}`, password: "x".repeat(12),
      fullName: "Synthetic Candidate", role: "candidate",
    });
    const companyId = createCompany({ name: `Scope company ${n}`, scope, createdBy: admin });
    const groupId = createGroup({
      companyId, name: `Scope group ${n}`, scope, createdBy: admin,
    });
    addCandidateToGroup(groupId, candidate, admin);
    const questionId = createQuestion({
      kostQuestionId: `TEST-SCOPE-${n}`, functionCode: "7.6",
      qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "[TEST] Synthetic question", choices: [
        { key: "A", text: "A" }, { key: "B", text: "B" },
      ],
      correctAnswer: ["A"], createdBy: admin,
    });
    function draft(assessmentScope: Scope) {
      return createAssessmentDraft({
        type: "test", name: `Synthetic ${n}`, functionCode: "7.6",
        groupId, questionSource: "manual", manualQuestionIds: [questionId],
        questionCount: 1, durationMinutes: 15, passThresholdPct: 80,
        scope: assessmentScope, createdBy: admin,
      });
    }
    return { admin, companyId, groupId, questionId, draft };
  }

  test("a production group cannot be labeled demo or test to bypass review", () => {
    for (const claimedScope of ["demo", "test"] as const) {
      const f = fixture("production");
      assert.throws(() => f.draft(claimedScope), /Périmètre incompatible/);
    }
  });

  test("a demo group cannot be mislabeled as production", () => {
    const f = fixture("demo");
    assert.throws(() => f.draft("production"), /Périmètre incompatible/);
  });

  test("a genuine demo group keeps its synthetic non-production publish flow", () => {
    const f = fixture("demo");
    const assessmentId = f.draft("demo");
    publishAssessment(assessmentId, f.admin);
    assert.equal(getAssessment(assessmentId)?.status, "published");
  });

  test("changing the group scope after draft fails closed before snapshots/assignment", () => {
    const f = fixture("demo");
    const assessmentId = f.draft("demo");
    getDb().prepare("UPDATE groups SET scope = 'production' WHERE id = ?").run(f.groupId);
    assert.throws(() => publishAssessment(assessmentId, f.admin), /Périmètre incompatible/);
    assert.equal(getAssessment(assessmentId)?.status, "draft");
    const snaps = getDb().prepare("SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?").get(assessmentId) as { n: number };
    const assignments = getDb().prepare("SELECT COUNT(*) AS n FROM assessment_assignments WHERE assessment_id = ?").get(assessmentId) as { n: number };
    assert.equal(snaps.n, 0);
    assert.equal(assignments.n, 0);
  });

  test("company/group drift in an old draft cannot publish", () => {
    const f = fixture("demo");
    const assessmentId = f.draft("demo");
    getDb().prepare("UPDATE companies SET scope = 'production' WHERE id = ?").run(f.companyId);
    assert.throws(() => publishAssessment(assessmentId, f.admin), /Périmètre incompatible/);
    assert.equal(getAssessment(assessmentId)?.status, "draft");
  });

  test("matching production context still denies a reviewer-PENDING question", () => {
    const f = fixture("production");
    const assessmentId = f.draft("production");
    assert.throws(() => publishAssessment(assessmentId, f.admin), /statut APPROVED et date de revue/);
    assert.equal(getAssessment(assessmentId)?.status, "draft");
  });
});
