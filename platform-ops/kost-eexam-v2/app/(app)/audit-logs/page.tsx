import { guardPage } from "@/lib/rbac";
import { listAuditLogs } from "@/lib/audit";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export default async function AuditLogsPage() {
  await guardPage("administrator", "auditor");
  const logs = listAuditLogs(300);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Journal d&apos;audit</h1>
      <Card>
        <CardHeader title={`${logs.length} événement(s) récent(s)`} description="Insert-only — aucune modification possible, même par un administrateur" />
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border-subtle text-left text-text-tertiary">
                <th className="pb-2 pr-3 font-medium">Horodatage</th>
                <th className="pb-2 pr-3 font-medium">Acteur</th>
                <th className="pb-2 pr-3 font-medium">Rôle</th>
                <th className="pb-2 pr-3 font-medium">Action</th>
                <th className="pb-2 pr-3 font-medium">Cible</th>
                <th className="pb-2 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-1.5 pr-3 font-mono text-[11.5px] text-text-tertiary">{new Date(l.timestamp).toLocaleString("fr-FR")}</td>
                  <td className="py-1.5 pr-3 text-text-primary">{l.actor_username ?? "système"}</td>
                  <td className="py-1.5 pr-3 text-text-secondary">{l.actor_role ?? "—"}</td>
                  <td className="py-1.5 pr-3 text-text-secondary">{l.action}</td>
                  <td className="py-1.5 pr-3 text-text-secondary">{l.target_type ? `${l.target_type}#${l.target_id}` : "—"}</td>
                  <td className="py-1.5">
                    <StatusBadge status={l.result === "success" ? "verified" : "critical"}>{l.result}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
