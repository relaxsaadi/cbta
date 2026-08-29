import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — filtres de /users
// (§7/§28) et résumé EXAMENS de la fiche candidat (§30).
describe("Liste filtrable des utilisateurs + résumé examens (mission COMPLETE USER MANAGEMENT)", async () => {
  before(() => setupTestDb());

  const { createUser, createUserPendingActivation, archiveUser } = await import("../../lib/users");
  const { listUsers, getExamSummary } = await import("../../lib/user-directory");
  const { assignFunctionToUser } = await import("../../lib/user-functions");
  const { addUserToGroup } = await import("../../lib/user-affiliation");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { startAttempt, submitAttempt } = await import("../../lib/attempts");

  let counter = 0;
  function tag() {
    counter += 1;
    return `dir${counter}`;
  }

  test("le filtre de statut par défaut exclut les comptes archivés ; status:'all' les inclut ; status:'archived' les isole", () => {
    const t = tag();
    const activeId = createUser({ username: `${t}.active`, password: "x".repeat(10), fullName: "Actif Dir", role: "candidate" });
    const archivedId = createUser({ username: `${t}.archived`, password: "x".repeat(10), fullName: "Archivé Dir", role: "candidate" });
    archiveUser(archivedId);

    const defaultList = listUsers({ userIdsOrNull: null, search: t });
    const defaultIds = defaultList.map((u) => u.id);
    assert.ok(defaultIds.includes(activeId));
    assert.ok(!defaultIds.includes(archivedId), "la vue par défaut exclut les comptes archivés");

    const allList = listUsers({ userIdsOrNull: null, status: "all", search: t });
    assert.ok(allList.map((u) => u.id).includes(archivedId));

    const archivedOnly = listUsers({ userIdsOrNull: null, status: "archived", search: t });
    assert.deepEqual(archivedOnly.map((u) => u.id), [archivedId]);
  });

  test("le filtre candidateType isole particulier vs entreprise", () => {
    const t = tag();
    const particulierId = createUser({ username: `${t}.p`, password: "x".repeat(10), fullName: "Particulier Dir", role: "candidate", candidateType: "particulier" });
    const entrepriseId = createUser({ username: `${t}.e`, password: "x".repeat(10), fullName: "Entreprise Dir", role: "candidate", candidateType: "entreprise" });

    const particuliers = listUsers({ userIdsOrNull: null, candidateType: "particulier", search: t });
    assert.deepEqual(particuliers.map((u) => u.id), [particulierId]);

    const entreprises = listUsers({ userIdsOrNull: null, candidateType: "entreprise", search: t });
    assert.deepEqual(entreprises.map((u) => u.id), [entrepriseId]);
  });

  test("les filtres companyId/groupId/functionCode isolent correctement via les tables réelles (group_members/user_functions)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const inGroupId = createUser({ username: `${t}.in`, password: "x".repeat(10), fullName: "Dans Groupe", role: "candidate" });
    const outGroupId = createUser({ username: `${t}.out`, password: "x".repeat(10), fullName: "Hors Groupe", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addUserToGroup(inGroupId, groupId, adminId);
    assignFunctionToUser(inGroupId, "7.6", adminId);

    const byCompany = listUsers({ userIdsOrNull: null, companyId, search: t });
    assert.deepEqual(byCompany.map((u) => u.id), [inGroupId]);

    const byGroup = listUsers({ userIdsOrNull: null, groupId, search: t });
    assert.deepEqual(byGroup.map((u) => u.id), [inGroupId]);

    const byFunction = listUsers({ userIdsOrNull: null, functionCode: "7.6", search: t });
    assert.deepEqual(byFunction.map((u) => u.id), [inGroupId]);

    const allSearch = listUsers({ userIdsOrNull: null, search: t });
    assert.ok(allSearch.map((u) => u.id).includes(outGroupId), "le candidat hors groupe reste visible sans filtre groupe/entreprise");
  });

  test("la recherche (nom/identifiant/email) est insensible à la casse", () => {
    const t = tag();
    createUser({ username: `${t}.searchme`, password: "x".repeat(10), fullName: "Rechercher Moi", role: "candidate", email: `${t}.search@example.com` });
    const byName = listUsers({ userIdsOrNull: null, search: "RECHERCHER MOI" });
    assert.equal(byName.length, 1);
    const byEmail = listUsers({ userIdsOrNull: null, search: `${t}.SEARCH@EXAMPLE.COM` });
    assert.equal(byEmail.length, 1);
  });

  test("userIdsOrNull vide (périmètre tenant vide) retourne une liste vide, jamais une erreur ni tous les comptes", () => {
    const rows = listUsers({ userIdsOrNull: [] });
    assert.deepEqual(rows, []);
  });

  test("getExamSummary() compte affectations/tentatives terminées/réussites sans jamais recalculer un score", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addUserToGroup(candidateId, groupId, adminId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-1`,
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q",
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen",
      name: `Examen ${t}`,
      functionCode: "7.1",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 50,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [candidateId], adminId);

    const before = getExamSummary(candidateId);
    assert.equal(before.assessments_assigned, 1);
    assert.equal(before.attempts_completed, 0);
    assert.equal(before.attempts_passed, 0);

    const attempt = startAttempt(assessmentId, candidateId, {});
    submitAttempt(attempt.id, candidateId);

    const after = getExamSummary(candidateId);
    assert.equal(after.assessments_assigned, 1);
    assert.equal(after.attempts_completed, 1);
  });
});
