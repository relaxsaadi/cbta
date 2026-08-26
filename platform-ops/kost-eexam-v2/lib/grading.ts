import { getDb, nowIso } from "./db";
import { audit } from "./audit";

// SOURCE UNIQUE DE VÉRITÉ (§10 de la mission). Aucune autre page/fonction
// du projet ne doit calculer un score autrement qu'en lisant la table
// `results` écrite ici. gradeAttempt() est appelée UNE fois par tentative
// (à la soumission, manuelle ou automatique) — jamais recalculée après.
export interface GradeResult {
  rawScore: number;
  maxRawScore: number;
  score100: number;
  percentage: number;
  passThresholdPct: number;
  passed: boolean;
}

function answerSetsEqual(a: unknown, b: unknown): boolean {
  const arrA = Array.isArray(a) ? a.map(String).sort() : [];
  const arrB = Array.isArray(b) ? b.map(String).sort() : [];
  return arrA.length === arrB.length && arrA.every((v, i) => v === arrB[i]);
}

export function gradeAttempt(attemptId: number): GradeResult {
  const db = getDb();

  const attempt = db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attemptId) as
    | { id: number; assessment_id: number; candidate_user_id: number }
    | undefined;
  if (!attempt) throw new Error(`Tentative ${attemptId} introuvable.`);

  const assessment = db.prepare(`SELECT pass_threshold_pct FROM assessments WHERE id = ?`).get(attempt.assessment_id) as
    | { pass_threshold_pct: number }
    | undefined;
  if (!assessment) throw new Error(`Évaluation introuvable pour la tentative ${attemptId}.`);

  const rows = db
    .prepare(
      `SELECT aq.id AS attempt_question_id, s.correct_answer_snapshot, s.points, aa.answer_json
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as { attempt_question_id: number; correct_answer_snapshot: string; points: number; answer_json: string | null }[];

  let rawScore = 0;
  let maxRawScore = 0;

  const upsertAnswer = db.prepare(
    `INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, is_correct, points_awarded)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(attempt_question_id) DO UPDATE SET is_correct = excluded.is_correct, points_awarded = excluded.points_awarded`
  );

  for (const row of rows) {
    maxRawScore += row.points;
    const correct = JSON.parse(row.correct_answer_snapshot);
    const given = row.answer_json ? JSON.parse(row.answer_json) : [];
    // Non répondue = incorrecte, 0 point — jamais une exception silencieuse.
    const isCorrect = row.answer_json !== null && answerSetsEqual(given, correct);
    const pointsAwarded = isCorrect ? row.points : 0;
    rawScore += pointsAwarded;
    upsertAnswer.run(attemptId, row.attempt_question_id, row.answer_json, isCorrect ? 1 : 0, pointsAwarded);
  }

  const score100 = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 10000) / 100 : 0;
  const percentage = score100; // note /100 = pourcentage ici (maxRawScore normalisé) — un seul calcul, jamais deux.
  const passed = percentage >= assessment.pass_threshold_pct;

  const assessmentType = (db.prepare(`SELECT type FROM assessments WHERE id = ?`).get(attempt.assessment_id) as { type: string }).type;

  db.prepare(
    `INSERT INTO results (attempt_id, raw_score, max_raw_score, score_100, percentage, pass_threshold_pct, passed, graded_at, locked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(attempt_id) DO UPDATE SET
       raw_score = excluded.raw_score, max_raw_score = excluded.max_raw_score, score_100 = excluded.score_100,
       percentage = excluded.percentage, passed = excluded.passed, graded_at = excluded.graded_at`
  ).run(attemptId, rawScore, maxRawScore, score100, percentage, assessment.pass_threshold_pct, passed ? 1 : 0, nowIso(), assessmentType === "examen" ? 1 : 0);

  audit({
    actorUserId: attempt.candidate_user_id,
    actorRole: "candidate",
    action: "attempt_graded",
    targetType: "attempt",
    targetId: attemptId,
    metadata: { score100, passed },
  });

  return { rawScore, maxRawScore, score100, percentage, passThresholdPct: assessment.pass_threshold_pct, passed };
}
