import { guardPage } from "@/lib/rbac";
import { listCompanies } from "@/lib/companies";
import { listGroups } from "@/lib/groups";
import { listFunctions } from "@/lib/functions";
import { Card, CardHeader } from "@/components/ui/Card";
import { CreateUserWizard } from "./CreateUserWizard";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; groupId?: string }>;
}) {
  await guardPage("administrator");
  const { companyId, groupId } = await searchParams;

  const companies = listCompanies();
  const groups = listGroups();
  const functions = listFunctions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Nouveau compte</h1>

      <Card>
        <CardHeader
          title="Créer un compte"
          description="Aucun mot de passe n'est jamais saisi ici — le titulaire du compte crée lui-même son mot de passe via un lien d'invitation sécurisé."
        />
        <CreateUserWizard
          companies={companies}
          groups={groups}
          functions={functions}
          preselectedCompanyId={companyId ? Number(companyId) : undefined}
          preselectedGroupId={groupId ? Number(groupId) : undefined}
        />
      </Card>
    </div>
  );
}
