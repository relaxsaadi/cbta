"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteRole } from "@/lib/rbac";
import {
  createUserPendingActivation,
  setUserStatus,
  findUserById,
  findUserByUsername,
  reactivateUserSafely,
  archiveUser,
  restoreUser,
  changeUsername,
  UsernameConflictError,
  canHardDeleteUser,
  hardDeleteUser,
  updateUserProfile,
  type CandidateType,
} from "@/lib/users";
import { assignFunctionToUser, removeFunctionFromUser } from "@/lib/user-functions";
import { addUserToGroup, removeUserFromGroupSafely, changeUserGroup, getPrimaryCompanyContext } from "@/lib/user-affiliation";
import { createCompany } from "@/lib/companies";
import { createGroup, getGroup } from "@/lib/groups";
import { revokeAllSessionsForUser } from "@/lib/sessions-registry";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import type { ConsoleRole } from "@/lib/session";
import type { Scope } from "@/lib/scope";
import { createActivationToken } from "@/lib/activation-tokens";
import { notifyAccountCreated, notifyAccountSuspended, notifyAccountReactivated, notifyMfaDisabled, notifyUsernameChanged, notifyAdminMessage } from "@/lib/email/events";
import { auditEmailInvitationSent } from "@/lib/email/audit";
import { resendInvitation, sendPasswordResetLink, ResendError } from "@/lib/email/resend-actions";

export interface CreateUserResult {
  error?: string;
  success?: string;
}

/** Assistant de création (mission "COMPLETE USER MANAGEMENT", 2026-08-29,
 * §12-17) — remplace l'ancien formulaire à plat unique. Deux branches
 * (Particulier / Entreprise) selon `candidateType`, formulaire unique avec
 * sections conditionnelles (voir CreateUserWizard.tsx) plutôt qu'une
 * navigation multi-écran réelle côté client — simplification d'ingénierie
 * assumée et documentée (le résultat fonctionnel — 4 groupes de champs
 * logiques, résumé avant validation — est équivalent). §0 CRITIQUE
 * inchangé : jamais de mot de passe saisi ici, quel que soit le chemin. */
export async function createUserAction(_prev: CreateUserResult, formData: FormData): Promise<CreateUserResult> {
  const session = await requireWriteRole("administrator");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  const role = String(formData.get("role") ?? "") as ConsoleRole;
  const candidateTypeRaw = String(formData.get("candidateType") ?? "");
  const candidateType: CandidateType | undefined = candidateTypeRaw === "particulier" || candidateTypeRaw === "entreprise" ? candidateTypeRaw : undefined;
  const companyIdRaw = String(formData.get("companyId") ?? "");
  const groupIdRaw = String(formData.get("groupId") ?? "");
  const functionCodes = formData.getAll("functionCodes").map(String).filter(Boolean);
  const sendInvitation = String(formData.get("sendInvitation") ?? "true") !== "false";

  if (!fullName || !username || !role) return { error: "Nom complet, identifiant et rôle sont obligatoires." };
  if (sendInvitation && !email) return { error: "L'email est obligatoire pour envoyer l'invitation — ou choisissez « Créer sans envoyer maintenant »." };

  let groupId: number | undefined;
  if (role === "candidate" && candidateType === "entreprise") {
    if (!companyIdRaw || !groupIdRaw) return { error: "Client et groupe/session sont obligatoires pour un candidat Entreprise." };
    groupId = Number(groupIdRaw);
    const group = getGroup(groupId);
    if (!group) return { error: "Groupe introuvable." };
    if (group.company_id !== Number(companyIdRaw)) return { error: "Le groupe sélectionné n'appartient pas au client sélectionné." };
  }

  let userId: number;
  try {
    userId = createUserPendingActivation({
      username,
      fullName,
      role,
      email: email || undefined,
      phone,
      candidateType: role === "candidate" ? candidateType : undefined,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur — identifiant probablement déjà utilisé." };
  }

  if (groupId) addUserToGroup(userId, groupId, session.userId);
  for (const code of functionCodes) assignFunctionToUser(userId, code, session.userId);

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "user_created",
    targetType: "user",
    targetId: userId,
    metadata: { role, candidateType: candidateType ?? null, groupId: groupId ?? null, functionCodes },
  });

  if (!sendInvitation) {
    revalidatePath("/users");
    return { success: `Compte ${username} créé (${role}) — en attente d'activation. L'invitation n'a PAS été envoyée ; utilisez « Renvoyer l'invitation » depuis la fiche du compte quand vous serez prêt.` };
  }

  const firstName = fullName.split(/\s+/)[0] ?? fullName;
  const { token, expiresAt } = createActivationToken({ userId, purpose: "account_setup", createdBy: session.userId });
  const tenant = groupId ? getPrimaryCompanyContext(userId) : null;
  await notifyAccountCreated({
    userId,
    email: email,
    firstName,
    companyId: tenant?.companyId ?? null,
    companyName: tenant?.companyName ?? "KOST Academy",
    groupName: tenant?.groupName ?? "—",
    usernameOrEmail: username,
    activationToken: token,
    expiresAt,
  });
  auditEmailInvitationSent(session.userId, session.role, userId);

  revalidatePath("/users");
  return { success: `Compte ${username} créé (${role}) — invitation envoyée à ${email}.` };
}

