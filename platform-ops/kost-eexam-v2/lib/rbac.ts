import "server-only";
import { redirect } from "next/navigation";
import { getSession, type ConsoleRole } from "./session";
import { isDbSessionValid } from "./sessions-registry";

export class UnauthorizedError extends Error {
  constructor(message = "Non autorisé.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Garde à appeler en TÊTE de chaque server action / route mutante — jamais
 * une vérification côté UI seule (§19 de la mission : « RBAC serveur »).
 * Revérifie aussi la révocation server-side (§20) : un cookie valide dont la
 * session DB a été révoquée est refusé ici, pas seulement au prochain
 * rechargement de page. */
export async function requireRole(...allowed: ConsoleRole[]) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    throw new UnauthorizedError("Session expirée — reconnectez-vous.");
  }
  if (session.dbSessionId && !isDbSessionValid(session.dbSessionId)) {
    session.destroy();
    throw new UnauthorizedError("Session révoquée — reconnectez-vous.");
  }
  if (!allowed.includes(session.role)) {
    throw new UnauthorizedError(`Rôle "${session.role}" non autorisé pour cette action.`);
  }
  return session as typeof session & { userId: number; username: string; role: ConsoleRole };
}

/** L'auditeur ne peut JAMAIS écrire (§1.D / §19) — garde dédiée pour que
 * chaque mutation le refuse explicitement, jamais par omission d'un rôle
 * dans une liste `allowed`. */
export async function requireWriteRole(...allowed: Exclude<ConsoleRole, "auditor">[]) {
  return requireRole(...allowed);
}

/** Équivalent de requireRole() pour un Server Component PAGE (pas une
 * Server Action) : `redirect()` vers une page « Accès refusé » plutôt que
 * de laisser l'erreur remonter à app/(app)/error.tsx. En production,
 * Next.js redacte volontairement le message des erreurs Server Component
 * non gérées (sécurité — jamais de détail de stack/message renvoyé au
 * client) ; un thrown Error générique n'y arrive donc plus lisible. Un
 * refus reste tout aussi réel côté serveur — c'est un redirect, pas un
 * masquage UI — juste exprimé via l'API que Next.js attend pour ce cas. */
export async function guardPage(...allowed: ConsoleRole[]) {
  try {
    return await requireRole(...allowed);
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/acces-refuse");
    throw err;
  }
}
