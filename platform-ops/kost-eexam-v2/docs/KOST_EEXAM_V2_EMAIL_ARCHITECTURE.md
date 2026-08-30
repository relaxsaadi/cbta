# KOST E-EXAM V2 — Architecture email transactionnel (Resend)

**Date de cette actualisation :** 2026-08-30 (mission "MISSION DE FERMETURE — CLEAR REMAINING P2 BEFORE AUDITOR DEMO")
**Branche :** `feature/kost-eexam-v2-native`
**Environnement vérifié :** staging réel — https://staging.kostacademy.com
**Production :** NON déployée — cette mission ne touche jamais `exam.kostacademy.com` (V1/Moodle) ni la production réelle.

> **Ce document était périmé.** La version précédente (2026-08-29) décrivait `RESEND_API_KEY`/`RESEND_WEBHOOK_SECRET` comme MISSING, 17 événements WIRED, et `EXAM_RESCHEDULED` comme dépourvu de fonction `notify*()`. Ces trois affirmations sont FAUSSES depuis le commit `c689d44` (2026-08-29, même journée, test de livraison contrôlée réel). Ce qui suit est dérivé DIRECTEMENT du code source (`lib/email/types.ts`, `lib/email/events.ts`), jamais recopié de l'ancienne version — voir la méthode de comptage en note de bas de §F.

Rien ci-dessous n'implique une approbation ANAC/IATA ni une mise en production.

---

## A. Portée de la mission

Expérience email/notification uniquement. N'a jamais modifié : Moodle/V1, le contenu des questions, les statuts Tier A/`reviewer_status`, la banque de 244 questions, le DNS de production, `exam.kostacademy.com`, ni exécuté de bascule de production.

---

## B. Secrets — état réel (staging), jamais la valeur elle-même

| Secret | Statut sur staging | Vérifié via |
|---|---|---|
| `RESEND_API_KEY` | **Configuré** | `/api/health` → `email.resendApiKeyConfigured: true` (booléen de présence uniquement, jamais la valeur) |
| `RESEND_WEBHOOK_SECRET` | **Configuré** | `/api/health` → `email.resendWebhookSecretConfigured: true` |
| `EMAIL_REPLY_TO` | **Configuré** | Présence de la variable confirmée côté conteneur (`env \| grep`), jamais sa valeur imprimée |
| `EMAIL_MODE` | `allowlist` | `/api/health` → `email.emailMode` — voir §D pour la sémantique |

Aucun de ces secrets n'est jamais journalisé, exposé côté client (`NEXT_PUBLIC_*`), stocké en base, ni renvoyé par une route/action — seule leur PRÉSENCE (booléen) est exposée via `safeEmailConfigReport()` / `/api/health` (route publique, lecture seule).

## C. IMPLEMENTED — ce qui est réellement construit, testé, déployé

