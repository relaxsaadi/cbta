// Sync incrémental et idempotent du programme de questions DGR Tier A vers
// la banque V2 — mission "RENDRE KOST E-EXAM V2 OPÉRATIONNEL AVEC LES 244
// QUESTIONS DGR CONFIRMÉES" §11-12. Remplace l'exécution manuelle
// fonction-par-fonction de import-dgr-from-moodle.ts pour tout lot Tier A
// qui n'existe QUE sous forme markdown (pas encore dans Moodle) — ce script
// ne lit ni n'écrit jamais Moodle.
//
// Étapes obligatoires (§11) : PREVIEW → NEW → UPDATED VERSION → SKIPPED →
// BLOCKED → IMPORT, une seule fonction/lot à la fois, jamais de
// fabrication de contenu pour atteindre un total cible.
//
// Idempotence : ré-exécuter avec le MÊME fichier candidats ne crée jamais
// de doublon (clé stable = kost_question_id) et ne modifie jamais un
// examen déjà publié (assessment_question_snapshots référence un
// version_id figé — addQuestionVersion n'écrit jamais sur une version
// existante, uniquement une nouvelle ligne + un pointeur mis à jour sur
// `questions.current_version_id`, voir lib/questions.ts).
//
// Entrée : un fichier JSON "enveloppe" { meta, candidates: [...] } produit
// par un extracteur séparé (ex. scripts/extract-tier-a-candidates.py, qui
// documente lui-même comment il lit les sources markdown/CSV du programme
// Tier A — jamais depuis ce process, mêmes principes de séparation que
// l'extraction Moodle SELECT-only de import-dgr-from-moodle.ts). Chaque
// candidat DOIT porter source_status:'FROZEN_SOURCE_VERIFIED' — tout autre
// statut (DRAFT/PARTIAL/STALE/SOURCE_GAP/SOURCE_CONFLICT) est BLOCKED ici
// même s'il apparaît dans le fichier d'entrée (garde-fou §5, appliqué au
// niveau de l'outil, pas seulement documenté).
//
// Usage :
//   npx tsx scripts/sync-tier-a-questions.ts <candidates.json>            # PREVIEW seul, aucune écriture
//   npx tsx scripts/sync-tier-a-questions.ts <candidates.json> --commit   # exécute réellement l'IMPORT
import { readFileSync } from "node:fs";
import { getDb, closeDb, nowIso } from "../lib/db";
import { createQuestion, addQuestionVersion, getCurrentVersion, type Choice, type QType } from "../lib/questions";

interface Candidate {
  kost_question_id: string;
  function_code: string;
  subtask?: string | null;
  qtype: string;
  source_status: string;
  stem?: string | null;
  choices: Choice[];
  correct_answer: string[];
  explanation?: string | null;
  source_reference?: string | null;
}

interface Envelope {
  meta: Record<string, unknown>;
  candidates: Candidate[];
  blocked?: { kost_id: string; reason: string }[];
}

const CANDIDATES_PATH = process.argv[2] ?? "";
const COMMIT = process.argv.includes("--commit");

if (!CANDIDATES_PATH) {
  console.error("Usage: npx tsx scripts/sync-tier-a-questions.ts <candidates.json> [--commit]");
  process.exit(1);
}

const VALID_QTYPES: QType[] = ["mcq_single", "mcq_multi", "true_false"];

function validate(c: Candidate): string[] {
  const problems: string[] = [];
  if (c.source_status !== "FROZEN_SOURCE_VERIFIED") {
    problems.push(`source_status is '${c.source_status}', not FROZEN_SOURCE_VERIFIED — never imported into the active bank`);
  }
  if (!VALID_QTYPES.includes(c.qtype as QType)) {
    problems.push(`unrecognized qtype '${c.qtype}'`);
  }
  if (!c.stem || c.stem.trim().length < 5) {
    problems.push("missing/too-short stem");
  }
  if (!Array.isArray(c.choices) || c.choices.length < 2) {
    problems.push(`only ${c.choices?.length ?? 0} choice(s)`);
  }
  const choiceKeys = new Set((c.choices ?? []).map((ch) => ch.key));
  if (!Array.isArray(c.correct_answer) || c.correct_answer.length < 1) {
    problems.push("no correct_answer");
  } else {
    if (c.qtype !== "mcq_multi" && c.correct_answer.length !== 1) {
      problems.push(`expected exactly 1 correct answer for ${c.qtype}, found ${c.correct_answer.length}`);
    }
    for (const k of c.correct_answer) {
      if (!choiceKeys.has(k)) problems.push(`correct_answer key '${k}' not among choices`);
    }
  }
  if (!/^7\.(?:[1-9]|10)$/.test(c.function_code)) {
    problems.push(`invalid function_code '${c.function_code}'`);
  }
  return problems;
}

function contentEquals(current: { stem: string; choices_json: string; correct_answer: string }, c: Candidate): boolean {
  const curChoices = JSON.parse(current.choices_json) as Choice[];
  const curCorrect = JSON.parse(current.correct_answer) as string[];
  return (
    current.stem === c.stem &&
    JSON.stringify(curChoices) === JSON.stringify(c.choices) &&
    JSON.stringify([...curCorrect].sort()) === JSON.stringify([...c.correct_answer].sort())
  );
}

