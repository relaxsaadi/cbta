// Catalogue typé des événements de notification (mission email §4/§33).
// Toute la plateforme déclenche des événements TYPÉS depuis ce fichier —
// jamais un appel direct au SDK Resend depuis une route/server action (§4).
//
// Statut de couverture (voir docs/KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md pour
// le détail à jour) :
//   WIRED       = déclenché automatiquement par un vrai flux applicatif
//   TEMPLATE_ONLY = gabarit + type d'événement existent, prévisualisables,
//                   pas encore raccordés à un déclencheur automatique réel
// Chaque entrée ci-dessous porte un commentaire indiquant son statut —
// jamais présenté comme "implémenté" s'il ne l'est pas réellement.

export type EmailEventType =
  // --- Compte / activation / mot de passe (WIRED) ---
  | "ACCOUNT_CREATED"
  | "ACCOUNT_ACTIVATED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_CHANGED"
  // --- MFA (WIRED) ---
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "MFA_RESET_BY_ADMIN"
  // --- Statut de compte (WIRED) ---
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED"
  // --- Affectation groupe/fonction (TEMPLATE_ONLY) ---
  | "CANDIDATE_ADDED_TO_GROUP"
  | "FUNCTION_ASSIGNED"
  // --- Examen (EXAM_ASSIGNED + les 3 rappels = WIRED via
  // lib/email/reminders.ts, reste = TEMPLATE_ONLY) ---
  | "EXAM_ASSIGNED"
  | "EXAM_OPENS_SOON"
  | "EXAM_NOW_AVAILABLE"
  | "EXAM_DEADLINE_REMINDER"
  | "EXAM_RESCHEDULED"
  | "EXAM_CANCELLED"
  | "EXAM_SUSPENDED"
  | "EXAM_RESUMED"
  | "ATTEMPT_REOPENED_BY_STAFF"
  // --- Résultats / rapports (RESULT_AVAILABLE = WIRED) ---
  | "RESULT_AVAILABLE"
  | "REPORT_AVAILABLE"
  // --- Familiarisation (FAMILIARIZATION_INVITATION = WIRED) ---
  | "FAMILIARIZATION_INVITATION"
  | "FAMILIARIZATION_REMINDER"
  // --- Responsable pédagogique (TEMPLATE_ONLY) ---
  | "GROUP_CREATED"
  | "EXAM_PUBLISHED"
  // --- Incidents (WIRED) / Maintenance (TEMPLATE_ONLY — gabarit prêt,
  // pas encore raccordé à setPlatformSetting("maintenance_mode", ...) :
  // la résolution "qui notifier" — tous les utilisateurs ? seulement les
  // tentatives en cours ? — restait une décision produit non tranchée
  // cette passe, voir docs/KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md) ---
  | "INCIDENT_DECLARED"
  | "INCIDENT_RESOLVED"
  | "MAINTENANCE_STARTED"
  | "MAINTENANCE_COMPLETED"
  // --- Opérations plateforme (admin uniquement, TEMPLATE_ONLY) ---
  | "HEALTHCHECK_FAILED"
  | "BACKUP_FAILED";

export const EMAIL_EVENT_TYPES: EmailEventType[] = [
  "ACCOUNT_CREATED",
  "ACCOUNT_ACTIVATED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_CHANGED",
  "MFA_ENABLED",
  "MFA_DISABLED",
  "MFA_RESET_BY_ADMIN",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_REACTIVATED",
  "CANDIDATE_ADDED_TO_GROUP",
  "FUNCTION_ASSIGNED",
  "EXAM_ASSIGNED",
  "EXAM_OPENS_SOON",
  "EXAM_NOW_AVAILABLE",
  "EXAM_DEADLINE_REMINDER",
  "EXAM_RESCHEDULED",
  "EXAM_CANCELLED",
  "EXAM_SUSPENDED",
  "EXAM_RESUMED",
  "ATTEMPT_REOPENED_BY_STAFF",
  "RESULT_AVAILABLE",
  "REPORT_AVAILABLE",
  "FAMILIARIZATION_INVITATION",
  "FAMILIARIZATION_REMINDER",
  "GROUP_CREATED",
  "EXAM_PUBLISHED",
  "INCIDENT_DECLARED",
  "INCIDENT_RESOLVED",
  "MAINTENANCE_STARTED",
  "MAINTENANCE_COMPLETED",
  "HEALTHCHECK_FAILED",
  "BACKUP_FAILED",
];

/** Événements qui ne peuvent JAMAIS être désactivés par une préférence
 * utilisateur (§31 — sécurité/transactionnel obligatoire). Tout le reste
 * est un "rappel optionnel" filtrable via lib/email/preferences.ts. */
export const MANDATORY_EVENT_TYPES: ReadonlySet<EmailEventType> = new Set([
  "ACCOUNT_CREATED",
  "ACCOUNT_ACTIVATED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_CHANGED",
  "MFA_ENABLED",
  "MFA_DISABLED",
  "MFA_RESET_BY_ADMIN",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_REACTIVATED",
  "EXAM_ASSIGNED",
  "EXAM_RESCHEDULED",
  "EXAM_CANCELLED",
  "EXAM_SUSPENDED",
  "EXAM_RESUMED",
  "RESULT_AVAILABLE",
  "REPORT_AVAILABLE",
  "INCIDENT_DECLARED",
  "INCIDENT_RESOLVED",
  "MAINTENANCE_STARTED",
  "MAINTENANCE_COMPLETED",
]);

// §24 — politique de contenu du résultat, configurable, jamais mélangée
// avec un consentement marketing.
export type ResultEmailPolicy = "NO_EMAIL" | "RESULT_AVAILABLE_ONLY" | "RESULT_WITH_SCORE";

