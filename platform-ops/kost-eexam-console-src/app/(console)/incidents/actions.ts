"use server";

import { getSession } from "@/lib/session";
import { updateIncidentStatus, type IncidentStatus } from "@/lib/incidents-data";
import { revalidatePath } from "next/cache";

export async function changeIncidentStatusAction(incidentId: number, newStatus: IncidentStatus) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.username) {
    throw new Error("Session expirée.");
  }
  await updateIncidentStatus(incidentId, newStatus, session.username);
  revalidatePath("/incidents");
}
