// Vérification et application des webhooks Resend.
//
// La signature Svix reste la frontière d'authentification. Depuis #100,
// chaque événement de cycle de vie signé peut aussi porter une identité
// provider + un horodatage provider durables. Cette preuve est conservée
// dans audit_logs (journal insert-only de la plateforme) avant de dériver
// l'état opérationnel, dans la MÊME transaction que les effets de bord.
// Cela évite qu'un terminal arrivé plus tard (notamment complaint/bounce)
// disparaisse derrière le premier terminal reçu.
import { createHmac, timingSafeEqual } from "node:crypto";
import { audit } from "../audit";
import { getDb, nowIso } from "../db";
import { auditNotificationBounced, auditNotificationDeliveryFailed } from "./audit";

const TOLERANCE_SECONDS = 5 * 60;
const PROVIDER_EVENT_AUDIT_ACTION = "notification_provider_event";
const HANDLED_EVENT_TYPES = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
]);

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

export interface ProviderWebhookEventEvidence {
  /** Identité du message webhook signé (svix-id). */
  providerEventId: string;
  /** Horodatage émis dans le payload Resend, normalisé en ISO UTC. */
  providerCreatedAt: string;
}

export interface WebhookApplyResult {
  applied: boolean;
  reason?: "unknown_message_id" | "deferred_unmatched" | "unhandled_event_type" | "stale_or_duplicate_event" | "invalid_event_evidence";
}

export type CanonicalProviderOutcome = "SENT" | "DELAYED" | "DELIVERED" | "FAILED" | "BOUNCED" | "COMPLAINED";

/**
 * État canonique d'AFFICHAGE à partir de l'historique fournisseur.
 *
 * Il s'agit volontairement d'une priorité de risque observé et non d'une
 * supposition sur l'ordre d'arrivée réseau. Une plainte/bounce/erreur déjà
 * observée ne peut donc jamais être masquée par un `delivered` arrivé avant
 * ou après. L'historique complet + les timestamps provider restent la source
 * de preuve ; cette valeur n'en détruit aucune.
 */
export function deriveCanonicalProviderOutcome(eventTypes: readonly string[]): CanonicalProviderOutcome | null {
  const observed = new Set(eventTypes);
  const precedence: readonly [string, CanonicalProviderOutcome][] = [
    ["email.complained", "COMPLAINED"],
    ["email.bounced", "BOUNCED"],
    ["email.failed", "FAILED"],
    ["email.delivered", "DELIVERED"],
    ["email.delivery_delayed", "DELAYED"],
    ["email.sent", "SENT"],
  ];
  for (const [eventType, outcome] of precedence) {
    if (observed.has(eventType)) return outcome;
  }
  return null;
}

/** Exige un timestamp absolu (Z ou offset explicite), jamais une date locale
 * ambiguë. Retourne l'ISO UTC canonique utilisé comme preuve durable. */
export function normalizeProviderEventTimestamp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed)) return null;
  const millis = Date.parse(trimmed);
  if (!Number.isFinite(millis)) return null;
  return new Date(millis).toISOString();
}

/** Ne fait JAMAIS confiance à une requête webhook non signée. */
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

  const candidates = svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean) as string[];
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

// `notification_log.status` reste un snapshot monotone compatible avec les
// écrans/actions existants : premier terminal reçu = snapshot figé. La
// vérité fournisseur n'est plus perdue pour autant : depuis #100, tous les
// événements signés sont journalisés séparément et l'UI dérive un outcome
// canonique fail-closed via deriveCanonicalProviderOutcome().
const TERMINAL_STATUSES = ["DELIVERED", "BOUNCED", "COMPLAINED", "FAILED", "SUPPRESSED"] as const;
const TERMINAL_SQL = TERMINAL_STATUSES.map((s) => `'${s}'`).join(",");

