// Pas de garde `import "server-only"` ici (même justification que
// lib/passwords.ts, lib/tenant-scope.ts, lib/rate-limit.ts, lib/db.ts) :
// ce module de pure logique cryptographique doit rester testable via
// `node --test` (tsx) hors du bundler Next.js, où `server-only` lève une
// exception inconditionnelle. Seuls les appelants (server actions/routes)
// portent la garde réelle.
//
// MFA — TOTP natif (RFC 6238 / RFC 4226), zéro dépendance externe.
// Mission "PRODUCTION READINESS" §25 : ADMINISTRATEUR = cible obligatoire,
// RESPONSABLE PÉDAGOGIQUE = fortement recommandé. Implémentation
// entièrement native (node:crypto HMAC-SHA1, déjà utilisé ailleurs dans ce
// projet pour le hachage de mot de passe — voir lib/passwords.ts) : aucun
// service tiers, aucune dépendance npm nouvelle — cohérent avec le principe
// « zéro compilation native / dépendances minimales » déjà appliqué au
// choix de node:sqlite.
//
// Décision de politique explicite, pas une omission : ce module rend MFA
// PLEINEMENT FONCTIONNEL (activable par n'importe quel administrateur ou
// responsable pédagogique, dès maintenant) mais ne le rend pas
// OBLIGATOIRE de force pour tous les comptes administrateur existants
// cette session — forcer maintenant risquerait de verrouiller le seul
// compte capable d'administrer la plateforme sans qu'un test de bout en
// bout du parcours de récupération ait été validé par le propriétaire du
// compte. Rendre MFA obligatoire pour tous les administrateurs avant la
// bascule production est un interrupteur de politique recommandé, pas
// actionné unilatéralement ici (voir docs/KOST_EEXAM_V2_PRODUCTION_
// READINESS_REPORT.md).
import { randomBytes, createHmac } from "node:crypto";
import { hashPassword, verifyPassword } from "./passwords";
import { getDb } from "./db";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;
const WINDOW = 1; // ±1 pas (30s) de tolérance de dérive d'horloge, standard.

// Exporté pour les tests (encoder le secret ASCII des vecteurs RFC 6238
// Annexe B en base32, format attendu par les fonctions publiques
// ci-dessous) — jamais utilisé côté production hors de generateMfaSecret().
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Nouveau secret TOTP — 20 octets (160 bits), format standard pour la
 * compatibilité avec toute application d'authentification (Google
 * Authenticator, Authy, 1Password, etc.). */
export function generateMfaSecret(): string {
  return base32Encode(randomBytes(20));
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  // RFC 4226 : compteur en 8 octets big-endian. JS Number reste précis
  // jusqu'à 2^53 — largement suffisant (2^32 pas de 30s = >4000 ans).
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  const hmac = createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const truncated = ((hmac[offset]! & 0x7f) << 24) | ((hmac[offset + 1]! & 0xff) << 16) | ((hmac[offset + 2]! & 0xff) << 8) | (hmac[offset + 3]! & 0xff);
  return String(truncated % 10 ** DIGITS).padStart(DIGITS, "0");
}

/** Exporté pour permettre un test unitaire déterministe contre les
 * vecteurs de test officiels RFC 6238 Annexe B (temps fixe, pas
 * `Date.now()`) — voir tests/unit/mfa.test.ts. `verifyTotpCode`
 * ci-dessous, utilisé en production, reste basé sur l'heure réelle. */
export function totpAt(secretBase32: string, timeMs: number): string {
  const counter = Math.floor(timeMs / 1000 / STEP_SECONDS);
  return hotp(base32Decode(secretBase32), counter);
}

/** Vérifie un code TOTP saisi par l'utilisateur, avec tolérance de dérive
 * d'horloge (±1 pas de 30s, standard). Ne révèle jamais si l'écart est dû
 * à un code faux ou à une horloge désynchronisée — un seul résultat
 * booléen, comme toute vérification de secret. */
export function verifyTotpCode(secretBase32: string, code: string): boolean {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Date.now();
  for (let w = -WINDOW; w <= WINDOW; w++) {
    if (totpAt(secretBase32, now + w * STEP_SECONDS * 1000) === clean) return true;
  }
  return false;
}

/** URI otpauth:// standard — la plupart des applications d'authentification
 * l'acceptent en QR OU en saisie manuelle du secret seul (voir
 * formatSecretForDisplay ci-dessous, pour l'app qui ne supporte que la
 * saisie manuelle). */
export function buildOtpAuthUri(secretBase32: string, accountName: string): string {
  const issuer = "KOST E-EXAM V2";
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

/** Formatage lisible pour saisie manuelle (groupes de 4 caractères) —
 * convention universelle des applications d'authentification. */
export function formatSecretForDisplay(secretBase32: string): string {
  return secretBase32.match(/.{1,4}/g)?.join(" ") ?? secretBase32;
}

const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/I/l)

function generateOneRecoveryCode(): string {
  const bytes = randomBytes(10);
  let code = "";
  for (const b of bytes) code += RECOVERY_CODE_ALPHABET[b % RECOVERY_CODE_ALPHABET.length];
  return `${code.slice(0, 5)}-${code.slice(5, 10)}`;
}

/** Codes de secours à usage unique — générés en clair UNE SEULE FOIS
 * (affichés à l'utilisateur, jamais reconsultables), stockés hachés
 * (scrypt, même fonction que les mots de passe — lib/passwords.ts). */
export function generateRecoveryCodes(): { plain: string[]; hashedJson: string } {
  const plain = Array.from({ length: RECOVERY_CODE_COUNT }, generateOneRecoveryCode);
  const hashed = plain.map((code) => hashPassword(code));
  return { plain, hashedJson: JSON.stringify(hashed) };
}

/** Consomme un code de secours si valide (usage unique — retiré de la
 * liste dès consommation, jamais réutilisable). Retourne le JSON restant
 * à persister si valide, ou null si invalide. */
export function consumeRecoveryCode(hashedJson: string, submittedCode: string): string | null {
  let hashes: string[];
  try {
    hashes = JSON.parse(hashedJson);
  } catch {
    return null;
  }
  const idx = hashes.findIndex((h) => verifyPassword(submittedCode.trim().toUpperCase(), h));
  if (idx === -1) return null;
  hashes.splice(idx, 1);
  return JSON.stringify(hashes);
}

export function isMfaEnabled(userId: number): boolean {
  const row = getDb().prepare(`SELECT mfa_enabled FROM users WHERE id = ?`).get(userId) as { mfa_enabled: number } | undefined;
  return row?.mfa_enabled === 1;
}
