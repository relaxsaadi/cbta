import { getDb, transaction, nowIso } from "./db";
import { audit } from "./audit";
import { listAdmissibleQuestionIds, getCurrentVersion, type QuestionRow } from "./questions";
import { listGroupMembers } from "./groups";
import type { Scope } from "./scope";

export type AssessmentType = "exercice" | "test" | "examen";
export type AssessmentStatus = "draft" | "published" | "open" | "closed" | "suspended" | "archived";
export type FeedbackMode = "immediate" | "deferred" | "none";

// Presets KOST — configurables, jamais présentés comme une exigence
// universelle IATA (§6/§10 de la mission : « 80% est un paramètre KOST
// configurable »).
export const TYPE_PRESETS: Record<AssessmentType, {
  attemptsAllowed: number;
  feedbackMode: FeedbackMode;
  showResult: boolean;
  showCorrectAnswers: boolean;
}> = {
  exercice: { attemptsAllowed: 0, feedbackMode: "immediate", showResult: true, showCorrectAnswers: true },
  test: { attemptsAllowed: 2, feedbackMode: "deferred", showResult: true, showCorrectAnswers: false },
  examen: { attemptsAllowed: 1, feedbackMode: "deferred", showResult: true, showCorrectAnswers: false },
};

export interface AssessmentRow {
  id: number;
  type: AssessmentType;
  name: string;
  function_code: string;
  group_id: number;
  question_source: "random" | "manual";
  question_count: number;
  duration_minutes: number;
  pass_threshold_pct: number;
  attempts_allowed: number;
  open_at: string | null;
  close_at: string | null;
  shuffle_questions: number;
  shuffle_answers: number;
  feedback_mode: FeedbackMode;
  show_result: number;
  show_correct_answers: number;
  status: AssessmentStatus;
  scope: Scope;
  created_by: number | null;
  created_at: string;
  published_at: string | null;
}

export function listAssessments(scopes?: Scope[]): (AssessmentRow & { group_name: string; company_name: string })[] {
  const db = getDb();
  const scopeClause = scopes && scopes.length ? `WHERE a.scope IN (${scopes.map(() => "?").join(",")})` : "";
  return db
    .prepare(
      `SELECT a.*, g.name AS group_name, c.name AS company_name
       FROM assessments a
       JOIN groups g ON g.id = a.group_id
       JOIN companies c ON c.id = g.company_id
       ${scopeClause}
       ORDER BY a.created_at DESC`
    )
    .all(...(scopes ?? [])) as unknown as (AssessmentRow & { group_name: string; company_name: string })[];
}

export function getAssessment(id: number): AssessmentRow | undefined {
  return getDb().prepare(`SELECT * FROM assessments WHERE id = ?`).get(id) as AssessmentRow | undefined;
}

/** Frontière multi-client (voir lib/tenant-scope.ts) — uniquement les
 * évaluations dont le groupe est géré par ce responsable. */
export function listAssessmentsForManager(userId: number): (AssessmentRow & { group_name: string; company_name: string })[] {
  return getDb()
    .prepare(
      `SELECT a.*, g.name AS group_name, c.name AS company_name
       FROM assessments a
       JOIN groups g ON g.id = a.group_id
       JOIN companies c ON c.id = g.company_id
       WHERE g.pedagogical_manager_id = ?
       ORDER BY a.created_at DESC`
    )
    .all(userId) as unknown as (AssessmentRow & { group_name: string; company_name: string })[];
}

export function isAssessmentOpenNow(a: AssessmentRow): boolean {
  if (a.status !== "published" && a.status !== "open") return false;
  const now = Date.now();
  if (a.open_at && new Date(a.open_at).getTime() > now) return false;
  if (a.close_at && new Date(a.close_at).getTime() < now) return false;
  return true;
}

/** Étape 4-5 du formulaire de création (§5 de la mission) — le nombre
 * réellement disponible, jamais une estimation. */
export function admissibleCountFor(functionCode: string): number {
  return listAdmissibleQuestionIds(functionCode).length;
}

