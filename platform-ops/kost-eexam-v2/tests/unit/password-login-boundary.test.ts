import { before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";
import type { ConsoleRole } from "../../lib/session";

before(() => setupTestDb());

beforeEach(async () => {
  const { getDb } = await import("../../lib/db");
  getDb()
    .prepare(`DELETE FROM platform_settings WHERE key IN ('maintenance_mode','block_new_logins')`)
    .run();
});

type ClaimResult =
  | { ok: true; userId: number; role: ConsoleRole; dbSessionId: number }
  | { ok: false; reason: string; userId: number | null; role: ConsoleRole | null };

type Worker<T> = {
  ready: Promise<void>;
  beginAttempt: Promise<void>;
  done: Promise<T>;
  release: () => void;
};

let seq = 0;
async function createPasswordUser(role: ConsoleRole = "candidate") {
  seq += 1;
  const { createUser } = await import("../../lib/users");
  const { getDb } = await import("../../lib/db");
  const userId = createUser({
    username: `password-boundary-${role}-${seq}`,
    password: `Strong-Test-Password-${seq}!`,
    fullName: `Password Boundary ${seq}`,
    role,
  });
  const row = getDb()
    .prepare(`SELECT password_hash, last_login_at FROM users WHERE id = ?`)
    .get(userId) as { password_hash: string; last_login_at: string | null };
  return { userId, role, passwordHash: row.password_hash, previousLastLoginAt: row.last_login_at };
}

async function activeSessionCount(userId: number): Promise<number> {
  const { getDb } = await import("../../lib/db");
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(userId) as { n: number };
  return Number(row.n);
}

async function lastLoginAt(userId: number): Promise<string | null> {
  const { getDb } = await import("../../lib/db");
  const row = getDb().prepare(`SELECT last_login_at FROM users WHERE id = ?`).get(userId) as {
    last_login_at: string | null;
  };
  return row.last_login_at;
}

function runClaimWorker(
  userId: number,
  passwordHash: string,
  role: ConsoleRole,
  hold = false,
  signalBeginAttempt = false
): Worker<ClaimResult> {
  const boundaryUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/password-login-boundary.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { readSync, writeSync } from "node:fs";
    import { claimPasswordLogin } from ${JSON.stringify(boundaryUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const userId = Number(process.env.KOST_TEST_USER_ID);
    const passwordHash = process.env.KOST_TEST_PASSWORD_HASH;
    const role = process.env.KOST_TEST_ROLE;
    const hold = process.env.KOST_TEST_HOLD === "1";
    const signalBeginAttempt = process.env.KOST_TEST_SIGNAL_BEGIN === "1";
    const db = getDb();

    if (signalBeginAttempt) {
      const originalExec = db.exec.bind(db);
      let beginSignalled = false;
      db.exec = (sql) => {
        if (!beginSignalled && sql.trim().toUpperCase() === "BEGIN IMMEDIATE") {
          beginSignalled = true;
          writeSync(1, "BEGIN_ATTEMPT\\n");
        }
        return originalExec(sql);
      };
    }

    if (hold) {
      db.function("kost_test_hold_password_claim", () => {
        writeSync(1, "LOCKED\\n");
        const releaseByte = Buffer.alloc(1);
        const bytesRead = readSync(0, releaseByte, 0, 1, null);
        if (bytesRead !== 1) throw new Error("winner release signal missing");
        return 0;
      });
      db.exec(\`
        CREATE TEMP TRIGGER hold_password_claim
        BEFORE INSERT ON sessions
        WHEN NEW.user_id = \${userId}
        BEGIN
          SELECT kost_test_hold_password_claim();
        END;
      \`);
    }

    try {
      const result = claimPasswordLogin(userId, passwordHash, role, {
        ip: "127.0.0.1",
        userAgent: "password-login-race-worker",
      });
      writeSync(1, "RESULT " + JSON.stringify(result) + "\\n");
    } catch (error) {
      writeSync(1, "RESULT " + JSON.stringify({
        ok: false,
        reason: "threw:" + (error instanceof Error ? error.message : String(error)),
        userId,
        role,
      }) + "\\n");
    }
  `;

  return spawnControlledWorker<ClaimResult>(script, {
    KOST_TEST_USER_ID: String(userId),
    KOST_TEST_PASSWORD_HASH: passwordHash,
    KOST_TEST_ROLE: role,
    KOST_TEST_HOLD: hold ? "1" : "0",
    KOST_TEST_SIGNAL_BEGIN: signalBeginAttempt ? "1" : "0",
  }, "password-claim", hold, signalBeginAttempt);
}

function runStopWorker(
  key: "maintenance_mode" | "block_new_logins",
  actorUserId: number,
  hold = false,
  signalBeginAttempt = false
): Worker<{ ok: boolean; error?: string }> {
  const settingsUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/platform-settings.ts")).href;
  const dbUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/db.ts")).href;
  const script = `
    import { readSync, writeSync } from "node:fs";
    import { setPlatformSetting } from ${JSON.stringify(settingsUrl)};
    import { getDb } from ${JSON.stringify(dbUrl)};

    const key = process.env.KOST_TEST_SETTING_KEY;
    const actorUserId = Number(process.env.KOST_TEST_ACTOR_ID);
    const hold = process.env.KOST_TEST_HOLD === "1";
    const signalBeginAttempt = process.env.KOST_TEST_SIGNAL_BEGIN === "1";
    const db = getDb();

    if (signalBeginAttempt) {
      const originalExec = db.exec.bind(db);
      let beginSignalled = false;
      db.exec = (sql) => {
        if (!beginSignalled && sql.trim().toUpperCase() === "BEGIN IMMEDIATE") {
          beginSignalled = true;
          writeSync(1, "BEGIN_ATTEMPT\\n");
        }
        return originalExec(sql);
      };
    }

    if (hold) {
      db.function("kost_test_hold_login_stop", () => {
        writeSync(1, "LOCKED\\n");
        const releaseByte = Buffer.alloc(1);
        const bytesRead = readSync(0, releaseByte, 0, 1, null);
        if (bytesRead !== 1) throw new Error("winner release signal missing");
        return 0;
      });
      db.exec(\`
        CREATE TEMP TRIGGER hold_login_stop_insert
        BEFORE INSERT ON platform_settings
        WHEN NEW.key = '\${key}'
        BEGIN
          SELECT kost_test_hold_login_stop();
        END;
      \`);
    }

    try {
      setPlatformSetting(key, true, { id: actorUserId, role: "administrator" });
      writeSync(1, "RESULT " + JSON.stringify({ ok: true }) + "\\n");
    } catch (error) {
      writeSync(1, "RESULT " + JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }) + "\\n");
    }
  `;

  return spawnControlledWorker<{ ok: boolean; error?: string }>(script, {
    KOST_TEST_SETTING_KEY: key,
    KOST_TEST_ACTOR_ID: String(actorUserId),
    KOST_TEST_HOLD: hold ? "1" : "0",
    KOST_TEST_SIGNAL_BEGIN: signalBeginAttempt ? "1" : "0",
  }, `login-stop-${key}`, hold, signalBeginAttempt);
}

function spawnControlledWorker<T>(
  script: string,
  extraEnv: Record<string, string>,
  label: string,
  hold: boolean,
  signalBeginAttempt: boolean
): Worker<T> {
  let readyResolved = !hold;
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveReady = resolvePromise;
    rejectReady = rejectPromise;
    if (readyResolved) resolvePromise();
  });

  let beginAttemptResolved = !signalBeginAttempt;
  let resolveBeginAttempt!: () => void;
  let rejectBeginAttempt!: (error: Error) => void;
  const beginAttempt = new Promise<void>((resolvePromise, rejectPromise) => {
    resolveBeginAttempt = resolvePromise;
    rejectBeginAttempt = rejectPromise;
    if (beginAttemptResolved) resolvePromise();
  });

  let releaseWorker: () => void = () => {};
  const done = new Promise<T>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH, ...extraEnv },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let released = !hold;
    releaseWorker = () => {
      if (released) return;
      released = true;
      child.stdin.write("R");
      child.stdin.end();
    };

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
      if (!beginAttemptResolved && stdout.includes("BEGIN_ATTEMPT\n")) {
        beginAttemptResolved = true;
        resolveBeginAttempt();
      }
    });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      if (!readyResolved) rejectReady(error);
      if (!beginAttemptResolved) rejectBeginAttempt(error);
      rejectPromise(error);
    });
    child.on("close", (exitCode) => {
      if (exitCode !== 0) {
        const error = new Error(`${label} worker exited ${exitCode}: ${stdout}\n${stderr}`);
        if (!readyResolved) rejectReady(error);
        if (!beginAttemptResolved) rejectBeginAttempt(error);
        rejectPromise(error);
        return;
      }
      if (!readyResolved) {
        const error = new Error(`${label} worker never reached held writer: ${stdout}\n${stderr}`);
        rejectReady(error);
        if (!beginAttemptResolved) rejectBeginAttempt(error);
        rejectPromise(error);
        return;
      }
      if (!beginAttemptResolved) {
        const error = new Error(`${label} worker never attempted BEGIN IMMEDIATE: ${stdout}\n${stderr}`);
        rejectBeginAttempt(error);
        rejectPromise(error);
        return;
      }
      const line = stdout.split("\n").find((value) => value.startsWith("RESULT "));
      if (!line) {
        rejectPromise(new Error(`${label} worker returned no result: ${stdout}\n${stderr}`));
        return;
      }
      resolvePromise(JSON.parse(line.slice("RESULT ".length)) as T);
    });
  });

  return { ready, beginAttempt, done, release: () => releaseWorker() };
}

