import { getDb, transaction, nowIso } from "./db";
import { audit } from "./audit";
import { getAssessment, getSnapshots, isAssessmentOpenNow, type AssessmentRow } from "./assessments";
import { gradeAttempt } from "./grading";
import { isNewAttemptsBlocked } from "./platform-settings";

export type AttemptStatus = "in_progress" | "submitted" | "auto_submitted" | "abandoned";

export interface AttemptRow {
  id: number;
  assessment_id: number;
  candidate_user_id: number;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export class AttemptError extends Error {}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function getAttempt(attemptId: number): AttemptRow | undefined {
  return getDb().prepare(`SELECT * FROM attempts WHERE id = ?`).get(attemptId) as AttemptRow | undefined;
}

/** Paramètres de visibilité de l'examen associé à une tentative — utilisé
 * par "Mes résultats" pour appliquer la politique A/B/C/D du §11 de la
 * mission (note seule / +correct-incorrect / correction complète / différé). */
export function getAssessmentSettingsForAttempt(attemptId: number): {
  feedback_mode: string;
  show_result: number;
  show_correct_answers: number;
  close_at: string | null;
} | undefined {
  return getDb()
    .prepare(
      `SELECT a.feedback_mode, a.show_result, a.show_correct_answers, a.close_at
       FROM attempts at JOIN assessments a ON a.id = at.assessment_id
       WHERE at.id = ?`
    )
    .get(attemptId) as { feedback_mode: string; show_result: number; show_correct_answers: number; close_at: string | null } | undefined;
}

export function getActiveAttempt(assessmentId: number, candidateUserId: number): AttemptRow | undefined {
  return getDb()
    .prepare(`SELECT * FROM attempts WHERE assessment_id = ? AND candidate_user_id = ? AND status = 'in_progress'`)
    .get(assessmentId, candidateUserId) as AttemptRow | undefined;
}

export function countFinishedAttempts(assessmentId: number, candidateUserId: number): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM attempts WHERE assessment_id = ? AND candidate_user_id = ? AND status != 'in_progress'`)
    .get(assessmentId, candidateUserId) as { n: number };
  return row.n;
}

/** Ce candidat est-il affecté à cette évaluation (assessment_assignments) ?
 * Extrait de startAttempt() (audit "MISSION FINALE — TRANSVERSAL STAGING
 * AUDIT", 2026-08-30 §23) pour être réutilisé ailleurs (écran
 * d'instructions) SANS dupliquer la requête — une seule source de vérité
 * pour cette vérification, jamais deux implémentations qui pourraient
 * diverger. */
export function isCandidateAssignedToAssessment(assessmentId: number, candidateUserId: number): boolean {
  return Boolean(
    getDb()
      .prepare(`SELECT 1 FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`)
      .get(assessmentId, candidateUserId)
  );
}

/**
 * Démarre une tentative — ou renvoie la tentative déjà en cours si elle
 * existe (double-clic / deux onglets, §9). La garantie réelle est
 * l'index unique partiel sur `attempts` (voir lib/schema.sql) : même sous
 * accès concurrent, SQLite ne laissera jamais deux lignes 'in_progress'
 * co-exister — on rattrape ici la violation de contrainte pour renvoyer la
 * tentative existante plutôt qu'une erreur brute côté candidat.
 */
export function startAttempt(
  assessmentId: number,
  candidateUserId: number,
  meta: { ip?: string; userAgent?: string }
): AttemptRow {
  const existing = getActiveAttempt(assessmentId, candidateUserId);
  // Audit "MISSION FINALE — TRANSVERSAL STAGING AUDIT" (2026-08-30) §18 —
  // GAP réel trouvé : reprendre une tentative déjà en cours (retour
  // délibéré sur /instructions puis clic "Commencer" à nouveau) n'était
  // jusqu'ici JAMAIS journalisé — seule la toute première création
  // ('attempt_start' plus bas) l'était. Un simple rafraîchissement de la
  // page /attempt ne passe pas par startAttempt() (lecture seule, voir
  // app/(app)/exam/[assessmentId]/attempt/page.tsx) et n'est donc pas
  // concerné ici — ce point couvre spécifiquement le retour délibéré via
  // l'écran d'instructions.
  if (existing) {
    audit({ actorUserId: candidateUserId, actorRole: "candidate", action: "attempt_resume", targetType: "attempt", targetId: existing.id, ipAddress: meta.ip, metadata: { assessmentId } });
    return existing;
  }

  // Addendum §9-11 — continuité d'examen : une tentative DÉJÀ en cours
  // (retour anticipé ci-dessus) n'est JAMAIS bloquée par cette
  // vérification, qui ne s'applique qu'au démarrage d'une NOUVELLE
  // tentative — voir lib/platform-settings.ts.
  if (isNewAttemptsBlocked()) {
    throw new AttemptError("Le démarrage de nouvelles tentatives est temporairement suspendu (maintenance en cours). Les tentatives déjà commencées ne sont pas affectées.");
  }

  const assessment = getAssessment(assessmentId);
  if (!assessment) throw new AttemptError("Évaluation introuvable.");
  if (!isAssessmentOpenNow(assessment)) throw new AttemptError("Cette évaluation n'est pas ouverte actuellement.");

  if (!isCandidateAssignedToAssessment(assessmentId, candidateUserId)) throw new AttemptError("Vous n'êtes pas affecté à cette évaluation.");

  const finished = countFinishedAttempts(assessmentId, candidateUserId);
  if (assessment.attempts_allowed !== 0 && finished >= assessment.attempts_allowed) {
    throw new AttemptError(`Nombre de tentatives autorisées atteint (${assessment.attempts_allowed}).`);
  }

  const snapshots = getSnapshots(assessmentId);
  if (snapshots.length === 0) throw new AttemptError("Cette évaluation n'a pas encore été publiée correctement (aucune question figée).");

  try {
    return transaction((db) => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + assessment.duration_minutes * 60 * 1000).toISOString();
      const result = db
        .prepare(
          `INSERT INTO attempts (assessment_id, candidate_user_id, attempt_number, status, started_at, expires_at, ip_address, user_agent)
           VALUES (?, ?, ?, 'in_progress', ?, ?, ?, ?)`
        )
        .run(assessmentId, candidateUserId, finished + 1, now.toISOString(), expiresAt, meta.ip ?? null, meta.userAgent ?? null);
      const attemptId = Number(result.lastInsertRowid);

      const order = assessment.shuffle_questions ? shuffleArray(snapshots) : snapshots;
      const insertAQ = db.prepare(
        `INSERT INTO attempt_questions (attempt_id, position, snapshot_id, choices_order_json) VALUES (?, ?, ?, ?)`
      );
      order.forEach((snap, idx) => {
        const choices: { key: string }[] = JSON.parse(snap.choices_snapshot_json);
        const keys = choices.map((c) => c.key);
        const orderedKeys = assessment.shuffle_answers ? shuffleArray(keys) : keys;
        insertAQ.run(attemptId, idx + 1, snap.id, JSON.stringify(orderedKeys));
      });

      audit({ actorUserId: candidateUserId, actorRole: "candidate", action: "attempt_start", targetType: "attempt", targetId: attemptId, ipAddress: meta.ip, metadata: { assessmentId } });

      return db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attemptId) as unknown as AttemptRow;
    });
  } catch (err) {
    // Contrainte unique violée = une tentative concurrente a gagné la
    // course entre notre vérification et notre INSERT — renvoyer celle-ci,
    // jamais une deuxième ligne (§9).
    const winner = getActiveAttempt(assessmentId, candidateUserId);
    if (winner) return winner;
    throw err;
  }
}

/** Sous-question d'un scénario telle qu'exposée au CANDIDAT — jamais
 * `correctAnswer` (voir lib/questions.ts::ScenarioSubquestion, dont ce type
 * est le sous-ensemble sûr, même principe que `unit` pour 'numeric' :
 * value/tolerance/pairs/sequence/acceptedAnswers ne quittent jamais le
 * serveur avant notation). `answer` = la réponse DÉJÀ enregistrée pour
 * CETTE sous-question, si la tentative est reprise après reconnexion. */
export interface ScenarioCandidateSubquestion {
  id: string;
  qtype: string;
  stem: string;
  choices: { key: string; text: string }[];
  unit: string | null;
  multiSelect: boolean;
  answer: string[] | null;
}
export interface ScenarioCandidateView {
  context: string;
  documentRef: string | null;
  subquestions: ScenarioCandidateSubquestion[];
}

export interface AttemptQuestionView {
  attempt_question_id: number;
  position: number;
  stem: string;
  qtype: string;
  choices: { key: string; text: string }[];
  /** Uniquement pour 'numeric' — la seule partie du barème envoyée au
   * candidat (voir lib/questions.ts::NumericAnswerSpec) ; value/tolerance
   * ne quittent jamais le serveur avant notation. */
  unit: string | null;
  marked_for_review: number;
  answer: string[] | null;
  multiSelect: boolean;
  // Mission "MISSION FINALE CIBLÉE" (2026-08-30) §2/§3/§4 — toujours
  // présents dans la forme (tableau/valeur vide si non pertinent pour CE
  // type), jamais des champs conditionnellement absents : plus simple à
  // consommer côté client (ExamRunner.tsx) sans garde de type répétée.
  /** 'matching' — les DEUX côtés mélangés INDÉPENDAMMENT, sans indication
   * de correspondance (voir le commentaire de MatchingAnswerSpec pour la
   * preuve que ce mélange indépendant vient gratuitement du mécanisme
   * choices_order_json déjà existant). */
  matchingLeft: { key: string; text: string }[];
  matchingRight: { key: string; text: string }[];
  /** 'ordering' — les éléments dans leur ORDRE D'AFFICHAGE mélangé (jamais
   * l'ordre correct) ; la réponse candidate (`answer`) porte l'arrangement
   * ACTUEL du candidat, initialisé côté client à cet ordre d'affichage. */
  orderingItems: { key: string; text: string }[];
  /** 'scenario' — contexte + sous-questions candidate-safe, null pour tout
   * autre type. */
  scenario: ScenarioCandidateView | null;
}

/** Ligne source commune (snapshot + éventuel contexte de tentative) —
 * point d'entrée UNIQUE de sanitisation candidate-safe (jamais
 * `correctAnswer`/`correct_answer_snapshot` brut au-delà de cette
 * fonction). Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
 * §20-26 — extrait de getAttemptQuestions() ci-dessous pour être réutilisé
 * TEL QUEL par getPreviewQuestions() (mode aperçu admin, sans tentative
 * réelle) : jamais une 2e implémentation de ce mapping qui risquerait de
 * diverger et d'exposer une réponse correcte en mode aperçu. */
interface SnapshotSourceRow {
  attempt_question_id: number;
  position: number;
  choices_order_json: string | null;
  marked_for_review: number;
  stem_snapshot: string;
  choices_snapshot_json: string;
  correct_answer_snapshot: string;
  answer_json: string | null;
  qtype: string;
}

function mapSnapshotRowToCandidateView(r: SnapshotSourceRow): AttemptQuestionView {
  const allChoices: { key: string; text: string }[] = JSON.parse(r.choices_snapshot_json);
  const order: string[] = r.choices_order_json ? JSON.parse(r.choices_order_json) : allChoices.map((c) => c.key);
  const byKey = new Map(allChoices.map((c) => [c.key, c]));
  const isMcqLike = r.qtype === "mcq_single" || r.qtype === "mcq_multi" || r.qtype === "true_false";

  let matchingLeft: { key: string; text: string }[] = [];
  let matchingRight: { key: string; text: string }[] = [];
  if (r.qtype === "matching") {
    // Un même mélange global (choices_order_json) partitionné par
    // préfixe de clé conserve un ordre indépendant et uniforme sur
    // chaque côté — voir MatchingAnswerSpec pour la preuve.
    matchingLeft = order.filter((k) => k.startsWith("L")).map((k) => byKey.get(k)!).filter(Boolean);
    matchingRight = order.filter((k) => k.startsWith("R")).map((k) => byKey.get(k)!).filter(Boolean);
  }

  let orderingItems: { key: string; text: string }[] = [];
  if (r.qtype === "ordering") {
    orderingItems = order.map((k) => byKey.get(k)!).filter(Boolean);
  }

  let scenario: ScenarioCandidateView | null = null;
  if (r.qtype === "scenario") {
    const spec = JSON.parse(r.correct_answer_snapshot) as {
      context: string;
      documentRef?: string;
      subquestions: { id: string; qtype: string; stem: string; choices: { key: string; text: string }[] }[];
    };
    const savedAnswers = (r.answer_json ? JSON.parse(r.answer_json) : {}) as Record<string, string[]>;
    scenario = {
      context: spec.context,
      documentRef: spec.documentRef ?? null,
      subquestions: spec.subquestions.map((sq) => ({
        id: sq.id,
        qtype: sq.qtype,
        stem: sq.stem,
        choices: sq.choices,
        unit: sq.qtype === "numeric" ? (sq.choices.find((c) => c.key === "unit")?.text ?? null) : null,
        multiSelect: sq.qtype === "mcq_multi",
        answer: savedAnswers[sq.id] ?? null,
      })),
    };
  }

  return {
    attempt_question_id: r.attempt_question_id,
    position: r.position,
    stem: r.stem_snapshot,
    qtype: r.qtype,
    choices: isMcqLike ? order.map((k) => byKey.get(k)!).filter(Boolean) : [],
    unit: r.qtype === "numeric" ? (allChoices.find((c) => c.key === "unit")?.text ?? null) : null,
    marked_for_review: r.marked_for_review,
    answer: r.qtype === "scenario" ? null : r.answer_json ? JSON.parse(r.answer_json) : null,
    multiSelect: r.qtype === "mcq_multi",
    matchingLeft,
    matchingRight,
    orderingItems,
    scenario,
  };
}

export function getAttemptQuestions(attemptId: number): AttemptQuestionView[] {
  const rows = getDb()
    .prepare(
      `SELECT aq.id AS attempt_question_id, aq.position, aq.choices_order_json, aq.marked_for_review,
              s.stem_snapshot, s.choices_snapshot_json, s.correct_answer_snapshot,
              aa.answer_json, q.qtype
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as unknown as SnapshotSourceRow[];

