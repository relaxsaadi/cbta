"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteRole } from "@/lib/rbac";
import { hasGroupAccess, hasFamiliarizationSessionAccess, assertAccess } from "@/lib/tenant-scope";
import { createFamiliarizationSession, markAttendance } from "@/lib/familiarization";
import { audit } from "@/lib/audit";

export interface CreateSessionResult {
  error?: string;
}

export async function createFamiliarizationSessionAction(_prev: CreateSessionResult, formData: FormData): Promise<CreateSessionResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const groupId = Number(formData.get("groupId"));
  const functionCode = String(formData.get("functionCode") ?? "").trim();
  const heldAt = String(formData.get("heldAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || undefined;
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!groupId || !functionCode || !heldAt) {
    return { error: "Groupe, fonction et date/heure sont obligatoires." };
  }
  if (!hasGroupAccess(session, groupId)) {
    audit({ actorUserId: session.userId, actorRole: session.role, action: "familiarization_session_create_denied", result: "failure", targetType: "group", targetId: groupId });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }

  const id = createFamiliarizationSession({
    groupId,
    functionCode,
    heldAt,
    location,
    notes,
    organizedBy: session.userId,
    organizerRole: session.role,
  });
  revalidatePath("/familiarisation");
  redirect(`/familiarisation/${id}`);
}

export async function markAttendanceAction(sessionId: number, formData: FormData) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  assertAccess(hasFamiliarizationSessionAccess(session, sessionId));
  const candidateUserId = Number(formData.get("candidateUserId"));
  const present = formData.get("present") === "true";
  if (!candidateUserId) return;
  markAttendance(sessionId, candidateUserId, present, { id: session.userId, role: session.role });
  revalidatePath(`/familiarisation/${sessionId}`);
}
