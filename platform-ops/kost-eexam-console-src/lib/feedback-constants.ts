// Constantes partagées client/serveur — voir lib/incident-constants.ts pour
// l'explication (évite d'embarquer mysql2 dans le bundle client).
export type FeedbackCategory =
  | "platform_usability"
  | "exam_experience"
  | "technical_issue"
  | "instructions"
  | "other";

export type FeedbackStatus = "new" | "reviewed" | "action_required" | "actioned" | "closed";

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "platform_usability", label: "Platform usability" },
  { value: "exam_experience", label: "Exam experience" },
  { value: "technical_issue", label: "Technical issue" },
  { value: "instructions", label: "Instructions" },
  { value: "other", label: "Other" },
];
