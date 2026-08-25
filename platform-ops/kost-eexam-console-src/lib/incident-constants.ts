// Constantes partagées client/serveur — aucune dépendance server-only (voir
// lib/dgr-functions.ts pour le même problème déjà rencontré : un composant
// client qui importe une valeur réelle depuis un module qui importe mysql2
// fait échouer le build avec "Module not found: Can't resolve 'tls'").
export type IncidentCategory =
  | "login"
  | "exam_access"
  | "technical_failure"
  | "question_display"
  | "timer"
  | "submission"
  | "other";

export type IncidentPriority = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "in_progress" | "resolved" | "closed";

export const INCIDENT_CATEGORIES: { value: IncidentCategory; label: string }[] = [
  { value: "login", label: "Connexion" },
  { value: "exam_access", label: "Accès à l'examen" },
  { value: "technical_failure", label: "Panne technique" },
  { value: "question_display", label: "Affichage des questions" },
  { value: "timer", label: "Chronomètre" },
  { value: "submission", label: "Envoi" },
  { value: "other", label: "Autre" },
];
