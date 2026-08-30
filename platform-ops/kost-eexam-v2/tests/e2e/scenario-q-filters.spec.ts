import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario Q — mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
// §43 : couverture E2E réelle des filtres /users, /notifications, /grading
// et /exam-preparation — individuels, combinés, et réinitialisation.
// "Do not claim PASS merely because controls render" (§43) : chaque
// assertion ci-dessous vérifie un JEU DE LIGNES précis (présence ET
// absence), jamais seulement qu'un <select> existe sur la page.
//
// DB_PATH doit pointer vers la même base SQLite que le serveur webServer
// AVANT le premier import d'un module lib/* qui touche lib/db.ts::getDb()
// (singleton paresseux, résolu au premier appel réel — voir lib/db.ts) :
// aucun autre fichier de spec de ce projet n'importe un module lib/* qui
// touche la base (scenario-l/scenario-o importent seulement lib/passwords
// et lib/mfa, tous deux de pures fonctions sans accès DB, et utilisent
// node:sqlite directement pour leurs propres besoins) — ce fichier est
// donc le premier et seul consommateur de getDb() dans le process de test,
// sans risque de collision avec un autre chemin déjà résolu.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `q${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, setUserStatus, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { assignFunctionToUser } = await import("../../lib/user-functions");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { startAttempt, getAttemptQuestions, saveAnswer, submitAttempt } = await import("../../lib/attempts");
  return {
    createUser, setUserStatus, findUserByUsername, createCompany, createGroup, addCandidateToGroup, assignFunctionToUser,
    createQuestion, createAssessmentDraft, publishAssessment, assignCandidatesToAssessment,
    startAttempt, getAttemptQuestions, saveAnswer, submitAttempt,
  };
}

test.describe.configure({ mode: "serial" });

test("USERS — filtres individuels, combinés (exemple exact de la mission), réinitialisation, compteur", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  // Fixture A — Entreprise, active, fonction 7.1, client/groupe dédiés.
  const companyA = lib.createCompany({ name: `Filtre Co A ${t}`, scope: "test", createdBy: admin.id, clientType: "entreprise" });
  const groupA = lib.createGroup({ companyId: companyA, name: `Filtre Grp A ${t}`, scope: "test", createdBy: admin.id });
  const userA = lib.createUser({ username: `${t}.usera`, password: "x".repeat(10), fullName: `Filtre User A ${t}`, role: "candidate", candidateType: "entreprise" });
  lib.addCandidateToGroup(groupA, userA, admin.id);
  lib.assignFunctionToUser(userA, "7.1", admin.id);

  // Fixture B — Particulier, suspendu, aucune fonction, aucun groupe.
  const userB = lib.createUser({ username: `${t}.userb`, password: "x".repeat(10), fullName: `Filtre User B ${t}`, role: "candidate", candidateType: "particulier" });
  lib.setUserStatus(userB, "suspended");

  await loginAs(page, "admin");

  // --- Filtres individuels ---
  await page.goto(`/users?q=${t}`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.userb`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "2 compte(s)" }).or(page.getByText("2 compte(s)"))).toBeVisible();

  await page.goto(`/users?q=${t}&type=entreprise`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.userb`)).toHaveCount(0);

  await page.goto(`/users?q=${t}&type=particulier`);
  await expect(page.getByTestId(`user-row-${t}.userb`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.usera`)).toHaveCount(0);

  await page.goto(`/users?q=${t}&status=suspended`);
  await expect(page.getByTestId(`user-row-${t}.userb`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.usera`)).toHaveCount(0);

  await page.goto(`/users?q=${t}&companyId=${companyA}`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.userb`)).toHaveCount(0);

  await page.goto(`/users?q=${t}&functionCode=7.1`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.userb`)).toHaveCount(0);

  // --- Combinaison EXACTE donnée en exemple par la mission : Type=Entreprise
  // + Client + Groupe + Statut=Actif → seul le candidat correspondant. ---
  await page.goto(`/users?q=${t}&type=entreprise&companyId=${companyA}&groupId=${groupA}&status=active`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toBeVisible();
  await expect(page.getByTestId(`user-row-${t}.userb`)).toHaveCount(0);
  await expect(page.getByText("1 compte(s)")).toBeVisible();

  // Une combinaison qui ne peut RIEN retourner (B est particulier, jamais
  // dans companyA) prouve un vrai ET logique, jamais un OU déguisé.
  await page.goto(`/users?q=${t}&type=particulier&companyId=${companyA}`);
  await expect(page.getByTestId(`user-row-${t}.usera`)).toHaveCount(0);
  await expect(page.getByTestId(`user-row-${t}.userb`)).toHaveCount(0);
  await expect(page.getByText("0 compte(s)")).toBeVisible();

  // --- Réinitialisation ---
  await page.goto(`/users?q=${t}&type=entreprise`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/users$/);
});