for (const key of ["block_new_logins", "maintenance_mode"] as const) {
  test(`${key} writer wins first: waiting password-only claim re-reads the stop and creates no session`, async () => {
    const admin = await createPasswordUser("administrator");
    const candidate = await createPasswordUser("candidate");
    const winner = runStopWorker(key, admin.userId, true);
    await winner.ready;
    const loser = runClaimWorker(candidate.userId, candidate.passwordHash, candidate.role, false, true);
    try {
      await loser.beginAttempt;
    } finally {
      winner.release();
    }
    const [winnerResult, loserResult] = await Promise.all([winner.done, loser.done]);

    assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
    assert.equal(loserResult.ok, false, JSON.stringify(loserResult));
    if (!loserResult.ok) assert.equal(loserResult.reason, "platform_logins_blocked");
    assert.equal(await activeSessionCount(candidate.userId), 0);
    assert.equal(await lastLoginAt(candidate.userId), candidate.previousLastLoginAt);
  });
}

test("password-only claim wins first: later login stop waits, then commits without revoking the already-won session", async () => {
  const admin = await createPasswordUser("administrator");
  const candidate = await createPasswordUser("candidate");
  const winner = runClaimWorker(candidate.userId, candidate.passwordHash, candidate.role, true);
  await winner.ready;
  const loser = runStopWorker("block_new_logins", admin.userId, false, true);
  try {
    await loser.beginAttempt;
  } finally {
    winner.release();
  }
  const [winnerResult, stopResult] = await Promise.all([winner.done, loser.done]);

  assert.equal(winnerResult.ok, true, JSON.stringify(winnerResult));
  assert.equal(stopResult.ok, true, JSON.stringify(stopResult));
  assert.equal(await activeSessionCount(candidate.userId), 1);
  assert.ok(await lastLoginAt(candidate.userId));
});

