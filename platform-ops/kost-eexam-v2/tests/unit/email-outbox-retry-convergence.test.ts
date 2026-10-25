import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";
import { getSenderNotifications } from "../../lib/email/config";

describe("Outbox retry — convergence des gardes et compteurs", async () => {
  let db: ReturnType<typeof import("../../lib/db").getDb>;

  before(async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_MODE;
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    setupTestDb();
    db = (await import("../../lib/db")).getDb();
  });

  after(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_MODE;
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
  });

  function insertFailed(key: string, email: string, retryCount = 1) {
    const result = db.prepare(
      `INSERT INTO notification_log
         (recipient_email, sender_name, sender_address, event_type, template_id, template_version, subject,
          idempotency_key, status, retry_count, rendered_html, rendered_text,
          created_at, failed_at)
       VALUES (?, ?, ?, 'EXAM_ASSIGNED', 'test', 'v1', 'Test retry',
               ?, 'FAILED', ?, '<p>retry</p>', 'retry', ?, ?)`
    ).run(email, getSenderNotifications().name, getSenderNotifications().address,
      key, retryCount, new Date().toISOString(), new Date().toISOString());
    return Number(result.lastInsertRowid);
  }

  function row(id: number) {
    return db.prepare(
      `SELECT status, retry_count, rendered_html, rendered_text
       FROM notification_log WHERE id = ?`
    ).get(id) as {
      status: string;
      retry_count: number;
      rendered_html: string | null;
      rendered_text: string | null;
    };
  }

  test("FAILED devenu interdit par EMAIL_MODE=log converge vers SUPPRESSED sans tentative réseau", async () => {
    process.env.EMAIL_MODE = "log";
    const id = insertFailed("retry-log-terminalize", "retry-log@example.com");
    const { processOutboxRetries } = await import("../../lib/email/send");

    const result = await processOutboxRetries(25);

    assert.deepEqual(result, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 1 });
    const persisted = row(id);
    assert.equal(persisted.status, "SUPPRESSED");
    assert.equal(persisted.retry_count, 1, "aucune vraie tentative fournisseur ne doit consommer le budget de retry");
    assert.equal(persisted.rendered_html, null, "un état terminal ne doit plus conserver le corps à rejouer");
    assert.equal(persisted.rendered_text, null);
  });

  test("FAILED retiré de l'allowlist converge vers SUPPRESSED et n'est plus resélectionnable", async () => {
    process.env.EMAIL_MODE = "allowlist";
    process.env.EMAIL_ALLOWED_RECIPIENTS = "approved@example.com";
    const id = insertFailed("retry-allowlist-terminalize", "removed@example.com");
    const { processOutboxRetries } = await import("../../lib/email/send");

    const first = await processOutboxRetries(25);
    const second = await processOutboxRetries(25);

    assert.deepEqual(first, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 1 });
    assert.deepEqual(second, { attempted: 0, sent: 0, stillFailed: 0, skipped: 0, terminalized: 0 });
    assert.equal(row(id).status, "SUPPRESSED");
  });

  test("FAILED dont l'adresse entre en suppression bounce converge vers SUPPRESSED sans réenvoi", async () => {
    process.env.EMAIL_MODE = "send";
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    const email = "hard-bounced-retry@example.com";
    db.prepare(`INSERT INTO email_suppressions (email, reason) VALUES (?, 'hard_bounce')`).run(email);
    const id = insertFailed("retry-bounce-terminalize", email);
    const { processOutboxRetries } = await import("../../lib/email/send");

    const result = await processOutboxRetries(25);

    assert.deepEqual(result, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 1 });
    assert.equal(row(id).status, "SUPPRESSED");
  });

  test("clé Resend absente : aucune fausse tentative et aucun budget de retry consommé", async () => {
    process.env.EMAIL_MODE = "send";
    delete process.env.RESEND_API_KEY;
    const id = insertFailed("retry-config-missing", "provider-config-missing@example.com", 2);
    const { processOutboxRetries } = await import("../../lib/email/send");

    const result = await processOutboxRetries(25);

    assert.deepEqual(result, { attempted: 0, sent: 0, stillFailed: 0, skipped: 1, terminalized: 0 });
    const persisted = row(id);
    assert.equal(persisted.status, "FAILED", "une panne de configuration temporaire doit rester récupérable");
    assert.equal(persisted.retry_count, 2, "pas de tentative fournisseur = pas d'incrément du compteur");
    assert.equal(persisted.rendered_html, "<p>retry</p>", "le corps durable doit rester disponible pour une reprise future");
  });
});
