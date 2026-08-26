import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §6/§7 de la phase : le responsable pédagogique crée un EXAMEN réel
// Fonction 7.1 via l'assistant réel (pas un appel direct aux fonctions
// lib) — 7 questions admissibles disponibles (les 5 autres FROZEN et les
// 10 items du pilote 12-items ne sont pas récupérables depuis cet
// environnement, voir docs/KOST_EEXAM_V2_ARCHITECTURE.md et le rapport de
// phase), donc "10 aléatoires si disponibles, sinon le nombre réel" → 7.
test("le responsable pédagogique crée et publie l'examen réel Fonction 7.1", async ({ page }) => {
  await loginAs(page, env("STAGING_MANAGER_USER"), env("STAGING_MANAGER_PASS"));

  await page.goto("/groups");
  await expect(page.getByText("Air Algérie — DGR Démonstration")).toBeVisible();

  await page.goto("/exam-preparation");
  await expect(page.getByText(/Questions admissibles disponibles/)).toBeVisible();

  // Le radio est visuellement masqué (sr-only, wrapper stylé) et le
  // topbar sticky peut intercepter le clic sur le label après défilement —
  // cible l'input directement, avec force.
  await page.locator('input[name="type"][value="examen"]').check({ force: true });
  await page.locator('select[name="groupId"]').selectOption({ label: "Air Algérie — DEMO — Air Algérie — DGR Démonstration" });
  await page.locator('select[name="functionCode"]').selectOption("7.1");
  await page.locator("#name").fill("DGR Fonction 7.1 — Examen pilote staging");

  // Vérifie que le compte réel s'affiche (7 questions FROZEN récupérables).
  await expect(page.getByText("Questions admissibles disponibles :")).toBeVisible();
  await expect(page.locator("text=Questions admissibles disponibles :").locator("xpath=..")).toContainText("7");

  await page.locator("#questionCount").fill("7");
  await page.locator("#durationMinutes").fill("30");
  await page.locator("#passThresholdPct").fill("80");
  await page.locator("#attemptsAllowed").fill("1");
  // Mélange activé là où supporté (§6) — cases déjà cochées par défaut,
  // on vérifie explicitement plutôt que de supposer.
  await expect(page.locator('input[name="shuffleQuestions"]')).toBeChecked();
  await expect(page.locator('input[name="shuffleAnswers"]')).toBeChecked();
  // Visibilité du résultat candidat après soumission (§6).
  await page.locator('input[name="showResult"]').check();

  await page.getByRole("button", { name: /créer le brouillon/i }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);
  await expect(page.getByText("draft")).toBeVisible();

  await page.getByRole("button", { name: /^publier$/i }).click();
  await expect(page.getByText(/^published$/).first()).toBeVisible();

  // Suivi des candidats — les 3 candidats pilotes doivent apparaître,
  // aucun commencé pour l'instant.
  await expect(page.getByText(/Suivi des candidats/)).toBeVisible();
  await expect(page.getByText(/3 non commencé/)).toBeVisible();
  await expect(page.getByText("Yasmine Kaced (pilote)")).toBeVisible();
  await expect(page.getByText("Riad Boumediene (pilote)")).toBeVisible();
  await expect(page.getByText("Amel Ferhati (pilote)")).toBeVisible();
});
