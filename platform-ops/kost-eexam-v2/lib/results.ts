import { getDb } from "./db";
import type { Scope } from "./scope";

export interface ResultsFilter {
  companyId?: number;
  groupId?: number;
  functionCode?: string;
  assessmentId?: number;
  candidateUserId?: number;
  passed?: boolean;
  scopes?: Scope[];
  /** Frontière multi-client (lib/tenant-scope.ts) — calculée côté serveur
   * à partir de la session, JAMAIS depuis un paramètre fourni par le
   * client (contrairement à companyId/groupId ci-dessus, qui restent des
   * filtres d'AFFICHAGE). Un responsable pédagogique qui passe
   * ?companyId=<autre client> dans l'URL ou l'appel API ne doit voir
   * rien de plus que sa propre restriction — les deux clauses
   * s'appliquent en ET, pas en OU. */
  restrictToGroupIds?: number[];
}

export interface ResultsRow {
  attempt_id: number;
  candidate_user_id: number;
  candidate_name: string;
  company_name: string;
  group_name: string;
  function_code: string;
  assessment_name: string;
  assessment_type: string;
  started_at: string;
  submitted_at: string | null;
  status: string;
  question_count: number;
  correct_count: number;
  incorrect_count: number;
  score_100: number | null;
  percentage: number | null;
  pass_threshold_pct: number | null;
  passed: number | null;
  scope: Scope;
}

const BASE_QUERY = `
  SELECT
    at.id AS attempt_id, at.candidate_user_id, u.full_name AS candidate_name,
    c.name AS company_name, g.name AS group_name, a.function_code, a.name AS assessment_name, a.type AS assessment_type,
    at.started_at, at.submitted_at, at.status,
    (SELECT COUNT(*) FROM attempt_questions WHERE attempt_id = at.id) AS question_count,
    (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 1) AS correct_count,
    (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 0) AS incorrect_count,
    r.score_100, r.percentage, r.pass_threshold_pct, r.passed,
    a.scope
  FROM attempts at
  JOIN users u ON u.id = at.candidate_user_id
  JOIN assessments a ON a.id = at.assessment_id
  JOIN groups g ON g.id = a.group_id
  JOIN companies c ON c.id = g.company_id
  LEFT JOIN results r ON r.attempt_id = at.id
`;

export function listResults(filter: ResultsFilter = {}): ResultsRow[] {
  // Court-circuit explicite : un responsable qui ne gère AUCUN groupe ne
  // doit déclencher aucune requête "sans restriction" — un tableau vide
  // dans `IN (...)` est un piège SQL classique (syntaxe invalide, ou pire,
  // parfois silencieusement interprété comme "tout" selon le moteur). On
  // renvoie [] immédiatement plutôt que de laisser la clause se construire.
  if (filter.restrictToGroupIds && filter.restrictToGroupIds.length === 0) return [];

  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.restrictToGroupIds && filter.restrictToGroupIds.length > 0) {
    clauses.push(`g.id IN (${filter.restrictToGroupIds.map(() => "?").join(",")})`);
    params.push(...filter.restrictToGroupIds);
  }
  if (filter.companyId) {
    clauses.push("c.id = ?");
    params.push(filter.companyId);
  }
  if (filter.groupId) {
    clauses.push("g.id = ?");
    params.push(filter.groupId);
  }
  if (filter.functionCode) {
    clauses.push("a.function_code = ?");
    params.push(filter.functionCode);
  }
  if (filter.assessmentId) {
    clauses.push("a.id = ?");
    params.push(filter.assessmentId);
  }
  if (filter.candidateUserId) {
    clauses.push("at.candidate_user_id = ?");
    params.push(filter.candidateUserId);
  }
  if (filter.passed !== undefined) {
    clauses.push("r.passed = ?");
    params.push(filter.passed ? 1 : 0);
  }
  if (filter.scopes && filter.scopes.length) {
    clauses.push(`a.scope IN (${filter.scopes.map(() => "?").join(",")})`);
    params.push(...filter.scopes);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(`${BASE_QUERY} ${where} ORDER BY at.started_at DESC`)
    .all(...params) as unknown as ResultsRow[];
}

export interface AttemptDetailQuestion {
  position: number;
  stem: string;
  choices: { key: string; text: string }[];
  candidateAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  points: number;
}

export interface AttemptDetail {
  attempt_id: number;
  candidate_name: string;
  group_name: string;
  function_code: string;
  assessment_name: string;
  started_at: string;
  submitted_at: string | null;
  status: string;
  score_100: number | null;
  percentage: number | null;
  pass_threshold_pct: number | null;
  passed: number | null;
  showCorrectAnswers: boolean;
  questions: AttemptDetailQuestion[];
}

/** §13 de la mission — le drill-down complet, question par question,
 * montrant la version EXACTE reçue par ce candidat (via le snapshot figé). */
export function getAttemptDetail(attemptId: number): AttemptDetail | undefined {
  const db = getDb();
  const header = db
    .prepare(
      `SELECT at.id AS attempt_id, u.full_name AS candidate_name, g.name AS group_name, a.function_code,
              a.name AS assessment_name, at.started_at, at.submitted_at, at.status,
              r.score_100, r.percentage, r.pass_threshold_pct, r.passed, a.show_correct_answers
       FROM attempts at
       JOIN users u ON u.id = at.candidate_user_id
       JOIN assessments a ON a.id = at.assessment_id
       JOIN groups g ON g.id = a.group_id
       LEFT JOIN results r ON r.attempt_id = at.id
       WHERE at.id = ?`
    )
    .get(attemptId) as
    | (Omit<AttemptDetail, "questions" | "showCorrectAnswers"> & { show_correct_answers: number })
    | undefined;
  if (!header) return undefined;

  const rows = db
    .prepare(
      `SELECT aq.position, s.stem_snapshot, s.choices_snapshot_json, s.correct_answer_snapshot, s.points,
              aa.answer_json, aa.is_correct, aa.points_awarded
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as {
    position: number;
    stem_snapshot: string;
    choices_snapshot_json: string;
    correct_answer_snapshot: string;
    points: number;
    answer_json: string | null;
    is_correct: number | null;
    points_awarded: number | null;
  }[];

  return {
    ...header,
    showCorrectAnswers: header.show_correct_answers === 1,
    questions: rows.map((r) => ({
      position: r.position,
      stem: r.stem_snapshot,
      choices: JSON.parse(r.choices_snapshot_json),
      candidateAnswer: r.answer_json ? JSON.parse(r.answer_json) : [],
      correctAnswer: JSON.parse(r.correct_answer_snapshot),
      isCorrect: r.is_correct === null ? null : r.is_correct === 1,
      pointsAwarded: r.points_awarded,
      points: r.points,
    })),
  };
}
