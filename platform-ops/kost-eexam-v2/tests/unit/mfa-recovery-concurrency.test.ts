import { before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { createUser } from "../../lib/users";
import { generateMfaSecret, generateRecoveryCodes } from "../../lib/mfa";

before(() => setupTestDb());

function runIndependentClaim(userId: number, recoveryCode: string): Promise<{ ok: boolean; reason?: string }> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/mfa-login-boundary.ts")).href;
  const script = `
    import { claimMfaLogin } from ${JSON.stringify(moduleUrl)};
    const result = claimMfaLogin(Number(process.env.KOST_TEST_USER_ID), process.env.KOST_TEST_RECOVERY_CODE ?? "", { ip: "127.0.0.1", userAgent: "concurrency-worker" });
    process.stdout.write(JSON.stringify(result.ok ? { ok: true } : { ok: false, reason: result.reason }));
  `;

  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: {
        ...process.env,
        DB_PATH: process.env.DB_PATH,
        KOST_TEST_USER_ID: String(userId),
        KOST_TEST_RECOVERY_CODE: recoveryCode,
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
        reject(new Error(`independent MFA claim worker exited ${exitCode}: ${stderr}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout) as { ok: boolean; reason?: string });
      } catch (error) {
        reject(new Error(`invalid worker output: ${stdout}\n${stderr}\n${String(error)}`));
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
    await new Promise((resolve) => setTimeout(resolve, 400));
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
        const error = new Error(`lifecycle transition worker exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`lifecycle transition worker never acquired lock: ${stdout}\n${stderr}`);
        rejectReady(error);
        rejectPromise(error);
        return;
      }
      resolvePromise();
    });
  });

  return { ready, done };
}

function createRecoveryUser(username: string) {
  const userId = createUser({
    username,
    password: `Strong-Test-Password-${username}!`,
    fullName: `MFA ${username}`,
    role: "candidate",
  });
  const secret = generateMfaSecret();
  const recovery = generateRecoveryCodes();
  getDb()
    .prepare(`UPDATE users SET mfa_enabled = 1, mfa_secret = ?, mfa_recovery_codes_json = ? WHERE id = ?`)
    .run(secret, recovery.hashedJson, userId);
  return { userId, recovery };
}

function activeSessionCount(userId: number): number {
  const sessions = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(userId) as { n: number };
  return Number(sessions.n);
}

test("one recovery code has exactly one winner across two independent SQLite connections", async () => {
  const { userId, recovery } = createRecoveryUser("mfa-independent-concurrency");
  const code = recovery.plain[0]!;
  const [left, right] = await Promise.all([
    runIndependentClaim(userId, code),
    runIndependentClaim(userId, code),
  ]);

  const winners = [left, right].filter((result) => result.ok);
  const losers = [left, right].filter((result) => !result.ok);
  assert.equal(winners.length, 1, `expected exactly one winner, got ${JSON.stringify([left, right])}`);
  assert.equal(losers.length, 1);
  assert.equal(losers[0]!.reason, "invalid_code");
  assert.equal(activeSessionCount(userId), 1);

  const stored = getDb()
    .prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`)
    .get(userId) as { mfa_recovery_codes_json: string };
  assert.equal(JSON.parse(stored.mfa_recovery_codes_json).length, 7);
});

test("two different recovery codes may both win concurrently without lost-update resurrection", async () => {
  const { userId, recovery } = createRecoveryUser("mfa-independent-different-codes");
  const firstCode = recovery.plain[0]!;
  const secondCode = recovery.plain[1]!;

  const [left, right] = await Promise.all([
    runIndependentClaim(userId, firstCode),
    runIndependentClaim(userId, secondCode),
  ]);

  assert.equal(left.ok, true, JSON.stringify(left));
  assert.equal(right.ok, true, JSON.stringify(right));
  assert.equal(activeSessionCount(userId), 2);

  const stored = getDb()
    .prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`)
    .get(userId) as { mfa_recovery_codes_json: string };
  assert.equal(JSON.parse(stored.mfa_recovery_codes_json).length, 6);

  const [firstReplay, secondReplay] = await Promise.all([
    runIndependentClaim(userId, firstCode),
    runIndependentClaim(userId, secondCode),
  ]);
  assert.equal(firstReplay.ok, false);
  assert.equal(secondReplay.ok, false);
  assert.equal(firstReplay.reason, "invalid_code");
  assert.equal(secondReplay.reason, "invalid_code");
  assert.equal(activeSessionCount(userId), 2);
});

for (const status of ["suspended", "archived"] as const) {
  test(`${status} transition that owns the writer lock first denies recovery completion without consuming the code`, async () => {
    const { userId, recovery } = createRecoveryUser(`mfa-race-${status}`);
    const code = recovery.plain[0]!;
    const transition = startIndependentLifecycleTransition(userId, status);

    await transition.ready;
    const claimPromise = runIndependentClaim(userId, code);
    await transition.done;
    const claim = await claimPromise;

    assert.equal(claim.ok, false);
    assert.equal(claim.reason, "account_not_active");
    assert.equal(activeSessionCount(userId), 0);

    const stored = getDb()
      .prepare(`SELECT status, mfa_recovery_codes_json FROM users WHERE id = ?`)
      .get(userId) as { status: string; mfa_recovery_codes_json: string };
    assert.equal(stored.status, status);
    assert.equal(stored.mfa_recovery_codes_json, recovery.hashedJson);
  });
}
