import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Resend #323 — early signed webhook survives send-response race", () => {
  let db: ReturnType<typeof import("../../lib/db").getDb>;

  before(async () => {
    setupTestDb();
    db = (await import("../../lib/db")).getDb();
  });

  function makeInFlight(key: string) {
    const result = db.prepare(
      `INSERT INTO notification_log
         (recipient_email, event_type, template_id, template_version, subject,
          idempotency_key, status, rendered_html, rendered_text)
       VALUES (?, 'EXAM_SUBMITTED', 'test', 'v1', 'Synthetic test',
               ?, 'SENDING', '<p>Synthetic</p>', 'Synthetic')`
    ).run(`${key}@example.invalid`, key);
    return Number(result.lastInsertRowid);
  }

  const evidence = (providerEventId: string) => ({
    providerEventId, providerCreatedAt: "2026-10-25T16:01:02.000Z",
  });

  const pending = (messageId: string) => db.prepare(
    `SELECT provider_event_id, event_type FROM resend_pending_webhook_events
     WHERE provider_message_id = ? ORDER BY provider_event_id`
  ).all(messageId) as { provider_event_id: string; event_type: string }[];

  const notification = (id: number) => db.prepare(
    `SELECT status, provider_message_id, rendered_html FROM notification_log WHERE id = ?`
  ).get(id) as { status: string; provider_message_id: string | null; rendered_html: string | null };

  const providerAuditCount = (id: number) => (
    db.prepare(`SELECT COUNT(*) AS n FROM audit_logs
       WHERE target_type='notification_log' AND target_id=? AND action='notification_provider_event'`)
      .get(id) as { n: number }
  ).n;

  test("BOUNCE arrives while SENDING has no ID; verified evidence is durable and reconciles exactly once", async () => {
    const { applyWebhookEvent, finalizeResendAcceptedSend } = await import("../../lib/email/webhook");
    const id = makeInFlight("early-bounce");
    const messageId = "msg-early-bounce";
    const first = applyWebhookEvent("email.bounced", messageId, evidence("svix-early-bounce"));
    assert.equal(first.reason, "deferred_unmatched");
    assert.equal(pending(messageId).length, 1);
    assert.equal(notification(id).status, "SENDING");
    const repeated = applyWebhookEvent("email.bounced", messageId, evidence("svix-early-bounce"));
    assert.equal(repeated.reason, "deferred_unmatched");
    assert.equal(pending(messageId).length, 1, "retry cannot create duplicate signed evidence");

    finalizeResendAcceptedSend(id, messageId);
    assert.equal(notification(id).status, "BOUNCED");
    assert.equal(notification(id).provider_message_id, messageId);
    assert.equal(notification(id).rendered_html, null);
    assert.equal(pending(messageId).length, 0);
    assert.equal(providerAuditCount(id), 1);
    assert.ok(db.prepare(
      `SELECT 1 FROM email_suppressions WHERE email = 'early-bounce@example.invalid' AND reason = 'hard_bounce'`
    ).get(), "bounce suppression must not be lost");
    const afterReplay = applyWebhookEvent("email.bounced", messageId, evidence("svix-early-bounce"));
    assert.equal(afterReplay.reason, "stale_or_duplicate_event");
    assert.equal(providerAuditCount(id), 1);
  });

  test("independent delivered and complaint evidence survives reordered delivery", async () => {
    const { applyWebhookEvent, finalizeResendAcceptedSend, deriveCanonicalProviderOutcome } =
      await import("../../lib/email/webhook");
    const id = makeInFlight("early-complaint");
    const mid = "msg-early-complaint";
    assert.equal(applyWebhookEvent("email.delivered", mid, evidence("svix-early-delivered")).reason, "deferred_unmatched");
    assert.equal(applyWebhookEvent("email.complained", mid, evidence("svix-early-complained")).reason, "deferred_unmatched");
    assert.equal(pending(mid).length, 2);
    finalizeResendAcceptedSend(id, mid);
    assert.equal(providerAuditCount(id), 2);
    assert.equal(pending(mid).length, 0);
    assert.ok(db.prepare(`SELECT 1 FROM email_suppressions WHERE email = 'early-complaint@example.invalid' AND reason = 'complaint'`).get());
    assert.equal(deriveCanonicalProviderOutcome(["email.delivered", "email.complained"]), "COMPLAINED");
  });

  test("failed business audit rolls back linkage, replay and suppression together; recovery is deterministic", async () => {
    const { applyWebhookEvent, finalizeResendAcceptedSend } = await import("../../lib/email/webhook");
    const id = makeInFlight("early-rollback");
    const mid = "msg-early-rollback";
    assert.equal(applyWebhookEvent("email.bounced", mid, evidence("svix-early-rollback")).reason, "deferred_unmatched");
    db.exec(`CREATE TRIGGER fail_replayed_bounce BEFORE INSERT ON audit_logs
      WHEN NEW.action='notification_bounced'
      BEGIN SELECT RAISE(ABORT, 'forced replay audit failure'); END`);
    try {
      assert.throws(() => finalizeResendAcceptedSend(id, mid));
      assert.deepEqual(notification(id), { status: "SENDING", provider_message_id: null, rendered_html: "<p>Synthetic</p>" });
      assert.equal(providerAuditCount(id), 0);
      assert.equal(pending(mid).length, 1);
      assert.equal(Boolean(db.prepare(`SELECT 1 FROM email_suppressions WHERE email='early-rollback@example.invalid'`).get()), false);
    } finally {
      db.exec("DROP TRIGGER fail_replayed_bounce");
    }
    finalizeResendAcceptedSend(id, mid);
    assert.equal(notification(id).status, "BOUNCED");
    assert.equal(providerAuditCount(id), 1);
    assert.equal(pending(mid).length, 0);
  });

  test("unmatched external IDs and conflicting signed event IDs do not get linked by guesswork", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const mid = "external-provider-msg";
    assert.equal(applyWebhookEvent("email.delivered", mid, evidence("svix-external")).reason, "deferred_unmatched");
    assert.equal(pending(mid).length, 1);
    assert.equal(
      applyWebhookEvent("email.bounced", mid, evidence("svix-external")).reason,
      "invalid_event_evidence"
    );
    assert.equal(pending(mid)[0]!.event_type, "email.delivered");
    assert.equal(applyWebhookEvent("email.delivered", "unknown-no-signed-proof").reason, "unknown_message_id");
    assert.equal(
      applyWebhookEvent("email.delivered", "unknown-bad-proof", { providerEventId: "", providerCreatedAt: "2026-10-25T16:01:02.000Z" }).reason,
      "invalid_event_evidence"
    );
    assert.equal(pending("unknown-bad-proof").length, 0);
  });

  test("pending evidence survives a DB connection restart before provider ID materializes", async () => {
    const { applyWebhookEvent, finalizeResendAcceptedSend } = await import("../../lib/email/webhook");
    const { closeDb, getDb } = await import("../../lib/db");
    const id = makeInFlight("early-restart");
    const mid = "msg-early-restart";
    assert.equal(applyWebhookEvent("email.failed", mid, evidence("svix-early-restart")).reason, "deferred_unmatched");
    closeDb();
    db = getDb();
    assert.equal(pending(mid).length, 1);
    finalizeResendAcceptedSend(id, mid);
    assert.equal(notification(id).status, "FAILED");
    assert.equal(providerAuditCount(id), 1);
    assert.equal(pending(mid).length, 0);
  });

  test("duplicate provider message identity cannot attach an unrelated notification", async () => {
    const { finalizeResendAcceptedSend } = await import("../../lib/email/webhook");
    const first = makeInFlight("early-first");
    const second = makeInFlight("early-second");
    const mid = "msg-early-shared";
    finalizeResendAcceptedSend(first, mid);
    assert.throws(() => finalizeResendAcceptedSend(second, mid));
    assert.equal(notification(second).status, "SENDING");
    assert.equal(notification(second).provider_message_id, null);
  });
});
