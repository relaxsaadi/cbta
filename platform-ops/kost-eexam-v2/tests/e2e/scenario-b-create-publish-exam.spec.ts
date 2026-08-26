import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario B (§29) : Responsable → créer un examen Fonction 7.1, 15 min,
// seuil 80%, publier. Utilise l'UI réelle de bout en bout (assistant
// Préparation des examens), pas un appel direct aux fonctions lib.
test("le responsable pédagogique crée, publie une évaluation et voit le suivi candidats", async ({ page }) => {
  await loginAs(page, "responsable.demo");

  await page.goto("/exam-preparation");
  await page.getByLabel("Nom de l'évaluation").fill("Fonction 7.1 — Examen E2E");
  // Sélectionne le groupe démo existant (créé par seed-demo).
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Septembre 2026 (DEMO)" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");

  // Étape 4 — attendre que le compte de questions admissibles se charge.
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();

  await page.locator('input[name="questionCount"]').fill("3");
  await page.locator('input[name="durationMinutes"]').fill("15");
  await page.locator('input[name="passThresholdPct"]').fill("80");

  await page.getByRole("button", { name: /créer le brouillon/i }).click();

  // Redirigé vers la fiche de l'évaluation — statut brouillon.
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await expect(page.getByText("draft")).toBeVisible();

  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // Le suivi des candidats doit apparaître — le groupe démo a 3 candidats.
  await expect(page.getByText(/Suivi des candidats/)).toBeVisible();
  await expect(page.getByText(/non commencé/)).toBeVisible();
});
