"use server";

// Mission email §12 — demande de réinitialisation. Réponse TOUJOURS
// identique que le compte existe ou non (anti-énumération de comptes) —
// jamais une confirmation/infirmation explicite de l'existence d'une
// adresse.
import { findUserByUsername, findUserByEmail } from "@/lib/users";
import { createActivationToken, invalidatePendingTokens } from "@/lib/activation-tokens";
import { notifyPasswordResetRequested } from "@/lib/email/events";
import { auditPasswordResetRequested } from "@/lib/email/audit";
import { checkLoginRateLimit, recordLoginFailure } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";

export interface ForgotPasswordResult {
  submitted?: boolean;
  error?: string;
}

const GENERIC_MESSAGE_SUBMITTED = true;

export async function requestPasswordResetAction(_prev: ForgotPasswordResult, formData: FormData): Promise<ForgotPasswordResult> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  if (!identifier) return { error: "Saisissez votre identifiant ou votre email." };

  // Même limiteur que la connexion (§42 — anti-spam email) : une clé
  // dédiée pour ne pas mélanger les compteurs avec les échecs de
  // connexion réels.
  const rateLimitKey = `password-reset:${identifier.toLowerCase()}`;
  const rl = checkLoginRateLimit(rateLimitKey);
  if (!rl.allowed) {
    // Toujours le message générique côté utilisateur (§42 anti-énumération
    // ET anti-spam) — seul le comportement interne diffère (aucun envoi).
    return { submitted: GENERIC_MESSAGE_SUBMITTED };
  }

  const user = identifier.includes("@") ? findUserByEmail(identifier) : findUserByUsername(identifier);
  if (!user || !user.email || user.status !== "active") {
    recordLoginFailure(rateLimitKey);
    return { submitted: GENERIC_MESSAGE_SUBMITTED };
  }

  invalidatePendingTokens(user.id, "password_reset");
  const { token, expiresAt } = createActivationToken({ userId: user.id, purpose: "password_reset" });
  const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
  const tenantRow = getDb()
    .prepare(`SELECT c.id AS company_id, c.name AS company_name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id WHERE gm.candidate_user_id = ? LIMIT 1`)
    .get(user.id) as { company_id: number; company_name: string } | undefined;

  await notifyPasswordResetRequested({
    userId: user.id,
    email: user.email,
    firstName,
    username: user.username,
    resetToken: token,
    expiresAt,
    tenant: tenantRow ? { companyId: tenantRow.company_id, companyName: tenantRow.company_name } : undefined,
  });
  auditPasswordResetRequested(user.id, null, user.id);

  return { submitted: GENERIC_MESSAGE_SUBMITTED };
}