test("NOTIFICATIONS — filtres individuels, combinés, réinitialisation (fixtures email E2E existantes)", async ({ page }) => {
  // Réutilise les 2 fixtures déjà seedées par global-setup.ts (scripts/
  // seed-email-demo.ts) — 2 tenants DISTINCTS, chacun avec exactement une
  // ligne ACCOUNT_CREATED réelle, jamais recréées ici (idempotent par
  // conception, voir ce script).
  await loginAs(page, "admin");
  // .first() plutôt qu'une correspondance stricte unique : d'autres
  // scénarios E2E (exécutés avant celui-ci dans la suite complète, ordre
  // alphabétique des fichiers) peuvent légitimement avoir déjà généré
  // PLUS d'une notification vers ce même destinataire fixe — ce test
  // vérifie que le filtre montre RÉELLEMENT au moins la bonne ligne et
  // JAMAIS celle de l'autre tenant, jamais un compte total exact qui
  // dépendrait de l'état global d'une suite entière.

  await page.goto("/notifications?q=candidat.e2e.activation");
  await expect(page.getByText("candidat.e2e.activation@example.test").first()).toBeVisible();
  await expect(page.getByText("candidat.e2e.isolation@example.test")).toHaveCount(0);

  await page.goto("/notifications?q=candidat.e2e.isolation");
  await expect(page.getByText("candidat.e2e.isolation@example.test").first()).toBeVisible();
  await expect(page.getByText("candidat.e2e.activation@example.test")).toHaveCount(0);

  await page.goto("/notifications?event=ACCOUNT_CREATED&q=candidat.e2e.activation");
  await expect(page.getByText("candidat.e2e.activation@example.test").first()).toBeVisible();

  // Un type d'événement qui n'a jamais été émis pour ce destinataire →
  // liste vide, jamais un OU silencieux avec la recherche seule.
  await page.goto("/notifications?event=RESULT_AVAILABLE&q=candidat.e2e.activation");
  await expect(page.getByText("candidat.e2e.activation@example.test")).toHaveCount(0);
  await expect(page.getByText("Aucune notification")).toBeVisible();
});

test("NOTIFICATIONS — le lien de réinitialisation apparaît avec un filtre actif et retire réellement les paramètres", async ({ page }) => {
  await loginAs(page, "admin");
  await page.goto("/notifications?q=candidat.e2e.activation");
  await expect(page.getByRole("link", { name: /réinitialiser les filtres/i })).toBeVisible();
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/notifications$/);
});

