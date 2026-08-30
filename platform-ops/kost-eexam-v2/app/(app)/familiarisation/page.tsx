import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listFamiliarizationSessionsFiltered } from "@/lib/familiarization";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listFunctions } from "@/lib/functions";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GraduationCap } from "lucide-react";
import { CreateSessionForm } from "./CreateSessionForm";

// CreateSessionForm (plus bas sur cette MÊME page) utilise déjà
// id="groupId"/"functionCode" — un id dupliqué est un vrai bug HTML/
// accessibilité (même correctif déjà appliqué sur /exam-preparation,
// /question-bank, /incidents). Tout paramètre de FILTRE prend donc
// systématiquement le préfixe "filter".
interface FamiliarizationSearchParams {
  filterCompanyId?: string;
  filterGroupId?: string;
  filterFunctionCode?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  q?: string;
}

// Addendum §18-21 — module de familiarisation, CRITIQUE AUDIT. Scopé
// tenant comme le reste (lib/tenant-scope.ts scopedGroupIdsOrNull) : un
// responsable ne voit/crée que sur ses propres groupes. Pas de filtre
// Candidat/Rôle/Statut à ce niveau — voir lib/familiarization.ts::
// listFamiliarizationSessionsFiltered pour la justification (granularité
// différente : une session porte sur un groupe entier, la présence
// individuelle vit dans le détail de CHAQUE session).
export default async function FamiliarizationPage({ searchParams }: { searchParams: Promise<FamiliarizationSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  const isManager = session.role === "pedagogical_manager";
  const canWrite = session.role !== "auditor";
  const restrictToGroupIds = scopedGroupIdsOrNull(session);
  const groups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const functions = listFunctions();

  const sessions = listFamiliarizationSessionsFiltered({
    companyId: sp.filterCompanyId ? Number(sp.filterCompanyId) : undefined,
    groupId: sp.filterGroupId ? Number(sp.filterGroupId) : undefined,
    functionCode: sp.filterFunctionCode || undefined,
    dateFrom: sp.filterDateFrom || undefined,
    dateTo: sp.filterDateTo || undefined,
    search: sp.q || undefined,
    restrictToGroupIdsOrNull: restrictToGroupIds,
  });

  const hasFilters = !!(sp.filterCompanyId || sp.filterGroupId || sp.filterFunctionCode || sp.filterDateFrom || sp.filterDateTo || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Familiarisation</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Déclarer une session de familiarisation" description="Une ligne de présence est créée pour chaque candidat actuellement dans le groupe." />
          <CreateSessionForm groups={groups} functions={functions} />
        </Card>
      )}

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="filterCompanyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="filterCompanyId" name="filterCompanyId" defaultValue={sp.filterCompanyId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterGroupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe</label>
            <select id="filterGroupId" name="filterGroupId" defaultValue={sp.filterGroupId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groups.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterFunctionCode" className="mb-1 block text-[12px] font-medium text-text-secondary">Fonction DGR</label>
            <select id="filterFunctionCode" name="filterFunctionCode" defaultValue={sp.filterFunctionCode ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {functions.map((f) => (<option key={f.code} value={f.code}>{f.label}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterDateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Du</label>
            <input type="date" id="filterDateFrom" name="filterDateFrom" defaultValue={sp.filterDateFrom ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="filterDateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="filterDateTo" name="filterDateTo" defaultValue={sp.filterDateTo ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Client, groupe, lieu…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/familiarisation" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${sessions.length} session(s)`} />
        {sessions.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Aucune session" description="Aucune session ne correspond à ces filtres." />
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <Link key={s.id} href={`/familiarisation/${s.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{s.company_name} — {s.group_name} — Fonction {s.function_code}</p>
                  <p className="text-[12px] text-text-tertiary">{new Date(s.held_at).toLocaleString("fr-FR")}{s.location ? ` — ${s.location}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