export interface CreateAssessmentInput {
  type: AssessmentType;
  name: string;
  functionCode: string;
  groupId: number;
  questionSource: "random" | "manual";
  questionCount: number;
  manualQuestionIds?: number[];
  durationMinutes: number;
  passThresholdPct: number;
  attemptsAllowed?: number;
  openAt?: string;
  closeAt?: string;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  feedbackMode?: FeedbackMode;
  showResult?: boolean;
  showCorrectAnswers?: boolean;
  scope: Scope;
  createdBy: number;
}

/** Création en brouillon — revalide TOUJOURS côté serveur que
 * question_count <= questions admissibles disponibles (§5, étape 5 :
 * « interdire nombre demandé > questions disponibles » — jamais seulement
 * une validation client, qui peut être contournée). */
export function createAssessmentDraft(input: CreateAssessmentInput): number {
  const preset = TYPE_PRESETS[input.type];
  const admissibleIds = listAdmissibleQuestionIds(input.functionCode);

  let poolIds: number[];
  if (input.questionSource === "manual") {
    const chosen = input.manualQuestionIds ?? [];
    const invalid = chosen.filter((id) => !admissibleIds.includes(id));
    if (invalid.length > 0) {
      throw new Error(`Question(s) non admissible(s) sélectionnée(s) (id: ${invalid.join(", ")}).`);
    }
    if (chosen.length !== input.questionCount) {
      throw new Error(`La sélection manuelle (${chosen.length}) ne correspond pas au nombre de questions demandé (${input.questionCount}).`);
    }
    poolIds = chosen;
  } else {
    if (input.questionCount > admissibleIds.length) {
      throw new Error(
        `Nombre de questions demandé (${input.questionCount}) supérieur au nombre de questions admissibles disponibles (${admissibleIds.length}).`
      );
    }
    poolIds = admissibleIds;
  }

  return transaction((db) => {
    const result = db
      .prepare(
        `INSERT INTO assessments
           (type, name, function_code, group_id, question_source, question_count, duration_minutes,
            pass_threshold_pct, attempts_allowed, open_at, close_at, shuffle_questions, shuffle_answers,
            feedback_mode, show_result, show_correct_answers, status, scope, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
      )
      .run(
        input.type,
        input.name,
        input.functionCode,
        input.groupId,
        input.questionSource,
        input.questionCount,
        input.durationMinutes,
        input.passThresholdPct,
        input.attemptsAllowed ?? preset.attemptsAllowed,
        input.openAt ?? null,
        input.closeAt ?? null,
        input.shuffleQuestions === false ? 0 : 1,
        input.shuffleAnswers === false ? 0 : 1,
        input.feedbackMode ?? preset.feedbackMode,
        (input.showResult ?? preset.showResult) ? 1 : 0,
        (input.showCorrectAnswers ?? preset.showCorrectAnswers) ? 1 : 0,
        input.scope,
        input.createdBy
      );
    const assessmentId = Number(result.lastInsertRowid);
    const insertPool = db.prepare(`INSERT INTO assessment_question_pool (assessment_id, question_id) VALUES (?, ?)`);
    for (const qid of poolIds) insertPool.run(assessmentId, qid);

    audit({ actorUserId: input.createdBy, actorRole: null, action: "assessment_create", targetType: "assessment", targetId: assessmentId, metadata: { type: input.type, functionCode: input.functionCode } });
    return assessmentId;
  });
}

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

export type AssignmentMode = "group" | "selected_candidates" | "individual";

// Message exact requis par la correction d'audit (§ "SMALL AUDIT
// CORRECTION") — identique partout où une affectation est refusée pour
// cause de candidat hors périmètre.
const CANDIDATE_OUT_OF_SCOPE_MESSAGE =
  "Ce candidat n'appartient pas au groupe sélectionné ou n'est pas autorisé dans votre périmètre.";

/** Publication — prend le SNAPSHOT figé (§4, critique pour l'audit) et
 * affecte les candidats. Après cet appel, modifier la question source
 * n'affecte plus jamais cet examen. Revalide encore une fois la
 * disponibilité (défense en profondeur : le pool peut avoir changé entre
 * la création du brouillon et la publication si une question a été
 * désactivée entre-temps).
 *
 * Affectation (addendum auditeur — deux modes) : `candidateUserIds` omis
 * ou absent = TOUT LE GROUPE (comportement historique, inchangé) ;
 * fourni = affectation ciblée (« certains candidats » si plusieurs,
 * « individuel » si un seul).
 *
 * Correction d'audit : un id candidat qui n'appartient PAS au groupe
 * n'est plus silencieusement filtré — toute la publication est refusée
 * (aucune évaluation publiée, aucune affectation créée), un message clair
 * est renvoyé, et le refus est tracé dans le journal d'audit. Cette
 * validation se fait délibérément AVANT la transaction ci-dessous : toute
 * écriture (y compris une entrée d'audit) à l'intérieur d'une transaction
 * qui se termine par un throw est annulée avec elle — enregistrer un
 * refus puis l'annuler serait pire qu'aucune trace du tout. */
export function publishAssessment(
  assessmentId: number,
  actorUserId: number,
  opts: { candidateUserIds?: number[] } = {}
): void {
  if (opts.candidateUserIds && opts.candidateUserIds.length > 0) {
    const pre = getDb().prepare(`SELECT group_id, function_code FROM assessments WHERE id = ?`).get(assessmentId) as
      | { group_id: number; function_code: string }
      | undefined;
    if (!pre) throw new Error("Évaluation introuvable.");
    const memberIds = new Set(listGroupMembers(pre.group_id).map((m) => m.candidate_user_id));
    const invalidIds = opts.candidateUserIds.filter((id) => !memberIds.has(id));
    if (invalidIds.length > 0) {
      audit({
        actorUserId,
        actorRole: null,
        action: "assessment_assign_denied",
        targetType: "assessment",
        targetId: assessmentId,
        result: "failure",
        metadata: { requestedCandidateUserIds: opts.candidateUserIds, invalidCandidateUserIds: invalidIds, groupId: pre.group_id, functionCode: pre.function_code },
      });
      throw new Error(CANDIDATE_OUT_OF_SCOPE_MESSAGE);
    }
  }

  transaction((db) => {
    const a = db.prepare(`SELECT * FROM assessments WHERE id = ?`).get(assessmentId) as AssessmentRow | undefined;
    if (!a) throw new Error("Évaluation introuvable.");
    if (a.status !== "draft") throw new Error(`Impossible de publier : statut actuel "${a.status}".`);

    const poolRows = db.prepare(`SELECT question_id FROM assessment_question_pool WHERE assessment_id = ?`).all(assessmentId) as { question_id: number }[];
    let poolIds = poolRows.map((r) => r.question_id);

    // Revalidation stricte : chaque question du pool doit toujours être
    // admissible au moment de la publication (pas seulement au moment de
    // la création du brouillon).
    const admissibleNow = new Set(listAdmissibleQuestionIds(a.function_code));
    poolIds = poolIds.filter((id) => admissibleNow.has(id));
    if (poolIds.length < a.question_count) {
      throw new Error(
        `Publication impossible : seules ${poolIds.length} question(s) admissible(s) restent disponibles pour ${a.function_code} (${a.question_count} requises). Une question a peut-être été désactivée depuis la création du brouillon.`
      );
    }

    const selected = a.question_source === "random" ? shuffleArray(poolIds).slice(0, a.question_count) : poolIds.slice(0, a.question_count);

    const insertSnap = db.prepare(
      `INSERT INTO assessment_question_snapshots
         (assessment_id, position, question_id, version_id, stem_snapshot, choices_snapshot_json, correct_answer_snapshot, explanation_snapshot, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    );
    selected.forEach((questionId, idx) => {
      const version = getCurrentVersion(questionId);
      if (!version) throw new Error(`Question ${questionId} n'a aucune version — donnée corrompue, publication annulée.`);
      insertSnap.run(assessmentId, idx + 1, questionId, version.id, version.stem, version.choices_json, version.correct_answer, version.explanation ?? null);
    });

    // Les candidatUserIds fournis ont déjà été intégralement validés
    // ci-dessus (avant la transaction) — aucun filtrage silencieux ici,
    // par construction : soit tous appartiennent au groupe et on continue
    // avec exactement cette liste (dédupliquée), soit on n'est jamais
    // arrivé jusqu'ici.
    const members = listGroupMembers(a.group_id);
    let targetIds: number[];
    let assignmentMode: AssignmentMode;
    if (opts.candidateUserIds && opts.candidateUserIds.length > 0) {
      targetIds = Array.from(new Set(opts.candidateUserIds));
      assignmentMode = targetIds.length === 1 ? "individual" : "selected_candidates";
    } else {
      targetIds = members.map((m) => m.candidate_user_id);
      assignmentMode = "group";
    }
    if (targetIds.length === 0) throw new Error("Ce groupe n'a aucun candidat à affecter.");

    const insertAssign = db.prepare(`INSERT OR IGNORE INTO assessment_assignments (assessment_id, candidate_user_id, assigned_by) VALUES (?, ?, ?)`);
    for (const cid of targetIds) insertAssign.run(assessmentId, cid, actorUserId);

    db.prepare(`UPDATE assessments SET status = 'published', published_at = ? WHERE id = ?`).run(nowIso(), assessmentId);

    // Trace d'affectation complète (addendum §1 : qui / quoi / à qui /
    // quand / fonction / examen / groupe) — au-delà de l'audit générique
    // "assessment_publish", une entrée dédiée nommant explicitement le
    // mode et les candidats visés.
    audit({
      actorUserId,
      actorRole: null,
      action: "assessment_assign",
      targetType: "assessment",
      targetId: assessmentId,
      metadata: { mode: assignmentMode, candidateUserIds: targetIds, functionCode: a.function_code, groupId: a.group_id },
    });
    audit({ actorUserId, actorRole: null, action: "assessment_publish", targetType: "assessment", targetId: assessmentId, metadata: { questionCount: selected.length, candidateCount: targetIds.length, assignmentMode } });
  });
}

export function listAssignedCandidateIds(assessmentId: number): number[] {
  return (
    getDb().prepare(`SELECT candidate_user_id FROM assessment_assignments WHERE assessment_id = ?`).all(assessmentId) as {
      candidate_user_id: number;
    }[]
  ).map((r) => r.candidate_user_id);
}

/** Affecter/réaffecter — addendum §1 : ajouter des candidats à une
 * évaluation DÉJÀ publiée (ex. un candidat rejoint le groupe après coup),
 * au-delà de l'affectation initiale faite à la publication. Chaque id est
 * revérifié membre du groupe. Idempotent (INSERT OR IGNORE) : réaffecter
 * un candidat déjà affecté ne fait rien de plus. */
export function assignCandidatesToAssessment(assessmentId: number, candidateUserIds: number[], actorUserId: number): number {
  const db = getDb();
  const a = db.prepare(`SELECT group_id, function_code FROM assessments WHERE id = ?`).get(assessmentId) as
    | { group_id: number; function_code: string }
    | undefined;
  if (!a) throw new Error("Évaluation introuvable.");
  const members = new Set(listGroupMembers(a.group_id).map((m) => m.candidate_user_id));
  // Correction d'audit : un id hors groupe rejette TOUTE la demande (rien
  // n'est affecté, même les ids par ailleurs valides de la même requête),
  // avec une trace d'audit du refus — jamais un filtrage silencieux. Voir
  // le même principe et le même message dans publishAssessment() ci-dessus.
  const invalidIds = candidateUserIds.filter((id) => !members.has(id));
  if (invalidIds.length > 0) {
    audit({
      actorUserId,
      actorRole: null,
      action: "assessment_assign_denied",
      targetType: "assessment",
      targetId: assessmentId,
      result: "failure",
      metadata: { requestedCandidateUserIds: candidateUserIds, invalidCandidateUserIds: invalidIds, groupId: a.group_id, functionCode: a.function_code, reassignment: true },
    });
    throw new Error(CANDIDATE_OUT_OF_SCOPE_MESSAGE);
  }
  const valid = Array.from(new Set(candidateUserIds));

  const insertAssign = db.prepare(`INSERT OR IGNORE INTO assessment_assignments (assessment_id, candidate_user_id, assigned_by) VALUES (?, ?, ?)`);
  let count = 0;
  for (const cid of valid) {
    const result = insertAssign.run(assessmentId, cid, actorUserId);
    if (Number(result.changes) > 0) count++;
  }
  if (count > 0) {
    audit({
      actorUserId,
      actorRole: null,
      action: "assessment_assign",
      targetType: "assessment",
      targetId: assessmentId,
      metadata: { mode: valid.length === 1 ? "individual" : "selected_candidates", candidateUserIds: valid, functionCode: a.function_code, groupId: a.group_id, reassignment: true },
    });
  }
  return count;
}

/** Retirer un candidat d'une évaluation — addendum §1. Bloqué s'il a déjà
 * une tentative (retirer une affectation dont l'usage a déjà commencé
 * romprait la traçabilité de la tentative, sans la supprimer pour
 * autant) ; l'admin/responsable doit alors passer par la gestion
 * d'incident (suspendre l'examen) plutôt que par un simple retrait. */
export function unassignCandidateFromAssessment(assessmentId: number, candidateUserId: number, actorUserId: number): void {
  const db = getDb();
  const hasAttempt = db.prepare(`SELECT 1 FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`).get(assessmentId, candidateUserId);
  if (hasAttempt) throw new Error("Ce candidat a déjà une tentative sur cette évaluation — retrait impossible (voir la gestion d'incident si nécessaire).");
  const result = db.prepare(`DELETE FROM assessment_assignments WHERE assessment_id = ? AND candidate_user_id = ?`).run(assessmentId, candidateUserId);
  if (Number(result.changes) > 0) {
    audit({ actorUserId, actorRole: null, action: "assessment_unassign", targetType: "assessment", targetId: assessmentId, metadata: { candidateUserId } });
  }
}

export function suspendAssessment(assessmentId: number, actorUserId: number, reason?: string): void {
  getDb().prepare(`UPDATE assessments SET status = 'suspended' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_suspend", targetType: "assessment", targetId: assessmentId, metadata: { reason } });
}

export function reopenAssessment(assessmentId: number, actorUserId: number): void {
  getDb().prepare(`UPDATE assessments SET status = 'published' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_reopen", targetType: "assessment", targetId: assessmentId });
}

export function closeAssessment(assessmentId: number, actorUserId: number): void {
  getDb().prepare(`UPDATE assessments SET status = 'closed' WHERE id = ?`).run(assessmentId);
  audit({ actorUserId, actorRole: null, action: "assessment_close", targetType: "assessment", targetId: assessmentId });
}

export interface SnapshotRow {
  id: number;
  assessment_id: number;
  position: number;
  question_id: number;
  version_id: number;
  stem_snapshot: string;
  choices_snapshot_json: string;
  correct_answer_snapshot: string;
  points: number;
}

export function getSnapshots(assessmentId: number): SnapshotRow[] {
  return getDb()
    .prepare(`SELECT * FROM assessment_question_snapshots WHERE assessment_id = ? ORDER BY position`)
    .all(assessmentId) as unknown as SnapshotRow[];
}

export function listAssignedAssessmentsForCandidate(candidateUserId: number): (AssessmentRow & { group_name: string })[] {
  return getDb()
    .prepare(
      `SELECT a.*, g.name AS group_name
       FROM assessments a
       JOIN assessment_assignments aa ON aa.assessment_id = a.id AND aa.candidate_user_id = ?
       JOIN groups g ON g.id = a.group_id
       WHERE a.status IN ('published','open','closed')
       ORDER BY a.created_at DESC`
    )
    .all(candidateUserId) as unknown as (AssessmentRow & { group_name: string })[];
}

export function trackingForAssessment(assessmentId: number) {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.id AS candidate_user_id, u.full_name, u.username,
              at.id AS attempt_id, at.status AS attempt_status, at.started_at, at.submitted_at,
              r.score_100, r.percentage, r.passed
       FROM assessment_assignments aa
       JOIN users u ON u.id = aa.candidate_user_id
       LEFT JOIN attempts at ON at.assessment_id = aa.assessment_id AND at.candidate_user_id = aa.candidate_user_id
         AND at.id = (SELECT MAX(id) FROM attempts WHERE assessment_id = aa.assessment_id AND candidate_user_id = aa.candidate_user_id)
       LEFT JOIN results r ON r.attempt_id = at.id
       WHERE aa.assessment_id = ?
       ORDER BY u.full_name`
    )
    .all(assessmentId);
}
