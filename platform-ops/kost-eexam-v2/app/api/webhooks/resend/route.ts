import { NextResponse } from "next/server";
import { verifyResendWebhookSignature } from "@/lib/email/webhook";
import { isResendWebhookSecretConfigured, getResendWebhookSecretOrThrow } from "@/lib/email/config";
import { getDb, nowIso } from "@/lib/db";
import { auditNotificationDeliveryFailed, auditNotificationBounced } from "@/lib/email/audit";

// Webhook Resend (mission email §37-38) — reçoit les statuts de livraison
// réels (sent/delivered/delayed/bounced/complained/failed). JAMAIS de
// confiance sans vérification de signature (voir lib/email/webhook.ts,
// standard Svix natif). Idempotent par construction : une UPDATE SQL sur
// le même provider_message_id vers le même statut final n'a pas d'effet
// de bord différent si rejouée (§37 — "duplicate event: no duplicate side
// effects").
//
// Route PUBLIQUE (voir proxy.ts PUBLIC_PATHS) — Resend n'envoie jamais de
// cookie de session ; sa propre signature EST l'authentification, même
// principe que /api/attempts/sweep (jeton partagé) mais avec vérification
// cryptographique au lieu d'une simple égalité de chaîne.
export async function POST(request: Request) {
  if (!isResendWebhookSecretConfigured()) {
    // §38 — ne jamais fabriquer un secret : si absent, la route reste en
    // place (prête) mais refuse tout événement tant que le secret n'est
    // pas configuré, plutôt que d'accepter des requêtes non vérifiables.
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET non configuré côté serveur." }, { status: 503 });
  }

  const rawBody = await request.text();
  const verification = verifyResendWebhookSignature({
    secret: getResendWebhookSecretOrThrow(),
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
    rawBody,
  });

  if (!verification.valid) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: { type?: string; data?: { email_id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const messageId = payload.data?.email_id;
  const eventType = payload.type;
  if (!messageId || !eventType) {
    return NextResponse.json({ error: "Champs data.email_id / type manquants." }, { status: 400 });
  }

  const db = getDb();
  const notification = db
    .prepare(`SELECT id, event_type FROM notification_log WHERE provider_message_id = ?`)
    .get(messageId) as { id: number; event_type: string } | undefined;
  if (!notification) {
    // Message inconnu de ce système (ex. test envoyé hors application) —
    // 200 quand même : Resend interprète un non-200 comme "à retenter",
    // et retenter indéfiniment un message qu'on ne connaîtra jamais serait
    // du bruit pur.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const now = nowIso();
  switch (eventType) {
    case "email.sent":
      db.prepare(`UPDATE notification_log SET status = 'SENT', sent_at = COALESCE(sent_at, ?) WHERE id = ?`).run(now, notification.id);
      break;
    case "email.delivered":
      db.prepare(`UPDATE notification_log SET status = 'DELIVERED', delivered_at = ? WHERE id = ?`).run(now, notification.id);
      db.prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(notification.id);
      break;
    case "email.delivery_delayed":
      db.prepare(`UPDATE notification_log SET status = 'DELAYED' WHERE id = ?`).run(notification.id);
      break;
    case "email.bounced":
      db.prepare(`UPDATE notification_log SET status = 'BOUNCED', bounced_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(now, notification.id);
      // §40 — bounce dur : suppression list, plus jamais d'envoi
      // automatique à cette adresse tant qu'un admin ne l'en retire pas.
      {
        const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
        if (row) {
          db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'hard_bounce')`).run(row.recipient_email.toLowerCase());
        }
      }
      auditNotificationBounced(notification.id, notification.event_type);
      break;
    case "email.complained":
      db.prepare(`UPDATE notification_log SET status = 'COMPLAINED', complained_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(now, notification.id);
      {
        const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
        if (row) {
          db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'complaint')`).run(row.recipient_email.toLowerCase());
        }
      }
      break;
    case "email.failed":
      db.prepare(`UPDATE notification_log SET status = 'FAILED', failed_at = ? WHERE id = ?`).run(now, notification.id);
      auditNotificationDeliveryFailed(notification.id, notification.event_type);
      break;
    default:
      // Type d'événement reconnu par Resend mais non géré ici — 200 quand
      // même (pas une erreur, juste rien à faire côté application).
      break;
  }

  return NextResponse.json({ ok: true });
}
