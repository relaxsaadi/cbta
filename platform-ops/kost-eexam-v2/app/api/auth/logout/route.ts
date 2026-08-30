import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";
import { resolveCanonicalRedirectBase } from "@/lib/canonical-url";

// Bug réel trouvé en préparant la démonstration auditeur par captures
// d'écran (2026-08-30) — voir lib/canonical-url.ts pour l'analyse complète
// et la correction (résolution de l'origine canonique jamais dérivée de
// request.url/Host, extraite pour rester testable). Conséquence réelle
// avant correctif : la session ÉTAIT bien invalidée côté serveur
// (logout() s'exécute avant la redirection), mais le navigateur était
// renvoyé vers une page inatteignable au lieu de l'écran de connexion.
export async function POST(request: Request) {
  await logout();
  // 303 (jamais 307) : un GET explicite vers /login après ce POST — un
  // navigateur suivant un 307 rejouerait la méthode POST sur /login, ce
  // qui n'est jamais l'intention après une action de changement d'état.
  return NextResponse.redirect(new URL("/login", resolveCanonicalRedirectBase(request.url)), 303);
}
