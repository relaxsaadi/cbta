import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — §51, tests A-I sur
// l'affiliation client/groupe. L'entreprise d'un candidat est TOUJOURS
// dérivée de son appartenance à un/des groupe(s) (group_members ->
// groups.company_id) — décision d'architecture délibérée, voir
// lib/user-affiliation.ts pour la justification complète.
describe("Affiliation client/groupe (mission COMPLETE USER MANAGEMENT §22-24)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserById } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup, listGroupMembers } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const {
    listCandidateGroups,
    getPrimaryCompanyContext,
    hasProtectedGroupHistory,
    addUserToGroup,
    removeUserFromGroupSafely,
    changeUserGroup,
    AffiliationError,
  } = await import("../../lib/user-affiliation");

  let counter = 0;
  function tag() {
    counter += 1;
    return `aff${counter}`;
  }

  function makeCompanyAndGroup(t: string, adminId: number) {
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    return { companyId, groupId };
  }

  // --- A. addUserToGroup() affecte réellement + bascule candidate_type vers 'entreprise' ---
  test("A — affecter un candidat 'particulier' à un groupe le rattache réellement et bascule son type vers 'entreprise'", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate", candidateType: "particulier" });
    const { groupId } = makeCompanyAndGroup(t, adminId);

    addUserToGroup(candidateId, groupId, adminId);

    assert.equal(listCandidateGroups(candidateId).length, 1);
    assert.equal(findUserById(candidateId)!.candidate_type, "entreprise");
  });

  // --- B. Multi-groupe déjà supporté — un candidat peut appartenir à PLUSIEURS groupes simultanément ---
  test("B — un candidat peut être affecté à plusieurs groupes simultanément (multi-groupe)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId: g1 } = makeCompanyAndGroup(`${t}a`, adminId);
    const { groupId: g2 } = makeCompanyAndGroup(`${t}b`, adminId);

    addUserToGroup(candidateId, g1, adminId);
    addUserToGroup(candidateId, g2, adminId);

    const groups = listCandidateGroups(candidateId);
    assert.equal(groups.length, 2);
    assert.deepEqual(groups.map((g) => g.group_id).sort(), [g1, g2].sort());
  });

  // --- C. Ajout idempotent — ajouter deux fois au MÊME groupe ne duplique rien, ne lève pas ---
  test("C — affecter deux fois au même groupe est idempotent (INSERT OR IGNORE, jamais de doublon/erreur)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId } = makeCompanyAndGroup(t, adminId);

    addUserToGroup(candidateId, groupId, adminId);
    addUserToGroup(candidateId, groupId, adminId);

    assert.equal(listGroupMembers(groupId).length, 1);
  });

  // --- D. addUserToGroup() sur un groupe inexistant lève AffiliationError, n'affecte rien ---
  test("D — affecter à un groupe inexistant lève AffiliationError", () => {
    const t = tag();
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    assert.throws(() => addUserToGroup(candidateId, 999999, candidateId), AffiliationError);
  });

  // --- E. hasProtectedGroupHistory() est true dès qu'une affectation d'examen existe sous ce groupe ---
  test("E — hasProtectedGroupHistory() détecte une affectation d'examen sous ce groupe précis", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId } = makeCompanyAndGroup(t, adminId);
    addCandidateToGroup(groupId, candidateId, adminId);

    assert.equal(hasProtectedGroupHistory(candidateId, groupId), false, "avant toute affectation : pas d'historique protégé");

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
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [candidateId], adminId);

    assert.equal(hasProtectedGroupHistory(candidateId, groupId), true, "après affectation : historique protégé détecté");
  });

  // --- F. removeUserFromGroupSafely() BLOQUE le retrait quand un historique protégé existe, message explicite, membership INCHANGÉE ---
  test("F — retirer un candidat d'un groupe avec historique protégé est BLOQUÉ, la relation reste intacte", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId } = makeCompanyAndGroup(t, adminId);
    addCandidateToGroup(groupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-2`,
      functionCode: "7.2",
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
      functionCode: "7.2",
      groupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [candidateId], adminId);

    const result = removeUserFromGroupSafely(candidateId, groupId);
    assert.equal(result.removed, false);
    assert.ok(result.blockedReason && result.blockedReason.length > 0);
    assert.equal(listCandidateGroups(candidateId).length, 1, "la relation group_members doit rester intacte");
  });

  // --- G. removeUserFromGroupSafely() réussit sur un groupe sans historique ---
  test("G — retirer un candidat d'un groupe SANS historique réussit réellement", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId } = makeCompanyAndGroup(t, adminId);
    addUserToGroup(candidateId, groupId, adminId);

    const result = removeUserFromGroupSafely(candidateId, groupId);
    assert.equal(result.removed, true);
    assert.equal(listCandidateGroups(candidateId).length, 0);
  });

  // --- H. changeUserGroup() BLOQUE l'opération ENTIÈRE (rien n'est ajouté non plus) si l'ancien groupe est protégé ---
  test("H — changer de groupe est bloqué ENTIÈREMENT (aucun ajout au nouveau groupe non plus) si l'ancien porte un historique protégé", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { groupId: oldGroupId } = makeCompanyAndGroup(`${t}old`, adminId);
    const { groupId: newGroupId } = makeCompanyAndGroup(`${t}new`, adminId);
    addCandidateToGroup(oldGroupId, candidateId, adminId);
    createQuestion({
      kostQuestionId: `TEST-${t.toUpperCase()}-3`,
      functionCode: "7.3",
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
      functionCode: "7.3",
      groupId: oldGroupId,
      questionSource: "random",
      questionCount: 1,
      durationMinutes: 30,
      passThresholdPct: 80,
      scope: "test",
      createdBy: adminId,
      openAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      closeAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    publishAssessment(assessmentId, adminId);
    assignCandidatesToAssessment(assessmentId, [candidateId], adminId);

    const result = changeUserGroup(candidateId, oldGroupId, newGroupId, adminId);
    assert.equal(result.changed, false);
    assert.ok(result.blockedReason);
    const groups = listCandidateGroups(candidateId);
    assert.equal(groups.length, 1, "toujours dans l'ancien groupe uniquement");
    assert.equal(groups[0]!.group_id, oldGroupId, "jamais ajouté au nouveau groupe non plus (blocage total, pas partiel)");
  });

  // --- I. changeUserGroup() réussit (retrait + ajout) sur un groupe sans historique protégé ; getPrimaryCompanyContext() reflète le plus récent ---
  test("I — changer de groupe réussit sans historique protégé ; getPrimaryCompanyContext() reflète le groupe le plus récent", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const { companyId: oldCompanyId, groupId: oldGroupId } = makeCompanyAndGroup(`${t}old`, adminId);
    const { companyId: newCompanyId, groupId: newGroupId } = makeCompanyAndGroup(`${t}new`, adminId);
    addUserToGroup(candidateId, oldGroupId, adminId);

    const result = changeUserGroup(candidateId, oldGroupId, newGroupId, adminId);
    assert.equal(result.changed, true);

    const groups = listCandidateGroups(candidateId);
    assert.equal(groups.length, 1, "retiré de l'ancien, ajouté au nouveau — jamais les deux à la fois pour un vrai changement");
    assert.equal(groups[0]!.group_id, newGroupId);

    const primary = getPrimaryCompanyContext(candidateId);
    assert.equal(primary?.companyId, newCompanyId);
    assert.notEqual(primary?.companyId, oldCompanyId);
  });
});
