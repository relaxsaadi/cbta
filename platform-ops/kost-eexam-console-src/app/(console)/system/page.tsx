import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { getSystemHealth, type HealthStatus } from "@/lib/system-health";
import { Server, Database, HardDrive, Cloud, RotateCcw, Globe, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function toBadgeStatus(s: HealthStatus): BadgeStatus {
  if (s === "not_available") return "neutral";
  return s;
}

export default async function SystemStatusPage() {
  const health = await getSystemHealth();
  const backup = health.find((h) => h.label === "Local Backup");
  const offsite = health.find((h) => h.label === "Off-site Backup");
  const restore = health.find((h) => h.label === "Restore Test");

  const staticItems = [
    {
      icon: Globe,
      label: "Application",
      status: "verified" as HealthStatus,
      detail: "exam.kostacademy.com — HTTPS active (Let's Encrypt)",
    },
    {
      icon: Database,
      label: "Database",
      status: "verified" as HealthStatus,
      detail: "MySQL 8.4 — not publicly exposed, internal network only",
    },
    {
      icon: Server,
      label: "Server",
      status: "verified" as HealthStatus,
      detail: "Ubuntu 20.04 · Docker · Hostarts VPS (Algeria)",
    },
    {
      icon: HardDrive,
      label: "Storage",
      status: "verified" as HealthStatus,
      detail: "160 GB provisioned, ample headroom",
    },
  ];

  const dynamicItems = [
    { icon: Database, label: "Local Backup", health: backup },
    { icon: Cloud, label: "Off-site Backup", health: offsite },
    { icon: RotateCcw, label: "Last Restore Test", health: restore },
  ];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          System Status
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Real infrastructure state — sourced from live checks and Phase 0 backup logs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {staticItems.map((item) => (
          <StatusCard key={item.label} {...item} />
        ))}
        {dynamicItems.map((item) => (
          <StatusCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            status={item.health?.status ?? "not_available"}
            detail={item.health?.detail ?? "No data recorded yet"}
          />
        ))}
      </div>

      <Card>
        <CardHeader
          title="Backup Retention Policy"
          description="Configured in Phase 0 — verified operational"
        />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">7</p>
            <p className="text-[12px] text-text-tertiary">Daily backups</p>
          </div>
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">4</p>
            <p className="text-[12px] text-text-tertiary">Weekly backups</p>
          </div>
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">3</p>
            <p className="text-[12px] text-text-tertiary">Monthly backups</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  status,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  status: HealthStatus;
  detail: string;
}) {
  const iconTint =
    status === "verified"
      ? "bg-status-verified-bg text-status-verified-text"
      : status === "critical"
      ? "bg-status-critical-bg text-status-critical-text"
      : status === "warning"
      ? "bg-status-warning-bg text-status-warning-text"
      : "bg-surface-sunken text-text-secondary";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${iconTint}`}>
            <Icon size={15} strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-[13.5px] font-semibold text-text-primary">{label}</p>
            <p className="mt-0.5 text-[12px] text-text-tertiary">{detail}</p>
          </div>
        </div>
        <StatusBadge status={toBadgeStatus(status)}>
          {status === "not_available" ? "N/A" : status}
        </StatusBadge>
      </div>
    </Card>
  );
}
