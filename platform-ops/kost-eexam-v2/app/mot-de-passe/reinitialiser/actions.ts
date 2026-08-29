"use server";

import { verifyActivationToken, consumeActivationToken } from "@/lib/activation-tokens";
import { setPassword, findUserById } from "@/lib/users";
import { audit } from "@/lib/audit";
import { notifyPasswordChanged } from "@/lib/email/events";
import { revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { getDb, nowIso } from "@/lib/db";

export interface ResetPasswordResult {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(_prev: ResetPasswordResult, formData: FormData): Promise<ResetPasswordResult> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!token) return { error: "Lien invalide." };
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== passwordConfirm) return { error: "Les deux mots de passe ne correspondent pas." };

  const tokenRow = verifyActivationToken(token, "password_reset");
  if (!tokenRow) {
    return { error: "Ce lien est invalide, déjà utilisé, ou expiré. Redemandez une réinitialisation." };
  }
  const user = findUserById(tokenRow.user_id);
  if (!user) return { error: "Compte introuvable." };

  setPassword(user.id, password);
  consumeActivationToken(tokenRow.id);
  // §20 — un changement de mot de passe révoque toutes les sessions
  // actives existantes (cohérent avec la sémantique "je ne fais plus
  // confiance à mes anciennes sessions" d'une réinitialisation).
  revokeAllSessionsForUser(user.id, user.id);
  const changedAt = nowIso();
  audit({ actorUserId: user.id, actorRole: null, action: "password_reset_completed", targetType: "user", targetId: user.id, result: "success" });

  if (user.email) {
    const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
    const tenantRow = getDb()
      .prepare(`SELECT c.id AS company_id, c.name AS company_name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id WHERE gm.candidate_user_id = ? LIMIT 1`)
      .get(user.id) as { company_id: number; company_name: string } | undefined;
    await notifyPasswordChanged({
      userId: user.id,
      email: user.email,
      firstName,
      changedAt,
      tenant: tenantRow ? { companyId: tenantRow.company_id, companyName: tenantRow.company_name } : undefined,
    });
  }

  return { success: true };
}
