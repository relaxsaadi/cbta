import { getDb } from "./db";
import type { ConsoleRole } from "./session";

/**
 * Décision d'autorisation pour une opération métier protégée.
 *
 * - `authorized` : la session DB, le compte courant et le rôle persistant
 *   sont tous cohérents et le titulaire n'est pas sous changement de mot de
 *   passe obligatoire ;
 * - `password_change_required` : la session reste valide pour la surface
 *   minimale de récupération (changement obligatoire / logout), mais elle ne
 *   peut exécuter AUCUNE opération protégée ;
 * - `invalid` : session/rôle/compte non valides pour une requête protégée.
 *
 * Issue #56 : `must_change_password` doit être une invariant d'autorisation,
 * pas un simple redirect de layout. Issue #52/#245 : le même snapshot DB
 * autoritatif contrôle aussi le statut du compte et la cardinalité/valeur du
 * rôle, afin de ne pas faire confiance à des métadonnées de cookie périmées.
 */
export type ProtectedSessionAuthorizationDecision =
  | "authorized"
  | "password_change_required"
  | "invalid";

interface ProtectedSessionAuthorizationRow {
  user_id: number;
  expires_at: string;
  revoked_at: string | null;
  status: string;
  must_change_password: number;
  role_count: number;
  role_code: ConsoleRole | null;
}

export function evaluateProtectedSessionAuthorization(
  dbSessionId: number,
  expectedUserId: number,
  expectedRole: ConsoleRole
): ProtectedSessionAuthorizationDecision {
  const row = getDb()
    .prepare(
      `SELECT s.user_id, s.expires_at, s.revoked_at,
              u.status, u.must_change_password,
              (SELECT COUNT(*) FROM user_roles ur WHERE ur.user_id = u.id) AS role_count,
              (SELECT MIN(r.code)
               FROM user_roles ur
               JOIN roles r ON r.id = ur.role_id
               WHERE ur.user_id = u.id) AS role_code
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(dbSessionId) as ProtectedSessionAuthorizationRow | undefined;

  if (!row) return "invalid";
  if (row.user_id !== expectedUserId) return "invalid";
  if (row.status !== "active") return "invalid";
  if (row.revoked_at) return "invalid";
  if (new Date(row.expires_at).getTime() < Date.now()) return "invalid";
  if (Number(row.role_count) !== 1) return "invalid";
  if (row.role_code !== expectedRole) return "invalid";

  // Important : ne pas transformer cet état en `invalid`. Le même titulaire
  // doit pouvoir conserver sa session pour terminer le changement obligatoire
  // de mot de passe et se déconnecter. Seules les opérations protégées sont
  // refusées par requireRole().
  if (Number(row.must_change_password) !== 0) return "password_change_required";

  return "authorized";
}
