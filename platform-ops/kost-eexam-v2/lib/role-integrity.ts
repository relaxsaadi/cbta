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