/** "+ Nouveau client" (§16) — raccourci sans quitter l'assistant : crée le
 * client via la logique existante (lib/companies.ts, jamais dupliquée) et
 * redirige vers l'assistant avec ce client déjà présélectionné. */
export async function quickCreateCompanyAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireWriteRole("administrator");
  const name = String(formData.get("name") ?? "").trim();
  const scope = (String(formData.get("scope") ?? "production") as Scope) || "production";
  if (!name) return { error: "Le nom du client est obligatoire." };

  const companyId = createCompany({ name, scope, createdBy: session.userId });
  audit({ actorUserId: session.userId, actorRole: session.role, action: "company_quick_created_from_users", targetType: "company", targetId: companyId });
  redirect(`/users/nouveau?companyId=${companyId}`);
}

/** "+ Nouveau groupe" (§17) — même principe, groupe rattaché au client déjà
 * sélectionné dans l'assistant (lib/groups.ts, jamais dupliquée). */
export async function quickCreateGroupAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireWriteRole("administrator");
  const companyId = Number(formData.get("companyId"));
  const name = String(formData.get("name") ?? "").trim();
  const sessionLabel = String(formData.get("sessionLabel") ?? "").trim() || undefined;
  if (!companyId || !name) return { error: "Client et nom du groupe sont obligatoires." };

  const groupId = createGroup({ companyId, name, sessionLabel, scope: "production", pedagogicalManagerId: session.userId, createdBy: session.userId });
  audit({ actorUserId: session.userId, actorRole: session.role, action: "group_quick_created_from_users", targetType: "group", targetId: groupId });
  redirect(`/users/nouveau?companyId=${companyId}&groupId=${groupId}`);
}

/** Suspension/réactivation directe (hors incident) — action admin simple,
 * distincte du flux "incident" (§18, qui lie l'action à un incident déclaré
 * via lib/incidents.ts). Ici : pas d'incident_id à référencer, mais la
 * même trace d'audit et la même révocation réelle de sessions. */
