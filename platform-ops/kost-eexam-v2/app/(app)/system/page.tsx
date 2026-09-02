import { guardPage } from "@/lib/rbac";
import { formatAlgeriaDateTime } from "@/lib/timezone";
import { listBackupRecords, latestOfType, BACKUP_POLICY } from "@/lib/backup";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

export default async function SystemPage() {
  await guardPage("administrator", "auditor");
  const records = listBackupRecords();
  const lastBackup = latestOfType("full_db");
  const lastRestore = latestOfType("restore_test");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[20px] font-semibold text-text-primary">Sauvegarde &amp; restauration</h1>
        {/* Mission "URGENT AUDITOR FOLLOW-UP — ALGERIA TIMEZONE + SERVER
            CHARACTERISTICS" (2026-09-02) §14 — même périmètre que cette
            page (administrator + auditeur lecture seule), jamais une
            UI d'administration d'infrastructure élargie. */}
        <a
          href="/api/reports/server-characteristics"
          className="shrink-0 rounded-md border border-border-default px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong"
        >
          Caractéristiques serveur — PDF
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Dernière sauvegarde" />
          {lastBackup ? (
            <div className="flex flex-col gap-1 text-[13px]">
              <StatusBadge status={lastBackup.status === "success" ? "verified" : "critical"}>{lastBackup.status === "success" ? "Réussie" : "Échec"}</StatusBadge>
              <p className="text-text-secondary">{formatAlgeriaDateTime(lastBackup.created_at, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
              <p className="text-text-tertiary text-[12px]">{lastBackup.size_bytes ? `${(lastBackup.size_bytes / 1024).toFixed(0)} Ko` : ""} {lastBackup.sha256 ? `— sha256 ${lastBackup.sha256.slice(0, 16)}…` : ""}</p>
            </div>
          ) : (
            <p className="text-[13px] text-text-tertiary">Aucune sauvegarde enregistrée pour l&apos;instant — exécuter <code>pnpm backup</code>.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Dernier test de restauration" />
          {lastRestore ? (
            <div className="flex flex-col gap-1 text-[13px]">
              <StatusBadge status={lastRestore.status === "success" ? "verified" : "critical"}>{lastRestore.status === "success" ? "Réussi" : "Échec"}</StatusBadge>
              <p className="text-text-secondary">{formatAlgeriaDateTime(lastRestore.created_at, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
              <p className="text-text-tertiary text-[12px]">{lastRestore.detail}</p>
            </div>
          ) : (
            <p className="text-[13px] text-text-tertiary">Aucun test de restauration enregistré pour l&apos;instant — exécuter <code>pnpm restore-test</code>.</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Politique" description="RPO / RTO / rétention — documentés, pas seulement affirmés" />
        <dl className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div><dt className="text-text-tertiary">RPO</dt><dd className="font-medium text-text-primary">{BACKUP_POLICY.rpoHours} h</dd></div>
          <div><dt className="text-text-tertiary">RTO</dt><dd className="font-medium text-text-primary">{BACKUP_POLICY.rtoMinutes} min</dd></div>
          <div><dt className="text-text-tertiary">Rétention quotidienne</dt><dd className="font-medium text-text-primary">{BACKUP_POLICY.retentionDailyCopies} copies</dd></div>
          <div><dt className="text-text-tertiary">Rétention hebdomadaire</dt><dd className="font-medium text-text-primary">{BACKUP_POLICY.retentionWeeklyCopies} copies</dd></div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Historique" />
        {records.length === 0 ? (
          <p className="text-[13px] text-text-tertiary">Aucun événement enregistré.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 text-[12.5px]">
                <span className="text-text-primary">{r.type === "full_db" ? "Sauvegarde complète" : "Test de restauration"}</span>
                <span className="text-text-tertiary">{formatAlgeriaDateTime(r.created_at, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                <StatusBadge status={r.status === "success" ? "verified" : "critical"}>{r.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
