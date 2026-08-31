import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listIncidentsFiltered, type IncidentStatus, type IncidentSeverity } from "@/lib/incidents";
import { listGroups, listGroupsForManager, listGroupMembers } from "@/lib/groups";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertTriangle } from "lucide-react";
import { DeclareIncidentForm } from "./DeclareIncidentForm";

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  open: "critical", investigating: "warning", resolved: "verified", closed: "neutral",
};
const SEVERITY_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  low: "neutral", medium: "warning", high: "critical", critical: "critical",
};

// DeclareIncidentForm (plus bas sur cette MÊME page) utilise déjà
// id="severity"/"groupId" — un id dupliqué est un vrai bug HTML/
// accessibilité (même correctif déjà appliqué sur /exam-preparation et
// /question-bank). Tout paramètre de FILTRE prend donc systématiquement
// le préfixe "filter".
interface IncidentsSearchParams {
  filterStatus?: string;
  filterSeverity?: string;
  filterCompanyId?: string;
  filterGroupId?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  q?: string;
}

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<IncidentsSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  // Frontière multi-client (lib/tenant-scope.ts) : un responsable ne voit
  // que les incidents plateforme (group_id NULL) et ceux de ses propres
  // groupes — jamais ceux d'un autre client. restrictToGroupIds vient
  // TOUJOURS de la session serveur, jamais d'un paramètre de filtre.
  const isManager = session.role === "pedagogical_manager";
  const restrictToGroupIds = scopedGroupIdsOrNull(session);
  const groupsForForm = isManager ? listGroupsForManager(session.userId) : listGroups();
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const canWrite = session.role !== "auditor";

  const incidents = listIncidentsFiltered({
    status: (sp.filterStatus as IncidentStatus) || undefined,
    severity: (sp.filterSeverity as IncidentSeverity) || undefined,
    companyId: sp.filterCompanyId ? Number(sp.filterCompanyId) : undefined,
    groupId: sp.filterGroupId ? Number(sp.filterGroupId) : undefined,
    dateFrom: sp.filterDateFrom || undefined,
    dateTo: sp.filterDateTo || undefined,
    search: sp.q || undefined,
    restrictToGroupIdsOrNull: restrictToGroupIds,
  });

  const hasFilters = !!(sp.filterStatus || sp.filterSeverity || sp.filterCompanyId || sp.filterGroupId || sp.filterDateFrom || sp.filterDateTo || sp.q);

  // Candidats notifiables (INCIDENT_DECLARED, mission email §29) — un par
  // groupe accessible à l'acteur, jamais au-delà de son périmètre (même
  // frontière que groupsForForm ci-dessus).
  const candidatesByGroup = groupsForForm.map((g) => ({
    groupId: g.id,
    groupLabel: `${g.company_name} — ${g.name}`,
    members: listGroupMembers(g.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Sécurité — Incidents</h1>
        <Link href="/api/reports/incident-procedure" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
          Procédure incident (PDF)
        </Link>
      </div>

      {/* Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
          §15/§23 — panneau de filtres placé AVANT le formulaire de
          déclaration (même correctif que /question-bank et /groups). */}
      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="filterStatus" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="filterStatus" name="filterStatus" defaultValue={sp.filterStatus ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="open">Ouvert</option>
              <option value="investigating">En cours d&apos;investigation</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Clôturé</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterSeverity" className="mb-1 block text-[12px] font-medium text-text-secondary">Sévérité</label>
            <select id="filterSeverity" name="filterSeverity" defaultValue={sp.filterSeverity ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterCompanyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="filterCompanyId" name="filterCompanyId" defaultValue={sp.filterCompanyId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="filterGroupId" className="mb-1 block text-[12px] font-medium text-text-secondary">Groupe / session</label>
            <select id="filterGroupId" name="filterGroupId" defaultValue={sp.filterGroupId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {groupsForForm.map((g) => (<option key={g.id} value={g.id}>{g.company_name} — {g.name}</option>))}
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
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Type, description…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/incidents" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      {canWrite && (
        <Card>
          <CardHeader title="Déclarer un incident" />
          <DeclareIncidentForm groups={groupsForForm} groupRequired={isManager} candidatesByGroup={candidatesByGroup} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${incidents.length} incident(s)`} />
        {incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Aucun incident" description="Aucun incident ne correspond à ces filtres." />
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((i) => (
              <Link key={i.id} href={`/incidents/${i.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{i.type} — {i.description.slice(0, 80)}</p>
                  <p className="text-[12px] text-text-tertiary">{new Date(i.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* §29 — labellisé clairement "Déclaré par le candidat"
                      (lib/incidents.ts::reported_by_candidate, calculé
                      depuis le rôle réel de created_by, jamais une colonne
                      figée). */}
                  {i.reported_by_candidate === 1 && <StatusBadge status="neutral">Déclaré par le candidat</StatusBadge>}
                  <StatusBadge status={SEVERITY_BADGE[i.severity] ?? "neutral"}>{i.severity}</StatusBadge>
                  <StatusBadge status={STATUS_BADGE[i.status] ?? "neutral"}>{i.status}</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
