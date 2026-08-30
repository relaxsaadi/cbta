// Point d'entrée typé UNIQUE pour tout déclenchement de notification
// (mission email §4) — chaque flux métier (création de candidat, MFA,
// publication d'examen, notation, incidents...) appelle UNE de ces
// fonctions, jamais le SDK Resend directement. Chaque fonction : résout
// le destinataire, vérifie les préférences (rappels optionnels
// uniquement), rend le gabarit React Email, calcule la clé d'idempotence,
// et délègue à queueAndSendEmail (l'outbox).
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { render } from "@react-email/components";
import { createElement } from "react";
import { queueAndSendEmail } from "./send";
import { shouldSendToUser } from "./preferences";
import { getAppBaseUrl, getSenderExam, getSenderNotifications, getSenderSecurity, getAdminAlertRecipient } from "./config";
import { formatCandidateDateTime } from "./format";
import type { EmailTenantContext, ResultEmailPolicy } from "./types";

import AccountCreatedEmail, { accountCreatedSubject, TEMPLATE_ID as ACCOUNT_CREATED_ID, TEMPLATE_VERSION as ACCOUNT_CREATED_V } from "./templates/account-created";
import AccountActivatedEmail, { accountActivatedSubject, TEMPLATE_ID as ACCOUNT_ACTIVATED_ID, TEMPLATE_VERSION as ACCOUNT_ACTIVATED_V } from "./templates/account-activated";
import PasswordResetRequestedEmail, {
  passwordResetRequestedSubject,
  TEMPLATE_ID as PWD_RESET_ID,
  TEMPLATE_VERSION as PWD_RESET_V,
} from "./templates/password-reset-requested";
import PasswordChangedEmail, { passwordChangedSubject, TEMPLATE_ID as PWD_CHANGED_ID, TEMPLATE_VERSION as PWD_CHANGED_V } from "./templates/password-changed";
import TemporaryAccessCreatedEmail, {
  temporaryAccessCreatedSubject,
  TEMPLATE_ID as TEMP_ACCESS_ID,
  TEMPLATE_VERSION as TEMP_ACCESS_V,
} from "./templates/temporary-access-created";
import MfaEnabledEmail, { mfaEnabledSubject, TEMPLATE_ID as MFA_ENABLED_ID, TEMPLATE_VERSION as MFA_ENABLED_V } from "./templates/mfa-enabled";
import MfaDisabledEmail, { mfaDisabledSubject, TEMPLATE_ID as MFA_DISABLED_ID, TEMPLATE_VERSION as MFA_DISABLED_V } from "./templates/mfa-disabled";
import AccountSuspendedEmail, {
  accountSuspendedSubject,
  TEMPLATE_ID as ACCOUNT_SUSPENDED_ID,
  TEMPLATE_VERSION as ACCOUNT_SUSPENDED_V,
} from "./templates/account-suspended";
import AccountReactivatedEmail, {
  accountReactivatedSubject,
  TEMPLATE_ID as ACCOUNT_REACTIVATED_ID,
  TEMPLATE_VERSION as ACCOUNT_REACTIVATED_V,
} from "./templates/account-reactivated";
import ExamAssignedEmail, { examAssignedSubject, TEMPLATE_ID as EXAM_ASSIGNED_ID, TEMPLATE_VERSION as EXAM_ASSIGNED_V } from "./templates/exam-assigned";
import ExamOpensSoonEmail, { examOpensSoonSubject, TEMPLATE_ID as EXAM_OPENS_SOON_ID, TEMPLATE_VERSION as EXAM_OPENS_SOON_V } from "./templates/exam-opens-soon";
import ExamNowAvailableEmail, {
  examNowAvailableSubject,
  TEMPLATE_ID as EXAM_NOW_AVAILABLE_ID,
  TEMPLATE_VERSION as EXAM_NOW_AVAILABLE_V,
} from "./templates/exam-now-available";
import ExamDeadlineReminderEmail, {
  examDeadlineReminderSubject,
  TEMPLATE_ID as EXAM_DEADLINE_REMINDER_ID,
  TEMPLATE_VERSION as EXAM_DEADLINE_REMINDER_V,
} from "./templates/exam-deadline-reminder";
import ExamRescheduledEmail, { examRescheduledSubject, TEMPLATE_ID as EXAM_RESCHEDULED_ID, TEMPLATE_VERSION as EXAM_RESCHEDULED_V } from "./templates/exam-rescheduled";
import ExamSubmittedEmail, { examSubmittedSubject, TEMPLATE_ID as EXAM_SUBMITTED_ID, TEMPLATE_VERSION as EXAM_SUBMITTED_V } from "./templates/exam-submitted";
import ExamSubmittedAdminEmail, {
  examSubmittedAdminSubject,
  TEMPLATE_ID as EXAM_SUBMITTED_ADMIN_ID,
  TEMPLATE_VERSION as EXAM_SUBMITTED_ADMIN_V,
} from "./templates/exam-submitted-admin";
import ResultAvailableEmail, { resultAvailableSubject, TEMPLATE_ID as RESULT_AVAILABLE_ID, TEMPLATE_VERSION as RESULT_AVAILABLE_V } from "./templates/result-available";
import IncidentDeclaredEmail, { incidentDeclaredSubject, TEMPLATE_ID as INCIDENT_DECLARED_ID, TEMPLATE_VERSION as INCIDENT_DECLARED_V } from "./templates/incident-declared";
import IncidentResolvedEmail, { incidentResolvedSubject, TEMPLATE_ID as INCIDENT_RESOLVED_ID, TEMPLATE_VERSION as INCIDENT_RESOLVED_V } from "./templates/incident-resolved";
import {
  MaintenanceStartedEmail,
  MaintenanceCompletedEmail,
  maintenanceStartedSubject,
  maintenanceCompletedSubject,
  MAINTENANCE_STARTED_TEMPLATE_ID,
  MAINTENANCE_COMPLETED_TEMPLATE_ID,
  TEMPLATE_VERSION as MAINTENANCE_V,
} from "./templates/maintenance";
import FamiliarizationInvitationEmail, {
  familiarizationInvitationSubject,
  TEMPLATE_ID as FAMILIARIZATION_ID,
  TEMPLATE_VERSION as FAMILIARIZATION_V,
} from "./templates/familiarization-invitation";
import UsernameChangedEmail, { usernameChangedSubject, TEMPLATE_ID as USERNAME_CHANGED_ID, TEMPLATE_VERSION as USERNAME_CHANGED_V } from "./templates/username-changed";
import AdminMessageEmail, { adminMessageSubject, TEMPLATE_ID as ADMIN_MESSAGE_ID, TEMPLATE_VERSION as ADMIN_MESSAGE_V } from "./templates/admin-message";

