import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { generateMfaSecret, generateRecoveryCodes, totpAt } from "../../lib/mfa";
import { claimMfaLogin, compensateMfaLoginClaim } from "../../lib/mfa-login-boundary";
import type { ConsoleRole } from "../../lib/session";

before(() => setupTestDb());

let seq = 0;
function createMfaUser(role: ConsoleRole = "candidate", recovery = false) {
  seq += 1;
  const username = `mfa-boundary-${role}-${seq}`;
  const userId = createUser({
    username,
    password: `Strong-Test-Password-${seq}!`,
    fullName: `MFA Boundary ${seq}`,
    role,
  });
  const secret = generateMfaSecret();
  const recoveryCodes = recovery ? generateRecoveryCodes() : null;
  getDb()
    .prepare(
      `UPDATE users
       SET mfa_enabled = 1, mfa_secret = ?, mfa_recovery_codes_json = ?
       WHERE id = ?`
    )
    .run(secret, recoveryCodes?.hashedJson ?? null, userId);
  return { userId, username, secret, recoveryCodes };
}

function activeSessionCount(userId: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(userId) as { n: number };
  return Number(row.n);
}

describe("MFA factor-2 authorization boundary", () => {
  test("active at factor 1 -> suspended before factor 2 is denied without a session", () => {
    const u = createMfaUser();
    getDb().prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(u.userId);
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), {});
    assert.deepEqual(result.ok ? null : result.reason, "account_not_active");
    assert.equal(activeSessionCount(u.userId), 0);
  });

  test("active at factor 1 -> archived before factor 2 is denied without a session", () => {
    const u = createMfaUser();
    getDb().prepare(`UPDATE users SET status = 'archived', archived_at = datetime('now') WHERE id = ?`).run(u.userId);
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), {});
    assert.deepEqual(result.ok ? null : result.reason, "account_not_active");
    assert.equal(activeSessionCount(u.userId), 0);
  });

  test("temporary password expiring between factors is denied", () => {
    const u = createMfaUser();
    getDb()
      .prepare(`UPDATE users SET must_change_password = 1, temp_password_expires_at = ? WHERE id = ?`)
      .run(new Date(Date.now() - 60_000).toISOString(), u.userId);
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), {});
    assert.deepEqual(result.ok ? null : result.reason, "temp_password_expired");
    assert.equal(activeSessionCount(u.userId), 0);
  });

  test("non-admin is denied when login blocking wins before factor 2", () => {
    const u = createMfaUser("candidate");
    getDb()
      .prepare(`INSERT INTO platform_settings (key, value) VALUES ('block_new_logins', '1') ON CONFLICT(key) DO UPDATE SET value='1'`)
      .run();
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), {});
    assert.deepEqual(result.ok ? null : result.reason, "platform_logins_blocked");
    assert.equal(activeSessionCount(u.userId), 0);
    getDb().prepare(`UPDATE platform_settings SET value='0' WHERE key='block_new_logins'`).run();
  });

  test("administrator exemption remains intentional during login blocking", () => {
    const u = createMfaUser("administrator");
    getDb()
      .prepare(`INSERT INTO platform_settings (key, value) VALUES ('block_new_logins', '1') ON CONFLICT(key) DO UPDATE SET value='1'`)
      .run();
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), {});
    assert.equal(result.ok, true);
    assert.equal(activeSessionCount(u.userId), 1);
    getDb().prepare(`UPDATE platform_settings SET value='0' WHERE key='block_new_logins'`).run();
  });

  test("normal active TOTP completion creates exactly one durable server session", () => {
    const u = createMfaUser();
    const result = claimMfaLogin(u.userId, totpAt(u.secret, Date.now()), { ip: "127.0.0.1", userAgent: "unit-test" });
    assert.equal(result.ok, true);
    assert.equal(activeSessionCount(u.userId), 1);
    const lastLogin = getDb().prepare(`SELECT last_login_at FROM users WHERE id = ?`).get(u.userId) as { last_login_at: string | null };
    assert.ok(lastLogin.last_login_at);
  });

  test("the same recovery code can win only once against current durable state", () => {
    const u = createMfaUser("candidate", true);
    const code = u.recoveryCodes!.plain[0]!;
    const first = claimMfaLogin(u.userId, code, {});
    assert.equal(first.ok, true);
    const second = claimMfaLogin(u.userId, code, {});
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.reason, "invalid_code");
    assert.equal(activeSessionCount(u.userId), 1);
    const row = getDb().prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`).get(u.userId) as { mfa_recovery_codes_json: string };
    assert.equal(JSON.parse(row.mfa_recovery_codes_json).length, 7);
  });

  test("cookie-persist compensation revokes the claimed session and CAS-restores untouched recovery state", () => {
    const u = createMfaUser("candidate", true);
    const code = u.recoveryCodes!.plain[0]!;
    const claim = claimMfaLogin(u.userId, code, {});
    assert.equal(claim.ok, true);
    if (!claim.ok) return;

    const compensation = compensateMfaLoginClaim(claim);
    assert.equal(compensation.recoveryCodeRestored, true);
    assert.equal(compensation.lastLoginRestored, true);
    assert.equal(activeSessionCount(u.userId), 0);

    // Because no newer MFA state intervened, the same code is valid again:
    // the failed cookie finalization did not silently burn the credential.
    const retried = claimMfaLogin(u.userId, code, {});
    assert.equal(retried.ok, true);
  });

  test("compensation never overwrites a newer recovery-code state", () => {
    const u = createMfaUser("candidate", true);
    const claim = claimMfaLogin(u.userId, u.recoveryCodes!.plain[0]!, {});
    assert.equal(claim.ok, true);
    if (!claim.ok) return;

    const newer = generateRecoveryCodes().hashedJson;
    getDb().prepare(`UPDATE users SET mfa_recovery_codes_json = ? WHERE id = ?`).run(newer, u.userId);
    const compensation = compensateMfaLoginClaim(claim);
    assert.equal(compensation.recoveryCodeRestored, false);
    const row = getDb().prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`).get(u.userId) as { mfa_recovery_codes_json: string };
    assert.equal(row.mfa_recovery_codes_json, newer);
    assert.equal(activeSessionCount(u.userId), 0);
  });
});
