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
  const scopeClause = scopes && scopes.length ? `WHERE g.scope IN (${scopes.map(() => "?").join(",")})` : "";
  return db
    .prepare(
      `SELECT g.*, c.name AS company_name,
              (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
       FROM groups g JOIN companies c ON c.id = g.company_id
       ${scopeClause}
       ORDER BY g.created_at DESC`
    )
    .all(...(scopes ?? [])) as unknown as (GroupRow & { company_name: string; member_count: number })[];
}

export function getGroup(id: number): (GroupRow & { company_name: string }) | undefined {
  return getDb()
    .prepare(`SELECT g.*, c.name AS company_name FROM groups g JOIN companies c ON c.id = g.company_id WHERE g.id = ?`)
    .get(id) as (GroupRow & { company_name: string }) | undefined;
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

export function listGroupMembers(groupId: number): GroupMemberRow[] {
  return getDb()
    .prepare(
      `SELECT gm.candidate_user_id, u.full_name, u.username, gm.added_at
       FROM group_members gm JOIN users u ON u.id = gm.candidate_user_id
       WHERE gm.group_id = ? ORDER BY u.full_name`
    )
    .all(groupId) as unknown as GroupMemberRow[];
}

export function addCandidateToGroup(groupId: number, candidateUserId: number, addedBy: number): void {
  getDb()
    .prepare(`INSERT OR IGNORE INTO group_members (group_id, candidate_user_id, added_by) VALUES (?, ?, ?)`)
    .run(groupId, candidateUserId, addedBy);
}

export function removeCandidateFromGroup(groupId: number, candidateUserId: number): void {
  getDb().prepare(`DELETE FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).run(groupId, candidateUserId);
}