test("MANUAL GRADING — filtres individuels (candidat, client, fonction), combinés, réinitialisation, isolation entre deux fixtures indépendantes", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  function makePendingFixture(tag: string, functionCode: string) {
    const companyId = lib.createCompany({ name: `Grading Co ${tag}`, scope: "test", createdBy: admin.id });
    const groupId = lib.createGroup({ companyId, name: `Grading Grp ${tag}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });
    const candidateId = lib.createUser({ username: `${tag}.cand`, password: "x".repeat(10), fullName: `Grading Candidat ${tag}`, role: "candidate" });
    lib.addCandidateToGroup(groupId, candidateId, admin.id);
    const questionId = lib.createQuestion({
      kostQuestionId: `TEST-${tag.toUpperCase()}-Q`,
      functionCode,
      qtype: "short_answer",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `Question filtre ${tag}`,
      choices: [],
      correctAnswer: { mode: "manual" },
      createdBy: admin.id,
    });
    const assessmentId = lib.createAssessmentDraft({
      type: "test",
      name: `Examen Filtre Grading ${tag}`,
      functionCode,
      groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 15,
      passThresholdPct: 80,
      scope: "test",
      createdBy: admin.id,
    });
    lib.publishAssessment(assessmentId, admin.id);
    lib.assignCandidatesToAssessment(assessmentId, [candidateId], admin.id);
    const attempt = lib.startAttempt(assessmentId, candidateId, {});
    const questions = lib.getAttemptQuestions(attempt.id);
    for (const q of questions) lib.saveAnswer(attempt.id, candidateId, q.attempt_question_id, [`Réponse ${tag}`]);
    lib.submitAttempt(attempt.id, candidateId);
    return { companyId, candidateId };
  }

  const tagA = `${t}a`;
  const tagB = `${t}b`;
  const fixtureA = makePendingFixture(tagA, "7.1");
  const fixtureB = makePendingFixture(tagB, "7.2");

  await loginAs(page, "admin");
  // Ancré au conteneur-carte de la file d'attente (jamais getByText nu) :
  // le sélecteur "Candidat" du formulaire de filtre contient LUI AUSSI le
  // nom complet en texte d'<option>, ambiguïté réelle rencontrée en
  // validant ce test (strict mode violation, 2 éléments correspondants).
  const cardA = () => page.locator("div.rounded-md.border").filter({ hasText: `Grading Candidat ${tagA}` });
  const cardB = () => page.locator("div.rounded-md.border").filter({ hasText: `Grading Candidat ${tagB}` });

  await page.goto(`/grading?candidateUserId=${fixtureA.candidateId}`);
  await expect(cardA()).toBeVisible();
  await expect(cardB()).toHaveCount(0);

  await page.goto(`/grading?companyId=${fixtureB.companyId}`);
  await expect(cardB()).toBeVisible();
  await expect(cardA()).toHaveCount(0);

  await page.goto(`/grading?functionCode=7.1&candidateUserId=${fixtureA.candidateId}`);
  await expect(cardA()).toBeVisible();

  // Combinaison impossible (candidat A, fonction de B) → aucune ligne.
  await page.goto(`/grading?functionCode=7.2&candidateUserId=${fixtureA.candidateId}`);
  await expect(cardA()).toHaveCount(0);

  // Type=Scénario exclut une question short_answer autonome.
  await page.goto(`/grading?type=scenario&candidateUserId=${fixtureA.candidateId}`);
  await expect(cardA()).toHaveCount(0);

  await page.goto(`/grading?type=court&candidateUserId=${fixtureA.candidateId}`);
  await expect(cardA()).toBeVisible();

  await page.goto(`/grading?candidateUserId=${fixtureA.candidateId}`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/grading$/);
});

test("EXAM MANAGEMENT — filtres individuels, combinés, réinitialisation (/exam-preparation)", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  function makeAssessment(tag: string, functionCode: string) {
    const companyId = lib.createCompany({ name: `ExamMgmt Co ${tag}`, scope: "test", createdBy: admin.id });
    const groupId = lib.createGroup({ companyId, name: `ExamMgmt Grp ${tag}`, scope: "test", pedagogicalManagerId: admin.id, createdBy: admin.id });
    const candidateId = lib.createUser({ username: `${tag}.cand`, password: "x".repeat(10), fullName: `ExamMgmt Candidat ${tag}`, role: "candidate" });
    lib.addCandidateToGroup(groupId, candidateId, admin.id);
    const questionId = lib.createQuestion({
      kostQuestionId: `TEST-${tag.toUpperCase()}-Q`,
      functionCode,
      qtype: "mcq_single",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: `Question ${tag}`,
      choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
      correctAnswer: ["A"],
      createdBy: admin.id,
    });
    const assessmentId = lib.createAssessmentDraft({
      type: "test",
      name: `Examen Filtre ${tag}`,
      functionCode,
      groupId,
      questionSource: "manual",
      manualQuestionIds: [questionId],
      questionCount: 1,
      durationMinutes: 15,
      passThresholdPct: 80,
      scope: "test",
      createdBy: admin.id,
    });
    lib.publishAssessment(assessmentId, admin.id);
    return { companyId, groupId };
  }

  const tagA = `${t}a`;
  const tagB = `${t}b`;
  makeAssessment(tagA, "7.1");
  const fixtureB = makeAssessment(tagB, "7.2");

  await loginAs(page, "admin");

  await page.goto(`/exam-preparation?q=Examen Filtre ${tagA}`);
  await expect(page.getByText(`Examen Filtre ${tagA}`)).toBeVisible();
  await expect(page.getByText(`Examen Filtre ${tagB}`)).toHaveCount(0);

  await page.goto(`/exam-preparation?filterFunctionCode=7.2`);
  await expect(page.getByText(`Examen Filtre ${tagB}`)).toBeVisible();
  await expect(page.getByText(`Examen Filtre ${tagA}`)).toHaveCount(0);

  await page.goto(`/exam-preparation?filterCompanyId=${fixtureB.companyId}`);
  await expect(page.getByText(`Examen Filtre ${tagB}`)).toBeVisible();
  await expect(page.getByText(`Examen Filtre ${tagA}`)).toHaveCount(0);

  // Combinée : bon groupe + mauvaise fonction → rien.
  await page.goto(`/exam-preparation?filterGroupId=${fixtureB.groupId}&filterFunctionCode=7.1`);
  await expect(page.getByText(`Examen Filtre ${tagB}`)).toHaveCount(0);

  await page.goto(`/exam-preparation?filterGroupId=${fixtureB.groupId}&filterFunctionCode=7.2`);
  await expect(page.getByText(`Examen Filtre ${tagB}`)).toBeVisible();

  await page.goto(`/exam-preparation?q=Examen Filtre ${tagA}`);
  await page.getByRole("link", { name: /réinitialiser les filtres/i }).click();
  await expect(page).toHaveURL(/\/exam-preparation$/);
});
