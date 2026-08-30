import { guardPage } from "@/lib/rbac";
import { listPendingManualGrading, listPendingScenarioSubquestions } from "@/lib/manual-grading";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";
import { GradeAnswerForm } from "./GradeAnswerForm";
import { GradeScenarioSubAnswerForm } from "./GradeScenarioSubAnswerForm";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §55-57, étendue
// par "MISSION FINALE CIBLÉE" (2026-08-30) §5/§9-15 — deux files DISTINCTES :
// questions 'short_answer' autonomes en mode 'manual' (section historique,
// inchangée) et sous-questions 'short_answer' manuelles EMBARQUÉES dans un
// scénario (nouvelle section, voir lib/manual-grading.ts::
// listPendingScenarioSubquestions). Auditeur : lecture seule structurelle
// sur les deux — aucun formulaire de notation ne lui est proposé (même
// convention que /notifications, /exam-preparation...).
export default async function GradingPage({ searchParams }: { searchParams: Promise<{ graded?: string; finalized?: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const canWrite = session.role !== "auditor";
  const groupIds = scopedGroupIdsOrNull(session);
  const pending = listPendingManualGrading(groupIds);
  const pendingScenario = listPendingScenarioSubquestions(groupIds);
  const { graded, finalized } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Correction manuelle</h1>

      {graded === "1" && (
        <div className="rounded-md border border-status-verified-border bg-status-verified-bg px-4 py-3 text-[13px] text-status-verified-text">
          {finalized === "1" ? "Réponse corrigée — résultat finalisé et notifié." : "Réponse corrigée."}
        </div>
      )}

      <Card>
        <CardHeader title={`${pending.length} réponse(s) en attente de correction`} description="Questions à réponse courte en mode correction manuelle, uniquement pour des tentatives déjà envoyées." />
        {pending.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Aucune correction en attente" description="Toutes les réponses à correction manuelle ont été traitées." />
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((p) => (
              <div key={p.attempt_answer_id} className="rounded-md border border-border-subtle p-3.5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{p.candidate_name}</p>
                    <p className="text-[11.5px] text-text-tertiary">
                      {p.company_name} — {p.group_name} — {p.assessment_name} ({p.function_code})
                    </p>
                  </div>
                  <p className="text-[11px] text-text-tertiary">{p.submitted_at ? new Date(p.submitted_at).toLocaleString("fr-FR") : "—"}</p>
                </div>
                <p className="mb-2 text-[13px] text-text-primary">{p.stem}</p>
                <p className="mb-3 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12.5px] text-text-secondary">
                  Réponse du candidat : <span className="font-medium text-text-primary">{p.candidate_answer || "—"}</span>
                </p>
                {canWrite && <GradeAnswerForm attemptQuestionId={p.attempt_question_id} />}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title={`${pendingScenario.length} sous-question(s) de scénario en attente de correction`}
          description="Sous-questions à réponse courte en mode correction manuelle, embarquées dans un cas pratique/scénario."
        />
        {pendingScenario.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Aucune correction en attente" description="Toutes les sous-questions à correction manuelle ont été traitées." />
        ) : (
          <div className="flex flex-col gap-3">
            {pendingScenario.map((p) => (
              <div key={`${p.attempt_question_id}-${p.subquestion_id}`} className="rounded-md border border-border-subtle p-3.5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-text-primary">{p.candidate_name}</p>
                    <p className="text-[11.5px] text-text-tertiary">
                      {p.company_name} — {p.group_name} — {p.assessment_name} ({p.function_code}) — Scénario : {p.scenario_title}
                    </p>
                  </div>
                  <p className="text-[11px] text-text-tertiary">{p.submitted_at ? new Date(p.submitted_at).toLocaleString("fr-FR") : "—"}</p>
                </div>
                <p className="mb-2 text-[13px] text-text-primary">{p.subquestion_stem}</p>
                <p className="mb-3 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12.5px] text-text-secondary">
                  Réponse du candidat : <span className="font-medium text-text-primary">{p.candidate_answer || "—"}</span>
                </p>
                {canWrite && <GradeScenarioSubAnswerForm attemptQuestionId={p.attempt_question_id} subquestionId={p.subquestion_id} />}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
