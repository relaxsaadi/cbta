import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listAssignedAssessmentsForCandidate } from "@/lib/assessments";
import { getActiveAttempt, countFinishedAttempts, sweepExpiredAttempts } from "@/lib/attempts";
import { computeCandidateExamState, getLatestAttemptInfo, type CandidateExamStateKind } from "@/lib/candidate-exam-state";
import { functionLabel } from "@/lib/questions";
import { listMyIncidents } from "@/lib/incidents";
import { INCIDENT_TYPES } from "@/lib/incident-constants";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { DeclareIncidentModal } from "@/components/candidate/DeclareIncidentModal";
import { BookOpenCheck } from "lucide-react";

const INCIDENT_STATUS_BADGE: Record<string, BadgeStatus> = {
  open: "critical",
  investigating: "warning",
  resolved: "verified",
  closed: "neutral",
};
const INCIDENT_STATUS_LABEL: Record<string, string> = {
  open: "Ouvert",
  investigating: "En cours d'investigation",
  resolved: "Résolu",
  closed: "Clôturé",
};

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §2 — bug réel
// diagnostiqué (root cause avant tout changement de code, voir le rapport
// final) : un examen affecté pouvait s'afficher sans AUCUNE action
// utilisable ni explication, notamment un examen suspendu qui disparaissait
// purement et simplement du tableau de bord (voir le correctif jumeau dans
// lib/assessments.ts::listAssignedAssessmentsForCandidate). Chaque carte
// affiche maintenant un état explicite (lib/candidate-exam-state.ts,
// fonction pure et testée) — jamais un texte générique "Indisponible" sans
// raison.
const BADGE_VARIANT: Record<CandidateExamStateKind, BadgeStatus> = {
  suspended: "critical",
  not_published: "neutral",
  in_progress: "warning",
  awaiting_review: "warning",
  result_available: "verified",
  finished: "neutral",
  not_yet_open: "neutral",
  window_closed: "neutral",
  available: "verified",
};

export default async function MesExamensPage() {
  const session = await guardPage("candidate");
  // Balayage opportuniste (§8) — auto-soumet toute tentative de CE
  // candidat dont le temps est dépassé même s'il n'a pas rouvert
  // l'examen, avant d'afficher son tableau de bord.
  sweepExpiredAttempts();

  const assessments = listAssignedAssessmentsForCandidate(session.userId);
  // §24/§28 — "avant l'examen" (aucun attemptId : pas encore de tentative
  // précise à associer) + liste en lecture seule des incidents DÉJÀ
  // déclarés par CE candidat (lib/incidents.ts::listMyIncidents — jamais
  // ceux d'un autre candidat, jamais les notes internes/preuves
  // d'investigation, voir son propre commentaire).
  const myIncidents = listMyIncidents(session.userId);
  const incidentTypeLabel = new Map(INCIDENT_TYPES.map((t) => [t.value, t.label]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Mes examens</h1>
        <DeclareIncidentModal />
      </div>

      <Card>
        {assessments.length === 0 ? (
          <EmptyState icon={BookOpenCheck} title="Aucun examen affecté" description="Votre responsable pédagogique vous affectera un examen prochainement." />
        ) : (
          <div className="flex flex-col gap-2">
            {assessments.map((a) => {
              const finished = countFinishedAttempts(a.id, session.userId);
              const latest = getLatestAttemptInfo(a.id, session.userId);
              const state = computeCandidateExamState(a, latest, finished);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-3">
                  <div>
                    <p className="text-[13.5px] font-medium text-text-primary">{a.name}</p>
                    <p className="text-[12px] text-text-tertiary capitalize">
                      {a.type} — {functionLabel(a.function_code)} — {a.question_count} questions, {a.duration_minutes} min
                    </p>
                    {state.reason && <p className="mt-1 text-[12px] text-text-secondary">{state.reason}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={BADGE_VARIANT[state.kind]}>{state.label}</StatusBadge>
                    {state.cta?.kind === "resume" && (
                      <Link href={`/exam/${a.id}/attempt`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10">
                        {state.cta.label}
                      </Link>
                    )}
                    {state.cta?.kind === "start" && (
                      <Link href={`/exam/${a.id}/instructions`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10">
                        {state.cta.label}
                      </Link>
                    )}
                    {state.cta?.kind === "view_result" && (
                      <Link href="/mes-resultats" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
                        {state.cta.label}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {myIncidents.length > 0 && (
        <Card>
          <CardHeader title="Mes incidents déclarés" description="Statut de vos signalements — un responsable pédagogique traite chaque incident." />
          <div className="flex flex-col gap-2">
            {myIncidents.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{incidentTypeLabel.get(i.type) ?? i.type}</p>
                  <p className="text-[11.5px] text-text-tertiary">{new Date(i.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <StatusBadge status={INCIDENT_STATUS_BADGE[i.status] ?? "neutral"}>{INCIDENT_STATUS_LABEL[i.status] ?? i.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
