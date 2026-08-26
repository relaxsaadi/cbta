"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import {
  declareIncident,
  actionSuspendAccount,
  actionReactivateAccount,
  actionRevokeSessions,
  actionSuspendExam,
  actionReopenExam,
  actionAddNote,
  actionCorrectiveMeasure,
  closeIncident,
  setIncidentStatus,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/lib/incidents";

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

  if (!type || !description) return { error: "Type et description sont obligatoires." };

  const id = declareIncident({ type, severity, description, systemConcerned, peopleConcerned, createdBy: session.userId, createdByRole: session.role });
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
  revalidatePath(`/incidents/${incidentId}`);
}
export async function reactivateAccountAction(incidentId: number, formData: FormData) {
  const userId = Number(formData.get("targetId"));
  if (!userId) return;
  actionReactivateAccount(incidentId, userId, await actor());
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
export async function closeIncidentAction(incidentId: number) {
  closeIncident(incidentId, await actor());
  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
}
export async function setIncidentStatusAction(incidentId: number, status: IncidentStatus) {
  setIncidentStatus(incidentId, status, await actor());
  revalidatePath(`/incidents/${incidentId}`);
}
