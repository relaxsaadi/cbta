# KOST E-EXAM V2 — Rapport de disponibilité production

> [!CAUTION]
> **SNAPSHOT HISTORIQUE DU 2026-08-28 — SUPERSEDED POUR TOUT GO/NO-GO ACTUEL.**
>
> Ce document conserve les mesures et constats observés au **2026-08-28** ; il ne constitue plus l'autorité de readiness actuelle et sa conclusion historique `GO techniquement` ne doit pas être utilisée pour autoriser une bascule. Depuis sa génération, des audits Stage 2B.1 ont ouvert des blockers techniques, sécurité et intégrité des données qui doivent être réconciliés sur un même head avant toute nouvelle conclusion de readiness.
>
> **Réconciliation documentaire : 2026-09-09.** Head V2 observé lors de cette réconciliation : `058ed0b259ff732e5ae7561393d01f976c32f0e8` (`feature/kost-eexam-v2-native`). Le statut courant reste **PRE-PRODUCTION**. Toute future déclaration de GO technique doit citer son propre head SHA, sa date, le snapshot des blockers ouverts/fermés et les preuves fraîches build/typecheck/unit/E2E/proxy/concurrency/backup/restore applicables à ce même head.
>
> Cette réconciliation documentaire **ne ferme aucun blocker d'implémentation** et ne transforme aucun statut réglementaire. La production DGR reste soumise, fonction par fonction 7.1–7.10, aux preuves directes IATA DGR 67e édition 2026 Tier-A, aux états SOURCE GAP/CONFLICT honnêtes, à la vérification FR, à la revue EN séparée et à un reviewer humain qualifié nommé + date avant tout `APPROVED`. Elle ne constitue aucune approbation ANAC/IATA.

**Date :** 2026-08-28
**Branche :** `feature/kost-eexam-v2-native`
**Tag :** `kost-eexam-v2-production-rc1`
**Environnement vérifié :** staging réel — https://staging.kostacademy.com
**Production :** **NON DÉPLOYÉE** — V1 (Moodle, `exam.kostacademy.com` / `console.kostacademy.com`) reste le système en production, inchangé, jamais touché pendant cette mission.
**Suite de tests :** 43/43 tests unitaires ; régression E2E complète (93 tests) exécutée 3 fois cette session : 86-87 réussis à chaque fois, 5 ignorés (gel connu), 1-2 échecs à chaque fois — **jamais le même test, jamais reproductible en isolation**, mécanisme précisément identifié : `10-rate-limit-clean-proof.spec.ts` prouve délibérément, dans sa dernière phase, un VRAI verrouillage de 15 minutes sur son compte de test dédié — le rejouer (isolément ou via une suite complète) dans les 15 minutes suivant son propre passage précédent échoue nécessairement, par construction, pas par régression (confirmé : passe à nouveau une fois isolé après le délai). S'y ajoutent d'authentiques micro-coupures réseau isolées contre le serveur distant réel (`ERR_CONNECTION_TIMED_OUT`/`Failed to fetch`), jamais reproductibles au second essai — même caractéristique déjà documentée lors des phases précédentes de ce projet. Aucune de ces occurrences n'a de cause applicative.

Ce rapport ne constitue **ni une approbation ANAC, ni une déclaration que la plateforme est prête pour la production** au sens réglementaire. Il documente, sans arrondir, ce qui est réellement construit, testé, et déployé sur staging à cette date — et ce qui ne l'est pas.

---

## A. État complet de la plateforme native

KOST E-EXAM V2 est une application Next.js 16 + TypeScript, base de données `node:sqlite` embarquée, **sans aucune dépendance runtime à Moodle** pour : authentification, utilisateurs, groupes, candidats, fonctions DGR, banque de questions, examens, tentatives, chronomètre, notation, résultats, rapports, incidents, audit, exports. Vérifié structurellement (aucun appel réseau vers Moodle dans le code applicatif) et opérationnellement (V1/Moodle reste sur sa propre stack Docker isolée, jamais interrogée par V2 au runtime — seule une extraction lecture-seule ponctuelle a eu lieu pour la migration de contenu, documentée en §C).

