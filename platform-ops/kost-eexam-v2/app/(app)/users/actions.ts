"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createUserPendingActivation, setUserStatus, findUserById, reactivateUserSafely } from "@/lib/users";
import { revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import type { ConsoleRole } from "@/lib/session";
import { createActivationToken } from "@/lib/activation-tokens";
import { notifyAccountCreated, notifyAccountSuspended, notifyAccountReactivated, notifyMfaDisabled } from "@/lib/email/events";
import { auditEmailInvitationSent } from "@/lib/email/audit";

export interface CreateUserResult {
  error?: string;
  success?: string;
}

/** Mission email §8/§28 CRITIQUE — plus de mot de passe saisi par
 * l'administrateur, quel que soit le rôle créé (candidat, responsable,
 * administrateur, auditeur) : même flux d'invitation sécurisée que pour
 * les candidats (lib/activation-tokens.ts). L'email devient obligatoire
 * ici (il ne l'était pas avant), nécessaire pour l'envoi de l'invitation. */
export async function createUserAction(_prev: CreateUserResult, formData: FormData): Promise<CreateUserResult> {
  const session = await requireWriteRole("administrator");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "") as ConsoleRole;

  if (!fullName || !username || !email || !role) return { error: "Tous les champs sont obligatoires (l'email sert à l'invitation)." };

  let userId: number;
  try {
    userId = createUserPendingActivation({ username, fullName, role, email });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur — identifiant probablement déjà utilisé." };
  }

  const firstName = fullName.split(/\s+/)[0] ?? fullName;
  const { token, expiresAt } = createActivationToken({ userId, purpose: "account_setup", createdBy: session.userId });
  // Comptes staff (responsable/administrateur/auditeur) : pas de client/
  // groupe réel à référencer — companyId reste NULL (jamais 0, qui
  // violerait la FK companies(id) si jamais vérifié) ; le gabarit accepte
  // "KOST Academy" comme "entreprise" d'affichage pour ce cas précis.
  await notifyAccountCreated({
    userId,
    email,
    firstName,
    companyId: null,
    companyName: "KOST Academy",
    groupName: "—",
    usernameOrEmail: email,
    activationToken: token,
    expiresAt,
  });
  auditEmailInvitationSent(session.userId, session.role, userId);

  revalidatePath("/users");
  return { success: `Compte ${username} créé (${role}) — invitation envoyée à ${email}.` };
}

/** Suspension/réactivation directe (hors incident) — action admin simple,
 * distincte du flux "incident" (§18, qui lie l'action à un incident déclaré
 * via lib/incidents.ts). Ici : pas d'incident_id à référencer, mais la
 * même trace d'audit et la même révocation réelle de sessions. */
export async function quickSuspendAction(userId: number) {
  const session = await requireWriteRole("administrator");
  setUserStatus(userId, "suspended");
  const n = revokeAllSessionsForUser(userId, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_suspend", targetType: "user", targetId: userId, metadata: { sessionsRevoked: n } });
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountSuspended({ userId, email: target.email, firstName, securityEventId: `quick-${Date.now()}` });
  }
  revalidatePath("/users");
}

/** Mission "FIX ACCOUNT LIFECYCLE GUARDS" (2026-08-29) — bug réel trouvé
 * lors d'un incident staging (compte candidat jamais activé, basculé
 * directement 'active' par un simple clic ici, contournant le flux de
 * création de mot de passe). N'écrase plus jamais un compte vers 'active'
 * sans preuve réelle d'activation antérieure (reactivateUserSafely) — un
 * compte jamais activé revient à 'pending_activation', jamais 'active'
 * directement, jamais avec un mot de passe inventé ici. Sans effet si la
 * cible n'est pas actuellement 'suspended' (un clic répété ne doit rien
 * faire de plus). */
export async function quickReactivateAction(userId: number) {
  const session = await requireWriteRole("administrator");
  const { changed, newStatus } = reactivateUserSafely(userId);
  if (!changed) {
    revalidatePath("/users");
    return;
  }
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_reactivate", targetType: "user", targetId: userId, metadata: { restoredStatus: newStatus } });
  const target = findUserById(userId);
  if (target?.email && newStatus === "active") {
    // ACCOUNT_REACTIVATED (§29) uniquement quand le compte redevient
    // réellement utilisable tel quel — jamais pour un retour à
    // 'pending_activation', qui exige encore une action du candidat
    // (l'admin utilise "Renvoyer l'invitation" séparément s'il souhaite
    // notifier, plutôt qu'un envoi automatique ici — voir /notifications).
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountReactivated({ userId, email: target.email, firstName, securityEventId: `quick-${Date.now()}` });
  }
  revalidatePath("/users");
}

/** Voie de récupération pour un compte verrouillé hors de son propre MFA
 * (téléphone perdu ET codes de secours épuisés/perdus — mission §25).
 * Réservée à l'administrateur, jamais en libre-service : désactive MFA sur
 * le compte CIBLE (jamais le sien propre via ce chemin — voir
 * app/(app)/mon-compte/actions.ts pour l'auto-désactivation, qui exige le
 * mot de passe plutôt qu'un rôle). Trace d'audit dédiée et distincte de
 * `mfa_disabled` (self-service) pour que l'origine de la désactivation
 * reste toujours reconstituable. */
export async function adminResetMfaAction(userId: number) {
  const session = await requireWriteRole("administrator");
  getDb().prepare(`UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_recovery_codes_json = NULL WHERE id = ?`).run(userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "mfa_admin_reset", targetType: "user", targetId: userId, result: "success" });
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyMfaDisabled({ userId, email: target.email, firstName, byAdmin: true, securityEventId: `admin-reset-${Date.now()}` });
  }
  revalidatePath("/users");
}