async function renderBoth(node: React.ReactElement): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([render(node), render(node, { plainText: true })]);
  return { html, text };
}

const NO_TENANT: EmailTenantContext = { companyId: null, companyName: null };

// queueAndSendEmail() garantit déjà (§35) qu'une erreur RÉSEAU Resend
// survenant APRÈS l'écriture de l'outbox ne remonte jamais à l'appelant
// (la ligne notification_log reste FAILED, reprise par processOutboxRetries).
// Mais chaque fonction notify*() ci-dessous fait aussi du travail AVANT
// cet appel : résoudre APP_BASE_URL (getAppBaseUrl() lève si absent),
// rendre le gabarit React Email, lire une valeur auxiliaire (functionLabel,
// politique de résultat...). Une exception à CE stade échappait jusqu'ici
// à toute protection et remontait telle quelle à l'action métier
// appelante — un APP_BASE_URL non configuré aurait donc pu faire échouer
// la création d'un compte ou la publication d'un examen, à l'exact
// opposé de la garantie explicite §39 ("un problème d'email n'annule
// jamais une action métier"). Trouvé en préparant les tests E2E de cette
// mission (aucun test existant n'exerçait ce chemin : les comptes de démo
// n'ont pas d'email, donc `if (!candidate?.email) continue` court-
// circuitait silencieusement l'appel avant qu'il puisse lever). Chaque
// notify*() exporté délègue maintenant sa logique à safe() ci-dessous —
// plus aucune exception ne peut structurellement sortir de ce module, quel
// que soit le point où elle survient. Un échec ici reste diagnosticable
// (log serveur, jamais un secret ni un contenu de gabarit) mais n'est
// jamais visible de l'appelant.
async function safe(eventType: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[email] ${eventType} — échec avant l'outbox (aucune ligne notification_log créée) :`, err instanceof Error ? err.message : String(err));
  }
}

// ---------------------------------------------------------------------
// ACCOUNT_CREATED
// ---------------------------------------------------------------------
export async function notifyAccountCreated(params: {
  userId: number;
  email: string;
  firstName: string;
  companyId: number | null;
  companyName: string;
  groupName: string;
  usernameOrEmail: string;
  activationToken: string;
  expiresAt: string;
  /** §41 "Renvoyer l'invitation" — bug réel trouvé en testant le renvoi
   * réel sur staging (2026-08-29, compte Brahimi) : sans ce paramètre,
   * l'idempotency_key restait STABLE (`account-created/{userId}`) pour
   * tout renvoi — la toute PREMIÈRE tentative (même suffisamment
   * ancienne, même SUPPRESSED) faisait que queueAndSendEmail()
   * dédupliquait silencieusement chaque renvoi suivant contre cette
   * ligne d'origine, sans jamais re-tenter un envoi réel ni créer de
   * nouvelle ligne d'historique — "Renvoyer l'invitation" ne renvoyait
   * donc RIEN, silencieusement, depuis la construction initiale du
   * sous-système email. Même correctif que notifyExamAssigned
   * (déjà correct depuis le début — cette lacune ne touchait que
   * notifyAccountCreated). Omis = comportement normal (un seul envoi par
   * création de compte). */
  forceResendSuffix?: string;
}): Promise<void> {
  return safe("ACCOUNT_CREATED", async () => {
    const activationUrl = `${getAppBaseUrl()}/activer?token=${params.activationToken}`;
    const { html, text } = await renderBoth(
      createElement(AccountCreatedEmail, {
        firstName: params.firstName,
        companyName: params.companyName,
        groupName: params.groupName,
        usernameOrEmail: params.usernameOrEmail,
        activationUrl,
        expiresAtFormatted: formatCandidateDateTime(params.expiresAt),
      })
    );
    const idempotencyKey = params.forceResendSuffix ? `account-created-resend/${params.userId}/${params.forceResendSuffix}` : `account-created/${params.userId}`;
    await queueAndSendEmail({
      eventType: "ACCOUNT_CREATED",
      idempotencyKey,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: accountCreatedSubject(), html, text, templateId: ACCOUNT_CREATED_ID, templateVersion: ACCOUNT_CREATED_V },
    });
  });
}

