"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { revokeDbSession, revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { audit } from "@/lib/audit";

export async function revokeSessionAction(sessionId: number) {
  const session = await requireWriteRole("administrator");
  revokeDbSession(sessionId, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "session_revoke", targetType: "session", targetId: sessionId });
  revalidatePath("/sessions");
}

/** "Déconnecter toutes les sessions de cet utilisateur" (§20) — exclut la
 * session courante de l'admin s'il agit sur son propre compte, pour ne
 * jamais se déconnecter lui-même par accident. */
export async function revokeAllForUserAction(userId: number) {
  const session = await requireWriteRole("administrator");
  const exceptId = userId === session.userId ? session.dbSessionId : undefined;
  const n = revokeAllSessionsForUser(userId, session.userId, exceptId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "session_revoke_all_for_user", targetType: "user", targetId: userId, metadata: { count: n } });
  revalidatePath("/sessions");
}
