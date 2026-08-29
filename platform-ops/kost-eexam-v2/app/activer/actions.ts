"use server";

// Mission email §8-9/§61 — flux d'activation par jeton. AUCUNE session
// requise (le candidat n'est pas encore connecté) — le jeton lui-même EST
// l'autorisation, vérifié via lib/activation-tokens.ts (hash SHA-256,
// usage unique, limité dans le temps).
import { verifyActivationToken, consumeActivationToken } from "@/lib/activation-tokens";
import { setPasswordAndActivate, findUserById, activationDenialReason } from "@/lib/users";
import { audit } from "@/lib/audit";
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

  const tokenRow = verifyActivationToken(token, "account_setup");
  if (!tokenRow) {
    return { error: "Ce lien d'activation est invalide, déjà utilisé, ou expiré. Contactez votre responsable pédagogique pour un nouveau lien." };
  }

  const user = findUserById(tokenRow.user_id);
  if (!user) return { error: "Compte introuvable." };

  // Mission "FIX ACCOUNT LIFECYCLE GUARDS" (2026-08-29) — bug réel trouvé
  // lors d'un incident staging : un jeton valide/non consommé sur un
  // compte devenu 'suspended' entre-temps (une suspension légitime
  // intervenue APRÈS l'envoi de l'invitation) pouvait auparavant
  // réactiver le compte silencieusement, contournant la suspension — un
  // jeton valide ne doit JAMAIS l'emporter sur une décision
  // administrative explicite. Le jeton n'est PAS consommé sur ce refus
  // (le compte peut être ré-autorisé plus tard sans qu'un nouveau lien
  // soit nécessaire). Logique de décision dans lib/users.ts::
  // activationDenialReason (testable), messages FR exacts ici.
  const denial = activationDenialReason(user.status);
  if (denial === "suspended") {
    return { error: "Ce compte est actuellement suspendu. Contactez l'administrateur." };
  }
  if (denial === "already_active") {
    return { error: "Ce compte est déjà actif. Connectez-vous directement depuis la page de connexion." };
  }

  setPasswordAndActivate(user.id, password);
  consumeActivationToken(tokenRow.id);
  audit({ actorUserId: user.id, actorRole: null, action: "account_activated", targetType: "user", targetId: user.id, result: "success" });

  if (user.email) {
    const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
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
