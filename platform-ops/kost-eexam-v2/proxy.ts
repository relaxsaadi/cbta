import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { getSessionOptions, type AppSession } from "@/lib/session";

// Next.js 16 a renommé `middleware.ts` en `proxy.ts` (même comportement,
// exécuté par défaut en runtime Node.js — voir node_modules/next/dist/docs/
// .../proxy.md, consulté avant d'écrire ce fichier suite à l'avertissement
// de dépréciation ; AGENTS.md de ce projet demande explicitement de
// vérifier cette doc avant du code touchant aux conventions Next).
// Mission "PRODUCTION READINESS" §8/§16 — /api/attempts/sweep est le
// FILET DE SÉCURITÉ appelé par un cron externe toutes les 5 minutes
// (aucun cookie de session, jamais un navigateur — voir deploy/
// crontab.example) : il porte SA PROPRE authentification par jeton
// partagé (Authorization: Bearer SWEEP_TOKEN, vérifiée dans
// app/api/attempts/sweep/route.ts). Sans cette exemption, ce proxy
// redirigeait TOUTE requête sans session vers /login avant même que la
// route ait pu vérifier son jeton — rendant le cron structurellement
// incapable de fonctionner (bug réel trouvé et corrigé lors de
// l'installation du cron, jamais silencieusement contourné : le jeton
// reste une vraie vérification côté route, pas un contournement de
// sécurité côté proxy).
// Mission email §8-9/§37 — /activer et /mot-de-passe/* sont le flux
// d'activation/réinitialisation par JETON (jamais un cookie de session —
// un candidat qui reçoit une invitation n'est structurellement pas encore
// connecté). /api/webhooks/resend reçoit des requêtes du fournisseur
// Resend, jamais un navigateur avec cookie — sa propre vérification de
// signature (RESEND_WEBHOOK_SECRET) est la vraie authentification, même
// principe que /api/attempts/sweep ci-dessus. /api/notifications/reminders
// (mission email §22-23) est le MÊME cas que /api/attempts/sweep — cron
// externe sans cookie, sa propre vérification par SWEEP_TOKEN partagé
// (voir app/api/notifications/reminders/route.ts) ; exempté ici dès sa
// création pour ne PAS reproduire le bug historique découvert sur sweep.
const PUBLIC_PATHS = ["/login", "/activer", "/mot-de-passe", "/api/auth", "/api/attempts/sweep", "/api/notifications/reminders", "/api/health", "/api/webhooks/resend"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<AppSession>(request, response, getSessionOptions());

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Note : la révocation server-side réelle (table `sessions`, §20) est
  // revérifiée dans requireRole() à l'intérieur de chaque server
  // action/route mutante (lib/rbac.ts), pas ici — pour éviter une requête
  // SQLite synchrone sur CHAQUE requête statique/GET passant par ce proxy.
  // Les pages elles-mêmes (Server Components) la revérifient aussi à
  // l'affichage via requireRole côté layout applicatif.
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
