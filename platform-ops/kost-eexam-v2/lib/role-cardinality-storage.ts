import { transaction } from "./db";

export type PersistedRoleCardinalityCategory =
  | "missing_role"
  | "multiple_roles"
  | "noncanonical_role";

export interface PersistedRoleCardinalityConflict {
  user_id: number;
  category: PersistedRoleCardinalityCategory;
  role_count: number;
}

interface PersistedRoleCardinalityRow {
  user_id: number;
  role_count: number;
  canonical_role_count: number;
}

/**
 * Production schema-boundary enforcement for the mutually-exclusive console
 * role model (#245).
 *
 * The historical schema intentionally permitted `(user_id, role_id)` pairs,
 * so a database can already contain contradictory role evidence. Never pick a
 * role, delete a row, or rewrite history automatically. Instead, take an
 * IMMEDIATE write lock, inventory only numeric ids/counts, fail closed if the
 * database is not already clean, and only then install the unique user_id
 * index atomically.
 *
 * Missing/non-canonical roles are also deployment blockers even though a
 * UNIQUE index alone cannot manufacture the required row. Normal application
 * provisioning creates the user and its role in one transaction; the
 * readiness inventory remains the backstop for manual/historical corruption.
 */
export function enforceSinglePersistedRolePerUser(): void {
  transaction((db) => {
    const rows = db
      .prepare(
        `SELECT
           u.id AS user_id,
           COUNT(ur.role_id) AS role_count,
           SUM(CASE WHEN r.code IN ('candidate','pedagogical_manager','administrator','auditor') THEN 1 ELSE 0 END) AS canonical_role_count
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
         GROUP BY u.id
         HAVING COUNT(ur.role_id) <> 1
            OR SUM(CASE WHEN r.code IN ('candidate','pedagogical_manager','administrator','auditor') THEN 1 ELSE 0 END) <> 1
         ORDER BY u.id`
      )
      .all() as unknown as PersistedRoleCardinalityRow[];

    if (rows.length > 0) {
      const conflicts: PersistedRoleCardinalityConflict[] = rows.map((row) => ({
        user_id: row.user_id,
        role_count: row.role_count,
        category:
          row.role_count === 0
            ? "missing_role"
            : row.role_count > 1
              ? "multiple_roles"
              : "noncanonical_role",
      }));
      const summary = conflicts
        .map((item) => `user_id=${item.user_id},category=${item.category},role_count=${item.role_count}`)
        .join("; ");
      throw new Error(
        `Migration bloquée : intégrité des rôles persistés invalide (${summary}). ` +
          "Aucune ligne user_roles n'a été supprimée, choisie ou réécrite automatiquement. " +
          "Corriger explicitement l'inventaire role-integrity avant de relancer la migration."
      );
    }

    // PRIMARY KEY(user_id, role_id) interdit seulement le doublon exact ;
    // cet index rend structurellement impossible un second rôle différent
    // pour le même utilisateur. IF NOT EXISTS garde la migration idempotente.
    db.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS uq_user_roles_single_role_per_user
       ON user_roles(user_id)`
    );
  });
}
