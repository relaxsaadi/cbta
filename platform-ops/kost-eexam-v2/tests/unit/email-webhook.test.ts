import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { setupTestDb } from "./test-db";

// Mission email §37-38/§67 — vérification de signature webhook Resend
// (standard Svix natif, lib/email/webhook.ts). Un secret synthétique
// suffit pour tester l'algorithme lui-même — aucune dépendance au vrai
// RESEND_WEBHOOK_SECRET.
describe("Vérification de signature webhook Resend (Svix natif)", async () => {
  const { verifyResendWebhookSignature } = await import("../../lib/email/webhook");

  function sign(secretB64: string, id: string, timestamp: string, body: string): string {
    const secretBytes = Buffer.from(secretB64, "base64");
    const signedContent = `${id}.${timestamp}.${body}`;
    const sig = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
    return `v1,${sig}`;
  }

  const SECRET = `whsec_${Buffer.from("test-secret-material-32-bytes!!").toString("base64")}`;
  const SECRET_B64 = SECRET.slice("whsec_".length);

  test("une signature valide, fraîche, est acceptée", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, timestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, true);
  });

  test("une signature invalide (mauvais secret) est rejetée", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const wrongSecretB64 = Buffer.from("completely-different-secret!!!!").toString("base64");
    const signature = sign(wrongSecretB64, id, timestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, false);
  });

  test("un corps modifié après signature est rejeté (intégrité)", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, timestamp, body);
    const tamperedBody = JSON.stringify({ type: "email.delivered", data: { email_id: "DIFFERENT" } });
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: tamperedBody });
    assert.equal(result.valid, false);
  });

  test("un timestamp trop ancien (rejeu) est rejeté même avec une signature par ailleurs correcte", () => {
    const id = "msg_123";
    const oldTimestamp = String(Math.floor(Date.now() / 1000) - 3600); // 1h dans le passé
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, oldTimestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: oldTimestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, false);
  });

  test("en-têtes manquants sont rejetés proprement (jamais une exception non gérée)", () => {
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: null, svixTimestamp: null, svixSignature: null, rawBody: "{}" });
    assert.equal(result.valid, false);
  });
});

// Régression — bug réel trouvé lors du test de livraison contrôlée
// (2026-08-29) : un événement "sent" arrivant APRÈS "delivered" (les
// webhooks Resend peuvent arriver dans le désordre) écrasait
// inconditionnellement le statut, faisant régresser une ligne déjà
// DELIVERED vers SENT. Ce fichier teste applyWebhookEvent() directement
// (extraite du route handler pour rester testable, voir lib/email/webhook.ts).
describe("applyWebhookEvent — progression de statut MONOTONE, jamais de régression (mission email §37)", async () => {
  let db: ReturnType<typeof import("../../lib/db").getDb>;

  before(async () => {
    setupTestDb();
    db = (await import("../../lib/db")).getDb();
  });

  function makeNotification(idempotencyKey: string, providerMessageId: string | null) {
    const r = db
      .prepare(
        `INSERT INTO notification_log (recipient_email, event_type, template_id, template_version, subject, idempotency_key, status, provider_message_id, created_at)
         VALUES ('candidate@example.com', 'ACCOUNT_CREATED', 'test', 'v1', 'Test', ?, 'SENT', ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(idempotencyKey, providerMessageId);
    return Number(r.lastInsertRowid);
  }

  test("un 'sent' arrivant APRÈS 'delivered' ne fait JAMAIS régresser le statut (bug d'origine)", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const { getDb } = await import("../../lib/db");
    const id = makeNotification("webhook-order-test-1", "msg-order-1");

    applyWebhookEvent("email.delivered", "msg-order-1");
    let row = getDb().prepare(`SELECT status, delivered_at FROM notification_log WHERE id = ?`).get(id) as { status: string; delivered_at: string | null };
    assert.equal(row.status, "DELIVERED");
    assert.ok(row.delivered_at);

    // Événement "sent" en retard — ne doit RIEN changer.
    applyWebhookEvent("email.sent", "msg-order-1");
    row = getDb().prepare(`SELECT status, delivered_at FROM notification_log WHERE id = ?`).get(id) as { status: string; delivered_at: string | null };
    assert.equal(row.status, "DELIVERED", "un 'sent' tardif ne doit jamais régresser un statut déjà DELIVERED");
    assert.ok(row.delivered_at, "delivered_at doit rester renseigné");
  });

  test("l'ordre normal (sent puis delivered) fonctionne toujours correctement", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const { getDb } = await import("../../lib/db");
    const id = makeNotification("webhook-order-test-2", "msg-order-2");

    applyWebhookEvent("email.sent", "msg-order-2");
    let row = getDb().prepare(`SELECT status FROM notification_log WHERE id = ?`).get(id) as { status: string };
    assert.equal(row.status, "SENT");

    applyWebhookEvent("email.delivered", "msg-order-2");
    row = getDb().prepare(`SELECT status FROM notification_log WHERE id = ?`).get(id) as { status: string };
    assert.equal(row.status, "DELIVERED");
  });

  test("un 'delivery_delayed' tardif ne régresse pas non plus un statut DELIVERED", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const { getDb } = await import("../../lib/db");
    const id = makeNotification("webhook-order-test-3", "msg-order-3");

    applyWebhookEvent("email.delivered", "msg-order-3");
    applyWebhookEvent("email.delivery_delayed", "msg-order-3");
    const row = getDb().prepare(`SELECT status FROM notification_log WHERE id = ?`).get(id) as { status: string };
    assert.equal(row.status, "DELIVERED");
  });

  test("un provider_message_id inconnu du système est ignoré proprement (jamais une exception)", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const result = applyWebhookEvent("email.delivered", "msg-never-seen-by-this-system");
    assert.equal(result.applied, false);
    assert.equal(result.reason, "unknown_message_id");
  });

  test("un doublon du MÊME événement est idempotent (rejouer 'delivered' deux fois ne change rien de plus)", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const { getDb } = await import("../../lib/db");
    const id = makeNotification("webhook-order-test-5", "msg-order-5");

    applyWebhookEvent("email.delivered", "msg-order-5");
    const first = getDb().prepare(`SELECT status, delivered_at FROM notification_log WHERE id = ?`).get(id) as { status: string; delivered_at: string };
    applyWebhookEvent("email.delivered", "msg-order-5");
    const second = getDb().prepare(`SELECT status, delivered_at FROM notification_log WHERE id = ?`).get(id) as { status: string; delivered_at: string };
    assert.equal(second.status, "DELIVERED");
    assert.equal(first.status, second.status);
  });
});
