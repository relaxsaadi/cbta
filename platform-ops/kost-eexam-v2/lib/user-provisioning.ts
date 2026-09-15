import { audit } from "./audit";
import { transaction } from "./db";
import type { Scope } from "./scope";
import type { ConsoleRole } from "./session";
import { addUserToGroup, provisionParticulierAccess } from "./user-affiliation";
import { assignFunctionToUser } from "./user-functions";
import { createUserPendingActivation, type CandidateType } from "./users";

export interface ProvisionPendingUserParams {
  username: string;
  fullName: string;
  role: ConsoleRole;
  email?: string;
  phone?: string;
  candidateType?: CandidateType;
  groupId?: number;
  functionCodes: string[];
  actorUserId: number;
  actorRole: ConsoleRole;
  particulierScope: Scope;
}

/**
 * Frontière atomique du provisioning administratif d'un compte (#46).
 *
 * Le compte, son rôle, l'affiliation groupe (ou la plomberie Particulier),
 * les fonctions DGR et l'audit `user_created` sont tous validés dans le même
 * `BEGIN IMMEDIATE`. Une erreur tardive ne peut donc plus laisser un compte
 * partiel/"fantôme". Les effets externes (jeton/email) restent volontairement
 * hors de cette transaction DB et sont traités après commit par l'action.
 */
export function provisionPendingUserAtomically(params: ProvisionPendingUserParams): number {
  return transaction((db) => {
    const userId = createUserPendingActivation(
      {
        username: params.username,
        fullName: params.fullName,
        role: params.role,
        email: params.email,
        phone: params.phone,
        candidateType: params.candidateType,
      },
      db
    );

    if (params.groupId) addUserToGroup(userId, params.groupId, params.actorUserId);

    if (params.role === "candidate" && params.candidateType === "particulier") {
      provisionParticulierAccess(userId, params.fullName, params.actorUserId, params.particulierScope);
    }

    for (const code of params.functionCodes) {
      assignFunctionToUser(userId, code, params.actorUserId);
    }

    audit({
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: "user_created",
      targetType: "user",
      targetId: userId,
      metadata: {
        role: params.role,
        candidateType: params.candidateType ?? null,
        groupId: params.groupId ?? null,
        functionCodes: params.functionCodes,
      },
    });

    return userId;
  });
}
