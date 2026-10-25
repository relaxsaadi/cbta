import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";

let db: ReturnType<typeof import("../../lib/db").getDb>;
before(async () => {
  setupTestDb();
  db = (await import("../../lib/db")).getDb();
});
after(() => {
  delete process.env.EMAIL_MODE;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_ALLOWED_RECIPIENTS;
});

function insertFailed(key: string, status: "FAILED" | "SENDING" = "FAILED"): number {
  const row = db.prepare(`INSERT INTO notification_log
    (recipient_email, event_type, template_id, template_version, subject,
     idempotency_key, status, retry_count, rendered_html, rendered_text, created_at, failed_at)
    VALUES (?, 'EXAM_SUBMITTED', 'synthetic-test', 'v1', 'Synthetic retry',
            ?, ?, 1, '<p>test only</p>', 'test only', ?, ?)`)
    .run(`${key}@example.invalid`, key, status, "2026-10-25T18:00:00.000Z", "2026-10-25T18:01:00.000Z");
  return Number(row.lastInsertRowid);
}

type WorkerOutcome = { attempted: number; sent: number; stillFailed: number; skipped: number; terminalized: number };
function independentRetryWorker(callLog: string): Promise<WorkerOutcome> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/email/send.ts")).href;
  const script = [
    'import { appendFileSync } from "node:fs";',
    'import { setTimeout as pause } from "node:timers/promises";',
    `import { processOutboxRetries } from ${JSON.stringify(moduleUrl)};`,
    'globalThis.fetch = async () => {',
    '  appendFileSync(process.env.KOST_TEST_CALL_LOG, String(process.pid) + "\\n");',
    '  await pause(500); // hold the first provider invocation while another process races',
    '  return new Response(JSON.stringify({ id: "provider-synthetic-claim-99" }),',
    '    { status: 200, headers: { "content-type": "application/json" } });',
    '};',
    'const result = await processOutboxRetries(1);',
    'process.stdout.write(JSON.stringify(result));',
  ].join("\n");

  return new Promise((resolveWorker, rejectWorker) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH,
        EMAIL_MODE: "allowlist", EMAIL_ALLOWED_RECIPIENTS: "retry-claim-99@example.invalid",
        RESEND_API_KEY: "re_test_synthetic_only", KOST_TEST_CALL_LOG: callLog },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = ""; let err = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (part) => { out += part; });
    child.stderr.on("data", (part) => { err += part; });
    child.on("error", rejectWorker);
    child.on("close", (code) => {
      if (code !== 0) return rejectWorker(new Error(`retry worker exited ${code}: ${err}`));
      try { resolveWorker(JSON.parse(out) as WorkerOutcome); }
      catch { rejectWorker(new Error(`invalid worker result ${out}: ${err}`)); }
    });
  });
}

test("#99: two independent SQLite workers dispatch a selected FAILED notification only once", async () => {
  const id = insertFailed("retry-claim-99");
  const log = join(mkdtempSync(join(tmpdir(), "kost-retry-claim-")), "provider.log");
  const [a, b] = await Promise.all([independentRetryWorker(log), independentRetryWorker(log)]);
  assert.equal(a.attempted + b.attempted, 1, "only the conditional claim winner may reach Resend");
  assert.equal(a.sent + b.sent, 1);
  assert.equal(a.stillFailed + b.stillFailed, 0);
  assert.equal(existsSync(log), true, "mock provider must have been invoked");
  assert.equal(readFileSync(log, "utf8").trim().split("\n").length, 1,
    "independent processes must never both call the provider");
  const row = db.prepare(`SELECT status, provider_message_id, retry_count FROM notification_log WHERE id = ?`)
    .get(id) as { status: string; provider_message_id: string | null; retry_count: number };
  assert.equal(row.status, "SENT");
  assert.equal(row.provider_message_id, "provider-synthetic-claim-99");
  assert.equal(row.retry_count, 1);
});

test("#99/#225: ambiguous stranded SENDING remains quarantined, never auto-replayed", async () => {
  const id = insertFailed("retry-stranded-99", "SENDING");
  process.env.EMAIL_MODE = "log"; // even an operator run cannot send in safe staging mode
  const { processOutboxRetries } = await import("../../lib/email/send");
  const outcome = await processOutboxRetries(1);
  assert.deepEqual(outcome, { attempted: 0, sent: 0, stillFailed: 0, skipped: 0, terminalized: 0 });
  assert.equal((db.prepare(`SELECT status FROM notification_log WHERE id = ?`).get(id) as { status: string }).status,
    "SENDING", "never infer provider failure or replay without operator evidence");
});
