"use server";

import { requireRole } from "@/lib/rbac";
import { getQuestionById, getCurrentVersion, formatCorrectAnswerForDisplay } from "@/lib/questions";
import { gradeOneQuestion } from "@/lib/grading";
import { audit } from "@/lib/audit";

export interface TestGradeResult {
  error?: string;
  pending?: boolean;
  isCorrect?: boolean;
  correctAnswerDisplay?: string;
}

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §12/§14 — appelée directement (pas via <form action>, la réponse locale
// n'est pas toujours une simple FormData — matching/ordering/scenario sont
// des objets) depuis TestQuestionRunner.tsx. Réservée à l'administrateur,
// même périmètre que /question-bank/[id]/edit (voir ce fichier — "plus
// sensible que la simple saisie initiale contrôlée"). Zéro écriture DB —
// gradeOneQuestion (lib/grading.ts) est une fonction PURE déjà utilisée
// par la notation réelle ; aucune ligne attempts/attempt_answers/results
// n'est jamais touchée ici, aucun statut de question modifié, aucun email.
// L'audit ci-dessous trace QU'un test a eu lieu (traçabilité — cohérent
// avec la discipline d'audit du reste de la plateforme) sans jamais
// enregistrer la réponse testée ni la correction elle-même.
export async function testGradeQuestionAction(questionId: number, answerJson: string): Promise<TestGradeResult> {
  const session = await requireRole("administrator");

  const question = getQuestionById(questionId);
  if (!question) return { error: "Question introuvable." };
  const version = getCurrentVersion(questionId);
  if (!version) return { error: "Cette question n'a aucune version courante." };

  let parsedAnswer: unknown;
  try {
    parsedAnswer = JSON.parse(answerJson);
  } catch {
    return { error: "Réponse invalide." };
  }

  const gradeResult = gradeOneQuestion(question.qtype, version.correct_answer, JSON.stringify(parsedAnswer));

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "question_tested",
    targetType: "question",
    targetId: questionId,
    metadata: { kostQuestionId: question.kost_question_id, qtype: question.qtype },
  });

  if (gradeResult.pending) return { pending: true };

  const choices = JSON.parse(version.choices_json);
  return {
    isCorrect: gradeResult.isCorrect,
    correctAnswerDisplay: formatCorrectAnswerForDisplay(question.qtype, JSON.parse(version.correct_answer), choices),
  };
}
