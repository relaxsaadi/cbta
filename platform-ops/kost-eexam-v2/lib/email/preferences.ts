// Préférences de notification (mission email §31) — UNIQUEMENT pour les
// rappels OPTIONNELS. Un événement dans MANDATORY_EVENT_TYPES (voir
// lib/email/types.ts) ignore TOUJOURS cette table — jamais de dépendance à
// un consentement marketing pour un message de sécurité/examen critique.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb, nowIso } from "../db";
import { MANDATORY_EVENT_TYPES, type EmailEventType } from "./types";

/** Décide si CET événement doit réellement être envoyé à CET utilisateur.
 * Retourne toujours true pour un événement obligatoire, sans même
 * consulter la table — appliqué au niveau code, pas seulement documenté
 * (même discipline que isAdmissibleWhereClause dans lib/questions.ts). */
export function shouldSendToUser(eventType: EmailEventType, userId: number): boolean {
  if (MANDATORY_EVENT_TYPES.has(eventType)) return true;
  const row = getDb().prepare(`SELECT optional_reminders_enabled FROM notification_preferences WHERE user_id = ?`).get(userId) as
    | { optional_reminders_enabled: number }
    | undefined;
  // Pas de ligne = valeur par défaut du schéma (activé) — un candidat qui
  // n'a jamais touché ses préférences reçoit les rappels par défaut.
  if (!row) return true;
  return row.optional_reminders_enabled === 1;
}

export function setOptionalRemindersEnabled(userId: number, enabled: boolean): void {
  getDb()
    .prepare(
      `INSERT INTO notification_preferences (user_id, optional_reminders_enabled, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET optional_reminders_enabled = excluded.optional_reminders_enabled, updated_at = excluded.updated_at`
    )
    .run(userId, enabled ? 1 : 0, nowIso());
}

export function getOptionalRemindersEnabled(userId: number): boolean {
  const row = getDb().prepare(`SELECT optional_reminders_enabled FROM notification_preferences WHERE user_id = ?`).get(userId) as
    | { optional_reminders_enabled: number }
    | undefined;
  return row ? row.optional_reminders_enabled === 1 : true;
}
