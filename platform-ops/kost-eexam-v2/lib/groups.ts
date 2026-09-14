import { getDb } from "./db";
import type { Scope } from "./scope";

export interface GroupRow {
  id: number;
  company_id: number;
  name: string;
  session_label: string | null;
  date_start: string | null;
  date_end: string | null;
  pedagogical_manager_id: number | null;
  status: "active" | "closed";
  scope: Scope;
  created_at: string;
  created_by: number | null;
}

export function listGroups(scopes?: Scope[]): (GroupRow & { company_name: string; member_count: number })[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: string[] = [];
  if (scopes && scopes.length > 0) {
    clauses.push(`g.scope IN (${scopes.map(() => "?").join(",")})`);
    params.push(...scopes);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT g.*, c.name AS company_name,
              (SELECT COUNT(*)
               FROM group_members gm
               JOIN user_roles ur ON ur.user_id = gm.candidate_user_id
               JOIN roles r ON r.id = ur.role_id AND r.code = 'candidate'
               WHERE gm.group_id = g.id
                 AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = gm.candidate_user_id) = 1) AS member_count
       FROM groups g JOIN companies c ON c.id = g.company_id
       ${where}
       ORDER BY g.created_at DESC`
    )
    .all(...params) as unknown as (GroupRow & { company_name: string; member_count: number })[];
}

export function getGroup(id: number): (GroupRow & { company_name: string }) | undefined {
  return getDb()
    .prepare(`SELECT g.*, c.name AS company_name FROM groups g JOIN companies c ON c.id = g.company_id WHERE g.id = ?`)
    .get(id) as (GroupRow & { company_name: string }) | undefined;
}

/** Frontière multi-client (voir lib/tenant-scope.ts) — uniquement les
 * groupes que ce responsable gère (pedagogical_manager_id = son id). */
export function listGroupsForManager(userId: number): (GroupRow & { company_name: string; member_count: number })[] {
  return getDb()
    .prepare(
      `SELECT g.*, c.name AS company_name,
              (SELECT COUNT(*)
               FROM group_members gm
               JOIN user_roles ur ON ur.user_id = gm.candidate_user_id
               JOIN roles r ON r.id = ur.role_id AND r.code = 'candidate'
               WHERE gm.group_id = g.id
                 AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = gm.candidate_user_id) = 1) AS member_count
       FROM groups g JOIN companies c ON c.id = g.company_id
       WHERE g.pedagogical_manager_id = ?
       ORDER BY g.created_at DESC`
    )
    .all(userId) as unknown as (GroupRow & { company_name: string; member_count: number })[];
}

export interface GroupsFilter {
  companyId?: number;
  /** companies.client_type — 'entreprise' | 'particulier'. */
  clientType?: string;
  status?: "active" | "closed";
  /** Aucune colonne function_code directe sur `groups` — relation réelle
   * mais INDIRECTE via les examens du groupe (assessments.group_id +
   * .function_code). "Function DGR where group/function relationship
   * exists" (mission "COMPLETE MISSING FILTERS", 2026-08-30 §6) : ce
   * EXISTS reflète cette relation réelle, n'invente rien. */
  functionCode?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  /** Frontière multi-client — vient de la session serveur (jamais d'un
   * paramètre client), même garde que listGroupsForManager(). */
  restrictToManagerId?: number;
}

/** Version filtrée/à plat pour /groups (§6) — s'ajoute à listGroups() et
 * listGroupsForManager() ci-dessus, ne les remplace pas (utilisées ailleurs
 * telles quelles pour peupler des <select> de formulaire, jamais touchées
 * ici pour éviter toute régression sur ces usages existants). Toutes les
 * clauses sont ET, même discipline que lib/results.ts::listResults. */
export function listGroupsFiltered(filter: GroupsFilter = {}): (GroupRow & { company_name: string; member_count: number })[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.restrictToManagerId !== undefined) {
    clauses.push(`g.pedagogical_manager_id = ?`);
    params.push(filter.restrictToManagerId);
  }
  if (filter.companyId) {
    clauses.push(`g.company_id = ?`);
    params.push(filter.companyId);
  }
  if (filter.clientType) {
    clauses.push(`c.client_type = ?`);
    params.push(filter.clientType);
  }
  if (filter.status) {
    clauses.push(`g.status = ?`);
    params.push(filter.status);
  }
  if (filter.functionCode) {
    clauses.push(`EXISTS (SELECT 1 FROM assessments a WHERE a.group_id = g.id AND a.function_code = ?)`);
    params.push(filter.functionCode);
  }
  if (filter.dateFrom) {
    clauses.push(`g.date_start >= ?`);
    params.push(filter.dateFrom);
  }
  if (filter.dateTo) {
    clauses.push(`g.date_start <= ?`);
    params.push(filter.dateTo);
  }
  if (filter.search) {
    clauses.push(`(LOWER(g.name) LIKE ? OR LOWER(c.name) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT g.*, c.name AS company_name,
              (SELECT COUNT(*)
               FROM group_members gm
               JOIN user_roles ur ON ur.user_id = gm.candidate_user_id
               JOIN roles r ON r.id = ur.role_id AND r.code = 'candidate'
               WHERE gm.group_id = g.id
                 AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = gm.candidate_user_id) = 1) AS member_count
       FROM groups g JOIN companies c ON c.id = g.company_id
       ${where}
       ORDER BY g.created_at DESC`
    )
    .all(...params) as unknown as (GroupRow & { company_name: string; member_count: number })[];
}

export function createGroup(params: {
  companyId: number;
  name: string;
  sessionLabel?: string;
  dateStart?: string;
  dateEnd?: string;
  pedagogicalManagerId?: number;
  scope: Scope;
  createdBy: number;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO groups (company_id, name, session_label, date_start, date_end, pedagogical_manager_id, scope, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.companyId,
      params.name,
      params.sessionLabel ?? null,
      params.dateStart ?? null,
      params.dateEnd ?? null,
      params.pedagogicalManagerId ?? null,
      params.scope,
      params.createdBy
    );
  return Number(result.lastInsertRowid);
}

export interface GroupMemberRow {
  candidate_user_id: number;
  full_name: string;
  username: string;
  added_at: string;
}

/**
 * Roster candidat fail-closed : `group_members` est une relation de
 * candidats, pas une relation staff→groupe. Les lignes historiques
 * incohérentes restent en base pour remédiation explicite mais ne sont
 * jamais réinterprétées comme des candidats par les consommateurs.
 * #245 : la présence d'un rôle candidate ne suffit pas ; l'identité doit
 * avoir exactement ce rôle et aucune ligne staff contradictoire.
 */
export function listGroupMembers(groupId: number): GroupMemberRow[] {
  return getDb()
    .prepare(
      `SELECT gm.candidate_user_id, u.full_name, u.username, gm.added_at
       FROM group_members gm
       JOIN users u ON u.id = gm.candidate_user_id
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id AND r.code = 'candidate'
       WHERE gm.group_id = ?
         AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = u.id) = 1
       ORDER BY u.full_name`
    )
    .all(groupId) as unknown as GroupMemberRow[];
}

/** Exact group + unambiguous candidate-only role predicate for server/data-boundary checks. */
export function isCandidateMemberOfGroup(groupId: number, candidateUserId: number): boolean {
  return !!getDb()
    .prepare(
      `SELECT 1
       FROM group_members gm
       JOIN user_roles ur ON ur.user_id = gm.candidate_user_id
       JOIN roles r ON r.id = ur.role_id AND r.code = 'candidate'
       WHERE gm.group_id = ? AND gm.candidate_user_id = ?
         AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = gm.candidate_user_id) = 1`
    )
    .get(groupId, candidateUserId);
}

/**
 * Authoritative write guard for candidate membership. The unique candidate-
 * role predicate and insert are one SQLite statement, so a concurrent role
 * update cannot slip between a positive role check and the membership write.
 * `INSERT OR IGNORE` keeps the historical idempotent behavior for an already-
 * member candidate.
 */
export function addCandidateToGroup(groupId: number, candidateUserId: number, addedBy: number): void {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO group_members (group_id, candidate_user_id, added_by)
       SELECT ?, ?, ?
       WHERE EXISTS (
         SELECT 1
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = ? AND r.code = 'candidate'
           AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = ur.user_id) = 1
       )`
    )
    .run(groupId, candidateUserId, addedBy, candidateUserId);

  // changes=0 is valid only for an already-present unambiguous candidate
  // membership. If the role predicate failed, or a historical poisoned row
  // already occupies the UNIQUE key, the role-aware predicate below stays
  // false and the operation fails closed without any success side effect.
  if (Number(result.changes) === 0 && !isCandidateMemberOfGroup(groupId, candidateUserId)) {
    throw new Error("Seul un compte candidat non ambigu peut être ajouté à un groupe.");
  }
}

export function removeCandidateFromGroup(groupId: number, candidateUserId: number): void {
  getDb().prepare(`DELETE FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).run(groupId, candidateUserId);
}
