import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { guardPage } from "@/lib/rbac";
import { getAssessment, isAssessmentOpenNow } from "@/lib/assessments";
import { getActiveAttempt, startAttempt, countFinishedAttempts, AttemptError } from "@/lib/attempts";
import { functionLabel } from "@/lib/questions";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Clock, ListChecks } from "lucide-react";

export default async function InstructionsPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const session = await guardPage("candidate");
  const { assessmentId } = await params;
  const assessment = getAssessment(Number(assessmentId));
  if (!assessment) notFound();

  const active = getActiveAttempt(assessment.id, session.userId);
  if (active) redirect(`/exam/${assessment.id}/attempt`);

  const finished = countFinishedAttempts(assessment.id, session.userId);
  const canStart = isAssessmentOpenNow(assessment) && (assessment.attempts_allowed === 0 || finished < assessment.attempts_allowed);

  async function begin() {
    "use server";
    const s = await guardPage("candidate");
    const h = await headers();
    try {
      startAttempt(assessment!.id, s.userId, {
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: h.get("user-agent") ?? undefined,
      });
    } catch (err) {
      if (err instanceof AttemptError) redirect(`/exam/${assessment!.id}/instructions?error=${encodeURIComponent(err.message)}`);
      throw err;
    }
    redirect(`/exam/${assessment!.id}/attempt`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <h1 className="font-display text-[19px] font-semibold text-text-primary">{assessment.name}</h1>
        <p className="mt-1 text-[13px] text-text-tertiary capitalize">{assessment.type} — {functionLabel(assessment.function_code)}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-md bg-surface-sunken py-3">
            <ListChecks size={16} className="mx-auto text-accent-9" />
            <p className="mt-1.5 text-[15px] font-semibold text-text-primary">{assessment.question_count}</p>
            <p className="text-[11px] text-text-tertiary">questions</p>
          </div>
          <div className="rounded-md bg-surface-sunken py-3">
            <Clock size={16} className="mx-auto text-accent-9" />
            <p className="mt-1.5 text-[15px] font-semibold text-text-primary">{assessment.duration_minutes}</p>
            <p className="text-[11px] text-text-tertiary">minutes</p>
          </div>
          <div className="rounded-md bg-surface-sunken py-3">
            <ShieldCheck size={16} className="mx-auto text-accent-9" />
            <p className="mt-1.5 text-[15px] font-semibold text-text-primary">{assessment.attempts_allowed === 0 ? "∞" : assessment.attempts_allowed}</p>
            <p className="text-[11px] text-text-tertiary">tentative(s)</p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-border-subtle p-3.5 text-[12.5px] leading-relaxed text-text-secondary">
          <p>Une fois commencé, le chronomètre ne s&apos;arrête plus — il continue même en cas de rafraîchissement, fermeture ou perte de connexion.</p>
          <p className="mt-1.5">À expiration, l&apos;examen est soumis automatiquement, même si vous n&apos;avez pas terminé.</p>
          <p className="mt-1.5">Seuil de réussite : {assessment.pass_threshold_pct}% (paramètre KOST, non un standard IATA universel).</p>
        </div>

        {canStart ? (
          <form action={begin} className="mt-5">
            <button type="submit" className="w-full rounded-md bg-accent-9 py-2.5 text-[14px] font-semibold text-white hover:bg-accent-10">
              Commencer l&apos;examen
            </button>
          </form>
        ) : (
          <p className="mt-5 text-[13px] text-status-critical-text">Cet examen n&apos;est pas disponible actuellement (fermé, ou tentatives épuisées).</p>
        )}
      </Card>
    </div>
  );
}
