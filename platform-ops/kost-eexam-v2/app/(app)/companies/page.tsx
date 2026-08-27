import Link from "next/link";
import { guardPage } from "@/lib/rbac";
import { listCompanies, listCompaniesForManager, companyGroupCount } from "@/lib/companies";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/scope";
import { Building2 } from "lucide-react";
import { CreateCompanyForm } from "./CreateCompanyForm";

export default async function CompaniesPage() {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  // Frontière multi-client (lib/tenant-scope.ts) : un responsable
  // pédagogique ne voit que les clients qu'il gère, jamais la liste
  // globale — administrateur et auditeur gardent la vue complète.
  const companies = session.role === "pedagogical_manager" ? listCompaniesForManager(session.userId) : listCompanies();
  const canWrite = session.role !== "auditor";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Clients</h1>

      <Card>
        <CardHeader title="Nouveau client" description="Entreprise / organisation cliente" />
        <CreateCompanyForm canWrite={canWrite} />
      </Card>

      <Card>
        <CardHeader title={`${companies.length} client(s)`} />
        {companies.length === 0 ? (
          <EmptyState icon={Building2} title="Aucun client" description="Créez le premier client ci-dessus pour commencer." />
        ) : (
          <div className="flex flex-col gap-2">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2.5 hover:border-border-strong transition-colors"
              >
                <div>
                  <p className="text-[13.5px] font-medium text-text-primary">{c.name}</p>
                  <p className="text-[12px] text-text-tertiary">{companyGroupCount(c.id)} groupe(s)</p>
                </div>
                <StatusBadge status={SCOPE_BADGE[c.scope]}>{SCOPE_LABELS[c.scope]}</StatusBadge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
