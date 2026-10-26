// Moteur d'envoi centralisé — outbox + idempotence + retry (mission email
// §34-36). Point d'entrée UNIQUE pour tout envoi réel (jamais d'appel
// direct au SDK Resend ailleurs dans le code, §4).
//
// Garantie de fiabilité (§35) : l'écriture dans `notification_log` avec
// idempotency_key UNIQUE se fait TOUJOURS avant toute tentative d'envoi
// réseau — une création de candidat/affectation d'examen ne peut jamais
// échouer parce que Resend est indisponible ou lent ; au pire, l'email
// reste QUEUED/FAILED et une reprise (processOutboxRetries, appelée par
// un runner opérationnel lorsqu'il est réellement installé, ou par
// "Renvoyer") le rattrape plus tard — le corps rendu est persisté
// (rendered_html/rendered_text) pour que ce retry fonctionne réellement
// même après un redémarrage du process, pas seulement en mémoire du
// premier essai.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb, nowIso } from "../db";
import { getResendClient } from "./client";
import { finalizeResendAcceptedSend } from "./webhook";
import { getEmailMode, getAllowedRecipients, isResendApiKeyConfigured, getReplyTo, getSenderExam, getSenderNotifications, getSenderSecurity, getSenderSupport, type EmailSenderIdentity } from "./config";
import type { RenderedEmail, EmailEventType, EmailTenantContext } from "./types";

const MAX_RETRIES = 5;
const TERMINAL_STATUSES = new Set(["SENT", "DELIVERED", "SUPPRESSED", "BOUNCED", "COMPLAINED"]);

/** The persisted From address must be a single safe identity, not a header. */
function validOriginalSender(sender: EmailSenderIdentity): boolean {
  return sender.name.length > 0 && sender.name.length <= 128 &&
    sender.name.trim() === sender.name && !/[\r\n<>]/.test(sender.name) &&
    sender.address.length <= 254 && sender.address.trim() === sender.address &&
    /^[^\s@<>]+@[^\s@<>]+$/.test(sender.address);
}

/** Only currently configured identities may be reused; rotation quarantines legacy sender evidence. */
function currentRetrySenders(): EmailSenderIdentity[] {
  return [getSenderExam(), getSenderNotifications(), getSenderSecurity(), getSenderSupport()]
    .filter(validOriginalSender);
}

export interface QueueEmailParams {
  eventType: EmailEventType;
  idempotencyKey: string;
  recipientEmail: string;
  userId: number | null;
  tenant: EmailTenantContext;
  sender: EmailSenderIdentity;
  rendered: RenderedEmail;
  metadata?: Record<string, unknown>;
}

export interface QueueEmailResult {
  notificationId: number;
  status: string;
  deduplicated: boolean;
}

function isSuppressed(email: string): boolean {
  const row = getDb().prepare(`SELECT 1 FROM email_suppressions WHERE email = ?`).get(email.toLowerCase());
  return Boolean(row);
}

/** §34/§66 — anti-doublon : si un notification_log existe déjà pour cette
 * idempotency_key, on ne réécrit rien et on ne renvoie rien — on renvoie
 * simplement son état actuel. La garantie vient de la contrainte UNIQUE
 * elle-même (retry-safe même sous accès concurrent), pas seulement de
 * cette vérification applicative. */
function findExisting(idempotencyKey: string): { id: number; status: string } | undefined {
  return getDb().prepare(`SELECT id, status FROM notification_log WHERE idempotency_key = ?`).get(idempotencyKey) as
    | { id: number; status: string }
    | undefined;
}

/** §53 — sécurité de staging : "log" n'envoie jamais rien réellement
 * (SUPPRESSED, mais enregistré) ; "allowlist" n'envoie qu'aux adresses
 * listées ; "send" envoie normalement. Jamais un envoi réel accidentel à
 * un candidat en staging. */
