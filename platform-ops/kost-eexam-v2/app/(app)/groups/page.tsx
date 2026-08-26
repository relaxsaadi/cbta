import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listGroups } from "@/lib/groups";
import { listCompanies } from "@/lib/companies";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users2 } from "lucide-react";
import { CreateGroupForm } from "./CreateGroupForm";

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { companyId } = await searchParams;
  const groups = listGroups();
  const companies = listCompanies();
  const canWrite = session.role !== "auditor";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Groupes</h1>

      {canWrite && (
        <Card>
          <CardHeader title="Nouveau groupe" description="Client → Groupe → Candidats" />
          <CreateGroupForm companies={companies} defaultCompanyId={companyId ? Number(companyId) : undefined} />
        </Card>
      )}

      <Card>
        <CardHeader title={`${groups.length} groupe(s)`} />
        {groups.length === 0 ? (
          <EmptyState icon={Users2} title="Aucun groupe" description="Créez un client puis un groupe pour commencer." />
        ) : (
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors">
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{g.name}</p>
                  <p className="text-[12px] text-text-tertiary">{g.company_name} — {g.member_count} candidat(s)</p>
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
