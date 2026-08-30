// Origine PUBLIQUE CANONIQUE pour construire une redirection absolue
// serveur -> navigateur — extrait du Route Handler de déconnexion
// (app/api/auth/logout/route.ts) pour rester testable (un Route Handler
// Next.js n'est pas directement testable par `node --test` dans ce projet
// — même convention déjà établie pour lib/email/webhook.ts::
// applyWebhookEvent, extraite de son route handler pour la même raison).
//
// Bug réel trouvé en préparant la démonstration auditeur par captures
// d'écran (2026-08-30) : `new URL("/login", request.url)` résolvait, sur
// staging derrière nginx, à l'adresse de liaison INTERNE du conteneur
// (`http://localhost:3000`) plutôt qu'à l'origine publique réelle — bien
// que nginx transmette correctement `Host`/`X-Forwarded-Proto`. La cause
// exacte réside dans la façon dont Next.js reconstruit `request.url` pour
// un Route Handler dans ce déploiement précis ; peu importe le mécanisme
// exact, la leçon est la même que celle déjà tirée pour les emails
// (lib/email/config.ts::getAppBaseUrl) : ne JAMAIS dériver une origine de
// redirection absolue d'un en-tête/URL CONTRÔLABLE PAR LE CLIENT
// (request.url, Host, X-Forwarded-Host) quand une origine publique
// canonique CONFIGURÉE existe déjà. Cette fonction ne lit donc JAMAIS la
// requête entrante quand APP_BASE_URL est configuré (c'est TOUJOURS le
// cas en staging/production réels) — un en-tête Host/X-Forwarded-Host
// falsifié ne peut donc structurellement jamais influencer la
// destination.
import { getAppBaseUrl } from "./email/config";

/** `fallbackUrl` ne sert QUE si APP_BASE_URL n'est pas configuré (jamais
 * le cas en staging/production réels, où le déploiement l'exige déjà pour
 * les liens email — voir deploy/README.md) — garde un développement local
 * sans `.env` complet fonctionnel plutôt que de faire échouer la
 * déconnexion. */
export function resolveCanonicalRedirectBase(fallbackUrl: string): string {
  try {
    return getAppBaseUrl();
  } catch {
    return fallbackUrl;
  }
}
