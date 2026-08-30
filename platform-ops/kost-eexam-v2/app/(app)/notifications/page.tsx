import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { scopedUserIdsForSessionsOrNull } from "@/lib/tenant-scope";
import { listNotificationHistory, KNOWN_EVENT_TYPES, type NotificationHistoryRow } from "@/lib/email/history";
import { listCompanies, listCompaniesForManager } from "@/lib/companies";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MailWarning } from "lucide-react";
import { ResendButton } from "./ResendButton";
import { resendInvitationFromHistoryAction, resendExamFromHistoryAction } from "./actions";

const STATUS_BADGE: Record<string, BadgeStatus> = {
  QUEUED: "neutral",
  SENDING: "neutral",
  SENT: "verified",
  DELIVERED: "verified",
  DELAYED: "warning",
  SUPPRESSED: "warning",
  FAILED: "critical",
  BOUNCED: "critical",
  COMPLAINED: "critical",
};

function metadataAssessmentId(row: NotificationHistoryRow): number | null {
  if (!row.metadata_json) return null;
  try {
    const parsed = JSON.parse(row.metadata_json) as { assessmentId?: number };
    return typeof parsed.assessmentId === "number" ? parsed.assessmentId : null;
  } catch {
    return null;
  }
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; event?: string; q?: string; companyId?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const session = await guardPage("administrator", "auditor", "pedagogical_manager");
  const { status, event, q, companyId, dateFrom, dateTo } = await searchParams;
  // Frontière multi-client (lib/tenant-scope.ts) — un responsable
  // pédagogique ne voit que ses propres notifications (lui-même + ses
  // candidats), jamais celles d'un autre client ; réutilise EXACTEMENT le
  // même prédicat que "Sessions actives" (même périmètre logique : les
  // comptes visibles d'un responsable).
  const userIdsOrNull = scopedUserIdsForSessionsOrNull(session);
  const canWrite = session.role !== "auditor";
  const isManager = session.role === "pedagogical_manager";
  // Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §12-13 —
  // même périmètre que /results pour la liste déroulante elle-même (jamais
  // proposer à un responsable un client hors de son périmètre, même si le
  // résultat de la requête filtrée serait de toute façon vide).
  const companies = isManager ? listCompaniesForManager(session.userId) : listCompanies();

  const rows = listNotificationHistory({
    userIdsOrNull,
    status: status || undefined,
    eventType: event || undefined,
    search: q || undefined,
    companyId: companyId ? Number(companyId) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Historique des notifications</h1>

      <Card>
        <form method="get" className="grid gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium text-text-secondary">Email destinataire</label>
            <input id="q" name="q" defaultValue={q ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-[12px] font-medium text-text-secondary">Statut</label>
            <select id="status" name="status" defaultValue={status ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {Object.keys(STATUS_BADGE).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="event" className="mb-1 block text-[12px] font-medium text-text-secondary">Type d&apos;événement</label>
            <select id="event" name="event" defaultValue={event ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {KNOWN_EVENT_TYPES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          {/* Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30)
              §12-13 — Client/Date absents jusqu'ici alors que le backend
              les supportait déjà en partie (companyId) ou pas du tout
              (dateFrom/dateTo, ajoutés dans lib/email/history.ts). */}
          <div>
            <label htmlFor="companyId" className="mb-1 block text-[12px] font-medium text-text-secondary">Client</label>
            <select id="companyId" name="companyId" defaultValue={companyId ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]">
              <option value="">Tous</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="mb-1 block text-[12px] font-medium text-text-secondary">Du</label>
            <input type="date" id="dateFrom" name="dateFrom" defaultValue={dateFrom ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label htmlFor="dateTo" className="mb-1 block text-[12px] font-medium text-text-secondary">Au</label>
            <input type="date" id="dateTo" name="dateTo" defaultValue={dateTo ?? ""} className="w-full rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="rounded-md bg-brand-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90">
              Filtrer
            </button>
            {(status || event || q || companyId || dateFrom || dateTo) && (
              <Link href="/notifications" className="text-[12.5px] font-medium text-text-tertiary hover:text-text-secondary">Réinitialiser les filtres</Link>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title={`${rows.length} notification(s)`}
          description="200 plus récentes maximum — jamais le contenu de l'email (voir /admin/email-preview pour un aperçu synthétique)"
        />
        {rows.length === 0 ? (
          <EmptyState icon={MailWarning} title="Aucune notification" description="Aucun événement ne correspond à ces filtres." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="pb-2 pr-3 font-medium">Horodatage</th>
                  <th className="pb-2 pr-3 font-medium">Destinataire</th>
                  <th className="pb-2 pr-3 font-medium">Événement</th>
                  <th className="pb-2 pr-3 font-medium">Sujet</th>
                  <th className="pb-2 pr-3 font-medium">Statut</th>
                  <th className="pb-2 pr-3 font-medium">Détail</th>
                  {canWrite && <th className="pb-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => {
                  const assessmentId = metadataAssessmentId(n);
                  return (
                    <tr key={n.id} className="border-b border-border-subtle last:border-0">
                      <td className="py-1.5 pr-3 font-mono text-[11.5px] text-text-tertiary">{new Date(n.created_at).toLocaleString("fr-FR")}</td>
                      <td className="py-1.5 pr-3 text-text-primary">
                        {n.full_name ?? "—"}
                        <div className="text-[11px] text-text-tertiary">{n.recipient_email}</div>
                      </td>
                      <td className="py-1.5 pr-3 text-text-secondary">{n.event_type}</td>
                      <td className="py-1.5 pr-3 text-text-secondary">{n.subject}</td>
                      <td className="py-1.5 pr-3">
                        <StatusBadge status={STATUS_BADGE[n.status] ?? "neutral"}>{n.status}</StatusBadge>
                      </td>
                      <td className="py-1.5 pr-3 text-text-tertiary">
                        {n.failure_reason_safe ?? (n.retry_count > 0 ? `${n.retry_count} tentative(s)` : "—")}
                      </td>
                      {canWrite && (
                        <td className="py-1.5">
                          {n.event_type === "ACCOUNT_CREATED" && n.user_id && (
                            <ResendButton action={resendInvitationFromHistoryAction} hiddenFields={{ userId: n.user_id }} label="Renvoyer l'invitation" />
                          )}
                          {n.event_type === "EXAM_ASSIGNED" && n.user_id && assessmentId && (
                            <ResendButton
                              action={resendExamFromHistoryAction}
                              hiddenFields={{ userId: n.user_id, assessmentId }}
                              label="Renvoyer la notification"
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
