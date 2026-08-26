import { guardPage } from "@/lib/rbac";
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
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Sauvegarde &amp; restauration</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Dernière sauvegarde" />
          {lastBackup ? (
            <div className="flex flex-col gap-1 text-[13px]">
              <StatusBadge status={lastBackup.status === "success" ? "verified" : "critical"}>{lastBackup.status === "success" ? "Réussie" : "Échec"}</StatusBadge>
              <p className="text-text-secondary">{new Date(lastBackup.created_at).toLocaleString("fr-FR")}</p>
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
              <p className="text-text-secondary">{new Date(lastRestore.created_at).toLocaleString("fr-FR")}</p>
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
                <span className="text-text-tertiary">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                <StatusBadge status={r.status === "success" ? "verified" : "critical"}>{r.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
