import { test, expect, type Page } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29), PART J-L/R —
// cycle complet via l'UI RÉELLE (jamais un appel direct aux fonctions lib) :
// création de questions numeric + short_answer (mode correction manuelle)
// dans la banque, examen publié sur une fonction dédiée (7.2, isolée des
// autres specs qui utilisent toutes 7.1), candidat répond et envoie,
// correction manuelle par un administrateur via /grading, résultat final.
// PART S — /grading est aussi vérifié en lecture seule (auditeur) et en
// isolation tenant (un responsable d'un autre client ne voit jamais la
// réponse en attente d'un autre groupe).

const FUNCTION_CODE = "7.2";
const ASSESSMENT_NAME = "DGR Fonction 7.2 — Notation manuelle E2E";

async function createQuestionViaUi(
  page: Page,
  opts: { kostId: string; qtype: "mcq_single" | "numeric" | "short_answer"; stem: string }
) {
  await page.goto("/question-bank");
  await page.locator("#kostQuestionId").fill(opts.kostId);
  await page.locator("#functionCode").selectOption(FUNCTION_CODE);
  await page.locator("#sourceStatus").selectOption("FROZEN_SOURCE_VERIFIED");
  await page.locator("#qtype").selectOption(opts.qtype);
  await page.locator("#stem").fill(opts.stem);

  if (opts.qtype === "mcq_single") {
    await page.getByRole("textbox", { name: "Choix A" }).fill("Choix correct");
    await page.getByRole("checkbox", { name: "Bonne réponse — choix A" }).check();
    await page.getByRole("textbox", { name: "Choix B" }).fill("Choix incorrect");
  } else if (opts.qtype === "numeric") {
    await page.locator("#numericValue").fill("42");
    await page.locator("#numericTolerance").fill("0");
    await page.locator("#numericUnit").fill("kg");
  } else {
    await page.getByLabel("Correction manuelle obligatoire").check();
  }

  await page.getByRole("button", { name: /ajouter à la banque/i }).click();
  await expect(page.getByText(new RegExp(`Question ${opts.kostId} créée`))).toBeVisible();
}

/** Répond à la question actuellement affichée selon son type détecté via
 * le champ présent — nécessaire car l'ordre des questions est mélangé par
 * défaut (option "Mélanger les questions"). Répond toujours CORRECTEMENT
 * pour mcq_single/numeric (auto-notées) ; la réponse libre du
 * short_answer manuel est arbitraire (jamais auto-notée, voir la
 * correction manuelle plus bas). */
async function answerCurrentQuestion(page: Page) {
  if ((await page.locator('input[type="number"]').count()) > 0) {
    await page.locator('input[type="number"]').fill("42");
    await page.locator('input[type="number"]').press("Tab");
  } else if ((await page.locator('input[type="radio"], input[type="checkbox"]').count()) > 0) {
    await page.getByLabel("Choix correct").check();
  } else {
    await page.locator('input[type="text"]').fill("Réponse rédigée par le candidat E2E.");
    await page.locator('input[type="text"]').press("Tab");
  }
}

test.describe.configure({ mode: "serial" });

