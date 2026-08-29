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

export function listUserFunctions(userId: number): UserFunctionRow[] {
  return getDb()
    .prepare(
      `SELECT uf.function_code, f.label, uf.assigned_at, uf.assigned_by, u.full_name AS assigned_by_name
       FROM user_functions uf
       JOIN functions f ON f.code = uf.function_code
       LEFT JOIN users u ON u.id = uf.assigned_by
       WHERE uf.user_id = ?
       ORDER BY uf.function_code`
    )
    .all(userId) as unknown as UserFunctionRow[];
}

/** Idempotent — affecter une fonction déjà affectée ne fait rien de plus
 * (INSERT OR IGNORE, clé composite (user_id, function_code)). Jamais un
 * doublon, jamais une erreur pour un ré-affectation involontaire. */
export function assignFunctionToUser(userId: number, functionCode: string, assignedBy: number): { changed: boolean } {
  const result = getDb()
    .prepare(`INSERT OR IGNORE INTO user_functions (user_id, function_code, assigned_at, assigned_by) VALUES (?, ?, ?, ?)`)
    .run(userId, functionCode, nowIso(), assignedBy);
  return { changed: (result.changes as number) > 0 };
}

/** Retrait — ne touche jamais assessment_question_snapshots/attempts/
 * results d'un examen déjà passé sous cette fonction (voir le commentaire
 * sur la table dans lib/schema.sql) : uniquement la relation déclarative
 * "ce candidat est actuellement habilité/en cours d'habilitation pour
 * cette fonction". */
export function removeFunctionFromUser(userId: number, functionCode: string): { changed: boolean } {
  const result = getDb().prepare(`DELETE FROM user_functions WHERE user_id = ? AND function_code = ?`).run(userId, functionCode);
  return { changed: (result.changes as number) > 0 };
}
