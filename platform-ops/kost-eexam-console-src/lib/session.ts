import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type ConsoleRole = "administrator" | "exam_manager" | "instructor" | "auditor";

export interface ConsoleSession {
  isLoggedIn: boolean;
  userId?: number;
  username?: string;
  fullName?: string;
  role?: ConsoleRole;
  // Le token Moodle ne quitte jamais le serveur : stocké côté serveur dans
  // le cookie chiffré (iron-session), jamais transmis au navigateur en clair
  // ni accessible via JS côté client.
  moodleToken?: string;
}

// Le contrôle du secret est différé à l'appel (getSessionOptions()), pas à
// l'import du module — sinon `next build` échoue en collectant les pages,
// car les variables d'environnement runtime ne sont injectées qu'au
// démarrage du conteneur (docker-compose env_file), pas au build.
export function getSessionOptions(): SessionOptions {
  const sessionPassword = process.env.SESSION_SECRET;
  if (!sessionPassword || sessionPassword.length < 32) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court (minimum 32 caractères) — défini via variable d'environnement."
    );
  }
  return {
    password: sessionPassword,
    cookieName: "kost_eexam_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8h — session admin, pas persistante indéfiniment
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<ConsoleSession>(cookieStore, getSessionOptions());
}