// ---------------------------------------------------------------------
// ACCOUNT_ACTIVATED
// ---------------------------------------------------------------------
export async function notifyAccountActivated(params: { userId: number; email: string; firstName: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe("ACCOUNT_ACTIVATED", async () => {
    const loginUrl = `${getAppBaseUrl()}/login`;
    const { html, text } = await renderBoth(createElement(AccountActivatedEmail, { firstName: params.firstName, loginUrl }));
    await queueAndSendEmail({
      eventType: "ACCOUNT_ACTIVATED",
      idempotencyKey: `account-activated/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderExam(),
      rendered: { subject: accountActivatedSubject(), html, text, templateId: ACCOUNT_ACTIVATED_ID, templateVersion: ACCOUNT_ACTIVATED_V },
    });
  });
}

// ---------------------------------------------------------------------
// PASSWORD_RESET_REQUESTED
// ---------------------------------------------------------------------
export async function notifyPasswordResetRequested(params: {
  userId: number;
  email: string;
  firstName: string;
  /** Mission "COMPLETE USER MANAGEMENT" §19 — identifiant de connexion,
   * rappelé qu'il s'agisse d'une demande self-service ou déclenchée par un
   * admin (voir lib/email/resend-actions.ts::sendPasswordResetLink). */
  username: string;
  resetToken: string;
  expiresAt: string;
  tenant?: EmailTenantContext;
}): Promise<void> {
  return safe("PASSWORD_RESET_REQUESTED", async () => {
    const resetUrl = `${getAppBaseUrl()}/mot-de-passe/reinitialiser?token=${params.resetToken}`;
    const { html, text } = await renderBoth(
      createElement(PasswordResetRequestedEmail, {
        firstName: params.firstName,
        username: params.username,
        resetUrl,
        expiresAtFormatted: formatCandidateDateTime(params.expiresAt),
      })
    );
    // Clé d'idempotence incluant le jeton lui-même (haché, pas en clair) —
    // une NOUVELLE demande de réinitialisation doit toujours produire un
    // nouvel email, contrairement à account-created qui ne doit jamais se
    // dupliquer pour le MÊME compte.
    await queueAndSendEmail({
      eventType: "PASSWORD_RESET_REQUESTED",
      idempotencyKey: `password-reset/${params.userId}/${params.resetToken.slice(0, 16)}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: passwordResetRequestedSubject(), html, text, templateId: PWD_RESET_ID, templateVersion: PWD_RESET_V },
    });
  });
}

// ---------------------------------------------------------------------
// PASSWORD_CHANGED (sécurité obligatoire)
// ---------------------------------------------------------------------
export async function notifyPasswordChanged(params: {
  userId: number;
  email: string;
  firstName: string;
  username: string;
  changedAt: string;
  tenant?: EmailTenantContext;
}): Promise<void> {
  return safe("PASSWORD_CHANGED", async () => {
    const loginUrl = `${getAppBaseUrl()}/login`;
    const { html, text } = await renderBoth(
      createElement(PasswordChangedEmail, { firstName: params.firstName, username: params.username, changedAtFormatted: formatCandidateDateTime(params.changedAt), loginUrl })
    );
    await queueAndSendEmail({
      eventType: "PASSWORD_CHANGED",
      idempotencyKey: `password-changed/${params.userId}/${params.changedAt}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: passwordChangedSubject(), html, text, templateId: PWD_CHANGED_ID, templateVersion: PWD_CHANGED_V },
    });
  });
}

// ---------------------------------------------------------------------
// TEMPORARY_ACCESS_CREATED (mission "ADMIN/CLIENT/CANDIDATE UX
// IMPROVEMENTS", 2026-08-30, §7-9) — le mot de passe temporaire transite
// EN CLAIR dans `params.temporaryPassword` jusqu'au rendu du gabarit, puis
// n'existe plus (jamais stocké, jamais dans metadata, jamais dans le
// journal d'audit — voir lib/temp-password.ts::createTemporaryAccess et
// l'appelant, app/(app)/groups/[id]/actions.ts::createTemporaryAccessAction).
// idempotencyKey inclut expiresAt : chaque émission d'un NOUVEL accès
// temporaire (ex. remplacement après expiration) produit une ligne
// notification_log distincte, jamais dédupliquée contre un envoi antérieur.
export async function notifyTemporaryAccessCreated(params: {
  userId: number;
  email: string;
  firstName: string;
  username: string;
  temporaryPassword: string;
  expiresAt: string;
  tenant?: EmailTenantContext;
}): Promise<void> {
  return safe("TEMPORARY_ACCESS_CREATED", async () => {
    const loginUrl = `${getAppBaseUrl()}/login`;
    const { html, text } = await renderBoth(
      createElement(TemporaryAccessCreatedEmail, {
        firstName: params.firstName,
        username: params.username,
        temporaryPassword: params.temporaryPassword,
        expiresAtFormatted: formatCandidateDateTime(params.expiresAt),
        loginUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "TEMPORARY_ACCESS_CREATED",
      idempotencyKey: `temporary-access-created/${params.userId}/${params.expiresAt}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: temporaryAccessCreatedSubject(), html, text, templateId: TEMP_ACCESS_ID, templateVersion: TEMP_ACCESS_V },
    });
  });
}

