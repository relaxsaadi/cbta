import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario F (§29) : Admin → résultats → clic candidat → voit chaque
// question/réponse. Dépend d'une tentative déjà soumise — l'ordre
// alphabétique des fichiers (b, c, e, f…) garantit que le scénario C
// (candidat1.demo passe l'examen démo) s'exécute avant celui-ci, dans la
// même base de test partagée pour tout le run (voir playwright.config.ts).
test("l'administrateur voit le détail question par question d'une tentative", async ({ page }) => {
  await loginAs(page, "admin");

  await page.goto("/results");
  await expect(page.getByText("Karim Belaid (démo)")).toBeVisible();
  await page.getByRole("link", { name: "Karim Belaid (démo)" }).first().click();

  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText(/Questions et réponses/)).toBeVisible();
  await expect(page.getByText(/^Q1\./)).toBeVisible();
  await expect(page.getByText(/Points : /).first()).toBeVisible();
});
