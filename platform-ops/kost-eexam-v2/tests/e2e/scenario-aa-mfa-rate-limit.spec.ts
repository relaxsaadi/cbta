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
  // `useActionState` conserve l'ancien state.error pendant que la Server
  // Action suivante est en vol. Sans attendre la réponse POST, l'assertion
  // qui suit pouvait donc valider immédiatement l'ancien "Code invalide"
  // et laisser la boucle enchaîner avant que le compteur ait réellement été
  // incrémenté. Attendre la réponse du POST rend chaque tentative strictement
  // séquentielle et prouve le comportement du vrai boundary serveur.
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === "POST" && new URL(r.url()).pathname === "/login/verifier-mfa"),
    page.getByRole("button", { name: /^valider$/i }).click(),
  ]);
  expect(response.status(), "la Server Action MFA doit répondre sans erreur HTTP").toBeLessThan(500);
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

test("#57 — a final MFA success-audit failure revokes the staged session, restores the recovery code, denies the staged cookie, and a clean retry succeeds once", async ({ page }) => {
  const u = createManager({ recoveryCodes: true });
  const recoveryCode = u.recovery!.plain[0]!;
  const originalRecoveryJson = u.recovery!.hashedJson;

  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);

  // Force the SECOND success record to fail. The recovery-code success audit
  // is written first inside commitMfaLoginSuccessAudit(), so this proves the
  // transaction rolls that first row back instead of leaving partial success
  // evidence after iron-session has already attempted to stage auth state.
  const triggerName = `force_mfa_final_login_audit_failure_${u.userId}`;
  const setupDb = openDb();
  setupDb.exec(
    `CREATE TRIGGER ${triggerName}
     BEFORE INSERT ON audit_logs
     WHEN NEW.actor_user_id = ${u.userId}
       AND NEW.action = 'login'
       AND NEW.result = 'success'
     BEGIN
       SELECT RAISE(ABORT, 'forced_mfa_final_login_audit_failure');
     END`
  );
  setupDb.close();

  await page.getByLabel("Code").fill(recoveryCode);
  try {
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.request().method() === "POST" && new URL(r.url()).pathname === "/login/verifier-mfa"),
      page.getByRole("button", { name: /^valider$/i }).click(),
    ]);
    expect(response.status(), "l'échec injecté doit faire échouer la finalisation HTTP").toBeGreaterThanOrEqual(500);
  } finally {
    const cleanupDb = openDb();
    cleanupDb.exec(`DROP TRIGGER IF EXISTS ${triggerName}`);
    cleanupDb.close();
  }

  const failedDb = openDb();
  const failedUser = failedDb
    .prepare(`SELECT mfa_recovery_codes_json, last_login_at FROM users WHERE id = ?`)
    .get(u.userId) as { mfa_recovery_codes_json: string; last_login_at: string | null };
  expect(failedUser.mfa_recovery_codes_json).toBe(originalRecoveryJson);
  expect(failedUser.last_login_at).toBeNull();
  const failedActiveSessions = failedDb
    .prepare(`SELECT COUNT(*) n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(u.userId) as { n: number };
  expect(failedActiveSessions.n).toBe(0);
  const failedLoginAudits = failedDb
    .prepare(`SELECT COUNT(*) n FROM audit_logs WHERE actor_user_id = ? AND action = 'login' AND result = 'success'`)
    .get(u.userId) as { n: number };
  const failedRecoveryAudits = failedDb
    .prepare(`SELECT COUNT(*) n FROM audit_logs WHERE actor_user_id = ? AND action = 'mfa_recovery_code_used' AND result = 'success'`)
    .get(u.userId) as { n: number };
  expect(failedLoginAudits.n).toBe(0);
  expect(failedRecoveryAudits.n).toBe(0);
  failedDb.close();

  // Whether the browser retained the staged encrypted cookie or received the
  // destroy header, it must not authorize a protected route because the DB
  // session was revoked by compensation.
  await page.goto("/overview");
  await page.waitForURL(/\/login(?:\?|$)/);

  // Failure destroyed the pending MFA state, so restart factor 1 and replay
  // the SAME recovery code. It must remain usable because compensation
  // restored it, then converge to exactly one durable success pair.
  await passwordLogin(page, u.username, u.password);
  await page.waitForURL(/\/login\/verifier-mfa/);
  await submitMfa(page, recoveryCode);
  await page.waitForURL(/\/overview/);

  const retryDb = openDb();
  const retryUser = retryDb
    .prepare(`SELECT mfa_recovery_codes_json, last_login_at FROM users WHERE id = ?`)
    .get(u.userId) as { mfa_recovery_codes_json: string; last_login_at: string | null };
  expect(JSON.parse(retryUser.mfa_recovery_codes_json)).toHaveLength(7);
  expect(retryUser.last_login_at).not.toBeNull();
  const retryActiveSessions = retryDb
    .prepare(`SELECT COUNT(*) n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(u.userId) as { n: number };
  expect(retryActiveSessions.n).toBe(1);
  const retryLoginAudits = retryDb
    .prepare(`SELECT COUNT(*) n FROM audit_logs WHERE actor_user_id = ? AND action = 'login' AND result = 'success'`)
    .get(u.userId) as { n: number };
  const retryRecoveryAudits = retryDb
    .prepare(`SELECT COUNT(*) n FROM audit_logs WHERE actor_user_id = ? AND action = 'mfa_recovery_code_used' AND result = 'success'`)
    .get(u.userId) as { n: number };
  expect(retryLoginAudits.n).toBe(1);
  expect(retryRecoveryAudits.n).toBe(1);
  retryDb.close();
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
