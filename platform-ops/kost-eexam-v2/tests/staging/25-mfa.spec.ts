import { test, expect, type Page } from "@playwright/test";
import { loginAs, env } from "./helpers";
import { totpAt } from "../../lib/mfa";

// Mission "PRODUCTION READINESS" §25 — MFA natif (TOTP RFC 6238 + codes de
// secours). Compte de test DÉDIÉ et FIXE (jamais le compte
// administrateur/responsable partagé utilisé par tout le reste de la
// suite) : activer MFA sur le compte partagé bloquerait `loginAs()` pour
// TOUS les autres fichiers de test (qui ne savent pas produire de code
// TOTP). Auto-guérison en tête de fichier : si une exécution précédente a
// été interrompue avant son propre nettoyage, l'administrateur réinitialise
// MFA sur ce compte AVANT de commencer (même philosophie que
// 17-incident-platform-actions.spec.ts).
const TEST_USER_FULLNAME = "Vérification MFA — Compte dédié";
const TEST_USERNAME = "mfa.e2e.check";
const TEST_PASSWORD = "MotDePasseMfa2026!";

async function ensureCleanMfaTestAccount(page: Page) {
  await loginAs(page, env("STAGING_ADMIN_USER"), env("STAGING_ADMIN_PASS"));
  await page.goto("/users");

  const alreadyExists = await page
    .getByTestId(`user-row-${TEST_USERNAME}`)
    .isVisible()
    .catch(() => false);

  if (!alreadyExists) {
    await page.getByLabel("Nom complet").fill(TEST_USER_FULLNAME);
    await page.getByLabel("Identifiant").fill(TEST_USERNAME);
    await page.getByLabel("Mot de passe", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Rôle").selectOption("pedagogical_manager");
    await page.getByRole("button", { name: /^créer$/i }).click();
    await expect(page.getByText(new RegExp(`Compte ${TEST_USERNAME} créé`))).toBeVisible();
  } else {
    // Auto-guérison : une exécution précédente a laissé MFA activé
    // (interrompue avant son propre nettoyage) — le secret de cette
    // exécution-là est perdu avec le process qui l'a généré ; seule la
    // voie de récupération administrateur peut redémarrer le compte à
    // zéro.
    const row = page.getByTestId(`user-row-${TEST_USERNAME}`);
    const mfaBadgeVisible = await row.getByText("MFA actif").isVisible().catch(() => false);
    if (mfaBadgeVisible) {
      await row.getByRole("button", { name: /réinitialiser mfa/i }).click();
      await expect(row.getByText("MFA actif")).not.toBeVisible();
    }
  }
}

/** Lit le secret formaté affiché ("XXXX XXXX XXXX XXXX XXXX") et calcule le
 * code TOTP courant avec la MÊME implémentation que le serveur (lib/mfa.ts,
 * fonctions pures — aucun accès DB depuis ce contexte de test HTTP-only,
 * voir tests/staging/helpers.ts). */
function currentTotpCode(formattedSecret: string): string {
  const rawSecret = formattedSecret.replace(/\s+/g, "");
  return totpAt(rawSecret, Date.now());
}

async function enrollMfa(page: Page): Promise<{ formattedSecret: string; recoveryCodes: string[] }> {
  await page.goto("/mon-compte");
  await page.getByRole("button", { name: /activer mfa/i }).click();
  const secretLocator = page.getByTestId("mfa-secret");
  await expect(secretLocator).toBeVisible();
  const formattedSecret = (await secretLocator.textContent())!.trim();
  expect(formattedSecret).toMatch(/^[A-Z2-7]{4}( [A-Z2-7]{4}){4,7}$/);

  await page.locator("#mfa-confirm-code").fill(currentTotpCode(formattedSecret));
  await page.getByRole("button", { name: /^confirmer$/i }).click();
  await expect(page.getByText(/mfa activé/i)).toBeVisible();

  const recoveryCodes = await page.getByTestId("mfa-recovery-code").allTextContents();
  expect(recoveryCodes.length).toBe(8);
  for (const code of recoveryCodes) expect(code).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);

  return { formattedSecret, recoveryCodes };
}

async function disableMfaSelfService(page: Page) {
  await page.goto("/mon-compte");
  await page.getByRole("button", { name: /désactiver mfa/i }).click();
  await page.getByLabel(/confirmez votre mot de passe/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /^désactiver$/i }).click();
  await expect(page.getByRole("button", { name: /activer mfa/i })).toBeVisible();
}

test("cycle complet — enrôlement, connexion bloquée sans 2e facteur, code TOTP valide/invalide", async ({ page }) => {
  await ensureCleanMfaTestAccount(page);

  // Connexion normale (MFA pas encore activé) — accès direct, aucune
  // étape supplémentaire.
  await page.context().clearCookies();
  await loginAs(page, TEST_USERNAME, TEST_PASSWORD);
  await expect(page).toHaveURL(/\/overview/);

  const { formattedSecret } = await enrollMfa(page);

  // Nouvelle connexion : mot de passe seul ne suffit plus — jamais
  // d'accès direct à une route protégée.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(TEST_USERNAME);
  await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/login\/verifier-mfa/);

  // Code invalide rejeté, reste sur la page de vérification.
  await page.getByLabel("Code").fill("000000");
  await page.getByRole("button", { name: /^valider$/i }).click();
  await expect(page.getByText(/code invalide/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login\/verifier-mfa/);

  // Code TOTP correct — accès accordé.
  await page.getByLabel("Code").fill(currentTotpCode(formattedSecret));
  await page.getByRole("button", { name: /^valider$/i }).click();
  await page.waitForURL(/\/overview/);

  // Nettoyage — désactivation en libre-service (mot de passe requis),
  // pour que la prochaine exécution reparte d'un compte sans MFA sans
  // dépendre de la voie de récupération administrateur.
  await disableMfaSelfService(page);
});

test("codes de secours — usage unique, un code réutilisé est rejeté", async ({ page }) => {
  await ensureCleanMfaTestAccount(page);
  await page.context().clearCookies();
  await loginAs(page, TEST_USERNAME, TEST_PASSWORD);

  const { recoveryCodes } = await enrollMfa(page);
  const [firstCode, secondCode] = recoveryCodes;

  // 1er code de secours — accepté en remplacement du TOTP.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(TEST_USERNAME);
  await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/login\/verifier-mfa/);
  await page.getByLabel("Code").fill(firstCode!);
  await page.getByRole("button", { name: /^valider$/i }).click();
  await page.waitForURL(/\/overview/);

  // Réutilisation du MÊME code de secours — refusée (usage unique).
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(TEST_USERNAME);
  await page.getByLabel("Mot de passe").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/login\/verifier-mfa/);
  await page.getByLabel("Code").fill(firstCode!);
  await page.getByRole("button", { name: /^valider$/i }).click();
  await expect(page.getByText(/code invalide/i)).toBeVisible();

  // Un 2e code, jamais utilisé, reste valide — la révocation d'un code
  // n'invalide pas les autres.
  await page.getByLabel("Code").fill(secondCode!);
  await page.getByRole("button", { name: /^valider$/i }).click();
  await page.waitForURL(/\/overview/);

  // Nettoyage.
  await disableMfaSelfService(page);
});
