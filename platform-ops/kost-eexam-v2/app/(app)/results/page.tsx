import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listResults, listCandidateOptions } from "@/lib/results";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listAssessments, listAssessmentsForManager } from "@/lib/assessments";
import { listFunctions } from "@/lib/functions";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListChecks, Download } from "lucide-react";

interface ResultsSearchParams {
  functionCode?: string;
  passed?: string;
  companyId?: string;
  // Addendum §7 — filtres additionnels : groupe, examen, candidat, date.
  groupId?: string;
  assessmentId?: string;
  candidateUserId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<ResultsSearchParams>;
}) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  // Frontière multi-client (lib/tenant-scope.ts) : chaque liste d'options
  // de filtre (client, groupe, examen, candidat) n'affiche que le
  // périmètre du responsable, ET restrictToGroupIds (calculé côté serveur
  // depuis la session, jamais depuis sp.*) s'applique en ET avec les
  // filtres choisis par l'utilisateur — un identifiant d'un autre client
  // forgé dans l'URL ne peut donc rien élargir.
  const isManager = session.role === "pedagogical_manager";
  const restrictToGroupIds = scopedGroupIdsOrNull(session);
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const groups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const assessments = isManager ? listAssessmentsForManager(session.userId) : listAssessments();
  const candidates = listCandidateOptions(restrictToGroupIds);
  const functions = listFunctions();

  const results = listResults({
    functionCode: sp.functionCode || undefined,
    passed: sp.passed === "true" ? true : sp.passed === "false" ? false : undefined,
    companyId: sp.companyId ? Number(sp.companyId) : undefined,
    groupId: sp.groupId ? Number(sp.groupId) : undefined,
    assessmentId: sp.assessmentId ? Number(sp.assessmentId) : undefined,
    candidateUserId: sp.candidateUserId ? Number(sp.candidateUserId) : undefined,
    dateFrom: sp.dateFrom || undefined,
    dateTo: sp.dateTo || undefined,
    restrictToGroupIds: restrictToGroupIds ?? undefined,
  });

  const qs = new URLSearchParams();
  if (sp.functionCode) qs.set("functionCode", sp.functionCode);
  if (sp.passed) qs.set("passed", sp.passed);
  if (sp.companyId) qs.set("companyId", sp.companyId);
  if (sp.groupId) qs.set("groupId", sp.groupId);
  if (sp.assessmentId) qs.set("assessmentId", sp.assessmentId);
  if (sp.candidateUserId) qs.set("candidateUserId", sp.candidateUserId);
  if (sp.dateFrom) qs.set("dateFrom", sp.dateFrom);
  if (sp.dateTo) qs.set("dateTo", sp.dateTo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Résultats</h1>
        <div className="flex gap-2">
          <a href={`/api/results/export?${qs.toString()}`} className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
            <Download size={13} /> Export CSV (résultats)
          </a>
          <a href={`/api/results/export-answers?${qs.toString()}`} className="flex items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
            <Download size={13} /> Export CSV (réponses détaillées)
          </a>
        </div>
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="companyId" name="companyId" defaultValue={sp.companyId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="functionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction</label>
            <select id="functionCode" name="functionCode" defaultValue={sp.functionCode ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (<option key={f.code} value={f.code}>{f.label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="passed" className="mb-1 block text-[12px] font-medium text-text-secondary">Résultat</label>
            <select id="passed" name="passed" defaultValue={sp.passed ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="true">Réussi</option>
              <option value="false">Échoué</option>
            </select>
          </div>
          <div>
            <label htmlFor="groupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe / session</label>
            <select id="groupId" name="groupId" defaultValue={sp.groupId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groups.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="assessmentId" className="mb-1 block text-[12px] font-medium text-text-secondary">Examen / évaluation</label>
            <select id="assessmentId" name="assessmentId" defaultValue={sp.assessmentId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {assessments.map((a) => (<option key={a.id} value={a.id}>{a.company_name} — {a.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="candidateUserId" className="mb-1 block text-[12px] font-medium text-text-secondary">Candidat</label>
            <select id="candidateUserId" name="candidateUserId" defaultValue={sp.candidateUserId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {candidates.map((c) => (<option key={c.id} value={c.id}>{c.full_name} ({c.company_name})</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Du</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={sp.dateFrom ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={sp.dateTo ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {(sp.functionCode || sp.passed || sp.companyId || sp.groupId || sp.assessmentId || sp.candidateUserId || sp.dateFrom || sp.dateTo) && (
            <Link href="/results" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${results.length} tentative(s)`} />
        {results.length === 0 ? (
          <EmptyState icon={ListChecks} title="Aucun résultat" description="Aucune tentative ne correspond aux filtres." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 pr-3 font-medium">Candidat</th>
                  <th className="pb-2 pr-3 font-medium">Entreprise / Groupe</th>
                  <th className="pb-2 pr-3 font-medium">Fonction</th>
                  <th className="pb-2 pr-3 font-medium">Examen</th>
                  <th className="pb-2 pr-3 font-medium">Score</th>
                  <th className="pb-2 pr-3 font-medium">Résultat</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attempt_id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pr-3">
                      <Link href={`/results/${r.attempt_id}`} className="font-medium text-accent-9 hover:underline">{r.candidate_name}</Link>
                    </td>
                    <td className="py-2 pr-3 text-text-secondary">{r.company_name} / {r.group_name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{r.function_code}</td>
                    <td className="py-2 pr-3 text-text-secondary">{r.assessment_name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{r.score_100 !== null ? `${r.score_100}/100` : "—"}</td>
                    <td className="py-2 pr-3">
                      {r.passed === null ? <span className="text-text-tertiary">—</span> : <StatusBadge status={r.passed ? "verified" : "critical"}>{r.passed ? "Réussi" : "Échoué"}</StatusBadge>}
                    </td>
                    <td className="py-2 text-text-secondary">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
