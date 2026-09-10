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

  // Cible explicitement le formulaire de suspension : les trois actions
  // Compte utilisateur ont chacune leur propre <select name="targetId">.
  // Le sélecteur historique sur un grand <div> pouvait associer le select
  // d'un formulaire au bouton d'un autre lorsque la liste d'utilisateurs
  // devenait longue après d'autres scénarios E2E.
  const suspendForm = adminPage.locator("form").filter({ has: adminPage.getByRole("button", { name: /^suspendre$/i }) }).first();
  await suspendForm.locator('select[name="targetId"]').selectOption({ label: "Yacine Haddad (démo) (candidat3.demo)" });
  await suspendForm.getByRole("button", { name: /^suspendre$/i }).press("Enter");
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

  // Réactivation : même isolation du formulaire, sans dépendre de nth(1)
  // sur une collection de selects issue d'un conteneur trop large.
  await adminPage.reload();
  const reactivateForm = adminPage.locator("form").filter({ has: adminPage.getByRole("button", { name: /^réactiver$/i }) }).first();
  await reactivateForm.locator('select[name="targetId"]').selectOption({ label: "Yacine Haddad (démo) (candidat3.demo)" });
  await reactivateForm.getByRole("button", { name: /^réactiver$/i }).press("Enter");
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
