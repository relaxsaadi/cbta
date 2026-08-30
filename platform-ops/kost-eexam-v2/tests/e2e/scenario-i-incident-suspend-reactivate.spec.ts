import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

// Scénario I (§29) : Incident → suspendre compte → session révoquée →
// connexion bloquée → réactiver → journal d'audit présent. Chaque action a
// un effet réel vérifié (pas seulement un statut affiché).
test("suspendre un compte via un incident bloque réellement la connexion, réactiver la restaure", async ({ browser }) => {
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await loginAs(adminPage, "admin");

  await adminPage.goto("/incidents");
  await adminPage.locator('select[name="type"]').selectOption("security");
  await adminPage.locator('textarea[name="description"]').fill("Test E2E — comportement suspect signalé pour Yacine Haddad (démo)");
  await adminPage.getByRole("button", { name: /déclarer un incident/i }).click();
  await adminPage.waitForURL(/\/incidents\/\d+/);

  // Suspend le compte candidat3.demo (Yacine Haddad) depuis le sélecteur
  // "Compte utilisateur".
  const userBlock = adminPage.locator("div").filter({ hasText: "Compte utilisateur" }).first();
  await userBlock.locator('select[name="targetId"]').first().selectOption({ label: "Yacine Haddad (démo) (candidat3.demo)" });
  await userBlock.getByRole("button", { name: /^suspendre$/i }).first().click();
  await expect(adminPage.getByText(/suspend_account/)).toBeVisible();

  // Vérification réelle : la connexion doit maintenant échouer.
  const candidateContext = await browser.newContext();
  const candidatePage = await candidateContext.newPage();
  await candidatePage.goto("/login");
  await candidatePage.getByLabel("Nom d'utilisateur").fill("candidat3.demo");
  await candidatePage.getByLabel("Mot de passe").fill("ChangeMoi123!");
  await candidatePage.getByRole("button", { name: /se connecter/i }).click();
  await expect(candidatePage.getByText(/suspendu/i)).toBeVisible();
  await expect(candidatePage).toHaveURL(/\/login/);

  // Réactivation.
  await adminPage.reload();
  const userBlock2 = adminPage.locator("div").filter({ hasText: "Compte utilisateur" }).first();
  await userBlock2.locator('select[name="targetId"]').nth(1).selectOption({ label: "Yacine Haddad (démo) (candidat3.demo)" });
  await userBlock2.getByRole("button", { name: /^réactiver$/i }).click();
  await expect(adminPage.getByText(/reactivate_account/)).toBeVisible();

  // La connexion doit maintenant refonctionner.
  await candidatePage.getByLabel("Nom d'utilisateur").fill("candidat3.demo");
  await candidatePage.getByLabel("Mot de passe").fill("ChangeMoi123!");
  await candidatePage.getByRole("button", { name: /se connecter/i }).click();
  await candidatePage.waitForURL((url) => !url.pathname.startsWith("/login"));

  // Journal d'audit — les deux actions doivent être tracées, insert-only.
  // getByRole('cell', ...) plutôt que getByText : le panneau de filtres
  // (mission "COMPLETE MISSING FILTERS", 2026-08-30) ajoute un <select>
  // Action dont chaque <option> porte le même texte que le nom d'action —
  // un getByText nu matcherait aussi cette <option>, jamais visible dans
  // un <select> fermé (violation du mode strict).
  await adminPage.goto("/audit-logs");
  await expect(adminPage.getByRole("cell", { name: "incident_action_suspend_account", exact: true })).toBeVisible();
  await expect(adminPage.getByRole("cell", { name: "incident_action_reactivate_account", exact: true })).toBeVisible();

  await adminContext.close();
  await candidateContext.close();
});
