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
const PUBLIC_PATHS = ["/login", "/api/auth", "/api/attempts/sweep"];

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
