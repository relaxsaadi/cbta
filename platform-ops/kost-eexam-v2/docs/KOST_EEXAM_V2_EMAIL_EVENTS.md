# KOST E-EXAM V2 — Catalogue des événements email

**Date de cette actualisation :** 2026-08-30 (mission "MISSION DE FERMETURE — CLEAR REMAINING P2 BEFORE AUDITOR DEMO") — voir `KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md` pour le modèle d'ensemble.

> **Ce document était périmé et incomplet.** La version précédente (2026-08-29) omettait entièrement `USERNAME_CHANGED`, `ADMIN_MESSAGE`, `EXAM_SUBMITTED`, `EXAM_SUBMITTED_ADMIN` (pourtant WIRED) de ses tableaux, annonçait 32 types déclarés (36 réels) et classait `EXAM_RESCHEDULED` en « gabarit seul, aucune fonction » alors qu'il est WIRED depuis le même jour (commit `c689d44`). Comptage ci-dessous refait directement depuis le code (`EMAIL_EVENT_TYPES` dans `lib/email/types.ts` exécuté via `node --import tsx`, puis `grep` de chaque fonction `notify*()` sur tout le dépôt hors son propre fichier de définition) — jamais recopié de l'ancienne version.

Légende :
- **WIRED** — gabarit + fonction `notify*()` + déclenché par un vrai flux applicatif (Server Action, route API, ou cron). Réellement observable en conditions réelles.
- **TEMPLATE_ONLY (fonction prête)** — gabarit + fonction `notify*()` existent, jamais appelés automatiquement.
- **TEMPLATE_ONLY (gabarit seul)** — gabarit React Email existe, aucune fonction `notify*()`. **Catégorie actuellement vide** (0 événement) — voir note ci-dessous.
- **MISSING** — ni gabarit ni fonction. Le type est déclaré dans `EmailEventType` par anticipation de la spec, rien de plus.

**36 types déclarés au total** (`EMAIL_EVENT_TYPES.length` compté directement, 2026-08-30).

## Compte / activation / mot de passe (MANDATORY — jamais désactivable)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `ACCOUNT_CREATED` | **WIRED** | `groups/actions.ts::inviteNewCandidate`, `users/actions.ts` (staff) | EMAIL_FROM_EXAM | `templates/account-created.tsx` |
| `ACCOUNT_ACTIVATED` | **WIRED** | `app/activer/actions.ts` | EMAIL_FROM_EXAM | `templates/account-activated.tsx` |
| `PASSWORD_RESET_REQUESTED` | **WIRED** | `app/mot-de-passe/oublie/actions.ts`, renvoi admin via `lib/email/resend-actions.ts` | EMAIL_FROM_SECURITY | `templates/password-reset-requested.tsx` |
| `PASSWORD_CHANGED` | **WIRED** | `app/mot-de-passe/reinitialiser/actions.ts` | EMAIL_FROM_SECURITY | `templates/password-changed.tsx` |

## MFA (MANDATORY — administrateur/responsable pédagogique uniquement, voir §H de l'architecture)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `MFA_ENABLED` | **WIRED** | `app/(app)/mon-compte/actions.ts` (auto-inscription) | EMAIL_FROM_SECURITY | `templates/mfa-enabled.tsx` |
| `MFA_DISABLED` | **WIRED** | `mon-compte/actions.ts` (`byAdmin: false`, auto-désactivation, mot de passe re-confirmé) | EMAIL_FROM_SECURITY | `templates/mfa-disabled.tsx` |
| `MFA_RESET_BY_ADMIN` | **WIRED** | `app/(app)/users/actions.ts::adminResetMfaAction` (`byAdmin: true`, administrateur uniquement, même fonction/gabarit que ci-dessus). Couverture E2E ajoutée 2026-08-30, `tests/e2e/scenario-o-mfa-reset.spec.ts`. | EMAIL_FROM_SECURITY | `templates/mfa-disabled.tsx` |

## Statut de compte (MANDATORY)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `ACCOUNT_SUSPENDED` | **WIRED** | `users/actions.ts::quickSuspendAction`, `incidents/actions.ts` (action liée à un incident) | EMAIL_FROM_SECURITY | `templates/account-suspended.tsx` |
| `ACCOUNT_REACTIVATED` | **WIRED** | `users/actions.ts::quickReactivateAction`, `incidents/actions.ts` | EMAIL_FROM_SECURITY | `templates/account-reactivated.tsx` |

