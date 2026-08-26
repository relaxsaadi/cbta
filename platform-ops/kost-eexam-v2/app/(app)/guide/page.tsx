import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Point d'entrée /guide — redirige vers le guide du rôle courant (§22).
export default async function GuideIndexPage() {
  const session = await getSession();
  const map: Record<string, string> = {
    candidate: "/guide/candidat",
    pedagogical_manager: "/guide/responsable-pedagogique",
    administrator: "/guide/administrateur",
    auditor: "/guide/auditeur",
  };
  redirect(map[session.role ?? ""] ?? "/guide/candidat");
}
