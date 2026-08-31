import { getDb, nowIso, transaction } from "./db";

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

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-50, complétée
// par "MISSION FINALE CIBLÉE" (2026-08-30) §1-6 — les 8 types requis sont
// désormais tous supportés. 'matching'/'ordering' réutilisent le mécanisme
// choices_order_json déjà existant (voir lib/attempts.ts::startAttempt, non
// modifié) — un seul type de "clé mélangée" pour tout le moteur. 'scenario'
// est un CONTENEUR : ses sous-questions sont embarquées dans son propre
// correct_answer (jamais des lignes `questions` séparées) — voir
// ScenarioAnswerSpec plus bas pour la justification complète.
export type QType = "mcq_single" | "mcq_multi" | "true_false" | "numeric" | "short_answer" | "matching" | "ordering" | "scenario";

export const QTYPE_LABELS: Record<QType, string> = {
  mcq_single: "QCM — une seule réponse",
  mcq_multi: "QCM — plusieurs réponses",
  true_false: "Vrai / Faux",
  numeric: "Réponse numérique",
  short_answer: "Réponse courte",
  matching: "Appariement",
  ordering: "Ordre / séquence",
  scenario: "Cas pratique / scénario",
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

/** Encodage pour 'matching' (mission "MISSION FINALE CIBLÉE", 2026-08-30,
 * §2) — `choices` porte LES DEUX côtés dans un seul tableau, distingués par
 * préfixe de clé ("L1","L2"... à gauche, "R1","R2"... à droite, même
 * convention de clé arbitraire que "A"/"B" pour un QCM). `pairs` référence
 * ces clés — jamais le texte directement (permet de renommer un élément
 * sans casser l'appariement). Le mélange gauche/droite indépendant à
 * l'affichage candidat vient GRATUITEMENT du mécanisme choices_order_json
 * déjà existant (un seul mélange global des clés, puis partitionné par
 * préfixe — un sous-ensemble d'une permutation uniforme reste une
 * permutation uniforme, aucune logique de mélange dédiée nécessaire).
 * ALL_OR_NOTHING (§2 : "jamais de crédit partiel sauf configuré") — voir
 * lib/grading.ts. */
export interface MatchingAnswerSpec {
  mode: "matching";
  pairs: { left: string; right: string }[];
}

/** Encodage pour 'ordering' (§3) — `choices` porte les éléments dans leur
 * ORDRE AUTEUR (= l'ordre correct, par construction : l'auteur les saisit
 * dans le bon ordre). `sequence` est explicite plutôt qu'implicite (jamais
 * une dépendance silencieuse à l'ordre de `choices`, qui lui EST mélangé à
 * l'affichage candidat via choices_order_json, inchangé). ALL_OR_NOTHING —
 * séquence complète exacte requise, jamais de crédit partiel par position
 * correcte sauf configuré explicitement (non implémenté cette passe,
 * jamais inventé silencieusement). */
export interface OrderingAnswerSpec {
  mode: "ordering";
  sequence: string[];
}

/** Sous-question d'un scénario (§4) — mêmes formes que les questions
 * autonomes (Choice[]/CorrectAnswerData), MAIS embarquées : jamais une ligne
 * `questions` séparée. `id` est stable PAR SCÉNARIO (assigné à l'auteurage,
 * jamais recalculé), utilisé comme clé dans la réponse candidat
 * (Record<subquestionId, string[]>, voir lib/attempts.ts::
 * saveScenarioSubanswer) et dans le progrès de correction manuelle (voir
 * attempt_answers.scenario_grading_json, lib/schema.sql). `qtype` exclut
 * explicitement 'scenario' — jamais de scénario imbriqué (appliqué au
 * typage ET revérifié à l'exécution dans validateQuestionAuthoring). */
export type ScenarioSubQType = Exclude<QType, "scenario">;
export interface ScenarioSubquestion {
  id: string;
  qtype: ScenarioSubQType;
  stem: string;
  points: number;
  choices: Choice[];
  correctAnswer: string[] | NumericAnswerSpec | ShortAnswerSpec | MatchingAnswerSpec | OrderingAnswerSpec;
}

/** Encodage pour 'scenario' (§4-5) — contexte partagé affiché UNE SEULE
 * FOIS (jamais dupliqué par sous-question, §4 de la mission) + sous-
 * questions embarquées, chacune notée selon SA PROPRE règle. Le score du
 * scénario = somme des points des sous-questions (§5 — crédit partiel
 * explicitement voulu ici, à la différence de matching/ordering) ; si AU
 * MOINS UNE sous-question exige une correction manuelle non statuée, le
 * scénario entier reste EN ATTENTE DE CORRECTION (voir lib/grading.ts::
 * gradeOneQuestion, cas 'scenario', qui délègue récursivement à chaque
 * sous-question). `documentRef` : référence textuelle (description/URL)
 * d'un document/image justificatif — l'architecture existante ne stocke
 * aucun binaire ; jamais un upload de fichier inventé cette passe. */
export interface ScenarioAnswerSpec {
  mode: "scenario";
  context: string;
  documentRef?: string;
  subquestions: ScenarioSubquestion[];
}

export type CorrectAnswerData = string[] | NumericAnswerSpec | ShortAnswerSpec | MatchingAnswerSpec | OrderingAnswerSpec | ScenarioAnswerSpec;

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
  if (qtype === "short_answer") {
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
  if (qtype === "matching") {
    return parseMatchingPairs(formData.getAll("matchingLeftText").map(String), formData.getAll("matchingRightText").map(String));
  }
  if (qtype === "ordering") {
    const itemTexts = formData
      .getAll("orderingItemText")
      .map(String)
      .map((t) => t.trim())
      .filter(Boolean);
    const choices: Choice[] = itemTexts.map((text, i) => ({ key: `S${i + 1}`, text }));
    return { choices, correctAnswer: { mode: "ordering", sequence: choices.map((c) => c.key) } };
  }
  // scenario — sous-questions déjà construites côté client (mêmes règles
  // par type que ce parseur, voir CreateQuestionForm.tsx) et sérialisées en
  // JSON dans un champ caché : la structure dynamique (N sous-questions,
  // chacune d'un type différent) n'a pas d'encodage FormData plat pratique.
  // JAMAIS une confiance aveugle malgré tout — parseScenarioSubmission()
  // revalide intégralement la forme (voir validateQuestionAuthoring, qui
  // rappelle RÉCURSIVEMENT ce même validateur par sous-question).
  return parseScenarioSubmission(String(formData.get("scenarioContext") ?? ""), String(formData.get("scenarioDocumentRef") ?? ""), String(formData.get("scenarioSubquestionsJson") ?? "[]"));
}

/** §2 — un appariement s'auteure comme une liste de PAIRES parallèles
 * (Élément gauche → Correspondance droite), jamais deux listes séparées à
 * relier manuellement à l'auteurage : plus simple, moins d'erreurs. Le
 * mélange indépendant gauche/droite n'intervient qu'à l'AFFICHAGE candidat
 * (voir lib/attempts.ts::getAttemptQuestions), jamais ici. */
function parseMatchingPairs(leftTexts: string[], rightTexts: string[]): { choices: Choice[]; correctAnswer: MatchingAnswerSpec } {
  const n = Math.max(leftTexts.length, rightTexts.length);
  const choices: Choice[] = [];
  const pairs: { left: string; right: string }[] = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const l = (leftTexts[i] ?? "").trim();
    const r = (rightTexts[i] ?? "").trim();
    if (!l || !r) continue; // ligne incomplète — ignorée silencieusement à l'auteurage (comme un choix MCQ vide), la validation refusera s'il en résulte moins de 2 paires.
    idx += 1;
    const leftKey = `L${idx}`;
    const rightKey = `R${idx}`;
    choices.push({ key: leftKey, text: l }, { key: rightKey, text: r });
    pairs.push({ left: leftKey, right: rightKey });
  }
  return { choices, correctAnswer: { mode: "matching", pairs } };
}

