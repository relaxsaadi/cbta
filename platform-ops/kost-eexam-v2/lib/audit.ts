// Point d'écriture UNIQUE vers audit_logs (§11 de la mission). Aucun autre
// fichier du projet ne doit faire `INSERT INTO audit_logs` directement —
// c'est une convention de code stricte (SQLite n'a pas de GRANT par table
// comme MySQL ; l'invariant "insert-only, un seul point d'entrée" est donc
// appliqué ici, pas au niveau moteur de données).
import { getDb, nowIso } from "./db";
import type { ConsoleRole } from "./session";

export interface AuditEntry {
  actorUserId: number | null;
  actorRole: ConsoleRole | null;
  action: string;
  targetType?: string | null;
  targetId?: number | null;
  result?: "success" | "failure";
  ipAddress?: string | null;
  sessionId?: number | null;
  metadata?: Record<string, unknown> | null;
}

export function audit(entry: AuditEntry): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_logs
       (timestamp, actor_user_id, actor_role, action, target_type, target_id, result, ip_address, session_id, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nowIso(),
    entry.actorUserId,
    entry.actorRole,
    entry.action,
    entry.targetType ?? null,
    entry.targetId ?? null,
    entry.result ?? "success",
    entry.ipAddress ?? null,
    entry.sessionId ?? null,
    entry.metadata ? JSON.stringify(entry.metadata) : null
  );
}

export interface AuditLogRow {
  id: number;
  timestamp: string;
  actor_user_id: number | null;
  actor_username: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  result: string;
  ip_address: string | null;
  metadata_json: string | null;
}

export function listAuditLogs(limit = 200): AuditLogRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT al.*, u.username AS actor_username
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.timestamp DESC
       LIMIT ?`
    )
    .all(limit) as unknown as AuditLogRow[];
}

export interface AuditLogFilter {
  dateFrom?: string;
  dateTo?: string;
  actorUserId?: number;
  actorRole?: string;
  action?: string;
  search?: string;
}

/** Version filtrée pour /audit-logs (§7 mission "COMPLETE MISSING
 * FILTERS"). Pas de filtre "Client/company" ici : audit_logs n'a AUCUNE
 * colonne company_id, et target_type/target_id varient trop selon
 * l'action (user/attempt/group/assessment/incident/document/guide/
 * platform_settings) pour une jointure fiable — la mission dit
 * explicitement "where authorized" et ailleurs "do not invent
 * relationships that do not exist" ; inventer une jointure heuristique
 * masquerait silencieusement des lignes valides pour les actions sans
 * lien direct à un client (login, MFA, paramètres plateforme...), ce que
 * §14 interdit. Sécurité tenant : cette page est déjà strictement
 * administrator/auditor (guardPage, voir page.tsx) — deux rôles à portée
 * globale, donc aucune restriction de périmètre à appliquer ici (RBAC à
 * l'entrée de page, pas un filtre). */
export function listAuditLogsFiltered(filter: AuditLogFilter = {}, limit = 300): AuditLogRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.dateFrom) {
    clauses.push(`al.timestamp >= ?`);
    params.push(`${filter.dateFrom}T00:00:00.000Z`);
  }
  if (filter.dateTo) {
    clauses.push(`al.timestamp <= ?`);
    params.push(`${filter.dateTo}T23:59:59.999Z`);
  }
  if (filter.actorUserId) {
    clauses.push(`al.actor_user_id = ?`);
    params.push(filter.actorUserId);
  }
  if (filter.actorRole) {
    clauses.push(`al.actor_role = ?`);
    params.push(filter.actorRole);
  }
  if (filter.action) {
    clauses.push(`al.action = ?`);
    params.push(filter.action);
  }
  if (filter.search) {
    clauses.push(`(LOWER(COALESCE(u.username, '')) LIKE ? OR LOWER(al.action) LIKE ? OR LOWER(COALESCE(al.target_type, '')) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT al.*, u.username AS actor_username
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ${where}
       ORDER BY al.timestamp DESC
       LIMIT ?`
    )
    .all(...params, limit) as unknown as AuditLogRow[];
}

/** Valeurs RÉELLEMENT présentes (jamais une liste inventée) — pour peupler
 * le <select> Action du panneau de filtres (§7 : "Do not invent audit
 * events"). */
export function listDistinctAuditActions(): string[] {
  return (getDb().prepare(`SELECT DISTINCT action FROM audit_logs ORDER BY action`).all() as { action: string }[]).map((r) => r.action);
}

/** Acteurs RÉELLEMENT présents dans le journal (pas l'annuaire complet des
 * utilisateurs — un <select> avec chaque compte jamais impliqué dans une
 * action serait bruyant et sans intérêt pour ce filtre précis). */
export function listDistinctAuditActors(): { id: number; username: string }[] {
  return getDb()
    .prepare(
      `SELECT DISTINCT u.id, u.username
       FROM audit_logs al JOIN users u ON u.id = al.actor_user_id
       ORDER BY u.username`
    )
    .all() as { id: number; username: string }[];
}
