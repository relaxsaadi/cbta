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
import { gradeOneQuestion } from "./grading";
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
  // Mission "MISSION FINALE CIBLÉE" (2026-08-30) §5 — 'scenario' ajouté ici :
  // une ligne scénario reste is_correct IS NULL tant qu'AU MOINS UNE de ses
  // sous-questions manuelles n'a pas été statuée (voir submitScenarioSubgrade
  // ci-dessous, qui ferme CETTE ligne dès que toutes le sont) — cette
  // fonction ne doit donc jamais la considérer close avant cela.
  const stillPending = db
    .prepare(
      `SELECT 1 FROM attempt_answers aa
       JOIN attempt_questions aq ON aq.id = aa.attempt_question_id
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       WHERE aq.attempt_id = ? AND aa.is_correct IS NULL AND q.qtype IN ('short_answer', 'scenario')`
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

// ============================================================================
// Mission "MISSION FINALE CIBLÉE" (2026-08-30) §5/§9-15 — correction
// manuelle des sous-questions 'short_answer' (mode 'manual') EMBARQUÉES
// dans un scénario. Section VOLONTAIREMENT distincte de
// listPendingManualGrading/submitManualGrade ci-dessus (qui restent
// réservées aux réponses courtes AUTONOMES, jamais modifiées ici) : la
// file d'attente ici est calculée en JS (parsing JSON), pas en SQL pur,
// puisque "quelles sous-questions restent en attente" dépend du contenu de
// correct_answer_snapshot/answer_json/scenario_grading_json, pas d'une
// colonne indexable.
// ============================================================================

export interface PendingScenarioSubquestionRow {
  attempt_question_id: number;
  attempt_id: number;
  subquestion_id: string;
  candidate_name: string;
  company_id: number;
  company_name: string;
  group_id: number;
  group_name: string;
  assessment_name: string;
  function_code: string;
  scenario_title: string;
  subquestion_stem: string;
  candidate_answer: string;
  points: number;
  submitted_at: string | null;
}

/** Même contrat de périmètre tenant (restrictToGroupIdsOrNull) que
 * listPendingManualGrading — null = illimité (administrator/auditor),
 * sinon la liste des groupes gérés par ce responsable. */
export function listPendingScenarioSubquestions(restrictToGroupIdsOrNull: number[] | null = null): PendingScenarioSubquestionRow[] {
  const db = getDb();
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length === 0) return [];
  const clauses: string[] = [`aa.is_correct IS NULL`, `q.qtype = 'scenario'`, `at.status IN ('submitted','auto_submitted')`];
  const params: number[] = [];
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length > 0) {
    clauses.push(`g.id IN (${restrictToGroupIdsOrNull.map(() => "?").join(",")})`);
    params.push(...restrictToGroupIdsOrNull);
  }
  const rows = db
    .prepare(
      `SELECT aq.id AS attempt_question_id, at.id AS attempt_id,
              u.full_name AS candidate_name, c.id AS company_id, c.name AS company_name,
              g.id AS group_id, g.name AS group_name, a.name AS assessment_name, a.function_code,
              s.stem_snapshot AS scenario_title, s.correct_answer_snapshot,
              aa.answer_json, aa.scenario_grading_json, at.submitted_at
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
    .all(...params) as {
    attempt_question_id: number;
    attempt_id: number;
    candidate_name: string;
    company_id: number;
    company_name: string;
    group_id: number;
    group_name: string;
    assessment_name: string;
    function_code: string;
    scenario_title: string;
    correct_answer_snapshot: string;
    answer_json: string | null;
    scenario_grading_json: string | null;
    submitted_at: string | null;
  }[];

  const out: PendingScenarioSubquestionRow[] = [];
  for (const r of rows) {
    const spec = JSON.parse(r.correct_answer_snapshot) as {
      subquestions: { id: string; qtype: string; stem: string; points: number; correctAnswer: { mode?: string } }[];
    };
    const given = (r.answer_json ? JSON.parse(r.answer_json) : {}) as Record<string, string[]>;
    const progress = (r.scenario_grading_json ? JSON.parse(r.scenario_grading_json) : {}) as Record<string, unknown>;
    for (const sq of spec.subquestions) {
      const isManual = sq.qtype === "short_answer" && sq.correctAnswer?.mode === "manual";
      if (!isManual || progress[sq.id]) continue; // pas manuel, ou déjà statuée — jamais dans la file.
      const ans = given[sq.id];
      out.push({
        attempt_question_id: r.attempt_question_id,
        attempt_id: r.attempt_id,
        subquestion_id: sq.id,
        candidate_name: r.candidate_name,
        company_id: r.company_id,
        company_name: r.company_name,
        group_id: r.group_id,
        group_name: r.group_name,
        assessment_name: r.assessment_name,
        function_code: r.function_code,
        scenario_title: r.scenario_title,
        subquestion_stem: sq.stem,
        candidate_answer: ans && ans[0] ? ans[0] : "",
        points: sq.points,
        submitted_at: r.submitted_at,
      });
    }
  }
  return out;
}

/** Statue UNE sous-question de scénario — jamais un recalcul de
 * gradeAttempt(). Écrit dans scenario_grading_json (jamais directement
 * is_correct/points_awarded de la ligne tant qu'il reste d'AUTRES
 * sous-questions manuelles en attente pour CE scénario) ; ne ferme la
 * ligne QUE quand plus aucune sous-question manuelle de ce scénario n'est
 * en attente — l'agrégat final recompute alors les sous-questions
 * auto-notées via gradeOneQuestion (jamais dupliqué, voir lib/grading.ts)
 * + les sous-questions manuelles déjà statuées via scenario_grading_json.
 * `finalized` (retour) indique si CETTE ligne scénario vient de se
 * clôturer — l'appelant doit ENSUITE appeler finalizeManualGradingIfComplete
 * (même composition que submitManualGrade ci-dessus) pour savoir si la
 * TENTATIVE entière est close (d'autres réponses en attente ailleurs sont
 * possibles). */
export function submitScenarioSubgrade(
  attemptQuestionId: number,
  subquestionId: string,
  isCorrect: boolean,
  graderUserId: number,
  graderRole: ConsoleRole,
  comment?: string
): { attemptId: number; finalized: boolean } {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT aa.id AS attempt_answer_id, aa.is_correct, aa.attempt_id, aa.answer_json, aa.scenario_grading_json, s.correct_answer_snapshot, q.qtype
       FROM attempt_answers aa
       JOIN attempt_questions aq ON aq.id = aa.attempt_question_id
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       WHERE aa.attempt_question_id = ?`
    )
    .get(attemptQuestionId) as
    | {
        attempt_answer_id: number;
        is_correct: number | null;
        attempt_id: number;
        answer_json: string | null;
        scenario_grading_json: string | null;
        correct_answer_snapshot: string;
        qtype: string;
      }
    | undefined;
  if (!row) throw new ManualGradingError("Réponse introuvable.");
  if (row.qtype !== "scenario") throw new ManualGradingError("Cette question n'est pas un scénario.");
  if (row.is_correct !== null) throw new ManualGradingError("Ce scénario a déjà été entièrement corrigé.");

  const spec = JSON.parse(row.correct_answer_snapshot) as { subquestions: { id: string; qtype: string; points: number; correctAnswer: unknown }[] };
  const sq = spec.subquestions.find((s) => s.id === subquestionId);
  if (!sq) throw new ManualGradingError("Sous-question introuvable dans ce scénario.");
  if (!(sq.qtype === "short_answer" && (sq.correctAnswer as { mode?: string })?.mode === "manual")) {
    throw new ManualGradingError("Cette sous-question n'est pas à correction manuelle.");
  }

  const progress = (row.scenario_grading_json ? JSON.parse(row.scenario_grading_json) : {}) as Record<
    string,
    { isCorrect: boolean; pointsAwarded: number; gradedBy: number; comment?: string }
  >;
  if (progress[subquestionId]) throw new ManualGradingError("Cette sous-question a déjà été corrigée.");

  const pointsAwarded = isCorrect ? sq.points : 0;
  progress[subquestionId] = { isCorrect, pointsAwarded, gradedBy: graderUserId, comment };

  audit({
    actorUserId: graderUserId,
    actorRole: graderRole,
    action: "answer_graded_manual",
    targetType: "attempt",
    targetId: row.attempt_id,
    metadata: { attemptQuestionId, subquestionId, isCorrect, pointsAwarded },
  });

  const stillPendingSubquestions = spec.subquestions.filter(
    (s) => s.qtype === "short_answer" && (s.correctAnswer as { mode?: string })?.mode === "manual" && !progress[s.id]
  );
  if (stillPendingSubquestions.length > 0) {
    db.prepare(`UPDATE attempt_answers SET scenario_grading_json = ? WHERE id = ?`).run(JSON.stringify(progress), row.attempt_answer_id);
    return { attemptId: row.attempt_id, finalized: false };
  }

  // Dernière sous-question manuelle statuée — clôture réelle de CETTE
  // ligne scénario.
  const given = (row.answer_json ? JSON.parse(row.answer_json) : {}) as Record<string, string[]>;
  let totalPoints = 0;
  let earnedPoints = 0;
  for (const s of spec.subquestions) {
    totalPoints += s.points;
    if (progress[s.id]) {
      earnedPoints += progress[s.id]!.pointsAwarded;
      continue;
    }
    const subAnswer = given[s.id];
    const subResult = gradeOneQuestion(s.qtype, JSON.stringify(s.correctAnswer), subAnswer ? JSON.stringify(subAnswer) : null);
    earnedPoints += subResult.partialPoints ?? (subResult.isCorrect ? s.points : 0);
  }
  const finalIsCorrect = totalPoints > 0 && earnedPoints === totalPoints;

  db.prepare(`UPDATE attempt_answers SET is_correct = ?, points_awarded = ?, scenario_grading_json = ? WHERE id = ?`).run(
    finalIsCorrect ? 1 : 0,
    earnedPoints,
    JSON.stringify(progress),
    row.attempt_answer_id
  );

  return { attemptId: row.attempt_id, finalized: true };
}
