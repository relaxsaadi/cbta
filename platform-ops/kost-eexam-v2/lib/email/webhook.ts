// Vérification de signature webhook Resend (mission email §37-38) —
// implémentation native du standard Svix (HMAC-SHA256), même principe que
// lib/mfa.ts (TOTP natif) : zéro dépendance externe pour un algorithme
// suffisamment simple à implémenter correctement avec node:crypto, plutôt
// que d'ajouter le paquet `svix` pour ce seul point d'entrée. Référence :
// https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
// (Resend signe ses webhooks avec Svix — mêmes en-têtes, même format de
// secret whsec_<base64>).
//
// Pas de garde `import "server-only"` ici (même justification que
// lib/email/audit.ts pour la partie DB, et lib/mfa.ts/lib/passwords.ts
// pour la partie crypto) : le secret de vérification est reçu en
// PARAMÈTRE (jamais lu depuis process.env dans ce fichier — voir
// lib/email/config.ts pour ça), donc aucun risque réel de fuite même
// bundlé côté client par erreur. Testable via node:test (mission §72 :
// VALID_WEBHOOK/INVALID_WEBHOOK/DUPLICATE_WEBHOOK).
//
// applyWebhookEvent() ci-dessous est extraite du route handler
// (app/api/webhooks/resend/route.ts, qui reste volontairement mince) pour
// rester testable — un route handler Next.js n'est pas directement
// testable par node:test dans ce projet (convention établie : tester les
// fonctions lib/, jamais les route handlers eux-mêmes).
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb, nowIso } from "../db";
import { auditNotificationBounced, auditNotificationDeliveryFailed } from "./audit";

const TOLERANCE_SECONDS = 5 * 60; // §37 — fenêtre anti-rejeu raisonnable

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

/** Ne fait JAMAIS confiance à une requête webhook non signée (§37 dernière
 * ligne). Compare en temps constant, jamais avec `===` sur la signature
 * elle-même (évite une attaque par mesure de temps sur la comparaison). */
export function verifyResendWebhookSignature(params: {
  secret: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  rawBody: string;
}): WebhookVerificationResult {
  const { secret, svixId, svixTimestamp, svixSignature, rawBody } = params;
  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, reason: "En-têtes svix-id/svix-timestamp/svix-signature manquants." };
  }

  const tsNum = Number(svixTimestamp);
  if (!Number.isFinite(tsNum)) return { valid: false, reason: "svix-timestamp invalide." };
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsNum) > TOLERANCE_SECONDS) {
    return { valid: false, reason: "svix-timestamp hors tolérance (rejeu potentiel ou horloge désynchronisée)." };
  }

  const secretRaw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const secretBytes = Buffer.from(secretRaw, "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected, "base64");

  // svix-signature peut contenir plusieurs signatures espacées
  // ("v1,sig1 v1,sig2") — rotation de secret côté Resend. Une seule doit
  // correspondre.
  const candidates = svixSignature.split(" ").map((part) => part.split(",")[1]).filter(Boolean) as string[];
  for (const candidate of candidates) {
    let candidateBuf: Buffer;
    try {
      candidateBuf = Buffer.from(candidate, "base64");
    } catch {
      continue;
    }
    if (candidateBuf.length === expectedBuf.length && timingSafeEqual(candidateBuf, expectedBuf)) {
      return { valid: true };
    }
  }
  return { valid: false, reason: "Signature invalide." };
}

export interface WebhookApplyResult {
  applied: boolean;
  reason?: "unknown_message_id" | "unhandled_event_type";
}

/** Applique un événement Resend déjà vérifié (signature valide) à la
 * ligne notification_log correspondante. Bug réel trouvé et corrigé lors
 * du test de livraison contrôlée (2026-08-29) : les webhooks Resend
 * peuvent arriver dans le désordre (jitter réseau/file d'attente côté
 * fournisseur) — un "sent" arrivant APRÈS "delivered" écrasait
 * inconditionnellement le statut, faisant RÉGRESSER une ligne déjà
 * DELIVERED vers SENT (delivered_at restait renseigné, mais status
 * redevenait 'SENT' — état incohérent, découvert par une vérification
 * post-test, pas par les tests synthétiques déjà en place, qui ne
 * couvraient que l'ordre "normal"). La progression est maintenant
 * MONOTONE : chaque UPDATE exclut explicitement les statuts déjà plus
 * avancés/terminaux, un événement "antérieur" ne peut donc plus jamais
 * écraser un état déjà plus avancé. */
export function applyWebhookEvent(eventType: string, providerMessageId: string): WebhookApplyResult {
  const db = getDb();
  const notification = db.prepare(`SELECT id, event_type FROM notification_log WHERE provider_message_id = ?`).get(providerMessageId) as
    | { id: number; event_type: string }
    | undefined;
  // Message inconnu de ce système (ex. test envoyé hors application) —
  // pas une erreur : l'appelant (route handler) renvoie 200 quand même,
  // Resend interprète un non-200 comme "à retenter", et retenter
  // indéfiniment un message qu'on ne connaîtra jamais serait du bruit pur.
  if (!notification) return { applied: false, reason: "unknown_message_id" };

  const now = nowIso();
  switch (eventType) {
    case "email.sent":
      db.prepare(`UPDATE notification_log SET status = 'SENT', sent_at = COALESCE(sent_at, ?) WHERE id = ? AND status NOT IN ('DELIVERED','BOUNCED','COMPLAINED','FAILED')`).run(
        now,
        notification.id
      );
      return { applied: true };
    case "email.delivered":
      db.prepare(`UPDATE notification_log SET status = 'DELIVERED', delivered_at = ? WHERE id = ? AND status NOT IN ('BOUNCED','COMPLAINED','FAILED')`).run(now, notification.id);
      db.prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(notification.id);
      return { applied: true };
    case "email.delivery_delayed":
      db.prepare(`UPDATE notification_log SET status = 'DELAYED' WHERE id = ? AND status NOT IN ('DELIVERED','BOUNCED','COMPLAINED','FAILED')`).run(notification.id);
      return { applied: true };
    case "email.bounced": {
      db.prepare(`UPDATE notification_log SET status = 'BOUNCED', bounced_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(now, notification.id);
      // §40 — bounce dur : suppression list, plus jamais d'envoi
      // automatique à cette adresse tant qu'un admin ne l'en retire pas.
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'hard_bounce')`).run(row.recipient_email.toLowerCase());
      auditNotificationBounced(notification.id, notification.event_type);
      return { applied: true };
    }
    case "email.complained": {
      db.prepare(`UPDATE notification_log SET status = 'COMPLAINED', complained_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(now, notification.id);
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'complaint')`).run(row.recipient_email.toLowerCase());
      return { applied: true };
    }
    case "email.failed":
      db.prepare(`UPDATE notification_log SET status = 'FAILED', failed_at = ? WHERE id = ?`).run(now, notification.id);
      auditNotificationDeliveryFailed(notification.id, notification.event_type);
      return { applied: true };
    default:
      // Type d'événement reconnu par Resend mais non géré ici — pas une
      // erreur, juste rien à faire côté application.
      return { applied: false, reason: "unhandled_event_type" };
  }
}
