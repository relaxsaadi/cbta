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
  // Root cause investigated (2026-08-29) — jamais un defect produit :
  // getByText() fait un match par SOUS-CHAINE par défaut, et le
  // <select id="candidateUserId"> de cette même page a une <option>
  // "{full_name} ({company_name})" qui CONTIENT "Karim Belaid (démo)"
  // comme sous-chaîne — deux éléments légitimes correspondent donc à un
  // getByText() non scopé. Locator robuste : cibler directement le rôle
  // "link" (le tableau de résultats, jamais le filtre), cohérent avec la
  // ligne suivante qui fait déjà exactement ça pour le clic.
  await expect(page.getByRole("link", { name: "Karim Belaid (démo)" }).first()).toBeVisible();
  await page.getByRole("link", { name: "Karim Belaid (démo)" }).first().click();

  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText(/Questions et réponses/)).toBeVisible();
  await expect(page.getByText(/^Q1\./)).toBeVisible();
  await expect(page.getByText(/Points : /).first()).toBeVisible();
});
