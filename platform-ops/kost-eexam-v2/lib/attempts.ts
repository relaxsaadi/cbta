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
  if (existing) return existing;

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

  const assigned = getDb()
    .prepare(`SELECT 1 FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`)
    .get(assessmentId, candidateUserId);
  if (!assigned) throw new AttemptError("Vous n'êtes pas affecté à cette évaluation.");

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

export interface AttemptQuestionView {
  attempt_question_id: number;
  position: number;
  stem: string;
  choices: { key: string; text: string }[];
  marked_for_review: number;
  answer: string[] | null;
  multiSelect: boolean;
}

export function getAttemptQuestions(attemptId: number): AttemptQuestionView[] {
  const rows = getDb()
    .prepare(
      `SELECT aq.id AS attempt_question_id, aq.position, aq.choices_order_json, aq.marked_for_review,
              s.stem_snapshot, s.choices_snapshot_json,
              aa.answer_json, q.qtype
       FROM attempt_questions aq
       JOIN assessment_question_snapshots s ON s.id = aq.snapshot_id
       JOIN questions q ON q.id = s.question_id
       LEFT JOIN attempt_answers aa ON aa.attempt_question_id = aq.id
       WHERE aq.attempt_id = ?
       ORDER BY aq.position`
    )
    .all(attemptId) as {
    attempt_question_id: number;
    position: number;
    choices_order_json: string;
    marked_for_review: number;
    stem_snapshot: string;
    choices_snapshot_json: string;
    answer_json: string | null;
    qtype: string;
  }[];

  return rows.map((r) => {
    const allChoices: { key: string; text: string }[] = JSON.parse(r.choices_snapshot_json);
    const order: string[] = r.choices_order_json ? JSON.parse(r.choices_order_json) : allChoices.map((c) => c.key);
    const byKey = new Map(allChoices.map((c) => [c.key, c]));
    return {
      attempt_question_id: r.attempt_question_id,
      position: r.position,
      stem: r.stem_snapshot,
      choices: order.map((k) => byKey.get(k)!).filter(Boolean),
      marked_for_review: r.marked_for_review,
      answer: r.answer_json ? JSON.parse(r.answer_json) : null,
      multiSelect: r.qtype === "mcq_multi",
    };
  });
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

export function toggleMark(attemptId: number, candidateUserId: number, attemptQuestionId: number, marked: boolean): void {
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
  assertNotExpiredOrAutoSubmit(attempt);
  getDb().prepare(`UPDATE attempt_questions SET marked_for_review = ? WHERE id = ? AND attempt_id = ?`).run(marked ? 1 : 0, attemptQuestionId, attemptId);
}

export function submitAttempt(attemptId: number, candidateUserId: number, opts: { auto?: boolean } = {}): void {
  transaction((db) => {
    const attempt = db.prepare(`SELECT * FROM attempts WHERE id = ?`).get(attemptId) as AttemptRow | undefined;
    if (!attempt || attempt.candidate_user_id !== candidateUserId) throw new AttemptError("Tentative introuvable.");
    if (attempt.status !== "in_progress") return; // déjà soumise — idempotent, pas une erreur (double clic sur Terminer)

    const status: AttemptStatus = opts.auto ? "auto_submitted" : "submitted";
    db.prepare(`UPDATE attempts SET status = ?, submitted_at = ? WHERE id = ?`).run(status, nowIso(), attemptId);

    audit({
      actorUserId: candidateUserId,
      actorRole: "candidate",
      action: opts.auto ? "attempt_auto_submit" : "attempt_submit",
      targetType: "attempt",
      targetId: attemptId,
    });
  });

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