Fonctionnalités natives complètes : auth/RBAC 4 rôles, isolation multi-client, gestion clients/groupes/candidats (création, édition, import CSV en masse, export, recherche), banque de questions versionnée, assistant de création d'examen (12 étapes), 3 modes d'affectation, moteur de passage d'examen (chronomètre serveur, autosave, reconnexion), moteur de notation à source unique, rapports PDF (individuel, session, liste officielle) + CSV (résumé, détaillé, filtres), module incidents/continuité (10+ actions, traçabilité complète), 5 guides utilisateur (écran + PDF), module de familiarisation, sauvegarde/restauration automatisées, MFA natif (TOTP + codes de secours), supervision de santé (`/api/health` + cron).

## B. Disponibilité technique pour la production

**~35 portes techniques vérifiées cette mission ou lors des phases précédentes (addendum §1-27, déjà gelées) :**

| # | Porte | Statut | Preuve |
|---|---|---|---|
| 1 | Authentification native, sans Moodle | PASS | `lib/auth.ts`, testé E2E |
| 2 | RBAC 4 rôles, appliqué serveur | PASS | `lib/rbac.ts`, chaque route mutante testée |
| 3 | Isolation multi-client (tenant) | PASS | audit exhaustif 59 fichiers cette session, 0 gap |
| 4 | Refus d'écriture auditeur | PASS | même audit — `requireWriteRole` structurellement sans auditeur partout |
| 5 | MFA natif (TOTP + codes de secours) | PASS (fonctionnalité) | RFC 6238 Annexe B, 14/14 tests unitaires, 2 tests E2E réels |
| 6 | MFA obligatoire pour administrateurs | **PARTIAL — décision de politique non tranchée** | disponible, pas forcé (voir §D) |
| 7 | Sécurité de session (cookies/CSRF/révocation) | PASS | HttpOnly/SameSite=Strict/Secure vérifiés réels ; CSRF natif Next.js sur Server Actions |
| 8 | Anti-force-brute | PASS avec limite connue | en mémoire mono-processus, documentée, acceptable au déploiement actuel |
| 9 | Assistant de création d'examen + 2 modes d'affectation | PASS | testé E2E, numérotation UX corrigée cette session |
| 10 | Chronomètre serveur (indépendant client) | PASS | `sweepExpiredAttempts`, testé unitaire + E2E réel |
| 11 | Filet crash/perte réseau (cron sweep) | PASS | installé et vérifié sur staging cette session ; bug d'accès réel trouvé et corrigé (`proxy.ts`) |
| 12 | Reconnexion en cours de tentative | PASS | état préservé, prouvé E2E (scenario-c + candidat 4 de l'acceptance) |
| 13 | Garantie tentative unique (contrainte DB) | PASS | index unique partiel SQLite, testé unitaire |
| 14 | Moteur de notation, source unique | PASS | testé unitaire avec réponses contrôlées |
| 15 | Rapports PDF (individuel/session/liste officielle) + CSV | PASS | testés E2E réels, magic bytes PDF vérifiés |
| 16 | Protection injection de formule CSV | PASS | testé unitaire |
| 17 | Module incidents/continuité | PASS | cycle complet testé E2E (déclaration→clôture) |
| 18 | Guides (5, écran + PDF) | PASS | testés pour les 4 rôles |
| 19 | Module de familiarisation | PASS | testé E2E |
| 20 | Sauvegarde automatique | PASS | cron réellement installé cette session (gap trouvé : jamais appliqué avant) |
| 21 | Test de restauration automatique | PASS | cron installé + rejoué manuellement après migration DGR, intégrité confirmée |
| 22 | Intégrité base de données | PASS | `PRAGMA integrity_check`/`foreign_key_check` vérifiés en direct sur la base réelle |
| 23 | TLS + renouvellement automatique | PASS | certificat réel Let's Encrypt, `certbot.timer` confirmé actif |
| 24 | En-têtes de sécurité | PASS | HSTS/CSP/X-Frame-Options vérifiés en direct |
| 25 | Scan de secrets | PASS (remédié) | 2 fuites réelles trouvées et corrigées, aucune de production |
| 26 | Audit de dépendances | PASS | `pnpm audit` : 0 vulnérabilité |
| 27 | Accessibilité (axe-core) | PASS | 22 pages/4 rôles, 0 violation après correction de 4 défauts réels |
| 28 | Device/viewport (desktop/tablette/mobile/WebKit) | PASS | 3 nouveaux projets Playwright, 12/12 |
| 29 | Étiquetage scope démo/test/production | PASS (remédié) | gap réel trouvé (KPI mélangés) et corrigé |
| 30 | Rotation des logs | PASS (remédié) | gap réel trouvé (aucune limite Docker) et corrigé |
| 31 | Audit tableaux de bord (pas de placeholder) | PASS | recherche exhaustive, 0 résultat |
| 32 | Supervision de santé (`/api/health` + cron) | PARTIAL | construit et vérifié, journalise mais ne pousse pas d'alerte active |
| 33 | Revue UX première connexion | PASS (remédié) | 2 défauts réels HIGH trouvés et corrigés |
| 34 | Scénario d'acceptance réaliste (10 candidats) | PASS | 7/7 — réussite/échec/timeout/reconnexion/suspension-reprise, tous réels |
| 35 | Charge concurrente | PASS à l'échelle testée | 10/10 candidats réels concurrents, 4,46 s, 0 échec, V1 non impacté |

**Bilan historique au 2026-08-28** : 32/35 PASS complet, 3 PARTIAL (MFA obligatoire = décision de politique, pas un défaut technique ; supervision = alerte active manquante, pas la détection elle-même ; anti-force-brute = limite architecturale connue et acceptée). **Aucun FAIL constaté dans ce snapshot historique. Cette phrase ne décrit pas l'état courant après les audits ultérieurs.**

## C. Disponibilité EXACTE du contenu réel DGR par fonction (7.1–7.10)

| Fonction | Questions FROZEN/SOURCE VERIFIED dans V2 | Statut réviseur |
|---|---:|---|
| 7.1 | 13 (5 items définitivement irrécupérables : Q-7.1-005/007/008/010/012 — texte introuvable dans aucune source accessible, blocage humain/réglementaire permanent) | PENDING (jamais APPROVED) |
| 7.2 | 21 | PENDING |
| 7.3 | 7 | PENDING |
| 7.4 | 7 | PENDING |
| 7.5 | 7 | PENDING |
| 7.6 | 8 | PENDING |
| 7.7 | 7 | PENDING |
| 7.8 | 10 | PENDING |
| 7.9 | 5 | PENDING |
| 7.10 | 7 | PENDING |
| **Total** | **92** | **100% PENDING (0% APPROVED)** |

- 100% `source_status = FROZEN_SOURCE_VERIFIED`, 0 erreur/texte manquant/réponse invalide sur les 92 items (vérifié via l'API réelle, pas seulement en base).
- **`reviewer_status` reste `PENDING` sur les 92 questions — jamais fait passer à `APPROVED` automatiquement** (mission §47, gate de revue humaine). Aucune question n'est donc formellement validée pour un examen de certification réel tant qu'un réviseur qualifié ne l'a pas fait passer à `APPROVED` avec une date réelle.
- Limitation connue signalée honnêtement : le champ `explanation` des 85 questions importées cette session mélange framing anglais et citations françaises — factuellement exact, jamais fabriqué, mais pas encore 100% FR pour affichage large candidat (n'affecte ni l'énoncé, ni les choix, ni la bonne réponse).
- Aucune question n'a été fabriquée, devinée, ou approximée à aucun moment de cette mission.

## D. Blocages humains/réglementaires exacts

Ces éléments sont des **blocages légitimes**, pas des tâches techniques incomplètes (mission §47) :

1. **Revue réglementaire humaine des 92 questions migrées** — aucune n'est `APPROVED`. Un réviseur qualifié doit examiner et approuver au moins la/les fonction(s) utilisée(s) en premier avant tout examen de certification réel.
2. **5 questions Fonction 7.1 définitivement irrécupérables** (Q-7.1-005/007/008/010/012) — texte intégral introuvable dans tout environnement accessible ici (règle de licence : seule la copie administrée en direct le porte). Nécessite le texte fourni directement par le propriétaire humain, ou l'acceptation qu'elles restent exclues.
3. **MFA obligatoire pour les comptes administrateur** — décision de politique du propriétaire de la plateforme, pas un blocage technique (la fonctionnalité est prête).
4. **Canal d'alerte actif** (e-mail/SMS/Slack pour le monitoring) — outil/service à choisir par le propriétaire ; le monitoring journalise déjà correctement sans ce choix.
5. **Copie de sauvegarde chiffrée hors site** — dépend du choix d'hébergement final, non tranché.
6. **Décisions de bascule** (domaine cible, sort de `console.kostacademy.com`, sort de l'historique V1) — voir `docs/KOST_EEXAM_V2_PRODUCTION_CUTOVER_PLAN.md` §10.

Aucun de ces points n'est contourné, deviné, ou déclaré résolu ici.

## E. CONCLUSION HISTORIQUE DU 2026-08-28 — **SUPERSEDED POUR LE GO/NO-GO ACTUEL**

> La conclusion ci-dessous est conservée pour la traçabilité du snapshot du 2026-08-28. Elle **n'est plus une autorisation de cutover** et ne décrit pas le statut courant après les audits Stage 2B.1.

- **Conclusion technique historique** : la plateforme native fonctionnait de bout en bout selon les preuves disponibles à cette date (93 tests E2E + 43 tests unitaires, avec les résultats réels détaillés en tête du rapport), sans dépendance Moodle, avec les mécanismes alors vérifiés de chronomètre, sauvegarde/restauration, isolation multi-client et charge testée de 10 candidats concurrents. → **Le rapport avait conclu à un GO technique au 2026-08-28 ; cette conclusion est désormais superseded.**
- **Réglementairement** : tant qu'aucune question n'est `APPROVED` par un réviseur qualifié (§D.1), la plateforme ne doit **jamais** être présentée comme prête à délivrer une certification DGR réelle. → **NO-GO tant que cette revue n'a pas eu lieu.**
- **Statut courant de ce document : historique uniquement.** Un nouveau GO technique exige la fermeture vérifiée de tous les blockers techniques/security/data-integrity critiques sur un head reconcilié, avec preuves fraîches sur ce même SHA. La readiness réglementaire reste séparée et ne peut jamais être déduite du seul GO technique.

## F. Plan de bascule

Voir `docs/KOST_EEXAM_V2_PRODUCTION_CUTOVER_PLAN.md` — document séparé, complet (sauvegarde pré-bascule, migration comptes/contenu, domaine/TLS, fenêtre de maintenance, tests de fumée, stratégie DNS/rollback, monitoring post-bascule, décisions non tranchées). **Rien dans ce plan n'a été exécuté.**

---

## Rappel — mission §55

**La conclusion GO technique historique de ce rapport est superseded. Aucune bascule finale (remplacement de V1, changement de DNS de production, déplacement de `exam.kostacademy.com`, suppression de Moodle, fusion de production automatique) ne doit être exécutée sur la base de ce snapshot ; une nouvelle décision exige un head reconcilié, des gates actuels verts et l'autorisation explicite et séparée du propriétaire de la plateforme.**
