// Fonctions DGR affectées à un CANDIDAT (mission "COMPLETE USER
// MANAGEMENT", 2026-08-29, §26) — voir la table `user_functions` dans
// lib/schema.sql pour la justification complète : distincte de
// `assessments.function_code` (propriété d'un EXAMEN, jamais modifiée après
// publication), ce module est purement déclaratif côté dossier candidat et
// ne touche JAMAIS un examen publié ou ses snapshots. Plusieurs fonctions
// par candidat sont explicitement supportées (clé composite).
import { getDb, nowIso } from "./db";

export interface UserFunctionRow {
  function_code: string;
  label: string;
  assigned_at: string;
  assigned_by: number | null;
  assigned_by_name: string | null;
}

/**
 * Vérification d'idempotence fail-closed pour `user_functions`.
 *
 * Un `INSERT OR IGNORE` à zéro changement n'est un succès idempotent que si
 * la relation exacte existe réellement ET que son propriétaire possède
 * toujours exactement un rôle persistant, `candidate`. Vérifier seulement le
 * rôle après le no-op permettrait sinon un faux succès si l'identité passait
 * de staff à candidate entre l'INSERT refusé et la vérification applicative.
 */
function hasExistingUnambiguousCandidateFunction(userId: number, functionCode: string): boolean {
  return Boolean(
    getDb()
      .prepare(
        `SELECT 1
         FROM user_functions uf
         WHERE uf.user_id = ? AND uf.function_code = ?
           AND EXISTS (
             SELECT 1
             FROM user_roles ur
             JOIN roles r ON r.id = ur.role_id
             WHERE ur.user_id = uf.user_id AND r.code = 'candidate'
               AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = ur.user_id) = 1
           )`
      )
      .get(userId, functionCode)
  );
}

/**
 * Lecture opérationnelle fail-closed : une ancienne relation conservée pour
 * une identité qui n'est plus un candidat non ambigu reste physiquement en
 * base et est signalée par `role-integrity:check`, mais n'est plus projetée
 * comme fonction DGR courante du compte.
 */
export function listUserFunctions(userId: number): UserFunctionRow[] {
  return getDb()
    .prepare(
      `SELECT uf.function_code, f.label, uf.assigned_at, uf.assigned_by, u.full_name AS assigned_by_name
       FROM user_functions uf
       JOIN functions f ON f.code = uf.function_code
       LEFT JOIN users u ON u.id = uf.assigned_by
       WHERE uf.user_id = ?
         AND EXISTS (
           SELECT 1
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id
           WHERE ur.user_id = uf.user_id AND r.code = 'candidate'
             AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = ur.user_id) = 1
         )
       ORDER BY uf.function_code`
    )
    .all(userId) as unknown as UserFunctionRow[];
}

/**
 * Idempotent pour un candidat valide — affecter une fonction déjà affectée
 * ne fait rien de plus. Le prédicat de rôle et l'INSERT sont volontairement
 * réunis dans UNE instruction SQLite : une cible staff/roleless/ambiguë ne
 * peut jamais recevoir une nouvelle relation `user_functions` entre un check
 * applicatif et l'écriture. Les anciennes lignes contradictoires ne sont ni
 * supprimées ni réécrites ici.
 */
export function assignFunctionToUser(userId: number, functionCode: string, assignedBy: number): { changed: boolean } {
  const result = getDb()
    .prepare(
      `INSERT OR IGNORE INTO user_functions (user_id, function_code, assigned_at, assigned_by)
       SELECT ?, ?, ?, ?
       WHERE EXISTS (
         SELECT 1
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = ? AND r.code = 'candidate'
           AND (SELECT COUNT(*) FROM user_roles urc WHERE urc.user_id = ur.user_id) = 1
       )`
    )
    .run(userId, functionCode, nowIso(), assignedBy, userId);

  if ((result.changes as number) > 0) return { changed: true };

  // `INSERT OR IGNORE` est un no-op légitime uniquement si la relation exacte
  // existe déjà pour un candidat encore valide. Ne jamais transformer un
  // échec du prédicat de rôle — ou tout autre no-op sans relation persistée —
  // en faux succès/idempotence.
  if (!hasExistingUnambiguousCandidateFunction(userId, functionCode)) {
    throw new Error("Affectation de fonction DGR refusée ou non confirmée pour ce candidat.");
  }
  return { changed: false };
}

/** Retrait — ne touche jamais assessment_question_snapshots/attempts/
 * results d'un examen déjà passé sous cette fonction (voir le commentaire
 * sur la table dans lib/schema.sql) : uniquement la relation déclarative
 * "ce candidat est actuellement habilité/en cours d'habilitation pour
 * cette fonction". Le retrait reste une action administrative explicite ;
 * il n'est jamais exécuté automatiquement par l'inventaire d'intégrité. */
export function removeFunctionFromUser(userId: number, functionCode: string): { changed: boolean } {
  const result = getDb().prepare(`DELETE FROM user_functions WHERE user_id = ? AND function_code = ?`).run(userId, functionCode);
  return { changed: (result.changes as number) > 0 };
}
