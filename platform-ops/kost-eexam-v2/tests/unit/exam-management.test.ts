import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §27-29 —
// listAssessmentsWithFilters (isolation par dimension de filtre) et
// getAssignmentStatsByAssessment (répartition opérationnelle, calculée en
// UNE requête agrégée — jamais un test qui se contente de "ça ne plante
// pas", chaque case du tableau est vérifiée explicitement).
describe("Aperçu opérationnel des examens (lib/assessments.ts §27-29)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment, listAssessmentsWithFilters, getAssignmentStatsByAssessment } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { submitManualGrade, finalizeManualGradingIfComplete } = await import("../../lib/manual-grading");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `em${counter}`;
  }

  test("listAssessmentsWithFilters — companyId/groupId/functionCode/status/type/search isolent correctement", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const companyA = createCompany({ name: `Co A ${t}`, scope: "test", createdBy: adminId });
    const companyB = createCompany({ name: `Co B ${t}`, scope: "test", createdBy: adminId });
    const groupA = createGroup({ companyId: companyA, name: `GA ${t}`, scope: "test", createdBy: adminId });
    const groupB = createGroup({ companyId: companyB, name: `GB ${t}`, scope: "test", createdBy: adminId });
    const qA = createQuestion({ kostQuestionId: `TEST-${t}-a`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId });
    const qB = createQuestion({ kostQuestionId: `TEST-${t}-b`, functionCode: "7.2", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId });

    const assessmentA = createAssessmentDraft({ type: "examen", name: `Examen unique ${t}`, functionCode: "7.1", groupId: groupA, questionSource: "manual", manualQuestionIds: [qA], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId });
    const assessmentB = createAssessmentDraft({ type: "test", name: `Test différent ${t}`, functionCode: "7.2", groupId: groupB, questionSource: "manual", manualQuestionIds: [qB], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId });

    assert.equal(listAssessmentsWithFilters({ companyId: companyA }).some((a) => a.id === assessmentA), true);
    assert.equal(listAssessmentsWithFilters({ companyId: companyA }).some((a) => a.id === assessmentB), false);

    assert.equal(listAssessmentsWithFilters({ groupId: groupB }).every((a) => a.id !== assessmentA), true);

    assert.equal(listAssessmentsWithFilters({ functionCode: "7.1" }).some((a) => a.id === assessmentA), true);
    assert.equal(listAssessmentsWithFilters({ functionCode: "7.1" }).some((a) => a.id === assessmentB), false);

    assert.equal(listAssessmentsWithFilters({ status: "draft" }).some((a) => a.id === assessmentA), true);
    assert.equal(listAssessmentsWithFilters({ status: "published" }).some((a) => a.id === assessmentA), false, "un examen en brouillon ne doit jamais apparaître dans le filtre status=published");

    assert.equal(listAssessmentsWithFilters({ type: "test" }).some((a) => a.id === assessmentB), true);
    assert.equal(listAssessmentsWithFilters({ type: "test" }).some((a) => a.id === assessmentA), false);

    assert.equal(listAssessmentsWithFilters({ search: "unique" }).some((a) => a.id === assessmentA), true);
    assert.equal(listAssessmentsWithFilters({ search: "unique" }).some((a) => a.id === assessmentB), false);
  });

  test("listAssessmentsWithFilters — restrictToManagerUserId (frontière multi-client) exclut un examen géré par un AUTRE responsable, même sans autre filtre", () => {
    const t = tag();
    const managerA = createUser({ username: `${t}.mgrA`, password: "x".repeat(10), fullName: "Manager A", role: "pedagogical_manager" });
    const managerB = createUser({ username: `${t}.mgrB`, password: "x".repeat(10), fullName: "Manager B", role: "pedagogical_manager" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: managerA });
    const groupA = createGroup({ companyId, name: `GA ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: managerA });
    const groupB = createGroup({ companyId, name: `GB ${t}`, scope: "test", pedagogicalManagerId: managerB, createdBy: managerB });
    const q = createQuestion({ kostQuestionId: `TEST-${t}-mgr`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: managerA });
    const assessmentUnderB = createAssessmentDraft({ type: "examen", name: `Examen géré par B ${t}`, functionCode: "7.1", groupId: groupB, questionSource: "manual", manualQuestionIds: [q], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: managerB });

    assert.equal(listAssessmentsWithFilters({}, managerA).some((a) => a.id === assessmentUnderB), false, "le périmètre du responsable A ne doit jamais inclure un examen géré par B");
    assert.equal(listAssessmentsWithFilters({}, managerB).some((a) => a.id === assessmentUnderB), true);
    void groupA;
  });

  test("getAssignmentStatsByAssessment — répartition exacte : non commencé / en cours / soumis (attente correction + résultat disponible)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", createdBy: adminId });

    // 4 candidats : jamais commencé / en cours / soumis+en attente de
    // correction manuelle / soumis+résultat disponible (auto-noté).
    const cNotStarted = createUser({ username: `${t}.c1`, password: "x".repeat(10), fullName: "C1", role: "candidate" });
    const cInProgress = createUser({ username: `${t}.c2`, password: "x".repeat(10), fullName: "C2", role: "candidate" });
    const cAwaiting = createUser({ username: `${t}.c3`, password: "x".repeat(10), fullName: "C3", role: "candidate" });
    const cResultAvailable = createUser({ username: `${t}.c4`, password: "x".repeat(10), fullName: "C4", role: "candidate" });
    for (const c of [cNotStarted, cInProgress, cAwaiting, cResultAvailable]) addCandidateToGroup(groupId, c, adminId);

    const mcqId = createQuestion({ kostQuestionId: `TEST-${t}-mcq`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Q1", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId });
    const manualId = createQuestion({ kostQuestionId: `TEST-${t}-man`, functionCode: "7.1", qtype: "short_answer", sourceStatus: "FROZEN_SOURCE_VERIFIED", stem: "Expliquez.", choices: [], correctAnswer: { mode: "manual" }, createdBy: adminId });

    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen stats ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [mcqId, manualId], questionCount: 2, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), closeAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [cNotStarted, cInProgress, cAwaiting, cResultAvailable], adminId);

    function attemptQuestionIds(attemptId: number) {
      return getDb().prepare(`SELECT id, snapshot_id FROM attempt_questions WHERE attempt_id = ? ORDER BY position`).all(attemptId) as { id: number; snapshot_id: number }[];
    }
    function findAqFor(attemptId: number, questionId: number) {
      const aqs = attemptQuestionIds(attemptId);
      for (const aq of aqs) {
        const snap = getDb().prepare(`SELECT question_id FROM assessment_question_snapshots WHERE id = ?`).get(aq.snapshot_id) as { question_id: number };
        if (snap.question_id === questionId) return aq.id;
      }
      throw new Error("not found");
    }

    // cNotStarted : aucune tentative.

    // cInProgress : démarre, jamais soumis.
    startAttempt(assessmentId, cInProgress, {});

    // cAwaiting : soumet, mais la question manuelle reste EN ATTENTE.
    const attemptAwaiting = startAttempt(assessmentId, cAwaiting, {});
    saveAnswer(attemptAwaiting.id, cAwaiting, findAqFor(attemptAwaiting.id, mcqId), ["A"]);
    submitAttempt(attemptAwaiting.id, cAwaiting);

    // cResultAvailable : soumet ET la question manuelle est corrigée ->
    // résultat COMPLETE.
    const attemptDone = startAttempt(assessmentId, cResultAvailable, {});
    saveAnswer(attemptDone.id, cResultAvailable, findAqFor(attemptDone.id, mcqId), ["A"]);
    saveAnswer(attemptDone.id, cResultAvailable, findAqFor(attemptDone.id, manualId), ["une réponse"]);
    submitAttempt(attemptDone.id, cResultAvailable);
    // submitManualGrade() seul ne clôture jamais le résultat — c'est
    // finalizeManualGradingIfComplete() (appelée séparément par l'action
    // serveur réelle, app/(app)/grading/actions.ts::gradeAnswerAction)
    // qui fait réellement passer grading_state à COMPLETE une fois plus
    // rien en attente. Sans cet appel, ce candidat resterait à tort
    // "AWAITING_MANUAL_REVIEW" — bug de FIXTURE trouvé en écrivant ce test
    // (jamais un bug du code de production), corrigé ici.
    submitManualGrade(findAqFor(attemptDone.id, manualId), true, adminId, "administrator");
    finalizeManualGradingIfComplete(attemptDone.id);

    const stats = getAssignmentStatsByAssessment().get(assessmentId)!;
    assert.equal(stats.assigned, 4);
    assert.equal(stats.notStarted, 1);
    assert.equal(stats.inProgress, 1);
    assert.equal(stats.awaitingCorrection, 1);
    assert.equal(stats.resultsAvailable, 1);
    assert.equal(stats.submittedTotal, 2, "submittedTotal = awaitingCorrection + resultsAvailable (2 candidats ont réellement soumis)");
  });
});
