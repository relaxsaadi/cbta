// Registre des scénarios pour /admin/email-preview (mission email §43-44)
// — DONNÉES 100% SYNTHÉTIQUES, jamais une ligne réelle de notification_log
// ni un vrai destinataire. Ce module ne fait JAMAIS appel à
// queueAndSendEmail/getResendClient — un import de ce fichier ne peut
// structurellement déclencher aucun envoi réel.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
import { createElement, type ReactElement } from "react";

import AccountCreatedEmail, { accountCreatedSubject } from "./templates/account-created";
import AccountActivatedEmail, { accountActivatedSubject } from "./templates/account-activated";
import AccountReactivatedEmail, { accountReactivatedSubject } from "./templates/account-reactivated";
import AccountSuspendedEmail, { accountSuspendedSubject } from "./templates/account-suspended";
import PasswordResetRequestedEmail, { passwordResetRequestedSubject } from "./templates/password-reset-requested";
import PasswordChangedEmail, { passwordChangedSubject } from "./templates/password-changed";
import MfaEnabledEmail, { mfaEnabledSubject } from "./templates/mfa-enabled";
import MfaDisabledEmail, { mfaDisabledSubject } from "./templates/mfa-disabled";
import ExamAssignedEmail, { examAssignedSubject } from "./templates/exam-assigned";
import ExamRescheduledEmail, { examRescheduledSubject } from "./templates/exam-rescheduled";
import ResultAvailableEmail, { resultAvailableSubject } from "./templates/result-available";
import FamiliarizationInvitationEmail, { familiarizationInvitationSubject } from "./templates/familiarization-invitation";
import IncidentDeclaredEmail, { incidentDeclaredSubject } from "./templates/incident-declared";
import IncidentResolvedEmail, { incidentResolvedSubject } from "./templates/incident-resolved";
import { MaintenanceStartedEmail, MaintenanceCompletedEmail, maintenanceStartedSubject, maintenanceCompletedSubject } from "./templates/maintenance";

export interface PreviewScenario {
  key: string;
  label: string;
  category: string;
  subject: string;
  node: ReactElement;
}

// Valeurs synthétiques fixes et clairement fictives (prénom "Amel Test",
// entreprise "Client Démo SARL"…) — jamais le nom d'un client/candidat
// réel, jamais une adresse réelle, jamais un vrai jeton/URL signée.
const F = {
  firstName: "Amel",
  companyName: "Client Démo SARL",
  groupName: "Session Démo — Octobre 2026",
  examName: "DGR — Fonction 7.1 (Expédition)",
  functionLabel: "7.1 — Expédition de marchandises dangereuses",
  loginUrl: "https://staging.kostacademy.com/login",
  examUrl: "https://staging.kostacademy.com/mes-examens",
  resultUrl: "https://staging.kostacademy.com/mes-resultats",
  activationUrl: "https://staging.kostacademy.com/activer?token=exemple-synthetique",
  resetUrl: "https://staging.kostacademy.com/mot-de-passe/reinitialiser?token=exemple-synthetique",
  expiresAtFormatted: "30/08/2026 à 14:00",
  changedAtFormatted: "29/08/2026 à 09:12",
  heldAtFormatted: "05/09/2026 à 09:00",
};

