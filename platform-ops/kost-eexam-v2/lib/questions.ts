import { getDb, nowIso } from "./db";

// Statuts de provenance réglementaire — §3 de la mission. Une question dont
// le statut n'est pas FROZEN_SOURCE_VERIFIED n'est JAMAIS admissible pour un
// tirage de production (voir isAdmissible ci-dessous) — appliqué au niveau
// requête, pas seulement documenté.
export type SourceStatus =
  | "FROZEN_SOURCE_VERIFIED"
  | "DRAFT"
  | "PARTIAL"
  | "STALE"
  | "SOURCE_GAP"
  | "SOURCE_CONFLICT"
  | "NOT_ATTEMPTED";

export type QType = "mcq_single" | "mcq_multi" | "true_false";

export interface Choice {
  key: string;
  text: string;
}

export interface QuestionRow {
  id: number;
  kost_question_id: string;
  function_code: string;
  subtask: string | null;
  qtype: QType;
  language: string;
  source_status: SourceStatus;
  regulatory_reference: string | null;
  reviewer_status: "PENDING" | "APPROVED" | "REJECTED";
  review_date: string | null;
  verification_date: string | null;
  current_version_id: number | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionVersionRow {
  id: number;
  question_id: number;
  version_no: number;
  stem: string;
  choices_json: string;
  correct_answer: string;
  explanation: string | null;
  created_at: string;
}

/** Admissible pour un tirage de PRODUCTION (Test/Examen) : source vérifiée,
 * active, revue non rejetée. Une question DRAFT/PARTIAL/STALE/GAP/CONFLICT/
 * NOT_ATTEMPTED n'entre jamais automatiquement dans un examen de production
 * (§3, règle explicite de la mission) — appliqué ici, source unique. */
export function isAdmissibleWhereClause(alias = "q"): string {
  return `${alias}.active = 1 AND ${alias}.source_status = 'FROZEN_SOURCE_VERIFIED' AND ${alias}.reviewer_status != 'REJECTED'`;
}

export function countAdmissibleQuestions(functionCode: string): number {
  const db = getDb();
  const row = db
    .prepare(`SELECT COUNT(*) AS n FROM questions q WHERE q.function_code = ? AND ${isAdmissibleWhereClause()}`)
    .get(functionCode) as { n: number };
  return row.n;
}

export function listAdmissibleQuestionIds(functionCode: string): number[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT q.id FROM questions q WHERE q.function_code = ? AND ${isAdmissibleWhereClause()}`)
    .all(functionCode) as { id: number }[];
  return rows.map((r) => r.id);
}

export function listQuestionsByFunction(functionCode: string): (QuestionRow & { stem: string })[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT q.*, qv.stem
       FROM questions q
       LEFT JOIN question_versions qv ON qv.id = q.current_version_id
       WHERE q.function_code = ?
       ORDER BY q.kost_question_id`
    )
    .all(functionCode) as unknown as (QuestionRow & { stem: string })[];
}

export function getQuestionVersion(versionId: number): QuestionVersionRow | undefined {
  return getDb().prepare(`SELECT * FROM question_versions WHERE id = ?`).get(versionId) as QuestionVersionRow | undefined;
}

export function getCurrentVersion(questionId: number): QuestionVersionRow | undefined {
  const q = getDb().prepare(`SELECT current_version_id FROM questions WHERE id = ?`).get(questionId) as
    | { current_version_id: number | null }
    | undefined;
  if (!q?.current_version_id) return undefined;
  return getQuestionVersion(q.current_version_id);
}

/** Création d'une question + sa première version — append-only dès cette
 * première écriture (§4 : toute modification ultérieure crée une NOUVELLE
 * version, jamais un UPDATE sur celle-ci). */
export function createQuestion(params: {
  kostQuestionId: string;
  functionCode: string;
  subtask?: string;
  qtype: QType;
  language?: string;
  sourceStatus: SourceStatus;
  regulatoryReference?: string;
  stem: string;
  choices: Choice[];
  correctAnswer: string[];
  explanation?: string;
  createdBy: number;
}): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO questions
         (kost_question_id, function_code, subtask, qtype, language, source_status, regulatory_reference,
          verification_date, created_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      params.kostQuestionId,
      params.functionCode,
      params.subtask ?? null,
      params.qtype,
      params.language ?? "fr",
      params.sourceStatus,
      params.regulatoryReference ?? null,
      params.sourceStatus === "FROZEN_SOURCE_VERIFIED" ? nowIso() : null,
      params.createdBy,
      nowIso()
    );
  const questionId = Number(result.lastInsertRowid);

  const versionResult = db
    .prepare(
      `INSERT INTO question_versions (question_id, version_no, stem, choices_json, correct_answer, explanation, created_by)
       VALUES (?, 1, ?, ?, ?, ?, ?)`
    )
    .run(questionId, params.stem, JSON.stringify(params.choices), JSON.stringify(params.correctAnswer), params.explanation ?? null, params.createdBy);

  db.prepare(`UPDATE questions SET current_version_id = ? WHERE id = ?`).run(Number(versionResult.lastInsertRowid), questionId);
  return questionId;
}

/** Nouvelle version d'une question EXISTANTE — jamais un UPDATE sur une
 * version déjà créée (§4 de la mission : append-only). Un examen déjà
 * publié référence des `assessment_question_snapshots` figés au moment de
 * sa publication ; ils pointent vers l'ancien `version_id` et ne sont
 * jamais réécrits ici — c'est précisément ce qui garantit qu'éditer une
 * question après publication d'un examen ne modifie jamais rétroactivement
 * ce que le candidat a réellement reçu. */
export function addQuestionVersion(
  questionId: number,
  params: { stem: string; choices: Choice[]; correctAnswer: string[]; explanation?: string },
  editedBy: number
): number {
  const db = getDb();
  const current = db.prepare(`SELECT MAX(version_no) AS maxVersion FROM question_versions WHERE question_id = ?`).get(questionId) as { maxVersion: number | null };
  const nextVersion = (current.maxVersion ?? 0) + 1;
  const result = db
    .prepare(
      `INSERT INTO question_versions (question_id, version_no, stem, choices_json, correct_answer, explanation, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(questionId, nextVersion, params.stem, JSON.stringify(params.choices), JSON.stringify(params.correctAnswer), params.explanation ?? null, editedBy);
  const versionId = Number(result.lastInsertRowid);
  db.prepare(`UPDATE questions SET current_version_id = ?, updated_at = ? WHERE id = ?`).run(versionId, nowIso(), questionId);
  return versionId;
}

export function getQuestionById(id: number): QuestionRow | undefined {
  return getDb().prepare(`SELECT * FROM questions WHERE id = ?`).get(id) as QuestionRow | undefined;
}

export function functionLabel(code: string): string {
  const row = getDb().prepare(`SELECT label FROM functions WHERE code = ?`).get(code) as { label: string } | undefined;
  return row?.label ?? code;
}
