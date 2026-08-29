"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { hasGroupAccess } from "@/lib/tenant-scope";
import {
  declareIncident,
  actionSuspendAccount,
  actionReactivateAccount,
  actionRevokeSessions,
  actionSuspendExam,
  actionReopenExam,
  actionAddNote,
  actionCorrectiveMeasure,
  actionEnableMaintenanceMode,
  actionDisableMaintenanceMode,
  actionBlockNewLogins,
  actionUnblockNewLogins,
  actionBlockNewAttempts,
  actionUnblockNewAttempts,
  actionAttachEvidence,
  closeIncident,
  setIncidentStatus,
  getIncident,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/lib/incidents";
import { findUserById } from "@/lib/users";
import { notifyIncidentDeclared, notifyIncidentResolved, notifyAccountSuspended, notifyAccountReactivated } from "@/lib/email/events";

export interface DeclareIncidentResult {
  error?: string;
}

export async function declareIncidentAction(_prev: DeclareIncidentResult, formData: FormData): Promise<DeclareIncidentResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const type = String(formData.get("type") ?? "").trim();
  const severity = String(formData.get("severity") ?? "medium") as IncidentSeverity;
  const description = String(formData.get("description") ?? "").trim();
  const systemConcerned = String(formData.get("systemConcerned") ?? "").trim() || undefined;
  const peopleConcerned = String(formData.get("peopleConcerned") ?? "").trim() || undefined;
  const groupIdRaw = String(formData.get("groupId") ?? "").trim();
  const groupId = groupIdRaw ? Number(groupIdRaw) : undefined;

  if (!type || !description) return { error: "Type et description sont obligatoires." };
  // Frontière multi-client (lib/tenant-scope.ts) — un responsable ne peut
  // déclarer un incident QUE pour un de ses propres groupes, jamais un
  // incident "plateforme" (classification réservée à administrator) ni le
  // groupe d'un autre client (même en forgeant l'id dans la requête).
  if (session.role === "pedagogical_manager") {
    if (!groupId) return { error: "Le client/groupe concerné est obligatoire pour un responsable pédagogique." };
    if (!hasGroupAccess(session, groupId)) return { error: "Ce groupe n'est pas dans votre périmètre." };
  } else if (groupId && !hasGroupAccess(session, groupId)) {
    return { error: "Groupe introuvable." };
  }

  const responsibleUserIdRaw = String(formData.get("responsibleUserId") ?? "").trim();
  const responsibleUserId = responsibleUserIdRaw ? Number(responsibleUserIdRaw) : undefined;
  const id = declareIncident({
    type,
    severity,
    description,
    systemConcerned,
    peopleConcerned,
    responsibleUserId,
    groupId,
    createdBy: session.userId,
    createdByRole: session.role,
  });

  // INCIDENT_DECLARED (mission email §29) — uniquement si un compte
  // précis est concerné (responsibleUserId) ; jamais le détail de
  // l'incident dans l'email (voir le gabarit).
  if (responsibleUserId) {
    const target = findUserById(responsibleUserId);
    if (target?.email) {
      const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
      await notifyIncidentDeclared({ userId: responsibleUserId, email: target.email, firstName, incidentId: id });
    }
  }

  revalidatePath("/incidents");
  redirect(`/incidents/${id}`);
}

async function actor() {
  const session = await requireWriteRole("administrator");
  return { id: session.userId, role: session.role };
}

// Ces 5 actions prennent `FormData` (pas un id positionnel) pour rester des
// références stables `.bind(null, incidentId)` utilisables directement comme
// `<form action=...>` — un id positionnel supplémentaire serait écrasé par
// l'objet FormData que React passe réellement à l'appel.
export async function suspendAccountAction(incidentId: number, formData: FormData) {
  const userId = Number(formData.get("targetId"));
  if (!userId) return;
  actionSuspendAccount(incidentId, userId, await actor());
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountSuspended({ userId, email: target.email, firstName, securityEventId: `incident-${incidentId}` });
  }
  revalidatePath(`/incidents/${incidentId}`);
}
export async function reactivateAccountAction(incidentId: number, formData: FormData) {
  const userId = Number(formData.get("targetId"));
  if (!userId) return;
  actionReactivateAccount(incidentId, userId, await actor());
  const target = findUserById(userId);
  if (target?.email) {
    const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
    await notifyAccountReactivated({ userId, email: target.email, firstName, securityEventId: `incident-${incidentId}` });
  }
  revalidatePath(`/incidents/${incidentId}`);
}
export async function revokeSessionsAction(incidentId: number, formData: FormData) {
  const userId = Number(formData.get("targetId"));
  if (!userId) return;
  actionRevokeSessions(incidentId, userId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function suspendExamAction(incidentId: number, formData: FormData) {
  const assessmentId = Number(formData.get("targetId"));
  if (!assessmentId) return;
  actionSuspendExam(incidentId, assessmentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function reopenExamAction(incidentId: number, formData: FormData) {
  const assessmentId = Number(formData.get("targetId"));
  if (!assessmentId) return;
  actionReopenExam(incidentId, assessmentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function addNoteAction(incidentId: number, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  actionAddNote(incidentId, note, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function addCorrectiveMeasureAction(incidentId: number, formData: FormData) {
  const measure = String(formData.get("measure") ?? "").trim();
  if (!measure) return;
  actionCorrectiveMeasure(incidentId, measure, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
// Actions plateforme (addendum §9-11). Sans FormData (boutons simples,
// pas de champ de saisie) — même signature `.bind(null, incidentId)` que
// closeIncidentAction ci-dessous.
export async function enableMaintenanceModeAction(incidentId: number) {
  actionEnableMaintenanceMode(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function disableMaintenanceModeAction(incidentId: number) {
  actionDisableMaintenanceMode(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function blockNewLoginsAction(incidentId: number) {
  actionBlockNewLogins(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function unblockNewLoginsAction(incidentId: number) {
  actionUnblockNewLogins(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function blockNewAttemptsAction(incidentId: number) {
  actionBlockNewAttempts(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function unblockNewAttemptsAction(incidentId: number) {
  actionUnblockNewAttempts(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
export async function attachEvidenceAction(incidentId: number, formData: FormData) {
  const description = String(formData.get("evidence") ?? "").trim();
  if (!description) return;
  actionAttachEvidence(incidentId, description, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}

export async function closeIncidentAction(incidentId: number) {
  closeIncident(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
}
export async function setIncidentStatusAction(incidentId: number, status: IncidentStatus) {
  setIncidentStatus(incidentId, status, await actor());

  // INCIDENT_RESOLVED (mission email §29) — uniquement sur la transition
  // VERS 'resolved', jamais pour 'investigating'/'closed'/etc. Même
  // principe que INCIDENT_DECLARED : seulement si un compte précis est
  // concerné, jamais le détail de l'incident dans l'email.
  if (status === "resolved") {
    const incident = getIncident(incidentId);
    if (incident?.responsible_user_id) {
      const target = findUserById(incident.responsible_user_id);
      if (target?.email) {
        const firstName = target.full_name.split(/\s+/)[0] ?? target.full_name;
        await notifyIncidentResolved({ userId: incident.responsible_user_id, email: target.email, firstName, incidentId });
      }
    }
  }

  revalidatePath(`/incidents/${incidentId}`);
}
