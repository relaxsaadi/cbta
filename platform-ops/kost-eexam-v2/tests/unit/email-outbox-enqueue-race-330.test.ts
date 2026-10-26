import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getDb } from "../../lib/db";
import { getSenderExam } from "../../lib/email/config";
import { queueAndSendEmail } from "../../lib/email/send";

// A synthetic SQLite BEFORE INSERT trigger places the competing winner
// *after* findExisting() observes no row and *before* the original INSERT
// reaches its uniqueness check. This is deterministic, unlike a timed
// two-process race. No provider, recipient, or production database is used.
let db: ReturnType<typeof getDb>;
const oldMode = process.env.EMAIL_MODE;
const oldReplyTo = process.env.EMAIL_REPLY_TO;

before(() => {
  process.env.EMAIL_MODE = "log";
  delete process.env.EMAIL_REPLY_TO;
  setupTestDb();
  db = getDb();
});

after(() => {
  if (oldMode === undefined) delete process.env.EMAIL_MODE;
  else process.env.EMAIL_MODE = oldMode;
  if (oldReplyTo === undefined) delete process.env.EMAIL_REPLY_TO;
  else process.env.EMAIL_REPLY_TO = oldReplyTo;
});

test("#330: competing enqueue wins during INSERT; loser returns deduplicated winner without re-dispatch", async () => {
  const key = "synthetic-enqueue-race-330";
  db.exec(`
    PRAGMA recursive_triggers = OFF;
    CREATE TEMP TRIGGER synthetic_competing_enqueue_330
    BEFORE INSERT ON notification_log
    WHEN NEW.idempotency_key = 'synthetic-enqueue-race-330'
    BEGIN
      INSERT INTO notification_log (
        tenant_company_id, user_id, recipient_email, sender_name, sender_address,
        reply_to_address, event_type, template_id, template_version, subject,
        provider, idempotency_key, status, metadata_json, rendered_html,
        rendered_text, created_at, queued_at
      ) VALUES (
        NEW.tenant_company_id, NEW.user_id, NEW.recipient_email, NEW.sender_name,
        NEW.sender_address, NEW.reply_to_address, NEW.event_type, NEW.template_id,
        NEW.template_version, NEW.subject, 'resend', NEW.idempotency_key,
        'QUEUED', NEW.metadata_json, NEW.rendered_html, NEW.rendered_text,
        NEW.created_at, NEW.queued_at
      );
    END;
  `);

  const params = {
    eventType: "EXAM_SUBMITTED" as const,
    idempotencyKey: key,
    recipientEmail: "enqueue-race-330@example.invalid",
    userId: null,
    tenant: { companyId: null, companyName: null },
    sender: getSenderExam(),
    rendered: {
      templateId: "synthetic-330",
      templateVersion: "v1",
      subject: "Synthetic race",
      html: "<p>No delivery</p>",
      text: "No delivery",
    },
  };
  const result = await queueAndSendEmail(params);
  assert.equal(result.deduplicated, true, "losing enqueue must return existing winner");
  assert.equal(result.status, "QUEUED", "loser must not dispatch or alter winner state");
  assert.ok(result.notificationId > 0);

  const rows = db.prepare(`SELECT id, status, sender_address, recipient_email, rendered_html
    FROM notification_log WHERE idempotency_key = ?`).all(key) as Array<{
    id: number; status: string; sender_address: string;
    recipient_email: string; rendered_html: string | null;
  }>;
  assert.equal(rows.length, 1, "SQLite UNIQUE key must remain authoritative");
  assert.equal(rows[0].id, result.notificationId);
  assert.equal(rows[0].status, "QUEUED");
  assert.equal(rows[0].recipient_email, params.recipientEmail);
  assert.equal(rows[0].sender_address, params.sender.address);
  assert.equal(rows[0].rendered_html, params.rendered.html,
    "loser must not overwrite or purge the winning payload");

  const repeated = await queueAndSendEmail(params);
  assert.deepEqual(repeated, result, "subsequent duplicate remains idempotent");
  assert.equal((db.prepare(`SELECT count(*) AS n FROM notification_log
    WHERE idempotency_key = ?`).get(key) as { n: number }).n, 1);
});
