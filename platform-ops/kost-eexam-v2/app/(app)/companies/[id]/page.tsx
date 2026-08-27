import Link from "next/link";
import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getCompany } from "@/lib/companies";
import { listGroups } from "@/lib/groups";
import { hasCompanyAccess } from "@/lib/tenant-scope";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/scope";
import { Users2 } from "lucide-react";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const company = getCompany(Number(id));
  // Traité comme INTROUVABLE (pas "accès refusé") si ce client est hors du
  // périmètre de ce responsable — voir la justification dans
  // lib/tenant-scope.ts (ne pas confirmer l'existence d'un identifiant
  // deviné appartenant à un autre client).
  if (!company || !hasCompanyAccess(session, company.id)) notFound();

  const groups = listGroups().filter((g) => g.company_id === company.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">{company.name}</h1>
          <StatusBadge status={SCOPE_BADGE[company.scope]}>{SCOPE_LABELS[company.scope]}</StatusBadge>
        </div>
        <Link href={`/groups?companyId=${company.id}`} className="rounded-md bg-accent-9 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-10">
          + Nouveau groupe
        </Link>
      </div>

      <Card>
        <CardHeader title={`${groups.length} groupe(s)`} />
        {groups.length === 0 ? (
          <EmptyState icon={Users2} title="Aucun groupe" description="Créez un groupe pour commencer à ajouter des candidats." />
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{g.name}</p>
                  <p className="text-[12px] text-text-tertiary">{g.member_count} candidat(s){g.session_label ? ` — ${g.session_label}` : ""}</p>
                </div>
                <StatusBadge status={g.status === "active" ? "verified" : "neutral"}>{g.status === "active" ? "Actif" : "Clôturé"}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
