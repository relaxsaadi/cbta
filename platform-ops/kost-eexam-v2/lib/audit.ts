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
