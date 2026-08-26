import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listResults } from "@/lib/results";
import { listCompanies } from "@/lib/companies";
import { listFunctions } from "@/lib/functions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListChecks, Download } from "lucide-react";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ functionCode?: string; passed?: string; companyId?: string }>;
}) {
  await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  const companies = listCompanies();
  const functions = listFunctions();

  const results = listResults({
    functionCode: sp.functionCode || undefined,
    passed: sp.passed === "true" ? true : sp.passed === "false" ? false : undefined,
    companyId: sp.companyId ? Number(sp.companyId) : undefined,
  });

  const qs = new URLSearchParams();
  if (sp.functionCode) qs.set("functionCode", sp.functionCode);
  if (sp.passed) qs.set("passed", sp.passed);
  if (sp.companyId) qs.set("companyId", sp.companyId);

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
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
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
