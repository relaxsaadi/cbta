import { getDb } from "./db";
import type { Scope } from "./scope";

export interface ResultsFilter {
  companyId?: number;
  groupId?: number;
  functionCode?: string;
  assessmentId?: number;
  candidateUserId?: number;
  passed?: boolean;
  /** Addendum §7 — filtre par date (jour de début de tentative,
   * format "YYYY-MM-DD", bornes inclusives). */
  dateFrom?: string;
  dateTo?: string;
  scopes?: Scope[];
  /** Frontière multi-client (lib/tenant-scope.ts) — calculée côté serveur
   * à partir de la session, JAMAIS depuis un paramètre fourni par le
   * client (contrairement à companyId/groupId ci-dessus, qui restent des
   * filtres d'AFFICHAGE). Un responsable pédagogique qui passe
   * ?companyId=<autre client> dans l'URL ou l'appel API ne doit voir
   * rien de plus que sa propre restriction — les deux clauses
   * s'appliquent en ET, pas en OU. */
  restrictToGroupIds?: number[];
  /** §24 de la mission "COMPLETE CANDIDATE EXAM LIFECYCLE" — la vue
   * candidat "Mes résultats" ne doit JAMAIS lister une tentative encore
   * IN_PROGRESS comme si elle attendait une notation (elle n'a même pas
   * encore été envoyée) ; /mes-examens montre déjà "Reprendre" pour ce
   * cas. Faux par défaut — préserve le comportement existant des vues
   * admin/staff (monitoring d'une tentative en cours, §22, reste légitime
   * là-bas). */
  excludeInProgress?: boolean;
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
  /** NULL tant que la tentative n'a pas encore été notée (jamais un 0
   * fabriqué — bug réel corrigé par la mission "COMPLETE CANDIDATE EXAM
   * LIFECYCLE" 2026-08-29, §20-25 : une tentative IN_PROGRESS affichait
   * "Bonnes réponses : 0" comme si c'était une vraie mesure). L'existence
   * d'une ligne `results` (r.attempt_id IS NOT NULL) est le signal
   * d'autorité — jamais une simple absence de lignes attempt_answers
   * correspondantes, qui est indiscernable d'un vrai zéro. */
  correct_count: number | null;
  incorrect_count: number | null;
  score_100: number | null;
  percentage: number | null;
  pass_threshold_pct: number | null;
  passed: number | null;
  grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW" | null;
  scope: Scope;
}

