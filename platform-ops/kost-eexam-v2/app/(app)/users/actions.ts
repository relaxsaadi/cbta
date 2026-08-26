"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createUser, setUserStatus } from "@/lib/users";
import { revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { audit } from "@/lib/audit";
import type { ConsoleRole } from "@/lib/session";

export interface CreateUserResult {
  error?: string;
  success?: string;
}

export async function createUserAction(_prev: CreateUserResult, formData: FormData): Promise<CreateUserResult> {
  await requireWriteRole("administrator");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as ConsoleRole;

  if (!fullName || !username || !password || !role) return { error: "Tous les champs sont obligatoires." };
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };

  try {
    createUser({ username, password, fullName, role });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur — identifiant probablement déjà utilisé." };
  }
  revalidatePath("/users");
  return { success: `Compte ${username} créé (${role}).` };
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
  revalidatePath("/users");
}

export async function quickReactivateAction(userId: number) {
  const session = await requireWriteRole("administrator");
  setUserStatus(userId, "active");
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_reactivate", targetType: "user", targetId: userId });
  revalidatePath("/users");
}