function main() {
  const envelope: Envelope = JSON.parse(readFileSync(CANDIDATES_PATH, "utf-8"));
  const candidates = envelope.candidates;

  console.log(`=== Sync Tier A — ${COMMIT ? "IMPORT (commit réel)" : "PREVIEW (aucune écriture)"} ===`);
  console.log(`Source : ${envelope.meta.source_branch ?? "?"} @ ${envelope.meta.source_commit ?? "?"}`);
  console.log(`Candidats en entrée : ${candidates.length}`);
  if (envelope.blocked?.length) {
    console.log(`Déjà BLOCKED par l'extracteur (avant même ce script) : ${envelope.blocked.length}`);
  }
  console.log();

  const db = getDb();
  const adminRow = db
    .prepare(
      `SELECT u.id AS id FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='administrator' ORDER BY u.id LIMIT 1`
    )
    .get() as { id: number } | undefined;
  if (!adminRow) {
    console.error("Aucun compte administrateur trouvé — abandon.");
    process.exit(1);
  }
  const adminId = adminRow.id;

  const results = { NEW: [] as string[], UPDATED: [] as string[], SKIPPED: [] as string[], BLOCKED: [] as { id: string; reason: string }[] };

  for (const c of candidates) {
    const problems = validate(c);
    if (problems.length > 0) {
      results.BLOCKED.push({ id: c.kost_question_id, reason: problems.join("; ") });
      console.log(`  ${c.kost_question_id} — BLOCKED (${problems.join("; ")})`);
      continue;
    }

    const existing = db
      .prepare(`SELECT id, current_version_id FROM questions WHERE kost_question_id = ?`)
      .get(c.kost_question_id) as { id: number; current_version_id: number | null } | undefined;

    if (!existing) {
      results.NEW.push(c.kost_question_id);
      console.log(`  ${c.kost_question_id} — NEW${COMMIT ? "" : " (preview)"}`);
      if (COMMIT) {
        createQuestion({
          kostQuestionId: c.kost_question_id,
          functionCode: c.function_code,
          subtask: c.subtask ?? undefined,
          qtype: c.qtype as QType,
          language: "fr",
          sourceStatus: "FROZEN_SOURCE_VERIFIED",
          regulatoryReference: c.source_reference ?? undefined,
          stem: c.stem!,
          choices: c.choices,
          correctAnswer: c.correct_answer,
          explanation: c.explanation ?? undefined,
          createdBy: adminId,
        });
      }
      continue;
    }

    const currentVersion = getCurrentVersion(existing.id);
    if (currentVersion && contentEquals(currentVersion, c)) {
      results.SKIPPED.push(c.kost_question_id);
      console.log(`  ${c.kost_question_id} — SKIPPED (déjà présent, contenu identique, idempotent)`);
      continue;
    }

    // Contenu différent d'une version déjà existante — nouvelle version,
    // jamais un UPDATE (§4/§9 : un examen déjà publié référence l'ancien
    // version_id, jamais réécrit).
    results.UPDATED.push(c.kost_question_id);
    console.log(`  ${c.kost_question_id} — UPDATED VERSION${COMMIT ? "" : " (preview)"} (contenu source a changé depuis la version courante)`);
    if (COMMIT) {
      addQuestionVersion(existing.id, { stem: c.stem!, choices: c.choices, correctAnswer: c.correct_answer, explanation: c.explanation ?? undefined }, adminId);
    }
  }

  console.log(`\n--- RAPPORT DE SYNC ${COMMIT ? "(committed)" : "(preview)"} ---`);
  console.log(`NEW: ${results.NEW.length}`);
  console.log(`UPDATED VERSION: ${results.UPDATED.length}`);
  console.log(`SKIPPED (déjà présents, inchangés): ${results.SKIPPED.length}`);
  console.log(`BLOCKED: ${results.BLOCKED.length}`);
  if (results.BLOCKED.length) {
    for (const b of results.BLOCKED) console.log(`  - ${b.id}: ${b.reason}`);
  }

  if (COMMIT) {
    db.prepare(
      `INSERT INTO imports (type, preview_json, status, mapping_json, errors_json, source_import, imported_by, imported_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "tier_a_incremental_sync",
      JSON.stringify({ candidates: candidates.length, meta: envelope.meta }),
      "committed",
      JSON.stringify({ new: results.NEW, updated: results.UPDATED, skipped: results.SKIPPED }),
      JSON.stringify(results.BLOCKED),
      `tier-a-docs:${envelope.meta.source_branch}@${envelope.meta.source_commit}`,
      adminId,
      nowIso()
    );
    console.log("\nAudit trail écrit dans la table `imports`.");
  } else {
    console.log("\nMode PREVIEW — aucune écriture en base. Relancer avec --commit pour appliquer.");
  }

  closeDb();
}

main();
