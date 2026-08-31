import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario W — mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF"
// (2026-08-31) §11-14/§8-10/§24-33 : "Tester la question" (rendu candidat
// réel, zéro écriture DB), suppression/archivage sûrs de question (§34),
// déclaration d'incident candidat (§37). Même discipline DB_PATH que
// scenario-q/scenario-r (voir leur commentaire d'en-tête) — fixtures créées
// directement via les fonctions lib (plus rapide/déterministe qu'un
// auteurage UI complet pour ces trois flux), le rendu/l'interaction
// eux-mêmes restent vérifiés via l'UI réelle.
process.env.DB_PATH = "./data/e2e-test.db";

const FUNCTION_CODE = "7.4";

function uniqueTag() {
  return `w${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion, isQuestionProtected } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  return { createUser, findUserByUsername, createCompany, createGroup, addCandidateToGroup, createQuestion, isQuestionProtected, createAssessmentDraft, publishAssessment, assignCandidatesToAssessment, getDb };
}

test.describe.configure({ mode: "serial" });

test("MODE TEST — rendu candidat réel, réponse correcte/incorrecte, ZÉRO écriture attempts/attempt_answers/results ; refusé au responsable pédagogique", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const manager = lib.createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: `Manager ${t}`, role: "pedagogical_manager" });

  const questionId = lib.createQuestion({
    kostQuestionId: `TEST-${t.toUpperCase()}-MODETEST`,
    functionCode: FUNCTION_CODE,
    qtype: "mcq_single",
    sourceStatus: "DRAFT",
    stem: `Question mode test ${t}`,
    choices: [{ key: "A", text: `Bonne réponse ${t}` }, { key: "B", text: `Mauvaise réponse ${t}` }],
    correctAnswer: ["A"],
    createdBy: admin.id,
  });

  function attemptsCount() {
    return (lib.getDb().prepare(`SELECT COUNT(*) AS n FROM attempts`).get() as { n: number }).n;
  }
  function resultsCount() {
    return (lib.getDb().prepare(`SELECT COUNT(*) AS n FROM results`).get() as { n: number }).n;
  }
  const before = { attempts: attemptsCount(), results: resultsCount() };

  await loginAs(page, "admin");
  await page.goto(`/question-bank/${questionId}/test`);
  await expect(page.getByText(/MODE TEST/)).toBeVisible();
  await expect(page.getByText(`Question mode test ${t}`)).toBeVisible();

  // Réponse correcte.
  await page.getByText(`Bonne réponse ${t}`, { exact: true }).click();
  await page.getByRole("button", { name: /vérifier ma réponse/i }).click();
  await expect(page.getByText(/^Correcte \(résultat test\)$/)).toBeVisible();

  // Réinitialiser puis réponse incorrecte.
  await page.getByRole("button", { name: /réinitialiser/i }).click();
  await page.getByText(`Mauvaise réponse ${t}`, { exact: true }).click();
  await page.getByRole("button", { name: /vérifier ma réponse/i }).click();
  await expect(page.getByText(/^Incorrecte \(résultat test\)$/)).toBeVisible();

  expect(attemptsCount()).toBe(before.attempts);
  expect(resultsCount()).toBe(before.results);

  // Responsable pédagogique — structurellement exclu (guardPage("administrator") seul).
  await logout(page);
  await loginAs(page, `${t}.mgr`, "x".repeat(10));
  await page.goto(`/question-bank/${questionId}/test`);
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});

test("SUPPRESSION/ARCHIVAGE — une question jamais publiée est supprimable ; une question publiée ne l'est jamais (archivage seul)", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const company = lib.createCompany({ name: `Co Delete ${t}`, scope: "test", createdBy: admin.id });
  const group = lib.createGroup({ companyId: company, name: `Grp Delete ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });
  const candidateForDelete = lib.createUser({ username: `${t}.canddel`, password: "x".repeat(10), fullName: `Candidat Delete ${t}`, role: "candidate" });
  lib.addCandidateToGroup(group, candidateForDelete, admin.id);

  const unusedQuestionId = lib.createQuestion({
    kostQuestionId: `TEST-${t.toUpperCase()}-UNUSED`, functionCode: FUNCTION_CODE, qtype: "mcq_single", sourceStatus: "DRAFT",
    stem: `Jamais publiée ${t}`, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: admin.id,
  });
  const publishedQuestionId = lib.createQuestion({
    kostQuestionId: `TEST-${t.toUpperCase()}-PUBLISHED`, functionCode: FUNCTION_CODE, qtype: "mcq_single", sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `Déjà publiée ${t}`, choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }], correctAnswer: ["A"], createdBy: admin.id,
  });
  const assessmentId = lib.createAssessmentDraft({
    type: "test", name: `Examen Delete ${t}`, functionCode: FUNCTION_CODE, groupId: group, questionSource: "manual",
    manualQuestionIds: [publishedQuestionId], questionCount: 1, durationMinutes: 15, passThresholdPct: 80, scope: "test", createdBy: admin.id,
  });
  lib.publishAssessment(assessmentId, admin.id);
  expect(lib.isQuestionProtected(publishedQuestionId)).toBe(true);

  await loginAs(page, "admin");
  await page.goto(`/question-bank?q=${encodeURIComponent(`TEST-${t.toUpperCase()}`)}`);

  const unusedRow = page.locator("tr", { hasText: `TEST-${t.toUpperCase()}-UNUSED` });
  const publishedRow = page.locator("tr", { hasText: `TEST-${t.toUpperCase()}-PUBLISHED` });
  await expect(unusedRow.getByRole("button", { name: "Supprimer" })).toBeVisible();
  await expect(publishedRow.getByRole("button", { name: "Supprimer" })).toHaveCount(0);
  await expect(publishedRow.getByText(/non supprimable/i)).toBeVisible();

  // Archiver la question publiée — réversible, jamais destructif.
  page.once("dialog", (d) => d.accept());
  await publishedRow.getByRole("button", { name: "Désactiver" }).click();
  await expect(publishedRow.getByText("Inactif")).toBeVisible();
  await publishedRow.getByRole("button", { name: "Réactiver" }).click();
  await expect(publishedRow.getByText("Actif")).toBeVisible();

  // Supprimer définitivement la question jamais publiée.
  page.once("dialog", (d) => d.accept());
  await unusedRow.getByRole("button", { name: "Supprimer" }).click();
  await expect(page.locator("tr", { hasText: `TEST-${t.toUpperCase()}-UNUSED` })).toHaveCount(0);
});

