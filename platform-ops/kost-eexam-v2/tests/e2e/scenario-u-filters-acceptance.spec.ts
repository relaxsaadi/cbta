import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario U — mission "FINAL FILTERS ACCEPTANCE GATE" (2026-08-30).
// Couverture des pages de filtres NON DÉJÀ testées par
// tests/e2e/scenario-q-filters.spec.ts (USERS/NOTIFICATIONS/MANUAL
// GRADING/EXAM MANAGEMENT, déjà couvertes là-bas, jamais dupliquées ici).
// Même discipline DB_PATH que scenario-q/r/s/t (voir leur commentaire
// d'en-tête). "Do NOT claim PASS merely because controls render" — chaque
// test vérifie un JEU DE LIGNES précis (présence ET absence), jamais
// seulement qu'un <select>/<input> existe.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `u${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment } = await import("../../lib/assessments");
  const { startAttempt, getAttemptQuestions, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  const { getDb } = await import("../../lib/db");
  return {
    createUser, findUserByUsername, createCompany, createGroup, addCandidateToGroup,
    createQuestion, createAssessmentDraft, publishAssessment, startAttempt, getAttemptQuestions, saveAnswer, submitAttempt, getDb,
  };
}

test.describe.configure({ mode: "serial" });

test("CLIENTS (/companies) — Type Entreprise/Particulier, Recherche, combinés, réinitialisation", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  lib.createCompany({ name: `Filtre Entreprise ${t}`, scope: "test", createdBy: admin.id, clientType: "entreprise" });
  lib.createUser({ username: `${t}.particulier`, password: "x".repeat(10), fullName: `Filtre Particulier ${t}`, role: "candidate", candidateType: "particulier" });

  await loginAs(page, "admin");

  // --- Individuels ---
  await page.goto(`/companies?q=${t}`);
  await expect(page.getByText(`Filtre Entreprise ${t}`)).toBeVisible();
  await expect(page.getByText(`Filtre Particulier ${t}`)).toBeVisible();

  await page.goto(`/companies?q=${t}&type=entreprises`);
  await expect(page.getByText(`Filtre Entreprise ${t}`)).toBeVisible();
  await expect(page.getByText(`Filtre Particulier ${t}`)).toHaveCount(0);

  await page.goto(`/companies?q=${t}&type=particuliers`);
  await expect(page.getByText(`Filtre Particulier ${t}`)).toBeVisible();
  await expect(page.getByText(`Filtre Entreprise ${t}`)).toHaveCount(0);

  // --- Combiné : Type=Entreprise + Recherche qui ne matche QUE le particulier → 0 résultat (jamais un OU déguisé) ---
  await page.goto(`/companies?q=${t}.particulier&type=entreprises`);
  await expect(page.getByText(`Filtre Entreprise ${t}`)).toHaveCount(0);
  await expect(page.getByText(`Filtre Particulier ${t}`)).toHaveCount(0);
  await expect(page.getByText("Aucun client", { exact: true })).toBeVisible();

  // --- Réinitialisation ---
  await page.goto(`/companies?q=${t}&type=entreprises`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/companies$/);
});

