import { guardPage } from "@/lib/rbac";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { listGroups, listGroupsForManager } from "@/lib/groups";
import { listAssessments, listAssessmentsForManager } from "@/lib/assessments";
import { listIncidents } from "@/lib/incidents";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Building2, Users2, BookOpenCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

function Kpi({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
          <Icon size={17} />
        </div>
        <div>
          <p className="text-[20px] font-display font-semibold text-text-primary leading-none">{value}</p>
          <p className="mt-1 text-[12px] text-text-tertiary">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default async function OverviewPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");

  // Frontière multi-client (lib/tenant-scope.ts) : chaque KPI et chaque
  // liste de ce tableau de bord doit refléter le périmètre réel du
  // responsable connecté, jamais des compteurs globaux qui révéleraient
  // l'existence/l'échelle d'un autre client.
  const isManager = session.role === "pedagogical_manager";
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();
  const groups = isManager ? listGroupsForManager(session.userId) : listGroups();
  const assessments = isManager ? listAssessmentsForManager(session.userId) : listAssessments();
  const openAssessments = assessments.filter((a) => a.status === "published" || a.status === "open");
  const incidents = listIncidents(scopedGroupIdsOrNull(session)).filter((i) => i.status !== "closed" && i.status !== "resolved");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">Bonjour {session.username} — {session.role}.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Clients" value={companies.length} icon={Building2} />
        <Kpi label="Groupes" value={groups.length} icon={Users2} />
        <Kpi label="Examens ouverts" value={openAssessments.length} icon={BookOpenCheck} />
        <Kpi label="Incidents ouverts" value={incidents.length} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader title="Évaluations récentes" description="Les 8 dernières créées, tous statuts" />
        {assessments.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">Aucune évaluation créée pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 font-medium">Nom</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Fonction</th>
                  <th className="pb-2 font-medium">Groupe</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 8).map((a) => (
                  <tr key={a.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-text-primary">{a.name}</td>
                    <td className="py-2 text-text-secondary capitalize">{a.type}</td>
                    <td className="py-2 text-text-secondary">{a.function_code}</td>
                    <td className="py-2 text-text-secondary">{a.group_name}</td>
                    <td className="py-2">
                      <StatusBadge status={a.status === "published" || a.status === "open" ? "verified" : a.status === "suspended" ? "critical" : "neutral"}>
                        {a.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {incidents.length === 0 && (
        <Card className="flex items-center gap-2 text-[13px] text-status-verified-text">
          <CheckCircle2 size={16} />
          Aucun incident ouvert actuellement.
        </Card>
      )}
    </div>
  );
}
