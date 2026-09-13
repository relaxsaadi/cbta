import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

before(() => setupTestDb());

const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/account-credential-claims.ts")).href;

function runIndependentClaim(
  kind: "activate" | "reset",
  token: string,
  password: string
): Promise<{ ok: boolean; reason?: string }> {
  const script = `
    import { activateAccountWithToken, resetPasswordWithToken } from ${JSON.stringify(moduleUrl)};
    const kind = process.env.KOST_TEST_CLAIM_KIND;
    const token = process.env.KOST_TEST_TOKEN ?? "";
    const password = process.env.KOST_TEST_PASSWORD ?? "";
    const result = kind === "activate" ? activateAccountWithToken(token, password) : resetPasswordWithToken(token, password);
    process.stdout.write(JSON.stringify(result.ok ? { ok: true } : { ok: false, reason: result.reason }));
  `;

  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_CLAIM_KIND: kind,
        KOST_TEST_TOKEN: token,
        KOST_TEST_PASSWORD: password,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(`credential claim worker exited ${exitCode}: ${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout) as { ok: boolean; reason?: string });
      } catch (error) {
        reject(new Error(`invalid credential claim worker output: ${stdout}\n${stderr}\n${String(error)}`));
      }
    });
  });
}

function startIndependentLifecycleTransition(
  userId: number,
  status: "suspended" | "archived"
): { ready: Promise<void>; done: Promise<void> } {
  const script = `
    import { DatabaseSync } from "node:sqlite";
    const db = new DatabaseSync(process.env.DB_PATH);
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("BEGIN IMMEDIATE");
    const status = process.env.KOST_TEST_TARGET_STATUS;
    const userId = Number(process.env.KOST_TEST_USER_ID);
    if (status === "archived") {
      db.prepare("UPDATE users SET status = 'archived', archived_at = ? WHERE id = ?").run(new Date().toISOString(), userId);
    } else {
      db.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(userId);
    }
    process.stdout.write("LOCKED\\n");
    await new Promise((resolve) => setTimeout(resolve, 350));
    db.exec("COMMIT");
    db.close();
    process.stdout.write("COMMITTED\\n");
  `;

  let readyResolved = false;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveReady = resolvePromise;
    rejectReady = rejectPromise;
  });

  const done = new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_USER_ID: String(userId),
        KOST_TEST_TARGET_STATUS: status,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (!readyResolved && stdout.includes("LOCKED\n")) {
        readyResolved = true;
        resolveReady();
      }
    });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      if (!readyResolved) rejectReady(error);
      rejectPromise(error);
    });
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        const error = new Error(`lifecycle worker exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`lifecycle worker never acquired lock: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      resolvePromise();
    });
  });

  return { ready, done };
}

async function deps() {
  const [{ getDb }, users, tokens, passwords, sessions, claims] = await Promise.all([
    import("../../lib/db"),
    import("../../lib/users"),
    import("../../lib/activation-tokens"),
    import("../../lib/passwords"),
    import("../../lib/sessions-registry"),
    import("../../lib/account-credential-claims"),
  ]);
  return { getDb, users, tokens, passwords, sessions, claims };
}

test("same account-setup token has exactly one winner across independent SQLite connections", async () => {
  const { getDb, users, tokens, passwords } = await deps();
  const userId = users.createUserPendingActivation({
    username: "claim.activation.concurrent",
    fullName: "Activation Concurrent",
    role: "candidate",
  });
  const { token } = tokens.createActivationToken({ userId, purpose: "account_setup" });
  const leftPassword = "Activation-Left-Strong-1!";
  const rightPassword = "Activation-Right-Strong-2!";

  const [left, right] = await Promise.all([
    runIndependentClaim("activate", token, leftPassword),
    runIndependentClaim("activate", token, rightPassword),
  ]);

  assert.equal([left, right].filter((entry) => entry.ok).length, 1, JSON.stringify([left, right]));
  assert.equal([left, right].filter((entry) => !entry.ok).length, 1);
  assert.equal([left, right].find((entry) => !entry.ok)?.reason, "invalid_token");

  const user = users.findUserById(userId)!;
  assert.equal(user.status, "active");
  const expectedWinnerPassword = left.ok ? leftPassword : rightPassword;
  assert.equal(passwords.verifyPassword(expectedWinnerPassword, user.password_hash), true);
  const auditCount = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'account_activated' AND target_id = ?`)
    .get(userId) as { n: number };
  assert.equal(auditCount.n, 1);
});

