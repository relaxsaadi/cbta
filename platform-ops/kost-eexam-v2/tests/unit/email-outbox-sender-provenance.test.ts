import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { getSenderExam, getSenderNotifications, getSenderSecurity } from "../../lib/email/config";
import { processOutboxRetries, queueAndSendEmail } from "../../lib/email/send";

let db: ReturnType<typeof getDb>;
const oldEnv: Record<string, string | undefined> = {};
let originalFetch: typeof globalThis.fetch;

before(() => {
  for (const name of ["EMAIL_MODE", "EMAIL_ALLOWED_RECIPIENTS", "RESEND_API_KEY",
    "EMAIL_FROM_EXAM", "EMAIL_FROM_SECURITY", "EMAIL_FROM_NOTIFICATIONS"]) {
    oldEnv[name] = process.env[name];
    delete process.env[name];
  }
  setupTestDb();
  db = getDb();
  originalFetch = globalThis.fetch;
});

after(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(oldEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function failedRow(key: string, sender?: { name: string; address: string }): number {
  const entry = db.prepare(`INSERT INTO notification_log
    (recipient_email, sender_name, sender_address, event_type, template_id, template_version,
     subject, idempotency_key, status, retry_count, rendered_html, rendered_text, created_at, failed_at)
    VALUES (?, ?, ?, 'EXAM_SUBMITTED', 'synthetic-test', 'v1',
      'Synthetic retry', ?, 'FAILED', 1, '<p>synthetic</p>', 'synthetic', ?, ?)`)
    .run(`${key}@example.invalid`, sender?.name ?? null, sender?.address ?? null, key,
      "2026-10-25T10:00:00.000Z", "2026-10-25T10:01:00.000Z");
  return Number(entry.lastInsertRowid);
}

test("#326: retry keeps original Exam/Security/Notifications From identities and skips legacy sender-less mail", async () => {
  const legacy = failedRow("legacy-unknown");
  const senders = [getSenderExam(), getSenderSecurity(), getSenderNotifications()];
  const ids = senders.map((sender, i) => failedRow(`sender-provenance-${i}`, sender));
  process.env.EMAIL_MODE = "allowlist";
  process.env.RESEND_API_KEY = "re_test_synthetic_only";
  process.env.EMAIL_ALLOWED_RECIPIENTS = senders
    .map((_, i) => `sender-provenance-${i}@example.invalid`).join(",");

  const sentFrom: string[] = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { from: string };
    sentFrom.push(body.from);
    return new Response(JSON.stringify({ id: `synthetic-provider-${sentFrom.length}` }), {
      status: 200, headers: { "content-type": "application/json" },
    });
  };

  const result = await processOutboxRetries(25);
  assert.equal(result.attempted, 3);
  assert.equal(result.sent, 3);
  assert.deepEqual(sentFrom, senders.map((s) => `${s.name} <${s.address}>`));
  for (const id of ids) {
    assert.equal((db.prepare("SELECT status FROM notification_log WHERE id = ?").get(id) as { status: string }).status, "SENT");
  }
  const held = db.prepare("SELECT status, sender_name, sender_address FROM notification_log WHERE id = ?")
    .get(legacy) as { status: string; sender_name: string | null; sender_address: string | null };
  assert.equal(held.status, "FAILED");
  assert.equal(held.sender_name, null);
  assert.equal(held.sender_address, null);
});

test("#326: changed sender configuration holds old FAILED message instead of guessing or impersonating", async () => {
  const retired = failedRow("retired-security", { name: "KOST Security", address: "retired-security@kostacademy.com" });
  process.env.EMAIL_MODE = "allowlist";
  process.env.RESEND_API_KEY = "re_test_synthetic_only";
  process.env.EMAIL_ALLOWED_RECIPIENTS = "retired-security@example.invalid";
  const sentFrom: string[] = [];
  globalThis.fetch = async (_input, init) => {
    sentFrom.push(String(init?.body));
    return new Response(JSON.stringify({ id: "should-not-send" }), { status: 200 });
  };
  const result = await processOutboxRetries(25);
  assert.equal(result.attempted, 0);
  assert.equal(sentFrom.length, 0);
  assert.equal((db.prepare("SELECT status FROM notification_log WHERE id = ?").get(retired) as { status: string }).status,
    "FAILED");
});

test("#326: real enqueue persists original From identity before dispatch; injected headers fail closed", async () => {
  process.env.EMAIL_MODE = "log"; // no provider activity
  const sender = getSenderSecurity();
  const params = {
    eventType: "PASSWORD_CHANGED" as const,
    idempotencyKey: "sender-provenance-enqueue-326",
    recipientEmail: "sender-provenance-new@example.invalid",
    userId: null,
    tenant: { companyId: null, companyName: null },
    sender,
    rendered: { templateId: "synthetic-test", templateVersion: "v1",
      subject: "Synthetic only", html: "<p>synthetic only</p>", text: "synthetic only" },
  };
  const result = await queueAndSendEmail(params);
  assert.equal(result.status, "SUPPRESSED");
  const stored = db.prepare("SELECT sender_name, sender_address, status FROM notification_log WHERE id = ?")
    .get(result.notificationId) as { sender_name: string; sender_address: string; status: string };
  assert.equal(stored.sender_name, sender.name);
  assert.equal(stored.sender_address, sender.address);
  assert.equal(stored.status, "SUPPRESSED");

  const beforeCount = (db.prepare("SELECT COUNT(*) AS n FROM notification_log").get() as { n: number }).n;
  await assert.rejects(() => queueAndSendEmail({
    ...params, idempotencyKey: "sender-provenance-header-injection",
    sender: { ...sender, name: "Invalid\\r\\nBcc: external@example.invalid".replaceAll("\\r", "\r").replaceAll("\\n", "\n") },
  }), /Invalid configured sender identity/);
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM notification_log").get() as { n: number }).n,
    beforeCount, "invalid sender may not create an outbox record");
});