/** Reconstruit {choices:[], correctAnswer:ScenarioAnswerSpec} depuis le
 * JSON sérialisé côté client. `id` de chaque sous-question est réassigné
 * ICI de façon déterministe (sq1, sq2…) — jamais une valeur fournie par le
 * client, pour éviter toute collision/manipulation d'identifiant. Les
 * champs bruts inattendus sont ignorés (pick explicite), jamais propagés
 * tels quels dans la base. */
function parseScenarioSubmission(context: string, documentRef: string, rawJson: string): { choices: Choice[]; correctAnswer: ScenarioAnswerSpec } {
  let raw: unknown[];
  try {
    raw = JSON.parse(rawJson);
    if (!Array.isArray(raw)) throw new Error("not an array");
  } catch {
    throw new Error("Sous-questions de scénario invalides (format inattendu) — veuillez réessayer.");
  }
  const subquestions: ScenarioSubquestion[] = raw.map((item, i) => {
    const r = item as Record<string, unknown>;
    return {
      id: `sq${i + 1}`,
      qtype: r.qtype as ScenarioSubQType,
      stem: String(r.stem ?? ""),
      points: Number(r.points ?? 1),
      choices: Array.isArray(r.choices) ? (r.choices as Choice[]) : [],
      correctAnswer: r.correctAnswer as ScenarioSubquestion["correctAnswer"],
    };
  });
  return { choices: [], correctAnswer: { mode: "scenario", context: context.trim(), documentRef: documentRef.trim() || undefined, subquestions } };
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
  if (qtype === "matching") {
    if (Array.isArray(correctAnswer) || correctAnswer.mode !== "matching") return "Configuration d'appariement invalide.";
    if (choices.some((c) => !c.text || !c.text.trim())) return "Aucun élément d'appariement ne peut être vide.";
    if (correctAnswer.pairs.length < 2) return "Au moins deux paires sont requises pour un appariement.";
    const keys = new Set(choices.map((c) => c.key));
    if (correctAnswer.pairs.some((p) => !keys.has(p.left) || !keys.has(p.right))) return "Une paire d'appariement référence un élément qui n'existe pas.";
    const leftKeys = correctAnswer.pairs.map((p) => p.left);
    if (new Set(leftKeys).size !== leftKeys.length) return "Chaque élément de gauche ne peut être associé qu'une seule fois — paire en double.";
    return null;
  }
  if (qtype === "ordering") {
    if (Array.isArray(correctAnswer) || correctAnswer.mode !== "ordering") return "Configuration d'ordre/séquence invalide.";
    if (choices.some((c) => !c.text || !c.text.trim())) return "Aucun élément de la séquence ne peut être vide.";
    if (correctAnswer.sequence.length < 2) return "Au moins deux éléments sont requis pour un ordre/séquence.";
    if (new Set(correctAnswer.sequence).size !== correctAnswer.sequence.length) return "La séquence contient un élément identifiant en double.";
    const keys = new Set(choices.map((c) => c.key));
    if (correctAnswer.sequence.some((k) => !keys.has(k))) return "La séquence référence un élément qui n'existe pas.";
    return null;
  }
  if (qtype === "scenario") {
    if (Array.isArray(correctAnswer) || correctAnswer.mode !== "scenario") return "Configuration de scénario invalide.";
    if (!correctAnswer.context || !correctAnswer.context.trim()) return "Le contexte du scénario est obligatoire — jamais un cas pratique sans mise en situation.";
    if (!correctAnswer.subquestions || correctAnswer.subquestions.length === 0) return "Un scénario doit contenir au moins une sous-question.";
    for (const sq of correctAnswer.subquestions) {
      // Jamais un scénario imbriqué — vérifié ici en plus du typage
      // (ScenarioSubQType exclut déjà 'scenario' à la compilation), au cas
      // où une sous-question arrive via le JSON sérialisé côté client
      // (jamais une confiance aveugle envers une donnée qui a transité par
      // le navigateur, même construite par notre propre UI).
      if ((sq.qtype as QType) === "scenario") return "Un scénario ne peut pas contenir un autre scénario en sous-question.";
      if (!sq.stem || !sq.stem.trim()) return `Sous-question "${sq.id}" : le texte est obligatoire.`;
      if (!Number.isFinite(sq.points) || sq.points <= 0) return `Sous-question "${sq.id}" : le nombre de points doit être positif.`;
      const subError = validateQuestionAuthoring(sq.qtype, sq.choices, sq.correctAnswer);
      if (subError) return `Sous-question "${sq.id}" invalide : ${subError}`;
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

// Mission "NORMALIZE QUESTION COUNTS + QUESTION BANK FILTERS" (2026-08-30) —
// classification RÉGLEMENTAIRE / DEMO-DRAFT. Signal AUTORITATIF : le préfixe
// "DEMO-" du kost_question_id, jamais source_status seul. Aujourd'hui les
// deux coïncident exactement (244 FROZEN_SOURCE_VERIFIED, 8 DRAFT = les 8
// DEMO-*), mais source_status seul ne suffirait pas à long terme : une VRAIE
// question réglementaire en cours de vérification peut légitimement être
// DRAFT/PARTIAL/STALE/SOURCE_GAP/SOURCE_CONFLICT/NOT_ATTEMPTED — elle reste
// réglementaire (en cours), jamais un exemple DEMO créé pour tester les 8
// types de question. Se fier au préfixe d'identifiant (choix d'auteurage
// délibéré et stable, jamais recalculé) évite de mal classer ce cas futur.
export function isDemoQuestionId(kostQuestionId: string): boolean {
  return kostQuestionId.startsWith("DEMO-");
}

export interface QuestionListFilter {
  functionCode?: string;
  qtype?: QType;
  sourceStatus?: SourceStatus;
  reviewerStatus?: "PENDING" | "APPROVED" | "REJECTED";
  /** "regulatory" = kost_question_id ne commence PAS par "DEMO-" ; "demo" =
   * commence par "DEMO-". Jamais les deux mélangés dans un même filtre. */
  classification?: "regulatory" | "demo";
  active?: boolean;
  search?: string;
}

export type QuestionListRow = QuestionRow & { stem: string; is_demo: number; is_protected: number };

/** Liste filtrée à plat pour /question-bank (§3-5 de la mission) — jamais
 * utilisée pour le tirage de production (voir isAdmissibleWhereClause plus
 * haut, fonction séparée, non touchée ici). Toutes les clauses sont ET
 * (jamais OR) — même discipline que lib/results.ts::listResults et
 * lib/user-directory.ts::listUsers. */
export function listQuestions(filter: QuestionListFilter = {}): QuestionListRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter.functionCode) {
    clauses.push(`q.function_code = ?`);
    params.push(filter.functionCode);
  }
  if (filter.qtype) {
    clauses.push(`q.qtype = ?`);
    params.push(filter.qtype);
  }
  if (filter.sourceStatus) {
    clauses.push(`q.source_status = ?`);
    params.push(filter.sourceStatus);
  }
  if (filter.reviewerStatus) {
    clauses.push(`q.reviewer_status = ?`);
    params.push(filter.reviewerStatus);
  }
  if (filter.classification === "demo") {
    clauses.push(`q.kost_question_id LIKE 'DEMO-%'`);
  } else if (filter.classification === "regulatory") {
    clauses.push(`q.kost_question_id NOT LIKE 'DEMO-%'`);
  }
  if (filter.active !== undefined) {
    clauses.push(`q.active = ?`);
    params.push(filter.active ? 1 : 0);
  }
  if (filter.search) {
    clauses.push(`(LOWER(q.kost_question_id) LIKE ? OR LOWER(COALESCE(qv.stem, '')) LIKE ? OR LOWER(COALESCE(q.regulatory_reference, '')) LIKE ?)`);
    const needle = `%${filter.search.toLowerCase()}%`;
    params.push(needle, needle, needle);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(
      `SELECT q.*, qv.stem, (CASE WHEN q.kost_question_id LIKE 'DEMO-%' THEN 1 ELSE 0 END) AS is_demo,
              EXISTS(SELECT 1 FROM assessment_question_snapshots s WHERE s.question_id = q.id) AS is_protected
       FROM questions q
       LEFT JOIN question_versions qv ON qv.id = q.current_version_id
       ${where}
       ORDER BY q.function_code, q.kost_question_id`
    )
    .all(...params) as unknown as QuestionListRow[];
}

export interface QuestionCountsByClassification {
  regulatory: number;
  demo: number;
  total: number;
}

/** Compteurs globaux pour l'en-tête UI (§2 de la mission) — jamais présenter
 * "252 questions réglementaires" alors que seules 244 sont
 * FROZEN_SOURCE_VERIFIED/non-DEMO. */
export function countQuestionsByClassification(): QuestionCountsByClassification {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
         SUM(CASE WHEN kost_question_id NOT LIKE 'DEMO-%' THEN 1 ELSE 0 END) AS regulatory,
         SUM(CASE WHEN kost_question_id LIKE 'DEMO-%' THEN 1 ELSE 0 END) AS demo,
         COUNT(*) AS total
       FROM questions`
    )
    .get() as { regulatory: number | null; demo: number | null; total: number };
  return { regulatory: row.regulatory ?? 0, demo: row.demo ?? 0, total: row.total };
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

// ============================================================================
// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §8-10 — suppression/archivage sûrs. Le signal d'"historique protégé" est
// `assessment_question_snapshots.question_id` : cette table n'est écrite
// QU'À LA PUBLICATION d'une évaluation (lib/assessments.ts, jamais au
// brouillon — voir son commentaire d'en-tête "Copie figée exacte, prise UNE
// fois à la publication"), et attempt_questions référence toujours un
// snapshot_id, jamais directement question_id : donc "aucun snapshot" ⇒
// aucune tentative candidate, aucun résultat, aucun historique de
// correction ne peut exister pour cette question, par construction — un
// seul EXISTS suffit, jamais besoin d'interroger attempts/results
// séparément. `questions.active=1` reste le SEUL contrôle qui empêche déjà
// une question désactivée d'entrer dans un tirage de production
// (isAdmissibleWhereClause ci-dessus) — archiver/désactiver ne fait donc
// qu'exposer dans l'UI un état déjà pleinement effectif côté moteur.
// ============================================================================

/** Vrai si cette question a déjà été publiée dans au moins une évaluation
 * (donc potentiellement des tentatives/résultats/corrections en dépendent)
 * — jamais supprimable définitivement dans ce cas, uniquement archivable. */
export function isQuestionProtected(questionId: number): boolean {
  const row = getDb().prepare(`SELECT 1 FROM assessment_question_snapshots WHERE question_id = ? LIMIT 1`).get(questionId);
  return !!row;
}

export class QuestionDeleteError extends Error {}

/** Suppression DÉFINITIVE — réservée aux questions jamais publiées
 * (isQuestionProtected doit avoir été vérifié par l'appelant AVANT, cette
 * fonction revérifie elle-même en défense en profondeur, jamais une
 * confiance aveugle dans l'appelant). Retire d'abord les lignes
 * assessment_question_pool (sélection d'un brouillon PAS ENCORE publié —
 * jamais un historique, sans quoi la contrainte FK ON DELETE (RESTRICT par
 * défaut, PRAGMA foreign_keys=ON, lib/db.ts) ferait échouer le DELETE
 * suivant) ; question_versions/question_tags se suppriment seuls (ON DELETE
 * CASCADE, lib/schema.sql). Jamais de renumérotation d'aucune autre
 * question (§10) — un DELETE par id ne touche que cette ligne. */
export function deleteQuestion(questionId: number): void {
  if (isQuestionProtected(questionId)) {
    throw new QuestionDeleteError("Cette question a déjà été publiée dans une évaluation — suppression définitive impossible, utilisez l'archivage.");
  }
  transaction((db) => {
    db.prepare(`DELETE FROM assessment_question_pool WHERE question_id = ?`).run(questionId);
    const result = db.prepare(`DELETE FROM questions WHERE id = ?`).run(questionId);
    if (result.changes === 0) throw new QuestionDeleteError("Question introuvable.");
  });
}

/** Archivage/désactivation réversible — jamais destructif, jamais de perte
 * de preuve (§9-10) : une question archivée reste entièrement lisible dans
 * l'historique de tout examen déjà publié (assessment_question_snapshots
 * est une copie figée, indépendante de `questions`/`active`). `active=0`
 * l'exclut simplement de tout FUTUR tirage/sélection (déjà l'unique
 * contrôle réel, voir isAdmissibleWhereClause). Symétrique et réversible :
 * la même fonction réactive (active=true) — jamais une porte à sens unique. */
export function setQuestionActive(questionId: number, active: boolean): void {
  const result = getDb().prepare(`UPDATE questions SET active = ?, updated_at = ? WHERE id = ?`).run(active ? 1 : 0, nowIso(), questionId);
  if (result.changes === 0) throw new QuestionDeleteError("Question introuvable.");
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
  if (qtype === "matching") {
    const spec = correctAnswer as { pairs?: { left: string; right: string }[] } | null;
    if (!spec?.pairs) return "—";
    if (!choices) return spec.pairs.map((p) => `${p.left} → ${p.right}`).join(" ; ");
    const byKey = new Map(choices.map((c) => [c.key, c.text]));
    return spec.pairs.map((p) => `${byKey.get(p.left) ?? p.left} → ${byKey.get(p.right) ?? p.right}`).join(" ; ");
  }
  if (qtype === "ordering") {
    const spec = correctAnswer as { sequence?: string[] } | null;
    if (!spec?.sequence) return "—";
    if (!choices) return spec.sequence.join(" → ");
    const byKey = new Map(choices.map((c) => [c.key, c.text]));
    return spec.sequence.map((k) => byKey.get(k) ?? k).join(" → ");
  }
  if (qtype === "scenario") {
    const spec = correctAnswer as { subquestions?: unknown[] } | null;
    return spec?.subquestions ? `Scénario — ${spec.subquestions.length} sous-question(s)` : "—";
  }
  return "";
}

/** Miroir de formatCorrectAnswerForDisplay pour la réponse du CANDIDAT
 * (mission "MISSION FINALE CIBLÉE", 2026-08-30) — même point d'entrée
 * unique réutilisé par les 4 mêmes consommateurs (fiche admin, "Mes
 * résultats", export CSV, PDF individuel), jamais quatre implémentations
 * divergentes. Pour 'scenario', une ligne "id: réponse" par sous-question
 * — un résumé compact suffisant pour CSV/PDF ; les pages interactives
 * (résultats détaillés) affichent en plus un rendu structuré complet par
 * sous-question, voir leur propre logique. */
export function formatCandidateAnswerForDisplay(qtype: string, candidateAnswer: unknown, choices?: Choice[]): string {
  if (qtype === "mcq_single" || qtype === "mcq_multi" || qtype === "true_false") {
    const keys = Array.isArray(candidateAnswer) ? (candidateAnswer as string[]) : [];
    if (keys.length === 0) return "—";
    if (!choices) return keys.join(", ");
    const byKey = new Map(choices.map((c) => [c.key, c.text]));
    return keys.map((k) => byKey.get(k) ?? k).join(", ");
  }
  if (qtype === "numeric" || qtype === "short_answer") {
    const arr = Array.isArray(candidateAnswer) ? (candidateAnswer as string[]) : [];
    if (!arr[0]) return "—";
    const unit = choices?.find((c) => c.key === "unit")?.text;
    return qtype === "numeric" && unit ? `${arr[0]} ${unit}` : arr[0];
  }
  if (qtype === "matching") {
    const pairs = Array.isArray(candidateAnswer) ? (candidateAnswer as string[]) : [];
    if (pairs.length === 0) return "—";
    const byKey = new Map((choices ?? []).map((c) => [c.key, c.text]));
    return pairs
      .map((p) => {
        const [l, r] = p.split(":");
        return `${byKey.get(l ?? "") ?? l} → ${byKey.get(r ?? "") ?? r}`;
      })
      .join(" ; ");
  }
  if (qtype === "ordering") {
    const seq = Array.isArray(candidateAnswer) ? (candidateAnswer as string[]) : [];
    if (seq.length === 0) return "—";
    const byKey = new Map((choices ?? []).map((c) => [c.key, c.text]));
    return seq.map((k) => byKey.get(k) ?? k).join(" → ");
  }
  if (qtype === "scenario") {
    const given = (candidateAnswer ?? {}) as Record<string, string[]>;
    const entries = Object.entries(given);
    if (entries.length === 0) return "—";
    return entries.map(([id, ans]) => `${id}: ${ans?.[0] ?? "—"}`).join(" ; ");
  }
  return "";
}

/** Point d'entrée unique "cette question a-t-elle une réponse ?" pour la
 * lecture d'une tentative déjà passée (fiche admin /results/[attemptId],
 * PDF individuel — mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF",
 * 2026-08-31 §2). Une question 'scenario' n'est répondue que si TOUTES ses
 * sous-questions le sont — même définition que ExamRunner.tsx::
 * isQuestionAnswered côté candidat en cours d'examen (signature différente
 * là-bas : state client live, pas candidateAnswer déjà persisté — donc pas
 * fusionné avec celle-ci, mais la RÈGLE métier reste identique). */
export function isAnswered(qtype: string, candidateAnswer: unknown): boolean {
  if (qtype === "scenario") {
    const given = (candidateAnswer ?? {}) as Record<string, string[]>;
    const entries = Object.values(given);
    return entries.length > 0 && entries.every((a) => a && a.length > 0 && a[0] !== "");
  }
  return Array.isArray(candidateAnswer) && candidateAnswer.length > 0;
}
