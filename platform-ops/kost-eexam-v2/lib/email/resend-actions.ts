// Actions "Renvoyer" (mission email §41-42) — RBAC + limite de débit +
// audit + idempotence sûre. Un lien expiré génère TOUJOURS un nouveau
// jeton sécurisé (jamais une réutilisation de l'ancien, §41 dernière
// ligne) via invalidatePendingTokens() + createActivationToken().
//
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb } from "../db";
import { findUserById } from "../users";
import { getGroup } from "../groups";
import { checkLoginRateLimit, recordLoginFailure } from "../rate-limit";
import { createActivationToken, invalidatePendingTokens } from "../activation-tokens";
import { notifyAccountCreated, notifyPasswordResetRequested } from "./events";
import { auditEmailInvitationResent, auditExamNotificationResent, auditPasswordResetRequested } from "./audit";
import type { ConsoleRole } from "../session";

export class ResendError extends Error {}

/** §42 — clé de limite dédiée par type d'action + cible, jamais mélangée
 * avec le limiteur de connexion (lib/rate-limit.ts, déjà éprouvé — même
 * moteur, clé différente). */
function resendRateLimitKey(kind: string, targetUserId: number): string {
  return `email-resend:${kind}:${targetUserId}`;
}

/** §41 "Renvoyer l'invitation" / "Renvoyer le lien d'activation" —
 * invalide l'ancien jeton non consommé, en émet un nouveau, renvoie
 * ACCOUNT_CREATED. Réservé aux comptes encore 'pending_activation'
 * (renvoyer une invitation à un compte déjà activé n'a pas de sens —
 * voir PASSWORD_RESET_REQUESTED pour un compte déjà actif). */
export async function resendInvitation(targetUserId: number, actor: { id: number; role: ConsoleRole }): Promise<void> {
  const rl = checkLoginRateLimit(resendRateLimitKey("invitation", targetUserId));
  if (!rl.allowed) throw new ResendError(`Trop de renvois récents pour ce compte. Réessayez dans ${Math.ceil(rl.retryAfterSeconds / 60)} minute(s).`);

  const target = findUserById(targetUserId);
  if (!target) throw new ResendError("Compte introuvable.");
  if (target.status !== "pending_activation") throw new ResendError("Ce compte est déjà activé — utilisez plutôt la réinitialisation de mot de passe.");
  if (!target.email) throw new ResendError("Ce compte n'a pas d'email au dossier — impossible d'envoyer une invitation.");

  invalidatePendingTokens(targetUserId, "account_setup");
  const { token, expiresAt } = createActivationToken({ userId: targetUserId, purpose: "account_setup", createdBy: actor.id });
  const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;

  const tenantRow = getDb()
    .prepare(
      `SELECT c.id AS company_id, c.name AS company_name, g.name AS group_name
       FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id
       WHERE gm.candidate_user_id = ? LIMIT 1`
    )
    .get(targetUserId) as { company_id: number; company_name: string; group_name: string } | undefined;

  // forceResendSuffix (mission "GO — ADD BRAHIMI..." 2026-08-29) — bug réel
  // trouvé en testant ce renvoi sur staging : sans lui, l'idempotency_key
  // restait la même que l'envoi d'origine et queueAndSendEmail()
  // dédupliquait silencieusement CE renvoi contre la toute première
  // tentative — "Renvoyer l'invitation" ne renvoyait donc jamais rien en
  // pratique, quel que soit le statut de la tentative d'origine (voir
  // lib/email/events.ts::notifyAccountCreated pour le détail).
  await notifyAccountCreated({
    userId: targetUserId,
    email: target.email,
    firstName,
    companyId: tenantRow?.company_id ?? null,
    companyName: tenantRow?.company_name ?? "KOST Academy",
    groupName: tenantRow?.group_name ?? "—",
    // Mission "COMPLETE USER MANAGEMENT" §19 — bug réel trouvé en
    // vérifiant que l'identifiant affiché est bien celui réellement utilisé
    // pour se connecter (app/login/LoginForm.tsx::name="username" +
    // lib/auth.ts::findUserByUsername) : l'email n'est JAMAIS l'identifiant
    // de connexion dans cette plateforme, même s'il ressemble à un email —
    // ce champ affichait auparavant target.email, potentiellement différent
    // du vrai username si l'admin les a saisis différemment à la création.
    usernameOrEmail: target.username,
    activationToken: token,
    expiresAt,
    forceResendSuffix: String(Date.now()),
  });

  recordLoginFailure(resendRateLimitKey("invitation", targetUserId)); // consomme un "essai" du limiteur, même en cas de succès (anti-spam, pas anti-erreur)
  auditEmailInvitationResent(actor.id, actor.role, targetUserId);
}

