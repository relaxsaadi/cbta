"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createGroup, addCandidateToGroup, removeCandidateFromGroup } from "@/lib/groups";
import { createUser, findUserByUsername } from "@/lib/users";
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
  await requireWriteRole("pedagogical_manager", "administrator");
  removeCandidateFromGroup(groupId, candidateUserId);
  revalidatePath(`/groups/${groupId}`);
}
