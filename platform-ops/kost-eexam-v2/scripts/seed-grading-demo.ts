// Fixture DEMO dédiée à la correction manuelle (mission "ADMIN/CLIENT/
// CANDIDATE UX IMPROVEMENTS", §42, 2026-08-30) — séparée de
// scripts/seed-demo.ts pour NE PAS toucher son évaluation "DGR Fonction
// 7.1 — Test démo" (3 questions mcq_single exactement, déjà consommée par
// plusieurs scénarios E2E qui dépendent de ce nombre/type précis). Doit
// tourner APRÈS seed-demo.ts (réutilise son admin/responsable/groupe/
// candidat démo). scope='demo' partout, jamais mélangé à la production ni
// à la banque réglementaire réelle (question explicitement [DÉMO],
// jamais un contenu DGR vérifié).
//
// Crée :
//  1. Un candidat démo DÉDIÉ ("candidat.grading.demo") — JAMAIS
//     candidat1/2/3.demo, qui sont partagés et mutés destructivement par
//     de nombreux autres scénarios E2E (scenario-c/e/f/i/k/m/n/o) : y
//     laisser un résultat résiduel AWAITING_MANUAL_REVIEW casserait leurs
//     propres assertions sur /mes-résultats (bug réel rencontré en
//     validant ce script — voir scenario-c-candidate-flow.spec.ts, dont
//     la bannière de confirmation devenait ambiguë avec la carte "en
//     attente de correction" laissée par cette fixture). Même discipline
//     d'isolation que scripts/seed-email-demo.ts (candidat.e2e.activation/
//     candidat.e2e.isolation, jamais les comptes démo partagés).
//  2. Une question 'short_answer' en mode 'manual' (jamais auto-notée,
//     voir lib/questions.ts::ShortAnswerSpec) — Fonction 7.1, texte
//     fictif, dans une évaluation DÉDIÉE distincte de celle de
//     seed-demo.ts.
//  3. Une tentative RÉELLE et TERMINÉE de ce candidat dédié sur cette
//     évaluation, avec une réponse fournie — laissée volontairement en
//     AWAITING_MANUAL_REVIEW (aucune correction manuelle appliquée ici)
//     pour que /grading affiche immédiatement "1 réponse en attente" dans
//     un environnement de démo fraîchement seedé, sans exposer la moindre
//     PII réelle (compte de démo, jamais une vraie personne).
import { getDb, closeDb } from "../lib/db";
import { createUser, findUserByUsername } from "../lib/users";
import { getGroup, addCandidateToGroup } from "../lib/groups";
import { createQuestion, listQuestionsByFunction } from "../lib/questions";
import { createAssessmentDraft, publishAssessment, assignCandidatesToAssessment } from "../lib/assessments";
import { startAttempt, getAttemptQuestions, saveAnswer, submitAttempt } from "../lib/attempts";

function main() {
  const db = getDb();

  const admin = findUserByUsername("admin");
  const manager = findUserByUsername("responsable.demo");
  if (!admin || !manager) {
    throw new Error("seed-demo.ts doit tourner avant seed-grading-demo.ts (admin/responsable.demo introuvable(s)).");
  }
  const demoGroupRow = db.prepare(`SELECT id FROM groups WHERE name LIKE 'Air Algérie — DGR%'`).get() as { id: number } | undefined;
  if (!demoGroupRow) throw new Error("seed-demo.ts doit tourner avant seed-grading-demo.ts (groupe démo introuvable).");
  const demoGroup = getGroup(demoGroupRow.id);
  if (!demoGroup) throw new Error("groupe démo introuvable via getGroup().");

  let candidate = findUserByUsername("candidat.grading.demo");
  if (!candidate) {
    const candidateId = createUser({ username: "candidat.grading.demo", password: "ChangeMoi123!", fullName: "Farid Grading (démo)", role: "candidate" });
    addCandidateToGroup(demoGroup.id, candidateId, manager.id);
    candidate = findUserByUsername("candidat.grading.demo")!;
  }

  // --- 1. Question 'short_answer' manuelle dédiée (jamais mélangée aux
  // 3 questions mcq_single de seed-demo.ts) ---
  const kostId = "DEMO-GRADING-7.1-001";
  let gradingQuestionId = (db.prepare(`SELECT id FROM questions WHERE kost_question_id = ?`).get(kostId) as { id: number } | undefined)?.id;
  if (!gradingQuestionId) {
    gradingQuestionId = createQuestion({
      kostQuestionId: kostId,
      functionCode: "7.1",
      qtype: "short_answer",
      sourceStatus: "FROZEN_SOURCE_VERIFIED",
      stem: "[DÉMO] Expliquez brièvement pourquoi un colis endommagé de marchandises dangereuses doit être isolé avant toute autre action.",
      choices: [],
      correctAnswer: { mode: "manual" },
      regulatoryReference: "[DÉMO — contenu fictif, non réglementaire]",
      createdBy: admin.id,
    });
    console.log("1 question de démo (correction manuelle) créée pour la Fonction 7.1.");
  }

  // --- 2. Évaluation DÉDIÉE, distincte de "DGR Fonction 7.1 — Test démo" ---
  const existingAssessment = db.prepare(`SELECT id FROM assessments WHERE name = ?`).get("DGR Fonction 7.1 — Démo correction manuelle") as { id: number } | undefined;
  let assessmentId: number;
  let freshlyPublished = false;
  if (existingAssessment) {
    assessmentId = existingAssessment.id;
  } else {
    // questionSource: "manual" + manualQuestionIds (jamais "random") — le
    // Fonction 7.1 partage sa banque admissible avec les 3 questions
    // mcq_single de seed-demo.ts ; un tirage aléatoire pourrait piocher
    // l'une d'elles à la place de la question 'short_answer' ci-dessus,
    // ce qui ferait disparaître la correction manuelle attendue (bug réel
    // rencontré en validant ce script : grading_state ressortait
    // 'COMPLETE' au lieu de 'AWAITING_MANUAL_REVIEW').
    assessmentId = createAssessmentDraft({
      type: "test",
      name: "DGR Fonction 7.1 — Démo correction manuelle",
      functionCode: "7.1",
      groupId: demoGroup.id,
      questionSource: "manual",
      manualQuestionIds: [gradingQuestionId],
      questionCount: 1,
      durationMinutes: 15,
      passThresholdPct: 80,
      scope: "demo",
      createdBy: manager.id,
    });
    publishAssessment(assessmentId, manager.id);
    assignCandidatesToAssessment(assessmentId, [candidate.id], manager.id);
    freshlyPublished = true;
  }

  // --- 3. Tentative réelle, réponse fournie, JAMAIS corrigée ici ---
  const alreadyAttempted = db
    .prepare(`SELECT 1 FROM attempts WHERE assessment_id = ? AND candidate_user_id = ?`)
    .get(assessmentId, candidate.id);
  if (!alreadyAttempted && freshlyPublished) {
    const attempt = startAttempt(assessmentId, candidate.id, {});
    const questions = getAttemptQuestions(attempt.id);
    for (const q of questions) {
      saveAnswer(attempt.id, candidate.id, q.attempt_question_id, ["[DÉMO] Le contenu peut fuir ou réagir ; isoler le colis protège les personnes et le reste du fret avant toute inspection plus poussée."]);
    }
    submitAttempt(attempt.id, candidate.id);
    console.log("1 tentative de démo (candidat.grading.demo) soumise, en attente de correction manuelle.");
  }

  console.log("Fixture correction manuelle démo prête : voir /grading (admin/responsable.demo).");
  closeDb();
}

main();