const BASE_QUERY = `
  SELECT
    at.id AS attempt_id, at.candidate_user_id, u.full_name AS candidate_name,
    c.name AS company_name, g.name AS group_name, a.function_code, a.name AS assessment_name, a.type AS assessment_type,
    at.started_at, at.submitted_at, at.status,
    (SELECT COUNT(*) FROM attempt_questions WHERE attempt_id = at.id) AS question_count,
    CASE WHEN r.attempt_id IS NOT NULL THEN
      (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 1)
    ELSE NULL END AS correct_count,
    CASE WHEN r.attempt_id IS NOT NULL THEN
      (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 0)
    ELSE NULL END AS incorrect_count,
    r.score_100, r.percentage, r.pass_threshold_pct, r.passed, r.grading_state,
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
  if (filter.excludeInProgress) {
    clauses.push(`at.status != 'in_progress'`);
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
  if (filter.dateFrom) {
    clauses.push("at.started_at >= ?");
    params.push(`${filter.dateFrom}T00:00:00.000Z`);
  }
  if (filter.dateTo) {
    clauses.push("at.started_at <= ?");
    params.push(`${filter.dateTo}T23:59:59.999Z`);
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

export interface CandidateOption {
  id: number;
  full_name: string;
  company_name: string;
  group_name: string;
}

/** Addendum §7 — options du filtre "candidat" sur l'écran/export
 * résultats, scopées au même périmètre que le reste (restrictToGroupIdsOrNull
 * null = illimité, [] = aucun groupe géré, sinon la liste des groupes
 * autorisés — voir lib/tenant-scope.ts scopedGroupIdsOrNull). */
export function listCandidateOptions(restrictToGroupIdsOrNull: number[] | null = null): CandidateOption[] {
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length === 0) return [];
  const clauses: string[] = [];
  const params: number[] = [];
  if (restrictToGroupIdsOrNull && restrictToGroupIdsOrNull.length > 0) {
    clauses.push(`g.id IN (${restrictToGroupIdsOrNull.map(() => "?").join(",")})`);
    params.push(...restrictToGroupIdsOrNull);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(
      `SELECT DISTINCT u.id, u.full_name, c.name AS company_name, g.name AS group_name
       FROM group_members gm
       JOIN users u ON u.id = gm.candidate_user_id
       JOIN groups g ON g.id = gm.group_id
       JOIN companies c ON c.id = g.company_id
       ${where}
       ORDER BY u.full_name`
    )
    .all(...params) as unknown as CandidateOption[];
}

export interface AttemptDetailQuestion {
  position: number;
  stem: string;
  qtype: string;
  choices: { key: string; text: string }[];
  candidateAnswer: string[];
  /** Tableau de clés pour mcq_single/mcq_multi/true_false ; objet
   * NumericAnswerSpec/ShortAnswerSpec (voir lib/questions.ts) pour
   * numeric/short_answer — typé large ici, la page l'interprète selon
   * `qtype`, jamais en devinant une forme. */
  correctAnswer: unknown;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  points: number;
  gradedBy: number | null;
  graderComment: string | null;
  /** Snapshotée à la publication (jamais relue depuis la question source
   * après coup) — addendum §3 « explication/correction si autorisée » ;
   * n'afficher que si showCorrectAnswers est vrai (même politique que la
   * réponse correcte elle-même). */
  explanation: string | null;
}

export interface AttemptDetail {
  attempt_id: number;
  candidate_name: string;
  candidate_username: string;
  company_name: string;
  group_name: string;
  function_code: string;
  assessment_name: string;
  assessment_type: string;
  attempt_number: number;
  duration_minutes_allowed: number;
  started_at: string;
  submitted_at: string | null;
  status: string;
  question_count: number;
  /** NULL tant que non noté — voir le même commentaire sur ResultsRow ci-dessus. */
  correct_count: number | null;
  incorrect_count: number | null;
  score_100: number | null;
  percentage: number | null;
  pass_threshold_pct: number | null;
  passed: number | null;
  grading_state: "COMPLETE" | "AWAITING_MANUAL_REVIEW" | null;
  showCorrectAnswers: boolean;
  questions: AttemptDetailQuestion[];
}

/** §13 de la mission (et addendum auditeur §3, champ par champ : identité,
 * tentative, résultat, question par question) — le drill-down complet,
 * montrant la version EXACTE reçue par ce candidat (via le snapshot figé). */
export function getAttemptDetail(attemptId: number): AttemptDetail | undefined {
  const db = getDb();
  const header = db
    .prepare(
      `SELECT at.id AS attempt_id, u.full_name AS candidate_name, u.username AS candidate_username,
              c.name AS company_name, g.name AS group_name, a.function_code,
              a.name AS assessment_name, a.type AS assessment_type, at.attempt_number,
              a.duration_minutes AS duration_minutes_allowed,
              at.started_at, at.submitted_at, at.status,
              (SELECT COUNT(*) FROM attempt_questions WHERE attempt_id = at.id) AS question_count,
              CASE WHEN r.attempt_id IS NOT NULL THEN
                (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 1)
              ELSE NULL END AS correct_count,
              CASE WHEN r.attempt_id IS NOT NULL THEN
                (SELECT COUNT(*) FROM attempt_answers aa JOIN attempt_questions aq ON aq.id = aa.attempt_question_id WHERE aq.attempt_id = at.id AND aa.is_correct = 0)
              ELSE NULL END AS incorrect_count,
              r.score_100, r.percentage, r.pass_threshold_pct, r.passed, r.grading_state, a.show_correct_answers
       FROM attempts at
       JOIN users u ON u.id = at.candidate_user_id
       JOIN assessments a ON a.id = at.assessment_id
       JOIN groups g ON g.id = a.group_id
       JOIN companies c ON c.id = g.company_id
       LEFT JOIN results r ON r.attempt_id = at.id
       WHERE at.id = ?`
    )
    .get(attemptId) as
    | (Omit<AttemptDetail, "questions" | "showCorrectAnswers"> & { show_correct_answers: number })
    | undefined;
  if (!header) return undefined;

  const rows = db
    .prepare(
      `SELECT aq.position, s.stem_snapshot, s.choices_snapshot_json, s.correct_answer_snapshot, s.explanation_snapshot, s.points, q.qtype,
              aa.answer_json, aa.is_correct, aa.points_awarded, aa.graded_by, aa.grader_comment
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as {
    position: number;
    stem_snapshot: string;
    choices_snapshot_json: string;
    correct_answer_snapshot: string;
    explanation_snapshot: string | null;
    points: number;
    qtype: string;
    answer_json: string | null;
    is_correct: number | null;
    points_awarded: number | null;
    graded_by: number | null;
    grader_comment: string | null;
  }[];

  const showCorrectAnswers = header.show_correct_answers === 1;
  return {
    ...header,
    showCorrectAnswers,
    questions: rows.map((r) => ({
      position: r.position,
      stem: r.stem_snapshot,
      qtype: r.qtype,
      choices: JSON.parse(r.choices_snapshot_json),
      candidateAnswer: r.answer_json ? JSON.parse(r.answer_json) : [],
      correctAnswer: JSON.parse(r.correct_answer_snapshot),
      isCorrect: r.is_correct === null ? null : r.is_correct === 1,
      pointsAwarded: r.points_awarded,
      points: r.points,
      gradedBy: r.graded_by,
      graderComment: r.grader_comment,
      explanation: showCorrectAnswers ? r.explanation_snapshot : null,
    })),
  };
}
