// Registre serveur des sessions (table `sessions`) — la source de vérité
// pour la révocation (§20 de la mission). Le cookie iron-session ne porte
// qu'un `dbSessionId` ; CHAQUE requête authentifiée doit revérifier ici que
// la session n'a pas été révoquée, sans quoi "déconnecter toutes les
// sessions de cet utilisateur" ne ferait rien tant que le cookie chiffré
// n'a pas expiré naturellement (jusqu'à 8h).
import { createHash, randomBytes } from "node:crypto";
import { getDb, nowIso } from "./db";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createDbSession(params: {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}): { dbSessionId: number; token: string } {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  const result = db
    .prepare(
      `INSERT INTO sessions (user_id, session_token_hash, created_at, last_seen_at, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(params.userId, tokenHash, now.toISOString(), now.toISOString(), expiresAt, params.ipAddress ?? null, params.userAgent ?? null);
  return { dbSessionId: Number(result.lastInsertRowid), token };
}

export interface SessionRow {
  id: number;
  user_id: number;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_by: number | null;
  ip_address: string | null;
  user_agent: string | null;
}

/** Revalidée à chaque requête (middleware). Renvoie false si expirée ou
 * révoquée — le cookie doit alors être détruit même s'il reste valide
 * cryptographiquement. */
export function isDbSessionValid(dbSessionId: number): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT expires_at, revoked_at FROM sessions WHERE id = ?`).get(dbSessionId) as
    | { expires_at: string; revoked_at: string | null }
    | undefined;
  if (!row) return false;
  if (row.revoked_at) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  return true;
}

export function touchDbSession(dbSessionId: number): void {
  getDb().prepare(`UPDATE sessions SET last_seen_at = ? WHERE id = ?`).run(nowIso(), dbSessionId);
}

export function revokeDbSession(dbSessionId: number, revokedBy: number): void {
  getDb()
    .prepare(`UPDATE sessions SET revoked_at = ?, revoked_by = ? WHERE id = ? AND revoked_at IS NULL`)
    .run(nowIso(), revokedBy, dbSessionId);
}

/** "Déconnecter toutes les sessions de cet utilisateur" (§20). `exceptId`
 * permet "…sauf la mienne" quand l'admin se révoque lui-même. */
export function revokeAllSessionsForUser(userId: number, revokedBy: number, exceptId?: number): number {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id FROM sessions WHERE user_id = ? AND revoked_at IS NULL${exceptId ? " AND id != ?" : ""}`)
    .all(...(exceptId ? [userId, exceptId] : [userId])) as { id: number }[];
  const stmt = db.prepare(`UPDATE sessions SET revoked_at = ?, revoked_by = ? WHERE id = ?`);
  const ts = nowIso();
  for (const r of rows) stmt.run(ts, revokedBy, r.id);
  return rows.length;
}

/** Frontière multi-client (lib/tenant-scope.ts) — `restrictToUserIdsOrNull`
 * vient de scopedUserIdsForSessionsOrNull(session), jamais d'un paramètre
 * client. null = pas de restriction (administrator/auditor). */
export function listActiveSessions(
  restrictToUserIdsOrNull: number[] | null = null
): (SessionRow & { username: string; full_name: string; role: string | null })[] {
  const db = getDb();
  if (restrictToUserIdsOrNull !== null && restrictToUserIdsOrNull.length === 0) return [];
  const scopeClause = restrictToUserIdsOrNull !== null ? `AND s.user_id IN (${restrictToUserIdsOrNull.map(() => "?").join(",")})` : "";
  return db
    .prepare(
      `SELECT s.*, u.username, u.full_name,
              (SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) AS role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.revoked_at IS NULL AND s.expires_at > ?
       ${scopeClause}
       ORDER BY s.last_seen_at DESC`
    )
    .all(nowIso(), ...(restrictToUserIdsOrNull ?? [])) as unknown as (SessionRow & { username: string; full_name: string; role: string | null })[];
}

export interface ActiveSessionsFilter {
  role?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  restrictToUserIdsOrNull?: number[] | null;
}

/** Version filtrée pour /sessions (§10 — "active/auth sessions" confirmé
 * par lecture de app/(app)/sessions/page.tsx). Pas de filtre "Statut" :
 * cette liste ne contient PAR CONSTRUCTION que des sessions actives
 * (revoked_at IS NULL AND expires_at > maintenant, voir listActiveSessions
 * ci-dessus) — un filtre Statut n'aurait qu'une seule valeur possible,
 * donc rien de réel à filtrer (inventer un "Actif/Révoqué" ici afficherait
 * un contrôle qui ne fait jamais rien, l'inverse de l'objectif de cette
 * mission). Jamais de token/secret exposé — mêmes colonnes que
 * listActiveSessions, jamais session_token_hash. `dateFrom`/`dateTo`
 * filtrent sur l'ouverture (created_at), cohérent avec la colonne
 * "Ouverte" déjà affichée. */
export function listActiveSessionsFiltered(
  filter: ActiveSessionsFilter = {}
): (SessionRow & { username: string; full_name: string; role: string | null })[] {
  const db = getDb();
  const clauses: string[] = [`s.revoked_at IS NULL`, `s.expires_at > ?`];
  const params: (string | number)[] = [nowIso()];

  const restrict = filter.restrictToUserIdsOrNull;
  if (restrict !== undefined && restrict !== null) {
    if (restrict.length === 0) return [];
    clauses.push(`s.user_id IN (${restrict.map(() => "?").join(",")})`);
    params.push(...restrict);
  }
  if (filter.role) {
    clauses.push(
      `(SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) = ?`
    );
    params.push(filter.role);
  }
  if (filter.dateFrom) {
    clauses.push(`s.created_at >= ?`);
    params.push(`${filter.dateFrom}T00:00:00.000Z`);
  }
  if (filter.dateTo) {
    clauses.push(`s.created_at <= ?`);
    params.push(`${filter.dateTo}T23:59:59.999Z`);
  }
  if (filter.search) {
    clauses.push(`(LOWER(u.full_name) LIKE ? OR LOWER(u.username) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle);
  }

  return db
    .prepare(
      `SELECT s.*, u.username, u.full_name,
              (SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) AS role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY s.last_seen_at DESC`
    )
    .all(...params) as unknown as (SessionRow & { username: string; full_name: string; role: string | null })[];
}

export function listSessionsForUser(userId: number): SessionRow[] {
  return getDb()
    .prepare(`SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId) as unknown as SessionRow[];
}
