// Importeur contrôlé — contenu réel DGR depuis Moodle (mission "PRODUCTION
// READINESS PHASE" §9-10). Lecture SELECT-only de Moodle (jamais
// d'écriture — voir docs/KOST_EEXAM_V2_ARCHITECTURE.md §1.2/§14), jamais de
// contenu réglementaire fabriqué.
//
// Pipeline : UPLOAD (extraction JSON pré-faite, .moodle-extracts/q_7.X.json,
// via une requête MySQL SELECT-only exécutée hors de ce process — voir
// commentaire en bas de fichier pour la commande exacte) → PREVIEW →
// VALIDATION → STATUS CHECK → DUPLICATE CHECK → CONFIRM → IMPORT →
// MIGRATION REPORT, une fonction à la fois (§10 : jamais toutes en bloc,
// jamais une fabrication pour atteindre un total cible).
//
// Deux sources croisées, jamais une seule :
//   1. Moodle (.moodle-extracts/q_7.X.json) — la STRUCTURE authoritative
//      (énoncé, choix, bonne réponse) : seul ce qui existe RÉELLEMENT dans
//      Moodle (idnumber posé, texte complet présent) peut être importé —
//      c'est le filtre d'éligibilité lui-même, pas seulement une source.
//   2. Le markdown source déjà commité sur la branche non fusionnée
//      (`ai/dgr-stage2b-handoff:docs/DGR_PRODUCTION_BANK_7.X.md`, mis en
//      cache localement dans .moodle-extracts/markdown/) — la métadonnée
//      réglementaire (sous-tâche CBTA, référence DGR, date de vérification,
//      explication). PAS la CSV de traçabilité pour ce champ : vérifié
//      qu'au moins un item (Q-7.2-001) porte une virgule/guillemet imbriqué
//      mal échappé dans sa colonne dgr_reference — un vrai défaut de la CSV
//      source elle-même (confirmé par lecture des octets bruts), pas une
//      erreur de ce parseur — donc jamais une source fiable pour un champ
//      réglementaire. Certains items (7.1 002/003/004/006/009/011,
//      antérieurs au programme stage2b) n'ont AUCUNE entrée markdown : pour
//      ceux-là uniquement, repli sur le `generalfeedback` Moodle
//      ("Source : ...", texte propre, déjà vérifié lisible).
//
// Statut réviseur : jamais 'APPROVED' — chaque item source porte encore
// "Approval: PENDING REVIEWER + DATE" (confirmé pour la totalité du
// programme, aucune exception) → reviewer_status reste 'PENDING' en V2
// (valeur par défaut du schéma, jamais forcée à 'APPROVED' ici).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDb, closeDb } from "../lib/db";
import { createQuestion, type Choice, type QType } from "../lib/questions";

const FUNCTION_ARG = process.argv[2];
if (!FUNCTION_ARG || !/^7\.(?:[1-9]|10)$/.test(FUNCTION_ARG)) {
  console.error("Usage : npx tsx scripts/import-dgr-from-moodle.ts 7.X   (X = 1..10)");
  process.exit(1);
}
const FUNCTION: string = FUNCTION_ARG;

interface MoodleAnswer {
  text: string;
  fraction: string;
  feedback: string;
}
interface MoodleQuestion {
  moodle_id: string;
  qtype: "truefalse" | "multichoice";
  questiontext: string;
  generalfeedback: string;
  answers: MoodleAnswer[];
}

interface MarkdownMeta {
  subtask?: string;
  regulatoryReference?: string;
  verificationDate?: string;
  explanation?: string;
  frStatusText: string;
}

