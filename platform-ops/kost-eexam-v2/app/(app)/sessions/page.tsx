import { guardPage } from "@/lib/rbac";
import { listActiveSessions } from "@/lib/sessions-registry";
import { scopedUserIdsForSessionsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KeySquare } from "lucide-react";
import { revokeSessionAction, revokeAllForUserAction } from "./actions";

export default async function SessionsPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  // Frontière multi-client (lib/tenant-scope.ts) : un responsable ne voit
  // que sa propre session et celles des candidats de ses groupes — jamais
  // celles d'un autre responsable/administrateur/auditeur, ni celles des
  // candidats d'un autre client.
  const sessions = listActiveSessions(scopedUserIdsForSessionsOrNull(session));
  const canWrite = session.role === "administrator";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Sessions actives</h1>

      <Card>
        <CardHeader title={`${sessions.length} session(s) active(s)`} />
        {sessions.length === 0 ? (
          <EmptyState icon={KeySquare} title="Aucune session active" description="Aucun utilisateur n'est actuellement connecté." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 pr-3 font-medium">Utilisateur</th>
                  <th className="pb-2 pr-3 font-medium">Rôle</th>
                  <th className="pb-2 pr-3 font-medium">Ouverte</th>
                  <th className="pb-2 pr-3 font-medium">Dernière activité</th>
                  <th className="pb-2 pr-3 font-medium">IP</th>
                  {canWrite && <th className="pb-2 font-medium"></th>}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pr-3 text-text-primary">{s.full_name}</td>
                    <td className="py-2 pr-3 text-text-secondary">{s.role}</td>
                    <td className="py-2 pr-3 text-text-secondary">{new Date(s.created_at).toLocaleString("fr-FR")}</td>
                    <td className="py-2 pr-3 text-text-secondary">{new Date(s.last_seen_at).toLocaleString("fr-FR")}</td>
                    <td className="py-2 pr-3 text-text-secondary">{s.ip_address ?? "—"}</td>
                    {canWrite && (
                      <td className="py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <form action={revokeSessionAction.bind(null, s.id)}>
                            <button type="submit" className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text">
                              Révoquer
                            </button>
                          </form>
                          <form action={revokeAllForUserAction.bind(null, s.user_id)}>
                            <button type="submit" className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong">
                              Tout révoquer
                            </button>
                          </form>
                        </div>
                      </td>
                    )}
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
