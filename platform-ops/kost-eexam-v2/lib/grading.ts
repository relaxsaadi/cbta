import { getDb, nowIso } from "./db";
import { audit } from "./audit";

// SOURCE UNIQUE DE VÉRITÉ (§10 de la mission originelle ; étendue par la
// mission "COMPLETE CANDIDATE EXAM LIFECYCLE" 2026-08-29 §26-30/§41-50).
// Aucune autre page/fonction du projet ne doit calculer un score autrement
// qu'en lisant la table `results` écrite ici. gradeAttempt() est appelée
// UNE seule fois par tentative, à la soumission (manuelle ou automatique) —
// jamais recalculée après. Si au moins une question exige une correction
// manuelle non encore statuée, le résultat écrit ici est PROVISOIRE
// (grading_state='AWAITING_MANUAL_REVIEW', passed=NULL — jamais un
// booléen fabriqué) ; voir lib/manual-grading.ts::
// finalizeManualGradingIfComplete() pour la clôture définitive, qui ne
// rappelle JAMAIS cette fonction (elle écraserait sinon une décision
// humaine déjà écrite dans attempt_answers).
export interface GradeResult {
  rawScore: number;
  maxRawScore: number;
  score100: number;
  percentage: number;
  passThresholdPct: number;
  passed: boolean | null;
  gradingState: "COMPLETE" | "AWAITING_MANUAL_REVIEW";
}

function answerSetsEqual(a: unknown, b: unknown): boolean {
  const arrA = Array.isArray(a) ? a.map(String).sort() : [];
  const arrB = Array.isArray(b) ? b.map(String).sort() : [];
  return arrA.length === arrB.length && arrA.every((v, i) => v === arrB[i]);
}

/** Normalisation §48 — espaces de bord retirés, minuscules, espaces
 * internes multiples réduits à un seul. Jamais de correspondance floue/IA
 * générative : uniquement cette normalisation explicite et déterministe. */
