import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ROLE_LABELS } from "@/lib/session";
import { isDbSessionValid } from "@/lib/sessions-registry";
import { getPlatformStatus } from "@/lib/platform-settings";
import { findUserById } from "@/lib/users";
import { isTemporaryPasswordExpired } from "@/lib/temp-password";
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

  // Mot de passe temporaire (mission "ADMIN/CLIENT/CANDIDATE UX
  // IMPROVEMENTS", 2026-08-30, §7) — point d'application UNIQUE, avant
  // TOUTE page protégée (jamais une vérification par page, qui serait
  // facile à oublier sur une nouvelle route) : must_change_password force
  // la redirection vers l'écran de changement obligatoire. Requêté frais
  // en base à chaque affichage (jamais depuis le cookie de session, qui ne
  // reflète pas un accès temporaire posé APRÈS la connexion en cours).
  // Édition du même jeu de garanties que la révocation server-side
  // ci-dessus : un flag posé pendant une session déjà active doit prendre
  // effet immédiatement, pas seulement à la prochaine connexion.
  const currentUser = findUserById(session.userId);
  if (currentUser?.must_change_password === 1) {
    if (isTemporaryPasswordExpired(currentUser)) {
      // Expiré PENDANT une session déjà active (le login lui-même bloque
      // déjà ce cas pour une NOUVELLE connexion, voir lib/auth.ts) — jamais
      // laisser une session active continuer sur un accès temporaire expiré.
      session.destroy();
      redirect("/login");
    }
    redirect("/mot-de-passe/changer-obligatoire");
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