function resolveDeliveryDecision(recipientEmail: string): { shouldSendReal: boolean; suppressReason?: string } {
  if (isSuppressed(recipientEmail)) return { shouldSendReal: false, suppressReason: "adresse en liste de suppression (bounce/plainte)" };

  const mode = getEmailMode();
  if (mode === "log") return { shouldSendReal: false, suppressReason: "EMAIL_MODE=log (staging — aucun envoi réel)" };
  if (mode === "allowlist") {
    const allowed = getAllowedRecipients();
    if (!allowed.includes(recipientEmail.toLowerCase())) {
      return { shouldSendReal: false, suppressReason: "destinataire hors liste autorisée EMAIL_ALLOWED_RECIPIENTS" };
    }
    return { shouldSendReal: true };
  }
  return { shouldSendReal: true };
}

/** §57/§32 — jamais un message d'erreur brut potentiellement porteur d'un
 * fragment de clé/URL signée dans failure_reason_safe (colonne persistée,
 * visible en historique admin) — uniquement une classification sûre. */
function safeFailureReason(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes("invalid") && lower.includes("recipient")) return "Adresse destinataire invalide";
  if (lower.includes("domain") || lower.includes("dns")) return "Problème de configuration domaine expéditeur";
  if (lower.includes("rate limit")) return "Limite de débit fournisseur atteinte";
  if (lower.includes("timeout") || lower.includes("network") || lower.includes("econn")) return "Erreur réseau temporaire";
  return "Échec d'envoi (voir logs serveur pour le détail technique)";
}

