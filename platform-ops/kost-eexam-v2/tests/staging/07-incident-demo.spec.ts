import { test, expect } from "@playwright/test";
import { loginAs, env } from "./helpers";

// §8 de la phase — utilise le compte dédié incident-demo.staging, JAMAIS
// un des 3 candidats du pilote d'examen (§8 : « Do not affect the main
// exam-demo candidate »).
test("incident réel — suspension bloque la connexion, réactivation la restaure, trace d'audit présente", async ({ browser }) => {
  const adminContext = await browser.newContext({ extraHTTPHeaders: {} });
  const adminPage = await adminContext.newPage();
  await loginAs(adminPage, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));

  await adminPage.goto("/incidents");
  await adminPage.locator('select[name="type"]').selectOption("security");
  await adminPage.locator('textarea[name="description"]').fill("Pilote staging — test réel de suspension/réactivation de compte (compte dédié, aucun candidat d'examen affecté).");
  await adminPage.getByRole("button", { name: /déclarer un incident/i }).click();
  await adminPage.waitForURL(/\/incidents\/\d+/);

  const userBlock = adminPage.locator("div").filter({ hasText: "Compte utilisateur" }).first();
  await userBlock.locator('select[name="targetId"]').first().selectOption({ label: "Compte Démo Incident (incident-demo.staging)" });
  await userBlock.getByRole("button", { name: /^suspendre$/i }).first().click();
  await expect(adminPage.getByText(/suspend_account/)).toBeVisible();

  // Vérification réelle : connexion bloquée.
  const demoContext = await browser.newContext();
  const demoPage = await demoContext.newPage();
  await demoPage.goto("/login");
  await demoPage.getByLabel("Nom d'utilisateur").fill(env("STAGING_INCIDENT_DEMO_USER"));
  await demoPage.getByLabel("Mot de passe").fill(env("STAGING_INCIDENT_DEMO_PASS"));
  await demoPage.getByRole("button", { name: /se connecter/i }).click();
  await expect(demoPage.getByText(/suspendu/i)).toBeVisible();
  await expect(demoPage).toHaveURL(/\/login/);

  // Réactivation.
  await adminPage.reload();
  const userBlock2 = adminPage.locator("div").filter({ hasText: "Compte utilisateur" }).first();
  await userBlock2.locator('select[name="targetId"]').nth(1).selectOption({ label: "Compte Démo Incident (incident-demo.staging)" });
  await userBlock2.getByRole("button", { name: /^réactiver$/i }).click();
  await expect(adminPage.getByText(/reactivate_account/)).toBeVisible();

  // Connexion restaurée.
  await demoPage.getByLabel("Nom d'utilisateur").fill(env("STAGING_INCIDENT_DEMO_USER"));
  await demoPage.getByLabel("Mot de passe").fill(env("STAGING_INCIDENT_DEMO_PASS"));
  await demoPage.getByRole("button", { name: /se connecter/i }).click();
  await demoPage.waitForURL((url) => !url.pathname.startsWith("/login"));

  // Journal d'audit.
  await adminPage.goto("/audit-logs");
  await expect(adminPage.getByText("incident_action_suspend_account").first()).toBeVisible();
  await expect(adminPage.getByText("incident_action_reactivate_account").first()).toBeVisible();

  // Le pilote d'examen (candidat1/2/3) n'a jamais été affecté — vérifie
  // que candidat1 peut toujours se connecter normalement.
  const candidateContext = await browser.newContext();
  const candidatePage = await candidateContext.newPage();
  await loginAs(candidatePage, env("STAGING_CANDIDATE1_USER"), env("STAGING_CANDIDATE1_PASS"));
  await expect(candidatePage).not.toHaveURL(/\/login/);

  await adminContext.close();
  await demoContext.close();
  await candidateContext.close();
});