test("cycle complet : questions numeric + short_answer (correction manuelle) créées via l'UI, examen publié, candidat répond, correction manuelle admin, résultat final", async ({ page }) => {
  // --- 1. Auteurage — 3 questions sur une fonction dédiée (7.2), via l'UI réelle du formulaire d'auteurage. ---
  await loginAs(page, "admin");
  await createQuestionViaUi(page, { kostId: "Q-7.2-E2E-MCQ", qtype: "mcq_single", stem: "[E2E] Question à choix unique." });
  await createQuestionViaUi(page, { kostId: "Q-7.2-E2E-NUM", qtype: "numeric", stem: "[E2E] Question numérique." });
  await createQuestionViaUi(page, { kostId: "Q-7.2-E2E-SA", qtype: "short_answer", stem: "[E2E] Question à correction manuelle." });

  // --- 2. Préparation + publication de l'examen (responsable pédagogique), pool exactement de taille 3 pour un tirage déterministe. ---
  await logout(page);
  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill(ASSESSMENT_NAME);
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption(FUNCTION_CODE);
  await expect(page.getByText(/Questions admissibles disponibles[\s\S]*3/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("30");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // --- 3. Le candidat répond aux 3 questions et envoie réellement. ---
  await logout(page);
  await loginAs(page, "candidat3.demo");
  const examRow = page.locator("div.justify-between").filter({ hasText: ASSESSMENT_NAME });
  await expect(examRow).toBeVisible();
  await examRow.getByRole("link", { name: /commencer/i }).click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);

  for (let i = 0; i < 3; i++) {
    await answerCurrentQuestion(page);
    const nextBtn = page.getByRole("button", { name: /suivante/i });
    if ((await nextBtn.count()) > 0) await nextBtn.click();
    else await page.getByRole("button", { name: /vérifier avant d'envoyer/i }).click();
  }

  await expect(page.getByText("Résumé de l'examen")).toBeVisible();
  await expect(page.getByText(/n'ont pas de réponse/)).toHaveCount(0);
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: /^terminer et envoyer l'examen$/i }).click();
  await page.waitForURL(/\/mes-resultats\?justSubmitted=/);

  // --- 4. Correction manuelle en attente — jamais un résultat prématuré. ---
  await expect(page.getByText("Votre examen a bien été envoyé et nécessite une correction avant la publication du résultat.")).toBeVisible();
  await expect(page.getByText("En attente de correction", { exact: true })).toBeVisible();

  // --- 5. Un administrateur corrige la réponse manuelle via /grading. ---
  await logout(page);
  await loginAs(page, "admin");
  await page.goto("/grading");
  const pendingItem = page.locator("div.rounded-md.border").filter({ hasText: ASSESSMENT_NAME });
  await expect(pendingItem).toBeVisible();
  await expect(pendingItem.getByText("Réponse rédigée par le candidat E2E.")).toBeVisible();
  await pendingItem.getByRole("button", { name: /^correcte$/i }).click();

  // La ligne graduée quitte réellement la file d'attente ET une
  // confirmation reste visible — via une vraie navigation (redirect avec
  // paramètre de confirmation), pas un état client sur un nœud disparu
  // (bug réel corrigé pendant cette mission, voir actions.ts).
  await page.waitForURL(/\/grading\?graded=1/);
  await expect(page.getByText("Réponse corrigée — résultat finalisé et notifié.")).toBeVisible();
  await expect(page.locator("div.rounded-md.border").filter({ hasText: ASSESSMENT_NAME })).toHaveCount(0);

  // --- 6. Le candidat voit maintenant son résultat final (100% — mcq + numeric auto-corrects + short_answer jugée correcte). ---
  await logout(page);
  await loginAs(page, "candidat3.demo");
  await page.goto("/mes-resultats");
  const finalRow = page.locator("div.rounded-md.border").filter({ hasText: ASSESSMENT_NAME });
  await expect(finalRow).toBeVisible();
  await expect(finalRow.getByText("En attente de correction")).toHaveCount(0);
  await expect(finalRow.getByText("100/100")).toBeVisible();
  await expect(finalRow.getByText("Réussi")).toBeVisible();
});

test("l'auditeur consulte /grading en lecture seule — aucun formulaire de notation", async ({ page }) => {
  await loginAs(page, "auditeur.demo");
  await page.goto("/grading");
  await expect(page.getByRole("heading", { name: "Correction manuelle" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^correcte$/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^incorrecte$/i })).toHaveCount(0);
});

test("isolation tenant — un responsable pédagogique d'un AUTRE client ne voit jamais une correction en attente hors de son périmètre", async ({ page }) => {
  await loginAs(page, "responsable.e2e2");
  await page.goto("/grading");
  // Le groupe démo (Air Algérie) est hors du périmètre de ce responsable
  // (client "Client E2E Isolation") — aucune correction en attente d'un
  // AUTRE tenant ne doit apparaître, quelle qu'elle soit.
  await expect(page.getByText("Yacine Haddad (démo)")).toHaveCount(0);
});

// PART D/§20 — auto-soumission par expiration du chronomètre serveur,
// jamais un second chemin de notation (doSubmit(true) réutilise
// exactement la même logique que l'envoi manuel, voir ExamRunner.tsx).
// Durée réelle d'1 minute (minimum autorisé par le formulaire) — le test
// attend le décompte réel, jamais une horloge simulée.
test("auto-soumission par expiration du chronomètre (durée 1 min) — aucune interaction candidat, message exact requis", async ({ page }) => {
  test.setTimeout(150_000);
  const shortName = "DGR Fonction 7.2 — Auto-soumission E2E";

  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill(shortName);
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption(FUNCTION_CODE);
  await expect(page.getByText(/Questions admissibles disponibles[\s\S]*3/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("1");
  await page.locator('input[name="durationMinutes"]').fill("1");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  await logout(page);
  await loginAs(page, "candidat3.demo");
  const examRow = page.locator("div.justify-between").filter({ hasText: shortName });
  await expect(examRow).toBeVisible();
  await examRow.getByRole("link", { name: /commencer/i }).click();
  await page.waitForURL(/\/exam\/\d+\/instructions/);
  await page.getByRole("button", { name: /commencer l'examen/i }).click();
  await page.waitForURL(/\/exam\/\d+\/attempt/);

  // Aucune réponse, aucun clic — le chronomètre serveur doit seul déclencher
  // l'envoi automatique, sans écran de révision ni dialogue de confirmation.
  await page.waitForURL(/\/mes-resultats\?justSubmitted=.*auto=1/, { timeout: 100_000 });
  await expect(page.getByText("Temps écoulé — votre examen a été envoyé automatiquement.")).toBeVisible();
});
