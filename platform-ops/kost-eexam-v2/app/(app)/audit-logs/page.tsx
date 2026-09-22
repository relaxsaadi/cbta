import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listAuditLogsFiltered, listDistinctAuditActions, listDistinctAuditActors } from "@/lib/audit";
import { formatAlgeriaDateTime } from "@/lib/timezone";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileSearch } from "lucide-react";

interface AuditLogsSearchParams {
  dateFrom?: string;
  dateTo?: string;
  actorUserId?: string;
  actorRole?: string;
  action?: string;
  q?: string;
}

// Page déjà strictement administrator/auditor (guardPage ci-dessous) — deux
// rôles à portée GLOBALE, donc aucune restriction de périmètre tenant à
// appliquer sur les filtres eux-mêmes (voir lib/audit.ts::
// listAuditLogsFiltered pour la justification complète, y compris pourquoi
// aucun filtre "Client" n'existe ici).
export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<AuditLogsSearchParams> }) {
  await guardPage("administrator", "auditor");
  const sp = await searchParams;
  const actions = listDistinctAuditActions();
  const actors = listDistinctAuditActors();

  const logs = listAuditLogsFiltered(
    {
      dateFrom: sp.dateFrom || undefined,
      dateTo: sp.dateTo || undefined,
      actorUserId: sp.actorUserId ? Number(sp.actorUserId) : undefined,
      actorRole: sp.actorRole || undefined,
      action: sp.action || undefined,
      search: sp.q || undefined,
    },
    300
  );

  const hasFilters = !!(sp.dateFrom || sp.dateTo || sp.actorUserId || sp.actorRole || sp.action || sp.q);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Journal d&apos;audit</h1>

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Du</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={sp.dateFrom ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={sp.dateTo ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="actorUserId" className="mb-1 block text-[12px] font-medium text-text-secondary">Acteur</label>
            <select id="actorUserId" name="actorUserId" defaultValue={sp.actorUserId ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {actors.map((a) => (<option key={a.id} value={a.id}>{a.username}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="actorRole" className="mb-1 block text-[12px] font-medium text-text-secondary">Rôle</label>
            <select id="actorRole" name="actorRole" defaultValue={sp.actorRole ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              <option value="administrator">Administrateur</option>
              <option value="pedagogical_manager">Responsable pédagogique</option>
              <option value="auditor">Auditeur</option>
              <option value="candidate">Candidat</option>
            </select>
          </div>
          <div>
            <label htmlFor="action" className="mb-1 block text-[12px] font-medium text-text-secondary">Action</label>
            <select id="action" name="action" defaultValue={sp.action ?? ""} className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Toutes</option>
              {actions.map((a) => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Recherche</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} placeholder="Acteur, action, cible…" className="rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <button type="submit" className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">Filtrer</button>
          {hasFilters && (
            <Link href="/audit-logs" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
          )}
        </form>
      </Card>

      <Card>
        <CardHeader title={`${logs.length} événement(s)`} description="Journal alimenté en insertion seule par l’application — protection SQLite contre UPDATE/DELETE encore à finaliser" />
        {logs.length === 0 ? (
          <EmptyState icon={FileSearch} title="Aucun événement" description="Aucun événement ne correspond à ces filtres." />
        ) : (
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
                    <td className="py-1.5 pr-3 font-mono text-[11.5px] text-text-tertiary">{formatAlgeriaDateTime(l.timestamp, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
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
        )}
      </Card>
    </div>
  );
}
