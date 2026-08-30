import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §4 de la phase — LA vérification critique : éditer la question source
// APRÈS que l'examen ait été publié (et déjà passé par de vrais candidats)
// ne doit JAMAIS modifier rétroactivement ce qui a été montré aux
// candidats. Édite Q-7.1-013 via l'UI réelle d'administration, puis
// revérifie la tentative déjà notée de candidat1 (Yasmine Kaced).
const MARKER = "[MODIFIÉ APRÈS PUBLICATION — TEST VERSIONNAGE]";

test("éditer une question après publication ne modifie jamais la tentative déjà notée", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  // /question-bank est désormais un tableau filtrable à plat (mission
  // "COMPLETE MISSING FILTERS", 2026-08-30) — chaque question est une
  // <tr>, plus une carte <div class="border-border-subtle">. On isole la
  // ligne via Fonction=7.1 (évite tout risque de doublon visuel si
  // Q-7.1-013 apparaissait ailleurs) puis on cible la ligne exacte.
  await page.goto("/question-bank?filterFunctionCode=7.1");
  const row = page.locator("table tbody tr").filter({ hasText: "Q-7.1-013" }).last();
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: /modifier/i }).click();

  await page.waitForURL(/\/question-bank\/\d+\/edit/);
  const stemField = page.locator("#stem");
  const originalStem = await stemField.inputValue();
  expect(originalStem).toContain("marchandise dangereuse");
  await stemField.fill(`${originalStem} ${MARKER}`);
  await page.getByRole("button", { name: /enregistrer une nouvelle version/i }).click();
  await page.waitForURL("/question-bank");

  // La banque affiche maintenant le texte MODIFIÉ (nouvelle version
  // courante).
  await expect(page.getByText(MARKER)).toBeVisible();

  // Mais la tentative déjà notée de candidat1 (Yasmine Kaced), publiée et
  // passée AVANT cette édition, doit continuer à montrer EXACTEMENT le
  // texte original — jamais le marqueur.
  await page.goto("/results");
  await page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first().click();
  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText(/marchandise dangereuse/i).first()).toBeVisible();
  await expect(page.getByText(MARKER)).toHaveCount(0);
});
