"use server";

// Mission email §8-9/§61 — flux d'activation par jeton. AUCUNE session
// requise (le candidat n'est pas encore connecté) — le jeton lui-même EST
// l'autorisation. La revendication du jeton, la revalidation du cycle de
// vie, l'écriture du mot de passe/statut et l'audit de succès sont finalisés
// atomiquement dans lib/account-credential-claims.ts.
import { activateAccountWithToken } from "@/lib/account-credential-claims";
import { notifyAccountActivated } from "@/lib/email/events";
import { getDb } from "@/lib/db";

export interface ActivateResult {
  error?: string;
  success?: boolean;
}

export async function activateAccountAction(_prev: ActivateResult, formData: FormData): Promise<ActivateResult> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!token) return { error: "Lien d'activation invalide." };
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== passwordConfirm) return { error: "Les deux mots de passe ne correspondent pas." };

  const result = activateAccountWithToken(token, password);
  if (!result.ok) {
    if (result.reason === "suspended") {
      return { error: "Ce compte est actuellement suspendu. Contactez l'administrateur." };
    }
    if (result.reason === "already_active") {
      return { error: "Ce compte est déjà actif. Connectez-vous directement depuis la page de connexion." };
    }
    if (result.reason === "archived") {
      return { error: "Ce compte a été archivé. Contactez l'administrateur." };
    }
    if (result.reason === "account_not_found") {
      return { error: "Compte introuvable." };
    }
    return { error: "Ce lien d'activation est invalide, déjà utilisé, ou expiré. Contactez votre responsable pédagogique pour un nouveau lien." };
  }

  // Notification strictement post-commit : aucune requête refusée/perdante
  // ne peut produire un email de succès. Le tenant est résolu après la
  // frontière durable, comme avant.
  const user = result.user;
  if (user.email) {
    const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;
    const tenantRow = getDb()
      .prepare(`SELECT c.id AS company_id, c.name AS company_name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id WHERE gm.candidate_user_id = ? LIMIT 1`)
      .get(user.id) as { company_id: number; company_name: string } | undefined;
    await notifyAccountActivated({
      userId: user.id,
      email: user.email,
      firstName,
      tenant: tenantRow ? { companyId: tenantRow.company_id, companyName: tenantRow.company_name } : undefined,
    });
  }

  return { success: true };
}
