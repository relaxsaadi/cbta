import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario K — mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW"
// (2026-08-29). Crée son propre examen frais (indépendant des autres
// scénarios) pour rester self-contained, à l'image du scénario B.
process.env.DB_PATH = "./data/e2e-test.db";

// §G/H — mission "URGENT — FIX ONLY EXAM SCHEDULING +1H BUG" (2026-09-02).
// Round-trip complet EXIGÉ par la mission (§5/§7) : 11:30 saisi via l'UI
// réelle doit se stocker en 10:30Z (Africa/Algiers = UTC+1) — jamais
// 11:30Z (bug d'origine : new Date(valeur datetime-local brute)
// interprétée comme l'heure locale du conteneur, UTC) — et redonner
// EXACTEMENT 11:30 à la réouverture du formulaire, jamais 12:30.
test("G — reprogrammer à 11:30 stocke 10:30Z (Africa/Algiers = UTC+1), jamais 11:30Z ni 12:30Z — round-trip UI réel", async ({ page }) => {
  const { getAssessment } = await import("../../lib/assessments");

  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("Fonction 7.1 — Round-trip horaire E2E");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/(\d+)/);
  const assessmentId = Number(page.url().match(/\/exam-preparation\/(\d+)/)![1]);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  await page.locator("#reschedule-openAt").fill("2026-09-02T11:30");
  await page.locator("#reschedule-closeAt").fill("2026-09-20T18:00");
  await page.getByRole("button", { name: /reprogrammer l'examen/i }).click();
  await expect(page.getByText(/candidats affectés ont été notifiés/i)).toBeVisible();

  // STOCKÉ : instant UTC réel en base — jamais 11:30Z (l'ancien bug),
  // jamais un décalage bricolé, exactement 10:30Z.
  const stored = getAssessment(assessmentId);
  expect(stored?.open_at).toBe("2026-09-02T10:30:00.000Z");

  // AFFICHÉ : réouvrir la même fiche doit remontrer 11:30 dans le
  // formulaire de reprogrammation (préremplissage), jamais 10:30 (heure
  // UTC brute) ni 12:30.
  await page.goto(`/exam-preparation/${assessmentId}`);
  await expect(page.locator("#reschedule-openAt")).toHaveValue("2026-09-02T11:30");
});

test("H — créer un examen avec ouverture à 15:00 stocke 14:00Z (Africa/Algiers = UTC+1), jamais 15:00Z ni 16:00Z", async ({ page }) => {
  const { getAssessment } = await import("../../lib/assessments");

  await loginAs(page, "responsable.demo");
  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("Fonction 7.1 — Création horaire E2E");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.locator("#openAt").fill("2026-09-02T15:00");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/(\d+)/);
  const assessmentId = Number(page.url().match(/\/exam-preparation\/(\d+)/)![1]);

  const stored = getAssessment(assessmentId);
  expect(stored?.open_at).toBe("2026-09-02T14:00:00.000Z");
});

test("A — le responsable pédagogique reprogramme réellement un examen publié via l'UI réelle", async ({ page }) => {
  await loginAs(page, "responsable.demo");

  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("Fonction 7.1 — Reprogrammation E2E");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // La section de reprogrammation doit être visible pour un statut publié
  // (le titre de carte ET le bouton portent tous deux ce texte — scoper
  // au titre pour éviter l'ambiguïté de mode strict).
  await expect(page.getByRole("heading", { name: "Reprogrammer l'examen" })).toBeVisible();
  await page.locator("#reschedule-openAt").fill("2026-09-05T08:00");
  await page.locator("#reschedule-closeAt").fill("2026-09-20T18:00");
  await page.getByRole("button", { name: /reprogrammer l'examen/i }).click();

  await expect(page.getByText(/candidats affectés ont été notifiés/i)).toBeVisible();
  // La fenêtre affichée dans le récapitulatif doit refléter les nouvelles dates.
  await expect(page.getByText(/05 sept\./)).toBeVisible();
});

test("F — des dates invalides (fermeture avant ouverture) sont refusées avec un message FR explicite", async ({ page }) => {
  await loginAs(page, "responsable.demo");

  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("Fonction 7.1 — Dates invalides E2E");
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();
  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");
  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  await page.locator("#reschedule-openAt").fill("2026-09-20T18:00");
  await page.locator("#reschedule-closeAt").fill("2026-09-05T08:00"); // fermeture AVANT ouverture
  await page.getByRole("button", { name: /reprogrammer l'examen/i }).click();

  await expect(page.getByText(/postérieure à la date d'ouverture/i)).toBeVisible();
});

test("D — l'auditeur ne voit aucune section de reprogrammation (lecture seule, cohérent avec le reste de la fiche examen)", async ({ page }) => {
  await loginAs(page, "auditeur.demo");
  await page.goto("/exam-preparation");
  await page.getByRole("link", { name: /Reprogrammation E2E/i }).first().click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await expect(page.getByText("Reprogrammer l'examen")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^suspendre$/i })).toHaveCount(0);
});

test("E — le candidat n'a structurellement aucun accès à /exam-preparation (RBAC serveur, pas juste une UI masquée)", async ({ page }) => {
  await loginAs(page, "candidat1.demo");
  await page.goto("/exam-preparation");
  await expect(page.getByText(/accès refusé/i)).toBeVisible();
});
