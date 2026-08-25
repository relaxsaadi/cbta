import { getAuditLogs, getAuditLogCount } from "@/lib/audit-logs-data";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName, redactIp } from "@/lib/demo-mode";
import { LogsTable } from "./LogsTable";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const [logs, totalCount, demoMode] = await Promise.all([
    getAuditLogs(200),
    getAuditLogCount(),
    isDemoModeActive(),
  ]);

  const displayLogs = demoMode
    ? logs.map((l) => ({
        ...l,
        userFullName: redactName(l.userFullName),
        ip: l.ip ? redactIp(l.ip) : l.ip,
      }))
    : logs;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Journaux d&apos;audit</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Vue en lecture seule du journal d&apos;activité natif de Moodle — {totalCount.toLocaleString("fr-FR")} événements
          enregistrés au total, affichant les {logs.length} plus récents. Les journaux ne sont jamais
          modifiés depuis cette console.
          {demoMode && " Noms et IP sont masqués (Mode présentation)."}
        </p>
      </div>

      <LogsTable logs={displayLogs} />
    </div>
  );
}
