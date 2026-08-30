import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listGroupsFiltered } from "@/lib/groups";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listFunctions } from "@/lib/functions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users2 } from "lucide-react";
import { CreateGroupForm } from "./CreateGroupForm";

// "companyId" (sans préfixe) reste RÉSERVÉ à la présélection du formulaire
// de création (voir app/(app)/companies/[id]/page.tsx, lien "+ Nouveau
// groupe" → /groups?companyId=...) — même convention EXACTE que
// app/(app)/exam-preparation/page.tsx ("groupId" réservé au formulaire de
// création, préfixe "filter" pour tout paramètre de FILTRE). Les nouveaux
// filtres de cette mission prennent donc systématiquement le préfixe
// "filter" pour ne jamais entrer en collision.
interface GroupsSearchParams {
  companyId?: string;
  filterCompanyId?: string;
  filterClientType?: string;
  filterStatus?: string;
  filterFunctionCode?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  q?: string;
}

export default async function GroupsPage({ searchParams }: { searchParams: Promise<GroupsSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  // Frontière multi-client (lib/tenant-scope.ts) : liste ET le sélecteur de
  // client du formulaire de création sont restreints pour un responsable
  // pédagogique — il ne doit même pas voir le nom d'un client qui n'est pas
  // le sien dans le menu déroulant.
  const isManager = session.role === "pedagogical_manager";
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const functions = listFunctions();
  const canWrite = session.role !== "auditor";

  const groups = listGroupsFiltered({
    companyId: sp.filterCompanyId ? Number(sp.filterCompanyId) : undefined,
    clientType: sp.filterClientType || undefined,
    status: (sp.filterStatus as "active" | "closed") || undefined,
    functionCode: sp.filterFunctionCode || undefined,
    dateFrom: sp.filterDateFrom || undefined,
    dateTo: sp.filterDateTo || undefined,
    search: sp.q || undefined,
    restrictToManagerId: isManager ? session.userId : undefined,
  });

  const hasFilters = !!(sp.filterCompanyId || sp.filterClientType || sp.filterStatus || sp.filterFunctionCode || sp.filterDateFrom || sp.filterDateTo || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Groupes</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Nouveau groupe" description="Client → Groupe → Candidats" />
          <CreateGroupForm companies={companies} defaultCompanyId={sp.companyId ? Number(sp.companyId) : undefined} />
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
            <label htmlFor="filterClientType" className="mb-1 block text-[12px] font-medium text-text-secondary">Type client</label>
            <select id="filterClientType" name="filterClientType" defaultValue={sp.filterClientType ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="entreprise">Entreprise</option>
              <option value="particulier">Particulier</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterStatus" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="filterStatus" name="filterStatus" defaultValue={sp.filterStatus ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="closed">Clôturé</option>
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
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Nom du groupe, client…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/groups" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${groups.length} groupe(s)`} />
        {groups.length === 0 ? (
          <EmptyState icon={Users2} title="Aucun groupe" description="Créez un client puis un groupe pour commencer." />
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{g.name}</p>
                  <p className="text-[12px] text-text-tertiary">{g.company_name} — {g.member_count} candidat(s)</p>
                </div>
                <StatusBadge status={g.status === "active" ? "verified" : "neutral"}>{g.status === "active" ? "Actif" : "Clôturé"}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
