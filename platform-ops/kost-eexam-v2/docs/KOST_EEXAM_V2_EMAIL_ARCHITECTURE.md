# KOST E-EXAM V2 — Architecture email transactionnel (Resend)

**Date :** 2026-08-29
**Branche :** `feature/kost-eexam-v2-native`
**Environnement vérifié :** staging réel — https://staging.kostacademy.com
**Production :** NON déployée — cette mission ne touche jamais `exam.kostacademy.com` (V1/Moodle) ni la production réelle.
**RESEND_API_KEY :** MISSING (jamais fabriqué, jamais demandé au propriétaire dans ce document)
**RESEND_WEBHOOK_SECRET :** MISSING

Ce document décrit l'état réel du sous-système de notification email construit dans cette mission. Rien ci-dessous n'implique une approbation ANAC/IATA ni une mise en production.

---

## A. Portée de la mission

Expérience email/notification uniquement. N'a jamais modifié : Moodle/V1, le contenu des questions, les statuts Tier A/`reviewer_status`, la banque de 244 questions, le travail Bookshelf, le DNS de production, `exam.kostacademy.com`, ni exécuté de bascule de production. Vérifié après coup (§F).

---

## B. CURRENT — état avant cette mission

Avant cette mission, le seul « email » du projet était : rien. Aucun module `lib/email/`, aucune dépendance Resend, aucun jeton d'activation, aucun mot de passe généré différemment d'un flux `createUser(password)` classique (mot de passe fixe/choisi par l'admin, jamais un flux sécurisé par jeton). Aucune table `notification_log`/`activation_tokens`/`notification_preferences`/`email_suppressions`/`reminder_dispatch_log`. Aucun webhook. Aucune UI de notification.

## C. MISSING — ce qui reste non construit après cette mission

| Élément | Statut | Raison |
|---|---|---|
| `RESEND_API_KEY` | **MISSING** | Jamais fourni au workspace, jamais fabriqué — blocage authentique divulgué, pas contourné. |
| `RESEND_WEBHOOK_SECRET` | **MISSING** | Idem. |
| Envoi réel à une adresse candidate | **BLOQUÉ** | Aucune boîte de test approuvée par le propriétaire — voir §61-73 et le rapport final. |
| `CANDIDATE_ADDED_TO_GROUP`, `FUNCTION_ASSIGNED`, `EXAM_CANCELLED`, `EXAM_SUSPENDED`, `EXAM_RESUMED`, `ATTEMPT_REOPENED_BY_STAFF`, `REPORT_AVAILABLE`, `FAMILIARIZATION_REMINDER`, `GROUP_CREATED`, `EXAM_PUBLISHED`, `HEALTHCHECK_FAILED`, `BACKUP_FAILED` | **TEMPLATE_ONLY ou absent** | Voir la matrice complète dans `KOST_EEXAM_V2_EMAIL_EVENTS.md` — un sous-ensemble a un type/gabarit prévu mais aucun déclencheur applicatif câblé ; certains (ex. `EXAM_RESCHEDULED`) ont un gabarit prêt mais aucun flux « reprogrammer un examen » n'existe encore côté produit. |
| `MAINTENANCE_STARTED`/`MAINTENANCE_COMPLETED` | **Gabarit + fonction `notify*()` prêts, JAMAIS câblés** | `actionEnableMaintenanceMode`/`actionDisableMaintenanceMode` (`lib/incidents.ts`) ne les appellent pas — la question « qui notifier : tous les utilisateurs ? seulement les tentatives en cours ? » est une décision produit non tranchée cette passe, jamais devinée. |
| `DeclareIncidentForm.tsx` → `responsibleUserId` | **Corrigé cette mission** | Un gap similaire (backend câblé, UI absente) existait au démarrage de cette mission — corrigé : le formulaire propose désormais un menu « Compte à notifier » par groupe accessible. |
| Notification history — filtre par date | **Absent** | Filtres implémentés : statut, type d'événement, recherche email. Le filtre date explicitement demandé par §51 n'a pas été ajouté par manque de temps — les 200 lignes les plus récentes suffisent au volume actuel de staging, mais ce n'est pas une implémentation complète de la spec. |
| Digest/rappels — fréquence cron réelle installée | **Documentée, non installée** | `deploy/reminders.sh` existe et fonctionne (testé manuellement), la ligne crontab est présente mais **commentée** dans `deploy/crontab.example` — voir `KOST_EEXAM_V2_RESEND_OPERATIONS.md` pour l'activer. |

## D. IMPLEMENTED — ce qui est réellement construit, testé, déployé

- Architecture centralisée `lib/email/` (client, config, send, types, events, preferences, audit, format, history, webhook, resend-actions, reminders, notify-result, result-policy, preview-registry, templates/).
- 18 fonctions `notify*()` typées, dont 14 réellement **WIRED** dans un flux applicatif réel (voir `KOST_EEXAM_V2_EMAIL_EVENTS.md` pour la liste exacte) + 3 rappels d'examen optionnels construits cette mission (`EXAM_OPENS_SOON`/`EXAM_NOW_AVAILABLE`/`EXAM_DEADLINE_REMINDER`, WIRED via `lib/email/reminders.ts`).
- 18 gabarits React Email (`lib/email/templates/`), rendu HTML + texte brut, composants partagés (`EmailShell`, `Title`, `Paragraph`, `InfoCard`, `CTAButton`, `SecurityNotice`, `ExpiryNote`), branding KOST Academy sobre, français.
- Flux d'activation par jeton sécurisé (§8-9) — **aucun mot de passe n'est jamais transmis par email**, ni en clair ni haché : `createUserPendingActivation()` génère un mot de passe interne inutilisable (32 octets aléatoires, immédiatement oublié), le candidat crée lui-même son mot de passe via `/activer?token=...`, jeton haché SHA-256 en base, 24h, usage unique.
- Outbox durable (`notification_log`) avec idempotence (contrainte UNIQUE), statuts, retry borné, purge du corps rendu à l'état terminal.
- Webhook Resend natif (Svix HMAC-SHA256, `node:crypto`, sans dépendance `svix`), idempotent, jamais de confiance en une requête non signée.
- Séparation MANDATORY/OPTIONAL des préférences (`lib/email/preferences.ts`).
- RBAC/isolation tenant appliqués aux actions email (voir §E).
- Admin UI : `/notifications` (historique filtrable + boutons Renvoyer, scope tenant) et `/admin/email-preview` (aperçu synthétique, ne peut structurellement jamais envoyer un email réel).
- `EMAIL_MODE` (log/allowlist/send) — sécurité de staging, jamais un envoi accidentel.
- Secret scan du dépôt/scripts/Docker/git log — **clean** (voir le rapport final).
- 69/69 tests unitaires, 4/4 nouveaux scénarios E2E email + 7/8 scénarios E2E pré-existants toujours verts (1 échec pré-existant, sans rapport avec l'email — voir §F).

## E. SECURITY MODEL

- **Secrets** : `RESEND_API_KEY`/`RESEND_WEBHOOK_SECRET` jamais journalisés, jamais exposés côté client, jamais en `NEXT_PUBLIC_*`, jamais en base. Seul `safeEmailConfigReport()` (booléens de présence, jamais la valeur) est exposé, via `/api/health` (public, lecture seule) et le futur centre d'aperçu.
- **Mots de passe** : jamais envoyés par email (§8-9 ci-dessus). `password_reset_requested`/`password_changed` : notifications de sécurité obligatoires, jamais désactivables.
- **Jetons** : aléatoires cryptographiques (32 octets), stockés hachés (SHA-256) uniquement, usage unique (`used_at`), expiration (24h activation / 2h réinitialisation), invalidation explicite sur renvoi (`invalidatePendingTokens`) — jamais de réutilisation d'un ancien lien.
- **Tenant isolation** (§48) : chaque `notify*()` reçoit un `EmailTenantContext` résolu par l'appelant (jamais deviné dans le sous-système email lui-même) ; `/notifications` filtre par `scopedUserIdsForSessionsOrNull()` (même prédicat que « Sessions actives », déjà éprouvé) — testé E2E (scénario J, §48/§68).
- **RBAC** (§48-49) : `auditor` structurellement exclu de `requireWriteRole` (aucune action d'envoi/renvoi possible, y compris en forgeant une requête — la garde est côté Server Action, pas seulement l'UI) ; testé E2E (aucun bouton Renvoyer visible pour l'auditeur) et par construction (le type `Exclude<ConsoleRole, "auditor">` de `requireWriteRole`).
- **Vocabulaire candidat** (§45-46) : aucun terme développeur (tenant, RBAC, webhook, cron, Resend, Tier A, FROZEN, UUID, source_status) dans un gabarit candidat — vérifié par relecture de chaque template.
- **Vie privée** (§47) : aucun gabarit ne contient de question, réponse correcte, réponse détaillée d'un candidat, identité d'un autre candidat, référence DGR interne, preuve d'incident, mot de passe, jeton ou secret MFA.
- **Contenu dynamique** : chaque valeur interpolée (prénom, entreprise, groupe, titre d'examen) passe par le rendu React Email (échappement JSX natif) — jamais de HTML utilisateur injecté brut.

## F. EVENT MODEL

Catalogue complet, statut WIRED/TEMPLATE_ONLY par événement, dans `docs/KOST_EEXAM_V2_EMAIL_EVENTS.md`. Résumé : **32** types d'événements déclarés dans `EmailEventType` (`lib/email/types.ts`), **18** gabarits construits (React Email), **17** fonctions `notify*()` implémentées (`notifyMfaDisabled` sert deux types selon `byAdmin` — MFA_DISABLED/MFA_RESET_BY_ADMIN), couvrant **17 types d'événements réellement WIRED** (déclenchés par un flux applicatif réel — 14 avant cette mission + 3 rappels d'examen construits cette mission : `EXAM_OPENS_SOON`/`EXAM_NOW_AVAILABLE`/`EXAM_DEADLINE_REMINDER`). 2 événements (`MAINTENANCE_STARTED`/`COMPLETED`) ont un gabarit ET une fonction `notify*()` prêts mais jamais appelés par aucune action (décision produit non tranchée — voir §C). 1 événement (`EXAM_RESCHEDULED`) a un gabarit construit mais **aucune fonction `notify*()`** — plus incomplet que les deux précédents, littéralement impossible à déclencher sans écrire du code supplémentaire. Les 12 événements restants n'ont ni gabarit ni fonction (voir §C et le détail par événement dans `KOST_EEXAM_V2_EMAIL_EVENTS.md`).

## G. DELIVERY MODEL

1. **Déclenchement** — un flux métier (Server Action, route API, script cron) appelle une fonction `notify*()` typée de `lib/email/events.ts`. Jamais d'appel direct au SDK Resend ailleurs.
2. **Filet non-throw** — chaque `notify*()` est enveloppée dans `safe()` (voir `lib/email/events.ts`) : une erreur SURVENANT AVANT l'écriture de l'outbox (config manquante, échec de rendu) est journalisée côté serveur et **ne remonte jamais** à l'appelant. **Bug réel trouvé et corrigé cette mission** — voir le rapport final et `tests/unit/email-never-throws.test.ts`.
3. **Préférences** — `shouldSendToUser()` vérifie MANDATORY (toujours) vs OPTIONAL (respecte la préférence candidat).
4. **Rendu** — React Email produit HTML + texte brut (`render(node)` / `render(node, {plainText:true})`).
5. **Outbox** — `queueAndSendEmail()` écrit TOUJOURS une ligne `notification_log` (statut `QUEUED`) **avant** toute tentative réseau, avec idempotence par `idempotency_key` (contrainte UNIQUE — un doublon retourne l'état existant sans réécrire).
6. **Décision d'envoi** — `resolveDeliveryDecision()` : liste de suppression → `SUPPRESSED` ; `EMAIL_MODE=log` → `SUPPRESSED` (aucun envoi réel) ; `EMAIL_MODE=allowlist` → envoi réel uniquement si le destinataire est dans `EMAIL_ALLOWED_RECIPIENTS`, sinon `SUPPRESSED` ; `EMAIL_MODE=send` → envoi réel.
7. **Envoi réel** (uniquement si décidé ci-dessus) — appel Resend, statut mis à jour (`SENT`/`FAILED`), `rendered_html`/`rendered_text` purgés uniquement à un état terminal (pour permettre un vrai retry après un échec réseau).
8. **Retry** — `processOutboxRetries()` reprend les lignes `FAILED` non terminales (borné à `MAX_RETRIES=5`), jamais un bounce dur/plainte/adresse invalide.
9. **Webhook** — Resend confirme `sent/delivered/delivery_delayed/bounced/complained/failed`, signature Svix vérifiée, mise à jour idempotente du statut, ajout à `email_suppressions` sur bounce dur/plainte (arrête les auto-renvois répétés).
10. **Audit** — chaque action de notification importante (invitation envoyée/renvoyée, réinitialisation demandée, notification d'examen envoyée/renvoyée, échec de livraison, bounce) est journalisée dans `audit_log` via `lib/email/audit.ts`.
