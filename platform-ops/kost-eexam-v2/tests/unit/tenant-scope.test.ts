import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

// Frontière multi-client (lib/tenant-scope.ts) — trouvée absente à l'audit
// pré-auditeur : le modèle de données portait déjà l'assignation
// (groups.pedagogical_manager_id, companies.created_by) mais rien ne la
// faisait respecter. Ces tests exercent directement les fonctions du
// module (niveau serveur, pas d'UI), avec DEUX responsables distincts
// gérant chacun leur propre client — exactement le scénario "Company A" /
// "Company B" de la revue pré-auditeur.
describe("Isolation multi-client (§ frontière d'autorisation)", () => {
  test("un responsable ne peut lire/écrire que sur son propre client, groupe, évaluation, tentative", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion, addQuestionVersion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { startAttempt, submitAttempt } = await import("../../lib/attempts");
    const {
      hasCompanyAccess,
      hasGroupAccess,
      hasAssessmentAccess,
      hasAttemptAccess,
      scopedGroupIdsOrNull,
      getManagedGroupIds,
    } = await import("../../lib/tenant-scope");
    const { listResults } = await import("../../lib/results");

    // Un admin pour créer le contenu partagé (banque de questions).
    const adminId = createUser({ username: "admin.tenant", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const questionId = createQuestion({
      kostQuestionId: "TEST-TENANT-1",
      functionCode: "7.1",
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Question test isolation",
      choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }],
      correctAnswer: ["A"],
      createdBy: adminId,
    });
    addQuestionVersion(questionId, { stem: "Question test isolation v2", choices: [{ key: "A", text: "Bonne" }, { key: "B", text: "Mauvaise" }], correctAnswer: ["A"] }, adminId);

    // Deux responsables, deux clients, complètement séparés.
    const managerAId = createUser({ username: "resp.a", password: "x".repeat(10), fullName: "Responsable A", role: "pedagogical_manager" });
    const managerBId = createUser({ username: "resp.b", password: "x".repeat(10), fullName: "Responsable B", role: "pedagogical_manager" });

    const companyAId = createCompany({ name: "Company A — TEST", scope: "test", createdBy: managerAId });
    const companyBId = createCompany({ name: "Company B — TEST", scope: "test", createdBy: managerBId });

    const groupAId = createGroup({ companyId: companyAId, name: "Groupe A", scope: "test", pedagogicalManagerId: managerAId, createdBy: managerAId });
    const groupBId = createGroup({ companyId: companyBId, name: "Groupe B", scope: "test", pedagogicalManagerId: managerBId, createdBy: managerBId });

    const candidateAId = createUser({ username: "cand.a", password: "x".repeat(10), fullName: "Candidat A", role: "candidate" });
    const candidateBId = createUser({ username: "cand.b", password: "x".repeat(10), fullName: "Candidat B", role: "candidate" });
    addCandidateToGroup(groupAId, candidateAId, managerAId);
    addCandidateToGroup(groupBId, candidateBId, managerBId);

    const assessmentAId = createAssessmentDraft({
      type: "examen", name: "Examen A", functionCode: "7.1", groupId: groupAId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: managerAId,
    });
    publishAssessment(assessmentAId, managerAId);
    const assessmentBId = createAssessmentDraft({
      type: "examen", name: "Examen B", functionCode: "7.1", groupId: groupBId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: managerBId,
    });
    publishAssessment(assessmentBId, managerBId);

    const attemptA = startAttempt(assessmentAId, candidateAId, {});
    submitAttempt(attemptA.id, candidateAId, { auto: false });
    const attemptB = startAttempt(assessmentBId, candidateBId, {});
    submitAttempt(attemptB.id, candidateBId, { auto: false });

    const sessA = { userId: managerAId, role: "pedagogical_manager" as const };
    const sessB = { userId: managerBId, role: "pedagogical_manager" as const };
    const sessAdmin = { userId: adminId, role: "administrator" as const };
    const sessAuditor = { userId: adminId, role: "auditor" as const };

    // --- Chacun voit/accède à SON PROPRE périmètre ---
    assert.equal(hasCompanyAccess(sessA, companyAId), true);
    assert.equal(hasGroupAccess(sessA, groupAId), true);
    assert.equal(hasAssessmentAccess(sessA, assessmentAId), true);
    assert.equal(hasAttemptAccess(sessA, attemptA.id), true);

    // --- A ne peut RIEN faire sur le périmètre de B ---
    assert.equal(hasCompanyAccess(sessA, companyBId), false, "A ne doit pas accéder au client B");
    assert.equal(hasGroupAccess(sessA, groupBId), false, "A ne doit pas accéder au groupe B");
    assert.equal(hasAssessmentAccess(sessA, assessmentBId), false, "A ne doit pas accéder à l'évaluation B");
    assert.equal(hasAttemptAccess(sessA, attemptB.id), false, "A ne doit pas accéder à la tentative B");

    // --- Et symétriquement, B ne peut rien faire sur le périmètre de A ---
    assert.equal(hasCompanyAccess(sessB, companyAId), false, "B ne doit pas accéder au client A");
    assert.equal(hasGroupAccess(sessB, groupAId), false, "B ne doit pas accéder au groupe A");
    assert.equal(hasAssessmentAccess(sessB, assessmentAId), false, "B ne doit pas accéder à l'évaluation A");
    assert.equal(hasAttemptAccess(sessB, attemptA.id), false, "B ne doit pas accéder à la tentative A");

    // --- Administrateur : accès global des deux côtés ---
    assert.equal(hasCompanyAccess(sessAdmin, companyAId), true);
    assert.equal(hasCompanyAccess(sessAdmin, companyBId), true);
    assert.equal(hasAttemptAccess(sessAdmin, attemptA.id), true);
    assert.equal(hasAttemptAccess(sessAdmin, attemptB.id), true);

    // --- Auditeur : lecture globale des deux côtés (jamais d'écriture —
    // garanti ailleurs par requireWriteRole, hors périmètre de ce module) ---
    assert.equal(hasCompanyAccess(sessAuditor, companyAId), true);
    assert.equal(hasCompanyAccess(sessAuditor, companyBId), true);
    assert.equal(hasAttemptAccess(sessAuditor, attemptA.id), true);
    assert.equal(hasAttemptAccess(sessAuditor, attemptB.id), true);

    // --- scopedGroupIdsOrNull : la primitive utilisée pour restreindre les
    // LISTES (résultats, exports CSV) ---
    assert.deepEqual(scopedGroupIdsOrNull(sessA), [groupAId]);
    assert.deepEqual(scopedGroupIdsOrNull(sessB), [groupBId]);
    assert.equal(scopedGroupIdsOrNull(sessAdmin), null, "administrateur : aucune restriction");
    assert.equal(scopedGroupIdsOrNull(sessAuditor), null, "auditeur : aucune restriction");
    assert.deepEqual(getManagedGroupIds(managerAId), [groupAId]);

    // --- listResults() avec restriction : la preuve bout-en-bout de la
    // frontière, y compris quand un ID hors périmètre est PASSÉ EN PLUS
    // (simule un ?companyId=<autre client> forgé côté client — les deux
    // clauses s'appliquent en ET, pas en OU). ---
    const resultsForA = listResults({ restrictToGroupIds: scopedGroupIdsOrNull(sessA) ?? undefined });
    assert.equal(resultsForA.length, 1);
    assert.equal(resultsForA[0]!.candidate_user_id, candidateAId);

    const resultsForAForcingCompanyB = listResults({
      companyId: companyBId, // tentative de contournement via le paramètre client
      restrictToGroupIds: scopedGroupIdsOrNull(sessA) ?? undefined,
    });
    assert.equal(resultsForAForcingCompanyB.length, 0, "forcer companyId=B ne doit rien renvoyer pour le responsable A");

    // Un responsable sans AUCUN groupe géré doit voir une liste vide, pas
    // "tout" — le court-circuit tableau-vide de listResults().
    const managerCId = createUser({ username: "resp.c.nogroup", password: "x".repeat(10), fullName: "Responsable C", role: "pedagogical_manager" });
    const sessC = { userId: managerCId, role: "pedagogical_manager" as const };
    assert.deepEqual(scopedGroupIdsOrNull(sessC), []);
    const resultsForC = listResults({ restrictToGroupIds: scopedGroupIdsOrNull(sessC) ?? undefined });
    assert.equal(resultsForC.length, 0);
  });
});