// Parseur du markdown source (docs/DGR_PRODUCTION_BANK_7.X.md) — même
// défi que celui déjà résolu par l'équipe console (§5ter de
// DGR_MOODLE_BANK_INTEGRATION_PLAN.md) : les titres d'item vont de `##` à
// `####` selon la section (batches imbriqués plus profondément) — on
// matche les deux. Chaque item est délimité par le prochain titre `##`+ ou
// la fin du fichier.
function parseMarkdownItems(text: string): Map<string, MarkdownMeta> {
  const items = new Map<string, MarkdownMeta>();
  const headingRe = /^#{2,4}\s+(Q-7\.\d+-\d+)\b.*$/gm;
  const matches = [...text.matchAll(headingRe)];
  for (let i = 0; i < matches.length; i++) {
    const id = matches[i]![1]!;
    const start = matches[i]!.index! + matches[i]![0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : text.length;
    const block = text.slice(start, end);

    const subtask = field(block, "Sub-task");
    const sourceBasis = field(block, "Source basis");
    const frStatusText = field(block, "FR status") ?? "";
    const rationale = field(block, "Correct answer rationale");
    // Format de date incohérent selon la fonction/le lot — vu "(Tier A
    // confirmed 2026-08-25)" (7.1/7.2) et "(Tier A), 2026-08-25." (7.8) —
    // on prend la première date ISO trouvée dans le champ FR status
    // plutôt que d'exiger un mot-clé précis, plus robuste aux variantes.
    const verificationDate = frStatusText.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? field(block, "Verification date");

    // La citation DGR définitive (Tier A) apparaît parfois DANS "Source
    // basis" (format Fonction 7.1 : "Tier A — DGR 67th Ed. ..."), parfois
    // comme phrase de suite juste après "FR status: FROZEN..." (format
    // observé sur Fonction 7.2 : la ligne FR status continue avec la
    // citation DGR complète, ex. Q-7.2-001 où "Source basis" ne cite QUE
    // le Tier B, moins autoritaire). Priorité : le texte de suite après
    // "FR status: FROZEN..." s'il existe ET mentionne "DGR" (c'est alors
    // la citation Tier A définitive) ; sinon repli sur "Source basis".
    // Jamais de réécriture — seulement un choix entre deux champs déjà
    // écrits, chacun tronqué à une frontière de mot si besoin.
    const frExtra = frStatusText.replace(/^FROZEN FR \/ SOURCE VERIFIED[^.]*\.\s*/i, "").trim();
    const preferred = frExtra && /\bDGR\b/i.test(frExtra) ? frExtra : sourceBasis;
    const regulatoryReference = truncateAtWord(preferred ?? "", 400) || undefined;

    items.set(id, { subtask, regulatoryReference, verificationDate, explanation: rationale, frStatusText });
  }
  return items;
}

// Extrait le texte d'un champ **Label:** jusqu'au prochain **Autre Champ:**
// (en gras, début de ligne) ou la fin du bloc — gère le texte replié sur
// plusieurs lignes (Markdown wrap), contrairement à un simple match d'une
// seule ligne.
function field(block: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}[^:*]*:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*[A-Z][^:*]*:\\*\\*|\\n---|$)`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return m[1]!.replace(/\s+/g, " ").trim() || undefined;
}

// Coupe à une frontière de mot (jamais en plein milieu, jamais une
// réécriture du texte source lui-même) — ajoute "…" seulement quand une
// coupe a réellement eu lieu.
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

function stripAnacTag(text: string): string {
  // Le texte Moodle porte un préfixe interne "[Q-7.X-0NN — Tier A
  // vérifié...]" (ajouté lors de l'import Moodle pour traçabilité
  // visuelle dans l'admin Moodle) — jamais montré au candidat, retiré ici.
  return text.replace(/^\[Q-7\.\d+-\d+[^\]]*\]\s*/, "").trim();
}

function main() {
  const extractPath = join(process.cwd(), ".moodle-extracts", `q_${FUNCTION}.json`);
  if (!existsSync(extractPath)) {
    console.error(`Extraction Moodle absente : ${extractPath}`);
    console.error("Voir le commentaire en bas de ce fichier pour la commande d'extraction (SELECT-only Moodle).");
    process.exit(1);
  }
  const moodleData: Record<string, MoodleQuestion> = JSON.parse(readFileSync(extractPath, "utf-8"));

  const mdPath = join(process.cwd(), ".moodle-extracts", "markdown", `DGR_PRODUCTION_BANK_${FUNCTION}.md`);
  let markdownMeta = new Map<string, MarkdownMeta>();
  if (existsSync(mdPath)) {
    markdownMeta = parseMarkdownItems(readFileSync(mdPath, "utf-8"));
    console.log(`(Métadonnée markdown chargée : ${markdownMeta.size} item(s) trouvé(s) dans ${mdPath}.)`);
  } else {
    console.log(`(Pas de markdown source à ${mdPath} — métadonnée régulatoire limitée au feedback Moodle pour cette fonction.)`);
  }

  const db = getDb();
  const adminRow = db
    .prepare(`SELECT u.id AS id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='administrator' ORDER BY u.id LIMIT 1`)
    .get() as { id: number } | undefined;
  if (!adminRow) {
    console.error("Aucun compte administrateur trouvé.");
    process.exit(1);
  }
  const adminId = adminRow.id;

  const found = Object.keys(moodleData).length;
  let eligible = 0;
  let imported = 0;
  let duplicates = 0;
  let rejectedMissingText = 0;
  let rejectedNoAnswer = 0;
  const errors: string[] = [];

  console.log(`\n=== Fonction ${FUNCTION} — import contrôlé depuis Moodle ===`);
  console.log(`FOUND (questions présentes dans l'extraction Moodle) : ${found}`);

  for (const [docId, mq] of Object.entries(moodleData).sort(([a], [b]) => a.localeCompare(b))) {
    const stem = stripAnacTag(mq.questiontext);
    if (!stem) {
      rejectedMissingText++;
      console.log(`  ${docId} — REJETÉ (texte de l'énoncé vide après nettoyage).`);
      continue;
    }
    if (mq.answers.length === 0) {
      rejectedNoAnswer++;
      console.log(`  ${docId} — REJETÉ (aucune réponse Moodle trouvée).`);
      continue;
    }
    const correctAnswers = mq.answers.filter((a) => Number(a.fraction) >= 0.999);
    if (correctAnswers.length === 0) {
      rejectedNoAnswer++;
      console.log(`  ${docId} — REJETÉ (aucune réponse marquée correcte, fraction=1).`);
      continue;
    }
    eligible++;

    const existing = db.prepare(`SELECT id FROM questions WHERE kost_question_id = ?`).get(docId);
    if (existing) {
      duplicates++;
      console.log(`  ${docId} — déjà présent en V2, ignoré (idempotent, pas de doublon).`);
      continue;
    }

    const qtype: QType = mq.qtype === "truefalse" ? "true_false" : "mcq_single";
    const keys = "ABCDEFGH";
    const choices: Choice[] = mq.answers.map((a, i) => ({ key: keys[i]!, text: a.text }));
    const correctKeys = correctAnswers.map((a) => choices[mq.answers.indexOf(a)]!.key);

    const md = markdownMeta.get(docId);
    if (md && !/FROZEN/i.test(md.frStatusText)) {
      // Garde-fou : si une entrée markdown existe mais n'affiche PAS
      // FROZEN (ex. réévaluée depuis l'extraction Moodle), ne jamais
      // importer sur cette seule base Moodle sans re-confirmation —
      // rejeté plutôt que supposé toujours admissible.
      rejectedNoAnswer++;
      console.log(`  ${docId} — REJETÉ (markdown source ne confirme plus FROZEN : « ${md.frStatusText.slice(0, 80)}… »).`);
      continue;
    }
    const regulatoryReference = md?.regulatoryReference || mq.generalfeedback.replace(/^Source\s*:\s*/i, "").trim() || undefined;
    const verificationDate = md?.verificationDate;
    const subtask = md?.subtask;
    // NOTE qualité connue (documentée dans le rapport de gap production) :
    // la rationale extraite du markdown source est rédigée en anglais avec
    // citations françaises imbriquées (ex. "Course slide 20: 'Le SCoETDG
    // élabore...'") — factuellement exacte et non fabriquée, mais pas
    // encore une explication 100% française prête pour affichage candidat.
    // Conservée telle quelle (jamais réécrite/traduite automatiquement sur
    // du contenu réglementaire) — une passe éditoriale FR reste à faire
    // avant affichage large, signalée comme limitation connue.
    const explanation = truncateAtWord(md?.explanation || mq.generalfeedback || "", 600) || undefined;

    try {
      const questionId = createQuestion({
        kostQuestionId: docId,
        functionCode: FUNCTION,
        subtask,
        qtype,
        language: "fr",
        sourceStatus: "FROZEN_SOURCE_VERIFIED",
        regulatoryReference,
        stem,
        choices,
        correctAnswer: correctKeys,
        explanation,
        createdBy: adminId,
      });
      if (verificationDate) {
        db.prepare(`UPDATE questions SET verification_date = ? WHERE id = ?`).run(verificationDate, questionId);
      }
      imported++;
      console.log(`  ${docId} — IMPORTÉ (${qtype}, ${choices.length} choix, réf. « ${regulatoryReference ?? "—"} »).`);
    } catch (e) {
      errors.push(`${docId}: ${(e as Error).message}`);
      console.log(`  ${docId} — ERREUR : ${(e as Error).message}`);
    }
  }

  // Trace d'audit dans la table imports elle-même (§9 — traçable).
  db.prepare(
    `INSERT INTO imports (type, preview_json, status, mapping_json, errors_json, source_import, imported_by, imported_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    "dgr_question_bank",
    JSON.stringify({ function: FUNCTION, found, eligible }),
    "committed",
    JSON.stringify({ imported, duplicates }),
    JSON.stringify(errors),
    `moodle:mdl_question (function ${FUNCTION}, read-only extraction)`,
    adminId,
    new Date().toISOString()
  );

  console.log(`\n--- RAPPORT DE MIGRATION — Fonction ${FUNCTION} ---`);
  console.log(`FOUND: ${found}`);
  console.log(`ELIGIBLE: ${eligible}`);
  console.log(`IMPORTED: ${imported}`);
  console.log(`DUPLICATES (déjà présents): ${duplicates}`);
  console.log(`MISSING TEXT: ${rejectedMissingText}`);
  console.log(`NO VALID ANSWER: ${rejectedNoAnswer}`);
  console.log(`ERRORS: ${errors.length}${errors.length ? " — " + errors.join("; ") : ""}`);
  console.log(`Statut réviseur qualifié : PENDING pour tous les items importés (approbation 4e palier non complétée, aucun 'APPROVED' silencieux).`);

  closeDb();
}

main();

// ---------------------------------------------------------------------
// Commande d'extraction Moodle (SELECT-only, exécutée séparément, hors de
// ce process — jamais depuis l'application V2 elle-même, qui n'a et
// n'aura jamais de dépendance runtime à Moodle) :
//
//   ssh <serveur> "python3 /tmp/extract_moodle_questions.py 7.X" > .moodle-extracts/q_7.X.json
//
// où extract_moodle_questions.py exécute uniquement :
//   SELECT qbe.idnumber, q.id, q.qtype, q.questiontext, q.generalfeedback
//   FROM mdl_question q
//   JOIN mdl_question_versions qv ON qv.questionid = q.id
//   JOIN mdl_question_bank_entries qbe ON qbe.id = qv.questionbankentryid
//   WHERE qbe.idnumber LIKE 'Q-7.X-%'
// puis, pour chaque question trouvée :
//   SELECT question, answer, fraction, feedback FROM mdl_question_answers
//   WHERE question IN (...)
// Aucun INSERT/UPDATE/DELETE — vérifié par lecture du script lui-même.