## Identifiant / communication admin

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `USERNAME_CHANGED` | **WIRED** | `app/(app)/users/actions.ts` (changement d'identifiant de connexion) | EMAIL_FROM_SECURITY | `templates/username-changed.tsx` |
| `ADMIN_MESSAGE` | **WIRED** | `app/(app)/users/actions.ts` (« Envoyer un message » depuis la fiche candidat) | EMAIL_FROM_NOTIFICATIONS | `templates/admin-message.tsx` |

## Affectation groupe/fonction

| Événement | Statut | Note |
|---|---|---|
| `CANDIDATE_ADDED_TO_GROUP` | **MISSING** | Chevauche fonctionnellement `ACCOUNT_CREATED` (un candidat ajouté à un groupe reçoit déjà une invitation). |
| `FUNCTION_ASSIGNED` | **MISSING** | L'information de fonction est déjà incluse dans `EXAM_ASSIGNED`. |

## Examen (MANDATORY sauf les 3 rappels, explicitement OPTIONAL)

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `EXAM_ASSIGNED` | **WIRED** | `exam-preparation/actions.ts` (publication/affectation), renvoi manuel via `lib/email/resend-actions.ts::resendExamNotification` | EMAIL_FROM_EXAM | `templates/exam-assigned.tsx` |
| `EXAM_OPENS_SOON` | **WIRED** | `lib/email/reminders.ts::dispatchExamOpensSoonReminders()`, `POST /api/notifications/reminders` (cron) | EMAIL_FROM_EXAM | `templates/exam-opens-soon.tsx` |
| `EXAM_NOW_AVAILABLE` | **WIRED** | `dispatchExamNowAvailableReminders()`, même route cron | EMAIL_FROM_EXAM | `templates/exam-now-available.tsx` |
| `EXAM_DEADLINE_REMINDER` | **WIRED** | `dispatchExamDeadlineReminders()`, même route cron — exclut les candidats ayant déjà une tentative | EMAIL_FROM_EXAM | `templates/exam-deadline-reminder.tsx` |
| `EXAM_RESCHEDULED` | **WIRED** (corrigé — classé à tort « gabarit seul » dans la version précédente de ce document) | `lib/assessments.ts::rescheduleAssessment()`, appelé depuis `exam-preparation/actions.ts` | EMAIL_FROM_EXAM | `templates/exam-rescheduled.tsx` |
| `EXAM_CANCELLED` | **MISSING** | — |
| `EXAM_SUSPENDED` | **MISSING** | Une action de suspension d'examen existe côté incidents (`lib/incidents.ts`) mais ne notifie personne. |
| `EXAM_RESUMED` | **MISSING** | Idem (réouverture). |
| `ATTEMPT_REOPENED_BY_STAFF` | **MISSING** | — |

## Soumission

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `EXAM_SUBMITTED` | **WIRED** | `lib/email/notify-submission.ts`, appelé depuis `exam/[assessmentId]/attempt/actions.ts::submitAttemptAction` | EMAIL_FROM_EXAM | `templates/exam-submitted.tsx` |
| `EXAM_SUBMITTED_ADMIN` | **WIRED** | Même point d'entrée — avertit le(s) responsable(s)/administrateur(s) du périmètre, jamais les réponses du candidat (voir le gabarit lui-même) | EMAIL_FROM_NOTIFICATIONS | `templates/exam-submitted-admin.tsx` |

## Résultats / rapports

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `RESULT_AVAILABLE` | **WIRED** | `exam/[assessmentId]/attempt/actions.ts` (soumission), `api/attempts/sweep/route.ts` (auto-soumission), `grading/actions.ts` (finalisation manuelle) — respecte la politique NO_EMAIL/RESULT_AVAILABLE_ONLY (défaut)/RESULT_WITH_SCORE | EMAIL_FROM_EXAM | `templates/result-available.tsx` |
| `REPORT_AVAILABLE` | **MISSING** | Les rapports PDF existent (`/api/reports/*`) mais aucune notification de disponibilité. |

## Familiarisation

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `FAMILIARIZATION_INVITATION` | **WIRED** | `app/(app)/familiarisation/actions.ts` | EMAIL_FROM_NOTIFICATIONS | `templates/familiarization-invitation.tsx` |
| `FAMILIARIZATION_REMINDER` | **MISSING** | — |

## Responsable pédagogique (opérationnel)

| Événement | Statut |
|---|---|
| `GROUP_CREATED` | **MISSING** |
| `EXAM_PUBLISHED` | **MISSING** — redondant avec `EXAM_ASSIGNED` côté candidat. |

## Incidents / maintenance

| Événement | Statut | Déclencheur réel | Expéditeur | Gabarit |
|---|---|---|---|---|
| `INCIDENT_DECLARED` | **WIRED** | `incidents/actions.ts::declareIncidentAction` — uniquement si un « Compte à notifier » est renseigné | EMAIL_FROM_NOTIFICATIONS | `templates/incident-declared.tsx` |
| `INCIDENT_RESOLVED` | **WIRED** | `incidents/actions.ts::setIncidentStatusAction`, uniquement sur transition vers `resolved` | EMAIL_FROM_NOTIFICATIONS | `templates/incident-resolved.tsx` |
| `MAINTENANCE_STARTED` | **TEMPLATE_ONLY (fonction prête)** | `notifyMaintenanceStarted()` existe (testable manuellement) mais **zéro appelant dans tout le dépôt** hors sa propre définition — jamais câblée à `actionEnableMaintenanceMode` : décision produit non tranchée (notifier tous les utilisateurs ? seulement une tentative en cours ?). | EMAIL_FROM_NOTIFICATIONS | `templates/maintenance.tsx` |
| `MAINTENANCE_COMPLETED` | **TEMPLATE_ONLY (fonction prête)** | Même situation, zéro appelant confirmé. | EMAIL_FROM_NOTIFICATIONS | `templates/maintenance.tsx` |

## Opérations plateforme (admin uniquement)

| Événement | Statut |
|---|---|
| `HEALTHCHECK_FAILED` | **MISSING** — `/api/health` existe et rapporte un statut, mais n'envoie aucune alerte email (`adminAlertRecipientConfigured: false` sur staging, confirmé). |
| `BACKUP_FAILED` | **MISSING** — même raison. |

---

## Résumé chiffré (recompté depuis le code, 2026-08-30)

| Statut | Nombre |
|---|---|
| WIRED | **22** |
| TEMPLATE_ONLY (fonction prête, jamais appelée) | 2 |
| TEMPLATE_ONLY (gabarit seul, aucune fonction) | **0** (catégorie vide — corrigé depuis la version précédente) |
| MISSING (rien construit) | 12 |
| **Total déclaré** | **36** |

23 fonctions `notify*()` au total pour 22 types WIRED (`notifyMfaDisabled` sert 2 types) + 2 fonctions définies mais jamais appelées (`notifyMaintenanceStarted`/`notifyMaintenanceCompleted`) = 23. 22 gabarits React Email au total.
