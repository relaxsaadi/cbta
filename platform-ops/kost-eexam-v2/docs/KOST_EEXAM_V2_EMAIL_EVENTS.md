# KOST E-EXAM V2 — Catalogue des événements email

**Date :** 2026-08-29 — voir `KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md` pour le modèle d'ensemble.

Légende :
- **WIRED** — gabarit + fonction `notify*()` + déclenché par un vrai flux applicatif (Server Action, route API, ou cron). Réellement observable en conditions réelles.
- **TEMPLATE_ONLY (fonction prête)** — gabarit + fonction `notify*()` existent, jamais appelés automatiquement. Peut être déclenché manuellement (script/console) mais aucun code de production ne le fait aujourd'hui.
- **TEMPLATE_ONLY (gabarit seul)** — gabarit React Email existe, aucune fonction `notify*()` — impossible à déclencher sans écrire du code.
- **MISSING** — ni gabarit ni fonction. Le type est déclaré dans `EmailEventType` (`lib/email/types.ts`) par anticipation de la spec, rien de plus.

32 types déclarés au total.

## Compte / activation / mot de passe (MANDATORY — jamais désactivable)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `ACCOUNT_CREATED` | **WIRED** | `createGroupAction`→`inviteNewCandidate` (groupes), `createUserAction` (staff) | EMAIL_FROM_EXAM | `templates/account-created.tsx` |
| `ACCOUNT_ACTIVATED` | **WIRED** | `app/activer/actions.ts::activateAccountAction` | EMAIL_FROM_EXAM | `templates/account-activated.tsx` |
| `PASSWORD_RESET_REQUESTED` | **WIRED** | `app/mot-de-passe/oublie/actions.ts` | EMAIL_FROM_SECURITY | `templates/password-reset-requested.tsx` |
| `PASSWORD_CHANGED` | **WIRED** | `app/mot-de-passe/reinitialiser/actions.ts` | EMAIL_FROM_SECURITY | `templates/password-changed.tsx` |

## MFA (MANDATORY)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `MFA_ENABLED` | **WIRED** | `app/(app)/mon-compte/actions.ts` (auto-inscription) | EMAIL_FROM_SECURITY | `templates/mfa-enabled.tsx` |
| `MFA_DISABLED` | **WIRED** | `mon-compte/actions.ts` (`byAdmin: false`) | EMAIL_FROM_SECURITY | `templates/mfa-disabled.tsx` |
| `MFA_RESET_BY_ADMIN` | **WIRED** | `app/(app)/users/actions.ts::adminResetMfaAction` (`byAdmin: true`, même fonction/gabarit que ci-dessus) | EMAIL_FROM_SECURITY | `templates/mfa-disabled.tsx` |

## Statut de compte (MANDATORY)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `ACCOUNT_SUSPENDED` | **WIRED** | `users/actions.ts::quickSuspendAction`, `incidents/actions.ts::suspendAccountAction` | EMAIL_FROM_SECURITY | `templates/account-suspended.tsx` |
| `ACCOUNT_REACTIVATED` | **WIRED** | `users/actions.ts::quickReactivateAction`, `incidents/actions.ts::reactivateAccountAction` | EMAIL_FROM_SECURITY | `templates/account-reactivated.tsx` |

## Affectation groupe/fonction

| Événement | Statut | Note |
|---|---|---|
| `CANDIDATE_ADDED_TO_GROUP` | **MISSING** | Chevauche fonctionnellement `ACCOUNT_CREATED` (un candidat ajouté à un groupe reçoit déjà une invitation) — jamais implémenté séparément, non jugé prioritaire. |
| `FUNCTION_ASSIGNED` | **MISSING** | Idem — l'information de fonction est déjà incluse dans `EXAM_ASSIGNED`. |