function purgeRenderedBodyIfTerminal(notificationId: number, status: string) {
  if (TERMINAL_STATUSES.has(status)) {
    getDb().prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL
      WHERE id = ? AND status IN ('SENT','DELIVERED','SUPPRESSED','BOUNCED','COMPLAINED')`).run(notificationId);
  }
}

/** Étape 1 (toujours synchrone, jamais sautée) — écrit l'outbox AVANT
 * toute tentative réseau. Étape 2 — tente l'envoi immédiatement en
 * best-effort ; en cas d'échec transitoire, la ligne reste FAILED avec le
 * corps rendu conservé et sera reprise par processOutboxRetries(). */
export async function queueAndSendEmail(params: QueueEmailParams): Promise<QueueEmailResult> {
  const db = getDb();
  if (!validOriginalSender(params.sender)) {
    throw new Error("Invalid configured sender identity — notification not enqueued");
  }

  const existing = findExisting(params.idempotencyKey);
  if (existing) {
    return { notificationId: existing.id, status: existing.status, deduplicated: true };
  }

  const replyTo = getReplyTo();
  if (replyTo && (/\r|\n/.test(replyTo) || replyTo.length > 254)) {
    throw new Error("Invalid configured Reply-To — notification not enqueued");
  }
  const now = nowIso();
  const result = db
    .prepare(
      `INSERT INTO notification_log
         (tenant_company_id, user_id, recipient_email, sender_name, sender_address, reply_to_address,
          event_type, template_id, template_version, subject,
          provider, idempotency_key, status, metadata_json, rendered_html, rendered_text, created_at, queued_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'resend', ?, 'QUEUED', ?, ?, ?, ?, ?)
       ON CONFLICT(idempotency_key) DO NOTHING`
    )
    .run(
      params.tenant.companyId,
      params.userId,
      params.recipientEmail,
      params.sender.name,
      params.sender.address,
      replyTo ?? null,
      params.eventType,
      params.rendered.templateId,
      params.rendered.templateVersion,
      params.rendered.subject,
      params.idempotencyKey,
      params.metadata ? JSON.stringify(params.metadata) : null,
      params.rendered.html,
      params.rendered.text,
      now,
      now
    );
  // A competing process may insert this logical notification after the
  // initial findExisting() read. The UNIQUE key remains authoritative:
  // the losing enqueue returns the winner without re-sending or rewriting
  // its immutable recipient/sender/payload/status. Do not suppress any
  // database error other than this specific idempotency conflict.
  if (Number(result.changes) === 0) {
    const winner = findExisting(params.idempotencyKey);
    if (!winner) throw new Error("Idempotency conflict without an accessible notification row");
    return { notificationId: winner.id, status: winner.status, deduplicated: true };
  }
  const notificationId = Number(result.lastInsertRowid);

  const finalOutcome = await attemptSend(notificationId, {
    recipientEmail: params.recipientEmail,
    sender: params.sender,
    subject: params.rendered.subject,
    html: params.rendered.html,
    text: params.rendered.text,
    idempotencyKey: params.idempotencyKey,
    replyTo,
  });
  return { notificationId, status: finalOutcome.status, deduplicated: false };
}

interface SendAttemptInput {
  recipientEmail: string;
  sender: EmailSenderIdentity;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  replyTo?: string;
}

interface SendAttemptOutcome {
  status: string;
  /** True only after the provider SDK call was actually invoked. */
  providerAttempted: boolean;
}

/**
 * A retry must already own the FAILED -> SENDING conditional claim.
 * Fresh notifications claim QUEUED -> SENDING here. A crash in SENDING is
 * deliberately not auto-replayed: provider acceptance may be ambiguous.
 */
async function attemptSend(notificationId: number, input: SendAttemptInput, retryClaimed = false): Promise<SendAttemptOutcome> {
  const db = getDb();
  if (!retryClaimed) {
    const claim = db.prepare(`UPDATE notification_log SET status = 'SENDING'
      WHERE id = ? AND status = 'QUEUED'`).run(notificationId);
    if (Number(claim.changes) !== 1) {
      const current = db.prepare(`SELECT status FROM notification_log WHERE id = ?`).get(notificationId) as
        { status: string } | undefined;
      return { status: current?.status ?? "FAILED", providerAttempted: false };
    }
  }
  // Reevaluate policy AFTER the durable claim, immediately before dispatch.
  const decision = resolveDeliveryDecision(input.recipientEmail);

  if (!decision.shouldSendReal) {
    db.prepare(`UPDATE notification_log SET status = 'SUPPRESSED', failure_reason_safe = ?
      WHERE id = ? AND status = 'SENDING'`).run(decision.suppressReason ?? null, notificationId);
    purgeRenderedBodyIfTerminal(notificationId, "SUPPRESSED");
    return { status: "SUPPRESSED", providerAttempted: false };
  }

  if (!isResendApiKeyConfigured()) {
    db.prepare(`UPDATE notification_log SET status = 'FAILED', failure_reason_safe = ?, failed_at = ?
      WHERE id = ? AND status = 'SENDING'`).run(
      "RESEND_API_KEY non configuré",
      nowIso(),
      notificationId
    );
    return { status: "FAILED", providerAttempted: false }; // corps conservé, retry après configuration
  }

  let providerAttempted = false;
  try {
    const resend = getResendClient();
    providerAttempted = true;
    const { data, error } = await resend.emails.send(
      {
        from: `${input.sender.name} <${input.sender.address}>`,
        to: input.recipientEmail,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      },
      // Resend request-scoped idempotency key, not a user-visible header.
      { idempotencyKey: input.idempotencyKey }
    );

    if (error) {
      // Resend SDK v6 returns transport/network failures as an *error
      // result* with statusCode=null, not necessarily as thrown exceptions.
      // Without a definitive HTTP response, acceptance may be unknown.
      // Never move this potentially accepted message to replayable FAILED.
      // HTTP 408 and 5xx also do not prove non-acceptance: a gateway or
      // upstream may fail after processing. Quarantine instead of replaying.
      if (error.statusCode == null || error.statusCode === 408 || error.statusCode >= 500) {
        db.prepare(`UPDATE notification_log
          SET failure_reason_safe = ?
          WHERE id = ? AND status = 'SENDING'`).run(
          "Acceptation fournisseur indéterminée après erreur réseau ou serveur — contrôle opérateur requis",
          notificationId
        );
        return { status: "SENDING", providerAttempted };
      }
      const safeReason = safeFailureReason(error.message ?? "erreur fournisseur");
      db.prepare(`UPDATE notification_log SET status = 'FAILED', failure_reason_safe = ?, failed_at = ?, retry_count = retry_count + 1
        WHERE id = ? AND status = 'SENDING'`).run(
        safeReason,
        nowIso(),
        notificationId
      );
      return { status: "FAILED", providerAttempted };
    }

    // Provider accepted the request. Without a valid provider identity we
    // CANNOT classify this as SENT or schedule a blind resend. It remains
    // SENDING for deliberate operator investigation (#225/#323).
    if (!data?.id) return { status: "SENDING", providerAttempted };

    try {
      // ID, SENT state and all already-signed early webhooks are committed
      // together. A failed reconciliation leaves SENDING (ambiguous
      // provider acceptance); never turn it into FAILED for auto-retry.
      finalizeResendAcceptedSend(notificationId, data.id);
      return { status: "SENT", providerAttempted };
    } catch {
      return { status: "SENDING", providerAttempted };
    }
  } catch (err) {
    // #328: a thrown transport error *after* invoking Resend is not proof
    // of rejection. The request could have been accepted before the reply
    // was lost. Keep SENDING off the automatic FAILED retry path, including
    // after process restart / expiration of provider idempotency retention.
    // Only a qualified operator can reconcile provider evidence.
    if (providerAttempted) {
      db.prepare(`UPDATE notification_log
        SET failure_reason_safe = ?
        WHERE id = ? AND status = 'SENDING'`).run(
        "Acceptation fournisseur indéterminée après interruption de transport — contrôle opérateur requis",
        notificationId
      );
      return { status: "SENDING", providerAttempted: true };
    }

    // Failure before the SDK invocation: no provider call is known to have
    // occurred. Preserve the durable body without burning a retry attempt.
    const safeReason = safeFailureReason(err instanceof Error ? err.message : "erreur locale");
    db.prepare(`UPDATE notification_log
      SET status = 'FAILED', failure_reason_safe = ?, failed_at = ?
      WHERE id = ? AND status = 'SENDING'`).run(
      safeReason,
      nowIso(),
      notificationId
    );
    return { status: "FAILED", providerAttempted: false };
  }
}

export interface OutboxRetryResult {
  /** Nombre de vraies tentatives fournisseur lancées pendant ce run. */
  attempted: number;
  sent: number;
  stillFailed: number;
  /** Sans appel fournisseur (politique/configuration, ou claim perdu face à un worker). */
  skipped: number;
  /** Sous-ensemble de skipped devenu terminal SUPPRESSED pendant ce run. */
  terminalized: number;
}

/** §36 — reprise bornée des échecs transitoires, via le corps rendu
 * persisté (fonctionne même après redémarrage du process, contrairement à
 * une simple retry en mémoire). Ne retente JAMAIS un bounce dur / une
 * plainte (déjà marqués BOUNCED/COMPLAINED par le webhook — jamais
 * remis à FAILED) — uniquement les FAILED dont retry_count < MAX_RETRIES
 * et dont le corps est encore présent.
 *
 * Important pour la convergence : une ligne FAILED peut devenir
 * non-envoyable APRÈS son échec initial (EMAIL_MODE=log, retrait de
 * l'allowlist, hard bounce/plainte). Dans ce cas elle devient SUPPRESSED et
 * son corps est purgé, plutôt que de rester FAILED et d'être resélectionnée
 * à chaque run. Cela ne contourne jamais les gardes : aucun appel réseau
 * n'est fait pour ces lignes. Une clé Resend absente, en revanche, est une
 * panne de configuration potentiellement temporaire : la ligne reste
 * FAILED et ne consomme pas son budget de retry tant qu'aucune vraie
 * tentative fournisseur n'a eu lieu.
 *
 * L'installation d'un runner automatique reste une étape opérationnelle
 * distincte ; cette fonction ne prétend pas qu'un cron est installé. */
export async function processOutboxRetries(limit = 25): Promise<OutboxRetryResult> {
  const db = getDb();
  // #326: the original From identity is immutable enqueue evidence.
  // Legacy sender-less rows and rows using a retired configured identity
  // must stay on hold; never guess an event->sender mapping. Filter them
  // in SQL so a large held backlog cannot starve newer valid retries.
  const senders = currentRetrySenders();
  const senderClauses = senders.map(() => "(sender_name = ? AND lower(sender_address) = ?)").join(" OR ");
  const senderArgs = senders.flatMap((sender) => [sender.name, sender.address.toLowerCase()]);
  const candidates = senders.length > 0 ? db
    .prepare(
      `SELECT id, recipient_email, sender_name, sender_address, reply_to_address, subject,
              rendered_html, rendered_text, idempotency_key, retry_count, failed_at
       FROM notification_log
       WHERE status = 'FAILED' AND retry_count < ? AND rendered_html IS NOT NULL
         AND (${senderClauses})
       ORDER BY created_at ASC LIMIT ?`
    )
    .all(MAX_RETRIES, ...senderArgs, limit) as {
    id: number;
    recipient_email: string;
    sender_name: string;
    sender_address: string;
    reply_to_address: string | null;
    subject: string;
    rendered_html: string;
    rendered_text: string;
    idempotency_key: string;
    retry_count: number;
    failed_at: string | null;
  }[] : [];

  const resendConfigured = isResendApiKeyConfigured();

  let attempted = 0;
  let sent = 0;
  let stillFailed = 0;
  let skipped = 0;
  let terminalized = 0;

  for (const row of candidates) {
    const decision = resolveDeliveryDecision(row.recipient_email);

    if (!decision.shouldSendReal) {
      // Policy terminalization is also conditional: another worker may have
      // claimed this snapshot already. Never overwrite its in-flight state.
      const terminal = db.prepare(`UPDATE notification_log
        SET status = 'SUPPRESSED', failure_reason_safe = ?, rendered_html = NULL, rendered_text = NULL
        WHERE id = ? AND status = 'FAILED' AND retry_count = ? AND failed_at IS ?`)
        .run(decision.suppressReason ?? null, row.id, row.retry_count, row.failed_at);
      skipped++;
      if (Number(terminal.changes) === 1) terminalized++;
      continue;
    }

    if (!resendConfigured) {
      skipped++;
      continue;
    }

    // Single SQLite writer / CAS: both the FAILED state and the selected
    // failure generation must still match. The retry_count + failed_at
    // fence prevents a stale worker from claiming again after a fast
    // failed first attempt (FAILED -> SENDING -> FAILED, the ABA race).
    const claim = db.prepare(`UPDATE notification_log SET status = 'SENDING'
      WHERE id = ? AND status = 'FAILED' AND retry_count = ? AND failed_at IS ?
        AND retry_count < ? AND rendered_html IS NOT NULL`)
      .run(row.id, row.retry_count, row.failed_at, MAX_RETRIES);
    if (Number(claim.changes) !== 1) {
      skipped++; // another worker won, or row changed; no provider attempt
      continue;
    }

    const outcome = await attemptSend(row.id, {
      recipientEmail: row.recipient_email,
      sender: { name: row.sender_name, address: row.sender_address },
      subject: row.subject,
      html: row.rendered_html,
      text: row.rendered_text,
      idempotencyKey: row.idempotency_key,
      replyTo: row.reply_to_address ?? undefined,
    }, true);
    if (!outcome.providerAttempted) {
      skipped++;
      if (outcome.status === "SUPPRESSED") terminalized++;
      continue;
    }
    attempted++;
    if (outcome.status === "SENT") sent++;
    else stillFailed++;
  }

  return { attempted, sent, stillFailed, skipped, terminalized };
}