test("RESULTS (/results) — Statut isole un IN_PROGRESS d'un RÉSULTAT DISPONIBLE, combiné avec Fonction, réinitialisation", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;
  const companyId = lib.createCompany({ name: `Results Co ${t}`, scope: "test", createdBy: admin.id });
  const groupId = lib.createGroup({ companyId, name: `Results Grp ${t}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });

  const qId = lib.createQuestion({
    kostQuestionId: `TEST-${t.toUpperCase()}-RESQ`,
    functionCode: "7.1",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `Question résultats ${t}`,
    choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
    correctAnswer: ["A"],
    createdBy: admin.id,
  });
  const assessmentId = lib.createAssessmentDraft({
    type: "test",
    name: `Examen Filtre Résultats ${t}`,
    functionCode: "7.1",
    groupId,
    questionSource: "manual",
    manualQuestionIds: [qId],
    questionCount: 1,
    durationMinutes: 15,
    passThresholdPct: 80,
    scope: "test",
    createdBy: admin.id,
  });

  const candInProgress = lib.createUser({ username: `${t}.inprogress`, password: "x".repeat(10), fullName: `Results InProgress ${t}`, role: "candidate" });
  const candComplete = lib.createUser({ username: `${t}.complete`, password: "x".repeat(10), fullName: `Results Complete ${t}`, role: "candidate" });
  lib.addCandidateToGroup(groupId, candInProgress, admin.id);
  lib.addCandidateToGroup(groupId, candComplete, admin.id);
  lib.publishAssessment(assessmentId, admin.id);

  lib.startAttempt(assessmentId, candInProgress, {}); // jamais soumise

  const attemptComplete = lib.startAttempt(assessmentId, candComplete, {});
  const questions = lib.getAttemptQuestions(attemptComplete.id);
  for (const q of questions) lib.saveAnswer(attemptComplete.id, candComplete, q.attempt_question_id, ["A"]);
  lib.submitAttempt(attemptComplete.id, candComplete);

  await loginAs(page, "admin");

  // Le select "Candidat" liste TOUS les candidats du groupe quel que soit le
  // filtre status (texte d'option "Nom (Entreprise)"), donc getByText brut
  // matche aussi l'<option> en plus de la ligne du tableau (violation du
  // mode strict). On cible donc explicitement le lien de la ligne de
  // résultat (exact:true — l'option contient toujours le suffixe société).
  const rowLink = (name: string) => page.getByRole("link", { name, exact: true });

  await page.goto(`/results?groupId=${groupId}&status=en_cours`);
  await expect(rowLink(`Results InProgress ${t}`)).toBeVisible();
  await expect(rowLink(`Results Complete ${t}`)).toHaveCount(0);

  await page.goto(`/results?groupId=${groupId}&status=resultat_disponible`);
  await expect(rowLink(`Results Complete ${t}`)).toBeVisible();
  await expect(rowLink(`Results InProgress ${t}`)).toHaveCount(0);

  // Combiné avec Fonction — une fonction qui n'a rien à voir → 0 résultat,
  // preuve d'un vrai ET.
  await page.goto(`/results?groupId=${groupId}&status=resultat_disponible&functionCode=7.9`);
  await expect(rowLink(`Results Complete ${t}`)).toHaveCount(0);
  await expect(page.getByText("Aucun résultat")).toBeVisible();

  await page.goto(`/results?groupId=${groupId}&status=resultat_disponible&functionCode=7.1`);
  await expect(rowLink(`Results Complete ${t}`)).toBeVisible();

  // Sans filtre status — les deux réapparaissent (jamais une exclusion
  // silencieuse par défaut).
  await page.goto(`/results?groupId=${groupId}`);
  await expect(rowLink(`Results InProgress ${t}`)).toBeVisible();
  await expect(rowLink(`Results Complete ${t}`)).toBeVisible();

  // Réinitialisation
  await page.goto(`/results?groupId=${groupId}&status=en_cours`);
  await page.getByRole("link", { name: /réinitialiser/i }).click();
  await expect(page).toHaveURL(/\/results$/);
});

// Trouvé pendant l'audit filtres §21 (pas un bug de filtre à proprement
// parler, mais une frontière RBAC adjacente découverte au même endroit) :
// /companies/[id] utilisait listGroups() non restreint alors que
// hasCompanyAccess() autorise un responsable dès qu'il gère AU MOINS UN
// groupe du client — un client peut avoir des groupes répartis entre
// PLUSIEURS responsables. Corrigé pour réutiliser listGroupsForManager(),
// même garde que /groups/page.tsx.
test("COMPANIES/[id] — un responsable ne voit que SES groupes dans un client partagé entre deux responsables", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  const companyId = lib.createCompany({ name: `Partagé Co ${t}`, scope: "test", createdBy: admin.id });
  const managerA = lib.createUser({ username: `${t}.sharedmgra`, password: "x".repeat(10), fullName: `Partagé Manager A ${t}`, role: "pedagogical_manager" });
  const managerB = lib.createUser({ username: `${t}.sharedmgrb`, password: "x".repeat(10), fullName: `Partagé Manager B ${t}`, role: "pedagogical_manager" });
  lib.createGroup({ companyId, name: `Groupe A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: admin.id });
  lib.createGroup({ companyId, name: `Groupe B ${t}`, scope: "test", pedagogicalManagerId: managerB, createdBy: admin.id });

  // Manager A : accède au client (il y gère un groupe) mais ne doit voir
  // QUE Groupe A, jamais Groupe B (qui appartient à Manager B).
  await loginAs(page, `${t}.sharedmgra`, "x".repeat(10));
  await page.goto(`/companies/${companyId}`);
  await expect(page.getByText(`Groupe A ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe B ${t}`)).toHaveCount(0);

  // Manager B : symétrique.
  await logout(page);
  await loginAs(page, `${t}.sharedmgrb`, "x".repeat(10));
  await page.goto(`/companies/${companyId}`);
  await expect(page.getByText(`Groupe B ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe A ${t}`)).toHaveCount(0);

  // Admin : voit les deux (pas de restriction de périmètre).
  await logout(page);
  await loginAs(page, "admin");
  await page.goto(`/companies/${companyId}`);
  await expect(page.getByText(`Groupe A ${t}`)).toBeVisible();
  await expect(page.getByText(`Groupe B ${t}`)).toBeVisible();
});