// ---------------------------------------------------------------------
// MFA_ENABLED / MFA_DISABLED / MFA_RESET_BY_ADMIN
// ---------------------------------------------------------------------
export async function notifyMfaEnabled(params: { userId: number; email: string; firstName: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe("MFA_ENABLED", async () => {
    const { html, text } = await renderBoth(createElement(MfaEnabledEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "MFA_ENABLED",
      idempotencyKey: `mfa-enabled/${params.userId}/${Date.now()}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: mfaEnabledSubject(), html, text, templateId: MFA_ENABLED_ID, templateVersion: MFA_ENABLED_V },
    });
  });
}

export async function notifyMfaDisabled(params: { userId: number; email: string; firstName: string; byAdmin: boolean; securityEventId: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe(params.byAdmin ? "MFA_RESET_BY_ADMIN" : "MFA_DISABLED", async () => {
    const { html, text } = await renderBoth(createElement(MfaDisabledEmail, { firstName: params.firstName, byAdmin: params.byAdmin }));
    await queueAndSendEmail({
      eventType: params.byAdmin ? "MFA_RESET_BY_ADMIN" : "MFA_DISABLED",
      idempotencyKey: `mfa-disabled/${params.userId}/${params.securityEventId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: mfaDisabledSubject(), html, text, templateId: MFA_DISABLED_ID, templateVersion: MFA_DISABLED_V },
    });
  });
}

// ---------------------------------------------------------------------
// ACCOUNT_SUSPENDED / ACCOUNT_REACTIVATED
// ---------------------------------------------------------------------
export async function notifyAccountSuspended(params: { userId: number; email: string; firstName: string; securityEventId: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe("ACCOUNT_SUSPENDED", async () => {
    const { html, text } = await renderBoth(createElement(AccountSuspendedEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "ACCOUNT_SUSPENDED",
      idempotencyKey: `account-suspended/${params.userId}/${params.securityEventId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: accountSuspendedSubject(), html, text, templateId: ACCOUNT_SUSPENDED_ID, templateVersion: ACCOUNT_SUSPENDED_V },
    });
  });
}

export async function notifyAccountReactivated(params: { userId: number; email: string; firstName: string; securityEventId: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe("ACCOUNT_REACTIVATED", async () => {
    const loginUrl = `${getAppBaseUrl()}/login`;
    const { html, text } = await renderBoth(createElement(AccountReactivatedEmail, { firstName: params.firstName, loginUrl }));
    await queueAndSendEmail({
      eventType: "ACCOUNT_REACTIVATED",
      idempotencyKey: `account-reactivated/${params.userId}/${params.securityEventId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: accountReactivatedSubject(), html, text, templateId: ACCOUNT_REACTIVATED_ID, templateVersion: ACCOUNT_REACTIVATED_V },
    });
  });
}

// ---------------------------------------------------------------------
// EXAM_ASSIGNED
// ---------------------------------------------------------------------
export async function notifyExamAssigned(params: {
  userId: number;
  email: string;
  firstName: string;
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  groupName: string;
  openAt: string | null;
  closeAt: string | null;
  durationMinutes: number;
  attemptsAllowed: number;
  /** §41 "Renvoyer la notification d'examen" — un renvoi explicite doit
   * toujours produire une nouvelle ligne d'historique observable par
   * l'admin, jamais se faire absorber silencieusement par la clé
   * d'idempotence STABLE de l'envoi original. Omis = comportement normal
   * (une seule notification par affectation). */
  forceResendSuffix?: string;
}): Promise<void> {
  return safe("EXAM_ASSIGNED", async () => {
    const examUrl = `${getAppBaseUrl()}/mes-examens`;
    const { html, text } = await renderBoth(
      createElement(ExamAssignedEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        companyName: params.companyName,
        groupName: params.groupName,
        openAtFormatted: params.openAt ? formatCandidateDateTime(params.openAt) : null,
        closeAtFormatted: params.closeAt ? formatCandidateDateTime(params.closeAt) : null,
        durationMinutes: params.durationMinutes,
        attemptsAllowed: params.attemptsAllowed,
        examUrl,
      })
    );
    const idempotencyKey = params.forceResendSuffix
      ? `exam-assigned-resend/${params.assessmentId}/${params.userId}/${params.forceResendSuffix}`
      : `exam-assigned/${params.assessmentId}/${params.userId}`;
    await queueAndSendEmail({
      eventType: "EXAM_ASSIGNED",
      idempotencyKey,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examAssignedSubject(), html, text, templateId: EXAM_ASSIGNED_ID, templateVersion: EXAM_ASSIGNED_V },
      // assessmentId persisté en metadata (jamais un secret) uniquement pour
      // que l'historique admin (app/(app)/notifications) puisse proposer un
      // bouton "Renvoyer" sans re-résoudre l'affectation par un autre chemin.
      metadata: { assessmentId: params.assessmentId },
    });
  });
}

