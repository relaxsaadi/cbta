import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Regression: source verification alone is not approval for production.
// These fixtures are synthetic: they do NOT attest real human review or DGR evidence.
describe("Production publication requires recorded reviewer approval and date", async () => {
  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, getAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  before(() => setupTestDb());

  let counter = 0;
  function fixture(scope: "production" | "test", questionSource: "manual" | "random" = "manual") {
    const tag = ++counter;
    const admin = createUser({ username: `reviewgate.admin.${tag}`, password: "x".repeat(12), fullName: "Synthetic Admin", role: "administrator" });
    const candidate = createUser({ username: `reviewgate.candidate.${tag}`, password: "x".repeat(12), fullName: "Synthetic Candidate", role: "candidate" });
    const companyId = createCompany({ name: `Review gate company ${tag}`, scope, createdBy: admin });
    const groupId = createGroup({ companyId, name: `Review gate group ${tag}`, scope, createdBy: admin });
    addCandidateToGroup(groupId, candidate, admin);
    const questionId = createQuestion({
      kostQuestionId: `TEST-REVIEWGATE-${tag}`, functionCode: "7.2",
      qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Synthetic question", choices: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
      correctAnswer: ["A"], createdBy: admin,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Synthetic exam ${tag}`, functionCode: "7.2",
      groupId, questionSource, manualQuestionIds: questionSource === "manual" ? [questionId] : undefined,
      questionCount: 1, durationMinutes: 15, passThresholdPct: 80,
      scope, createdBy: admin,
    });
    return { admin, questionId, assessmentId };
  }

  test("pending source-verified question cannot publish in production, manual or random", () => {
    for (const source of ["manual", "random"] as const) {
      const { admin, assessmentId } = fixture("production", source);
      assert.throws(() => publishAssessment(assessmentId, admin), /statut APPROVED et date de revue/);
      assert.equal(getAssessment(assessmentId)?.status, "draft");
      const snapshots = getDb().prepare("SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE assessment_id = ?").get(assessmentId) as { n: number };
      assert.equal(snapshots.n, 0);
      const assigned = getDb().prepare("SELECT COUNT(*) AS n FROM assessment_assignments WHERE assessment_id = ?").get(assessmentId) as { n: number };
      assert.equal(assigned.n, 0);
    }
  });

  test("APPROVED flag without an actual review date still cannot publish in production", () => {
    const { admin, questionId, assessmentId } = fixture("production");
    getDb().prepare("UPDATE questions SET reviewer_status = 'APPROVED', review_date = NULL WHERE id = ?").run(questionId);
    assert.throws(() => publishAssessment(assessmentId, admin), /statut APPROVED et date de revue/);
    assert.equal(getAssessment(assessmentId)?.status, "draft");
  });

  test("synthetic test scope retains its existing workflow for automated acceptance", () => {
    const { admin, assessmentId } = fixture("test");
    publishAssessment(assessmentId, admin);
    assert.equal(getAssessment(assessmentId)?.status, "published");
  });
});
