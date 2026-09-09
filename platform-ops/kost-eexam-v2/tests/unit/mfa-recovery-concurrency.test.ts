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

test("one recovery code has exactly one winner across two independent SQLite connections", async () => {
  const userId = createUser({
    username: "mfa-independent-concurrency",
    password: "Strong-Test-Password-Concurrency!",
    fullName: "MFA Independent Concurrency",
    role: "candidate",
  });
  const secret = generateMfaSecret();
  const recovery = generateRecoveryCodes();
  getDb()
    .prepare(`UPDATE users SET mfa_enabled = 1, mfa_secret = ?, mfa_recovery_codes_json = ? WHERE id = ?`)
    .run(secret, recovery.hashedJson, userId);

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

  const sessions = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL`)
    .get(userId) as { n: number };
  assert.equal(Number(sessions.n), 1);

  const stored = getDb()
    .prepare(`SELECT mfa_recovery_codes_json FROM users WHERE id = ?`)
    .get(userId) as { mfa_recovery_codes_json: string };
  assert.equal(JSON.parse(stored.mfa_recovery_codes_json).length, 7);
});
