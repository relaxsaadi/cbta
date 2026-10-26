import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { getSenderExam, getSenderSecurity } from "../../lib/email/config";
import { processOutboxRetries, queueAndSendEmail } from "../../lib/email/send";

// Synthetic transport failure: an exception does not establish whether the
// provider accepted the request. Never contact a real provider/recipient.
let db: ReturnType<typeof getDb>;
const oldEnv: Record<string, string | undefined> = {};
let originalFetch: typeof globalThis.fetch;
const recipient = "transport-ambiguous-328@example.invalid";

before(() => {
  for (const name of ["EMAIL_MODE", "EMAIL_ALLOWED_RECIPIENTS", "RESEND_API_KEY"]) {
    oldEnv[name] = process.env[name];
  }
  process.env.EMAIL_MODE = "allowlist";
  process.env.EMAIL_ALLOWED_RECIPIENTS = recipient;
  process.env.RESEND_API_KEY = "re_test_synthetic_only";
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

test("#328: initial send transport exception quarantines uncertain provider acceptance", async () => {
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls++;
    throw new TypeError("synthetic connection reset after possible provider acceptance");
  };
  const result = await queueAndSendEmail({
    eventType: "EXAM_SUBMITTED",
    idempotencyKey: "synthetic-ambiguous-initial-328",
    recipientEmail: recipient,
    userId: null,
    tenant: { companyId: null, companyName: null },
    sender: getSenderExam(),
    rendered: { templateId: "synthetic-328", templateVersion: "v1",
      subject: "Synthetic only", html: "<p>synthetic only</p>", text: "synthetic only" },
  });
  assert.equal(result.status, "SENDING", "unknown acceptance must not be FAILED or SENT");
  assert.equal(providerCalls, 1);
  const stored = db.prepare(`SELECT status, retry_count, provider_message_id,
    failure_reason_safe, rendered_html FROM notification_log WHERE id = ?`).get(result.notificationId) as {
    status: string; retry_count: number; provider_message_id: string | null;
    failure_reason_safe: string | null; rendered_html: string | null;
  };
  assert.equal(stored.status, "SENDING");
  assert.equal(stored.retry_count, 0, "do not pretend a definitively failed delivery");
  assert.equal(stored.provider_message_id, null);
  assert.match(stored.failure_reason_safe ?? "", /indéterminée/);
  assert.ok(stored.rendered_html, "retain rendered evidence for operator reconciliation");
  const sweep = await processOutboxRetries(10);
  assert.equal(sweep.attempted, 0);
  assert.equal(providerCalls, 1, "retry runner must not replay an uncertain message");
});

test("#328: FAILED retry transport exception transitions to SENDING hold, not another FAILED retry", async () => {
  const sender = getSenderSecurity();
  const inserted = db.prepare(`INSERT INTO notification_log
    (recipient_email, sender_name, sender_address, event_type, template_id, template_version,
     subject, idempotency_key, status, retry_count, rendered_html, rendered_text, created_at, failed_at)
    VALUES (?, ?, ?, 'PASSWORD_CHANGED', 'synthetic-328', 'v1',
      'Synthetic retry', 'synthetic-ambiguous-retry-328', 'FAILED', 1,
      '<p>synthetic only</p>', 'synthetic only', ?, ?)`).run(
    recipient, sender.name, sender.address,
    "2026-10-26T00:00:00.000Z", "2026-10-26T00:00:01.000Z"
  );
  const id = Number(inserted.lastInsertRowid);
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls++;
    throw new TypeError("synthetic transport timeout after possible acceptance");
  };
  const first = await processOutboxRetries(10);
  assert.equal(first.attempted, 1);
  assert.equal(first.sent, 0);
  assert.equal(providerCalls, 1);
  const stored = db.prepare(`SELECT status, retry_count, provider_message_id, failure_reason_safe
    FROM notification_log WHERE id = ?`).get(id) as {
    status: string; retry_count: number; provider_message_id: string | null;
    failure_reason_safe: string | null;
  };
  assert.equal(stored.status, "SENDING");
  assert.equal(stored.retry_count, 1, "no automatic reissue of uncertain acceptance");
  assert.equal(stored.provider_message_id, null);
  assert.match(stored.failure_reason_safe ?? "", /opérateur/);
  const second = await processOutboxRetries(10);
  assert.equal(second.attempted, 0);
  assert.equal(providerCalls, 1, "no second provider call on the next sweep");
});
