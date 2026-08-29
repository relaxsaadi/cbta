import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers";

// Scénario J — mission email §61-69 : acceptance E2E du sous-système de
// notification. Fixtures créées par scripts/seed-email-demo.ts (voir
// tests/e2e/global-setup.ts), lues ici depuis .email-fixtures.json —
// jamais un token/donnée fabriqué inline dans le test lui-même.
//
// Lecture PARESSEUSE (à l'intérieur de chaque test, jamais au chargement
// du module) : globalSetup ne garantit pas d'avoir déjà tourné au moment
// où Playwright importe les fichiers de spec pour construire son plan de
// test — seulement avant l'EXÉCUTION effective des tests.
interface EmailFixture {
  activationToken: string;
  activationCandidateUsername: string;
  activationCandidateFullName: string;
  isolationManagerUsername: string;
  isolationCandidateFullName: string;
  demoManagerUsername: string;
}
function loadFixture(): EmailFixture {
  return JSON.parse(readFileSync(new URL("./.email-fixtures.json", import.meta.url), "utf-8")) as EmailFixture;
}

// §61 — un candidat créé par l'admin (ici via fixture, même flux réel que
// l'invitation via le groupe) active son compte lui-même : jamais de mot
// de passe communiqué par email, uniquement un jeton à usage unique.
test("§61 — un candidat active son compte via le jeton reçu, puis se connecte avec le mot de passe qu'il a choisi", async ({ page }) => {
  const fixture = loadFixture();
  await page.goto(`/activer?token=${fixture.activationToken}`);
  await page.getByLabel("Nouveau mot de passe").fill("MonMotDePasseE2E123!");
  await page.getByLabel("Confirmer le mot de passe").fill("MonMotDePasseE2E123!");
  await page.getByRole("button", { name: /créer mon mot de passe/i }).click();

  await expect(page.getByText(/compte activé/i)).toBeVisible();
  await page.getByRole("link", { name: /accéder à kost e-exam/i }).click();
  await page.waitForURL(/\/login/);

  await loginAs(page, fixture.activationCandidateUsername, "MonMotDePasseE2E123!");
  await expect(page).not.toHaveURL(/\/login/);
});

// §62 — affecter un examen à un candidat déclenche réellement EXAM_ASSIGNED,
// observable dans l'historique admin (jamais vérifié directement en base —
// toujours via l'UI réelle, cohérent avec le reste de la suite e2e).
test("§62 — affecter un candidat à un examen produit une ligne EXAM_ASSIGNED visible dans l'historique admin", async ({ page }) => {
  const fixture = loadFixture();
  await loginAs(page, fixture.demoManagerUsername);
  await page.goto("/exam-preparation");
  await page.getByRole("link", { name: /DGR Fonction 7\.1 — Test démo/ }).click();
  await page.waitForURL(/\/exam-preparation\/\d+/);

  await expect(page.getByText(/Affecter d'autres candidats/)).toBeVisible();
  await page.getByLabel(new RegExp(fixture.activationCandidateFullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).check();
  await page.getByRole("button", { name: /affecter la sélection/i }).click();
  await expect(page.getByText(/affecté/i)).toBeVisible();

  await logout(page);
  await loginAs(page, "admin");
  await page.goto("/notifications?event=EXAM_ASSIGNED");
  const row = page.getByRole("row").filter({ hasText: fixture.activationCandidateFullName });
  await expect(row.first()).toBeVisible();
});

// §69 — l'auditeur a un accès en lecture seule structurel : aucune action
// d'envoi/renvoi ne doit lui être proposée, même si les lignes restent
// visibles (transparence sans capacité d'écriture).
test("§69 — l'auditeur voit l'historique des notifications mais ne voit AUCUN bouton Renvoyer", async ({ page }) => {
  await loginAs(page, "auditeur.demo");
  await page.goto("/notifications");
  await expect(page.getByText(/notification\(s\)/)).toBeVisible();
  await expect(page.getByRole("button", { name: /renvoyer/i })).toHaveCount(0);
});

// §48/§68 — isolation multi-client : un responsable pédagogique ne doit
// JAMAIS voir l'historique de notification d'un candidat d'un autre
// client, même si les deux lignes existent dans la même base.
test("§48/§68 — un responsable pédagogique ne voit jamais l'historique de notification d'un autre client", async ({ page }) => {
  const fixture = loadFixture();
  await loginAs(page, fixture.demoManagerUsername);
  await page.goto("/notifications");
  await expect(page.getByText(fixture.isolationCandidateFullName)).toHaveCount(0);

  await logout(page);
  await loginAs(page, fixture.isolationManagerUsername);
  await page.goto("/notifications");
  await expect(page.getByText(fixture.activationCandidateFullName)).toHaveCount(0);
  // Le responsable isolé voit bien SA propre notification (ACCOUNT_CREATED
  // du candidat de son propre groupe) — la frontière filtre, elle ne vide
  // pas silencieusement tout le monde.
  await expect(page.getByText(fixture.isolationCandidateFullName)).toBeVisible();
});
