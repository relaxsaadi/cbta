import { notFound } from "next/navigation";
import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { getAssessment } from "@/lib/assessments";
import { getPreviewQuestions } from "@/lib/attempts";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { functionLabel } from "@/lib/questions";
import { getDb } from "@/lib/db";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eye } from "lucide-react";
import { PreviewRunner, type PreviewQuestion } from "./PreviewRunner";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §20-26 —
// "Prévisualiser comme candidat". SÉCURITÉ CENTRALE (§24) : jamais une
// vraie session candidat, jamais une impersonation — un responsable
// pédagogique/administrateur/auditeur voit exactement le RENDU d'un examen
// publié, sans qu'AUCUNE ligne attempts/attempt_answers/results ne soit
// jamais créée (voir lib/attempts.ts::getPreviewQuestions, qui lit
// uniquement assessment_question_snapshots — jamais attempt_questions).
// candidate ne peut structurellement jamais atteindre cette page
// (guardPage exclut "candidate" ci-dessous, §24 "candidate cannot invoke
// admin preview").
export default async function ApercuCandidatPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { assessmentId: assessmentIdRaw } = await params;
  const { candidateId: candidateIdRaw } = await searchParams;
  const assessmentId = Number(assessmentIdRaw);

  // Frontière multi-client (§21 "responsable may preview only if existing
  // scope permits") — introuvable, jamais "refusé" (même convention que
  // /results/[attemptId] pour ne jamais confirmer l'existence d'une
  // ressource hors périmètre à un rôle non autorisé, §24 "cross-tenant
  // preview denied").
  if (!hasAssessmentAccess(session, assessmentId)) notFound();
  const assessment = getAssessment(assessmentId);
  if (!assessment) notFound();

  // L'aperçu lit assessment_question_snapshots, qui n'existe qu'après
  // publication (voir lib/assessments.ts::publishAssessment) — un examen
  // encore en brouillon n'a simplement rien à prévisualiser de cette
  // façon (l'aperçu minimal du formulaire d'auteurage,
  // CreateQuestionForm.tsx, couvre déjà ce cas en amont).
  if (assessment.status === "draft") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Aperçu candidat</h1>
        <Card>
          <EmptyState icon={Eye} title="Examen pas encore publié" description="L'aperçu candidat n'est disponible qu'une fois l'examen publié (la structure figée n'existe pas avant)." />
        </Card>
      </div>
    );
  }

  const questions = getPreviewQuestions(assessmentId) as unknown as PreviewQuestion[];

  // Contexte candidat OPTIONNEL (§26 "Allow selecting: demo candidate/
  // context") — purement informatif (le rendu ne dépend jamais du
  // candidat choisi, aucune réponse réelle n'est jamais lue) : vérifie
  // seulement qu'il est réellement affecté à CET examen, pour ne jamais
  // afficher un nom sans rapport dans la bannière.
  let candidateLabel: string | null = null;
  if (candidateIdRaw) {
    const candidateId = Number(candidateIdRaw);
    const row = getDb()
      .prepare(`SELECT u.full_name FROM assessment_assignments aa JOIN users u ON u.id = aa.candidate_user_id WHERE aa.assessment_id = ? AND aa.candidate_user_id = ?`)
      .get(assessmentId, candidateId) as { full_name: string } | undefined;
    candidateLabel = row?.full_name ?? null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Aperçu candidat</h1>
          <p className="text-[12.5px] text-text-tertiary">{assessment.name} — {functionLabel(assessment.function_code)}</p>
        </div>
        <Link href={`/exam-preparation/${assessmentId}`} className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">
          ← Retour à l&apos;examen
        </Link>
      </div>

      {questions.length === 0 ? (
        <Card>
          <EmptyState icon={Eye} title="Aucune question" description="Cet examen publié ne porte aucune question figée à prévisualiser." />
        </Card>
      ) : (
        <PreviewRunner
          assessmentName={assessment.name}
          functionLabel={functionLabel(assessment.function_code)}
          durationMinutes={assessment.duration_minutes}
          questions={questions}
          candidateLabel={candidateLabel}
        />
      )}
    </div>
  );
}
