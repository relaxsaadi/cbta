import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario R — mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
// §44 : sécurité du mode APERÇU CANDIDAT (/apercu-candidat/[assessmentId]).
// "admin can preview; responsable only within scope; auditor read-only per
// policy; candidate cannot invoke admin preview; cross-tenant preview
// denied; preview creates ZERO real attempts/results/emails; modifies ZERO
// candidate answers/history." Même discipline DB_PATH que scenario-q (voir
// son commentaire d'en-tête) — premier import réel de lib/db.ts dans ce
// fichier de spec.
process.env.DB_PATH = "./data/e2e-test.db";

function uniqueTag() {
  return `r${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function importLib() {
  const { createUser, findUserByUsername } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { createQuestion } = await import("../../lib/questions");
  const { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } = await import("../../lib/assessments");
  const { getDb } = await import("../../lib/db");
  return { createUser, findUserByUsername, createCompany, createGroup, addCandidateToGroup, createQuestion, createAssessmentDraft, publishAssessment, assignCandidatesToAssessment, getDb };
}

test.describe.configure({ mode: "serial" });

test("APERÇU CANDIDAT — admin/responsable dans son périmètre/auditeur peuvent prévisualiser ; responsable hors périmètre refusé ; candidat structurellement exclu", async ({ page }) => {
  const t = uniqueTag();
  const lib = await importLib();
  const admin = lib.findUserByUsername("admin")!;

  // --- Tenant "propriétaire" : responsable A gère ce groupe/examen ---
  const managerA = lib.createUser({ username: `${t}.mgra`, password: "x".repeat(10), fullName: `Responsable A ${t}`, role: "pedagogical_manager" });
  const companyA = lib.createCompany({ name: `Preview Co A ${t}`, scope: "test", createdBy: admin.id });
  const groupA = lib.createGroup({ companyId: companyA, name: `Preview Grp A ${t}`, scope: "test", pedagogicalManagerId: managerA, createdBy: admin.id });
  const candidateA = lib.createUser({ username: `${t}.canda`, password: "x".repeat(10), fullName: `Preview Candidat A ${t}`, role: "candidate" });
  lib.addCandidateToGroup(groupA, candidateA, admin.id);
  const questionId = lib.createQuestion({
    kostQuestionId: `TEST-${t.toUpperCase()}-PREV`,
    functionCode: "7.1",
    qtype: "mcq_single",
    sourceStatus: "FROZEN_SOURCE_VERIFIED",
    stem: `Question aperçu ${t}`,
    choices: [{ key: "A", text: "a" }, { key: "B", text: "b" }],
    correctAnswer: ["A"],
    createdBy: admin.id,
  });
  const assessmentId = lib.createAssessmentDraft({
    type: "test",
    name: `Examen Aperçu ${t}`,
    functionCode: "7.1",
    groupId: groupA,
    questionSource: "manual",
    manualQuestionIds: [questionId],
    questionCount: 1,
    durationMinutes: 15,
    passThresholdPct: 80,
    scope: "test",
    createdBy: admin.id,
  });
  lib.publishAssessment(assessmentId, admin.id);
  lib.assignCandidatesToAssessment(assessmentId, [candidateA], admin.id);

  // --- Responsable B, tenant totalement distinct (hors périmètre) ---
  const managerB = lib.createUser({ username: `${t}.mgrb`, password: "x".repeat(10), fullName: `Responsable B ${t}`, role: "pedagogical_manager" });

  function attemptsCount() {
    return (lib.getDb().prepare(`SELECT COUNT(*) AS n FROM attempts`).get() as { n: number }).n;
  }
  function resultsCount() {
    return (lib.getDb().prepare(`SELECT COUNT(*) AS n FROM results`).get() as { n: number }).n;
  }
  function notificationCount() {
    return (lib.getDb().prepare(`SELECT COUNT(*) AS n FROM notification_log`).get() as { n: number }).n;
  }
  const before = { attempts: attemptsCount(), results: resultsCount(), notifications: notificationCount() };

  // --- Admin : accès + bannière + ZÉRO écriture ---
  await loginAs(page, "admin");
  await page.goto(`/apercu-candidat/${assessmentId}`);
  await expect(page.getByText(/mode aperçu/i)).toBeVisible();
  await expect(page.getByText(`Question aperçu ${t}`)).toBeVisible();
  // §23 — interaction possible en aperçu (répondre à la question démo) :
  // reste purement local, jamais persistée (vérifié par les compteurs DB
  // inchangés ci-dessous, APRÈS cette interaction).
  await page.getByText("a", { exact: true }).click();
  await page.getByRole("button", { name: /vérifier avant d'envoyer/i }).click();
  await page.getByRole("button", { name: /terminer et envoyer l'examen \(aperçu\)/i }).click();
  await expect(page.getByText(/aperçu — écran de confirmation/i)).toBeVisible();

  // --- Responsable A (propriétaire du groupe) : accès autorisé ---
  await logout(page);
  await loginAs(page, `${t}.mgra`, "x".repeat(10));
  await page.goto(`/apercu-candidat/${assessmentId}`);
  await expect(page.getByText(/mode aperçu/i)).toBeVisible();

  // --- Responsable B (autre tenant) : refusé, jamais un 200 qui confirmerait l'existence ---
  await logout(page);
  await loginAs(page, `${t}.mgrb`, "x".repeat(10));
  const deniedResponse = await page.goto(`/apercu-candidat/${assessmentId}`);
  expect(deniedResponse?.status()).toBe(404);

  // --- Auditeur : accès en lecture (l'écran est structurellement en
  // lecture seule pour TOUT rôle — aucun formulaire d'écriture n'existe
  // ici, voir PreviewRunner.tsx qui n'importe aucune action serveur) ---
  await logout(page);
  await loginAs(page, "auditeur.demo");
  await page.goto(`/apercu-candidat/${assessmentId}`);
  await expect(page.getByText(/mode aperçu/i)).toBeVisible();

  // --- Candidat : exclusion structurelle (RBAC serveur, pas une UI masquée) ---
  await logout(page);
  await loginAs(page, `${t}.canda`, "x".repeat(10));
  await page.goto(`/apercu-candidat/${assessmentId}`);
  await expect(page.getByText(/accès refusé/i)).toBeVisible();

  // --- Preuve finale : aucune écriture réelle sur toute la séquence
  // ci-dessus (admin a même "répondu" et "terminé" l'aperçu). ---
  expect(attemptsCount()).toBe(before.attempts);
  expect(resultsCount()).toBe(before.results);
  expect(notificationCount()).toBe(before.notifications);
});
