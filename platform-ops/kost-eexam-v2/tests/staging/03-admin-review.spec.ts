import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §7 RESPONSABLE / ADMIN — voit la tentative complète, question par
// question, réponse candidat, réponse correcte, correct/incorrect, points,
// score/100, pourcentage, réussi/échoué. Utilise les tentatives réelles
// créées par candidat1 (100%, réussi) et candidat2 (42.86%, échoué).
test("l'administrateur voit le détail complet des tentatives réelles", async ({ page }) => {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  await page.goto("/results");
  // getByRole('link', ...) plutôt que getByText : le panneau de filtres
  // (addendum §7) inclut désormais un <select> "Candidat" dont chaque
  // <option> contient le même nom en sous-chaîne — un getByText nu
  // matcherait aussi l'option masquée du select fermé (ambiguïté).
  // .first() : Yasmine/Riad ont désormais plusieurs tentatives réelles
  // (banque Tier A élargie, plusieurs fonctions — voir
  // 31-tier-a-multi-function-acceptance.spec.ts), pas seulement le pilote
  // 7.1 — simple vérification de présence ici, pas d'identité précise.
  await expect(page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Riad Boumediene (pilote)" }).first()).toBeVisible();

  // Tentative réussie (candidat 1).
  await page.getByRole("link", { name: "Yasmine Kaced (pilote)" }).first().click();
  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText("100/100")).toBeVisible();
  // "ADMIS"/"ÉCHEC" — mention exacte demandée par l'addendum auditeur §3
  // pour le rapport individuel (distincte de "Réussi"/"Échoué" utilisé
  // ailleurs, ex. la liste /results — changement intentionnel, propre à
  // cette page).
  await expect(page.getByText("ADMIS")).toBeVisible();
  await expect(page.getByText(/^Q1\./)).toBeVisible();
  // Le texte réel de la première question doit apparaître (pas un
  // placeholder) — preuve que le contenu affiché est le vrai contenu DGR.
  await expect(page.getByText(/marchandise dangereuse/i).first()).toBeVisible();
  await expect(page.getByText(/Points : 1 \/ 1/).first()).toBeVisible();

  // Tentative échouée (candidat 2) — spécifiquement l'examen pilote 7.1
  // (42.86%), pas ".first()" : Riad a désormais d'autres tentatives
  // réelles (banque Tier A élargie) toutes réussies à 100%, donc scoper
  // par ligne <tr> contenant le nom ET l'examen pilote précis.
  await page.goto("/results");
  await page
    .locator("tr", { hasText: "Riad Boumediene (pilote)" })
    .filter({ hasText: "DGR Fonction 7.1 — Examen pilote staging" })
    .getByRole("link", { name: "Riad Boumediene (pilote)" })
    .click();
  await page.waitForURL(/\/results\/\d+/);
  await expect(page.getByText("42.86/100")).toBeVisible();
  await expect(page.getByText("ÉCHEC")).toBeVisible();
  // Au moins une réponse incorrecte doit apparaître (4/7 volontairement
  // fausses).
  await expect(page.getByText("Incorrect").first()).toBeVisible();
});
