"use server";

// Mission "PRODUCTION READINESS" §25 — enrôlement MFA en libre-service.
// ADMINISTRATEUR = cible obligatoire, RESPONSABLE PÉDAGOGIQUE = fortement
// recommandé (voir lib/mfa.ts) : seuls ces deux rôles ont accès à ces
// actions, revérifié ici (jamais seulement via le masquage du lien de
// navigation).
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { findUserById } from "@/lib/users";
import { verifyPassword } from "@/lib/passwords";
import { generateMfaSecret, buildOtpAuthUri, formatSecretForDisplay, verifyTotpCode, generateRecoveryCodes } from "@/lib/mfa";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { notifyMfaEnabled, notifyMfaDisabled } from "@/lib/email/events";

export interface MfaEnrollStartResult {
  formattedSecret?: string;
  otpauthUri?: string;
  error?: string;
}

/** Étape 1/2 — génère un nouveau secret et le pose en session (PAS en
 * base) le temps que l'utilisateur prouve qu'il l'a correctement
 * enregistré. Un appel répété écrase simplement le secret en attente
 * précédent (aucune trace résiduelle à nettoyer). */
export async function startMfaEnrollmentAction(): Promise<MfaEnrollStartResult> {
  const session = await requireRole("administrator", "pedagogical_manager");
  const secret = generateMfaSecret();
  session.pendingMfaEnrollmentSecret = secret;
  await session.save();
  return {
    formattedSecret: formatSecretForDisplay(secret),
    otpauthUri: buildOtpAuthUri(secret, session.username ?? `user-${session.userId}`),
  };
}

export interface MfaConfirmResult {
  error?: string;
  recoveryCodes?: string[];
}

/** Étape 2/2 — n'active MFA que si le code soumis prouve que le secret est
 * correctement enregistré côté utilisateur. Génère les codes de secours à
 * cet instant précis (jamais avant — ils ne doivent exister que pour un
 * MFA réellement activé). */
export async function confirmMfaEnrollmentAction(_prev: MfaConfirmResult, formData: FormData): Promise<MfaConfirmResult> {
  const session = await requireRole("administrator", "pedagogical_manager");
  const code = String(formData.get("code") ?? "").trim();
  const pendingSecret = session.pendingMfaEnrollmentSecret;
  if (!pendingSecret) {
    return { error: "Aucun enrôlement MFA en cours — cliquez d'abord sur \"Activer MFA\"." };
  }
  if (!verifyTotpCode(pendingSecret, code)) {
    return { error: "Code invalide. Vérifiez l'heure de votre téléphone et réessayez." };
  }

  const { plain, hashedJson } = generateRecoveryCodes();
  getDb()
    .prepare(`UPDATE users SET mfa_enabled = 1, mfa_secret = ?, mfa_recovery_codes_json = ? WHERE id = ?`)
    .run(pendingSecret, hashedJson, session.userId);
  session.pendingMfaEnrollmentSecret = undefined;
  await session.save();

  audit({ actorUserId: session.userId, actorRole: session.role, action: "mfa_enabled", targetType: "user", targetId: session.userId, result: "success" });
  const enrolledUser = findUserById(session.userId);
  if (enrolledUser?.email) {
    const firstName = enrolledUser.full_name.split(/\s+/)[0] ?? enrolledUser.full_name;
    await notifyMfaEnabled({ userId: session.userId, email: enrolledUser.email, firstName });
  }
  revalidatePath("/mon-compte");
  return { recoveryCodes: plain };
}

export interface MfaDisableResult {
  error?: string;
  success?: string;
}

/** Désactivation en libre-service — exige le mot de passe (même discipline
 * qu'une action destructrice : re-confirmation explicite, pas un simple
 * bouton). Efface secret ET codes de secours — jamais de résidu
 * exploitable. */
export async function disableMfaAction(_prev: MfaDisableResult, formData: FormData): Promise<MfaDisableResult> {
  const session = await requireRole("administrator", "pedagogical_manager");
  const password = String(formData.get("password") ?? "");
  const user = findUserById(session.userId);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Mot de passe incorrect." };
  }

  getDb().prepare(`UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_recovery_codes_json = NULL WHERE id = ?`).run(session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "mfa_disabled", targetType: "user", targetId: session.userId, result: "success" });
  if (user.email) {
    const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
    await notifyMfaDisabled({ userId: session.userId, email: user.email, firstName, byAdmin: false, securityEventId: `self-${Date.now()}` });
  }
  revalidatePath("/mon-compte");
  return { success: "MFA désactivé sur ce compte." };
}
