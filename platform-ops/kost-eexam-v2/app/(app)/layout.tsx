import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ROLE_LABELS } from "@/lib/session";
import { isDbSessionValid } from "@/lib/sessions-registry";
import { getPlatformStatus } from "@/lib/platform-settings";
import { ConsoleShell } from "@/components/layout/ConsoleShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.role || !session.userId) {
    redirect("/login");
  }
  // Revalidation de la révocation server-side à chaque affichage (§20) — un
  // cookie valide dont la session DB a été révoquée par un administrateur
  // (incident, "déconnecter toutes les sessions") ne doit pas continuer à
  // fonctionner jusqu'à expiration naturelle du cookie chiffré.
  if (session.dbSessionId && !isDbSessionValid(session.dbSessionId)) {
    session.destroy();
    redirect("/login");
  }

  // Addendum §9-11 — bannière visible de TOUS les rôles connectés (pas
  // seulement sur la fiche incident) : un candidat/responsable déjà
  // connecté doit comprendre pourquoi il ne peut plus démarrer de
  // nouvelle tentative pendant une maintenance déclarée.
  const platform = getPlatformStatus();

  return (
    <ConsoleShell user={{ name: session.fullName ?? session.username ?? "?" }} role={session.role} roleLabel={ROLE_LABELS[session.role]}>
      {platform.maintenanceMode && (
        <div className="mb-4 rounded-md border border-status-critical-border bg-status-critical-bg px-3 py-2 text-[12.5px] font-medium text-status-critical-text">
          Mode maintenance actif — nouvelles connexions et nouvelles tentatives temporairement suspendues. Les tentatives déjà en cours ne sont pas affectées.
        </div>
      )}
      {!platform.maintenanceMode && platform.attemptsBlocked && (
        <div className="mb-4 rounded-md border border-status-warning-border bg-status-warning-bg px-3 py-2 text-[12.5px] font-medium text-status-warning-text">
          Démarrage de nouvelles tentatives temporairement suspendu. Les tentatives déjà en cours ne sont pas affectées.
        </div>
      )}
      {children}
    </ConsoleShell>
  );
}
