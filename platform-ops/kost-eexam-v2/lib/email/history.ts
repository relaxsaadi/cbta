// Historique des notifications (mission email §51) — lecture seule sur
// notification_log, jamais de secret exposé (le HTML/texte rendu n'est
// jamais renvoyé par ces fonctions, uniquement les métadonnées d'état déjà
// jugées sûres à afficher — voir le commentaire sur rendered_html dans
// lib/schema.sql). Filtres : statut / type d'événement / candidat / date /
// tenant, comme demandé.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { getDb } from "../db";
import { EMAIL_EVENT_TYPES, type EmailEventType } from "./types";

export interface NotificationHistoryRow {
  id: number;
  tenant_company_id: number | null;
  company_name: string | null;
  user_id: number | null;
  full_name: string | null;
  recipient_email: string;
  event_type: string;
  subject: string;
  status: string;
  failure_reason_safe: string | null;
  retry_count: number;
  metadata_json: string | null;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
}

export interface NotificationHistoryFilters {
  /** null = pas de restriction (administrator/auditor) ; tableau
   * (potentiellement vide) = restreint à ces user_id — même contrat que
   * lib/tenant-scope.ts::scopedUserIdsForSessionsOrNull, réutilisé tel
   * quel par la page appelante pour un responsable pédagogique. */
  userIdsOrNull: number[] | null;
  status?: string;
  eventType?: string;
  userId?: number;
  companyId?: number;
  /** Recherche libre sur l'email destinataire (LIKE, insensible à la casse). */
  search?: string;
  limit?: number;
}

export function listNotificationHistory(filters: NotificationHistoryFilters): NotificationHistoryRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (filters.userIdsOrNull !== null) {
    if (filters.userIdsOrNull.length === 0) return []; // périmètre vide — aucune candidate à afficher
    clauses.push(`n.user_id IN (${filters.userIdsOrNull.map(() => "?").join(",")})`);
    args.push(...filters.userIdsOrNull);
  }
  if (filters.status) {
    clauses.push(`n.status = ?`);
    args.push(filters.status);
  }
  if (filters.eventType) {
    clauses.push(`n.event_type = ?`);
    args.push(filters.eventType);
  }
  if (filters.userId) {
    clauses.push(`n.user_id = ?`);
    args.push(filters.userId);
  }
  if (filters.companyId) {
    clauses.push(`n.tenant_company_id = ?`);
    args.push(filters.companyId);
  }
  if (filters.search) {
    clauses.push(`n.recipient_email LIKE ?`);
    args.push(`%${filters.search.toLowerCase()}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = filters.limit ?? 200;

  return db
    .prepare(
      `SELECT n.id, n.tenant_company_id, c.name AS company_name, n.user_id, u.full_name,
              n.recipient_email, n.event_type, n.subject, n.status, n.failure_reason_safe,
              n.retry_count, n.metadata_json, n.created_at, n.sent_at, n.delivered_at
       FROM notification_log n
       LEFT JOIN companies c ON c.id = n.tenant_company_id
       LEFT JOIN users u ON u.id = n.user_id
       ${where}
       ORDER BY n.id DESC
       LIMIT ?`
    )
    .all(...args, limit) as unknown as NotificationHistoryRow[];
}

export function notificationHistorySummary(userIdsOrNull: number[] | null): { status: string; count: number }[] {
  const db = getDb();
  if (userIdsOrNull !== null && userIdsOrNull.length === 0) return [];
  const where = userIdsOrNull !== null ? `WHERE user_id IN (${userIdsOrNull.map(() => "?").join(",")})` : "";
  const args = userIdsOrNull !== null ? userIdsOrNull : [];
  return db
    .prepare(`SELECT status, COUNT(*) AS count FROM notification_log ${where} GROUP BY status ORDER BY count DESC`)
    .all(...args) as unknown as { status: string; count: number }[];
}

export const KNOWN_EVENT_TYPES: EmailEventType[] = EMAIL_EVENT_TYPES;
