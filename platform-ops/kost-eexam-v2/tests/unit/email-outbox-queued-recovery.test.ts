import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { getSenderNotifications } from "../../lib/email/config";
import { processOutboxRetries } from "../../lib/email/send";

// Every provider invocation needs a durable QUEUED -> SENDING transition.
// Simulate a process terminating after INSERT but before the first claim.
let db: ReturnType<typeof getDb>;
const oldMode = process.env.EMAIL_MODE;
const oldKey = process.env.RESEND_API_KEY;

before(() => {
  process.env.EMAIL_MODE = "log";
  delete process.env.RESEND_API_KEY;
  setupTestDb();
  db = getDb();
});

after(() => {
  if (oldMode === undefined) delete process.env.EMAIL_MODE;
  else process.env.EMAIL_MODE = oldMode;
  if (oldKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = oldKey;
});

function insertDurable(key: string, status: "QUEUED" | "SENDING" = "QUEUED"): number {
  const sender = getSenderNotifications();
  const now = new Date().toISOString();
  const result = db.prepare(`INSERT INTO notification_log
    (recipient_email, sender_name, sender_address, event_type, template_id,
     template_version, subject, idempotency_key, status, retry_count,
     rendered_html, rendered_text, created_at, queued_at)
    VALUES (?, ?, ?, 'EXAM_SUBMITTED', 'synthetic-recovery', 'v1',
      'Synthetic queued recovery', ?, ?, 0, '<p>No real delivery</p>',
      'No real delivery', ?, ?)`).run(
    `${key}@example.invalid`, sender.name, sender.address, key, status, now, now
  );
  return Number(result.lastInsertRowid);
}

function row(id: number) {
  return db.prepare(`SELECT status, retry_count, rendered_html, provider_message_id
    FROM notification_log WHERE id = ?`).get(id) as {
    status: string; retry_count: number;
    rendered_html: string | null; provider_message_id: string | null;
  };
}

test("crash-stranded QUEUED recovers under log policy, without provider access", async () => {
  const id = insertDurable("queued-crash-332");
  const first = await processOutboxRetries(10);
  assert.deepEqual(first, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 1 });
  assert.equal(row(id).status, "SUPPRESSED");
  assert.equal(row(id).rendered_html, null);
  assert.equal(row(id).retry_count, 0);
  assert.deepEqual(await processOutboxRetries(10),
    { attempted: 0, sent: 0, stillFailed: 0, skipped: 0, terminalized: 0 });
});

test("QUEUED with no provider key stays durable for later recovery", async () => {
  const id = insertDurable("queued-no-config-332");
  process.env.EMAIL_MODE = "send";
  delete process.env.RESEND_API_KEY;
  const held = await processOutboxRetries(10);
  assert.deepEqual(held, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 0 });
  assert.equal(row(id).status, "QUEUED");
  assert.equal(row(id).rendered_html, "<p>No real delivery</p>");
  assert.equal(row(id).retry_count, 0);
  process.env.EMAIL_MODE = "log";
  const recovered = await processOutboxRetries(10);
  assert.equal(recovered.terminalized, 1);
  assert.equal(row(id).status, "SUPPRESSED");
});

test("SENDING provider-acceptance ambiguity is never automatically replayed", async () => {
  const id = insertDurable("sending-ambiguous-332", "SENDING");
  assert.deepEqual(await processOutboxRetries(10),
    { attempted: 0, sent: 0, stillFailed: 0, skipped: 0, terminalized: 0 });
  assert.equal(row(id).status, "SENDING");
});

type Outcome = { attempted: number; sent: number; stillFailed: number;
  skipped: number; terminalized: number };
function independentWorker(logFile: string, email: string): Promise<Outcome> {
  const moduleUrl = pathToFileURL(resolve(import.meta.dirname, "../../lib/email/send.ts")).href;
  const script = [
    'import { appendFileSync } from "node:fs";',
    'import { setTimeout as pause } from "node:timers/promises";',
    `import { processOutboxRetries } from ${JSON.stringify(moduleUrl)};`,
    'globalThis.fetch = async () => {',
    '  appendFileSync(process.env.KOST_TEST_CALL_LOG, String(process.pid) + "\\n");',
    '  await pause(400);',
    '  return new Response(JSON.stringify({id:"provider-synthetic-queued-332"}),',
    '    {status:200,headers:{"content-type":"application/json"}});',
    '};',
    'process.stdout.write(JSON.stringify(await processOutboxRetries(1)));',
  ].join("\n");

  return new Promise((resolveWorker, rejectWorker) => {
    const child = spawn(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], {
      cwd: resolve(import.meta.dirname, "../.."),
      env: { ...process.env, DB_PATH: process.env.DB_PATH, EMAIL_MODE: "allowlist",
        EMAIL_ALLOWED_RECIPIENTS: email, RESEND_API_KEY: "re_test_synthetic_only",
        KOST_TEST_CALL_LOG: logFile },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", p => { stdout += p; });
    child.stderr.on("data", p => { stderr += p; });
    child.on("error", rejectWorker);
    child.on("close", code => {
      if (code !== 0) return rejectWorker(new Error(`worker exit ${code}: ${stderr}`));
      try { resolveWorker(JSON.parse(stdout) as Outcome); }
      catch { rejectWorker(new Error(`invalid worker result ${stdout}: ${stderr}`)); }
    });
  });
}

test("two independent workers recover one QUEUED row with exactly one provider call", async () => {
  const key = "queued-parallel-332";
  const id = insertDurable(key);
  const log = join(mkdtempSync(join(tmpdir(), "kost-queued-recovery-")), "provider.log");
  const email = `${key}@example.invalid`;
  const [a, b] = await Promise.all([independentWorker(log, email), independentWorker(log, email)]);
  assert.equal(a.attempted + b.attempted, 1);
  assert.equal(a.sent + b.sent, 1);
  assert.equal(existsSync(log), true);
  assert.equal(readFileSync(log, "utf8").trim().split("\n").length, 1,
    "only the CAS winner may contact the provider");
  assert.equal(row(id).status, "SENT");
  assert.equal(row(id).provider_message_id, "provider-synthetic-queued-332");
  assert.equal(row(id).retry_count, 0);
});
