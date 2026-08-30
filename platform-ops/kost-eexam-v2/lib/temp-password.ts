// Accès temporaire (mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS",
// 2026-08-30, §7-9) — alternative à l'invitation sécurisée par jeton
// (lib/activation-tokens.ts) : un administrateur donne IMMÉDIATEMENT un
// identifiant/mot de passe fonctionnels à un candidat, jamais un mot de
// passe permanent réutilisable. Même discipline que lib/activation-tokens.ts
// pour le secret : le mot de passe en clair n'existe que le temps de cet
// appel — retourné UNE fois à l'appelant (affichage unique + email), jamais
// stocké, jamais loggé, jamais audité, jamais écrit dans
// notification_log.metadata_json (voir lib/email/events.ts::
// notifyTemporaryAccessCreated, dont la metadata reste vide).
// Pas de garde "server-only" — voir lib/activation-tokens.ts pour la
// justification (module de domaine, doit rester testable via node:test,
// utilisé aussi par app/(app)/layout.tsx qui n'est pas lui-même bloqué).
import { randomBytes } from "node:crypto";
import { getDb } from "./db";
import { hashPassword } from "./passwords";
import type { UserRow } from "./users";

// Même politique que ACCOUNT_SETUP_TTL_HOURS (lib/activation-tokens.ts) —
// "configurable short expiry, e.g. 24h, using existing security policy
// where possible" (exigence explicite de la mission).
const TEMP_PASSWORD_TTL_HOURS = 24;

/** Génère un mot de passe temporaire cryptographiquement fort — 20
 * caractères base64url (~120 bits d'entropie), jamais un mot de passe
 * prévisible ni dérivé d'une donnée du compte (nom, identifiant...). */
export function generateTemporaryPassword(): string {
  return randomBytes(15).toString("base64url");
}

/** Émet un accès temporaire pour un compte existant : écrit le hash
 * IMMÉDIATEMENT (jamais de fenêtre où le mot de passe en clair est "en
 * attente" quelque part), pose must_change_password=1 et l'expiration.
 * Active aussi le compte (status='active') si besoin — un mot de passe
 * temporaire n'a aucun sens sur un compte encore 'pending_activation'
 * (lib/auth.ts bloque toute connexion pour ce statut AVANT même de
 * vérifier le mot de passe) ; ne touche jamais un compte suspendu/archivé
 * (§7 : "suspended/archived account cannot use it" — voir le contrôle de
 * statut dans lib/auth.ts::login(), inchangé et toujours prioritaire).
 * Le mot de passe en clair n'est renvoyé qu'à CET appel — c'est à
 * l'appelant de l'afficher une seule fois (§8 : "AFFICHAGE UNIQUE") et de
 * l'envoyer par email, jamais de le conserver au-delà. */
export function createTemporaryAccess(userId: number): { plaintext: string; expiresAt: string } {
  const plaintext = generateTemporaryPassword();
  const passwordHash = hashPassword(plaintext);
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_HOURS * 60 * 60 * 1000).toISOString();
  getDb()
    .prepare(
      `UPDATE users
       SET password_hash = ?, must_change_password = 1, temp_password_expires_at = ?,
           status = CASE WHEN status = 'pending_activation' THEN 'active' ELSE status END
       WHERE id = ?`
    )
    .run(passwordHash, expiresAt, userId);
  return { plaintext, expiresAt };
}

/** §7 : "expired temporary password denied" — MÊME si le mot de passe
 * présenté correspond encore au hash stocké (verifyPassword() réussirait),
 * un mot de passe temporaire expiré doit être refusé. Vérifié explicitement
 * dans lib/auth.ts::login(), après verifyPassword() et avant la création de
 * session. */
export function isTemporaryPasswordExpired(user: Pick<UserRow, "must_change_password" | "temp_password_expires_at">): boolean {
  if (!user.must_change_password || !user.temp_password_expires_at) return false;
  return new Date(user.temp_password_expires_at).getTime() < Date.now();
}

/** §7 : "temporary credential becomes invalid after password change" —
 * appelée UNIQUEMENT après l'écriture réussie du nouveau password_hash
 * choisi par le titulaire (même séquence que resetPasswordAction). Une
 * fois appelée, must_change_password redevient 0 : le prochain login
 * atterrit normalement, plus de redirection forcée. */
export function clearMustChangePassword(userId: number): void {
  getDb().prepare(`UPDATE users SET must_change_password = 0, temp_password_expires_at = NULL WHERE id = ?`).run(userId);
}
