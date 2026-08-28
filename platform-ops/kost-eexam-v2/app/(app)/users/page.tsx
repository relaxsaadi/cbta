import { guardPage } from "@/lib/rbac";
import { listUsersByRole } from "@/lib/users";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ROLE_LABELS, type ConsoleRole } from "@/lib/session";
import { CreateUserForm } from "./CreateUserForm";
import { quickSuspendAction, quickReactivateAction, adminResetMfaAction } from "./actions";

const ROLES: ConsoleRole[] = ["administrator", "pedagogical_manager", "auditor", "candidate"];

export default async function UsersPage() {
  await guardPage("administrator");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[20px] font-semibold text-text-primary">Utilisateurs</h1>

      <Card>
        <CardHeader title="Nouveau compte" description="Attribution du rôle obligatoire à la création — un compte sans rôle ne peut se connecter" />
        <CreateUserForm />
      </Card>

      {ROLES.map((role) => {
        const users = listUsersByRole(role);
        return (
          <Card key={role}>
            <CardHeader title={`${ROLE_LABELS[role]} (${users.length})`} />
            {users.length === 0 ? (
              <p className="text-[13px] text-text-tertiary">Aucun compte.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {users.map((u) => (
                  <div key={u.id} data-testid={`user-row-${u.username}`} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{u.full_name}</p>
                      <p className="text-[11.5px] text-text-tertiary">{u.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.mfa_enabled === 1 && (
                        <>
                          <StatusBadge status="verified">MFA actif</StatusBadge>
                          {/* Mission §25 — voie de récupération : compte verrouillé
                              (téléphone perdu ET codes de secours épuisés). Réservée à
                              l'administrateur, jamais en libre-service pour la cible. */}
                          <form action={adminResetMfaAction.bind(null, u.id)}>
                            <button
                              type="submit"
                              title="Réinitialiser MFA (perte de téléphone / codes de secours épuisés)"
                              className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:bg-surface-base"
                            >
                              Réinitialiser MFA
                            </button>
                          </form>
                        </>
                      )}
                      <StatusBadge status={u.status === "active" ? "verified" : "critical"}>{u.status === "active" ? "Actif" : "Suspendu"}</StatusBadge>
                      {u.status === "active" ? (
                        <form action={quickSuspendAction.bind(null, u.id)}>
                          <button type="submit" className="rounded-md border border-status-critical-border bg-status-critical-bg px-2.5 py-1 text-[11.5px] font-medium text-status-critical-text">
                            Suspendre
                          </button>
                        </form>
                      ) : (
                        <form action={quickReactivateAction.bind(null, u.id)}>
                          <button type="submit" className="rounded-md bg-accent-9 px-2.5 py-1 text-[11.5px] font-medium text-white">
                            Réactiver
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