  return rows.map(mapSnapshotRowToCandidateView);
}

/** Mode APERÇU (mission §20-26) — aucune tentative réelle n'existe encore :
 * lit directement assessment_question_snapshots (jamais attempt_questions/
 * attempt_answers, qui n'existent qu'après un vrai démarrage de tentative
 * via startAttempt()). Réutilise EXACTEMENT mapSnapshotRowToCandidateView,
 * donc la même garantie qu'aucune correctAnswer ne quitte jamais le
 * serveur avant notation. attempt_question_id est synthétique (l'id de
 * snapshot lui-même, négatif pour ne jamais collisionner avec un vrai id
 * de attempt_questions si jamais comparé par erreur) — jamais un ID réel,
 * puisqu'aucune ligne attempt_questions n'existe pour cet aperçu.
 * choices_order_json est toujours NULL ici (ordre naturel du snapshot,
 * jamais mélangé) — l'aperçu montre la STRUCTURE de la question, pas une
 * preuve d'anti-triche par mélange, hors sujet en mode aperçu. */
export function getPreviewQuestions(assessmentId: number): AttemptQuestionView[] {
  const rows = getDb()
    .prepare(
      `SELECT s.id AS snapshot_id, s.position, s.stem_snapshot, s.choices_snapshot_json, s.correct_answer_snapshot, q.qtype
       FROM assessment_question_snapshots s
       JOIN questions q ON q.id = s.question_id
       WHERE s.assessment_id = ?
       ORDER BY s.position`
    )
    .all(assessmentId) as { snapshot_id: number; position: number; stem_snapshot: string; choices_snapshot_json: string; correct_answer_snapshot: string; qtype: string }[];

  return rows.map((r) =>
    mapSnapshotRowToCandidateView({
      attempt_question_id: -r.snapshot_id,
      position: r.position,
      choices_order_json: null,
      marked_for_review: 0,
      stem_snapshot: r.stem_snapshot,
      choices_snapshot_json: r.choices_snapshot_json,
      correct_answer_snapshot: r.correct_answer_snapshot,
      answer_json: null,
      qtype: r.qtype,
    })
  );
}

