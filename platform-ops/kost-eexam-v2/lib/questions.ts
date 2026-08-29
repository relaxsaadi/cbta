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

// Libellé humain — mission "244 QUESTIONS DGR CONFIRMÉES" §1 : ne jamais
// exposer le mot technique "FROZEN" comme libellé principal aux
// administrateurs/responsables pédagogiques. La valeur DB
// (FROZEN_SOURCE_VERIFIED) reste inchangée pour compatibilité et
// traçabilité d'audit — seul ce libellé d'AFFICHAGE change. "CONFIRMÉ —
// SOURCE DGR VÉRIFIÉE" ne signifie PAS "ANAC APPROUVÉ" et ne signifie pas
// automatiquement "reviewer APPROVED" (statut reviewer distinct, voir
// reviewer_status) — seulement : source DGR courante vérifiée, contenu
// source-vérifié, sûr pour la banque de questions contrôlée.
export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  FROZEN_SOURCE_VERIFIED: "Confirmé — source DGR vérifiée",
  DRAFT: "Brouillon",
  PARTIAL: "Partiel",
  STALE: "Périmé",
  SOURCE_GAP: "Écart de source",
  SOURCE_CONFLICT: "Conflit de source",
  NOT_ATTEMPTED: "Non traité",
};

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-50 — types
// de question extensibles. matching/ordering/scenario ne sont PAS ajoutés
// cette passe (portée assumée, voir le rapport final) : le CHECK de schéma
// et ce type ne portent que les types réellement livrés, jamais une valeur
// fantôme qu'aucun code ne saurait noter.
export type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer";

export const QTYPE_LABELS: Record<QType, string> = {
  mcq_single: "QCM — une seule réponse",
  mcq_multi: "QCM — plusieurs réponses",
  true_false: "Vrai / Faux",
  numeric: "Réponse numérique",
  short_answer: "Réponse courte",
};

export interface Choice {
  key: string;
  text: string;
}

/** Encodage de `correct_answer`/`correct_answer_snapshot` pour 'numeric'
 * (§47 — jamais de tolérance inventée : 0 = correspondance exacte
 * explicite, jamais un défaut caché). `unit` est la seule partie
 * envoyée telle quelle au candidat (voir lib/attempts.ts::
 * getAttemptQuestions) — value/tolerance ne quittent jamais le serveur
 * avant notation. */
export interface NumericAnswerSpec {
  mode: "numeric";
  value: number;
  tolerance: number;
  unit?: string;
}

/** Encodage pour 'short_answer' (§48) — deux modes explicites, JAMAIS de
 * correction par IA générative/floue :
 *   'exact'  : auto-notée par correspondance exacte normalisée (espaces de
 *              bord retirés, minuscules, espaces internes réduits à un
 *              seul) contre au moins une réponse de la liste acceptée.
 *   'manual' : jamais auto-notée — is_correct reste NULL jusqu'à ce qu'un
 *              correcteur autorisé statue (voir lib/manual-grading.ts). */
export type ShortAnswerSpec = { mode: "exact"; acceptedAnswers: string[] } | { mode: "manual" };

export type CorrectAnswerData = string[] | NumericAnswerSpec | ShortAnswerSpec;

/** Construit {choices, correctAnswer} depuis un FormData d'auteurage, selon
 * le qtype — point d'entrée UNIQUE réutilisé par la création ET l'édition
 * (mission "COMPLETE CANDIDATE EXAM LIFECYCLE", 2026-08-29, §51-52) : jamais
 * deux implémentations divergentes du parsing formulaire → modèle de
 * données. Lève une Error avec un message FR explicite si les champs
 * requis pour CE type sont absents/invalides — jamais une valeur devinée. */
