"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createGroup, addCandidateToGroup, removeCandidateFromGroup, getGroup } from "@/lib/groups";
import { createUserPendingActivation, findUserByUsername, updateUserProfile } from "@/lib/users";
import { hasCompanyAccess, hasGroupAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import type { Scope } from "@/lib/scope";
import { createActivationToken } from "@/lib/activation-tokens";
import { notifyAccountCreated } from "@/lib/email/events";
import { auditEmailInvitationSent } from "@/lib/email/audit";

/** Invitation sécurisée (mission email §8-10) — crée le compte SANS mot de
 * passe communiqué, un jeton d'activation, et déclenche ACCOUNT_CREATED.
 * Un échec d'envoi email n'annule jamais la création du compte (§35/§39 —
 * outbox : queueAndSendEmail écrit toujours l'historique avant de tenter
 * l'envoi, donc cet appel ne lève jamais pour une raison réseau Resend). */
async function inviteNewCandidate(params: {
  userId: number;
  email: string;
  fullName: string;
  companyId: number;
  companyName: string;
  groupName: string;
  actorUserId: number;
  actorRole: "pedagogical_manager" | "administrator";
}) {
  const firstName = params.fullName.trim().split(/\s+/)[0] ?? params.fullName;
  const { token, expiresAt } = createActivationToken({ userId: params.userId, purpose: "account_setup", createdBy: params.actorUserId });
  await notifyAccountCreated({
    userId: params.userId,
    email: params.email,
    firstName,
    companyId: params.companyId,
    companyName: params.companyName,
    groupName: params.groupName,
    usernameOrEmail: params.email,
    activationToken: token,
    expiresAt,
  });
  auditEmailInvitationSent(params.actorUserId, params.actorRole, params.userId);
}

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
 * séparée de gestion globale des comptes candidats (hors périmètre MVP).
 * Mission email §8 CRITIQUE : plus de mot de passe temporaire saisi par
 * l'admin — le compte est créé 'pending_activation' et le candidat reçoit
 * une invitation par email pour créer lui-même son mot de passe. L'email
 * devient donc obligatoire ici (il ne l'était pas avant), nécessaire pour
 * l'envoi de l'invitation. */
export async function addCandidateAction(groupId: number, _prev: AddCandidateResult, formData: FormData): Promise<AddCandidateResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_add_denied", targetType: "group", targetId: groupId, result: "failure" });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName || !username || !email) return { error: "Nom, identifiant et email sont obligatoires (l'email sert à l'invitation)." };

  const group = getGroup(groupId);
  if (!group) return { error: "Groupe introuvable." };

  let user = findUserByUsername(username);
  if (user && user.status === "suspended") return { error: "Ce compte existe mais est suspendu." };

  if (user) {
    addCandidateToGroup(groupId, user.id, session.userId);
    revalidatePath(`/groups/${groupId}`);
    return { success: `${fullName} (compte existant) ajouté au groupe.` };
  }

  const userId = createUserPendingActivation({ username, fullName, role: "candidate", email });
  addCandidateToGroup(groupId, userId, session.userId);
  await inviteNewCandidate({
    userId,
    email,
    fullName,
    companyId: group.company_id,
    companyName: group.company_name,
    groupName: group.name,
    actorUserId: session.userId,
    actorRole: session.role as "pedagogical_manager" | "administrator",
  });
  revalidatePath(`/groups/${groupId}`);
  return { success: `${fullName} créé et invité par email (${email}).` };
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
 * (en-tête obligatoire) : full_name,username,email[,phone] — un candidat
 * par ligne. Mission email §8 CRITIQUE : plus de colonne password — email
 * devient obligatoire (invitation sécurisée, jamais de mot de passe
 * communiqué). Jamais de doublon silencieux : chaque ligne produit une
 * entrée de rapport explicite (créé / déjà existant-ajouté / déjà membre
 * de CE groupe / erreur), jamais une réussite supposée. */
export async function bulkImportCandidatesAction(groupId: number, _prev: BulkImportResult, formData: FormData): Promise<BulkImportResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "candidate_bulk_import_denied", targetType: "group", targetId: groupId, result: "failure" });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }
  const csvText = String(formData.get("csv") ?? "").trim();
  if (!csvText) return { error: "Collez le contenu CSV (full_name,username,email)." };

  const group = getGroup(groupId);
  if (!group) return { error: "Groupe introuvable." };

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { error: "Au moins une ligne d'en-tête et une ligne de donnée sont requises." };
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const idxFullName = header.indexOf("full_name");
  const idxUsername = header.indexOf("username");
  const idxEmail = header.indexOf("email");
  const idxPhone = header.indexOf("phone");
  if (idxFullName === -1 || idxUsername === -1 || idxEmail === -1) {
    return { error: "En-tête CSV invalide — colonnes minimum requises : full_name,username,email." };
  }

  const report: BulkImportResult["report"] = [];
  const existingMembers = new Set(
    (getDb().prepare(`SELECT candidate_user_id FROM group_members WHERE group_id = ?`).all(groupId) as { candidate_user_id: number }[]).map((r) => r.candidate_user_id)
  );

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",").map((c) => c.trim());
    const fullName = cols[idxFullName] ?? "";
    const username = cols[idxUsername] ?? "";
    const email = cols[idxEmail] ?? "";
    const phone = idxPhone >= 0 ? cols[idxPhone] || undefined : undefined;

    if (!fullName || !username || !email) {
      report.push({ line: i + 1, identifier: username || fullName || "?", status: "error", detail: "Champs obligatoires manquants (full_name, username, email)." });
      continue;
    }
    try {
      let user = findUserByUsername(username);
      if (user && existingMembers.has(user.id)) {
        report.push({ line: i + 1, identifier: username, status: "duplicate_in_group", detail: "Déjà membre de ce groupe — ignoré." });
        continue;
      }
      const isNew = !user;
      const userId = user ? user.id : createUserPendingActivation({ username, fullName, role: "candidate", email, phone });
      addCandidateToGroup(groupId, userId, session.userId);
      existingMembers.add(userId);
      if (isNew) {
        await inviteNewCandidate({
          userId,
          email,
          fullName,
          companyId: group.company_id,
          companyName: group.company_name,
          groupName: group.name,
          actorUserId: session.userId,
          actorRole: session.role as "pedagogical_manager" | "administrator",
        });
      }
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
