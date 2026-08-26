import { notFound, redirect } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getAssessment } from "@/lib/assessments";
import { getActiveAttempt, getAttemptQuestions } from "@/lib/attempts";
import { ExamRunner } from "./ExamRunner";

export default async function AttemptPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const session = await guardPage("candidate");
  const { assessmentId } = await params;
  const assessment = getAssessment(Number(assessmentId));
  if (!assessment) notFound();

  const attempt = getActiveAttempt(assessment.id, session.userId);
  if (!attempt) redirect(`/exam/${assessment.id}/instructions`);

  const questions = getAttemptQuestions(attempt.id);

  return (
    <ExamRunner
      attemptId={attempt.id}
      assessmentId={assessment.id}
      expiresAt={attempt.expires_at}
      questionCount={questions.length}
      initialQuestions={questions}
      assessmentName={assessment.name}
    />
  );
}