export function parseAuthoringFormData(qtype: QType, formData: FormData): { choices: Choice[]; correctAnswer: CorrectAnswerData } {
  if (qtype === "mcq_single" || qtype === "mcq_multi") {
    const choiceTexts = formData.getAll("choiceText").map(String);
    const correctIndexes = formData.getAll("correct").map(String);
    const choices = choiceTexts.filter((t) => t.trim().length > 0).map((text, i) => ({ key: String.fromCharCode(65 + i), text: text.trim() }));
    const correctAnswer = correctIndexes.map((i) => String.fromCharCode(65 + Number(i)));
    return { choices, correctAnswer };
  }
  if (qtype === "true_false") {
    const correct = String(formData.get("trueFalseCorrect") ?? "");
    return {
      choices: [
        { key: "true", text: "Vrai" },
        { key: "false", text: "Faux" },
      ],
      correctAnswer: correct ? [correct] : [],
    };
  }
  if (qtype === "numeric") {
    const value = Number(formData.get("numericValue"));
    const tolerance = Number(formData.get("numericTolerance") ?? "0");
    const unit = String(formData.get("numericUnit") ?? "").trim();
    return {
      choices: unit ? [{ key: "unit", text: unit }] : [],
      correctAnswer: { mode: "numeric", value, tolerance, unit: unit || undefined },
    };
  }
  // short_answer
  const mode = String(formData.get("shortAnswerMode") ?? "exact");
  if (mode === "manual") {
    return { choices: [], correctAnswer: { mode: "manual" } };
  }
  const acceptedAnswers = String(formData.get("acceptedAnswers") ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { choices: [], correctAnswer: { mode: "exact", acceptedAnswers } };
}

/** §53 — validations d'auteurage : empêche les états d'auteurage invalides
 * AVANT écriture, jamais après coup. Une question mal formée ne doit
 * jamais pouvoir être enregistrée, quel que soit le type. */
export function validateQuestionAuthoring(qtype: QType, choices: Choice[], correctAnswer: CorrectAnswerData): string | null {
  if (qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") {
    if (!Array.isArray(correctAnswer)) return "Réponse correcte invalide pour ce type de question.";
    if (qtype !== "true_false" && choices.length < 2) return "Au moins deux choix sont requis.";
    const keys = new Set(choices.map((c) => c.key));
    const invalidKeys = correctAnswer.filter((k) => !keys.has(k));
    if (invalidKeys.length > 0) return "La réponse correcte référence un choix qui n'existe pas.";
    if (qtype === "mcq_single" || qtype === "true_false") {
      if (correctAnswer.length !== 1) return "Ce type de question exige exactement une seule réponse correcte.";
    } else if (correctAnswer.length < 1) {
      return "Au moins une réponse correcte est requise.";
    }
    return null;
  }
  if (qtype === "numeric") {
    if (Array.isArray(correctAnswer) || correctAnswer.mode !== "numeric") return "Réponse numérique invalide.";
    if (!Number.isFinite(correctAnswer.value)) return "La valeur numérique correcte est obligatoire.";
    if (!Number.isFinite(correctAnswer.tolerance) || correctAnswer.tolerance < 0) return "La tolérance doit être un nombre positif ou nul (0 = correspondance exacte).";
    return null;
  }
  if (qtype === "short_answer") {
    if (Array.isArray(correctAnswer) || (correctAnswer.mode !== "exact" && correctAnswer.mode !== "manual")) return "Configuration de réponse courte invalide.";
    if (correctAnswer.mode === "exact" && (!correctAnswer.acceptedAnswers || correctAnswer.acceptedAnswers.filter((a) => a.trim()).length === 0)) {
      return "Au moins une réponse acceptée est requise en mode correspondance exacte (ou choisissez le mode correction manuelle).";
    }
    return null;
  }
  return "Type de question inconnu.";
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
  correctAnswer: CorrectAnswerData;
  explanation?: string;
  createdBy: number;
}): number {
  const validationError = validateQuestionAuthoring(params.qtype, params.choices, params.correctAnswer);
  if (validationError) throw new Error(validationError);

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
  params: { stem: string; choices: Choice[]; correctAnswer: CorrectAnswerData; explanation?: string },
  editedBy: number
): number {
  const question = getQuestionById(questionId);
  if (!question) throw new Error("Question introuvable.");
  const validationError = validateQuestionAuthoring(question.qtype, params.choices, params.correctAnswer);
  if (validationError) throw new Error(validationError);

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

/** Formatage lisible d'une réponse correcte (correct_answer/
 * correct_answer_snapshot déjà JSON.parse) — point d'entrée UNIQUE
 * réutilisé par la fiche admin, "Mes résultats", l'export CSV détaillé et
 * le PDF individuel (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
 * 2026-08-29) : jamais quatre implémentations divergentes du même
 * formatage. `choices` optionnel — permet d'afficher le TEXTE des choix
 * MCQ plutôt que leurs seules clés quand disponible. */
export function formatCorrectAnswerForDisplay(qtype: string, correctAnswer: unknown, choices?: Choice[]): string {
  if (qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") {
    const keys = Array.isArray(correctAnswer) ? (correctAnswer as string[]) : [];
    if (!choices) return keys.join(", ");
    const byKey = new Map(choices.map((c) => [c.key, c.text]));
    return keys.map((k) => byKey.get(k) ?? k).join(", ");
  }
  if (qtype === "numeric") {
    const spec = correctAnswer as { value?: number; unit?: string } | null;
    if (!spec || typeof spec.value !== "number") return "—";
    return spec.unit ? `${spec.value} ${spec.unit}` : String(spec.value);
  }
  if (qtype === "short_answer") {
    const spec = correctAnswer as { mode?: string; acceptedAnswers?: string[] } | null;
    if (spec?.mode === "manual") return "(correction manuelle)";
    return (spec?.acceptedAnswers ?? []).join(" / ");
  }
  return "";
}