export async function quickSuspendAction(userId: number) {
  const session = await requireWriteRole("administrator");
  setUserStatus(userId, "suspended");
  const n = revokeAllSessionsForUser(userId, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_suspended", targetType: "user", targetId: userId, metadata: { sessionsRevoked: n } });
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountSuspended({ userId, email: target.email, firstName, securityEventId: `quick-${Date.now()}` });
  }
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

/** Mission "FIX ACCOUNT LIFECYCLE GUARDS" (2026-08-29) — bug réel trouvé
 * lors d'un incident staging (compte candidat "brahimi mohssen", jamais
 * activé, basculé 'active' par un simple clic "Réactiver", puis suspendu).
 * N'écrase plus jamais un compte vers 'active' sans preuve réelle
 * d'activation antérieure (reactivateUserSafely) — un compte jamais activé
 * revient à 'pending_activation', jamais 'active' directement, jamais avec
 * un mot de passe inventé ici. Sans effet si la cible n'est pas
 * actuellement 'suspended'. */
export async function quickReactivateAction(userId: number) {
  const session = await requireWriteRole("administrator");
  const { changed, newStatus } = reactivateUserSafely(userId);
  if (!changed) {
    revalidatePath("/users");
    return;
  }
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_reactivated", targetType: "user", targetId: userId, metadata: { restoredStatus: newStatus } });
  const target = findUserById(userId);
  if (target?.email && newStatus === "active") {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountReactivated({ userId, email: target.email, firstName, securityEventId: `quick-${Date.now()}` });
  }
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

export interface MfaResetResult {
  error?: string;
  success?: string;
}

/** Voie de récupération pour un compte verrouillé hors de son propre MFA
 * (téléphone perdu ET codes de secours épuisés/perdus — mission §25).
 * Réservée à l'administrateur, jamais en libre-service. Signature
 * (userId, prevState, formData) — compatible useActionState (ActionButton)
 * pour confirmer visiblement le résultat, jamais un simple void silencieux. */
export async function adminResetMfaAction(userId: number, _prev: MfaResetResult, _formData: FormData): Promise<MfaResetResult> {
  const session = await requireWriteRole("administrator");
  getDb().prepare(`UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_recovery_codes_json = NULL WHERE id = ?`).run(userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_mfa_reset", targetType: "user", targetId: userId, result: "success" });
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyMfaDisabled({ userId, email: target.email, firstName, byAdmin: true, securityEventId: `admin-reset-${Date.now()}` });
  }
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  return { success: "MFA réinitialisée pour ce compte." };
}

/** "Archiver" (§14-17) — décision de cycle de vie normale, jamais une
 * suppression. Révoque les sessions actives (même geste que la
 * suspension). Sans effet si déjà archivé (jamais un archivage en double). */
export async function archiveUserAction(userId: number) {
  const session = await requireWriteRole("administrator");
  const { changed } = archiveUser(userId);
  if (!changed) {
    revalidatePath(`/users/${userId}`);
    return;
  }
  revokeAllSessionsForUser(userId, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_archived", targetType: "user", targetId: userId });
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

/** "Restaurer" (§14-17) — symétrique, mêmes garde-fous que la réactivation
 * (jamais 'active' sans preuve réelle d'activation antérieure). */
export async function restoreUserAction(userId: number) {
  const session = await requireWriteRole("administrator");
  const { changed, newStatus } = restoreUser(userId);
  if (!changed) {
    revalidatePath(`/users/${userId}`);
    return;
  }
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_restored", targetType: "user", targetId: userId, metadata: { restoredStatus: newStatus } });
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

export interface HardDeleteResult {
  error?: string;
  success?: string;
}

/** "Supprimer définitivement" (§22 — sécurité STRICTE) — exige la
 * confirmation forte "SUPPRIMER" tapée par l'admin EN PLUS de la
 * revérification serveur des dépendances protégées (lib/users.ts::
 * hardDeleteUser revérifie elle-même, jamais fait confiance à un appel
 * client). Message d'erreur EXACT requis par la mission quand un
 * historique d'examen bloque (voir lib/users.ts::hardDeleteUser). */
export async function hardDeleteUserAction(userId: number, _prev: HardDeleteResult, formData: FormData): Promise<HardDeleteResult> {
  const session = await requireWriteRole("administrator");
  const confirmText = String(formData.get("confirmText") ?? "");
  if (confirmText !== "SUPPRIMER") return { error: 'Tapez exactement "SUPPRIMER" pour confirmer.' };

  const target = findUserById(userId);
  if (!target) return { error: "Compte introuvable." };

  try {
    hardDeleteUser(userId);
  } catch (err) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "user_delete_blocked", targetType: "user", targetId: userId, result: "failure", metadata: { username: target.username } });
    return { error: err instanceof Error ? err.message : "Suppression impossible." };
  }

  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_deleted", targetType: "user", targetId: userId, metadata: { username: target.username, fullName: target.full_name } });
  revalidatePath("/users");
  // redirect() plutôt que retourner {success} (bug réel trouvé en E2E) : le
  // compte n'existe plus une fois cette fonction terminée, donc la fiche
  // /users/[id] courante n'a plus de sens — Next.js rafraîchit
  // automatiquement les Server Components de la route active après une
  // Server Action, ce qui fait immédiatement échouer findUserById() côté
  // page.tsx (notFound() → 404) et démonte le composant client AVANT qu'un
  // useEffect côté client n'ait pu lire un {success} pour naviguer lui-même
  // — course perdue à coup sûr, observée en E2E (redirection jamais
  // arrivée). redirect() ici est la seule redirection fiable, car
  // appliquée par le framework lui-même, jamais dans une course avec son
  // propre rafraîchissement automatique.
  redirect("/users");
}

export interface EditUserResult {
  error?: string;
  success?: string;
}

/** "Modifier" (§34) — nom/email/téléphone/type candidat. Ne touche jamais
 * l'identifiant (action séparée, changeUsernameAction) ni les données
 * d'examen/historique. */
export async function editUserAction(userId: number, _prev: EditUserResult, formData: FormData): Promise<EditUserResult> {
  const session = await requireWriteRole("administrator");
  const target = findUserById(userId);
  if (!target) return { error: "Compte introuvable." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || undefined;
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  const candidateTypeRaw = String(formData.get("candidateType") ?? "");
  const candidateType = candidateTypeRaw === "particulier" || candidateTypeRaw === "entreprise" ? candidateTypeRaw : null;
  if (!fullName) return { error: "Le nom complet est obligatoire." };

  updateUserProfile(userId, { fullName, email, phone, candidateType });
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_edited", targetType: "user", targetId: userId, metadata: { fullName } });
  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
  return { success: "Fiche mise à jour." };
}

export interface ChangeUsernameResult {
  error?: string;
  success?: string;
}

/** "Modifier l'identifiant" (§18-21) — unicité/normalisation appliquées par
 * lib/users.ts::changeUsername. `username` n'est référencé par aucune
 * clé étrangère (tout pointe vers l'id numérique stable) — l'historique
 * des tentatives/résultats reste valide et inchangé après ce changement. */
export async function changeUsernameAction(userId: number, _prev: ChangeUsernameResult, formData: FormData): Promise<ChangeUsernameResult> {
  const session = await requireWriteRole("administrator");
  const newUsername = String(formData.get("newUsername") ?? "").trim();
  if (!newUsername) return { error: "Le nouvel identifiant est obligatoire." };

  let oldUsername: string;
  let finalUsername: string;
  try {
    const result = changeUsername(userId, newUsername);
    oldUsername = result.oldUsername;
    finalUsername = result.newUsername;
  } catch (err) {
    if (err instanceof UsernameConflictError) return { error: err.message };
    return { error: err instanceof Error ? err.message : "Erreur lors du changement d'identifiant." };
  }
  if (oldUsername === finalUsername) return { success: "Identifiant inchangé." };

  audit({ actorUserId: session.userId, actorRole: session.role, action: "username_changed", targetType: "user", targetId: userId, metadata: { oldUsername, newUsername: finalUsername } });

  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyUsernameChanged({ userId, email: target.email, firstName, newUsername: finalUsername, changedAt: new Date().toISOString() });
  }

  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
  return { success: `Identifiant modifié : ${oldUsername} → ${finalUsername}.` };
}

/** "Affecter/Retirer une fonction DGR" (§26) — table purement déclarative
 * côté dossier candidat, ne touche jamais un examen déjà publié. */
export async function assignFunctionAction(userId: number, functionCode: string) {
  const session = await requireWriteRole("administrator");
  if (!functionCode) return;
  assignFunctionToUser(userId, functionCode, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_function_assigned", targetType: "user", targetId: userId, metadata: { functionCode } });
  revalidatePath(`/users/${userId}`);
}

export async function removeFunctionAction(userId: number, functionCode: string) {
  const session = await requireWriteRole("administrator");
  removeFunctionFromUser(userId, functionCode);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_function_removed", targetType: "user", targetId: userId, metadata: { functionCode } });
  revalidatePath(`/users/${userId}`);
}

export interface AffiliationResult {
  error?: string;
  success?: string;
}

/** "Affecter à une entreprise" (§22-23, cas candidat pas encore affecté) —
 * choisit client + groupe/session en une fois (jamais d'entreprise sans
 * groupe réel, la relation group_members reste l'unique source de vérité,
 * voir lib/user-affiliation.ts). Toujours sans risque (ajout pur). */
export async function assignCompanyGroupAction(userId: number, _prev: AffiliationResult, formData: FormData): Promise<AffiliationResult> {
  const session = await requireWriteRole("administrator");
  const companyId = Number(formData.get("companyId"));
  const groupId = Number(formData.get("groupId"));
  if (!companyId || !groupId) return { error: "Client et groupe sont obligatoires." };
  const group = getGroup(groupId);
  if (!group) return { error: "Groupe introuvable." };
  if (group.company_id !== companyId) return { error: "Ce groupe n'appartient pas au client sélectionné." };

  addUserToGroup(userId, groupId, session.userId);
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_company_assigned", targetType: "user", targetId: userId, metadata: { companyId } });
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_group_assigned", targetType: "user", targetId: userId, metadata: { groupId } });
  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
  return { success: `Affecté à ${group.company_name} — ${group.name}.` };
}

/** "Ajouter à un groupe" (§23-24, multi-groupe) — identique à l'affectation
 * initiale mais nommée séparément dans le menu d'actions pour un candidat
 * déjà affecté ailleurs (n'importe jamais l'appartenance existante). */
export const addToGroupAction = assignCompanyGroupAction;

/** "Retirer d'un groupe" (§24) — BLOQUÉ si un historique protégé existe
 * pour ce couple (candidat, groupe) précis (lib/user-affiliation.ts).
 * Signature (userId, groupId, prevState, formData) — jamais un simple
 * (userId, groupId) sans état — un blocage doit toujours pouvoir afficher
 * SA raison précise à l'admin (useActionState), pas juste échouer
 * silencieusement comme un bouton "Suspendre" qui ne peut jamais l'être. */
export async function removeFromGroupAction(userId: number, groupId: number, _prev: AffiliationResult, _formData: FormData): Promise<AffiliationResult> {
  const session = await requireWriteRole("administrator");
  const result = removeUserFromGroupSafely(userId, groupId);
  if (!result.removed) {
    audit({
      actorUserId: session.userId,
      actorRole: session.role,
      action: "user_group_removal_blocked",
      targetType: "user",
      targetId: userId,
      result: "failure",
      metadata: { groupId, reason: result.blockedReason },
    });
    revalidatePath(`/users/${userId}`);
    return { error: result.blockedReason };
  }
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_group_removed", targetType: "user", targetId: userId, metadata: { groupId } });
  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
  return { success: "Retiré du groupe." };
}

/** "Changer de groupe" / "Changer d'entreprise" (§22-24) — remplace
 * l'appartenance ; BLOQUE l'opération entière (rien n'est ajouté non plus)
 * si l'ancien groupe porte un historique protégé pour ce candidat. */
export async function changeGroupAction(userId: number, _prev: AffiliationResult, formData: FormData): Promise<AffiliationResult> {
  const session = await requireWriteRole("administrator");
  const oldGroupId = Number(formData.get("oldGroupId"));
  const newGroupId = Number(formData.get("newGroupId"));
  if (!oldGroupId || !newGroupId) return { error: "Groupe actuel et nouveau groupe sont obligatoires." };

  const result = changeUserGroup(userId, oldGroupId, newGroupId, session.userId);
  if (!result.changed) {
    audit({
      actorUserId: session.userId,
      actorRole: session.role,
      action: "user_group_change_blocked",
      targetType: "user",
      targetId: userId,
      result: "failure",
      metadata: { oldGroupId, newGroupId, reason: result.blockedReason },
    });
    revalidatePath(`/users/${userId}`);
    return { error: result.blockedReason };
  }
  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_group_assigned", targetType: "user", targetId: userId, metadata: { oldGroupId, newGroupId } });
  revalidatePath(`/users/${userId}`);
  revalidatePath("/users");
  return { success: "Groupe modifié." };
}

export interface ResendResult {
  error?: string;
  success?: string;
}

/** "Renvoyer l'invitation" / "Envoyer lien d'activation" (§9-11/§41) — même
 * action serveur pour les deux libellés de menu (le libellé affiché par
 * l'UI dépend simplement de si une invitation a déjà été envoyée au moins
 * une fois — voir app/(app)/users/[id]/ActionsMenu.tsx) : jamais une
 * seconde implémentation du même comportement. Réutilise
 * lib/email/resend-actions.ts::resendInvitation SANS modification (compte
 * existant réutilisé, jeton renouvelé en sécurité, idempotency-suffix déjà
 * correct). */
export async function resendInvitationAction(userId: number, _prev: ResendResult, _formData: FormData): Promise<ResendResult> {
  const session = await requireWriteRole("administrator");
  try {
    await resendInvitation(userId, { id: session.userId, role: session.role });
  } catch (err) {
    return { error: err instanceof ResendError ? err.message : "Erreur lors de l'envoi de l'invitation." };
  }
  revalidatePath(`/users/${userId}`);
  return { success: "Invitation envoyée." };
}

/** "Envoyer lien réinitialisation" (§17) — action admin déclenchant le
 * MÊME flux self-service (lib/email/resend-actions.ts::sendPasswordResetLink),
 * jamais un mot de passe généré ici. */
export async function sendPasswordResetLinkAction(userId: number, _prev: ResendResult, _formData: FormData): Promise<ResendResult> {
  const session = await requireWriteRole("administrator");
  try {
    await sendPasswordResetLink(userId, { id: session.userId, role: session.role });
  } catch (err) {
    return { error: err instanceof ResendError ? err.message : "Erreur lors de l'envoi du lien de réinitialisation." };
  }
  revalidatePath(`/users/${userId}`);
  return { success: "Lien de réinitialisation envoyé." };
}

export interface SendMessageResult {
  error?: string;
  success?: string;
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  information: "Information",
  session: "Session / formation",
  examen: "Examen",
  document: "Document / rapport",
  support: "Support",
  autre: "Autre",
};

/** "Envoyer un message" (§36-40) — le destinataire vient TOUJOURS du
 * dossier du compte cible (findUserById(userId)), jamais d'un champ
 * formulaire — empêche structurellement l'injection d'un destinataire
 * arbitraire, quel que soit ce qu'un client altéré enverrait. Réutilise
 * intégralement l'outbox existant (notifyAdminMessage → queueAndSendEmail),
 * respecte EMAIL_MODE/allowlist comme tout autre email. */
export async function sendMessageAction(userId: number, _prev: SendMessageResult, formData: FormData): Promise<SendMessageResult> {
  const session = await requireWriteRole("administrator");
  const target = findUserById(userId);
  if (!target) return { error: "Compte introuvable." };
  if (!target.email) return { error: "Ce compte n'a pas d'email au dossier — impossible d'envoyer un message." };

  const subject = String(formData.get("subject") ?? "").trim();
  const messageType = String(formData.get("messageType") ?? "information");
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || undefined;
  const ctaUrl = String(formData.get("ctaUrl") ?? "").trim() || undefined;

  if (!subject || !bodyText) return { error: "Objet et message sont obligatoires." };

  const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
  const tenant = getPrimaryCompanyContext(userId);
  const sentAt = new Date().toISOString();

  await notifyAdminMessage({
    userId,
    email: target.email,
    firstName,
    senderName: session.username,
    messageTypeLabel: MESSAGE_TYPE_LABELS[messageType] ?? "Information",
    subject,
    bodyText,
    ctaLabel,
    ctaUrl,
    sentAt,
    tenant: tenant ? { companyId: tenant.companyId, companyName: tenant.companyName } : undefined,
  });

  audit({ actorUserId: session.userId, actorRole: session.role, action: "user_message_sent", targetType: "user", targetId: userId, metadata: { subject, messageType } });

  revalidatePath(`/users/${userId}`);
  return { success: `Message envoyé à ${target.full_name}.` };
}

/** Batch — actions sûres uniquement (§27) : jamais de suppression/
 * réinitialisation de mot de passe/MFA en masse. */
export interface BatchResult {
  error?: string;
  success?: string;
}

export async function batchAssignFunctionAction(userIds: number[], functionCode: string): Promise<BatchResult> {
  const session = await requireWriteRole("administrator");
  if (userIds.length === 0 || !functionCode) return { error: "Sélectionnez au moins un candidat et une fonction." };
  for (const userId of userIds) {
    assignFunctionToUser(userId, functionCode, session.userId);
    audit({ actorUserId: session.userId, actorRole: session.role, action: "user_function_assigned", targetType: "user", targetId: userId, metadata: { functionCode, batch: true } });
  }
  revalidatePath("/users");
  return { success: `Fonction ${functionCode} affectée à ${userIds.length} candidat(s).` };
}

export async function batchAssignGroupAction(userIds: number[], groupId: number): Promise<BatchResult> {
  const session = await requireWriteRole("administrator");
  if (userIds.length === 0 || !groupId) return { error: "Sélectionnez au moins un candidat et un groupe." };
  const group = getGroup(groupId);
  if (!group) return { error: "Groupe introuvable." };
  for (const userId of userIds) {
    addUserToGroup(userId, groupId, session.userId);
    audit({ actorUserId: session.userId, actorRole: session.role, action: "user_group_assigned", targetType: "user", targetId: userId, metadata: { groupId, batch: true } });
  }
  revalidatePath("/users");
  return { success: `${userIds.length} candidat(s) affecté(s) à ${group.name}.` };
}

export async function batchArchiveAction(userIds: number[]): Promise<BatchResult> {
  const session = await requireWriteRole("administrator");
  if (userIds.length === 0) return { error: "Sélectionnez au moins un candidat." };
  let archived = 0;
  for (const userId of userIds) {
    const { changed } = archiveUser(userId);
    if (changed) {
      revokeAllSessionsForUser(userId, session.userId);
      audit({ actorUserId: session.userId, actorRole: session.role, action: "user_archived", targetType: "user", targetId: userId, metadata: { batch: true } });
      archived++;
    }
  }
  revalidatePath("/users");
  return { success: `${archived} compte(s) archivé(s).` };
}

/** Lecture pure (§22) — appelée directement par la page/le composant
 * client pour afficher les raisons de blocage AVANT même de proposer la
 * confirmation forte, jamais après un échec surprise. */
export async function getHardDeleteCheckAction(userId: number) {
  await requireWriteRole("administrator");
  return canHardDeleteUser(userId);
}
