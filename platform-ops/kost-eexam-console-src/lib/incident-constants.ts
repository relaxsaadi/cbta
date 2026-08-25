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
  { value: "login", label: "Login" },
  { value: "exam_access", label: "Exam access" },
  { value: "technical_failure", label: "Technical failure" },
  { value: "question_display", label: "Question display" },
  { value: "timer", label: "Timer" },
  { value: "submission", label: "Submission" },
  { value: "other", label: "Other" },
];
