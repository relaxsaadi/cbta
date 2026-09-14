import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

describe("Candidate-role invariant — downstream commit boundaries (#78)", () => {
  test("group-mode assessment publication and new familiarisation rosters exclude poisoned staff memberships", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await import("../../lib/assessments");
    const { createFamiliarizationSession, listAttendance } = await import("../../lib/familiarization");
    const { getDb } = await import("../../lib/db");

    const adminId = createUser({
      username: "downstream-role-admin",
      password: "x".repeat(10),
      fullName: "Admin downstream",
      role: "administrator",
    });
    const managerId = createUser({
      username: "downstream-role-manager",
      password: "x".repeat(10),
      fullName: "Responsable downstream",
      role: "pedagogical_manager",
    });
    const candidateId = createUser({
      username: "downstream-role-candidate",
      password: "x".repeat(10),
      fullName: "Candidat downstream",
      role: "candidate",
    });
    const auditorId = createUser({
      username: "downstream-role-auditor",
      password: "x".repeat(10),
      fullName: "Auditeur downstream",
      role: "auditor",
    });

    const companyId = createCompany({ name: "Downstream role company", scope: "test", createdBy: adminId });
    const groupId = createGroup({
      companyId,
      name: "Downstream role group",
      scope: "test",
      pedagogicalManagerId: managerId,
      createdBy: adminId,
    });
    addCandidateToGroup(groupId, candidateId, adminId);

    // Simulate a historical poisoned row that bypassed the current writer guard.
    getDb()
      .prepare(`INSERT INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`) 
      .run(groupId, auditorId, adminId);

    const questionId = createQuestion({
      kostQuestionId: "TEST-ROLE-INVARIANT-DOWNSTREAM",
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
      name: "Role invariant assessment",
      functionCode: "7.1",
      groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
    });

    publishAssessment(assessmentId, adminId);
    assert.deepEqual(listAssignedCandidateIds(assessmentId), [candidateId]);
    assert.ok(!listAssignedCandidateIds(assessmentId).includes(auditorId));

    const familiarizationSessionId = createFamiliarizationSession({
      groupId,
      functionCode: "7.1",
      heldAt: "2026-09-14T10:00:00.000Z",
      organizedBy: managerId,
      organizerRole: "pedagogical_manager",
      audience: "candidats",
    });
    assert.deepEqual(
      listAttendance(familiarizationSessionId).map((row) => row.candidate_user_id),
      [candidateId]
    );
    assert.ok(!listAttendance(familiarizationSessionId).some((row) => row.candidate_user_id === auditorId));
  });
});
