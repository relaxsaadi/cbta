import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listAssignedAssessmentsForCandidate, isAssessmentOpenNow } from "@/lib/assessments";
import { getActiveAttempt, countFinishedAttempts, sweepExpiredAttempts } from "@/lib/attempts";
import { functionLabel } from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { BookOpenCheck } from "lucide-react";

// Revue UX (mission "PRODUCTION READINESS" §22) — un examen affecté mais
// pas encore ouvert affichait auparavant le même badge "Fermé" opaque
// qu'un examen clôturé ou jamais publié, sans jamais montrer la date
// d'ouverture pourtant déjà configurée par le responsable (`open_at`) —
// un candidat n'avait aucun moyen de savoir s'il devait revenir plus tard
// ou si l'examen était simplement indisponible. Corrigé : distinction
// explicite des 3 cas (pas encore ouvert / clôturé / suspendu), date
// affichée en clair quand elle existe.
function statusLabel(a: { status: string; open_at: string | null; close_at: string | null }, openNow: boolean): string {
  if (a.status === "suspended") return "Suspendu";
  if (openNow) return "Ouvert";
  if (a.status === "closed") return "Clôturé";
  if (a.open_at && new Date(a.open_at).getTime() > Date.now()) {
    return `Ouvre le ${new Date(a.open_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`;
  }
  if (a.close_at && new Date(a.close_at).getTime() < Date.now()) return "Fenêtre fermée";
  return "Pas encore disponible";
}

export default async function MesExamensPage() {
  const session = await guardPage("candidate");
  // Balayage opportuniste (§8) — auto-soumet toute tentative de CE
  // candidat dont le temps est dépassé même s'il n'a pas rouvert
  // l'examen, avant d'afficher son tableau de bord.
  sweepExpiredAttempts();

  const assessments = listAssignedAssessmentsForCandidate(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Mes examens</h1>

      <Card>
        {assessments.length === 0 ? (
          <EmptyState icon={BookOpenCheck} title="Aucun examen affecté" description="Votre responsable pédagogique vous affectera un examen prochainement." />
        ) : (
          <div className="flex flex-col gap-2">
            {assessments.map((a) => {
              const active = getActiveAttempt(a.id, session.userId);
              const finished = countFinishedAttempts(a.id, session.userId);
              const canStart = isAssessmentOpenNow(a) && (a.attempts_allowed === 0 || finished < a.attempts_allowed);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-3">
                  <div>
                    <p className="text-[13.5px] font-medium text-text-primary">{a.name}</p>
                    <p className="text-[12px] text-text-tertiary capitalize">
                      {a.type} — {functionLabel(a.function_code)} — {a.question_count} questions, {a.duration_minutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status === "suspended" ? "critical" : isAssessmentOpenNow(a) ? "verified" : "neutral"}>
                      {statusLabel(a, isAssessmentOpenNow(a))}
                    </StatusBadge>
                    {active ? (
                      <Link href={`/exam/${a.id}/attempt`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10">
                        Reprendre
                      </Link>
                    ) : canStart ? (
                      <Link href={`/exam/${a.id}/instructions`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10">
                        Commencer
                      </Link>
                    ) : (
                      <span className="text-[12px] text-text-tertiary">
                        {finished > 0 && a.attempts_allowed !== 0 && finished >= a.attempts_allowed ? "Tentatives épuisées" : "Indisponible"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
