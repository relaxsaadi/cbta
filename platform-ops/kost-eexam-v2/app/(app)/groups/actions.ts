"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createGroup, addCandidateToGroup, removeCandidateFromGroup } from "@/lib/groups";
import { createUser, findUserByUsername } from "@/lib/users";
import { hasCompanyAccess, hasGroupAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import type { Scope } from "@/lib/scope";

export interface CreateGroupResult {
  error?: string;
  groupId?: number;
}

export async function createGroupAction(_prev: CreateGroupResult, formData: FormData): Promise<CreateGroupResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const companyId = Number(formData.get("companyId"));
  const name = String(formData.get("name") ?? "").trim();
  const scope = String(formData.get("scope") ?? "production") as Scope;
  const sessionLabel = String(formData.get("sessionLabel") ?? "").trim() || undefined;
  const dateStart = String(formData.get("dateStart") ?? "") || undefined;
  const dateEnd = String(formData.get("dateEnd") ?? "") || undefined;

  if (!companyId || !name) return { error: "Client et nom du groupe sont obligatoires." };
  // Frontière multi-client (lib/tenant-scope.ts) — sans ce contrôle, un
  // responsable pourrait rattacher un nouveau groupe (donc lui-même comme
  // gestionnaire) à N'IMPORTE QUEL client existant en forgeant companyId
  // dans la requête, y compris un client d'un autre responsable.
  if (!hasCompanyAccess(session, companyId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "group_create_denied", targetType: "company", targetId: companyId, result: "failure", metadata: { name } });
    return { error: "Ce client n'est pas dans votre périmètre." };
  }

  const groupId = createGroup({
    companyId,
    name,
    scope,
    sessionLabel,
    dateStart,
    dateEnd,
    pedagogicalManagerId: session.userId,
    createdBy: session.userId,
  });
  revalidatePath("/groups");
  revalidatePath(`/companies/${companyId}`);
  return { groupId };
}

export interface AddCandidateResult {
  error?: string;
  success?: string;
}

/** Crée le compte candidat s'il n'existe pas encore (identifiant unique),
 * puis l'ajoute au groupe — couvre "ajouter des candidats" (§2) sans page
 * séparée de gestion globale des comptes candidats (hors périmètre MVP). */
export async function addCandidateAction(groupId: number, _prev: AddCandidateResult, formData: FormData): Promise<AddCandidateResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_add_denied", targetType: "group", targetId: groupId, result: "failure" });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !username || !password) return { error: "Nom, identifiant et mot de passe temporaire sont obligatoires." };
  if (password.length < 8) return { error: "Le mot de passe temporaire doit faire au moins 8 caractères." };

  let user = findUserByUsername(username);
  if (user && user.status === "suspended") return { error: "Ce compte existe mais est suspendu." };
  const userId = user ? user.id : createUser({ username, password, fullName, role: "candidate" });

  addCandidateToGroup(groupId, userId, session.userId);
  revalidatePath(`/groups/${groupId}`);
  return { success: user ? `${fullName} (compte existant) ajouté au groupe.` : `${fullName} créé et ajouté au groupe. Identifiant : ${username}` };
}

export async function removeCandidateAction(groupId: number, candidateUserId: number) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) return;
  removeCandidateFromGroup(groupId, candidateUserId);
  revalidatePath(`/groups/${groupId}`);
}