/** Revérifie l'expiration côté serveur à CHAQUE appel (§8 : le timer ne
 * dépend jamais uniquement du navigateur). Si expiré, auto-soumet
 * immédiatement au lieu d'accepter l'action demandée. */
function assertNotExpiredOrAutoSubmit(attempt: AttemptRow): void {
  if (attempt.status !== "in_progress") throw new AttemptError("Cette tentative n'est plus en cours.");
  if (new Date(attempt.expires_at).getTime() < Date.now()) {
    submitAttempt(attempt.id, attempt.candidate_user_id, { auto: true });
    throw new AttemptError("Le temps imparti est écoulé — la tentative a été soumise automatiquement.");
  }
}

export function saveAnswer(attemptId: number, candidateUserId: number, attemptQuestionId: number, answerKeys: string[]): void {
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
  assertNotExpiredOrAutoSubmit(attempt);

  const owns = getDb().prepare(`SELECT 1 FROM attempt_questions WHERE id = ? AND attempt_id = ?`).get(attemptQuestionId, attemptId);
  if (!owns) throw new AttemptError("Question hors de cette tentative.");

  getDb()
    .prepare(
      `INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, answered_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(attempt_question_id) DO UPDATE SET answer_json = excluded.answer_json, answered_at = excluded.answered_at`
    )
    .run(attemptId, attemptQuestionId, JSON.stringify(answerKeys), nowIso());
}

