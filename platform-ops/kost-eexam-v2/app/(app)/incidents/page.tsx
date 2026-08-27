import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listIncidents } from "@/lib/incidents";
import { listGroups, listGroupsForManager } from "@/lib/groups";
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

export default async function IncidentsPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  // Frontière multi-client (lib/tenant-scope.ts) : un responsable ne voit
  // que les incidents plateforme (group_id NULL) et ceux de ses propres
  // groupes — jamais ceux d'un autre client.
  const isManager = session.role === "pedagogical_manager";
  const incidents = listIncidents(scopedGroupIdsOrNull(session));
  const groupsForForm = isManager ? listGroupsForManager(session.userId) : listGroups();
  const canWrite = session.role !== "auditor";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Sécurité — Incidents</h1>
        <Link href="/api/reports/incident-procedure" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
          Procédure incident (PDF)
        </Link>
      </div>

      {canWrite && (
        <Card>
          <CardHeader title="Déclarer un incident" />
          <DeclareIncidentForm groups={groupsForForm} groupRequired={isManager} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${incidents.length} incident(s)`} />
        {incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Aucun incident" description="Aucun incident déclaré pour l'instant." />
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((i) => (
              <Link key={i.id} href={`/incidents/${i.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{i.type} — {i.description.slice(0, 80)}</p>
                  <p className="text-[12px] text-text-tertiary">{new Date(i.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-2">
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
