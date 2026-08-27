import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

// Addendum §9-11 — preuve précise, au niveau bibliothèque, de la règle de
// continuité d'examen : le blocage des nouvelles tentatives (mode
// maintenance ou blocage dédié) ne doit JAMAIS interrompre une tentative
// DÉJÀ en cours, et doit rejeter le démarrage d'une NOUVELLE tentative
// avec un message clair. La preuve bout-en-bout (bannière visible, refus
// de connexion sauf administrateur) est couverte séparément sur staging
// réel — voir tests/staging/17-incident-platform-actions.spec.ts.
describe("Continuité d'examen sous blocage plateforme (addendum §9-11)", () => {
  after(async () => {
    // Ne laisse jamais un blocage actif fuiter vers un autre fichier de
    // test partageant la même base (setupTestDb() par processus, mais par
    // discipline explicite).
    const { setPlatformSetting } = await import("../../lib/platform-settings");
    setPlatformSetting("block_new_attempts", false, { id: 1, role: "administrator" });
    setPlatformSetting("maintenance_mode", false, { id: 1, role: "administrator" });
  });

  test("bloquer les nouvelles tentatives n'interrompt jamais une tentative déjà en cours, mais rejette un nouveau démarrage", async () => {
    const { createUser } = await import("../../lib/users");
    const { createCompany } = await import("../../lib/companies");
    const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
    const { createQuestion } = await import("../../lib/questions");
    const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
    const { startAttempt, AttemptError } = await import("../../lib/attempts");
    const { setPlatformSetting, isNewAttemptsBlocked } = await import("../../lib/platform-settings");

    const adminId = createUser({ username: "admin.cont", password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const cand1 = createUser({ username: "cand.cont1", password: "x".repeat(10), fullName: "Candidat déjà en cours", role: "candidate" });
    const cand2 = createUser({ username: "cand.cont2", password: "x".repeat(10), fullName: "Candidat pas encore démarré", role: "candidate" });
    const companyId = createCompany({ name: "Co-cont", scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: "G-cont", scope: "test", createdBy: adminId });
    addCandidateToGroup(groupId, cand1, adminId);
    addCandidateToGroup(groupId, cand2, adminId);
    createQuestion({
      kostQuestionId: "TEST-CONT-1", functionCode: "7.5", qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "Q", choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: adminId,
    });
    const assessmentId = createAssessmentDraft({
      type: "examen", name: "Examen continuité", functionCode: "7.5", groupId, questionSource: "random",
      questionCount: 1, durationMinutes: 30, passThresholdPct: 80, scope: "test", createdBy: adminId,
    });
    publishAssessment(assessmentId, adminId);

    // cand1 démarre AVANT tout blocage — tentative légitimement en cours.
    const attemptBeforeBlock = startAttempt(assessmentId, cand1, {});
    assert.equal(attemptBeforeBlock.status, "in_progress");

    // Active le blocage des nouvelles tentatives.
    setPlatformSetting("block_new_attempts", true, { id: adminId, role: "administrator" });
    assert.equal(isNewAttemptsBlocked(), true);

    // cand1 (déjà en cours) : startAttempt() renvoie la MÊME tentative,
    // sans erreur — jamais interrompue.
    const attemptDuringBlock = startAttempt(assessmentId, cand1, {});
    assert.equal(attemptDuringBlock.id, attemptBeforeBlock.id, "la tentative en cours doit rester accessible, jamais interrompue par le blocage");
    assert.equal(attemptDuringBlock.status, "in_progress");

    // cand2 (pas encore démarré) : rejeté avec un message clair.
    assert.throws(
      () => startAttempt(assessmentId, cand2, {}),
      (err: unknown) => err instanceof AttemptError && /nouvelles tentatives est temporairement suspendu/.test((err as Error).message),
      "une NOUVELLE tentative doit être rejetée pendant le blocage, avec un message explicite"
    );

    // Débloque : cand2 peut maintenant démarrer normalement.
    setPlatformSetting("block_new_attempts", false, { id: adminId, role: "administrator" });
    const attemptAfterUnblock = startAttempt(assessmentId, cand2, {});
    assert.equal(attemptAfterUnblock.status, "in_progress");
  });

  test("le mode maintenance implique le blocage des nouvelles tentatives (sans activer le blocage dédié séparément)", async () => {
    const { setPlatformSetting, isNewAttemptsBlocked, getPlatformSetting } = await import("../../lib/platform-settings");
    setPlatformSetting("maintenance_mode", true, { id: 1, role: "administrator" });
    assert.equal(isNewAttemptsBlocked(), true, "le mode maintenance doit impliquer le blocage des nouvelles tentatives");
    assert.equal(getPlatformSetting("block_new_attempts"), false, "sans activer le flag dédié séparément — implication logique, pas une écriture croisée");
    setPlatformSetting("maintenance_mode", false, { id: 1, role: "administrator" });
    assert.equal(isNewAttemptsBlocked(), false);
  });
});