// ---------------------------------------------------------------------
// EXAM_OPENS_SOON / EXAM_NOW_AVAILABLE / EXAM_DEADLINE_REMINDER — rappels
// OPTIONNELS (mission email §22-23, WIRED via lib/email/reminders.ts,
// jamais appelés directement par une route/action utilisateur). Chaque
// idempotency_key inclut le type de rappel — trois rappels distincts pour
// le même (examen, candidat) doivent chacun produire leur propre ligne
// d'historique, jamais se dédupliquer entre eux ; le VRAI anti-doublon
// "un seul envoi par type de rappel" vient de reminder_dispatch_log, pas
// de cette clé.
// ---------------------------------------------------------------------
export async function notifyExamOpensSoon(params: {
  userId: number;
  email: string;
  firstName: string;
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  openAt: string;
  durationMinutes: number;
}): Promise<void> {
  return safe("EXAM_OPENS_SOON", async () => {
    if (!shouldSendToUser("EXAM_OPENS_SOON", params.userId)) return;
    const examUrl = `${getAppBaseUrl()}/mes-examens`;
    const { html, text } = await renderBoth(
      createElement(ExamOpensSoonEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        openAtFormatted: formatCandidateDateTime(params.openAt),
        durationMinutes: params.durationMinutes,
        examUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "EXAM_OPENS_SOON",
      idempotencyKey: `exam-opens-soon/${params.assessmentId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examOpensSoonSubject(), html, text, templateId: EXAM_OPENS_SOON_ID, templateVersion: EXAM_OPENS_SOON_V },
      metadata: { assessmentId: params.assessmentId },
    });
  });
}

export async function notifyExamNowAvailable(params: {
  userId: number;
  email: string;
  firstName: string;
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  closeAt: string | null;
  durationMinutes: number;
}): Promise<void> {
  return safe("EXAM_NOW_AVAILABLE", async () => {
    if (!shouldSendToUser("EXAM_NOW_AVAILABLE", params.userId)) return;
    const examUrl = `${getAppBaseUrl()}/mes-examens`;
    const { html, text } = await renderBoth(
      createElement(ExamNowAvailableEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        closeAtFormatted: params.closeAt ? formatCandidateDateTime(params.closeAt) : null,
        durationMinutes: params.durationMinutes,
        examUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "EXAM_NOW_AVAILABLE",
      idempotencyKey: `exam-now-available/${params.assessmentId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examNowAvailableSubject(), html, text, templateId: EXAM_NOW_AVAILABLE_ID, templateVersion: EXAM_NOW_AVAILABLE_V },
      metadata: { assessmentId: params.assessmentId },
    });
  });
}

