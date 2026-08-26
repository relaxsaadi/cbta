import { guardPage } from "@/lib/rbac";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";

const SECTIONS = [
  { href: "/companies", label: "Clients" },
  { href: "/groups", label: "Groupes" },
  { href: "/exam-preparation", label: "Examens et paramètres" },
  { href: "/results", label: "Résultats et réponses" },
  { href: "/incidents", label: "Incidents" },
  { href: "/audit-logs", label: "Journal d'audit" },
  { href: "/system", label: "Sauvegardes / restauration" },
];

export default async function GuideAuditeurPage() {
  await guardPage("auditor", "administrator");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Guide — Auditeur</h1>
      <Card>
        <CardHeader title="Accès" description="Lecture seule sur tout le périmètre — aucune action de modification n'est jamais possible, y compris en forçant une URL directement." />
        <StatusBadge status="neutral">Lecture seule appliquée côté serveur, pas seulement masquée à l&apos;écran</StatusBadge>
      </Card>
      <Card>
        <CardHeader title="Sections consultables" />
        <div className="flex flex-col gap-2">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-md border border-border-subtle px-3.5 py-2.5 text-[13.5px] font-medium text-text-primary hover:border-border-strong">
              {s.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
