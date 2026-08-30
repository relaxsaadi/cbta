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
  reason?: "unknown_message_id" | "unhandled_event_type" | "stale_or_duplicate_event";
}

// Politique de PRÉCÉDENCE monotone — décision EXPLICITE, documentée ici
// plutôt que devinée en silence (mission "MISSION DE FERMETURE",
// 2026-08-30 §3). États TERMINAUX : une fois l'un d'eux atteint, la
// colonne `status` de cette ligne notification_log n'est plus JAMAIS
// modifiée par un webhook ultérieur — ni par le MÊME type d'événement
// rejoué (idempotence des doublons), ni par un événement terminal
// DIFFÉRENT arrivant en retard (ex. 'bounced' après 'delivered', ou
// l'inverse). "Premier événement terminal reçu, gagné" — c'est le seul
// comportement prévisible sans dépendre d'un ordre de gravité arbitraire
// que Resend lui-même ne documente pas (rien ne dit qu'un 'bounced' est
// "plus vrai" qu'un 'delivered' déjà enregistré, ou l'inverse — les deux
// peuvent légitimement arriver dans n'importe quel ordre selon le jitter
// réseau/file d'attente du fournisseur). SUPPRESSED n'est jamais posé par
// un webhook (voir lib/email/send.ts — décision prise AVANT tout envoi
// réel) mais reste protégé ici par cohérence : aucun webhook ne doit
// jamais "réactiver" une ligne délibérément mise en SUPPRESSED.
//
// Exception volontaire et ÉTROITE, limitée à la liste de suppression
// (jamais à la colonne `status` elle-même) : un 'bounced'/'complained'
// reçu alors que la ligne est déjà figée sur un AUTRE état terminal met
// quand même à jour email_suppressions — cette protection sert les
// PROCHAINS envois à cette adresse (une ligne future, différente),
// jamais à réécrire l'historique de la ligne déjà figée, donc ne viole
// pas la monotonie du statut.
//
// 'sent' exclut en plus DELAYED (non terminal, mais strictement plus
// informatif qu'un simple 'sent' tardif) : un 'sent' en retard ne doit
// jamais effacer l'information "on sait déjà que c'est retardé".
const TERMINAL_STATUSES = ["DELIVERED", "BOUNCED", "COMPLAINED", "FAILED", "SUPPRESSED"] as const;
const TERMINAL_SQL = TERMINAL_STATUSES.map((s) => `'${s}'`).join(",");

/** Applique un événement Resend déjà vérifié (signature valide) à la
 * ligne notification_log correspondante. Bug réel trouvé et corrigé lors
 * du test de livraison contrôlée (2026-08-29) : les webhooks Resend
 * peuvent arriver dans le désordre (jitter réseau/file d'attente côté
 * fournisseur) — un "sent" arrivant APRÈS "delivered" écrasait
 * inconditionnellement le statut, faisant RÉGRESSER une ligne déjà
 * DELIVERED vers SENT. Étendu (mission "MISSION DE FERMETURE",
 * 2026-08-30 §3) pour couvrir TOUS les états terminaux (bounced/
 * complained/failed avaient jusqu'ici zéro garde), voir la politique de
 * précédence documentée juste au-dessus. Chaque UPDATE vérifie
 * `res.changes` pour ne déclencher les effets de bord (audit,
 * purge rendered_html/text) QUE si la ligne a réellement changé — un
 * webhook dupliqué ou tardif/hors-ordre ne doit jamais produire une
 * seconde entrée d'audit ni re-timestamper un champ déjà figé. */
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
    case "email.sent": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'SENT', sent_at = COALESCE(sent_at, ?) WHERE id = ? AND status NOT IN (${TERMINAL_SQL}, 'DELAYED')`)
        .run(now, notification.id);
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.delivered": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'DELIVERED', delivered_at = ? WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(now, notification.id);
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      db.prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(notification.id);
      return { applied: true };
    }
    case "email.delivery_delayed": {
      const res = db.prepare(`UPDATE notification_log SET status = 'DELAYED' WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`).run(notification.id);
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.bounced": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'BOUNCED', bounced_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(now, notification.id);
      // §40 — bounce dur : suppression list, TOUJOURS appliquée (voir
      // l'exception documentée ci-dessus) même si cette ligne précise
      // était déjà figée par un autre état terminal — protège les
      // PROCHAINS envois à cette adresse, jamais cette ligne historique.
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'hard_bounce')`).run(row.recipient_email.toLowerCase());
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      auditNotificationBounced(notification.id, notification.event_type);
      return { applied: true };
    }
    case "email.complained": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'COMPLAINED', complained_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(now, notification.id);
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notification.id) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'complaint')`).run(row.recipient_email.toLowerCase());
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.failed": {
      const res = db.prepare(`UPDATE notification_log SET status = 'FAILED', failed_at = ? WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`).run(now, notification.id);
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      auditNotificationDeliveryFailed(notification.id, notification.event_type);
      return { applied: true };
    }
    default:
      // Type d'événement reconnu par Resend mais non géré ici — pas une
      // erreur, juste rien à faire côté application.
      return { applied: false, reason: "unhandled_event_type" };
  }
}