export async function notifyExamDeadlineReminder(params: {
  userId: number;
  email: string;
  firstName: string;
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  closeAt: string;
}): Promise<void> {
  return safe("EXAM_DEADLINE_REMINDER", async () => {
    if (!shouldSendToUser("EXAM_DEADLINE_REMINDER", params.userId)) return;
    const examUrl = `${getAppBaseUrl()}/mes-examens`;
    const { html, text } = await renderBoth(
      createElement(ExamDeadlineReminderEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        closeAtFormatted: formatCandidateDateTime(params.closeAt),
        examUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "EXAM_DEADLINE_REMINDER",
      idempotencyKey: `exam-deadline-reminder/${params.assessmentId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examDeadlineReminderSubject(), html, text, templateId: EXAM_DEADLINE_REMINDER_ID, templateVersion: EXAM_DEADLINE_REMINDER_V },
      metadata: { assessmentId: params.assessmentId },
    });
  });
}

// ---------------------------------------------------------------------
// EXAM_RESCHEDULED (mission "COMPLETE REAL EXAM RESCHEDULING WORKFLOW",
// 2026-08-29) — déclenchée par lib/assessments.ts::rescheduleAssessment()
// via app/(app)/exam-preparation/actions.ts::rescheduleAssessmentAction,
// jamais un déclencheur email-only fabriqué (§1 de cette mission).
//
// Idempotence (§10 de la mission) — DÉLIBÉRÉMENT différente du modèle
// "forceResendSuffix" de notifyExamAssigned/notifyAccountCreated : ici,
// la clé inclut directement les NOUVELLES dates plutôt qu'un suffixe
// arbitraire. Cela donne exactement la propriété demandée sans code
// supplémentaire : rejouer la MÊME reprogrammation (mêmes nouvelles
// dates — ex. une requête HTTP retentée automatiquement) retombe sur la
// même clé et se déduplique naturellement (aucun email en double) ; une
// reprogrammation ultérieure GENUINEMENT différente (nouvelles dates
// différentes) produit une clé différente et déclenche donc un nouvel
// email, comme attendu.
// ---------------------------------------------------------------------
export async function notifyExamRescheduled(params: {
  userId: number;
  email: string;
  firstName: string;
  assessmentId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  oldOpenAt: string | null;
  oldCloseAt: string | null;
  newOpenAt: string | null;
  newCloseAt: string | null;
}): Promise<void> {
  return safe("EXAM_RESCHEDULED", async () => {
    const examUrl = `${getAppBaseUrl()}/mes-examens`;
    const { html, text } = await renderBoth(
      createElement(ExamRescheduledEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        oldOpenAtFormatted: params.oldOpenAt ? formatCandidateDateTime(params.oldOpenAt) : null,
        oldCloseAtFormatted: params.oldCloseAt ? formatCandidateDateTime(params.oldCloseAt) : null,
        newOpenAtFormatted: params.newOpenAt ? formatCandidateDateTime(params.newOpenAt) : null,
        newCloseAtFormatted: params.newCloseAt ? formatCandidateDateTime(params.newCloseAt) : null,
        examUrl,
      })
    );
    const idempotencyKey = `exam-rescheduled/${params.assessmentId}/${params.userId}/${params.newOpenAt ?? "null"}-${params.newCloseAt ?? "null"}`;
    await queueAndSendEmail({
      eventType: "EXAM_RESCHEDULED",
      idempotencyKey,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examRescheduledSubject(), html, text, templateId: EXAM_RESCHEDULED_ID, templateVersion: EXAM_RESCHEDULED_V },
      metadata: { assessmentId: params.assessmentId },
    });
  });
}

// ---------------------------------------------------------------------
// EXAM_SUBMITTED (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
// 2026-08-29, §31) — confirmation candidat après envoi réel (manuel ou
// auto-soumission par expiration du chronomètre). Idempotence horodatée
// (submittedAt) — une resoumission déjà idempotente côté métier
// (submitAttempt no-op) ne doit de toute façon jamais redéclencher cet
// appel (voir app/(app)/exam/[assessmentId]/attempt/actions.ts, qui
// n'appelle ce notify* que sur la VRAIE première transition).
// ---------------------------------------------------------------------
export async function notifyExamSubmitted(params: {
  userId: number;
  email: string;
  firstName: string;
  username: string;
  examName: string;
  functionLabel: string;
  submittedAt: string;
  statusLabel: string;
  companyId: number;
  companyName: string;
}): Promise<void> {
  return safe("EXAM_SUBMITTED", async () => {
    const examUrl = `${getAppBaseUrl()}/mes-resultats`;
    const { html, text } = await renderBoth(
      createElement(ExamSubmittedEmail, {
        firstName: params.firstName,
        username: params.username,
        examName: params.examName,
        functionLabel: params.functionLabel,
        submittedAtFormatted: formatCandidateDateTime(params.submittedAt),
        statusLabel: params.statusLabel,
        examUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "EXAM_SUBMITTED",
      idempotencyKey: `exam-submitted/${params.userId}/${params.submittedAt}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: examSubmittedSubject(), html, text, templateId: EXAM_SUBMITTED_ID, templateVersion: EXAM_SUBMITTED_V },
    });
  });
}