test("INCIDENT CANDIDAT — déclaration depuis /mes-examens, visible du candidat lui-même et labellisé « Déclaré par le candidat » côté admin, jamais d'un autre candidat", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const manager = lib.createUser({ username: `${t}.mgr`, password: "x".repeat(10), fullName: `Manager ${t}`, role: "pedagogical_manager" });
  const company = lib.createCompany({ name: `Co Incident ${t}`, scope: "test", createdBy: admin.id });
  const group = lib.createGroup({ companyId: company, name: `Grp Incident ${t}`, scope: "test", pedagogicalManagerId: manager, createdBy: admin.id });
  const candidate = lib.createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: `Candidat Incident ${t}`, role: "candidate" });
  const otherCandidate = lib.createUser({ username: `${t}.cand2`, password: "x".repeat(10), fullName: `Autre Candidat ${t}`, role: "candidate" });
  lib.addCandidateToGroup(group, candidate, admin.id);
  lib.addCandidateToGroup(group, otherCandidate, admin.id);

  await loginAs(page, `${t}.cand`, "x".repeat(10));
  await page.goto("/mes-examens");
  await page.getByRole("button", { name: /déclarer un incident/i }).click();
  await page.getByLabel("Type de problème").selectOption("technical_failure");
  await page.getByLabel("Description").fill(`Écran figé pendant la connexion ${t}`);
  await page.getByRole("button", { name: "Déclarer", exact: true }).click();
  await expect(page.getByText("Votre incident a été enregistré.")).toBeVisible();
  // Deux boutons "Fermer" dans le DOM (la croix du Modal générique,
  // aria-label="Fermer", et le bouton de confirmation de la modale
  // d'incident) — celui-ci est le second (voir DeclareIncidentModal.tsx).
  await page.getByRole("button", { name: "Fermer", exact: true }).last().click();

  await page.reload();
  await expect(page.getByText("Panne technique")).toBeVisible();
  await expect(page.getByText("Ouvert")).toBeVisible();

  // Un autre candidat du MÊME groupe ne voit jamais cet incident (§28/§37).
  await logout(page);
  await loginAs(page, `${t}.cand2`, "x".repeat(10));
  await page.goto("/mes-examens");
  await expect(page.getByText("Mes incidents déclarés")).toHaveCount(0);

  // Le responsable du groupe voit l'incident, labellisé "Déclaré par le candidat".
  await logout(page);
  await loginAs(page, `${t}.mgr`, "x".repeat(10));
  await page.goto("/incidents");
  const incidentRow = page.locator("a", { hasText: `Écran figé pendant la connexion ${t}` });
  await expect(incidentRow).toBeVisible();
  await expect(incidentRow.getByText("Déclaré par le candidat")).toBeVisible();
});
