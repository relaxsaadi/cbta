// Liste filtrable + fiche détaillée d'utilisateur (mission "COMPLETE USER
// MANAGEMENT", 2026-08-29, §7/§28-31/§46). Lecture seule — toutes les
// mutations restent dans lib/users.ts / lib/user-affiliation.ts /
// lib/user-functions.ts, jamais dupliquées ici.
import { getDb } from "./db";
import type { UserRow, UserStatus, CandidateType } from "./users";
import type { ConsoleRole } from "./session";

export interface UserListFilters {
  role?: ConsoleRole;
  /** undefined = tous SAUF archivé (vue par défaut, §17) ; "all" = aucun
   * filtre (y compris archivé) ; une valeur précise = uniquement cet état. */
  status?: UserStatus | "all";
  candidateType?: CandidateType;
  companyId?: number;
  groupId?: number;
  functionCode?: string;
  search?: string;
  /** Frontière multi-client (lib/tenant-scope.ts) — null = administrator/
   * auditor (pas de restriction) ; tableau = restreint à ces user_id
   * (responsable pédagogique, candidats de ses groupes uniquement). */
  userIdsOrNull: number[] | null;
}

export interface UserListRow extends UserRow {
  role_codes: string | null;
  company_id: number | null;
  company_name: string | null;
  function_codes: string | null;
}

export function listUsers(filters: UserListFilters): UserListRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (filters.userIdsOrNull !== null) {
    if (filters.userIdsOrNull.length === 0) return [];
    clauses.push(`u.id IN (${filters.userIdsOrNull.map(() => "?").join(",")})`);
    args.push(...filters.userIdsOrNull);
  }
  if (filters.status === "all") {
    // aucune clause
  } else if (filters.status) {
    clauses.push(`u.status = ?`);
    args.push(filters.status);
  } else {
    clauses.push(`u.status != 'archived'`);
  }
  if (filters.role) {
    clauses.push(`EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.code = ?)`);
    args.push(filters.role);
  }
  if (filters.candidateType) {
    clauses.push(`u.candidate_type = ?`);
    args.push(filters.candidateType);
  }
  if (filters.companyId) {
    clauses.push(`EXISTS (SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE gm.candidate_user_id = u.id AND g.company_id = ?)`);
    args.push(filters.companyId);
  }
  if (filters.groupId) {
    clauses.push(`EXISTS (SELECT 1 FROM group_members gm WHERE gm.candidate_user_id = u.id AND gm.group_id = ?)`);
    args.push(filters.groupId);
  }
  if (filters.functionCode) {
    clauses.push(`EXISTS (SELECT 1 FROM user_functions uf WHERE uf.user_id = u.id AND uf.function_code = ?)`);
    args.push(filters.functionCode);
  }
  if (filters.search) {
    clauses.push(`(LOWER(u.full_name) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(COALESCE(u.email, '')) LIKE ?)`);
    const needle = `%${filters.search.toLowerCase()}%`;
    args.push(needle, needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return db
    .prepare(
      `SELECT u.*,
              (SELECT GROUP_CONCAT(r.code) FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id) AS role_codes,
              (SELECT c.id FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id
                 WHERE gm.candidate_user_id = u.id ORDER BY gm.added_at DESC LIMIT 1) AS company_id,
              (SELECT c.name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id
                 WHERE gm.candidate_user_id = u.id ORDER BY gm.added_at DESC LIMIT 1) AS company_name,
              (SELECT GROUP_CONCAT(uf.function_code) FROM user_functions uf WHERE uf.user_id = u.id) AS function_codes
       FROM users u
       ${where}
       ORDER BY u.full_name`
    )
    .all(...args) as unknown as UserListRow[];
}

export interface ExamSummaryRow {
  assessments_assigned: number;
  attempts_completed: number;
  attempts_passed: number;
}

/** Section EXAMENS de la fiche candidat (§30) — comptages seulement, jamais
 * un recalcul de score (results reste l'unique source de vérité, voir
 * lib/grading.ts). */
export function getExamSummary(userId: number): ExamSummaryRow {
  const db = getDb();
  const assigned = (db.prepare(`SELECT COUNT(*) AS n FROM assessment_assignments WHERE candidate_user_id = ?`).get(userId) as { n: number }).n;
  const completed = (
    db.prepare(`SELECT COUNT(*) AS n FROM attempts WHERE candidate_user_id = ? AND status IN ('submitted','auto_submitted')`).get(userId) as { n: number }
  ).n;
  const passed = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM results r JOIN attempts a ON a.id = r.attempt_id WHERE a.candidate_user_id = ? AND r.passed = 1`
      )
      .get(userId) as { n: number }
  ).n;
  return { assessments_assigned: assigned, attempts_completed: completed, attempts_passed: passed };
}