test("credential rotation after password verification denies the stale password-only claim", async () => {
  const candidate = await createPasswordUser("candidate");
  const { getDb } = await import("../../lib/db");
  const { hashPassword } = await import("../../lib/passwords");
  getDb()
    .prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
    .run(hashPassword("Rotated-Password-After-Verify!"), candidate.userId);

  const { claimPasswordLogin } = await import("../../lib/password-login-boundary");
  const result = claimPasswordLogin(candidate.userId, candidate.passwordHash, candidate.role, {});
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "credential_changed");
  assert.equal(await activeSessionCount(candidate.userId), 0);
});

test("role change after password verification denies the stale authority snapshot", async () => {
  const candidate = await createPasswordUser("candidate");
  const { getDb } = await import("../../lib/db");
  const auditor = getDb().prepare(`SELECT id FROM roles WHERE code = 'auditor'`).get() as { id: number };
  getDb().prepare(`DELETE FROM user_roles WHERE user_id = ?`).run(candidate.userId);
  getDb().prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(candidate.userId, auditor.id);

  const { claimPasswordLogin } = await import("../../lib/password-login-boundary");
  const result = claimPasswordLogin(candidate.userId, candidate.passwordHash, candidate.role, {});
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "role_changed");
  assert.equal(await activeSessionCount(candidate.userId), 0);
});

