import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

// Configuration reprise de V1 (platform-ops/kost-eexam-console-src/lib/session.ts)
// — même posture de sécurité (httpOnly, secure en prod, sameSite strict,
// expiration courte). Le cookie ne porte plus de jeton Moodle : il porte
// `dbSessionId`, la clé vers la table `sessions` native (registre serveur —
// voir lib/sessions-registry.ts), qui seule fait foi pour la révocation
// (§20 de la mission : un cookie chiffré seul ne peut jamais être invalidé
// de force avant son expiration naturelle).
export type ConsoleRole = "candidate" | "pedagogical_manager" | "administrator" | "auditor";

export interface AppSession {
  isLoggedIn: boolean;
  userId?: number;
  username?: string;
  fullName?: string;
  role?: ConsoleRole;
  dbSessionId?: number;
}

export function getSessionOptions(): SessionOptions {
  const sessionPassword = process.env.SESSION_SECRET;
  if (!sessionPassword || sessionPassword.length < 32) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court (minimum 32 caractères) — défini via variable d'environnement."
    );
  }
  return {
    password: sessionPassword,
    cookieName: "kost_eexam_v2_session",
    cookieOptions: {
      httpOnly: true,
      // `COOKIE_SECURE` permet de forcer explicitement (utilisé par la
      // suite E2E, qui tourne en build de production mais sur HTTP local
      // — un cookie "secure" serait alors silencieusement rejeté par le
      // navigateur, cassant l'authentification sans erreur visible). En
      // déploiement réel, ne jamais définir cette variable : le défaut
      // (sécurisé dès que NODE_ENV=production) reste inchangé.
      secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8h — même politique que V1
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(cookieStore, getSessionOptions());
}

export const ROLE_LABELS: Record<ConsoleRole, string> = {
  candidate: "Candidat",
  pedagogical_manager: "Responsable pédagogique",
  administrator: "Administrateur",
  auditor: "Auditeur",
};
