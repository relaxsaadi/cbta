"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createGroup, addCandidateToGroup, removeCandidateFromGroup } from "@/lib/groups";
import { createUser, findUserByUsername, updateUserProfile } from "@/lib/users";
import { hasCompanyAccess, hasGroupAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
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

export interface EditCandidateResult {
  error?: string;
  success?: string;
}

/** Mission "PRODUCTION READINESS" §3 — édition de fiche candidat (nom
 * complet / email / téléphone). L'identifiant de connexion n'est jamais
 * modifiable ici (voir lib/users.ts updateUserProfile()). Le candidat
 * DOIT être membre de ce groupe précis — empêche un responsable
 * d'éditer un candidat via un groupId qu'il gère en devinant un
 * candidateUserId d'un autre groupe/client. */
export async function editCandidateAction(groupId: number, candidateUserId: number, _prev: EditCandidateResult, formData: FormData): Promise<EditCandidateResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_edit_denied", targetType: "group", targetId: groupId, result: "failure" });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }
  const isMember = getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupId, candidateUserId);
  if (!isMember) return { error: "Ce candidat n'appartient pas à ce groupe." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || undefined;
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  if (!fullName) return { error: "Le nom complet est obligatoire." };

  updateUserProfile(candidateUserId, { fullName, email, phone });
  audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_edit", targetType: "user", targetId: candidateUserId, metadata: { fullName } });
  revalidatePath(`/groups/${groupId}`);
  return { success: "Fiche candidat mise à jour." };
}

export interface BulkImportResult {
  error?: string;
  report?: { line: number; identifier: string; status: "created" | "existing_added" | "duplicate_in_group" | "error"; detail?: string }[];
}

/** Mission "PRODUCTION READINESS" §3 — import CSV en masse. Format attendu
 * (en-tête obligatoire) : full_name,username,password[,email,phone] — un
 * candidat par ligne. Jamais de doublon silencieux : chaque ligne produit
 * une entrée de rapport explicite (créé / déjà existant-ajouté /
 * déjà membre de CE groupe / erreur), jamais une réussite supposée. */
export async function bulkImportCandidatesAction(groupId: number, _prev: BulkImportResult, formData: FormData): Promise<BulkImportResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_bulk_import_denied", targetType: "group", targetId: groupId, result: "failure" });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }
  const csvText = String(formData.get("csv") ?? "").trim();
  if (!csvText) return { error: "Collez le contenu CSV (full_name,username,password)." };

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { error: "Au moins une ligne d'en-tête et une ligne de donnée sont requises." };
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const idxFullName = header.indexOf("full_name");
  const idxUsername = header.indexOf("username");
  const idxPassword = header.indexOf("password");
  const idxEmail = header.indexOf("email");
  const idxPhone = header.indexOf("phone");
  if (idxFullName === -1 || idxUsername === -1 || idxPassword === -1) {
    return { error: "En-tête CSV invalide — colonnes minimum requises : full_name,username,password." };
  }

  const report: BulkImportResult["report"] = [];
  const existingMembers = new Set(
    (getDb().prepare(`SELECT candidate_user_id FROM group_members WHERE group_id = ?`).all(groupId) as { candidate_user_id: number }[]).map((r) => r.candidate_user_id)
  );

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",").map((c) => c.trim());
    const fullName = cols[idxFullName] ?? "";
    const username = cols[idxUsername] ?? "";
    const password = cols[idxPassword] ?? "";
    const email = idxEmail >= 0 ? cols[idxEmail] || undefined : undefined;
    const phone = idxPhone >= 0 ? cols[idxPhone] || undefined : undefined;

    if (!fullName || !username || !password) {
      report.push({ line: i + 1, identifier: username || fullName || "?", status: "error", detail: "Champs obligatoires manquants." });
      continue;
    }
    if (password.length < 8) {
      report.push({ line: i + 1, identifier: username, status: "error", detail: "Mot de passe temporaire trop court (min. 8 caractères)." });
      continue;
    }
    try {
      let user = findUserByUsername(username);
      if (user && existingMembers.has(user.id)) {
        report.push({ line: i + 1, identifier: username, status: "duplicate_in_group", detail: "Déjà membre de ce groupe — ignoré." });
        continue;
      }
      const isNew = !user;
      const userId = user ? user.id : createUser({ username, password, fullName, role: "candidate", email, phone });
      addCandidateToGroup(groupId, userId, session.userId);
      existingMembers.add(userId);
      report.push({ line: i + 1, identifier: username, status: isNew ? "created" : "existing_added" });
    } catch (e) {
      report.push({ line: i + 1, identifier: username, status: "error", detail: (e as Error).message });
    }
  }

  const created = report.filter((r) => r.status === "created").length;
  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "candidate_bulk_import",
    targetType: "group",
    targetId: groupId,
    metadata: { totalLines: lines.length - 1, created, errors: report.filter((r) => r.status === "error").length },
  });
  revalidatePath(`/groups/${groupId}`);
  return { report };
}
