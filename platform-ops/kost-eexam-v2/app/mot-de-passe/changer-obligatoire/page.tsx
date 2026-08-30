import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { ForcedPasswordChangeForm } from "./ForcedPasswordChangeForm";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §7-9 — route
// délibérément HORS du groupe (app) (même convention que /mot-de-passe/
// reinitialiser) : app/(app)/layout.tsx redirige ICI dès que
// must_change_password=1, donc cette page ne peut jamais elle-même passer
// par ce layout sans provoquer une boucle de redirection infinie. Garde de
// session minimale directement ici (pas guardPage — un utilisateur de
// N'IMPORTE quel rôle avec un accès temporaire doit pouvoir l'atteindre).
export default async function ChangerMotDePasseObligatoirePage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }
  const user = findUserById(session.userId);
  if (!user) redirect("/login");
  // Déjà traité entre-temps (autre onglet) — jamais bloquer un utilisateur
  // dont le compte est en fait déjà en règle.
  if (user.must_change_password !== 1) {
    redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center font-display text-[19px] font-semibold text-text-primary">KOST E-EXAM V2</h1>
        <ForcedPasswordChangeForm landingPath={session.role === "candidate" ? "/mes-examens" : "/overview"} />
      </div>
    </div>
  );
}
