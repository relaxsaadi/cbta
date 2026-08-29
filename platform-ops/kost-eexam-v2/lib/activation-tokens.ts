// Jetons d'activation de compte / réinitialisation de mot de passe (mission
// email §8-9 — CRITIQUE : jamais un mot de passe envoyé par email). Même
// discipline que lib/sessions-registry.ts pour le stockage du jeton :
// jamais en clair en base, seul son hash SHA-256 l'est ; le jeton en clair
// n'existe que le temps de cet appel (retourné une fois, jamais journalisé,
// jamais reloggé).
import { createHash, randomBytes } from "node:crypto";
import { getDb, nowIso } from "./db";

export type ActivationTokenPurpose = "account_setup" | "password_reset";

const ACCOUNT_SETUP_TTL_HOURS = 24;
const PASSWORD_RESET_TTL_HOURS = 2;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function ttlHoursFor(purpose: ActivationTokenPurpose): number {
  return purpose === "account_setup" ? ACCOUNT_SETUP_TTL_HOURS : PASSWORD_RESET_TTL_HOURS;
}

/** Crée un nouveau jeton — n'invalide PAS les jetons précédents du même
 * type pour cet utilisateur par défaut (voir invalidatePendingTokens pour
 * un renvoi explicite, §41 : "un lien expiré → générer un nouveau jeton
 * sécurisé, jamais réutiliser l'ancien"). Le jeton en clair est renvoyé
 * UNE fois — c'est à l'appelant de l'insérer dans l'URL de l'email
 * immédiatement, jamais de le stocker ni de le logger. */
export function createActivationToken(params: {
  userId: number;
  purpose: ActivationTokenPurpose;
  createdBy?: number | null;
  ipAddress?: string | null;
}): { token: string; expiresAt: string } {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHoursFor(params.purpose) * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO activation_tokens (user_id, token_hash, purpose, created_at, expires_at, created_by, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(params.userId, tokenHash, params.purpose, now.toISOString(), expiresAt, params.createdBy ?? null, params.ipAddress ?? null);
  return { token, expiresAt };
}

export interface ActivationTokenRow {
  id: number;
  user_id: number;
  purpose: ActivationTokenPurpose;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

/** Vérifie un jeton présenté par le candidat (jamais l'inverse — on ne
 * cherche jamais "quel est le jeton de cet utilisateur", uniquement "à qui
 * appartient ce jeton précis", pour ne jamais exposer un jeton d'un autre
 * utilisateur). Ne consomme PAS le jeton — voir consumeActivationToken,
 * appelé séparément une fois le nouveau mot de passe validé côté serveur. */
export function verifyActivationToken(token: string, purpose: ActivationTokenPurpose): ActivationTokenRow | null {
  const db = getDb();
  const tokenHash = hashToken(token);
  const row = db
    .prepare(`SELECT * FROM activation_tokens WHERE token_hash = ? AND purpose = ?`)
    .get(tokenHash, purpose) as ActivationTokenRow | undefined;
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

/** À usage unique — appelé UNIQUEMENT après que le nouveau mot de passe a
 * été écrit avec succès (même transaction applicative). Un jeton déjà
 * consommé ne redevient jamais valide (§9 : "invalidated on use"). */
export function consumeActivationToken(tokenId: number): void {
  getDb().prepare(`UPDATE activation_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`).run(nowIso(), tokenId);
}

/** Renvoi d'invitation/lien (§41 "Admin resend") — invalide tous les
 * jetons non consommés du même type pour cet utilisateur avant d'en créer
 * un nouveau, pour qu'un lien précédemment envoyé (potentiellement encore
 * dans une boîte mail) ne reste jamais valide en parallèle du nouveau. */
export function invalidatePendingTokens(userId: number, purpose: ActivationTokenPurpose): number {
  const db = getDb();
  const result = db
    .prepare(`UPDATE activation_tokens SET used_at = ? WHERE user_id = ? AND purpose = ? AND used_at IS NULL`)
    .run(nowIso(), userId, purpose);
  return result.changes as number;
}
