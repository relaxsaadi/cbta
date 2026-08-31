"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { declareCandidateIncident, CandidateIncidentError } from "@/lib/incidents";

export interface DeclareCandidateIncidentResult {
  error?: string;
  success?: string;
}

// Mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF" (2026-08-31)
// §24-33 — Server Action partagée par les 3 points d'entrée candidat
// (ExamRunner pendant l'examen, /mes-examens avant, /mes-resultats juste
// après soumission — voir components/candidate/DeclareIncidentModal.tsx,
// jamais 3 formulaires/actions divergents). requireRole("candidate")
// exclut structurellement tout autre rôle — un responsable/admin ne peut
// jamais invoquer cette action pour se faire passer pour un candidat
// (session.userId vient TOUJOURS de la session serveur, jamais d'un champ
// de formulaire, §37 "cannot spoof another attempt ID" appliqué au
// candidat lui-même en plus de l'attemptId).
export async function declareCandidateIncidentAction(
  attemptId: number | null,
  _prev: DeclareCandidateIncidentResult,
  formData: FormData
): Promise<DeclareCandidateIncidentResult> {
  const session = await requireRole("candidate");
  const type = String(formData.get("type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!type || !description) return { error: "Type et description sont obligatoires." };

  try {
    declareCandidateIncident({ type, description, attemptId: attemptId ?? undefined, candidateUserId: session.userId });
  } catch (err) {
    return { error: err instanceof CandidateIncidentError ? err.message : "Erreur inconnue." };
  }

  // Rafraîchit la liste "Mes incidents" (§28) sans navigation complète —
  // la modale reste ouverte pour montrer le message de confirmation
  // (voir DeclareIncidentModal.tsx), seul le cache de /mes-examens est
  // invalidé pour la prochaine visite/navigation.
  revalidatePath("/mes-examens");
  return { success: "Votre incident a été enregistré." };
}
