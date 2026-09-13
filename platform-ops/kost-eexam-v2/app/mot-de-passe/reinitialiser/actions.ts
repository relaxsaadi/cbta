"use server";

import { resetPasswordWithToken } from "@/lib/account-credential-claims";
import { notifyPasswordChanged } from "@/lib/email/events";
import { getDb } from "@/lib/db";

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

  const result = resetPasswordWithToken(token, password);
  if (!result.ok) {
    if (result.reason === "account_not_found") {
      return { error: "Compte introuvable." };
    }
    if (result.reason === "account_not_active") {
      return { error: "Ce compte n'est pas actif. Contactez l'administrateur avant de réinitialiser le mot de passe." };
    }
    return { error: "Ce lien est invalide, déjà utilisé, ou expiré. Redemandez une réinitialisation." };
  }

  // Notification strictement post-commit : le jeton, le nouveau mot de
  // passe, la révocation de toutes les sessions et l'audit sont déjà
  // durablement finalisés ensemble avant toute opération réseau/outbox.
  const { user, changedAt } = result;
  if (user.email) {
    const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;
    const tenantRow = getDb()
      .prepare(`SELECT c.id AS company_id, c.name AS company_name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id WHERE gm.candidate_user_id = ? LIMIT 1`)
      .get(user.id) as { company_id: number; company_name: string } | undefined;
    await notifyPasswordChanged({
      userId: user.id,
      email: user.email,
      firstName,
      username: user.username,
      changedAt,
      tenant: tenantRow ? { companyId: tenantRow.company_id, companyName: tenantRow.company_name } : undefined,
    });
  }

  return { success: true };
}
