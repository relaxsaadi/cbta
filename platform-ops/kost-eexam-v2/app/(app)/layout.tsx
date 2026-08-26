import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, ROLE_LABELS } from "@/lib/session";
import { isDbSessionValid } from "@/lib/sessions-registry";
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

  return (
    <ConsoleShell user={{ name: session.fullName ?? session.username ?? "?" }} role={session.role} roleLabel={ROLE_LABELS[session.role]}>
      {children}
    </ConsoleShell>
  );
}
