import { getDb } from "./db";
import { isConsoleRole } from "./users";

export type RoleIntegrityAnomalyCategory =
  | "missing_role"
  | "multiple_roles"
  | "noncanonical_role";

export interface RoleIntegrityAnomaly {
  user_id: number;
  category: RoleIntegrityAnomalyCategory;
  role_count: number;
  role_codes: string[];
}

interface RoleEvidenceRow {
  user_id: number;
  role_code: string | null;
}

/**
 * Read-only inventory of persisted console-role contradictions (#245).
 *
 * Deliberately returns stable numeric ids + role metadata only: no username,
 * email, phone, password hash, MFA material or session token is selected or
 * exposed. The function never mutates `users`, `roles` or `user_roles` and
 * never chooses which contradictory role should survive remediation.
 */
export function listRoleIntegrityAnomalies(): RoleIntegrityAnomaly[] {
  const rows = getDb()
    .prepare(
      `SELECT u.id AS user_id, r.code AS role_code
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id
       ORDER BY u.id, r.code`
    )
    .all() as unknown as RoleEvidenceRow[];

  const evidenceByUser = new Map<number, string[]>();
  for (const row of rows) {
    const codes = evidenceByUser.get(row.user_id) ?? [];
    if (row.role_code !== null) codes.push(row.role_code);
    evidenceByUser.set(row.user_id, codes);
  }

  const anomalies: RoleIntegrityAnomaly[] = [];
  for (const [userId, rawCodes] of evidenceByUser) {
    const roleCodes = [...rawCodes].sort();
    if (roleCodes.length === 0) {
      anomalies.push({
        user_id: userId,
        category: "missing_role",
        role_count: 0,
        role_codes: [],
      });
      continue;
    }
    if (roleCodes.length !== 1) {
      anomalies.push({
        user_id: userId,
        category: "multiple_roles",
        role_count: roleCodes.length,
        role_codes: roleCodes,
      });
      continue;
    }
    if (!isConsoleRole(roleCodes[0])) {
      anomalies.push({
        user_id: userId,
        category: "noncanonical_role",
        role_count: 1,
        role_codes: roleCodes,
      });
    }
  }

  return anomalies.sort((a, b) => a.user_id - b.user_id);
}

export type CandidateRelationIntegrityRelation =
  | "group_members"
  | "assessment_assignments"
  | "familiarization_attendance"
  | "user_functions";

export type CandidateRelationIntegrityCategory =
  | "missing_role"
  | "multiple_roles"
  | "non_candidate_role";

export interface CandidateRelationIntegrityAnomaly {
  relation: CandidateRelationIntegrityRelation;
  /** Stable non-PII relation key composed only of numeric ids/domain codes. */
  record_key: string;
  user_id: number;
  category: CandidateRelationIntegrityCategory;
  role_count: number;
  role_codes: string[];
}

interface CandidateRelationEvidenceRow {
  relation: CandidateRelationIntegrityRelation;
  record_key: string;
  user_id: number;
  role_code: string | null;
}

/**
 * Read-only readiness inventory for historical candidate-only relations (#78,
 * #245).
 *
 * These relations are deliberately preserved for audit/history or explicit
 * administrative remediation even if the referenced identity later becomes
 * staff, loses its role, or gains a contradictory role. Operational readers
 * must fail closed; this inventory gives an operator a non-PII record key for
 * explicit remediation without silently deleting or rewriting evidence.
 *
 * `user_functions` is included because the module explicitly defines that
 * relation as candidate-only. Function codes such as `7.1` are domain codes,
 * not account PII.
 *
 * The canonical candidate predicate mirrors `listGroupMembers()`:
 * exactly one persisted role and that role is `candidate`.
 */
export function listCandidateRelationIntegrityAnomalies(): CandidateRelationIntegrityAnomaly[] {
  const rows = getDb()
    .prepare(
      `WITH candidate_relations AS (
         SELECT
           'group_members' AS relation,
           CAST(gm.group_id AS TEXT) || ':' || CAST(gm.candidate_user_id AS TEXT) AS record_key,
           gm.candidate_user_id AS user_id
         FROM group_members gm

         UNION ALL

         SELECT
           'assessment_assignments' AS relation,
           CAST(aa.assessment_id AS TEXT) || ':' || CAST(aa.candidate_user_id AS TEXT) AS record_key,
           aa.candidate_user_id AS user_id
         FROM assessment_assignments aa

         UNION ALL

         SELECT
           'familiarization_attendance' AS relation,
           CAST(fa.id AS TEXT) AS record_key,
           fa.candidate_user_id AS user_id
         FROM familiarization_attendance fa

         UNION ALL

         SELECT
           'user_functions' AS relation,
           CAST(uf.user_id AS TEXT) || ':' || uf.function_code AS record_key,
           uf.user_id AS user_id
         FROM user_functions uf
       )
       SELECT cr.relation, cr.record_key, cr.user_id, r.code AS role_code
       FROM candidate_relations cr
       LEFT JOIN user_roles ur ON ur.user_id = cr.user_id
       LEFT JOIN roles r ON r.id = ur.role_id
       ORDER BY cr.relation, cr.record_key, r.code`
    )
    .all() as unknown as CandidateRelationEvidenceRow[];

  const evidenceByRecord = new Map<
    string,
    { relation: CandidateRelationIntegrityRelation; record_key: string; user_id: number; role_codes: string[] }
  >();

  for (const row of rows) {
    const key = `${row.relation}|${row.record_key}|${row.user_id}`;
    const evidence = evidenceByRecord.get(key) ?? {
      relation: row.relation,
      record_key: row.record_key,
      user_id: row.user_id,
      role_codes: [],
    };
    if (row.role_code !== null) evidence.role_codes.push(row.role_code);
    evidenceByRecord.set(key, evidence);
  }

  const anomalies: CandidateRelationIntegrityAnomaly[] = [];
  for (const evidence of evidenceByRecord.values()) {
    const roleCodes = [...evidence.role_codes].sort();
    if (roleCodes.length === 1 && roleCodes[0] === "candidate") continue;

    let category: CandidateRelationIntegrityCategory;
    if (roleCodes.length === 0) category = "missing_role";
    else if (roleCodes.length > 1) category = "multiple_roles";
    else category = "non_candidate_role";

    anomalies.push({
      relation: evidence.relation,
      record_key: evidence.record_key,
      user_id: evidence.user_id,
      category,
      role_count: roleCodes.length,
      role_codes: roleCodes,
    });
  }

  return anomalies.sort((a, b) => {
    const relationOrder = a.relation.localeCompare(b.relation);
    if (relationOrder !== 0) return relationOrder;
    const keyOrder = a.record_key.localeCompare(b.record_key, undefined, { numeric: true });
    if (keyOrder !== 0) return keyOrder;
    return a.user_id - b.user_id;
  });
}