/** "Envoyer lien réinitialisation" (mission "COMPLETE USER MANAGEMENT",
 * §17 — action admin) — même token/même template/même flux de consommation
 * que le self-service "mot de passe oublié" (app/mot-de-passe/oublie/
 * actions.ts), déclenché ici par un admin pour un compte DÉJÀ actif
 * (jamais pour un compte pending_activation — utiliser resendInvitation
 * pour ce cas, qui reste le seul chemin légitime "premier accès"). Jamais
 * de mot de passe généré/affiché ici — uniquement un lien à usage unique. */
export async function sendPasswordResetLink(targetUserId: number, actor: { id: number; role: ConsoleRole }): Promise<void> {
  const rl = checkLoginRateLimit(resendRateLimitKey("password-reset-admin", targetUserId));
  if (!rl.allowed) throw new ResendError(`Trop de renvois récents pour ce compte. Réessayez dans ${Math.ceil(rl.retryAfterSeconds / 60)} minute(s).`);

  const target = findUserById(targetUserId);
  if (!target) throw new ResendError("Compte introuvable.");
  if (target.status !== "active") throw new ResendError("La réinitialisation de mot de passe n'est possible que pour un compte actif.");
  if (!target.email) throw new ResendError("Ce compte n'a pas d'email au dossier — impossible d'envoyer un lien.");

  invalidatePendingTokens(targetUserId, "password_reset");
  const { token, expiresAt } = createActivationToken({ userId: targetUserId, purpose: "password_reset", createdBy: actor.id });
  const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;

  const tenantRow = getDb()
    .prepare(
      `SELECT c.id AS company_id, c.name AS company_name
       FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id
       WHERE gm.candidate_user_id = ? LIMIT 1`
    )
    .get(targetUserId) as { company_id: number; company_name: string } | undefined;

  await notifyPasswordResetRequested({
    userId: targetUserId,
    email: target.email,
    firstName,
    username: target.username,
    resetToken: token,
    expiresAt,
    tenant: tenantRow ? { companyId: tenantRow.company_id, companyName: tenantRow.company_name } : undefined,
  });

  recordLoginFailure(resendRateLimitKey("password-reset-admin", targetUserId));
  auditPasswordResetRequested(actor.id, actor.role, targetUserId);
}

/** §41 "Renvoyer la notification d'examen" — relit l'état RÉEL actuel de
 * l'examen (jamais des valeurs mises en cache) et renvoie EXAM_ASSIGNED.
 * L'idempotency_key de EXAM_ASSIGNED est `exam-assigned/{assessmentId}/
 * {userId}` (voir lib/email/events.ts) — un renvoi explicite doit donc
 * utiliser une clé DIFFÉRENTE (horodatée) pour ne pas se faire
 * dédupliquer contre l'envoi original, sinon "Renvoyer" n'aurait aucun
 * effet observable la deuxième fois. */
export async function resendExamNotification(assessmentId: number, targetUserId: number, actor: { id: number; role: ConsoleRole }): Promise<void> {
  const rl = checkLoginRateLimit(resendRateLimitKey(`exam-${assessmentId}`, targetUserId));
  if (!rl.allowed) throw new ResendError(`Trop de renvois récents pour ce candidat. Réessayez dans ${Math.ceil(rl.retryAfterSeconds / 60)} minute(s).`);

  const db = getDb();
  const assigned = db.prepare(`SELECT 1 FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, targetUserId);
  if (!assigned) throw new ResendError("Ce candidat n'est pas affecté à cet examen.");

  const assessment = db.prepare(`SELECT name, function_code, group_id, open_at, close_at, duration_minutes, attempts_allowed FROM assessments WHERE id = ?`).get(assessmentId) as
    | { name: string; function_code: string; group_id: number; open_at: string | null; close_at: string | null; duration_minutes: number; attempts_allowed: number }
    | undefined;
  if (!assessment) throw new ResendError("Évaluation introuvable.");
  const group = getGroup(assessment.group_id);
  if (!group) throw new ResendError("Groupe introuvable.");
  const target = findUserById(targetUserId);
  if (!target?.email) throw new ResendError("Ce candidat n'a pas d'email au dossier.");

  const { notifyExamAssigned } = await import("./events");
  const { functionLabel } = await import("../questions");
  const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;

  await notifyExamAssigned({
    userId: targetUserId,
    email: target.email,
    firstName,
    assessmentId,
    examName: assessment.name,
    functionLabel: functionLabel(assessment.function_code),
    companyId: group.company_id,
    companyName: group.company_name,
    groupName: group.name,
    openAt: assessment.open_at,
    closeAt: assessment.close_at,
    durationMinutes: assessment.duration_minutes,
    attemptsAllowed: assessment.attempts_allowed,
    forceResendSuffix: String(Date.now()),
  });

  recordLoginFailure(resendRateLimitKey(`exam-${assessmentId}`, targetUserId));
  auditExamNotificationResent(actor.id, actor.role, assessmentId, targetUserId);
}
