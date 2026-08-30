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

// Mission "MISSION DE FERMETURE" (2026-08-30) §3 — extension de la
// politique de précédence monotone à TOUS les états terminaux
// (bounced/complained/failed n'avaient jusqu'ici AUCUNE garde, contraire
// à sent/delivered/delivery_delayed déjà protégés). Couvre exactement les
// 6 séquences hors-ordre exigées par la mission + le cas "doublon d'un
// même événement TERMINAL" (distinct du doublon 'delivered' déjà testé
// plus haut) + le cas "événement terminal inhabituel arrivant après un
// autre état terminal déjà enregistré" (ex. bounced après delivered).
describe("applyWebhookEvent — précédence terminale étendue (bounced/complained/failed), idempotence, séquences hors-ordre (mission « fermeture », 2026-08-30)", async () => {
  let db: ReturnType<typeof import("../../lib/db").getDb>;

  // Pas de nouvel appel à setupTestDb() ici : getDb() est un singleton
  // MODULE-LEVEL (lib/db.ts) — un second appel à setupTestDb() dans le
  // MÊME fichier de test réutiliserait la connexion déjà ouverte par le
  // `before` du describe précédent (celui-ci s'exécute en premier, ordre
  // séquentiel par défaut de node:test pour des describe de premier
  // niveau) et retenterait d'insérer les rôles/fonctions de référence en
  // double → violation de contrainte UNIQUE (bug réel rencontré en
  // écrivant ces tests). On réutilise donc simplement la connexion déjà
  // initialisée par le describe "applyWebhookEvent — progression de
  // statut..." ci-dessus.
  before(async () => {
    db = (await import("../../lib/db")).getDb();
  });

  function makeNotification(idempotencyKey: string, providerMessageId: string, initialStatus = "SENT") {
    const r = db
      .prepare(
        `INSERT INTO notification_log (recipient_email, event_type, template_id, template_version, subject, idempotency_key, status, provider_message_id, created_at)
         VALUES ('candidate-terminal@example.com', 'ACCOUNT_CREATED', 'test', 'v1', 'Test', ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(idempotencyKey, initialStatus, providerMessageId);
    return Number(r.lastInsertRowid);
  }

  function status(id: number): string {
    return (db.prepare(`SELECT status FROM notification_log WHERE id = ?`).get(id) as { status: string }).status;
  }

  function auditCount(action: string, targetId: number): number {
    return (db.prepare(`SELECT COUNT(*) n FROM audit_logs WHERE action = ? AND target_type = 'notification_log' AND target_id = ?`).get(action, targetId) as { n: number }).n;
  }

  function isSuppressed(email: string): boolean {
    return Boolean(db.prepare(`SELECT 1 FROM email_suppressions WHERE email = ?`).get(email.toLowerCase()));
  }

  // --- Les 6 séquences hors-ordre explicitement exigées par la mission ---

  test("séquence 'delivered → sent' — 'sent' tardif ne régresse jamais un DELIVERED (régression déjà couverte ci-dessus, reconfirmée ici avec la nouvelle politique élargie)", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-delivered-sent", "msg-seq-1");
    applyWebhookEvent("email.delivered", "msg-seq-1");
    assert.equal(status(id), "DELIVERED");
    const res = applyWebhookEvent("email.sent", "msg-seq-1");
    assert.equal(status(id), "DELIVERED");
    assert.equal(res.applied, false);
    assert.equal(res.reason, "stale_or_duplicate_event");
  });

  test("séquence 'bounced → sent' — 'sent' tardif ne régresse jamais un BOUNCED", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-bounced-sent", "msg-seq-2");
    applyWebhookEvent("email.bounced", "msg-seq-2");
    assert.equal(status(id), "BOUNCED");
    const res = applyWebhookEvent("email.sent", "msg-seq-2");
    assert.equal(status(id), "BOUNCED", "un 'sent' tardif ne doit jamais régresser un BOUNCED déjà enregistré");
    assert.equal(res.applied, false);
  });

  test("séquence 'failed → sent' — 'sent' tardif ne régresse jamais un FAILED", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-failed-sent", "msg-seq-3");
    applyWebhookEvent("email.failed", "msg-seq-3");
    assert.equal(status(id), "FAILED");
    const res = applyWebhookEvent("email.sent", "msg-seq-3");
    assert.equal(status(id), "FAILED");
    assert.equal(res.applied, false);
  });

  test("séquence 'complained → delivered' — 'delivered' tardif ne régresse jamais un COMPLAINED", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-complained-delivered", "msg-seq-4");
    applyWebhookEvent("email.complained", "msg-seq-4");
    assert.equal(status(id), "COMPLAINED");
    const res = applyWebhookEvent("email.delivered", "msg-seq-4");
    assert.equal(status(id), "COMPLAINED");
    assert.equal(res.applied, false);
  });

  test("séquence 'delivery_delayed → sent' — bug réel de cette mission : un 'sent' tardif effaçait auparavant l'information DELAYED (aucune garde n'excluait DELAYED du cas 'sent')", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-delayed-sent", "msg-seq-5");
    applyWebhookEvent("email.delivery_delayed", "msg-seq-5");
    assert.equal(status(id), "DELAYED");
    const res = applyWebhookEvent("email.sent", "msg-seq-5");
    assert.equal(status(id), "DELAYED", "un 'sent' tardif ne doit jamais effacer un DELAYED déjà connu (DELAYED est strictement plus informatif)");
    assert.equal(res.applied, false);
  });

  test("doublon d'un événement TERMINAL (bounced rejoué deux fois) — idempotent : statut/bounced_at inchangés, UNE SEULE entrée d'audit, suppression toujours présente une seule fois", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const email = "duplicate-bounce@example.com";
    const r = db
      .prepare(
        `INSERT INTO notification_log (recipient_email, event_type, template_id, template_version, subject, idempotency_key, status, provider_message_id, created_at)
         VALUES (?, 'ACCOUNT_CREATED', 'test', 'v1', 'Test', 'seq-bounce-dup', 'SENT', 'msg-seq-6', strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(email);
    const id = Number(r.lastInsertRowid);

    applyWebhookEvent("email.bounced", "msg-seq-6");
    const firstBouncedAt = (db.prepare(`SELECT bounced_at FROM notification_log WHERE id = ?`).get(id) as { bounced_at: string }).bounced_at;
    assert.equal(status(id), "BOUNCED");
    assert.equal(auditCount("notification_bounced", id), 1);
    assert.ok(isSuppressed(email));

    // Rejoué (webhook Resend "au moins une fois", retry légitime) — ne
    // doit RIEN changer de plus, en particulier jamais une 2e entrée
    // d'audit pour le même évènement déjà traité.
    const res = applyWebhookEvent("email.bounced", "msg-seq-6");
    assert.equal(res.applied, false, "un doublon exact ne doit pas se prétendre 'appliqué' une seconde fois");
    assert.equal(status(id), "BOUNCED");
    const secondBouncedAt = (db.prepare(`SELECT bounced_at FROM notification_log WHERE id = ?`).get(id) as { bounced_at: string }).bounced_at;
    assert.equal(firstBouncedAt, secondBouncedAt, "bounced_at ne doit jamais être re-timestampé par un doublon");
    assert.equal(auditCount("notification_bounced", id), 1, "jamais une 2e entrée d'audit pour un doublon du même évènement");
  });

  // --- Cas explicitement demandé par la mission : "définir ce qui se
  // passe si le fournisseur envoie un événement terminal inhabituel après
  // 'delivered'" — décision documentée en tête de lib/email/webhook.ts :
  // le PREMIER état terminal gagne définitivement pour la colonne status,
  // mais la liste de suppression reste mise à jour (protège les PROCHAINS
  // envois, jamais cette ligne déjà figée). ---
  test("événement terminal inhabituel après DELIVERED (ex. bounced tardif) — status reste DELIVERED (premier terminal gagné), MAIS la liste de suppression est quand même mise à jour pour protéger les prochains envois", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const email = "late-bounce-after-delivered@example.com";
    const r = db
      .prepare(
        `INSERT INTO notification_log (recipient_email, event_type, template_id, template_version, subject, idempotency_key, status, provider_message_id, created_at)
         VALUES (?, 'ACCOUNT_CREATED', 'test', 'v1', 'Test', 'seq-late-bounce', 'SENT', 'msg-seq-7', strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(email);
    const id = Number(r.lastInsertRowid);

    applyWebhookEvent("email.delivered", "msg-seq-7");
    assert.equal(status(id), "DELIVERED");
    assert.equal(isSuppressed(email), false);

    const res = applyWebhookEvent("email.bounced", "msg-seq-7");
    assert.equal(status(id), "DELIVERED", "le PREMIER état terminal (DELIVERED) reste enregistré, jamais écrasé par un 'bounced' tardif");
    assert.equal(res.applied, false, "la colonne status elle-même n'est pas considérée 'appliquée' — cohérent avec la politique documentée");
    assert.ok(isSuppressed(email), "la liste de suppression protège quand même les PROCHAINS envois à cette adresse, même si CETTE ligne reste figée sur DELIVERED");
    assert.equal(auditCount("notification_bounced", id), 0, "aucune entrée d'audit 'notification_bounced' quand le statut n'a pas réellement changé");
  });

  test("SUPPRESSED reste protégé — un 'delivered' ne réactive jamais une ligne délibérément mise en SUPPRESSED (EMAIL_MODE=allowlist)", async () => {
    const { applyWebhookEvent } = await import("../../lib/email/webhook");
    const id = makeNotification("seq-suppressed-delivered", "msg-seq-8", "SUPPRESSED");
    const res = applyWebhookEvent("email.delivered", "msg-seq-8");
    assert.equal(status(id), "SUPPRESSED");
    assert.equal(res.applied, false);
  });
});
