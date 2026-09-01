import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario Y — mission "URGENT AUDITOR FOLLOW-UP" (2026-08-31) §18 A-K.
// Comble une lacune réelle de couverture : les specs existantes
// (scenario-m/scenario-n) prouvent déjà que l'ADMINISTRATEUR peut corriger
// une réponse courte/un scénario manuel, mais aucune spec ne prouvait
// jusqu'ici qu'un RESPONSABLE PÉDAGOGIQUE AUTORISÉ le peut aussi. Fixtures
// assemblées via les fonctions lib (jamais un contournement de l'UI pour
// la correction ELLE-MÊME, qui reste le vrai clic testé) — même discipline
// que scenario-t/scenario-x.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `y${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function setupPendingItems(functionCode: string) {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, getSessionReport } = await import("../../lib/assessments");
  const { startAttempt, saveAnswer, saveScenarioSubanswer, submitAttempt, getAttemptQuestions } = await import("../../lib/attempts");

  const t = uniqueTag();
  const admin = findUserByUsername("admin")!;
  const managerId = createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: `Responsable ${t}`, role: "pedagogical_manager" });
  const companyId = createCompany({ name: `Grading Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = createGroup({ companyId, name: `Grading Grp ${t}`, scope: "test", pedagogicalManagerId: managerId, createdBy: admin.id });
  const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: `Candidat ${t}`, role: "candidate" });
  addCandidateToGroup(groupId, candidateId, admin.id);

  const saId = createQuestion({
    kostQuestionId: `Q-${functionCode}-${t}-SA`,
    functionCode,
    qtype: "short_answer",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `[${t}] Question à correction manuelle.`,
    choices: [],
    correctAnswer: { mode: "manual" },
    createdBy: admin.id,
  });
  const scnId = createQuestion({
    kostQuestionId: `Q-${functionCode}-${t}-SCN`,
    functionCode,
    qtype: "scenario",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `[${t}] Scénario de test.`,
    choices: [],
    correctAnswer: {
      mode: "scenario",
      context: "Contexte de test.",
      subquestions: [{ id: "sq1", qtype: "short_answer", stem: "Sous-question manuelle.", points: 1, choices: [], correctAnswer: { mode: "manual" } }],
    },
    createdBy: admin.id,
  });

  const assessmentId = createAssessmentDraft({
    type: "test",
    name: `Grading Exam ${t}`,
    functionCode,
    groupId,
    questionSource: "manual",
    manualQuestionIds: [saId, scnId],
    questionCount: 2,
    durationMinutes: 30,
    passThresholdPct: 80,
    scope: "test",
    createdBy: admin.id,
  });
  publishAssessment(assessmentId, admin.id, { candidateUserIds: [candidateId] });

  const attempt = startAttempt(assessmentId, candidateId, {});
  const questions = getAttemptQuestions(attempt.id);
  const saQ = questions.find((q) => q.qtype === "short_answer")!;
  const scnQ = questions.find((q) => q.qtype === "scenario")!;
  saveAnswer(attempt.id, candidateId, saQ.attempt_question_id, ["Réponse candidat test — réponse courte."]);
  saveScenarioSubanswer(attempt.id, candidateId, scnQ.attempt_question_id, "sq1", ["Réponse candidat test — sous-question de scénario."]);
  submitAttempt(attempt.id, candidateId);

  return {
    t,
    managerUsername: `${t}.mgr`,
    candidateUsername: `${t}.cand`,
    candidateName: `Candidat ${t}`,
    assessmentId,
    assessmentName: `Grading Exam ${t}`,
    getPendingRow: () => getSessionReport(assessmentId).rows.find((r) => r.candidate_user_id === candidateId),
  };
}

test.describe.configure({ mode: "serial" });

test("§18 C/D — le responsable pédagogique AUTORISÉ corrige la réponse courte ET le scénario dans son propre périmètre", async ({ page }) => {
  const { managerUsername, candidateName } = await setupPendingItems("7.5");

  await loginAs(page, managerUsername, "x".repeat(10));
  await page.goto("/grading");
  // .last() plutôt que .first() : le premier élément DOM contenant ce nom
  // est l'<option> (cachée) du filtre "Candidat" au-dessus des cartes en
  // attente — jamais la carte elle-même, vérifiée plus précisément juste
  // en dessous via shortCard/scnCard.
  await expect(page.getByText(candidateName).last()).toBeVisible();

  // Réponse courte — bouton "Correcte", file distincte de celle du scénario
  // (disambiguée par le libellé de la question elle-même, jamais par
  // assessmentName seul, qui apparaît aussi dans la carte du scénario).
  const shortCard = page
    .locator("div.rounded-md.border.border-border-subtle.p-3\\.5", { hasText: candidateName })
    .filter({ hasText: "Question à correction manuelle" })
    .first();
  await expect(shortCard).toBeVisible();
  await shortCard.getByRole("button", { name: "Correcte", exact: true }).click();
  await page.waitForURL(/\/grading\?graded=1/);

  // Sous-question de scénario — même écran.
  await page.goto("/grading");
  const scnCard = page
    .locator("div.rounded-md.border.border-border-subtle.p-3\\.5", { hasText: candidateName })
    .filter({ hasText: "Sous-question manuelle" })
    .first();
  await expect(scnCard).toBeVisible();
  await scnCard.getByRole("button", { name: "Correcte", exact: true }).click();
  await page.waitForURL(/\/grading\?graded=1&finalized=1/);
  await expect(page.getByText("Réponse corrigée — résultat finalisé et notifié.")).toBeVisible();
});

test("§18 E — un responsable d'un AUTRE périmètre (autre groupe/entreprise) ne voit PAS l'item en attente hors de son périmètre", async ({ page }) => {
  const { candidateName } = await setupPendingItems("7.6");
  const { createUser } = await import("../../lib/users");
  const t = uniqueTag();
  const outsiderUsername = `${t}.outmgr`;
  createUser({ username: outsiderUsername, password: "x".repeat(10), fullName: `Outsider Manager ${t}`, role: "pedagogical_manager" });

  await loginAs(page, outsiderUsername, "x".repeat(10));
  await page.goto("/grading");
  await expect(page.getByText(candidateName)).toHaveCount(0);
});

test("§18 F — l'auditeur ne peut pas corriger (aucun contrôle d'écriture affiché)", async ({ page }) => {
  const { candidateName, assessmentName } = await setupPendingItems("7.9");
  // Compte auditeur démo seedé par scripts/seed-demo.ts (global-setup.ts),
  // toujours présent dans la base e2e locale — jamais un compte deviné.
  await loginAs(page, "auditeur.demo", "ChangeMoi123!");
  await page.goto("/grading");
  await expect(page.getByText(candidateName).last()).toBeVisible();
  const card = page.locator("div.rounded-md.border.border-border-subtle.p-3\\.5", { hasText: assessmentName }).first();
  await expect(card.getByRole("button", { name: "Correcte", exact: true })).toHaveCount(0);
});

test("§18 G/K — un candidat ne peut ni ouvrir /grading ni télécharger le rapport global PDF", async ({ page }) => {
  const { candidateUsername, assessmentId } = await setupPendingItems("7.7");

  await loginAs(page, candidateUsername, "x".repeat(10));
  await page.goto("/grading");
  await page.waitForURL(/\/acces-refuse/);

  const resp = await page.request.get(`/api/reports/global-exam/${assessmentId}`);
  expect(resp.status()).toBe(403);
});

test("§18 I/J — le rapport global PDF est un PDF valide, et l'item non corrigé n'est jamais présenté comme RÉUSSITE/ÉCHEC", async ({ page }) => {
  const { managerUsername, assessmentId, getPendingRow } = await setupPendingItems("7.8");

  // §18 J — au moment où le PDF est généré, la ligne candidat est
  // "submitted" avec passed === null (jamais une mention fabriquée) :
  // vérifié directement sur la même source de données que le PDF
  // (getSessionReport(), jamais recalculée séparément).
  const pending = getPendingRow();
  expect(pending?.attempt_status === "submitted" || pending?.attempt_status === "auto_submitted").toBe(true);
  expect(pending?.passed).toBeNull();

  await loginAs(page, managerUsername, "x".repeat(10));
  const resp = await page.request.get(`/api/reports/global-exam/${assessmentId}`);
  expect(resp.status()).toBe(200);
  expect(resp.headers()["content-type"]).toContain("application/pdf");
  const buf = await resp.body();
  expect(buf.byteLength).toBeGreaterThan(1000);
  expect(buf.subarray(0, 4).toString("ascii")).toBe("%PDF");
});
