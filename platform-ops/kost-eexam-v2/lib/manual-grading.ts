// Correction manuelle (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
// 2026-08-29, §55-57) — pour l'instant, uniquement les questions
// 'short_answer' authored en mode 'manual' (voir lib/questions.ts::
// ShortAnswerSpec). gradeAttempt() (lib/grading.ts) laisse volontairement
// `is_correct` à NULL pour ces réponses — ce module est le SEUL point
// d'écriture qui transforme ce NULL en une vraie décision 0/1, et le SEUL
// point qui referme ensuite `results` vers 'COMPLETE'. Ne rappelle JAMAIS
// gradeAttempt() (qui écraserait la décision humaine — voir son garde-fou
// dédié).
import { getDb, nowIso } from "./db";
import { audit } from "./audit";
import type { ConsoleRole } from "./session";

export interface PendingGradingRow {
  attempt_answer_id: number;
  attempt_question_id: number;
  attempt_id: number;
  candidate_name: string;
  company_id: number;
  company_name: string;
  group_id: number;
  group_name: string;
  assessment_name: string;
  function_code: string;
  stem: string;
  candidate_answer: string;
  points: number;
  submitted_at: string | null;
}

/** Liste des réponses en attente de correction manuelle — jamais une
 * question déjà notée automatiquement (les questions 'short_answer' mode
 * 'exact' ne passent jamais ici), jamais une tentative encore
 * 'in_progress' (rien à corriger avant l'envoi réel, §29). Frontière
 * multi-client (lib/tenant-scope.ts) : restrictToGroupIdsOrNull suit le
 * même contrat que partout ailleurs — null = illimité (administrator/
 * auditor), sinon la liste des groupes gérés par ce responsable. */
export function listPendingManualGrading(restrictToGroupIdsOrNull: number[] | null = null): PendingGradingRow[] {
  const db = getDb();
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length === 0) return [];
  const clauses: string[] = [`aa.is_correct IS NULL`, `q.qtype = 'short_answer'`, `at.status IN ('submitted','auto_submitted')`];
  const params: number[] = [];
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length > 0) {
    clauses.push(`g.id IN (${restrictToGroupIdsOrNull.map(() => "?").join(",")})`);
    params.push(...restrictToGroupIdsOrNull);
  }
  return db
    .prepare(
      `SELECT aa.id AS attempt_answer_id, aq.id AS attempt_question_id, at.id AS attempt_id,
              u.full_name AS candidate_name, c.id AS company_id, c.name AS company_name,
              g.id AS group_id, g.name AS group_name, a.name AS assessment_name, a.function_code,
              s.stem_snapshot AS stem, aa.answer_json, s.points, at.submitted_at
       FROM attempt_answers aa
       JOIN attempt_questions aq ON aq.id = aa.attempt_question_id
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       JOIN attempts at ON at.id = aa.attempt_id
       JOIN users u ON u.id = at.candidate_user_id
       JOIN assessments a ON a.id = at.assessment_id
       JOIN groups g ON g.id = a.group_id
       JOIN companies c ON c.id = g.company_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY at.submitted_at ASC`
    )
    .all(...params)
    .map((r) => {
      const row = r as Record<string, unknown>;
      const answerJson = row.answer_json as string | null;
      return {
        attempt_answer_id: row.attempt_answer_id,
        attempt_question_id: row.attempt_question_id,
        attempt_id: row.attempt_id,
        candidate_name: row.candidate_name,
        company_id: row.company_id,
        company_name: row.company_name,
        group_id: row.group_id,
        group_name: row.group_name,
        assessment_name: row.assessment_name,
        function_code: row.function_code,
        stem: row.stem,
        candidate_answer: answerJson ? (JSON.parse(answerJson)[0] ?? "") : "",
        points: row.points,
        submitted_at: row.submitted_at,
      };
    }) as unknown as PendingGradingRow[];
}

export class ManualGradingError extends Error {}