export interface EmailRecipient {
  userId: number;
  email: string;
  firstName: string;
}

/** Contexte tenant — résolu par l'appelant depuis lib/tenant-scope.ts,
 * jamais par le sous-système email lui-même (§48 — isolation multi-client :
 * une seule source de vérité pour "qui appartient à quel client"). */
export interface EmailTenantContext {
  companyId: number | null;
  companyName: string | null;
}

export interface EmailEventBase {
  recipient: EmailRecipient;
  tenant: EmailTenantContext;
  /** Clé stable pour la déduplication (§34/§66) — voir lib/email/send.ts. */
  idempotencyKey: string;
}

export interface AccountCreatedPayload extends EmailEventBase {
  type: "ACCOUNT_CREATED";
  companyName: string;
  groupName: string;
  usernameOrEmail: string;
  activationToken: string;
  expiresAt: string;
}

export interface AccountActivatedPayload extends EmailEventBase {
  type: "ACCOUNT_ACTIVATED";
}

export interface PasswordResetRequestedPayload extends EmailEventBase {
  type: "PASSWORD_RESET_REQUESTED";
  resetToken: string;
  expiresAt: string;
}

export interface PasswordChangedPayload extends EmailEventBase {
  type: "PASSWORD_CHANGED";
  changedAt: string;
}

export interface MfaEnabledPayload extends EmailEventBase {
  type: "MFA_ENABLED";
}
export interface MfaDisabledPayload extends EmailEventBase {
  type: "MFA_DISABLED";
  byAdmin: boolean;
}
export interface MfaResetByAdminPayload extends EmailEventBase {
  type: "MFA_RESET_BY_ADMIN";
}

export interface AccountSuspendedPayload extends EmailEventBase {
  type: "ACCOUNT_SUSPENDED";
}
export interface AccountReactivatedPayload extends EmailEventBase {
  type: "ACCOUNT_REACTIVATED";
}

export interface CandidateAddedToGroupPayload extends EmailEventBase {
  type: "CANDIDATE_ADDED_TO_GROUP";
  companyName: string;
  groupName: string;
  dateStart: string | null;
  dateEnd: string | null;
  functionCodes: string[];
}

export interface FunctionAssignedPayload extends EmailEventBase {
  type: "FUNCTION_ASSIGNED";
  companyName: string;
  groupName: string;
  functionCode: string;
  functionLabel: string;
}

export interface ExamAssignedPayload extends EmailEventBase {
  type: "EXAM_ASSIGNED";
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyName: string;
  groupName: string;
  openAt: string | null;
  closeAt: string | null;
  durationMinutes: number;
  attemptsAllowed: number;
}

export interface ExamRescheduledPayload extends EmailEventBase {
  type: "EXAM_RESCHEDULED";
  assessmentId: number;
  examName: string;
  oldOpenAt: string | null;
  newOpenAt: string | null;
}

export interface ExamCancelledPayload extends EmailEventBase {
  type: "EXAM_CANCELLED";
  assessmentId: number;
  examName: string;
  originalDate: string | null;
}

export interface ExamSuspendedPayload extends EmailEventBase {
  type: "EXAM_SUSPENDED";
  assessmentId: number;
  examName: string;
}
export interface ExamResumedPayload extends EmailEventBase {
  type: "EXAM_RESUMED";
  assessmentId: number;
  examName: string;
}

export interface ResultAvailablePayload extends EmailEventBase {
  type: "RESULT_AVAILABLE";
  attemptId: number;
  examName: string;
  functionLabel: string;
  policy: ResultEmailPolicy;
  passed?: boolean;
  score100?: number;
  percentage?: number;
  passThresholdPct?: number;
}

export interface ReportAvailablePayload extends EmailEventBase {
  type: "REPORT_AVAILABLE";
  attemptId: number;
  examName: string;
}

export interface FamiliarizationInvitationPayload extends EmailEventBase {
  type: "FAMILIARIZATION_INVITATION";
  sessionId: number;
  functionLabel: string;
  heldAt: string;
  location: string | null;
}

export interface IncidentDeclaredPayload extends EmailEventBase {
  type: "INCIDENT_DECLARED";
  incidentId: number;
  incidentType: string;
  severity: string;
}
export interface IncidentResolvedPayload extends EmailEventBase {
  type: "INCIDENT_RESOLVED";
  incidentId: number;
  incidentType: string;
}

export interface MaintenanceStartedPayload extends EmailEventBase {
  type: "MAINTENANCE_STARTED";
}
export interface MaintenanceCompletedPayload extends EmailEventBase {
  type: "MAINTENANCE_COMPLETED";
}

export type EmailEventPayload =
  | AccountCreatedPayload
  | AccountActivatedPayload
  | PasswordResetRequestedPayload
  | PasswordChangedPayload
  | MfaEnabledPayload
  | MfaDisabledPayload
  | MfaResetByAdminPayload
  | AccountSuspendedPayload
  | AccountReactivatedPayload
  | CandidateAddedToGroupPayload
  | FunctionAssignedPayload
  | ExamAssignedPayload
  | ExamRescheduledPayload
  | ExamCancelledPayload
  | ExamSuspendedPayload
  | ExamResumedPayload
  | ResultAvailablePayload
  | ReportAvailablePayload
  | FamiliarizationInvitationPayload
  | IncidentDeclaredPayload
  | IncidentResolvedPayload
  | MaintenanceStartedPayload
  | MaintenanceCompletedPayload;

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
  templateId: string;
  templateVersion: string;
}
