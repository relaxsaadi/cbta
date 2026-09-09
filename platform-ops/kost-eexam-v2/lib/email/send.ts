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
import { getEmailMode, getAllowedRecipients, isResendApiKeyConfigured, getReplyTo, type EmailSenderIdentity } from "./config";
import type { RenderedEmail, EmailEventType, EmailTenantContext } from "./types";

const MAX_RETRIES = 5;
const TERMINAL_STATUSES = new Set(["SENT", "DELIVERED", "SUPPRESSED", "BOUNCED", "COMPLAINED"]);

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
    getDb().prepare(`UPDATE notification_log SET rendered_html = NULL, rendered_text = NULL WHERE id = ?`).run(notificationId);
  }
}

/** Étape 1 (toujours synchrone, jamais sautée) — écrit l'outbox AVANT
 * toute tentative réseau. Étape 2 — tente l'envoi immédiatement en
 * best-effort ; en cas d'échec transitoire, la ligne reste FAILED avec le
 * corps rendu conservé et sera reprise par processOutboxRetries(). */
export async function queueAndSendEmail(params: QueueEmailParams): Promise<QueueEmailResult> {
  const db = getDb();

  const existing = findExisting(params.idempotencyKey);
  if (existing) {
    return { notificationId: existing.id, status: existing.status, deduplicated: true };
  }

  const now = nowIso();
  const result = db
    .prepare(
      `INSERT INTO notification_log
         (tenant_company_id, user_id, recipient_email, event_type, template_id, template_version, subject,
          provider, idempotency_key, status, metadata_json, rendered_html, rendered_text, created_at, queued_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'resend', ?, 'QUEUED', ?, ?, ?, ?, ?)`
    )
    .run(
      params.tenant.companyId,
      params.userId,
      params.recipientEmail,
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
  const notificationId = Number(result.lastInsertRowid);

  const finalStatus = await attemptSend(notificationId, {
    recipientEmail: params.recipientEmail,
    sender: params.sender,
    subject: params.rendered.subject,
    html: params.rendered.html,
    text: params.rendered.text,
    idempotencyKey: params.idempotencyKey,
  });
  return { notificationId, status: finalStatus, deduplicated: false };
}

interface SendAttemptInput {
  recipientEmail: string;
  sender: EmailSenderIdentity;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

async function attemptSend(notificationId: number, input: SendAttemptInput): Promise<string> {
  const db = getDb();
  const decision = resolveDeliveryDecision(input.recipientEmail);

  if (!decision.shouldSendReal) {
    db.prepare(`UPDATE notification_log SET status = 'SUPPRESSED', failure_reason_safe = ? WHERE id = ?`).run(decision.suppressReason ?? null, notificationId);
    purgeRenderedBodyIfTerminal(notificationId, "SUPPRESSED");
    return "SUPPRESSED";
  }

  if (!isResendApiKeyConfigured()) {
    db.prepare(`UPDATE notification_log SET status = 'FAILED', failure_reason_safe = ?, failed_at = ? WHERE id = ?`).run(
      "RESEND_API_KEY non configuré",
      nowIso(),
      notificationId
    );
    return "FAILED"; // corps CONSERVÉ — pas terminal, un retry ultérieur (une fois la clé ajoutée) doit pouvoir le rejouer
  }

  db.prepare(`UPDATE notification_log SET status = 'SENDING' WHERE id = ?`).run(notificationId);

  try {
    const resend = getResendClient();
    const replyTo = getReplyTo();
    const { data, error } = await resend.emails.send(
      {
        from: `${input.sender.name} <${input.sender.address}>`,
        to: input.recipientEmail,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(replyTo ? { replyTo } : {}),
      },
      // §34 — l'idempotence fournisseur est une OPTION DE REQUÊTE du SDK
      // Resend, pas un header personnalisé dans le message. Le mettre dans
      // `payload.headers` ne protège pas contre deux appels réseau du même
      // outbox row ; ce second argument est la primitive documentée par
      // Resend pour dédupliquer une même requête côté fournisseur.
      { idempotencyKey: input.idempotencyKey }
    );

    if (error) {
      const safeReason = safeFailureReason(error.message ?? "erreur fournisseur");
      db.prepare(`UPDATE notification_log SET status = 'FAILED', failure_reason_safe = ?, failed_at = ?, retry_count = retry_count + 1 WHERE id = ?`).run(
        safeReason,
        nowIso(),
        notificationId
      );
      return "FAILED";
    }

    db.prepare(`UPDATE notification_log SET status = 'SENT', provider_message_id = ?, sent_at = ? WHERE id = ?`).run(data?.id ?? null, nowIso(), notificationId);
    purgeRenderedBodyIfTerminal(notificationId, "SENT");
    return "SENT";
  } catch (err) {
    const safeReason = safeFailureReason(err instanceof Error ? err.message : "erreur réseau");
    db.prepare(`UPDATE notification_log SET status = 'FAILED', failure_reason_safe = ?, failed_at = ?, retry_count = retry_count + 1 WHERE id = ?`).run(
      safeReason,
      nowIso(),
      notificationId
    );
    return "FAILED";
  }
}

export interface OutboxRetryResult {
  /** Nombre de vraies tentatives fournisseur lancées pendant ce run. */
  attempted: number;
  sent: number;
  stillFailed: number;
  /** Lignes non envoyées parce qu'une garde de politique/configuration l'interdit. */
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
  const candidates = db
    .prepare(
      `SELECT id, recipient_email, subject, rendered_html, rendered_text, idempotency_key
       FROM notification_log
       WHERE status = 'FAILED' AND retry_count < ? AND rendered_html IS NOT NULL
       ORDER BY created_at ASC LIMIT ?`
    )
    .all(MAX_RETRIES, limit) as {
    id: number;
    recipient_email: string;
    subject: string;
    rendered_html: string;
    rendered_text: string;
    idempotency_key: string;
  }[];

  const resendConfigured = isResendApiKeyConfigured();
  const { getSenderNotifications } = await import("./config");
  const sender = getSenderNotifications();

  let attempted = 0;
  let sent = 0;
  let stillFailed = 0;
  let skipped = 0;
  let terminalized = 0;

  for (const row of candidates) {
    const decision = resolveDeliveryDecision(row.recipient_email);

    if (!decision.shouldSendReal) {
      // Réutilise attemptSend() afin que la même règle de suppression soit
      // appliquée à l'envoi initial ET au retry. Cette branche s'arrête
      // avant toute vérification/appel Resend : aucun réseau possible.
      const status = await attemptSend(row.id, {
        recipientEmail: row.recipient_email,
        sender,
        subject: row.subject,
        html: row.rendered_html,
        text: row.rendered_text,
        idempotencyKey: row.idempotency_key,
      });
      skipped++;
      if (status === "SUPPRESSED") terminalized++;
      continue;
    }

    if (!resendConfigured) {
      // Pas une tentative fournisseur : ne pas mentir dans les compteurs et
      // ne pas brûler le budget de retries. La ligne reste FAILED avec son
      // corps durable pour reprendre après correction de configuration.
      skipped++;
      continue;
    }

    attempted++;
    const status = await attemptSend(row.id, {
      recipientEmail: row.recipient_email,
      sender,
      subject: row.subject,
      html: row.rendered_html,
      text: row.rendered_text,
      idempotencyKey: row.idempotency_key,
    });
    if (status === "SENT") sent++;
    else stillFailed++;
  }

  return { attempted, sent, stillFailed, skipped, terminalized };
}
