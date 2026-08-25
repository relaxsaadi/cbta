"use server";

import { getSession } from "@/lib/session";
import { recordIdentityVerification } from "@/lib/identity-verification-data";
import { revalidatePath } from "next/cache";

export interface VerificationFormResult {
  error?: string;
  success?: boolean;
}

export async function recordVerificationAction(
  _prev: VerificationFormResult,
  formData: FormData
): Promise<VerificationFormResult> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.username) {
    return { error: "Session expirée. Veuillez vous reconnecter." };
  }
  if (!["administrator", "exam_manager", "instructor"].includes(session.role ?? "")) {
    return { error: "Votre rôle n'est pas autorisé à enregistrer des vérifications d'identité." };
  }

  const candidateUsername = String(formData.get("candidateUsername") ?? "").trim();
  const candidateFullName = String(formData.get("candidateFullName") ?? "").trim();
  const examName = String(formData.get("examName") ?? "").trim();
  const sessionReference = String(formData.get("sessionReference") ?? "").trim() || null;

  if (!candidateUsername || !candidateFullName || !examName) {
    return { error: "Identifiant du candidat, nom du candidat et examen sont obligatoires." };
  }

  await recordIdentityVerification({
    candidateUsername,
    candidateFullName,
    examName,
    sessionReference,
    verifiedByUsername: session.username,
    verifiedByFullName: session.fullName ?? session.username,
    method: "official_id_supervised",
  });

  revalidatePath("/identity-verification");
  return { success: true };
}
