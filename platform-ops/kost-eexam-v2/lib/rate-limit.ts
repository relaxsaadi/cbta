// Pas de garde `import "server-only"` ICI (volontaire, même justification
// que lib/db.ts) : module de pure logique de comptage, sans secret ni
// donnée sensible directement exposée (juste des clés IP+utilisateur
// transitoires en mémoire), et doit rester testable via `node --test`
// (tsx) hors bundler Next — `server-only` y lève une exception. La
// protection réelle contre une fuite côté client existe déjà : ce module
// n'est importé que depuis lib/auth.ts, qui lui EST gardé.

// Limiteur de tentatives en mémoire — protection anti-force-brute sur la
// connexion (absente jusqu'ici, trouvée lors de la revue sécurité de la
// phase staging). Les facteurs mot de passe et MFA ont volontairement des
// buckets distincts. Cela empêche une nouvelle soumission correcte du mot
// de passe de remettre à zéro les échecs du second facteur — possession du
// facteur 1 ne doit jamais neutraliser la protection du facteur 2.
//
// La partie IP+utilisateur évite un blocage collectif d'un bureau/NAT ; le
// suffixe de facteur rend les sémantiques de reset explicites et évite tout
// recouplage accidentel futur entre mot de passe et MFA.
//
// Limite connue et assumée : stockage en mémoire de PROCESSUS, adapté au
// déploiement actuel (une seule instance Node par service, pas de scaling
// horizontal — voir Dockerfile / docs déploiement). Une évolution multi-
// instance nécessiterait un magasin partagé (Redis ou équivalent) ; hors
// périmètre de ce pilote staging, à traiter avant toute mise à l'échelle
// horizontale en production.
interface Bucket {
  failures: number;
  windowStart: number;
}

export type LoginRateLimitFactor = "password" | "mfa";

export function buildLoginRateLimitKey(ip: string | undefined, username: string, factor: LoginRateLimitFactor): string {
  return `${ip ?? "unknown"}:${username}:${factor}`;
}

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

const buckets = new Map<string, Bucket>();

// Purge best-effort des fenêtres expirées pour éviter une croissance non
// bornée de la Map sur un processus longue durée — appelée à chaque accès,
// pas de timer séparé à gérer.
function currentBucket(key: string, now: number): Bucket | undefined {
  const bucket = buckets.get(key);
  if (bucket && now - bucket.windowStart > WINDOW_MS) {
    buckets.delete(key);
    return undefined;
  }
  return bucket;
}

export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = currentBucket(key, now);
  if (!bucket || bucket.failures < MAX_FAILURES) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000)) };
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const bucket = currentBucket(key, now);
  if (!bucket) buckets.set(key, { failures: 1, windowStart: now });
  else bucket.failures += 1;
}

export function resetLoginRateLimit(key: string): void {
  buckets.delete(key);
}
