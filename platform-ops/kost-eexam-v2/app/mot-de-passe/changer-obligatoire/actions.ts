"use server";

import { getSession } from "@/lib/session";
import { notifyPasswordChanged } from "@/lib/email/events";
import { getDb } from "@/lib/db";
import { completeForcedPasswordChange } from "@/lib/forced-password-change";

export interface ForcedPasswordChangeResult {
  error?: string;
  success?: boolean;
}

/** Complète un accès temporaire (mission "ADMIN/CLIENT/CANDIDATE UX
 * IMPROVEMENTS", 2026-08-30, §7-9) — pas de jeton ici : l'authentification
 * est la session déjà active elle-même (l'utilisateur vient de se
 * connecter avec le mot de passe temporaire, encore valide — voir
 * app/(app)/layout.tsx pour la redirection forcée qui amène ici).
 *
 * Sécurité #60 : le cookie iron-session n'est jamais une autorité suffisante
 * à lui seul. completeForcedPasswordChange() revalide le dbSessionId, son
 * binding au même utilisateur, l'absence de révocation/expiration et le
 * statut courant 'active', puis sérialise mot de passe + flag temporaire +
 * révocation des autres sessions + audit dans une seule transaction SQLite.
 */
export async function forcedPasswordChangeAction(_prev: ForcedPasswordChangeResult, formData: FormData): Promise<ForcedPasswordChangeResult> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.dbSessionId) {
    return { error: "Session expirée — reconnectez-vous." };
  }

  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  // Même politique minimale que resetPasswordAction (app/mot-de-passe/
  // reinitialiser/actions.ts) — jamais une exigence de complexité inventée
  // spécifiquement pour ce flux, une seule politique de mot de passe pour
  // toute la plateforme.
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== passwordConfirm) return { error: "Les deux mots de passe ne correspondent pas." };

  const committed = completeForcedPasswordChange({
    userId: session.userId,
    dbSessionId: session.dbSessionId,
    password,
  });
  if (!committed.ok) {
    return { error: "Session expirée ou compte indisponible — reconnectez-vous." };
  }

  // Double-soumission depuis la même session encore valide : l'état est déjà
  // conforme et la primitive transactionnelle n'a créé aucun audit dupliqué.
  if (!committed.changed) return { success: true };

  // Toute notification/résolution de contexte se fait strictement APRÈS le
  // commit. Une panne provider ne peut donc jamais revenir en arrière sur la
  // transition de credential ni transformer un état DB partiel en succès.
  const { user, changedAt } = committed;
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