test("MFA enabled after password verification denies password-only completion", async () => {
  const candidate = await createPasswordUser("candidate");
  const { getDb } = await import("../../lib/db");
  const { generateMfaSecret } = await import("../../lib/mfa");
  getDb()
    .prepare(`UPDATE users SET mfa_enabled = 1, mfa_secret = ? WHERE id = ?`)
    .run(generateMfaSecret(), candidate.userId);

  const { claimPasswordLogin } = await import("../../lib/password-login-boundary");
  const result = claimPasswordLogin(candidate.userId, candidate.passwordHash, candidate.role, {});
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "mfa_required");
  assert.equal(await activeSessionCount(candidate.userId), 0);
});

test("administrator exemption remains intentional at the authoritative password-only boundary", async () => {
  const admin = await createPasswordUser("administrator");
  const { getDb } = await import("../../lib/db");
  getDb()
    .prepare(`INSERT INTO platform_settings (key, value) VALUES ('block_new_logins', '1')`)
    .run();

  const { claimPasswordLogin } = await import("../../lib/password-login-boundary");
  const result = claimPasswordLogin(admin.userId, admin.passwordHash, admin.role, {});
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(await activeSessionCount(admin.userId), 1);
});

test("compensation revokes the claimed session and CAS-restores untouched last_login_at", async () => {
  const candidate = await createPasswordUser("candidate");
  const { claimPasswordLogin, compensatePasswordLoginClaim } = await import("../../lib/password-login-boundary");
  const claim = claimPasswordLogin(candidate.userId, candidate.passwordHash, candidate.role, {});
  assert.equal(claim.ok, true, JSON.stringify(claim));
  if (!claim.ok) return;

  assert.equal(await activeSessionCount(candidate.userId), 1);
  assert.equal(await lastLoginAt(candidate.userId), claim.loginAt);
  const compensation = compensatePasswordLoginClaim(claim);
  assert.equal(compensation.lastLoginRestored, true);
  assert.equal(await activeSessionCount(candidate.userId), 0);
  assert.equal(await lastLoginAt(candidate.userId), candidate.previousLastLoginAt);
});

test("compensation never overwrites a newer successful last_login_at", async () => {
  const candidate = await createPasswordUser("candidate");
  const { getDb } = await import("../../lib/db");
  const { claimPasswordLogin, compensatePasswordLoginClaim } = await import("../../lib/password-login-boundary");
  const claim = claimPasswordLogin(candidate.userId, candidate.passwordHash, candidate.role, {});
  assert.equal(claim.ok, true, JSON.stringify(claim));
  if (!claim.ok) return;

  const newer = new Date(Date.now() + 60_000).toISOString();
  getDb().prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(newer, candidate.userId);
  const compensation = compensatePasswordLoginClaim(claim);
  assert.equal(compensation.lastLoginRestored, false);
  assert.equal(await activeSessionCount(candidate.userId), 0);
  assert.equal(await lastLoginAt(candidate.userId), newer);
});
