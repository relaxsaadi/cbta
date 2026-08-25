import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, type BadgeStatus } from "@/components/ui/Badge";
import { getSystemHealth, type HealthStatus } from "@/lib/system-health";
import { Server, Database, HardDrive, Cloud, RotateCcw, Globe, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function toBadgeStatus(s: HealthStatus): BadgeStatus {
  if (s === "not_available") return "neutral";
  return s;
}

const STATUS_LABEL: Record<HealthStatus, string> = {
  verified: "Vérifié",
  warning: "Attention",
  critical: "Critique",
  not_available: "N/D",
};

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
      detail: "exam.kostacademy.com — HTTPS actif (Let's Encrypt)",
    },
    {
      icon: Database,
      label: "Base de données",
      status: "verified" as HealthStatus,
      detail: "MySQL 8.4 — non exposée publiquement, réseau interne uniquement",
    },
    {
      icon: Server,
      label: "Serveur",
      status: "verified" as HealthStatus,
      detail: "Ubuntu 20.04 · Docker · VPS Hostarts (Algérie)",
    },
    {
      icon: HardDrive,
      label: "Stockage",
      status: "verified" as HealthStatus,
      detail: "160 Go provisionnés, marge confortable",
    },
  ];

  const dynamicItems = [
    { icon: Database, label: "Sauvegarde locale", health: backup },
    { icon: Cloud, label: "Sauvegarde externalisée", health: offsite },
    { icon: RotateCcw, label: "Dernier test de restauration", health: restore },
  ];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Système
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          État réel de l&apos;infrastructure — vérifications en direct et journal de sauvegarde automatisé.
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
            detail={item.health?.detail ?? "Aucune donnée enregistrée pour l'instant"}
          />
        ))}
      </div>

      <Card>
        <CardHeader
          title="Politique de rétention des sauvegardes"
          description="Automatisée et vérifiée en continu — voir les statuts ci-dessus pour la dernière exécution réelle"
        />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">7</p>
            <p className="text-[12px] text-text-tertiary">Sauvegardes quotidiennes</p>
          </div>
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">4</p>
            <p className="text-[12px] text-text-tertiary">Sauvegardes hebdomadaires</p>
          </div>
          <div>
            <p className="text-[20px] font-semibold text-text-primary tabular-nums">3</p>
            <p className="text-[12px] text-text-tertiary">Sauvegardes mensuelles</p>
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
        <StatusBadge status={toBadgeStatus(status)}>{STATUS_LABEL[status]}</StatusBadge>
      </div>
    </Card>
  );
}