test("same password-reset token has exactly one winner and the winner revokes all sessions", async () => {
  const { getDb, users, tokens, passwords, sessions } = await deps();
  const userId = users.createUser({
    username: "claim.reset.concurrent",
    password: "Reset-Original-Strong-0!",
    fullName: "Reset Concurrent",
    role: "candidate",
  });
  sessions.createDbSession({ userId });
  sessions.createDbSession({ userId });
  const { token } = tokens.createActivationToken({ userId, purpose: "password_reset" });
  const leftPassword = "Reset-Left-Strong-1!";
  const rightPassword = "Reset-Right-Strong-2!";

  const [left, right] = await Promise.all([
    runIndependentClaim("reset", token, leftPassword),
    runIndependentClaim("reset", token, rightPassword),
  ]);

  assert.equal([left, right].filter((entry) => entry.ok).length, 1, JSON.stringify([left, right]));
  assert.equal([left, right].find((entry) => !entry.ok)?.reason, "invalid_token");
  const user = users.findUserById(userId)!;
  const expectedWinnerPassword = left.ok ? leftPassword : rightPassword;
  assert.equal(passwords.verifyPassword(expectedWinnerPassword, user.password_hash), true);
  assert.equal(sessions.listSessionsForUser(userId).every((row) => row.revoked_at !== null), true);
  const auditCount = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'password_reset_completed' AND target_id = ?`)
    .get(userId) as { n: number };
  assert.equal(auditCount.n, 1);
});

for (const status of ["suspended", "archived"] as const) {
  test(`${status} transition that commits first cannot be overwritten by stale activation`, async () => {
    const { getDb, users, tokens } = await deps();
    const userId = users.createUserPendingActivation({
      username: `claim.activation.race.${status}`,
      fullName: `Activation Race ${status}`,
      role: "candidate",
    });
    const { token } = tokens.createActivationToken({ userId, purpose: "account_setup" });
    const transition = startIndependentLifecycleTransition(userId, status);

    await transition.ready;
    const claimPromise = runIndependentClaim("activate", token, "Activation-Race-Strong-1!");
    await transition.done;
    const claim = await claimPromise;

    assert.equal(claim.ok, false);
    assert.equal(claim.reason, status);
    assert.equal(users.findUserById(userId)?.status, status);
    const tokenState = getDb()
      .prepare(`SELECT used_at FROM activation_tokens WHERE user_id = ? AND purpose = 'account_setup'`)
      .get(userId) as { used_at: string | null };
    assert.equal(tokenState.used_at, null, "denied activation must roll back token claim");
    const auditCount = getDb()
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'account_activated' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 0);
  });
}

test("activation rolls token, password/status and success audit back together when audit persistence fails", async () => {
  const { getDb, users, tokens, claims } = await deps();
  const userId = users.createUserPendingActivation({
    username: "claim.activation.rollback",
    fullName: "Activation Rollback",
    role: "candidate",
  });
  const before = users.findUserById(userId)!;
  const { token } = tokens.createActivationToken({ userId, purpose: "account_setup" });
  const db = getDb();
  db.exec(`
    CREATE TRIGGER fail_account_activated_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'account_activated'
    BEGIN
      SELECT RAISE(ABORT, 'injected account activation audit failure');
    END;
  `);

  try {
    assert.throws(
      () => claims.activateAccountWithToken(token, "Activation-Rollback-Strong-1!"),
      /injected account activation audit failure/
    );
    const after = users.findUserById(userId)!;
    assert.equal(after.status, "pending_activation");
    assert.equal(after.password_hash, before.password_hash);
    const tokenState = db
      .prepare(`SELECT used_at FROM activation_tokens WHERE user_id = ? AND purpose = 'account_setup'`)
      .get(userId) as { used_at: string | null };
    assert.equal(tokenState.used_at, null);
    const auditCount = db
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'account_activated' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 0);
  } finally {
    db.exec(`DROP TRIGGER IF EXISTS fail_account_activated_audit`);
  }
});

test("reset rolls token, password, all session revocations and success audit back together on late audit failure", async () => {
  const { getDb, users, tokens, sessions, claims } = await deps();
  const userId = users.createUser({
    username: "claim.reset.rollback",
    password: "Reset-Rollback-Original-0!",
    fullName: "Reset Rollback",
    role: "candidate",
  });
  const before = users.findUserById(userId)!;
  sessions.createDbSession({ userId });
  sessions.createDbSession({ userId });
  const { token } = tokens.createActivationToken({ userId, purpose: "password_reset" });
  const db = getDb();
  db.exec(`
    CREATE TRIGGER fail_password_reset_audit
    BEFORE INSERT ON audit_logs
    WHEN NEW.action = 'password_reset_completed'
    BEGIN
      SELECT RAISE(ABORT, 'injected password reset audit failure');
    END;
  `);

  try {
    assert.throws(
      () => claims.resetPasswordWithToken(token, "Reset-Rollback-New-1!"),
      /injected password reset audit failure/
    );
    const after = users.findUserById(userId)!;
    assert.equal(after.password_hash, before.password_hash);
    assert.equal(sessions.listSessionsForUser(userId).every((row) => row.revoked_at === null), true);
    const tokenState = db
      .prepare(`SELECT used_at FROM activation_tokens WHERE user_id = ? AND purpose = 'password_reset'`)
      .get(userId) as { used_at: string | null };
    assert.equal(tokenState.used_at, null);
    const auditCount = db
      .prepare(`SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'password_reset_completed' AND target_id = ?`)
      .get(userId) as { n: number };
    assert.equal(auditCount.n, 0);
  } finally {
    db.exec(`DROP TRIGGER IF EXISTS fail_password_reset_audit`);
  }
});

test("stale reset token is denied after lifecycle stop and remains unconsumed", async () => {
  const { getDb, users, tokens, claims } = await deps();
  const userId = users.createUser({
    username: "claim.reset.suspended",
    password: "Reset-Suspended-Original-0!",
    fullName: "Reset Suspended",
    role: "candidate",
  });
  const { token } = tokens.createActivationToken({ userId, purpose: "password_reset" });
  users.setUserStatus(userId, "suspended");

  const result = claims.resetPasswordWithToken(token, "Reset-Suspended-New-1!");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "account_not_active");
  const tokenState = getDb()
    .prepare(`SELECT used_at FROM activation_tokens WHERE user_id = ? AND purpose = 'password_reset'`)
    .get(userId) as { used_at: string | null };
  assert.equal(tokenState.used_at, null);
});