function providerEventAlreadyRecorded(notificationId: number, providerEventId: string): boolean {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT metadata_json
       FROM audit_logs
       WHERE action = ? AND target_type = 'notification_log' AND target_id = ?`
    )
    .all(PROVIDER_EVENT_AUDIT_ACTION, notificationId) as { metadata_json: string | null }[];

  return rows.some((row) => {
    if (!row.metadata_json) return false;
    try {
      const metadata = JSON.parse(row.metadata_json) as { provider?: unknown; providerEventId?: unknown };
      return metadata.provider === "resend" && metadata.providerEventId === providerEventId;
    } catch {
      return false;
    }
  });
}

function recordProviderEvent(params: {
  notificationId: number;
  providerMessageId: string;
  eventType: string;
  evidence: ProviderWebhookEventEvidence;
  receivedAt: string;
}): void {
  audit({
    actorUserId: null,
    actorRole: null,
    action: PROVIDER_EVENT_AUDIT_ACTION,
    targetType: "notification_log",
    targetId: params.notificationId,
    metadata: {
      provider: "resend",
      providerEventId: params.evidence.providerEventId,
      providerMessageId: params.providerMessageId,
      providerEventType: params.eventType,
      providerCreatedAt: params.evidence.providerCreatedAt,
      receivedAt: params.receivedAt,
    },
  });
}

function applyWebhookEventToSnapshot(params: {
  notificationId: number;
  notificationEventType: string;
  eventType: string;
  eventAt: string;
}): WebhookApplyResult {
  const db = getDb();
  const { notificationId, notificationEventType, eventType, eventAt } = params;

  switch (eventType) {
    case "email.sent": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'SENT', sent_at = COALESCE(sent_at, ?) WHERE id = ? AND status NOT IN (${TERMINAL_SQL}, 'DELAYED')`)
        .run(eventAt, notificationId);
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.delivered": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'DELIVERED', delivered_at = ? WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(eventAt, notificationId);
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      db.prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(notificationId);
      return { applied: true };
    }
    case "email.delivery_delayed": {
      const res = db.prepare(`UPDATE notification_log SET status = 'DELAYED' WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`).run(notificationId);
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.bounced": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'BOUNCED', bounced_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(eventAt, notificationId);
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notificationId) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'hard_bounce')`).run(row.recipient_email.toLowerCase());
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      auditNotificationBounced(notificationId, notificationEventType);
      return { applied: true };
    }
    case "email.complained": {
      const res = db
        .prepare(`UPDATE notification_log SET status = 'COMPLAINED', complained_at = ?, rendered_html = NULL, rendered_text = NULL WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`)
        .run(eventAt, notificationId);
      const row = db.prepare(`SELECT recipient_email FROM notification_log WHERE id = ?`).get(notificationId) as { recipient_email: string } | undefined;
      if (row) db.prepare(`INSERT OR IGNORE INTO email_suppressions (email, reason) VALUES (?, 'complaint')`).run(row.recipient_email.toLowerCase());
      return Number(res.changes) > 0 ? { applied: true } : { applied: false, reason: "stale_or_duplicate_event" };
    }
    case "email.failed": {
      const res = db.prepare(`UPDATE notification_log SET status = 'FAILED', failed_at = ? WHERE id = ? AND status NOT IN (${TERMINAL_SQL})`).run(eventAt, notificationId);
      if (Number(res.changes) === 0) return { applied: false, reason: "stale_or_duplicate_event" };
      auditNotificationDeliveryFailed(notificationId, notificationEventType);
      return { applied: true };
    }
    default:
      return { applied: false, reason: "unhandled_event_type" };
  }
}

/**
 * Applique un événement Resend déjà vérifié.
 *
 * Avec `evidence`, l'événement fournisseur et tous ses effets (snapshot,
 * suppression-list, audits métier) sont atomiques. Si une écriture échoue,
 * ROLLBACK intégral : le même svix-id peut être rejoué et réparera
 * déterministiquement l'opération. Un svix-id déjà COMMITté est idempotent.
 *
 * L'argument evidence reste optionnel uniquement pour les tests/unités de
 * domaine historiques et les appels internes antérieurs ; la route publique
 * Resend l'exige désormais systématiquement.
 */
// Safety ceiling. When full, the handler returns a retryable HTTP error
// rather than acknowledging a verified event it cannot retain. Unmatched
// provider identities need explicit operator disposition, never auto-resend.
const MAX_UNMATCHED_VERIFIED_EVENTS = 2_000;
const MAX_PROVIDER_EVENT_ID_LENGTH = 200;
const MAX_PROVIDER_MESSAGE_ID_LENGTH = 256;

interface NotificationForProvider {
  id: number;
  event_type: string;
}

function applyVerifiedEventInTransaction(
  notification: NotificationForProvider,
  eventType: string,
  providerMessageId: string,
  evidence: ProviderWebhookEventEvidence,
  receivedAt: string
): WebhookApplyResult {
  if (providerEventAlreadyRecorded(notification.id, evidence.providerEventId)) {
    return { applied: false, reason: "stale_or_duplicate_event" };
  }
  recordProviderEvent({
    notificationId: notification.id,
    providerMessageId,
    eventType,
    evidence,
    receivedAt,
  });
  // Snapshot, suppression list and business audit are part of the same
  // transaction as the immutable provider evidence.
  applyWebhookEventToSnapshot({
    notificationId: notification.id,
    notificationEventType: notification.event_type,
    eventType,
    eventAt: evidence.providerCreatedAt,
  });
  return { applied: true };
}

/**
 * Call ONLY after a successful provider API response containing its message
 * ID. The ID linkage, SENT snapshot, replay of earlier signed events, and
 * removal from the pending inbox commit atomically under BEGIN IMMEDIATE.
 * A crash cannot strand already-acknowledged early events between linkage
 * and replay. The caller must hold SENDING, not retry, on failure because
 * provider acceptance may already have happened.
 */
export function finalizeResendAcceptedSend(notificationId: number, providerMessageId: string): void {
  if (!providerMessageId || providerMessageId.length > MAX_PROVIDER_MESSAGE_ID_LENGTH) {
    throw new Error("Provider acceptance missing a valid message identity");
  }
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const notification = db.prepare(
      `SELECT id, event_type, status FROM notification_log WHERE id = ?`
    ).get(notificationId) as (NotificationForProvider & { status: string }) | undefined;
    if (!notification || notification.status !== "SENDING") {
      throw new Error("Expected an in-flight notification for provider finalization");
    }
    const conflict = db.prepare(
      `SELECT id FROM notification_log WHERE provider_message_id = ? AND id != ? LIMIT 1`
    ).get(providerMessageId, notificationId);
    if (conflict) throw new Error("Provider message identity already linked to another notification");

    db.prepare(
      `UPDATE notification_log
       SET status = 'SENT', provider_message_id = ?, sent_at = ?,
           rendered_html = NULL, rendered_text = NULL
       WHERE id = ? AND status = 'SENDING'`
    ).run(providerMessageId, nowIso(), notificationId);

    const pending = db.prepare(
      `SELECT provider_event_id, event_type, provider_created_at, received_at
       FROM resend_pending_webhook_events
       WHERE provider_message_id = ?
       ORDER BY received_at ASC, provider_event_id ASC`
    ).all(providerMessageId) as {
      provider_event_id: string;
      event_type: string;
      provider_created_at: string;
      received_at: string;
    }[];

    for (const event of pending) {
      applyVerifiedEventInTransaction(
        notification,
        event.event_type,
        providerMessageId,
        { providerEventId: event.provider_event_id, providerCreatedAt: event.provider_created_at },
        event.received_at
      );
      db.prepare(`DELETE FROM resend_pending_webhook_events WHERE provider_event_id = ?`).run(event.provider_event_id);
    }

    db.exec("COMMIT");
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch { /* Preserve original error. */ }
    throw error;
  }
}

/** Signed, timestamp-validated request only. Unknown provider IDs are
 * retained as compact verified evidence, not treated as delivered mail.
 * Legacy internal callers without evidence keep their historical behavior.
 */
export function applyWebhookEvent(
  eventType: string,
  providerMessageId: string,
  evidence?: ProviderWebhookEventEvidence
): WebhookApplyResult {
  const db = getDb();
  if (!evidence) {
    const notification = db.prepare(
      `SELECT id, event_type FROM notification_log WHERE provider_message_id = ?`
    ).get(providerMessageId) as NotificationForProvider | undefined;
    if (!notification) return { applied: false, reason: "unknown_message_id" };
    if (!HANDLED_EVENT_TYPES.has(eventType)) return { applied: false, reason: "unhandled_event_type" };
    return applyWebhookEventToSnapshot({
      notificationId: notification.id,
      notificationEventType: notification.event_type,
      eventType,
      eventAt: nowIso(),
    });
  }

  if (!HANDLED_EVENT_TYPES.has(eventType)) return { applied: false, reason: "unhandled_event_type" };
  const providerEventId = evidence.providerEventId.trim();
  const providerCreatedAt = normalizeProviderEventTimestamp(evidence.providerCreatedAt);
  if (
    !providerEventId ||
    providerEventId.length > MAX_PROVIDER_EVENT_ID_LENGTH ||
    !providerMessageId ||
    providerMessageId.length > MAX_PROVIDER_MESSAGE_ID_LENGTH ||
    !providerCreatedAt
  ) return { applied: false, reason: "invalid_event_evidence" };

  db.exec("BEGIN IMMEDIATE");
  try {
    const notification = db.prepare(
      `SELECT id, event_type FROM notification_log WHERE provider_message_id = ?`
    ).get(providerMessageId) as NotificationForProvider | undefined;

    if (!notification) {
      const existing = db.prepare(
        `SELECT provider_message_id, event_type, provider_created_at
         FROM resend_pending_webhook_events WHERE provider_event_id = ?`
      ).get(providerEventId) as {
        provider_message_id: string;
        event_type: string;
        provider_created_at: string;
      } | undefined;

      if (existing) {
        const consistent = existing.provider_message_id === providerMessageId &&
          existing.event_type === eventType && existing.provider_created_at === providerCreatedAt;
        db.exec("COMMIT");
        return consistent
          ? { applied: false, reason: "deferred_unmatched" }
          : { applied: false, reason: "invalid_event_evidence" };
      }

      const count = db.prepare(
        `SELECT COUNT(*) AS n FROM resend_pending_webhook_events`
      ).get() as { n: number };
      if (count.n >= MAX_UNMATCHED_VERIFIED_EVENTS) {
        // Caller returns 503; never ACK an event whose evidence was not saved.
        throw new Error("Verified provider event inbox capacity reached");
      }
      db.prepare(
        `INSERT INTO resend_pending_webhook_events
           (provider_event_id, provider_message_id, event_type, provider_created_at, received_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(providerEventId, providerMessageId, eventType, providerCreatedAt, nowIso());
      db.exec("COMMIT");
      return { applied: false, reason: "deferred_unmatched" };
    }

    const result = applyVerifiedEventInTransaction(
      notification, eventType, providerMessageId,
      { providerEventId, providerCreatedAt }, nowIso()
    );
    // Idempotent recovery if a signed event was already parked and this
    // message ID became linked by a prior process or authorized DB repair.
    db.prepare(
      `DELETE FROM resend_pending_webhook_events
       WHERE provider_event_id = ? AND provider_message_id = ? AND event_type = ?`
    ).run(providerEventId, providerMessageId, eventType);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try { db.exec("ROLLBACK"); } catch { /* Preserve original error. */ }
    throw error;
  }
}
