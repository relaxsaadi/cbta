"use server";

import { getSession } from "@/lib/session";
import { setPassword, findUserById } from "@/lib/users";
import { clearMustChangePassword } from "@/lib/temp-password";
import { audit } from "@/lib/audit";
import { notifyPasswordChanged } from "@/lib/email/events";
import { revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { getDb, nowIso } from "@/lib/db";

export interface ForcedPasswordChangeResult {
  error?: string;
  success?: boolean;
}

/** Complète un accès temporaire (mission "ADMIN/CLIENT/CANDIDATE UX
 * IMPROVEMENTS", 2026-08-30, §7-9) — pas de jeton ici : l'authentification
 * est la session déjà active elle-même (l'utilisateur vient de se
 * connecter avec le mot de passe temporaire, encore valide — voir
 * app/(app)/layout.tsx pour la redirection forcée qui amène ici). Toujours
 * vérifier session.userId côté serveur, jamais faire confiance à un champ
 * caché du formulaire pour identifier le compte cible. */
export async function forcedPasswordChangeAction(_prev: ForcedPasswordChangeResult, formData: FormData): Promise<ForcedPasswordChangeResult> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return { error: "Session expirée — reconnectez-vous." };
  }
  const user = findUserById(session.userId);
  if (!user) return { error: "Compte introuvable." };
  if (user.must_change_password !== 1) {
    // Déjà traité (ex. double-soumission, ou déjà changé dans un autre
    // onglet) — jamais une erreur, l'appelant sera de toute façon
    // redirigé normalement au prochain rendu du layout.
    return { success: true };
  }

  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  // Même politique minimale que resetPasswordAction (app/mot-de-passe/
  // reinitialiser/actions.ts) — jamais une exigence de complexité inventée
  // spécifiquement pour ce flux, une seule politique de mot de passe pour
  // toute la plateforme.
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== passwordConfirm) return { error: "Les deux mots de passe ne correspondent pas." };

  setPassword(user.id, password);
  // §7 : "temporary credential becomes invalid after password change" —
  // le hash a de toute façon changé (donc l'ancien mot de passe temporaire
  // ne correspond plus), mais on efface aussi explicitement le flag et
  // l'expiration pour ne jamais laisser de trace exploitable.
  clearMustChangePassword(user.id);
  // Révoque les AUTRES sessions actives (ex. si le mot de passe temporaire
  // avait été utilisé ailleurs) — jamais celle-ci, qui vient de compléter
  // l'opération avec succès et doit pouvoir continuer normalement.
  revokeAllSessionsForUser(user.id, user.id, session.dbSessionId);
  const changedAt = nowIso();
  audit({ actorUserId: user.id, actorRole: session.role ?? null, action: "forced_password_change_completed", targetType: "user", targetId: user.id, result: "success" });

  if (user.email) {
    const firstName = user.full_name.split(/\s+/)[0] ?? user.full_name;
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