## Examen (MANDATORY sauf les 3 rappels, explicitement OPTIONAL)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `EXAM_ASSIGNED` | **WIRED** | `exam-preparation/actions.ts::publishAssessmentAction`, `assignMoreCandidatesAction` ; renvoi manuel via `lib/email/resend-actions.ts::resendExamNotification` | EMAIL_FROM_EXAM | `templates/exam-assigned.tsx` |
| `EXAM_OPENS_SOON` | **WIRED** (construit cette mission) | `lib/email/reminders.ts::dispatchExamOpensSoonReminders()`, appelée par `POST /api/notifications/reminders` (cron) | EMAIL_FROM_EXAM | `templates/exam-opens-soon.tsx` |
| `EXAM_NOW_AVAILABLE` | **WIRED** (construit cette mission) | `dispatchExamNowAvailableReminders()`, même route cron | EMAIL_FROM_EXAM | `templates/exam-now-available.tsx` |
| `EXAM_DEADLINE_REMINDER` | **WIRED** (construit cette mission) | `dispatchExamDeadlineReminders()`, même route cron — exclut les candidats ayant déjà une tentative | EMAIL_FROM_EXAM | `templates/exam-deadline-reminder.tsx` |
| `EXAM_RESCHEDULED` | **TEMPLATE_ONLY (gabarit seul)** | Aucune fonction `notify*()` — aucun flux produit « reprogrammer un examen » n'existe encore côté `lib/assessments.ts` | — | `templates/exam-rescheduled.tsx` |
| `EXAM_CANCELLED` | **MISSING** | — | — | — |
| `EXAM_SUSPENDED` | **MISSING** | Une action `actionSuspendExam` existe côté incidents (`lib/incidents.ts`) mais ne notifie personne — jugé hors périmètre cette mission. | — | — |
| `EXAM_RESUMED` | **MISSING** | Idem (`actionReopenExam`). | — | — |
| `ATTEMPT_REOPENED_BY_STAFF` | **MISSING** | — | — | — |

## Résultats / rapports

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `RESULT_AVAILABLE` | **WIRED** | `exam/[assessmentId]/attempt/actions.ts::submitAttemptAction`, `api/attempts/sweep/route.ts` (auto-soumission) — respecte la politique NO_EMAIL/RESULT_AVAILABLE_ONLY (défaut)/RESULT_WITH_SCORE | EMAIL_FROM_EXAM | `templates/result-available.tsx` |
| `REPORT_AVAILABLE` | **MISSING** | Les rapports PDF existent (`/api/reports/*`) mais aucune notification de disponibilité. | — | — |

## Familiarisation

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `FAMILIARIZATION_INVITATION` | **WIRED** | `app/(app)/familiarisation/actions.ts::createFamiliarizationSessionAction` | EMAIL_FROM_NOTIFICATIONS | `templates/familiarization-invitation.tsx` |
| `FAMILIARIZATION_REMINDER` | **MISSING** | — | — | — |

## Responsable pédagogique (opérationnel)

| Événement | Statut |
|---|---|
| `GROUP_CREATED` | **MISSING** |
| `EXAM_PUBLISHED` | **MISSING** — redondant avec `EXAM_ASSIGNED` côté candidat ; une confirmation côté responsable n'a pas été jugée prioritaire. |

## Incidents / maintenance

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `INCIDENT_DECLARED` | **WIRED** | `incidents/actions.ts::declareIncidentAction` — uniquement si un `responsibleUserId` est renseigné (menu ajouté cette mission dans `DeclareIncidentForm.tsx`) | EMAIL_FROM_NOTIFICATIONS | `templates/incident-declared.tsx` |
| `INCIDENT_RESOLVED` | **WIRED** | `incidents/actions.ts::setIncidentStatusAction`, uniquement sur transition vers `resolved` | EMAIL_FROM_NOTIFICATIONS | `templates/incident-resolved.tsx` |
| `MAINTENANCE_STARTED` | **TEMPLATE_ONLY (fonction prête)** | `notifyMaintenanceStarted()` existe et fonctionne (testable), jamais appelée par `actionEnableMaintenanceMode` — décision produit non tranchée : notifier tous les utilisateurs ? seulement ceux avec une tentative en cours ? | EMAIL_FROM_NOTIFICATIONS | `templates/maintenance.tsx` |
| `MAINTENANCE_COMPLETED` | **TEMPLATE_ONLY (fonction prête)** | Même situation, `actionDisableMaintenanceMode`. | EMAIL_FROM_NOTIFICATIONS | `templates/maintenance.tsx` |

## Opérations plateforme (admin uniquement)

| Événement | Statut |
|---|---|
| `HEALTHCHECK_FAILED` | **MISSING** — `/api/health` existe et rapporte un statut, mais n'envoie aucune alerte email ; aucun destinataire admin-alerte n'a été inventé (voir `ADMIN_ALERT_RECIPIENT`, jamais configuré). |
| `BACKUP_FAILED` | **MISSING** — même raison. |

---

## Résumé chiffré

| Statut | Nombre |
|---|---|
| WIRED | 17 |
| TEMPLATE_ONLY (fonction prête, jamais appelée) | 2 |
| TEMPLATE_ONLY (gabarit seul, aucune fonction) | 1 |
| MISSING (rien construit) | 12 |
| **Total déclaré** | **32** |
