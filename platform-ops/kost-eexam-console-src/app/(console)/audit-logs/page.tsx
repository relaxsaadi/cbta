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
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Audit Logs</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Read-only view of Moodle&apos;s native activity log — {totalCount.toLocaleString()} events recorded in total,
          showing the {logs.length} most recent. Logs are never modified from this console.
          {demoMode && " Names and IPs are redacted (Audit Presentation Mode)."}
        </p>
      </div>

      <LogsTable logs={displayLogs} />
    </div>
  );
}
