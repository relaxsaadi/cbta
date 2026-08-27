import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

// Addendum auditeur §1 — deux modes d'affectation d'un examen : par
// GROUPE (comportement historique) ou CIBLÉE (certains candidats /
// candidat individuel), plus la gestion post-publication (affecter
// d'autres candidats, retirer un candidat non-commencé).
describe("Affectation d'examen — modes groupe / sélection / individuel", () => {
  async function setupFixture() {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion, addQuestionVersion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await import("../../lib/assessments");

    const adminId = createUser({ username: `admin.assign.${Date.now()}`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const questionId = createQuestion({
      kostQuestionId: `TEST-ASSIGN-${Date.now()}`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q assignation",
      choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    addQuestionVersion(questionId, { stem: "Q assignation v2", choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }], correctAnswer: ["A"] }, adminId);

    const companyId = createCompany({ name: `Co Assign ${Date.now()}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "Groupe Assign", scope: "test", createdBy: adminId });
    const c1 = createUser({ username: `c1.assign.${Date.now()}`, password: "x".repeat(10), fullName: "Candidat 1", role: "candidate" });
    const c2 = createUser({ username: `c2.assign.${Date.now()}`, password: "x".repeat(10), fullName: "Candidat 2", role: "candidate" });
    const c3 = createUser({ username: `c3.assign.${Date.now()}`, password: "x".repeat(10), fullName: "Candidat 3", role: "candidate" });
    addCandidateToGroup(groupId, c1, adminId);
    addCandidateToGroup(groupId, c2, adminId);
    addCandidateToGroup(groupId, c3, adminId);

    return { adminId, groupId, c1, c2, c3, createAssessmentDraft, publishAssessment, listAssignedCandidateIds };
  }

  test("mode GROUPE (défaut) : tous les membres du groupe sont affectés", async () => {
    const { adminId, groupId, c1, c2, c3, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Groupe", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId); // pas d'opts -> mode groupe
    assert.deepEqual(listAssignedCandidateIds(assessmentId).sort(), [c1, c2, c3].sort());
  });

  test("mode CERTAINS CANDIDATS : seuls les candidats sélectionnés sont affectés", async () => {
    const { adminId, groupId, c1, c2, c3, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Selection", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [c1, c2] });
    assert.deepEqual(listAssignedCandidateIds(assessmentId).sort(), [c1, c2].sort());
    assert.ok(!listAssignedCandidateIds(assessmentId).includes(c3), "c3 ne doit pas être affecté");
  });

  test("mode INDIVIDUEL : un seul candidat est affecté", async () => {
    const { adminId, groupId, c1, c2, c3, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Individuel", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [c2] });
    assert.deepEqual(listAssignedCandidateIds(assessmentId), [c2]);
  });

  test("un id candidat qui n'appartient PAS au groupe est ignoré, jamais affecté en confiance aveugle", async () => {
    const { adminId, groupId, c1, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const { createUser } = await import("../../lib/users");
    const outsiderId = createUser({ username: `outsider.${Date.now()}`, password: "x".repeat(10), fullName: "Hors groupe", role: "candidate" });
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Outsider", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [c1, outsiderId] });
    const assigned = listAssignedCandidateIds(assessmentId);
    assert.deepEqual(assigned, [c1]);
    assert.ok(!assigned.includes(outsiderId), "un candidat hors groupe ne doit jamais être affecté, même explicitement demandé");
  });

  test("assignCandidatesToAssessment ajoute des candidats après publication (réaffectation)", async () => {
    const { adminId, groupId, c1, c2, c3, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const { assignCandidatesToAssessment } = await import("../../lib/assessments");
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Reassign", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [c1] });
    assert.deepEqual(listAssignedCandidateIds(assessmentId), [c1]);

    const count = assignCandidatesToAssessment(assessmentId, [c2, c3], adminId);
    assert.equal(count, 2);
    assert.deepEqual(listAssignedCandidateIds(assessmentId).sort(), [c1, c2, c3].sort());
  });

  test("unassignCandidateFromAssessment retire un candidat non-commencé, mais refuse s'il a déjà une tentative", async () => {
    const { adminId, groupId, c1, c2, createAssessmentDraft, publishAssessment, listAssignedCandidateIds } = await setupFixture();
    const { unassignCandidateFromAssessment } = await import("../../lib/assessments");
    const { startAttempt } = await import("../../lib/attempts");
    const assessmentId = createAssessmentDraft({ type: "examen", name: "Ex Unassign", functionCode: "7.1", groupId, questionSource: "random", questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId });
    publishAssessment(assessmentId, adminId, { candidateUserIds: [c1, c2] });

    unassignCandidateFromAssessment(assessmentId, c1, adminId);
    assert.deepEqual(listAssignedCandidateIds(assessmentId), [c2]);

    startAttempt(assessmentId, c2, {});
    assert.throws(() => unassignCandidateFromAssessment(assessmentId, c2, adminId), /tentative/i);
    assert.deepEqual(listAssignedCandidateIds(assessmentId), [c2], "c2 doit rester affecté — le retrait a été refusé");
  });
});