/** Autosave POUR UNE SOUS-QUESTION de scénario (mission "MISSION FINALE
 * CIBLÉE", 2026-08-30, §9) — seul point d'écriture qui MERGE dans
 * `answer_json` (Record<subquestionId, string[]>) plutôt que de
 * l'écraser : une ligne attempt_answers = UN scénario entier, jamais une
 * ligne par sous-question (voir lib/questions.ts::ScenarioAnswerSpec pour
 * la justification complète du choix d'embarquement). Mêmes garanties que
 * saveAnswer() ci-dessus (propriété de la tentative, non-expiration). */
export function saveScenarioSubanswer(attemptId: number, candidateUserId: number, attemptQuestionId: number, subquestionId: string, answerKeys: string[]): void {
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
  assertNotExpiredOrAutoSubmit(attempt);

  const owns = getDb().prepare(`SELECT 1 FROM attempt_questions WHERE id = ? AND attempt_id = ?`).get(attemptQuestionId, attemptId);
  if (!owns) throw new AttemptError("Question hors de cette tentative.");

  const existing = getDb().prepare(`SELECT answer_json FROM attempt_answers WHERE attempt_question_id = ?`).get(attemptQuestionId) as { answer_json: string | null } | undefined;
  const merged: Record<string, string[]> = existing?.answer_json ? JSON.parse(existing.answer_json) : {};
  merged[subquestionId] = answerKeys;

  getDb()
    .prepare(
      `INSERT INTO attempt_answers (attempt_id, attempt_question_id, answer_json, answered_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(attempt_question_id) DO UPDATE SET answer_json = excluded.answer_json, answered_at = excluded.answered_at`
    )
    .run(attemptId, attemptQuestionId, JSON.stringify(merged), nowIso());
}