// ---------------------------------------------------------------------
// EXAM_SUBMITTED_ADMIN (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
// 2026-08-29, §34-36) — notifie le staff responsable. Destinataires
// résolus par l'APPELANT (jamais deviné ici, §34 dernière ligne : "Do not
// hardcode one personal admin email") — voir
// app/(app)/exam/[assessmentId]/attempt/actions.ts pour la résolution
// réelle (responsable pédagogique du groupe + ADMIN_ALERT_RECIPIENT
// configuré, dédupliqués). Cette fonction envoie à UN destinataire ; c'est
// l'appelant qui boucle sur la liste résolue.
// ---------------------------------------------------------------------
export async function notifyExamSubmittedAdmin(params: {
  recipientUserId: number | null;
  recipientEmail: string;
  attemptId: number;
  candidateName: string;
  candidateUsername: string;
  companyId: number;
  companyName: string;
  groupName: string;
  examName: string;
  functionLabel: string;
  submittedAt: string;
  statusLabel: string;
}): Promise<void> {
  return safe("EXAM_SUBMITTED_ADMIN", async () => {
    const attemptUrl = `${getAppBaseUrl()}/results/${params.attemptId}`;
    const { html, text } = await renderBoth(
      createElement(ExamSubmittedAdminEmail, {
        candidateName: params.candidateName,
        candidateUsername: params.candidateUsername,
        companyName: params.companyName,
        groupName: params.groupName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        submittedAtFormatted: formatCandidateDateTime(params.submittedAt),
        statusLabel: params.statusLabel,
        attemptUrl,
      })
    );
    await queueAndSendEmail({
      eventType: "EXAM_SUBMITTED_ADMIN",
      idempotencyKey: `exam-submitted-admin/${params.attemptId}/${params.recipientEmail}`,
      recipientEmail: params.recipientEmail,
      userId: params.recipientUserId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderNotifications(),
      rendered: { subject: examSubmittedAdminSubject(params.candidateName), html, text, templateId: EXAM_SUBMITTED_ADMIN_ID, templateVersion: EXAM_SUBMITTED_ADMIN_V },
      metadata: { attemptId: params.attemptId },
    });
  });
}

// ---------------------------------------------------------------------
// RESULT_AVAILABLE — respecte la politique NO_EMAIL / RESULT_AVAILABLE_ONLY
// (défaut) / RESULT_WITH_SCORE (§24).
// ---------------------------------------------------------------------
export async function notifyResultAvailable(params: {
  userId: number;
  email: string;
  firstName: string;
  attemptId: number;
  examName: string;
  functionLabel: string;
  companyId: number;
  companyName: string;
  policy: ResultEmailPolicy;
  passed: boolean;
  score100: number;
  percentage: number;
  passThresholdPct: number;
}): Promise<void> {
  return safe("RESULT_AVAILABLE", async () => {
    if (params.policy === "NO_EMAIL") return;
    if (!shouldSendToUser("RESULT_AVAILABLE", params.userId)) return;

    const resultUrl = `${getAppBaseUrl()}/mes-resultats`;
    const withScore = params.policy === "RESULT_WITH_SCORE";
    const { html, text } = await renderBoth(
      createElement(ResultAvailableEmail, {
        firstName: params.firstName,
        examName: params.examName,
        functionLabel: params.functionLabel,
        resultUrl,
        withScore,
        ...(withScore ? { passed: params.passed, score100: params.score100, percentage: params.percentage, passThresholdPct: params.passThresholdPct } : {}),
      })
    );
    await queueAndSendEmail({
      eventType: "RESULT_AVAILABLE",
      idempotencyKey: `result-available/${params.attemptId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: { companyId: params.companyId, companyName: params.companyName },
      sender: getSenderExam(),
      rendered: { subject: resultAvailableSubject(), html, text, templateId: RESULT_AVAILABLE_ID, templateVersion: RESULT_AVAILABLE_V },
    });
  });
}

// ---------------------------------------------------------------------
// INCIDENT_DECLARED / INCIDENT_RESOLVED — jamais le détail (§29).
// ---------------------------------------------------------------------
export async function notifyIncidentDeclared(params: { userId: number; email: string; firstName: string; incidentId: number; tenant?: EmailTenantContext }): Promise<void> {
  return safe("INCIDENT_DECLARED", async () => {
    const { html, text } = await renderBoth(createElement(IncidentDeclaredEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "INCIDENT_DECLARED",
      idempotencyKey: `incident-declared/${params.incidentId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: incidentDeclaredSubject(), html, text, templateId: INCIDENT_DECLARED_ID, templateVersion: INCIDENT_DECLARED_V },
    });
  });
}

export async function notifyIncidentResolved(params: { userId: number; email: string; firstName: string; incidentId: number; tenant?: EmailTenantContext }): Promise<void> {
  return safe("INCIDENT_RESOLVED", async () => {
    const { html, text } = await renderBoth(createElement(IncidentResolvedEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "INCIDENT_RESOLVED",
      idempotencyKey: `incident-resolved/${params.incidentId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: incidentResolvedSubject(), html, text, templateId: INCIDENT_RESOLVED_ID, templateVersion: INCIDENT_RESOLVED_V },
    });
  });
}

// ---------------------------------------------------------------------
// MAINTENANCE_STARTED / MAINTENANCE_COMPLETED — diffusion plateforme,
// destinataires résolus par l'appelant (cron/action admin), jamais par ce
// module (§30 : jamais de destinataire inventé ici).
// ---------------------------------------------------------------------
export async function notifyMaintenanceStarted(params: { userId: number; email: string; firstName: string; maintenanceEventId: string }): Promise<void> {
  return safe("MAINTENANCE_STARTED", async () => {
    const { html, text } = await renderBoth(createElement(MaintenanceStartedEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "MAINTENANCE_STARTED",
      idempotencyKey: `maintenance-started/${params.maintenanceEventId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: maintenanceStartedSubject(), html, text, templateId: MAINTENANCE_STARTED_TEMPLATE_ID, templateVersion: MAINTENANCE_V },
    });
  });
}