function normalizeShortAnswer(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Note UNE question selon son qtype — jamais une exception silencieuse,
 * jamais un point accordé sans correspondance explicite. Renvoie
 * `pending: true` pour une question 'short_answer' en mode 'manual' —
 * ni correcte ni incorrecte tant qu'un correcteur n'a pas statué. Mission
 * "MISSION FINALE CIBLÉE" (2026-08-30) §2/§3/§5 — `partialPoints` (optionnel)
 * porte le crédit RÉELLEMENT accordé quand il diverge du tout-ou-rien
 * `isCorrect ? maxPoints : 0` habituel : UNIQUEMENT pour 'scenario' (somme
 * des sous-questions, §5 — jamais pour matching/ordering, qui restent
 * ALL_OR_NOTHING comme demandé explicitement, §2-3). */
// Exportée — réutilisée telle quelle par lib/manual-grading.ts pour
// recalculer la contribution des sous-questions AUTO-notées d'un scénario
// au moment de la clôture manuelle (jamais une seconde implémentation
// divergente de la même logique de notation par type).
export function gradeOneQuestion(
  qtype: string,
  correctAnswerSnapshot: string,
  answerJson: string | null
): { pending: boolean; isCorrect: boolean; partialPoints?: number } {
  const given: unknown = answerJson ? JSON.parse(answerJson) : null;

  if (qtype === "numeric") {
    const spec = JSON.parse(correctAnswerSnapshot) as { value: number; tolerance: number };
    const givenValue = Array.isArray(given) && given.length > 0 ? Number(given[0]) : NaN;
    if (!Number.isFinite(givenValue)) return { pending: false, isCorrect: false };
    return { pending: false, isCorrect: Math.abs(givenValue - spec.value) <= spec.tolerance };
  }

  if (qtype === "short_answer") {
    const spec = JSON.parse(correctAnswerSnapshot) as { mode: "exact" | "manual"; acceptedAnswers?: string[] };
    if (spec.mode === "manual") return { pending: true, isCorrect: false };
    const givenText = Array.isArray(given) && given.length > 0 ? String(given[0]) : "";
    if (!givenText) return { pending: false, isCorrect: false };
    const normalizedGiven = normalizeShortAnswer(givenText);
    const isCorrect = (spec.acceptedAnswers ?? []).some((a) => normalizeShortAnswer(a) === normalizedGiven);
    return { pending: false, isCorrect };
  }

  // §2 — appariement : correspondance EXACTE et COMPLÈTE des deux côtés,
  // ALL_OR_NOTHING (jamais de crédit partiel par paire correcte, sauf
  // configuré explicitement — non implémenté cette passe). `given` est un
  // tableau "leftKey:rightKey" (voir lib/questions.ts::MatchingAnswerSpec).
  if (qtype === "matching") {
    const spec = JSON.parse(correctAnswerSnapshot) as { pairs: { left: string; right: string }[] };
    const givenPairs = Array.isArray(given) ? (given as string[]) : [];
    const givenMap = new Map(
      givenPairs.map((p) => {
        const [l, r] = String(p).split(":");
        return [l, r];
      })
    );
    const isCorrect = spec.pairs.length > 0 && givenMap.size === spec.pairs.length && spec.pairs.every((p) => givenMap.get(p.left) === p.right);
    return { pending: false, isCorrect };
  }

  // §3 — ordre/séquence : séquence COMPLÈTE exacte requise, ALL_OR_NOTHING
  // (jamais de crédit partiel par position correcte, sauf configuré
  // explicitement — non implémenté cette passe).
  if (qtype === "ordering") {
    const spec = JSON.parse(correctAnswerSnapshot) as { sequence: string[] };
    const givenSeq = Array.isArray(given) ? (given as string[]).map(String) : [];
    const isCorrect = givenSeq.length === spec.sequence.length && givenSeq.every((k, i) => k === spec.sequence[i]);
    return { pending: false, isCorrect };
  }

  // §4-5 — scénario : délègue RÉCURSIVEMENT à chaque sous-question selon
  // SON PROPRE type (mcq/numeric/short_answer/matching/ordering — jamais
  // 'scenario' imbriqué, exclu au typage ET revérifié à l'auteurage).
  // `given` est ici Record<subquestionId, string[]> (voir lib/attempts.ts::
  // saveScenarioSubanswer). Score = somme des points des sous-questions
  // correctement répondues (crédit partiel EXPLICITEMENT voulu ici, §5) ;
  // si AU MOINS UNE sous-question est en attente de correction manuelle non
  // encore statuée, le scénario ENTIER reste en attente (même sémantique
  // que le short_answer manuel autonome, appliquée au niveau du scénario).
  if (qtype === "scenario") {
    const spec = JSON.parse(correctAnswerSnapshot) as { subquestions: { id: string; qtype: string; points: number; correctAnswer: unknown }[] };
    const givenMap = (given as Record<string, string[]>) ?? {};
    let totalPoints = 0;
    let earnedPoints = 0;
    let anyPending = false;
    for (const sq of spec.subquestions) {
      totalPoints += sq.points;
      const subAnswer = givenMap[sq.id];
      const subAnswerJson = subAnswer ? JSON.stringify(subAnswer) : null;
      const subResult = gradeOneQuestion(sq.qtype, JSON.stringify(sq.correctAnswer), subAnswerJson);
      if (subResult.pending) {
        anyPending = true;
        continue; // ne contribue pas encore — voir finalizeManualGradingIfComplete (scénario) pour la clôture.
      }
      earnedPoints += subResult.partialPoints ?? (subResult.isCorrect ? sq.points : 0);
    }
    if (anyPending) return { pending: true, isCorrect: false };
    return { pending: false, isCorrect: totalPoints > 0 && earnedPoints === totalPoints, partialPoints: earnedPoints };
  }

  // mcq_single / mcq_multi / true_false — comportement d'origine, inchangé.
  const correct = JSON.parse(correctAnswerSnapshot);
  return { pending: false, isCorrect: answerJson !== null && answerSetsEqual(given, correct) };
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

  // Garde-fou défense-en-profondeur (mission "COMPLETE CANDIDATE EXAM
  // LIFECYCLE", 2026-08-29) — cette fonction ne doit JAMAIS s'exécuter une
  // deuxième fois pour la même tentative (voir le commentaire d'en-tête :
  // "UNE fois par tentative"). Sans cette garde, un ré-appel accidentel
  // (ex. double-soumission réseau retardée) écraserait silencieusement une
  // correction manuelle déjà écrite dans attempt_answers en la remettant à
  // NULL — bug réel identifié en concevant la correction manuelle, corrigé
  // avant tout déploiement. lib/attempts.ts::submitAttempt() n'appelle
  // d'ailleurs plus cette fonction que lors de la VRAIE première
  // transition (voir son propre correctif jumeau).
  const existingResult = db.prepare(`SELECT 1 FROM results WHERE attempt_id = ?`).get(attemptId);
  if (existingResult) {
    const current = db.prepare(`SELECT raw_score, max_raw_score, score_100, percentage, pass_threshold_pct, passed, grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as {
      raw_score: number;
      max_raw_score: number;
      score_100: number;
      percentage: number;
      pass_threshold_pct: number;
      passed: number | null;
      grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW";
    };
    return {
      rawScore: current.raw_score,
      maxRawScore: current.max_raw_score,
      score100: current.score_100,
      percentage: current.percentage,
      passThresholdPct: current.pass_threshold_pct,
      passed: current.passed === null ? null : current.passed === 1,
      gradingState: current.grading_state,
    };
  }

  const rows = db
    .prepare(
      `SELECT aq.id AS attempt_question_id, s.correct_answer_snapshot, s.points, aa.answer_json, q.qtype
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as { attempt_question_id: number; correct_answer_snapshot: string; points: number; answer_json: string | null; qtype: string }[];

  let rawScore = 0;
  let maxRawScore = 0;
  let hasAwaitingManualReview = false;

  const upsertGraded = db.prepare(
    `INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, is_correct, points_awarded)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(attempt_question_id) DO UPDATE SET is_correct = excluded.is_correct, points_awarded = excluded.points_awarded`
  );
  const upsertPending = db.prepare(
    `INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, is_correct, points_awarded)
     VALUES (?, ?, ?, NULL, NULL)
     ON CONFLICT(attempt_question_id) DO UPDATE SET is_correct = NULL, points_awarded = NULL`
  );

  for (const row of rows) {
    maxRawScore += row.points; // le maximum possible ne change jamais, correction en attente ou pas.
    const { pending, isCorrect, partialPoints } = gradeOneQuestion(row.qtype, row.correct_answer_snapshot, row.answer_json);
    if (pending) {
      hasAwaitingManualReview = true;
      upsertPending.run(attemptId, row.attempt_question_id, row.answer_json);
      continue; // ne contribue PAS encore à rawScore — voir finalizeManualGradingIfComplete().
    }
    // partialPoints (scenario uniquement, §5) porte le crédit RÉEL somme
    // des sous-questions ; tous les autres types restent tout-ou-rien
    // (comportement inchangé : isCorrect ? row.points : 0).
    const pointsAwarded = partialPoints !== undefined ? partialPoints : isCorrect ? row.points : 0;
    rawScore += pointsAwarded;
    upsertGraded.run(attemptId, row.attempt_question_id, row.answer_json, isCorrect ? 1 : 0, pointsAwarded);
  }

  const score100 = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 10000) / 100 : 0;
  const percentage = score100; // note /100 = pourcentage ici (maxRawScore normalisé) — un seul calcul, jamais deux.
  const gradingState: "COMPLETE" | "AWAITING_MANUAL_REVIEW" = hasAwaitingManualReview ? "AWAITING_MANUAL_REVIEW" : "COMPLETE";
  // Résultat réellement inconnu tant qu'une correction manuelle est en
  // attente — jamais un booléen fabriqué à partir d'un score partiel
  // (§26-29 de la mission). score100/percentage restent écrits (portion
  // auto-notée, utile en interne) mais AUCUNE page ne doit les présenter
  // comme finaux tant que grading_state != 'COMPLETE' — appliqué côté UI.
  const passed = hasAwaitingManualReview ? null : percentage >= assessment.pass_threshold_pct;

  const assessmentType = (db.prepare(`SELECT type FROM assessments WHERE id = ?`).get(attempt.assessment_id) as { type: string }).type;

  db.prepare(
    `INSERT INTO results (attempt_id, raw_score, max_raw_score, score_100, percentage, pass_threshold_pct, passed, grading_state, graded_at, locked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(attempt_id) DO UPDATE SET
       raw_score = excluded.raw_score, max_raw_score = excluded.max_raw_score, score_100 = excluded.score_100,
       percentage = excluded.percentage, passed = excluded.passed, grading_state = excluded.grading_state, graded_at = excluded.graded_at`
  ).run(
    attemptId,
    rawScore,
    maxRawScore,
    score100,
    percentage,
    assessment.pass_threshold_pct,
    passed === null ? null : passed ? 1 : 0,
    gradingState,
    nowIso(),
    assessmentType === "examen" ? 1 : 0
  );

  audit({
    actorUserId: attempt.candidate_user_id,
    actorRole: "candidate",
    action: "attempt_graded",
    targetType: "attempt",
    targetId: attemptId,
    metadata: { score100, passed, gradingState },
  });

  return { rawScore, maxRawScore, score100, percentage, passThresholdPct: assessment.pass_threshold_pct, passed, gradingState };
}
