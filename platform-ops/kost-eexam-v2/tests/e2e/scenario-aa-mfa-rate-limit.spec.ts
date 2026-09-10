import { test, expect, type Page } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { logout } from "./helpers";
import { hashPassword } from "../../lib/passwords";
import { generateMfaSecret, generateRecoveryCodes, totpAt } from "../../lib/mfa";

function uniqueTag() {
  return `aa${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function openDb() {
  return new DatabaseSync(resolve(import.meta.dirname, "../../data/e2e-test.db"));
}

function createManager(params: { recoveryCodes?: boolean; mfa?: boolean } = {}) {
  const tag = uniqueTag();
  const username = `${tag}.rate-limit-manager`;
  const password = `MotDePasse-E2E-${tag}!`;
  const secret = generateMfaSecret();
  const recovery = params.recoveryCodes ? generateRecoveryCodes() : null;
  const db = openDb();
  const role = db.prepare(`SELECT id FROM roles WHERE code = 'pedagogical_manager'`).get() as { id: number };
  const insert = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, status, mfa_enabled, mfa_secret, mfa_recovery_codes_json)
              VALUES (?, ?, ?, 'active', ?, ?, ?)`) 
    .run(
      username,
      hashPassword(password),
      `MFA Rate Limit ${tag}`,
      params.mfa === false ? 0 : 1,
      params.mfa === false ? null : secret,
      params.mfa === false ? null : recovery?.hashedJson ?? null,
    );
  const userId = Number(insert.lastInsertRowid);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, role.id);
  db.close();
  return { userId, username, password, secret, recovery };
}

function invalidTotp(secret: string): string {
  const now = Date.now();
  const valid = new Set([
    totpAt(secret, now - 30_000),
    totpAt(secret, now),
    totpAt(secret, now + 30_000),
  ]);
  for (let n = 0; n < 100; n += 1) {
    const candidate = String(n).padStart(6, "0");
    if (!valid.has(candidate)) return candidate;
  }
  throw new Error("Impossible de produire un code TOTP invalide déterministe");
}

async function passwordLogin(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill(username);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
}

async function submitMfa(page: Page, code: string) {
  await page.getByLabel("Code").fill(code);
  await page.getByRole("button", { name: /^valider$/i }).click();
}

test.describe.configure({ mode: "serial" });

test("#47 — rejouer le bon mot de passe ne remet jamais à zéro les échecs MFA; la tentative bloquée ne consomme pas le recovery code", async ({ page }) => {
  const u = createManager({ recoveryCodes: true });
  const originalRecoveryJson = u.recovery!.hashedJson;

  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);

  for (let i = 0; i < 4; i += 1) {
    await submitMfa(page, invalidTotp(u.secret));
    await expect(page.locator('p[role="alert"]')).toContainText("Code invalide");
  }

  // C'est exactement le bypass historique : une nouvelle soumission du bon
  // mot de passe, depuis le même navigateur/IP, ne doit plus effacer le
  // bucket MFA accumulé.
  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);

  await submitMfa(page, invalidTotp(u.secret)); // cinquième échec : encore traité, puis bucket épuisé
  await expect(page.locator('p[role="alert"]')).toContainText("Code invalide");

  // La sixième tentative est un VRAI code de secours valide. Elle doit être
  // bloquée AVANT toute vérification/consommation du credential.
  await submitMfa(page, u.recovery!.plain[0]!);
  await expect(page.locator('p[role="alert"]')).toContainText(/Trop de tentatives échouées/i);

  const db = openDb();
  const user = db.prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`).get(u.userId) as { mfa_recovery_codes_json: string };
  expect(user.mfa_recovery_codes_json).toBe(originalRecoveryJson);
  const activeSessions = db.prepare(`SELECT COUNT(*) n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`).get(u.userId) as { n: number };
  expect(activeSessions.n).toBe(0);
  const successLogins = db.prepare(`SELECT COUNT(*) n FROM audit_logs WHERE actor_user_id = ? AND action = 'login' AND result = 'success'`).get(u.userId) as { n: number };
  expect(successLogins.n).toBe(0);
  db.close();
});

test("#47 — un succès MFA complet remet le bucket MFA à zéro pour la prochaine connexion légitime", async ({ page }) => {
  const u = createManager();

  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);
  for (let i = 0; i < 4; i += 1) {
    await submitMfa(page, invalidTotp(u.secret));
    await expect(page.locator('p[role="alert"]')).toContainText("Code invalide");
  }

  await submitMfa(page, totpAt(u.secret, Date.now()));
  await page.waitForURL(/\/overview/);
  await logout(page);

  // Si le succès précédent n'avait pas remis le bucket MFA à zéro, ces cinq
  // nouvelles erreurs ne pourraient pas toutes être traitées comme invalides.
  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);
  for (let i = 0; i < 5; i += 1) {
    await submitMfa(page, invalidTotp(u.secret));
    await expect(page.locator('p[role="alert"]')).toContainText("Code invalide");
  }
  await submitMfa(page, invalidTotp(u.secret));
  await expect(page.locator('p[role="alert"]')).toContainText(/Trop de tentatives échouées/i);
});

test("#47 — un compte sans MFA conserve le reset normal après une connexion réussie", async ({ page }) => {
  const u = createManager({ mfa: false });
  const wrong = `${u.password}-wrong`;

  for (let i = 0; i < 4; i += 1) {
    await passwordLogin(page, u.username, wrong);
    await expect(page.locator('p[role="alert"]')).toContainText(/Identifiant ou mot de passe incorrect/i);
  }

  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/overview/);
  await logout(page);

  // Le succès sans MFA est toujours le dernier facteur : il remet le bucket
  // password à zéro. Cinq nouveaux échecs sont donc traités avant blocage.
  for (let i = 0; i < 5; i += 1) {
    await passwordLogin(page, u.username, wrong);
    await expect(page.locator('p[role="alert"]')).toContainText(/Identifiant ou mot de passe incorrect/i);
  }
  await passwordLogin(page, u.username, wrong);
  await expect(page.locator('p[role="alert"]')).toContainText(/Trop de tentatives échouées/i);
});
