import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { VerifyMfaForm } from "./VerifyMfaForm";

export default async function VerifyMfaPage() {
  const session = await getSession();
  if (session.isLoggedIn && session.role) {
    redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
  }
  // Aucune connexion en attente de second facteur (accès direct à
  // l'URL, ou session déjà expirée) — retour au formulaire normal,
  // jamais une page qui exposerait un état MFA sans mot de passe déjà
  // vérifié.
  if (!session.pendingMfaUserId) {
    redirect("/login");
  }
  return <VerifyMfaForm />;
}
