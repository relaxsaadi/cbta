import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { generateMfaSecret, generateRecoveryCodes, totpAt } from "../../lib/mfa";
import {
  claimMfaLogin,
  compensateMfaLoginClaim,
  deriveMfaCredentialGeneration,
} from "../../lib/mfa-login-boundary";
import { commitMfaLoginSuccessAudit } from "../../lib/mfa-login-finalization";

before(() => setupTestDb());

let seq = 0;
function createMfaUser(recovery = false) {
  seq += 1;
  const username = `mfa-finalization-${seq}`;
  const userId = createUser({
    username,
    password: `Strong-MFA-Finalization-${seq}!`,
    fullName: `MFA Finalization ${seq}`,
    role: "candidate",
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
  const row = getDb()
    .prepare(`SELECT password_hash FROM users WHERE id = ?`)
    .get(userId) as { password_hash: string };
  return {
    userId,
    username,
    secret,
    recoveryCodes,
    credentialGeneration: deriveMfaCredentialGeneration(row.password_hash),
  };
}

function auditCount(userId: number, action: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n
       FROM audit_logs
       WHERE actor_user_id = ? AND action = ? AND result = 'success'`
    )
    .get(userId, action) as { n: number };
  return Number(row.n);
}

function activeSessionCount(userId: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(userId) as { n: number };
  return Number(row.n);
}

describe("MFA success-audit finalization", () => {
  test("TOTP completion writes exactly one truthful login-success audit", () => {
    const u = createMfaUser();
    const claim = claimMfaLogin(
      u.userId,
      totpAt(u.secret, Date.now()),
      u.credentialGeneration,
      { ip: "127.0.0.1", userAgent: "unit-test" }
    );
    assert.equal(claim.ok, true);
    if (!claim.ok) return;

    commitMfaLoginSuccessAudit(claim, { ip: "127.0.0.1" });

    assert.equal(activeSessionCount(u.userId), 1);
    assert.equal(auditCount(u.userId, "login"), 1);
    assert.equal(auditCount(u.userId, "mfa_recovery_code_used"), 0);
  });

  test("a failing login-success insert rolls back the recovery-code audit, compensation restores claim state, and retry converges to one success pair", () => {
    const u = createMfaUser(true);
    const recoveryCode = u.recoveryCodes!.plain[0]!;
    const before = getDb()
      .prepare(`SELECT mfa_recovery_codes_json, last_login_at FROM users WHERE id = ?`)
      .get(u.userId) as {
      mfa_recovery_codes_json: string;
      last_login_at: string | null;
    };

    const triggerName = `force_mfa_login_audit_failure_${u.userId}`;
    getDb().exec(
      `CREATE TRIGGER ${triggerName}
       BEFORE INSERT ON audit_logs
       WHEN NEW.actor_user_id = ${u.userId}
         AND NEW.action = 'login'
         AND NEW.result = 'success'
       BEGIN
         SELECT RAISE(ABORT, 'forced_mfa_login_audit_failure');
       END`
    );

    const claim = claimMfaLogin(
      u.userId,
      recoveryCode,
      u.credentialGeneration,
      { ip: "127.0.0.1", userAgent: "unit-test" }
    );
    assert.equal(claim.ok, true);
    if (!claim.ok) return;

    assert.equal(activeSessionCount(u.userId), 1);
    assert.throws(
      () => commitMfaLoginSuccessAudit(claim, { ip: "127.0.0.1" }),
      /forced_mfa_login_audit_failure/
    );

    // The recovery-code audit is attempted first. The later login-audit
    // failure must roll the entire audit transaction back, leaving no
    // half-truthful success evidence.
    assert.equal(auditCount(u.userId, "mfa_recovery_code_used"), 0);
    assert.equal(auditCount(u.userId, "login"), 0);

    const compensation = compensateMfaLoginClaim(claim);
    assert.equal(compensation.recoveryCodeRestored, true);
    assert.equal(compensation.lastLoginRestored, true);
    assert.equal(activeSessionCount(u.userId), 0);

    const afterCompensation = getDb()
      .prepare(`SELECT mfa_recovery_codes_json, last_login_at FROM users WHERE id = ?`)
      .get(u.userId) as {
      mfa_recovery_codes_json: string;
      last_login_at: string | null;
    };
    assert.equal(afterCompensation.mfa_recovery_codes_json, before.mfa_recovery_codes_json);
    assert.equal(afterCompensation.last_login_at, before.last_login_at);

    getDb().exec(`DROP TRIGGER IF EXISTS ${triggerName}`);

    const retry = claimMfaLogin(
      u.userId,
      recoveryCode,
      u.credentialGeneration,
      { ip: "127.0.0.1", userAgent: "unit-test" }
    );
    assert.equal(retry.ok, true);
    if (!retry.ok) return;
    commitMfaLoginSuccessAudit(retry, { ip: "127.0.0.1" });

    assert.equal(activeSessionCount(u.userId), 1);
    assert.equal(auditCount(u.userId, "mfa_recovery_code_used"), 1);
    assert.equal(auditCount(u.userId, "login"), 1);
  });
});
