import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import {
  listPendingManualGrading,
  listPendingScenarioSubquestions,
  listGradedManually,
  listGradedScenarioSubquestions,
  type ManualGradingFilters,
} from "@/lib/manual-grading";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listAssessments, listAssessmentsForManager } from "@/lib/assessments";
import { listCandidateOptions } from "@/lib/results";
import { listFunctions } from "@/lib/functions";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";
import { GradeAnswerForm } from "./GradeAnswerForm";
import { GradeScenarioSubAnswerForm } from "./GradeScenarioSubAnswerForm";

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §55-57, étendue
// par "MISSION FINALE CIBLÉE" (2026-08-30) §5/§9-15 et par "ADMIN/CLIENT/
// CANDIDATE UX IMPROVEMENTS" (2026-08-30) §16 — deux files DISTINCTES :
// questions 'short_answer' autonomes en mode 'manual' et sous-questions
// 'short_answer' manuelles EMBARQUÉES dans un scénario. Auditeur : lecture
// seule structurelle sur les deux (même convention que /notifications,
// /exam-preparation...).
interface GradingSearchParams {
  graded?: string;
  finalized?: string;
  type?: string; // "tous" (défaut) | "court" | "scenario"
  status?: string; // "a_corriger" (défaut) | "corrige"
  companyId?: string;
  groupId?: string;
  functionCode?: string;
  assessmentId?: string;
  candidateUserId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function GradingPage({ searchParams }: { searchParams: Promise<GradingSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const canWrite = session.role !== "auditor";
  const isManager = session.role === "pedagogical_manager";
  const groupIds = scopedGroupIdsOrNull(session);
  const sp = await searchParams;

  // §15 — le compte global en tête de page reste TOUJOURS le vrai total non
  // filtré (jamais recalculé sur la vue filtrée ci-dessous) : c'est
  // exactement ce que le bug d'origine («jamais montrer 0 alors qu'il reste
  // du travail ailleurs») exige de garantir, indépendamment de ce que
  // l'utilisateur est en train de filtrer.
  const totalPendingShort = listPendingManualGrading(groupIds).length;
  const totalPendingScenario = listPendingScenarioSubquestions(groupIds).length;
  const totalPending = totalPendingShort + totalPendingScenario;

  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const groups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const assessments = isManager ? listAssessmentsForManager(session.userId) : listAssessments();
  const candidates = listCandidateOptions(groupIds);
  const functions = listFunctions();

  const filters: ManualGradingFilters = {
    companyId: sp.companyId ? Number(sp.companyId) : undefined,
    groupId: sp.groupId ? Number(sp.groupId) : undefined,
    functionCode: sp.functionCode || undefined,
    assessmentId: sp.assessmentId ? Number(sp.assessmentId) : undefined,
    candidateUserId: sp.candidateUserId ? Number(sp.candidateUserId) : undefined,
    dateFrom: sp.dateFrom || undefined,
    dateTo: sp.dateTo || undefined,
  };
  const showType = sp.type === "court" || sp.type === "scenario" ? sp.type : "tous";
  const showStatus = sp.status === "corrige" ? "corrige" : "a_corriger";

  const pending = showStatus === "a_corriger" && showType !== "scenario" ? listPendingManualGrading(groupIds, filters) : [];
  const pendingScenario = showStatus === "a_corriger" && showType !== "court" ? listPendingScenarioSubquestions(groupIds, filters) : [];
  const graded = showStatus === "corrige" && showType !== "scenario" ? listGradedManually(groupIds, filters) : [];
  const gradedScenario = showStatus === "corrige" && showType !== "court" ? listGradedScenarioSubquestions(groupIds, filters) : [];

  const anyFilterActive = Boolean(sp.type || sp.status || sp.companyId || sp.groupId || sp.functionCode || sp.assessmentId || sp.candidateUserId || sp.dateFrom || sp.dateTo);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Correction manuelle</h1>

      {/* Mission §15 — compte global unifié, toujours réel, jamais filtré. */}
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[12px] font-medium text-text-tertiary">Corrections en attente</p>
            <p className="font-display text-[28px] font-semibold text-text-primary">{totalPending}</p>
          </div>
          <div className="h-10 w-px bg-border-subtle" />
          <div>
            <p className="text-[12px] text-text-tertiary">Réponses courtes</p>
            <p className="text-[15px] font-medium text-text-primary">{totalPendingShort}</p>
          </div>
          <div>
            <p className="text-[12px] text-text-tertiary">Scénarios</p>
            <p className="text-[15px] font-medium text-text-primary">{totalPendingScenario}</p>
          </div>
        </div>
      </Card>

      {sp.graded === "1" && (
        <div className="rounded-md border border-status-verified-border bg-status-verified-bg px-4 py-3 text-[13px] text-status-verified-text">
          {sp.finalized === "1" ? "Réponse corrigée — résultat finalisé et notifié." : "Réponse corrigée."}
        </div>
      )}

      {/* Mission §16 — filtres réels : Type, Statut, Client, Groupe,
          Fonction DGR, Examen, Candidat, Date. */}
      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="type" className="mb-1 block text-[12px] font-medium text-text-secondary">Type</label>
            <select id="type" name="type" defaultValue={showType} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="tous">Tous</option>
              <option value="court">Réponses courtes</option>
              <option value="scenario">Scénarios</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="status" name="status" defaultValue={showStatus} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="a_corriger">À corriger</option>
              <option value="corrige">Corrigé</option>
            </select>
          </div>
          <div>
            <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="companyId" name="companyId" defaultValue={sp.companyId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe</label>
            <select id="groupId" name="groupId" defaultValue={sp.groupId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groups.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
            <select id="functionCode" name="functionCode" defaultValue={sp.functionCode ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (<option key={f.code} value={f.code}>{f.code}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="assessmentId" className="mb-1 block text-[12px] font-medium text-text-secondary">Examen</label>
            <select id="assessmentId" name="assessmentId" defaultValue={sp.assessmentId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {assessments.map((a) => (<option key={a.id} value={a.id}>{a.company_name} — {a.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="candidateUserId" className="mb-1 block text-[12px] font-medium text-text-secondary">Candidat</label>
            <select id="candidateUserId" name="candidateUserId" defaultValue={sp.candidateUserId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {candidates.map((c) => (<option key={c.id} value={c.id}>{c.full_name} ({c.company_name})</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Du</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={sp.dateFrom ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={sp.dateTo ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="rounded-md bg-accent-9 px-3.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Filtrer
            </button>
            {anyFilterActive && (
              <Link href="/grading" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
            )}
          </div>
        </form>
      </Card>

      {showStatus === "a_corriger" ? (
        <>
          {showType !== "scenario" && (
            <Card>
              <CardHeader title={`${pending.length} réponse(s) en attente de correction`} description="Questions à réponse courte en mode correction manuelle, uniquement pour des tentatives déjà envoyées." />
              {pending.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="Aucune correction en attente" description="Toutes les réponses à correction manuelle ont été traitées, ou aucune ne correspond à ces filtres." />
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
                      {/* Bug réel diagnostiqué (2026-08-30, mission "ADMIN/CLIENT/
                          CANDIDATE UX IMPROVEMENTS" §18) : "—" pouvait se lire
                          comme une réponse légitime plutôt que comme une absence
                          de réponse. Ces deux files ne contiennent QUE des
                          tentatives déjà envoyées (voir lib/manual-grading.ts),
                          donc une réponse vide ici est un fait réel et exploitable
                          par le correcteur — jamais une réponse silencieusement
                          escamotée. */}
                      <p className="mb-3 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12.5px] text-text-secondary">
                        Réponse du candidat :{" "}
                        {p.candidate_answer ? (
                          <span className="font-medium text-text-primary">{p.candidate_answer}</span>
                        ) : (
                          <span className="font-medium italic text-text-tertiary">Aucune réponse fournie</span>
                        )}
                      </p>
                      {canWrite && <GradeAnswerForm attemptQuestionId={p.attempt_question_id} />}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {showType !== "court" && (
            <Card>
              <CardHeader
                title={`${pendingScenario.length} sous-question(s) de scénario en attente de correction`}
                description="Sous-questions à réponse courte en mode correction manuelle, embarquées dans un cas pratique/scénario."
              />
              {pendingScenario.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="Aucune correction en attente" description="Toutes les sous-questions à correction manuelle ont été traitées, ou aucune ne correspond à ces filtres." />
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
                        Réponse du candidat :{" "}
                        {p.candidate_answer ? (
                          <span className="font-medium text-text-primary">{p.candidate_answer}</span>
                        ) : (
                          <span className="font-medium italic text-text-tertiary">Aucune réponse fournie</span>
                        )}
                      </p>
                      {canWrite && <GradeScenarioSubAnswerForm attemptQuestionId={p.attempt_question_id} subquestionId={p.subquestion_id} />}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Statut = Corrigé — historique en lecture seule, jamais un
              formulaire de notation (une réponse déjà statuée ne se
              re-corrige pas depuis cet écran). */}
          {showType !== "scenario" && (
            <Card>
              <CardHeader title={`${graded.length} réponse(s) courte(s) corrigée(s)`} description="Historique des corrections déjà réalisées." />
              {graded.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="Aucune correction dans l'historique" description="Aucune réponse corrigée ne correspond à ces filtres." />
              ) : (
                <div className="flex flex-col gap-3">
                  {graded.map((p) => (
                    <div key={p.attempt_answer_id} className="rounded-md border border-border-subtle p-3.5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{p.candidate_name}</p>
                          <p className="text-[11.5px] text-text-tertiary">
                            {p.company_name} — {p.group_name} — {p.assessment_name} ({p.function_code})
                          </p>
                        </div>
                        <StatusBadge status={p.is_correct ? "verified" : "critical"}>{p.is_correct ? "Correcte" : "Incorrecte"}</StatusBadge>
                      </div>
                      <p className="mb-2 text-[13px] text-text-primary">{p.stem}</p>
                      <p className="mb-1 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12.5px] text-text-secondary">
                        Réponse du candidat :{" "}
                        {p.candidate_answer ? <span className="font-medium text-text-primary">{p.candidate_answer}</span> : <span className="italic text-text-tertiary">Aucune réponse fournie</span>}
                      </p>
                      <p className="text-[11.5px] text-text-tertiary">Points : {p.points_awarded} / {p.points}{p.grader_comment ? ` — Commentaire : ${p.grader_comment}` : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {showType !== "court" && (
            <Card>
              <CardHeader title={`${gradedScenario.length} sous-question(s) de scénario corrigée(s)`} description="Historique des corrections déjà réalisées." />
              {gradedScenario.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="Aucune correction dans l'historique" description="Aucune sous-question corrigée ne correspond à ces filtres." />
              ) : (
                <div className="flex flex-col gap-3">
                  {gradedScenario.map((p) => (
                    <div key={`${p.attempt_question_id}-${p.subquestion_id}`} className="rounded-md border border-border-subtle p-3.5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-medium text-text-primary">{p.candidate_name}</p>
                          <p className="text-[11.5px] text-text-tertiary">
                            {p.company_name} — {p.group_name} — {p.assessment_name} ({p.function_code}) — Scénario : {p.scenario_title}
                          </p>
                        </div>
                        <StatusBadge status={p.is_correct ? "verified" : "critical"}>{p.is_correct ? "Correcte" : "Incorrecte"}</StatusBadge>
                      </div>
                      <p className="mb-2 text-[13px] text-text-primary">{p.subquestion_stem}</p>
                      <p className="mb-1 rounded-md bg-surface-sunken px-2.5 py-1.5 text-[12.5px] text-text-secondary">
                        Réponse du candidat :{" "}
                        {p.candidate_answer ? <span className="font-medium text-text-primary">{p.candidate_answer}</span> : <span className="italic text-text-tertiary">Aucune réponse fournie</span>}
                      </p>
                      <p className="text-[11.5px] text-text-tertiary">Points : {p.points_awarded} / {p.points}{p.grader_comment ? ` — Commentaire : ${p.grader_comment}` : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