export function buildPreviewScenarios(): PreviewScenario[] {
  return [
    {
      key: "account-created",
      label: "Compte créé — invitation",
      category: "Cycle de vie du compte",
      subject: accountCreatedSubject(),
      node: createElement(AccountCreatedEmail, {
        firstName: F.firstName,
        companyName: F.companyName,
        groupName: F.groupName,
        usernameOrEmail: "amel.demo@exemple.test",
        activationUrl: F.activationUrl,
        expiresAtFormatted: F.expiresAtFormatted,
      }),
    },
    {
      key: "account-activated",
      label: "Compte activé",
      category: "Cycle de vie du compte",
      subject: accountActivatedSubject(),
      node: createElement(AccountActivatedEmail, { firstName: F.firstName, loginUrl: F.loginUrl }),
    },
    {
      key: "account-suspended",
      label: "Compte suspendu",
      category: "Cycle de vie du compte",
      subject: accountSuspendedSubject(),
      node: createElement(AccountSuspendedEmail, { firstName: F.firstName }),
    },
    {
      key: "account-reactivated",
      label: "Compte réactivé",
      category: "Cycle de vie du compte",
      subject: accountReactivatedSubject(),
      node: createElement(AccountReactivatedEmail, { firstName: F.firstName, loginUrl: F.loginUrl }),
    },
    {
      key: "password-reset-requested",
      label: "Réinitialisation de mot de passe demandée",
      category: "Sécurité",
      subject: passwordResetRequestedSubject(),
      node: createElement(PasswordResetRequestedEmail, { firstName: F.firstName, resetUrl: F.resetUrl, expiresAtFormatted: F.expiresAtFormatted }),
    },
    {
      key: "password-changed",
      label: "Mot de passe modifié",
      category: "Sécurité",
      subject: passwordChangedSubject(),
      node: createElement(PasswordChangedEmail, { firstName: F.firstName, changedAtFormatted: F.changedAtFormatted }),
    },
    {
      key: "mfa-enabled",
      label: "MFA activée",
      category: "Sécurité",
      subject: mfaEnabledSubject(),
      node: createElement(MfaEnabledEmail, { firstName: F.firstName }),
    },
    {
      key: "mfa-disabled",
      label: "MFA désactivée (par le candidat)",
      category: "Sécurité",
      subject: mfaDisabledSubject(),
      node: createElement(MfaDisabledEmail, { firstName: F.firstName, byAdmin: false }),
    },
    {
      key: "mfa-disabled-admin",
      label: "MFA réinitialisée (par un administrateur)",
      category: "Sécurité",
      subject: mfaDisabledSubject(),
      node: createElement(MfaDisabledEmail, { firstName: F.firstName, byAdmin: true }),
    },
    {
      key: "exam-assigned",
      label: "Examen affecté",
      category: "Cycle de vie de l'examen",
      subject: examAssignedSubject(),
      node: createElement(ExamAssignedEmail, {
        firstName: F.firstName,
        examName: F.examName,
        functionLabel: F.functionLabel,
        companyName: F.companyName,
        groupName: F.groupName,
        openAtFormatted: "01/09/2026 à 08:00",
        closeAtFormatted: "15/09/2026 à 18:00",
        durationMinutes: 90,
        attemptsAllowed: 2,
        examUrl: F.examUrl,
      }),
    },
    {
      key: "exam-rescheduled",
      label: "Examen reprogrammé",
      category: "Cycle de vie de l'examen",
      subject: examRescheduledSubject(),
      node: createElement(ExamRescheduledEmail, {
        firstName: F.firstName,
        examName: F.examName,
        functionLabel: F.functionLabel,
        oldOpenAtFormatted: "01/09/2026 à 08:00",
        oldCloseAtFormatted: "15/09/2026 à 18:00",
        newOpenAtFormatted: "08/09/2026 à 08:00",
        newCloseAtFormatted: "22/09/2026 à 18:00",
        examUrl: F.examUrl,
      }),
    },
    {
      key: "result-available-only",
      label: "Résultat disponible (sans score — politique par défaut)",
      category: "Résultats",
      subject: resultAvailableSubject(),
      node: createElement(ResultAvailableEmail, { firstName: F.firstName, examName: F.examName, functionLabel: F.functionLabel, resultUrl: F.resultUrl, withScore: false }),
    },
    {
      key: "result-available-with-score-pass",
      label: "Résultat disponible avec score — réussite",
      category: "Résultats",
      subject: resultAvailableSubject(),
      node: createElement(ResultAvailableEmail, {
        firstName: F.firstName,
        examName: F.examName,
        functionLabel: F.functionLabel,
        resultUrl: F.resultUrl,
        withScore: true,
        passed: true,
        score100: 88,
        percentage: 88,
        passThresholdPct: 80,
      }),
    },
    {
      key: "result-available-with-score-fail",
      label: "Résultat disponible avec score — échec",
      category: "Résultats",
      subject: resultAvailableSubject(),
      node: createElement(ResultAvailableEmail, {
        firstName: F.firstName,
        examName: F.examName,
        functionLabel: F.functionLabel,
        resultUrl: F.resultUrl,
        withScore: true,
        passed: false,
        score100: 62,
        percentage: 62,
        passThresholdPct: 80,
      }),
    },
    {
      key: "familiarization-invitation",
      label: "Invitation à une session de familiarisation",
      category: "Familiarisation",
      subject: familiarizationInvitationSubject(),
      node: createElement(FamiliarizationInvitationEmail, { firstName: F.firstName, functionLabel: F.functionLabel, heldAtFormatted: F.heldAtFormatted, location: "Alger — Centre KOST Academy" }),
    },
    {
      key: "incident-declared",
      label: "Incident déclaré (compte concerné notifié)",
      category: "Incidents",
      subject: incidentDeclaredSubject(),
      node: createElement(IncidentDeclaredEmail, { firstName: F.firstName }),
    },
    {
      key: "incident-resolved",
      label: "Incident résolu",
      category: "Incidents",
      subject: incidentResolvedSubject(),
      node: createElement(IncidentResolvedEmail, { firstName: F.firstName }),
    },
    {
      key: "maintenance-started",
      label: "Maintenance démarrée (gabarit prêt, non câblé — voir doc)",
      category: "Plateforme",
      subject: maintenanceStartedSubject(),
      node: createElement(MaintenanceStartedEmail, { firstName: F.firstName }),
    },
    {
      key: "maintenance-completed",
      label: "Maintenance terminée (gabarit prêt, non câblé — voir doc)",
      category: "Plateforme",
      subject: maintenanceCompletedSubject(),
      node: createElement(MaintenanceCompletedEmail, { firstName: F.firstName }),
    },
  ];
}