/** Statue UNE réponse — jamais un recalcul de gradeAttempt(). Réservée à
 * une tentative déjà soumise, une question réellement en mode manuel, et
 * pas déjà corrigée (jamais un second correcteur qui écrase le premier
 * sans le savoir — retourne une erreur explicite plutôt qu'un
 * écrasement silencieux). */
export function submitManualGrade(
  attemptQuestionId: number,
  isCorrect: boolean,
  graderUserId: number,
  graderRole: ConsoleRole,
  comment?: string
): { attemptId: number } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT aa.id AS attempt_answer_id, aa.is_correct, aa.attempt_id, s.points, q.qtype
       FROM attempt_answers aa
       JOIN attempt_questions aq ON aq.id = aa.attempt_question_id
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       WHERE aa.attempt_question_id = ?`
    )
    .get(attemptQuestionId) as { attempt_answer_id: number; is_correct: number | null; attempt_id: number; points: number; qtype: string } | undefined;
  if (!row) throw new ManualGradingError("Réponse introuvable.");
  if (row.qtype !== "short_answer") throw new ManualGradingError("Cette question n'est pas à correction manuelle.");
  if (row.is_correct !== null) throw new ManualGradingError("Cette réponse a déjà été corrigée.");

  const pointsAwarded = isCorrect ? row.points : 0;
  db.prepare(`UPDATE attempt_answers SET is_correct = ?, points_awarded = ?, graded_by = ?, grader_comment = ? WHERE id = ?`).run(
    isCorrect ? 1 : 0,
    pointsAwarded,
    graderUserId,
    comment ?? null,
    row.attempt_answer_id
  );

  audit({
    actorUserId: graderUserId,
    actorRole: graderRole,
    action: "answer_graded_manual",
    targetType: "attempt",
    targetId: row.attempt_id,
    metadata: { attemptQuestionId, isCorrect, pointsAwarded },
  });

  return { attemptId: row.attempt_id };
}

/** Clôture réelle si (et seulement si) plus aucune réponse de cette
 * tentative n'attend de correction — recompute rawScore/score100/
 * percentage/passed en SOMMANT attempt_answers.points_awarded déjà écrit
 * (auto ET manuel confondus), jamais en rappelant gradeAttempt(). Renvoie
 * `finalized: true` uniquement quand results bascule réellement vers
 * 'COMPLETE' — l'appelant (Server Action) déclenche RESULT_AVAILABLE
 * uniquement dans ce cas, jamais avant. */
export function finalizeManualGradingIfComplete(attemptId: number): { finalized: boolean } {
  const db = getDb();
  const stillPending = db
    .prepare(
      `SELECT 1 FROM attempt_answers aa
       JOIN attempt_questions aq ON aq.id = aa.attempt_question_id
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       WHERE aq.attempt_id = ? AND aa.is_correct IS NULL AND q.qtype = 'short_answer'`
    )
    .get(attemptId);
  if (stillPending) return { finalized: false };

  const result = db.prepare(`SELECT max_raw_score, pass_threshold_pct, grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as
    | { max_raw_score: number; pass_threshold_pct: number; grading_state: string }
    | undefined;
  if (!result) return { finalized: false };
  if (result.grading_state === "COMPLETE") return { finalized: false }; // déjà clôturé — jamais une double notification

  const sum = db.prepare(`SELECT COALESCE(SUM(points_awarded), 0) AS total FROM attempt_answers WHERE attempt_id = ?`).get(attemptId) as { total: number };
  const rawScore = sum.total;
  const score100 = result.max_raw_score > 0 ? Math.round((rawScore / result.max_raw_score) * 10000) / 100 : 0;
  const passed = score100 >= result.pass_threshold_pct;

  db.prepare(
    `UPDATE results SET raw_score = ?, score_100 = ?, percentage = ?, passed = ?, grading_state = 'COMPLETE', graded_at = ? WHERE attempt_id = ?`
  ).run(rawScore, score100, score100, passed ? 1 : 0, nowIso(), attemptId);

  audit({ actorUserId: null, actorRole: null, action: "grading_finalized", targetType: "attempt", targetId: attemptId, metadata: { score100, passed } });

  return { finalized: true };
}
