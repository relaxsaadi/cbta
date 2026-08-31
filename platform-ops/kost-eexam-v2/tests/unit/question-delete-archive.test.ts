import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §8-10/§34 — garanties de sécurité de la suppression/archivage de
// question (lib/questions.ts::isQuestionProtected/deleteQuestion/
// setQuestionActive). Deux garanties centrales testées ici :
//   1. Une question DÉJÀ PUBLIÉE (référencée par assessment_question_
//      snapshots) n'est JAMAIS supprimable définitivement — deleteQuestion
//      doit lever QuestionDeleteError, jamais silencieusement réussir ou
//      silencieusement échouer sans erreur.
//   2. Une question JAMAIS publiée est supprimable, et sa suppression ne
//      renumérote/n'affecte JAMAIS une autre question.
describe("Suppression/archivage de question — garanties de sécurité (lib/questions.ts)", async () => {
  before(() => setupTestDb());

  const { createUser } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion, getQuestionById, isQuestionProtected, deleteQuestion, setQuestionActive, QuestionDeleteError } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `qda${counter}`;
  }

  function makeAdminAndGroup() {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);
    return { t, adminId, candidateId, groupId };
  }

  test("question jamais publiée : isQuestionProtected=false, deleteQuestion() réussit, la ligne disparaît réellement", () => {
    const { t, adminId } = makeAdminAndGroup();
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-unused`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "DRAFT",
      stem: "Jamais publiée", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    assert.equal(isQuestionProtected(qId), false);
    deleteQuestion(qId);
    assert.equal(getQuestionById(qId), undefined, "la question doit avoir réellement disparu de la banque");
  });

  test("question publiée (référencée par assessment_question_snapshots) : isQuestionProtected=true, deleteQuestion() lève QuestionDeleteError, la ligne SURVIT", () => {
    const { t, adminId, groupId } = makeAdminAndGroup();
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-published`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Déjà publiée", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    assert.equal(isQuestionProtected(qId), true);
    assert.throws(() => deleteQuestion(qId), QuestionDeleteError);
    assert.ok(getQuestionById(qId), "une question protégée ne doit JAMAIS disparaître, même après une tentative de suppression");
  });

  test("supprimer une question retirée d'un brouillon (pool, jamais publié) ne renumérote/n'affecte jamais une autre question", () => {
    const { t, adminId, groupId } = makeAdminAndGroup();
    const qKeep = createQuestion({
      kostQuestionId: `TEST-${t}-keep`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Reste en banque", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const qDelete = createQuestion({
      kostQuestionId: `TEST-${t}-del`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "À supprimer", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    // Les deux sont dans le pool d'un brouillon JAMAIS publié — la ligne
    // assessment_question_pool doit être nettoyée sans faire échouer le
    // DELETE (contrainte FK, voir le commentaire de deleteQuestion()).
    createAssessmentDraft({
      type: "examen", name: `Brouillon ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qKeep, qDelete], questionCount: 2, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });

    deleteQuestion(qDelete);
    const keep = getQuestionById(qKeep)!;
    assert.equal(keep.id, qKeep, "l'id de la question conservée ne doit jamais changer");
    assert.equal(keep.kost_question_id, `TEST-${t}-keep`);
    assert.equal(getQuestionById(qDelete), undefined);
  });

  test("setQuestionActive() est réversible et ne touche jamais la ligne assessment_question_snapshots d'une question déjà publiée", () => {
    const { t, adminId, groupId } = makeAdminAndGroup();
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-archive`, functionCode: "7.1", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Archivable", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: `Examen ${t}`, functionCode: "7.1", groupId, questionSource: "manual",
      manualQuestionIds: [qId], questionCount: 1, durationMinutes: 30, passThresholdPct: 50, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);
    const snapshotCountBefore = (getDb().prepare(`SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE question_id = ?`).get(qId) as { n: number }).n;

    setQuestionActive(qId, false);
    assert.equal(getQuestionById(qId)!.active, 0);
    setQuestionActive(qId, true);
    assert.equal(getQuestionById(qId)!.active, 1);

    const snapshotCountAfter = (getDb().prepare(`SELECT COUNT(*) AS n FROM assessment_question_snapshots WHERE question_id = ?`).get(qId) as { n: number }).n;
    assert.equal(snapshotCountAfter, snapshotCountBefore, "archiver/réactiver ne doit jamais toucher l'historique déjà publié");
  });

  test("une question désactivée n'est plus admissible pour un tirage de production (isAdmissibleWhereClause)", async () => {
    const { countAdmissibleQuestions } = await import("../../lib/questions");
    const { t, adminId } = makeAdminAndGroup();
    const qId = createQuestion({
      kostQuestionId: `TEST-${t}-adm`, functionCode: "7.2", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Admissible puis désactivée", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const before = countAdmissibleQuestions("7.2");
    setQuestionActive(qId, false);
    assert.equal(countAdmissibleQuestions("7.2"), before - 1);
  });
});