- Architecture centralisée `lib/email/` (client, config, send, types, events, preferences, audit, format, history, webhook, resend-actions, reminders, notify-result, result-policy, preview-registry, templates/).
- **23** fonctions `notify*()` typées (`lib/email/events.ts`), dont **21 réellement appelées par un flux applicatif réel** (2 définies mais jamais câblées — voir §D). `notifyMfaDisabled()` sert deux `EmailEventType` selon `byAdmin` (`MFA_DISABLED` / `MFA_RESET_BY_ADMIN`) — d'où **22 types d'événements WIRED** pour 21 fonctions.
- **22** gabarits React Email (`lib/email/templates/*.tsx`), rendu HTML + texte brut, composants partagés (`EmailShell`, `Title`, `Paragraph`, `InfoCard`, `CTAButton`, `SecurityNotice`, `ExpiryNote`), branding KOST Academy sobre, français.
- Flux d'activation par jeton sécurisé — **aucun mot de passe n'est jamais transmis par email**, ni en clair ni haché : `createUserPendingActivation()` génère un mot de passe interne inutilisable (32 octets aléatoires, immédiatement oublié), le candidat crée lui-même son mot de passe via `/activer?token=...`, jeton haché SHA-256 en base, 24h, usage unique. Même discipline pour la réinitialisation (2h).
- Outbox durable (`notification_log`) avec idempotence (`idempotency_key`, contrainte UNIQUE), statuts, retry borné, purge du corps rendu à l'état terminal.
- Webhook Resend natif (Svix HMAC-SHA256, `node:crypto`, sans dépendance `svix`), signature vérifiée avant toute confiance, statut mis à jour de façon **monotone sur TOUS les états terminaux** (voir §G.9 — étendu mission "fermeture" 2026-08-30, l'ancienne version ne protégeait que sent/delivered/delivery_delayed).
- Séparation MANDATORY/OPTIONAL des préférences (`lib/email/preferences.ts`).
- RBAC/isolation tenant appliqués aux actions email (voir §E).
- Admin UI : `/notifications` (historique filtrable + boutons Renvoyer, scope tenant) et `/admin/email-preview` (aperçu synthétique, ne peut structurellement jamais envoyer un email réel).
- `EMAIL_MODE` (log/allowlist/send) — sécurité de staging, jamais un envoi accidentel à une adresse réelle non approuvée.

## D. NOT WIRED — ce qui reste non construit

| Élément | Statut | Raison |
|---|---|---|
| `MAINTENANCE_STARTED` / `MAINTENANCE_COMPLETED` | Gabarit (`maintenance.tsx`) ET fonctions `notify*()` prêts, **jamais appelés** | `actionEnableMaintenanceMode`/`actionDisableMaintenanceMode` (`lib/incidents.ts`) ne les appellent pas — « qui notifier : tous les utilisateurs ? seulement les tentatives en cours ? » reste une décision produit non tranchée, jamais devinée. Vérifié : zéro appelant dans tout le dépôt hors `lib/email/events.ts` lui-même. |
| `CANDIDATE_ADDED_TO_GROUP`, `FUNCTION_ASSIGNED`, `EXAM_CANCELLED`, `EXAM_SUSPENDED`, `EXAM_RESUMED`, `ATTEMPT_REOPENED_BY_STAFF`, `REPORT_AVAILABLE`, `FAMILIARIZATION_REMINDER`, `GROUP_CREATED`, `EXAM_PUBLISHED`, `HEALTHCHECK_FAILED`, `BACKUP_FAILED` | **TEMPLATE_ONLY ou totalement absent** | Type déclaré dans `EmailEventType` mais ni gabarit ni fonction `notify*()` (voir la matrice complète et le détail par événement dans `KOST_EEXAM_V2_EMAIL_EVENTS.md`). |
| Notification history — filtre par date | Absent | Filtres implémentés : statut, type d'événement, recherche email. |
| Digest/rappels — fréquence cron réelle installée | Documentée, à vérifier sur le serveur | Voir `KOST_EEXAM_V2_RESEND_OPERATIONS.md` §7. |

## E. SECURITY MODEL

- **Secrets** — voir §B.
- **Mots de passe** — jamais envoyés par email (§C). `PASSWORD_RESET_REQUESTED`/`PASSWORD_CHANGED` : notifications de sécurité obligatoires, jamais désactivables.
- **Jetons** — aléatoires cryptographiques (32 octets), stockés hachés (SHA-256) uniquement, usage unique (`used_at`), expiration (24h activation / 2h réinitialisation).
- **Tenant isolation** — chaque `notify*()` reçoit un `EmailTenantContext` résolu par l'appelant ; `/notifications` filtre par `scopedUserIdsForSessionsOrNull()`.
- **RBAC** — `auditor` structurellement exclu de `requireWriteRole` (aucune action d'envoi/renvoi possible, y compris en forgeant une requête). Vérifié par l'audit transversal du 2026-08-30 (agent RBAC/sécurité indépendant, aucun contournement trouvé).
- **Vocabulaire candidat** — aucun terme développeur (tenant, RBAC, webhook, cron, Resend, Tier A, FROZEN, UUID, source_status) dans un gabarit candidat.
- **Vie privée** — aucun gabarit ne contient de question, réponse correcte, réponse détaillée d'un candidat, identité d'un autre candidat, référence DGR interne, preuve d'incident, mot de passe, jeton ou secret MFA — vérifié par relecture indépendante de chaque template lors de l'audit du 2026-08-30 (voir aussi le grep `kostgroupe@gmail.com` — zéro occurrence dans tout template candidat).
- **Support / Reply-To** — support **cbta@kostacademy.com** (jamais `kostgroupe@gmail.com`, l'adresse personnelle du propriétaire, qui n'apparaît nulle part dans le code/templates/docs) ; `Reply-To` posé depuis `EMAIL_REPLY_TO` quand configuré (§B), sans quoi aucun en-tête `Reply-To` n'est envoyé (jamais de valeur fabriquée).
- **Contenu dynamique** — chaque valeur interpolée (prénom, entreprise, groupe, titre d'examen) passe par le rendu React Email (échappement JSX natif) — jamais de HTML utilisateur injecté brut.

## F. EVENT MODEL

Catalogue complet, statut WIRED/TEMPLATE_ONLY par événement, dans `docs/KOST_EEXAM_V2_EMAIL_EVENTS.md`.

Résumé (compté directement depuis le code, 2026-08-30 — méthode : `EMAIL_EVENT_TYPES` dans `lib/email/types.ts` pour le catalogue total, `grep` de chaque fonction `notify*()` de `lib/email/events.ts` sur tout le dépôt hors son propre fichier de définition pour distinguer WIRED de défini-mais-jamais-appelé) :

- **36** types d'événements déclarés dans `EmailEventType` (compté directement via `EMAIL_EVENT_TYPES.length`, `node --import tsx`).
- **23** fonctions `notify*()` implémentées.
- **22** gabarits React Email construits.
- **22 types d'événements réellement WIRED** (21 fonctions, `notifyMfaDisabled` couvrant `MFA_DISABLED`+`MFA_RESET_BY_ADMIN`) — inclut désormais explicitement `EXAM_RESCHEDULED` (WIRED via `lib/assessments.ts::rescheduleAssessment()`) et `USERNAME_CHANGED`/`ADMIN_MESSAGE` (WIRED via `app/(app)/users/actions.ts`), absents de la version précédente de ce document.
- **2** événements (`MAINTENANCE_STARTED`/`COMPLETED`) ont gabarit + fonction prêts mais jamais appelés (voir §D).
- **12** événements restants n'ont ni gabarit ni fonction.

## G. DELIVERY MODEL

1. **Déclenchement** — un flux métier (Server Action, route API, script cron) appelle une fonction `notify*()` typée de `lib/email/events.ts`. Jamais d'appel direct au SDK Resend ailleurs.
2. **Filet non-throw** — chaque `notify*()` est enveloppée dans `safe()` : une erreur survenant AVANT l'écriture de l'outbox (config manquante, échec de rendu) est journalisée côté serveur et **ne remonte jamais** à l'appelant — voir `tests/unit/email-never-throws.test.ts`. Vérifié à nouveau lors de l'audit du 2026-08-30 pour les 4 flux critiques (création de compte, affectation d'examen, soumission, notation/résultat) : dans chacun, l'écriture métier (DB) précède ou est indépendante de l'appel `notify*()`.
3. **Préférences** — `shouldSendToUser()` vérifie MANDATORY (toujours) vs OPTIONAL (respecte la préférence candidat).
4. **Rendu** — React Email produit HTML + texte brut.
5. **Outbox** — `queueAndSendEmail()` écrit TOUJOURS une ligne `notification_log` (statut `QUEUED`) **avant** toute tentative réseau, avec idempotence par `idempotency_key` (contrainte UNIQUE — un doublon retourne l'état existant sans réécrire).
6. **Décision d'envoi** — `resolveDeliveryDecision()` : liste de suppression → `SUPPRESSED` ; `EMAIL_MODE=log` → `SUPPRESSED` (aucun envoi réel) ; `EMAIL_MODE=allowlist` → envoi réel uniquement si le destinataire est dans `EMAIL_ALLOWED_RECIPIENTS`, sinon `SUPPRESSED` ; `EMAIL_MODE=send` → envoi réel.
7. **Envoi réel** — appel Resend, statut mis à jour (`SENT`/`FAILED`), `rendered_html`/`rendered_text` purgés uniquement à un état terminal (permet un vrai retry après un échec réseau).
8. **Retry** — `processOutboxRetries()` reprend les lignes `FAILED` non terminales (borné à `MAX_RETRIES=5`), jamais un bounce dur/plainte/adresse suppressed.
9. **Webhook — politique de précédence monotone (revue et étendue le 2026-08-30)** — Resend confirme `sent/delivered/delivery_delayed/bounced/complained/failed`, signature Svix vérifiée avant toute confiance. États TERMINAUX (`DELIVERED`, `BOUNCED`, `COMPLAINED`, `FAILED`, `SUPPRESSED`) : le PREMIER atteint gagne définitivement pour la colonne `status` — plus aucun webhook ultérieur (même type rejoué en doublon, ou type terminal différent arrivant hors-ordre) ne la modifie. Exception étroite : un `bounced`/`complained` reçu après qu'un AUTRE état terminal a déjà été enregistré met quand même à jour `email_suppressions` (protège les prochains envois à cette adresse, jamais la ligne déjà figée). `sent` exclut en plus `DELAYED` (strictement plus informatif). Décision documentée et testée dans `lib/email/webhook.ts` (voir le commentaire de tête de `applyWebhookEvent`) et `tests/unit/email-webhook.test.ts` (18 tests, dont les 6 séquences hors-ordre + doublon + événement terminal inhabituel explicitement exigés par la mission de fermeture). Idempotence des doublons vérifiée pour TOUS les types d'événement (pas seulement `delivered` comme avant).
10. **Audit** — chaque action de notification importante (invitation envoyée/renvoyée, réinitialisation demandée, notification d'examen envoyée/renvoyée, échec de livraison, bounce) est journalisée dans `audit_logs` via `lib/email/audit.ts`.

## H. MFA et notifications

- `MFA_ENABLED` (auto-activation) et `MFA_DISABLED` (auto-désactivation, mot de passe re-confirmé) sont WIRED depuis `app/(app)/mon-compte/actions.ts`.
- `MFA_RESET_BY_ADMIN` — WIRED depuis `app/(app)/users/actions.ts::adminResetMfaAction` (administrateur uniquement, voir `lib/rbac.ts::requireWriteRole("administrator")`), réutilise le gabarit `mfa-disabled.tsx` avec `byAdmin: true`. Notification purement informative — n'inclut ni l'ancien secret ni un lien de re-configuration forcée (le titulaire suit le parcours normal `/mon-compte` → « Activer MFA » s'il souhaite ré-activer). Couverture automatisée réelle ajoutée le 2026-08-30 (`tests/e2e/scenario-o-mfa-reset.spec.ts`).
- MFA reste une fonctionnalité **administrateur/responsable pédagogique** uniquement (`/mon-compte` gardé par `guardPage("administrator", "pedagogical_manager")`) — un candidat n'a structurellement aucun accès à l'auto-inscription MFA, politique produit inchangée par cette mission.
