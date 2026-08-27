import { notFound } from "next/navigation";
import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { getIncident, listIncidentActions } from "@/lib/incidents";
import { listUsersByRole } from "@/lib/users";
import { listAssessments } from "@/lib/assessments";
import { hasIncidentAccess } from "@/lib/tenant-scope";
import { getPlatformStatus } from "@/lib/platform-settings";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import {
  suspendAccountAction,
  reactivateAccountAction,
  revokeSessionsAction,
  suspendExamAction,
  reopenExamAction,
  addNoteAction,
  addCorrectiveMeasureAction,
  enableMaintenanceModeAction,
  disableMaintenanceModeAction,
  blockNewLoginsAction,
  unblockNewLoginsAction,
  blockNewAttemptsAction,
  unblockNewAttemptsAction,
  attachEvidenceAction,
  closeIncidentAction,
} from "../actions";

const STATUS_BADGE: Record<string, "verified" | "warning" | "critical" | "neutral"> = {
  open: "critical", investigating: "warning", resolved: "verified", closed: "neutral",
};

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const incidentId = Number(id);
  const incident = getIncident(incidentId);
  // Voir lib/tenant-scope.ts : introuvable, pas "refusé", pour un incident
  // hors périmètre (incident plateforme, group_id NULL, reste visible).
  if (!incident || !hasIncidentAccess(session, incidentId)) notFound();
  const actions = listIncidentActions(incidentId) as { id: number; action_type: string; target_type: string | null; target_id: number | null; detail: string | null; created_at: string; actor_user_id: number }[];
  const isAdmin = session.role === "administrator";

  const candidates = [...listUsersByRole("candidate"), ...listUsersByRole("pedagogical_manager"), ...listUsersByRole("administrator")];
  const assessments = listAssessments();
  const platform = getPlatformStatus();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">Incident #{incident.id} — {incident.type}</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">{incident.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api/reports/incident-procedure" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">
            Procédure (PDF)
          </Link>
          <StatusBadge status={STATUS_BADGE[incident.status] ?? "neutral"}>{incident.status}</StatusBadge>
        </div>
      </div>

      {platform.maintenanceMode && (
        <div className="rounded-md border border-status-critical-border bg-status-critical-bg px-3 py-2 text-[12.5px] font-medium text-status-critical-text">
          Mode maintenance ACTIF sur toute la plateforme — nouvelles connexions et nouvelles tentatives bloquées (candidat/responsable/auditeur). Tentatives déjà en cours non affectées.
        </div>
      )}

      {isAdmin && incident.status !== "closed" && (
        <Card>
          <CardHeader title="Actions" description="Chaque action est réelle (effet immédiat) et génère automatiquement une trace ci-dessous" />
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-status-critical-border bg-status-critical-bg/40 p-3">
              <p className="mb-2 text-[12px] font-semibold text-status-critical-text uppercase">Actions immédiates plateforme</p>
              <p className="mb-3 text-[12px] text-text-tertiary">Le mode maintenance bloque à lui seul connexions ET nouvelles tentatives ; les deux blocages restent aussi actionnables séparément pour une réponse plus ciblée.</p>
              <div className="flex flex-wrap gap-2">
                <ToggleAction
                  active={platform.maintenanceMode}
                  onLabel="Activer le mode maintenance"
                  offLabel="Désactiver le mode maintenance"
                  onAction={enableMaintenanceModeAction.bind(null, incidentId)}
                  offAction={disableMaintenanceModeAction.bind(null, incidentId)}
                />
                <ToggleAction
                  active={platform.loginsBlocked && !platform.maintenanceMode}
                  disabled={platform.maintenanceMode}
                  onLabel="Bloquer les nouvelles connexions"
                  offLabel="Débloquer les nouvelles connexions"
                  onAction={blockNewLoginsAction.bind(null, incidentId)}
                  offAction={unblockNewLoginsAction.bind(null, incidentId)}
                />
                <ToggleAction
                  active={platform.attemptsBlocked && !platform.maintenanceMode}
                  disabled={platform.maintenanceMode}
                  onLabel="Bloquer les nouvelles tentatives"
                  offLabel="Débloquer les nouvelles tentatives"
                  onAction={blockNewAttemptsAction.bind(null, incidentId)}
                  offAction={unblockNewAttemptsAction.bind(null, incidentId)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border-subtle p-3">
                <p className="mb-2 text-[12px] font-semibold text-text-tertiary uppercase">Compte utilisateur</p>
                <SelectAction
                  options={candidates.map((c) => ({ value: c.id, label: `${c.full_name} (${c.username})` }))}
                  actions={[
                    { label: "Suspendre", action: suspendAccountAction.bind(null, incidentId), variant: "critical" },
                    { label: "Réactiver", action: reactivateAccountAction.bind(null, incidentId), variant: "default" },
                    { label: "Révoquer les sessions", action: revokeSessionsAction.bind(null, incidentId), variant: "default" },
                  ]}
                />
              </div>
              <div className="rounded-md border border-border-subtle p-3">
                <p className="mb-2 text-[12px] font-semibold text-text-tertiary uppercase">Évaluation</p>
                <SelectAction
                  options={assessments.map((a) => ({ value: a.id, label: a.name }))}
                  actions={[
                    { label: "Suspendre l'examen", action: suspendExamAction.bind(null, incidentId), variant: "critical" },
                    { label: "Réouvrir", action: reopenExamAction.bind(null, incidentId), variant: "default" },
                  ]}
                />
              </div>
            </div>

            <form action={addNoteAction.bind(null, incidentId)} className="flex gap-2">
              <input name="note" placeholder="Ajouter une note d'investigation…" className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
              <button type="submit" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">Ajouter</button>
            </form>
            <form action={addCorrectiveMeasureAction.bind(null, incidentId)} className="flex gap-2">
              <input name="measure" placeholder="Consigner une mesure corrective…" className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
              <button type="submit" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">Consigner</button>
            </form>
            <form action={attachEvidenceAction.bind(null, incidentId)} className="flex gap-2">
              <input name="evidence" placeholder="Rattacher une preuve (référence, description, lien vers capture/journal externe)…" className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-1.5 text-[13px]" />
              <button type="submit" className="rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong">Rattacher</button>
            </form>

            <form action={closeIncidentAction.bind(null, incidentId)}>
              <button type="submit" className="rounded-md bg-text-primary px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90">Clôturer l&apos;incident</button>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title={`${actions.length} action(s) tracée(s)`} />
        {actions.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">Aucune action pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {actions.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 text-[12.5px]">
                <span className="text-text-primary">
                  {a.action_type}{a.target_type ? ` — ${a.target_type}#${a.target_id}` : ""}{a.detail ? ` — ${a.detail}` : ""}
                </span>
                <span className="text-text-tertiary">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ToggleAction({
  active,
  disabled,
  onLabel,
  offLabel,
  onAction,
  offAction,
}: {
  active: boolean;
  disabled?: boolean;
  onLabel: string;
  offLabel: string;
  onAction: (formData: FormData) => Promise<void>;
  offAction: (formData: FormData) => Promise<void>;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border border-border-subtle px-2.5 py-1 text-[11.5px] font-medium text-text-tertiary">
        {offLabel} (inclus dans le mode maintenance)
      </span>
    );
  }
  return (
    <form action={active ? offAction : onAction}>
      <button
        type="submit"
        className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium ${
          active
            ? "border border-status-critical-border bg-status-critical-bg text-status-critical-text"
            : "border border-border-default text-text-secondary hover:border-border-strong"
        }`}
      >
        {active ? offLabel : onLabel}
      </button>
    </form>
  );
}

function SelectAction({
  options,
  actions,
}: {
  options: { value: number; label: string }[];
  // `action` doit être une référence stable vers une vraie Server Action
  // exportée (ex. `suspendAccountAction.bind(null, incidentId)`) — jamais une
  // closure locale : Next.js ne peut sérialiser une fonction à travers la
  // frontière serveur/client que si elle référence une action déclarée
  // top-level avec "use server".
  actions: { label: string; action: (formData: FormData) => Promise<void>; variant: "critical" | "default" }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {actions.map((a) => (
        <form key={a.label} action={a.action} className="flex gap-2">
          <select name="targetId" required className="flex-1 rounded-md border border-border-default bg-surface-base px-2 py-1 text-[12.5px]">
            <option value="">Sélectionner…</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11.5px] font-medium ${
              a.variant === "critical" ? "border border-status-critical-border bg-status-critical-bg text-status-critical-text" : "border border-border-default text-text-secondary hover:border-border-strong"
            }`}
          >
            {a.label}
          </button>
        </form>
      ))}
    </div>
  );
}