export function toggleMark(attemptId: number, candidateUserId: number, attemptQuestionId: number, marked: boolean): void {
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
  assertNotExpiredOrAutoSubmit(attempt);
  getDb().prepare(`UPDATE attempt_questions SET marked_for_review = ? WHERE id = ? AND attempt_id = ?`).run(marked ? 1 : 0, attemptQuestionId, attemptId);
}

export function submitAttempt(attemptId: number, candidateUserId: number, opts: { auto?: boolean } = {}): void {
  // Bug réel trouvé en concevant la correction manuelle (mission "COMPLETE
  // CANDIDATE EXAM LIFECYCLE", 2026-08-29) : gradeAttempt() était appelée
  // SANS CONDITION après la transaction ci-dessous, y compris quand la
  // transition "déjà soumise -> no-op" avait eu lieu (double-clic, retry
  // réseau retardé) — inoffensif avant la correction manuelle (renotage
  // idempotent), mais dangereux depuis : un ré-appel tardif écraserait une
  // correction manuelle déjà écrite. `transitioned` ne devient vrai QUE la
  // toute première fois — gradeAttempt() n'est donc plus jamais appelée
  // sur un no-op (défense en profondeur, doublée par la garde interne à
  // gradeAttempt() elle-même).
  let transitioned = false;
  transaction((db) => {
    const attempt = db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attemptId) as AttemptRow | undefined;
    if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
    if (attempt.status !== "in_progress") return; // déjà soumise — idempotent, pas une erreur (double clic sur Terminer)

    const status: AttemptStatus = opts.auto ? "auto_submitted" : "submitted";
    db.prepare(`UPDATE attempts SET status = ?, submitted_at = ? WHERE id = ?`).run(status, nowIso(), attemptId);
    transitioned = true;

    audit({
      actorUserId: candidateUserId,
      actorRole: "candidate",
      action: opts.auto ? "attempt_auto_submit" : "attempt_submit",
      targetType: "attempt",
      targetId: attemptId,
    });
  });

  if (!transitioned) return;

  // Notation hors de la transaction d'écriture ci-dessus (gradeAttempt gère
  // sa propre cohérence) — évite d'imbriquer deux BEGIN IMMEDIATE (SQLite
  // n'autorise pas les transactions imbriquées).
  gradeAttempt(attemptId);
}

/** Balayage périodique — auto-soumet toute tentative dont le temps est
 * dépassé même si le candidat n'a pas rouvert la page (§8 : fermeture
 * navigateur / perte réseau ne doivent jamais empêcher l'auto-soumission).
 * Appelé opportunément depuis les pages de suivi + une route dédiée
 * appelable par un cron externe en production. Renvoie la liste (pas
 * seulement le compte) — mission email §24 : la route cron
 * (app/api/attempts/sweep/route.ts) en a besoin pour déclencher
 * RESULT_AVAILABLE sur chaque tentative auto-soumise, hors de cette
 * fonction elle-même (reste synchrone, aucune dépendance email ici). */
export function sweepExpiredAttempts(): { attemptId: number; candidateUserId: number }[] {
  const rows = getDb()
    .prepare(`SELECT id, candidate_user_id FROM attempts WHERE status = 'in_progress' AND expires_at < ?`)
    .all(nowIso()) as { id: number; candidate_user_id: number }[];
  for (const r of rows) {
    submitAttempt(r.id, r.candidate_user_id, { auto: true });
  }
  return rows.map((r) => ({ attemptId: r.id, candidateUserId: r.candidate_user_id }));
}