export async function notifyMaintenanceCompleted(params: { userId: number; email: string; firstName: string; maintenanceEventId: string }): Promise<void> {
  return safe("MAINTENANCE_COMPLETED", async () => {
    const { html, text } = await renderBoth(createElement(MaintenanceCompletedEmail, { firstName: params.firstName }));
    await queueAndSendEmail({
      eventType: "MAINTENANCE_COMPLETED",
      idempotencyKey: `maintenance-completed/${params.maintenanceEventId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: maintenanceCompletedSubject(), html, text, templateId: MAINTENANCE_COMPLETED_TEMPLATE_ID, templateVersion: MAINTENANCE_V },
    });
  });
}

// ---------------------------------------------------------------------
// FAMILIARIZATION_INVITATION
// ---------------------------------------------------------------------
export async function notifyFamiliarizationInvitation(params: {
  userId: number;
  email: string;
  firstName: string;
  sessionId: number;
  functionLabel: string;
  heldAt: string;
  location: string | null;
  tenant?: EmailTenantContext;
}): Promise<void> {
  return safe("FAMILIARIZATION_INVITATION", async () => {
    if (!shouldSendToUser("FAMILIARIZATION_INVITATION", params.userId)) return;
    const { html, text } = await renderBoth(
      createElement(FamiliarizationInvitationEmail, {
        firstName: params.firstName,
        functionLabel: params.functionLabel,
        heldAtFormatted: formatCandidateDateTime(params.heldAt),
        location: params.location,
      })
    );
    await queueAndSendEmail({
      eventType: "FAMILIARIZATION_INVITATION",
      idempotencyKey: `familiarization-invitation/${params.sessionId}/${params.userId}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: familiarizationInvitationSubject(), html, text, templateId: FAMILIARIZATION_ID, templateVersion: FAMILIARIZATION_V },
    });
  });
}

// ---------------------------------------------------------------------
// USERNAME_CHANGED (mission "COMPLETE USER MANAGEMENT", 2026-08-29, §21)
// ---------------------------------------------------------------------
export async function notifyUsernameChanged(params: { userId: number; email: string; firstName: string; newUsername: string; changedAt: string; tenant?: EmailTenantContext }): Promise<void> {
  return safe("USERNAME_CHANGED", async () => {
    const loginUrl = `${getAppBaseUrl()}/login`;
    const { html, text } = await renderBoth(createElement(UsernameChangedEmail, { firstName: params.firstName, newUsername: params.newUsername, loginUrl }));
    await queueAndSendEmail({
      eventType: "USERNAME_CHANGED",
      idempotencyKey: `username-changed/${params.userId}/${params.changedAt}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderSecurity(),
      rendered: { subject: usernameChangedSubject(), html, text, templateId: USERNAME_CHANGED_ID, templateVersion: USERNAME_CHANGED_V },
    });
  });
}

// ---------------------------------------------------------------------
// ADMIN_MESSAGE (mission "COMPLETE USER MANAGEMENT", 2026-08-29, §36-40) —
// communication libre admin → candidat, réutilisant intégralement l'outbox
// existant. Le destinataire est déjà résolu et verrouillé par l'appelant
// (app/(app)/users/actions.ts::sendMessageAction — jamais un email
// arbitraire saisi ici ou dans ce module).
// ---------------------------------------------------------------------
export async function notifyAdminMessage(params: {
  userId: number;
  email: string;
  firstName: string;
  senderName: string;
  messageTypeLabel: string;
  subject: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sentAt: string;
  tenant?: EmailTenantContext;
}): Promise<void> {
  return safe("ADMIN_MESSAGE", async () => {
    const { html, text } = await renderBoth(
      createElement(AdminMessageEmail, {
        firstName: params.firstName,
        senderName: params.senderName,
        messageTypeLabel: params.messageTypeLabel,
        subject: params.subject,
        bodyText: params.bodyText,
        ctaLabel: params.ctaLabel,
        ctaUrl: params.ctaUrl,
      })
    );
    // Idempotence horodatée (§ mêmes règles que MFA_ENABLED/ACCOUNT_SUSPENDED
    // — chaque message admin est un événement distinct par nature, jamais à
    // dédupliquer contre un précédent message même de même sujet).
    await queueAndSendEmail({
      eventType: "ADMIN_MESSAGE",
      idempotencyKey: `admin-message/${params.userId}/${params.sentAt}`,
      recipientEmail: params.email,
      userId: params.userId,
      tenant: params.tenant ?? NO_TENANT,
      sender: getSenderNotifications(),
      rendered: { subject: adminMessageSubject(params.subject), html, text, templateId: ADMIN_MESSAGE_ID, templateVersion: ADMIN_MESSAGE_V },
    });
  });
}
