"use server";

import { getSession } from "@/lib/session";
import { createIncident, type IncidentCategory, type IncidentPriority } from "@/lib/incidents-data";
import { revalidatePath } from "next/cache";

export interface IncidentFormResult {
  error?: string;
  success?: boolean;
}

export async function reportIncidentAction(
  _prev: IncidentFormResult,
  formData: FormData
): Promise<IncidentFormResult> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.username) {
    return { error: "Session expired. Please log in again." };
  }

  const category = String(formData.get("category") ?? "") as IncidentCategory;
  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium") as IncidentPriority;
  const relatedExam = String(formData.get("relatedExam") ?? "").trim() || null;
  const relatedSession = String(formData.get("relatedSession") ?? "").trim() || null;
  const attachmentNote = String(formData.get("attachmentNote") ?? "").trim() || null;

  if (!category || !subject || !description) {
    return { error: "Category, subject, and description are required." };
  }

  await createIncident({
    category,
    subject,
    description,
    priority,
    reporterUsername: session.username,
    reporterFullName: session.fullName ?? session.username,
    relatedExam,
    relatedSession,
    attachmentNote,
  });

  revalidatePath("/incidents");
  return { success: true };
}
