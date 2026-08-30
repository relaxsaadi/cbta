import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listActiveSessionsFiltered } from "@/lib/sessions-registry";
import { scopedUserIdsForSessionsOrNull } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KeySquare } from "lucide-react";
import { revokeSessionAction, revokeAllForUserAction } from "./actions";

interface SessionsSearchParams {
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  q?: string;
}

export default async function SessionsPage({ searchParams }: { searchParams: Promise<SessionsSearchParams> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const sp = await searchParams;
  // Frontière multi-client (lib/tenant-scope.ts) : un responsable ne voit
  // que sa propre session et celles des candidats de ses groupes — jamais
  // celles d'un autre responsable/administrateur/auditeur, ni celles des
  // candidats d'un autre client.
  const sessions = listActiveSessionsFiltered({
    role: sp.role || undefined,
    dateFrom: sp.dateFrom || undefined,
    dateTo: sp.dateTo || undefined,
    search: sp.q || undefined,
    restrictToUserIdsOrNull: scopedUserIdsForSessionsOrNull(session),
  });
  const canWrite = session.role === "administrator";
  const hasFilters = !!(sp.role || sp.dateFrom || sp.dateTo || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Sessions actives</h1>

      <Card>
        {/* Pas de filtre "Statut" ici : cette liste ne contient PAR
            CONSTRUCTION que des sessions actives (voir lib/sessions-
            registry.ts::listActiveSessionsFiltered) — un tel filtre
            n'aurait qu'une seule valeur possible, donc rien de réel à
            filtrer. */}
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="role" className="mb-1 block text-[12px] font-medium text-text-secondary">Rôle</label>
            <select id="role" name="role" defaultValue={sp.role ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="administrator">Administrateur</option>
              <option value="pedagogical_manager">Responsable pédagogique</option>
              <option value="auditor">Auditeur</option>
              <option value="candidate">Candidat</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Ouverte depuis le</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={sp.dateFrom ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Jusqu&apos;au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={sp.dateTo ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Nom, identifiant…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/sessions" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${sessions.length} session(s) active(s)`} />
        {sessions.length === 0 ? (
          <EmptyState icon={KeySquare} title="Aucune session active" description="Aucune session ne correspond à ces filtres." />
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
