# KOST E-EXAM V2 — Dossier de démonstration auditeur (référence complète)

**Environnement démontré :** https://staging.kostacademy.com — plateforme d'examen DGR native (V2), pré-production.
**Captures :** 33 captures réelles (jamais simulées/fabriquées), 1440×900, capturées le 2026-08-30 et rafraîchies le 2026-08-31 via Chromium Playwright isolé sur l'environnement de staging réel (voir `SCREENSHOT_INDEX.md` pour le détail des rafraîchissements et `RESPONSIVE_EVIDENCE.md` pour les preuves mobile/tablette).
**Données :** comptes et questions clairement étiquetés `(pilote)`, `(démo)` ou `[DÉMO]` partout où c'est pertinent. Les 8 questions démo créées pour ce dossier restent `Brouillon` (`DRAFT`) — jamais promues dans la banque réglementaire des 244 questions.

## Avertissement — à lire avant toute présentation à un auditeur

- **`CONFIRMÉ — SOURCE DGR VÉRIFIÉE` (`source_status`) ≠ `REVUE HUMAINE QUALIFIÉE / APPROUVÉE` (`reviewer_status`).** Ce sont deux champs distincts du produit (`lib/questions.ts`). Les 244 questions réglementaires portent `source_status = FROZEN_SOURCE_VERIFIED` (texte source IATA DGR 67e édition 2026, Addendum 1 intégré, vérifié et figé). Aucune des 244 ne porte encore de `reviewer_status = APPROVED` avec réviseur qualifié nommé et date — voir `docs/DGR_SOURCE_REGISTER.md`. **Ne jamais dire à un auditeur que les questions sont « approuvées » sur la seule base de ce dossier.**
- **Aucune accréditation ANAC ni approbation IATA du logiciel n'est affirmée par ce dossier.** Le statut d'accréditation ANAC est hors périmètre de cette démonstration — se référer à l'état réel confirmé par le propriétaire à la date de la présentation.
- Ce dossier démontre la plateforme **technique** : authentification, cycle de vie candidat, 8 types de question, notation, email, sécurité, audit. Il ne démontre pas et ne remplace pas la revue réglementaire humaine du contenu.

---

## 01 — Écran de connexion

**Capture :** `01-login.png`

**Ce que l'auditeur voit :** Page de connexion KOST E-EXAM V2, positionnement produit (« Plateforme d'examen DGR — native, sans Moodle »), formulaire identifiant/mot de passe, mention explicite des 4 rôles supportés (candidat, responsable pédagogique, administrateur, auditeur).

**Ce que dit le propriétaire :** « La plateforme a sa propre identité — aucun compte ni session ne transite par un système externe. Chaque rôle a un accès dédié dès la connexion. »

**Point de conformité technique :** Authentification propre à l'application (`iron-session`), jamais de relais vers un identity provider tiers non maîtrisé.

**Ce qu'il ne faut pas prétendre :** Ne pas présenter cet écran comme une preuve de conformité réglementaire — c'est une preuve d'architecture technique uniquement.

---

## 02 — Tableau de bord administrateur

**Capture :** `02-admin-dashboard.png`

**Ce que l'auditeur voit :** KPI de synthèse (clients, groupes, examens ouverts, incidents) explicitement scopés « Production », et la liste des 8 dernières évaluations créées tous statuts/scopes confondus, avec une colonne « Scope » (Démo/Production) clairement visible.

**Ce que dit le propriétaire :** « Chaque examen porte un scope explicite — démo, test ou production — jamais ambigu. Les compteurs officiels du tableau de bord ne comptent que la production réelle. »

**Point de conformité technique :** Séparation structurelle des données démo/test/production au niveau du modèle de données (`scope` sur `assessments`), pas seulement une convention de nommage.

**Ce qu'il ne faut pas prétendre :** Le compteur d'incidents ouverts reflète l'activité cumulée de la suite de tests automatisés sur cet environnement de préproduction partagé — **ne pas le présenter comme des incidents opérationnels réels**. Un déploiement production réel repart de zéro.

> **Rafraîchi le 2026-08-31 :** contenu de « Évaluations récentes » actualisé (activité de test cumulée depuis la capture d'origine) — le principe démontré (scope explicite, jamais ambigu) est inchangé.

---

## 03 — Répertoire utilisateurs

**Capture :** `03-users-directory.png`

**Ce que l'auditeur voit :** Liste des comptes (33 au total, filtrée sur « staging » pour la lisibilité de la démonstration), avec type, entreprise, rôle, statut et colonne MFA par compte. Actions de masse visibles (affecter à un groupe/une fonction, archiver la sélection).

**Ce que dit le propriétaire :** « Un seul écran donne une vue complète et filtrable de tous les comptes, avec leur statut MFA — rien n'est caché dans un système séparé. »

**Point de conformité technique :** RBAC appliqué dès la liste — seul un administrateur atteint cette route (`/users` structurellement inaccessible aux autres rôles, 403 serveur).

**Ce qu'il ne faut pas prétendre :** Ne pas affirmer que « MFA activé pour tous » — la colonne montre le statut réel compte par compte, MFA n'est pas encore universellement activé sur cet environnement de test.

---

## 04 — Création de compte (Particulier)

**Capture :** `04-create-user.png`

**Ce que l'auditeur voit :** Formulaire de création de compte candidat de type « Particulier », avec un message explicite : « Aucun mot de passe n'est jamais saisi ici — le titulaire du compte crée lui-même son mot de passe via un lien d'invitation sécurisé. »

**Ce que dit le propriétaire :** « L'administrateur ne connaît jamais le mot de passe d'un candidat, même au moment de la création du compte. »

**Point de conformité technique :** Activation par jeton à usage unique — aucune saisie ni transmission de mot de passe en clair par un tiers.

**Ce qu'il ne faut pas prétendre :** —

---

## 05 — Création de compte (Entreprise) — affectation client/groupe

**Capture :** `05-company-group-assignment.png`

**Ce que l'auditeur voit :** Le même formulaire en mode « Entreprise » : sélection du client (« Air Algérie — DEMO »), du groupe/session, et des fonctions DGR (7.1 à 7.10) — plusieurs fonctions affectables simultanément.

**Ce que dit le propriétaire :** « L'affectation tenant (client) et groupe est intégrée à la création du compte — pas une étape séparée oubliable. »

**Point de conformité technique :** Le modèle de données lie chaque candidat à un tenant/groupe dès la création, base de l'isolation multi-client démontrée en §31.

**Ce qu'il ne faut pas prétendre :** —

---

## 06 — Fiche candidat détaillée

**Capture :** `06-user-detail.png`

**Ce que l'auditeur voit :** Fiche complète d'un candidat pilote (« Yasmine Kaced (pilote) ») : identité, identifiant de connexion, affectation groupe/entreprise dérivée de l'appartenance réelle aux groupes, fonctions DGR, statut d'accès et d'activation.

**Ce que dit le propriétaire :** « Toute l'information d'un candidat — accès, affectation, fonctions — est centralisée sur une seule fiche, avec traçabilité de chaque changement. »

**Point de conformité technique :** L'affectation client/groupe est dérivée de l'appartenance réelle aux groupes (pas un champ dupliqué désynchronisable).

**Ce qu'il ne faut pas prétendre :** —

---

## 07 — Banque de questions — statut source et admissibilité

**Capture :** `07-question-bank.png`

**Ce que l'auditeur voit :** Trois compteurs explicites en tête de page — « Questions réglementaires confirmées : 244 », « Questions DEMO / brouillon : 8 », « Total enregistré : 252 » — puis le formulaire d'ajout de question avec un bandeau explicite : « Saisie contrôlée uniquement — jamais de contenu inventé. Une question non « Confirmé — source DGR vérifiée » n'entre jamais automatiquement dans un examen de production. » En dessous, un panneau de filtres complet (Fonction DGR, Type de question, Statut source, Statut reviewer, Classification réglementaire/DEMO, Statut actif/inactif, recherche) au-dessus du tableau des questions, chaque ligne portant son statut source, son statut reviewer et son badge de classification.

**Ce que dit le propriétaire :** « Le statut source d'une question est visible partout, et le moteur d'examen applique cette règle lui-même — ce n'est pas qu'un texte d'interface, c'est une porte structurelle côté serveur. Les compteurs distinguent maintenant explicitement le réglementaire du DEMO — jamais un total unique qui laisserait croire que les 252 lignes sont toutes des questions officielles. »

**Point de conformité technique :** `lib/questions.ts::isAdmissibleWhereClause()` exige `source_status = 'FROZEN_SOURCE_VERIFIED' AND reviewer_status != 'REJECTED'` — vérifié même en mode de sélection manuelle des questions (`lib/assessments.ts::createAssessmentDraft`), jamais contournable depuis l'interface. La classification réglementaire/DEMO (`lib/questions.ts::isDemoQuestionId`) se fie au préfixe `DEMO-` de l'identifiant, jamais au seul `source_status` — une vraie question réglementaire encore en cours de vérification (`DRAFT`/`PARTIAL`/etc.) n'est jamais confondue avec un exemple créé pour tester les 8 types de question.

**Ce qu'il ne faut pas prétendre :** « Confirmé — source DGR vérifiée » signifie que le **texte source** a été vérifié — cela ne signifie pas qu'un réviseur qualifié a **approuvé** la question (`reviewer_status`, champ distinct — voir l'avertissement en tête de dossier).

---

## 08 — Modification d'une question — versionnement immuable

**Capture :** `08-question-detail.png`

**Ce que l'auditeur voit :** Écran d'édition d'une question Vrai/Faux réglementaire (Q-7.1-002, acétylène liquide), avec le message : « Enregistrer crée une NOUVELLE version — les examens déjà publiés avec la version précédente ne sont jamais modifiés rétroactivement. »

**Ce que dit le propriétaire :** « Une correction de question ne réécrit jamais l'historique — un examen déjà passé reste figé tel qu'il a été présenté au candidat. »

**Point de conformité technique :** Chaque publication d'examen fige une copie complète (snapshot) des questions dans `assessment_question_snapshots` — la notation, les résultats et l'affichage candidat ne relisent jamais le contenu « vivant » de la banque.

**Ce qu'il ne faut pas prétendre :** —

---

## 09 — Formulaire d'auteurage — type Cas pratique / scénario

**Capture :** `09-eight-question-types.png`

**Ce que l'auditeur voit :** Le même formulaire d'ajout de question, cette fois avec le type « Cas pratique / scénario » sélectionné : titre de scénario distinct du contexte, contexte affiché une seule fois, puis sous-questions individuelles (chacune pouvant être de n'importe lequel des 7 autres types).

**Ce que dit le propriétaire :** « Le scénario est le type le plus riche — il embarque les 7 autres types comme sous-questions, avec un seul contexte partagé. »

**Point de conformité technique :** 8 types de question supportés nativement (Vrai/Faux, QCM une réponse, QCM plusieurs réponses, Appariement, Ordering/Séquence, Numeric, Réponse courte, Scénario) — voir §16-18 pour la vue candidat.

**Ce qu'il ne faut pas prétendre :** —

---

## 10 — Constructeur d'examen

**Capture :** `10-exam-builder.png`

**Ce que l'auditeur voit :** Assistant de création d'évaluation en 12 étapes (type, client/groupe, fonction, nom, nombre de questions admissibles disponibles, durée, seuil de réussite, tentatives autorisées, fenêtre d'ouverture/fermeture, options de mélange et de feedback, périmètre). Le compteur « Questions admissibles disponibles : 13 » est visible avant publication.

**Ce que dit le propriétaire :** « Tout est configurable et rien n'est publié tant que le responsable pédagogique ne le décide pas — l'aperçu montre le nombre réel de questions admissibles avant tout engagement. »

**Point de conformité technique :** Seuil de réussite explicitement documenté comme « paramètre KOST configurable — jamais une exigence IATA universelle », évitant toute confusion sur l'origine de la règle.

**Ce qu'il ne faut pas prétendre :** Le seuil de réussite affiché (80 %) est un paramètre produit configurable par KOST, jamais une exigence IATA/ANAC universelle à présenter comme telle.

---

## 10bis — Préparation d'examen : filtres et actions rapides

**Capture :** `10b-exam-management-filters.png`

**Ce que l'auditeur voit :** Sous le formulaire de création (même page que §10), un panneau de filtres complet (Recherche, Client, Groupe, Fonction DGR, Statut, Type, Créé du/au) et la liste des évaluations avec, par ligne, deux actions rapides directes : « Prévisualiser comme candidat » et « Voir les résultats ».

**Ce que dit le propriétaire :** « Un responsable retrouve immédiatement n'importe quel examen parmi des dizaines, et agit directement depuis la liste — sans naviguer à travers plusieurs écrans. »

**Point de conformité technique :** Filtres appliqués côté serveur (`lib/assessments.ts`), jamais un simple masquage côté client — une évaluation hors périmètre du responsable n'est jamais chargée en mémoire, quel que soit le filtre demandé.

**Ce qu'il ne faut pas prétendre :** —

> **Preuve ajoutée le 2026-08-31 :** absente du dossier original — §10 ne montrait que le formulaire de création (haut de page), jamais ce panneau situé plus bas sur la même page.

---

## 11 — Examen publié — récapitulatif et suivi

**Capture :** `11-published-exam.png`

**Ce que l'auditeur voit :** Détail d'un examen publié (« DGR Fonction 7.1 — Examen pilote staging ») : lien « Prévisualiser comme candidat » et « Rapport global » en tête, récapitulatif (7 questions, 30 min, seuil 80 %, 1 tentative), actions Suspendre/Clôturer, panneau de reprogrammation, et un tableau « Suivi des candidats » (statut, score, résultat) pour les candidats pilotes déjà affectés.

**Ce que dit le propriétaire :** « Un responsable pédagogique voit en un coup d'œil qui a terminé, qui n'a pas commencé, et les résultats de tous les candidats affectés à cet examen — et peut prévisualiser l'examen tel qu'un candidat le verrait, directement depuis cette fiche. »

**Point de conformité technique :** Actions Suspendre/Clôturer disponibles à tout moment sans supprimer l'examen ni son historique.

**Ce qu'il ne faut pas prétendre :** —

> **Note de correction (2026-08-30, reconduite le 2026-08-31) :** cette capture a systématiquement affiché aussi un panneau « Affecter d'autres candidats » listant des membres réels du groupe démo sans étiquette « (pilote) »/« (démo) » (probablement des testeurs internes antérieurs à cette mission). Ce panneau est masqué au niveau de l'affichage navigateur avant CHAQUE capture — aucune donnée n'est modifiée en base pour produire cette capture. Un incident de revue a été rattrapé le 2026-08-31 : une première recapture avait omis ce masquage et exposait ces noms ; supprimée avant tout envoi, recapturée correctement.
>
> **Rafraîchi le 2026-08-31 :** le lien « Prévisualiser comme candidat » n'apparaissait pas du tout dans la version précédente de cette capture (antérieure à l'ajout de cette fonctionnalité) — désormais visible.

---

## 12 — Reprogrammation d'un examen publié

**Capture :** `12-reschedule.png`

**Ce que l'auditeur voit :** Le même écran, avec le panneau « Reprogrammer l'examen » au premier plan : nouvelle ouverture/fermeture, avertissement explicite (« les candidats affectés sont notifiés. Bloqué si une tentative est en cours. »).

**Ce que dit le propriétaire :** « Reprogrammer un examen ne casse jamais une tentative en cours, et notifie automatiquement les candidats déjà affectés. »

**Point de conformité technique :** Blocage serveur (pas seulement UI) si une tentative est en cours au moment de la reprogrammation.

**Ce qu'il ne faut pas prétendre :** —

---

## 13 — Tableau de bord candidat

**Capture :** `13-candidate-dashboard.png`

**Ce que l'auditeur voit :** Vue candidat (compte pilote démo) listant tous les examens affectés avec statut individuel (« À commencer », « En cours », etc.) et bouton d'action correspondant.

**Ce que dit le propriétaire :** « Le candidat voit exactement ce qui lui est affecté, avec un statut sans ambiguïté pour chaque examen. »

**Point de conformité technique :** Chaque examen affiché provient d'une affectation explicite (`assessment_assignments`) — jamais une liste globale non filtrée.

**Ce qu'il ne faut pas prétendre :** —

> **Rafraîchi le 2026-08-31 :** capturé avec un autre compte pilote démo (« Yasmine Kaced (pilote) » au lieu de « Amel Ferhati (pilote) ») — le compte d'origine avait déjà un résultat disponible sur cet examen précis et ne pouvait plus démontrer l'état « À commencer ». Aucun changement de fond : toujours un compte pilote démo, jamais un candidat réel.

---

## 14 — Instructions avant examen

**Capture :** `14-exam-instructions.png`

**Ce que l'auditeur voit :** Écran d'instructions pré-examen : nombre de questions, durée, tentatives restantes, et règles explicites (« le chronomètre ne s'arrête plus — il continue même en cas de rafraîchissement, fermeture ou perte de connexion », « soumis automatiquement à expiration », seuil de réussite affiché comme paramètre KOST).

**Ce que dit le propriétaire :** « Le candidat connaît les règles avant de s'engager — le chronomètre serveur ne peut pas être contourné en fermant l'onglet. »

**Point de conformité technique :** Le chronomètre est géré côté serveur, pas côté navigateur — base de la garantie anti-triche par déconnexion.

**Ce qu'il ne faut pas prétendre :** —

---

## 15 — Examen en cours — chronomètre et type Vrai/Faux

**Capture :** `15-exam-in-progress.png`

**Ce que l'auditeur voit :** Interface d'examen active : chronomètre circulaire en décompte réel (anneau SVG + icône d'état + libellé « Temps restant » + « 29:59 »), barre de progression « Question 1 sur 8 » avec compteur répondu/sans réponse, navigation par numéro de question, question `[DÉMO]` de type Vrai/Faux.

**Ce que dit le propriétaire :** « Le chronomètre tourne réellement, question par question, avec une navigation libre et un compteur de progression permanent. »

**Point de conformité technique :** Type de question Vrai/Faux — l'un des 8 types nativement supportés.

**Ce qu'il ne faut pas prétendre :** —

> **Rafraîchi le 2026-08-31 :** la version précédente montrait un chronomètre plat (texte seul, sans anneau), antérieure à la refonte du composant `Timer` partagé (anneau circulaire, icône d'état, barre de progression) — désormais rendue fidèlement.

---

## 16 — Type QCM (plusieurs réponses)

**Capture :** `16-vrai-faux-qcm.png`

**Ce que l'auditeur voit :** Question `[DÉMO]` de type QCM à plusieurs réponses (« Plusieurs réponses possibles »), deux cases déjà cochées, indicateur « Enregistré » visible — preuve d'autosave immédiat.

**Ce que dit le propriétaire :** « Chaque réponse est enregistrée côté serveur au moment où elle est donnée, jamais seulement à la soumission finale. »

**Point de conformité technique :** Autosave par question, pas seulement à la fin de l'examen — voir §19 pour la preuve de reprise après interruption.

**Ce qu'il ne faut pas prétendre :** —

---

## 17 — Type Ordering / Séquence

**Capture :** `17-matching-ordering.png`

**Ce que l'auditeur voit :** Question `[DÉMO]` de type Ordering (« Placez les étapes de traitement d'un colis DGR dans le bon ordre »), boutons Monter/Descendre pour réordonner 4 étapes.

**Ce que dit le propriétaire :** « Aucun glisser-déposer obligatoire — l'ordonnancement se fait entièrement au clavier, boutons Monter/Descendre, accessible sans souris. »

**Point de conformité technique :** Type entièrement accessible clavier — garantie d'accessibilité, jamais un mécanisme drag-and-drop bloquant.

**Ce qu'il ne faut pas prétendre :** —

---

## 18 — Type Cas pratique / scénario

**Capture :** `18-scenario.png`

**Ce que l'auditeur voit :** Question `[DÉMO]` de type Cas pratique (« Fuite suspectée ») : un contexte affiché une seule fois, puis deux sous-questions (QCM une réponse + réponse courte), chacune avec son propre statut d'enregistrement.

**Ce que dit le propriétaire :** « Le scénario permet de tester un raisonnement complet sur un seul contexte, avec plusieurs sous-questions de types différents. »

**Point de conformité technique :** Sous-question à réponse courte visible — nécessitera une correction manuelle (voir §23) si le type de correction n'est pas automatique.

**Ce qu'il ne faut pas prétendre :** —

> **Rafraîchi le 2026-08-31 (§16-18) :** même correctif que §15 — chronomètre circulaire moderne désormais rendu fidèlement sur ces trois captures (chronomètre plat obsolète auparavant).

---

## 19 — Reprise après interruption (preuve d'autosave)

**Capture :** `19-resume-autosave.png`

**Ce que l'auditeur voit :** Retour au tableau de bord candidat pendant une tentative active : badge « EN COURS » et bouton « Reprendre l'examen » (au lieu de « Commencer l'examen ») sur l'examen concerné.

**Ce que dit le propriétaire :** « Si un candidat perd sa connexion ou ferme l'onglet, il retrouve exactement où il en était — rien n'est perdu, rien ne redémarre à zéro. »

**Point de conformité technique :** L'état de tentative (`in_progress`) et les réponses déjà données survivent à une fermeture de session complète, pas seulement à un rafraîchissement de page.

**Ce qu'il ne faut pas prétendre :** —

---

## 20 — Révision finale avant envoi

**Capture :** `20-final-review.png`

**Ce que l'auditeur voit :** Écran de résumé avant soumission avec 4 cartes-résumé : « Questions répondues », « Questions sans réponse », « Marquées à revoir », **« Temps restant »**, puis les deux boutons « Retourner aux questions » et « Terminer et envoyer l'examen ».

**Ce que dit le propriétaire :** « Le candidat a une dernière vue d'ensemble avant d'envoyer définitivement son examen — aucune surprise après soumission. »

**Point de conformité technique :** Les questions non répondues et marquées « à revoir » sont explicitement comptées, jamais masquées.

**Ce qu'il ne faut pas prétendre :** —

> **Rafraîchi le 2026-08-31 :** la version précédente ne montrait que 3 cartes-résumé (sans « Temps restant ») et le bouton de soumission n'apparaissait pas dans le cadre — antérieure à l'ajout de la 4ᵉ carte. Les deux boutons sont désormais visibles ensemble.

---

## 21 — Confirmation de soumission

**Capture :** `21-submission-confirmation.png`

**Ce que l'auditeur voit :** Message de confirmation (« Votre examen a bien été envoyé ») avec statut explicite « en attente de correction » — pas de score affiché.

**Ce que dit le propriétaire :** « Tant qu'une correction manuelle n'a pas eu lieu si nécessaire, aucun score n'est montré au candidat — jamais un résultat prématuré ou fabriqué. »

**Point de conformité technique :** Le statut « en attente de correction » bloque structurellement l'affichage d'un score tant que toutes les questions à correction manuelle de la tentative n'ont pas été traitées.

**Ce qu'il ne faut pas prétendre :** —

---

## 22 — Vue administrateur — tentative en cours, jamais un résultat prématuré

**Capture :** `22-in-progress-admin-view.png`

**Ce que l'auditeur voit :** Écran « Résultats » filtré sur le groupe et l'examen démo, avec le filtre **Statut** visible (Tous/En cours/À corriger/Résultat disponible/Abandonné/Terminé) : plusieurs tentatives, certaines avec score/résultat vides et statut « À corriger »/« En cours », une autre déjà notée (« Résultat disponible », 90/100, « Réussi »).

**Ce que dit le propriétaire :** « Une tentative en cours n'affiche jamais de score, nulle part dans l'application — ni côté candidat, ni côté administrateur, ni côté auditeur. Le filtre Statut permet de retrouver immédiatement les tentatives dans un état précis, sans les mélanger. »

**Point de conformité technique :** Le statut « En cours » (`in_progress`) est calculé et affiché de façon cohérente sur toutes les vues — jamais de score partiel ou provisoire exposé.

**Ce qu'il ne faut pas prétendre :** —

> **Note de correction (2026-08-30, reconduite le 2026-08-31) :** cette vue est filtrée par groupe démo ET par l'examen démo précis, afin de ne jamais exposer l'historique réel d'un candidat non démo (Brahimi) présent dans le même tenant. Les tentatives montrées ici proviennent d'actions réelles et authentiques (démarrages d'examen par des comptes pilote), affectés au préalable via le formulaire d'affectation réel de l'application — jamais une donnée fabriquée en base.
>
> **Rafraîchi le 2026-08-31 :** le filtre « Statut » n'apparaissait pas du tout dans la version précédente de cette capture (antérieure à son ajout) — désormais visible.

---

## 23 — File de correction manuelle

**Capture :** `23-manual-grading.png`

**Ce que l'auditeur voit :** Écran « Correction manuelle » avec le panneau de filtres complet (Type/Statut/Client/Groupe/Fonction DGR/Examen/Candidat/Date) : compteur global « Corrections en attente : 2 », qui se décompose exactement en « Réponses courtes : 0 » + « Scénarios : 2 » — le détail par section ci-dessous montre 0 réponse courte et 2 sous-questions de scénario en attente, cohérent avec le total affiché.

**Ce que dit le propriétaire :** « Le compteur global n'est jamais en contradiction avec le détail filtré — si le global dit 2, le détail montre exactement où sont ces 2, jamais un chiffre qui ne se retrouve nulle part. »

**Point de conformité technique :** File dédiée aux réponses à correction manuelle (réponse courte et sous-questions de scénario) — jamais mélangée aux questions auto-notées.

**Ce qu'il ne faut pas prétendre :** Un compteur à zéro pour une catégorie ne signifie pas qu'aucune correction manuelle n'a jamais lieu sur cette catégorie — voir la mention explicite « uniquement pour des tentatives déjà envoyées » sur l'écran lui-même.

> **Rafraîchi le 2026-08-31 :** la version précédente ne montrait AUCUN panneau de filtres (antérieure à son ajout) et un état vide (0 partout) — moins démonstratif que la cohérence globale/détail visible maintenant.

---

## 24 — Résultat final du candidat

**Capture :** `24-final-result.png`

**Ce que l'auditeur voit :** Page « Mes résultats » du candidat pilote : examen démo, score 90/100, statut « Réussi », bouton d'export PDF.

**Ce que dit le propriétaire :** « Le candidat consulte son résultat final dès qu'il est disponible, avec un export PDF individuel à la demande. »

**Point de conformité technique :** Le score affiché provient directement du snapshot immuable de la tentative — jamais recalculé à la volée à l'affichage.

**Ce qu'il ne faut pas prétendre :** —

---

## 25 — Export PDF du rapport

**Capture :** `25-report-export.png`

**Ce que l'auditeur voit :** Le même écran avec le bouton « PDF » mis en évidence — export du rapport individuel détaillé.

**Ce que dit le propriétaire :** « Chaque candidat peut télécharger un rapport PDF individuel réel, avec l'en-tête KOST E-EXAM et les métadonnées complètes. »

**Point de conformité technique :** Génération PDF via `@react-pdf/renderer` côté serveur — document réel, pas une capture d'écran.

**Ce qu'il ne faut pas prétendre :** —

---

## 26 — Historique de livraison email

**Capture :** `26-email-history.png`

**Ce que l'auditeur voit :** Écran « Historique des notifications » filtré : une notification `ACCOUNT_CREATED` vers un destinataire de test, statut `SUPPRESSED` avec détail explicite (« destinataire hors liste autorisée EMAIL_ALLOWED_RECIPIENTS »). Mention permanente sur l'écran : « jamais le contenu de l'email ».

**Ce que dit le propriétaire :** « L'historique de livraison ne montre jamais le contenu d'un email — uniquement son statut de livraison. Et le mécanisme de liste d'autorisation bloque lui-même tout envoi vers une adresse non approuvée en environnement de test. »

**Point de conformité technique :** `EMAIL_MODE=allowlist` en environnement de staging — aucun email réel ne peut atteindre une boîte non explicitement approuvée, y compris par erreur humaine.

**Ce qu'il ne faut pas prétendre :** —

> **Note de correction (2026-08-30) :** l'historique réel non filtré de cet environnement ne contenait que deux adresses destinataires à ce jour — l'email personnel réel d'un candidat existant (Brahimi) et l'adresse du propriétaire — jamais montrables telles quelles à un auditeur externe. Cette capture montre à la place une notification générée pour l'occasion vers un domaine de test réservé (`example.test`, RFC 2606, non délivrable, jamais une vraie personne), qui démontre en prime le mécanisme de sécurité `EMAIL_MODE=allowlist` lui-même.

---

## 27 — Communications et actions sur un compte

**Capture :** `27-user-communication.png`

**Ce que l'auditeur voit :** Section « Communications » d'une fiche candidat (« Historique complet — jamais le contenu de l'email, uniquement le statut de livraison »), section « Actions » (envoyer lien de réinitialisation, suspendre, archiver), et un encadré « Suppression définitive impossible » listant les raisons exactes du blocage (historique d'examen, affectation active, présence en session de familiarisation, action journalisée).

**Ce que dit le propriétaire :** « Un compte avec un historique réel ne peut jamais être supprimé définitivement — seulement archivé. Le blocage donne la raison exacte, jamais un refus générique. »

**Point de conformité technique :** Suppression définitive bloquée au niveau serveur dès qu'un historique existe (examen, affectation, session, journal d'audit) — l'archivage reste la seule option, préservant la traçabilité.

**Ce qu'il ne faut pas prétendre :** —

---

## 28 — Journal d'audit

**Capture :** `28-audit-log.png`

**Ce que l'auditeur voit :** Un panneau de filtres (Du/Au, Acteur, Rôle, Action, recherche libre) au-dessus du journal d'audit (« 300 événement(s) — Insert-only — aucune modification possible, même par un administrateur ») : horodatage, acteur, rôle, action, cible, résultat pour chaque événement (connexions, créations de compte, envois d'invitation, démarrages de tentative, affectations d'examen). Le filtre Action ne propose que des valeurs réellement observées dans le journal — jamais une liste inventée.

**Ce que dit le propriétaire :** « Chaque action significative est journalisée de façon irréversible — même un administrateur ne peut pas modifier ou supprimer une entrée du journal. Le journal est maintenant filtrable par date, acteur, rôle et type d'action — un auditeur peut isoler précisément ce qu'il cherche sans avoir à parcourir des centaines de lignes. »

**Point de conformité technique :** Journal insert-only au niveau base de données — pas seulement une convention applicative. Les filtres (`lib/audit.ts::listAuditLogsFiltered`) n'ajoutent que des clauses `WHERE` en lecture ; aucune route de modification/suppression n'existe pour cette table.

**Ce qu'il ne faut pas prétendre :** —

---

## 29 — Sécurité du compte — MFA

**Capture :** `29-mfa-security.png`

**Ce que l'auditeur voit :** Page « Mon compte » d'un responsable pédagogique : section « Authentification à deux facteurs (MFA) » avec description du mécanisme (code TOTP à 6 chiffres, valable 30 secondes) et bouton « Activer MFA ».

**Ce que dit le propriétaire :** « Chaque compte à privilèges peut activer une authentification à deux facteurs standard TOTP, en plus du mot de passe. »

**Point de conformité technique :** MFA basé sur TOTP standard (compatible toute application d'authentification), pas un mécanisme propriétaire.

**Ce qu'il ne faut pas prétendre :** MFA n'est pas encore activé sur ce compte au moment de la capture — l'écran montre le point d'entrée de l'activation, pas une preuve d'activation universelle. Voir §41-44 de `docs/KOST_EEXAM_V2_LIVE_DEMO_CHECKLIST.md` pour la réinitialisation MFA administrateur.

---

## 30 — Rôle auditeur — accès en lecture seule

**Capture :** `30-auditor-role.png`

**Ce que l'auditeur voit :** Le même écran « Résultats » filtré que la capture §22, mais connecté avec un compte auditeur : navigation latérale explicitement intitulée « Conformité (lecture seule) », aucun bouton d'écriture visible.

**Ce que dit le propriétaire :** « Le rôle auditeur voit les mêmes données qu'un administrateur sur son périmètre, mais aucune action d'écriture n'est ni visible, ni possible. »

**Point de conformité technique :** Le rejet des actions d'écriture pour le rôle auditeur est appliqué côté serveur (pas seulement l'interface masquée) — une tentative d'action serveur directe est également rejetée.

**Ce qu'il ne faut pas prétendre :** —

> **Note de correction (2026-08-30, reconduite le 2026-08-31) :** même correctif que la capture §22 (filtrage groupe + examen démo précis) — jamais l'historique non filtré d'un candidat réel non démo.
>
> **Rafraîchi le 2026-08-31 :** même ajout que §22 — le filtre « Statut » n'apparaissait pas dans la version précédente.

---

## 31 — Isolation multi-tenant

**Capture :** `31-tenant-isolation.png`

**Ce que l'auditeur voit :** Liste « Clients » vue par l'auditeur : 6 tenants distincts (Air Algérie — DEMO, Air Algérie — PRODUCTION SIMULATION, Charge — Mesure dédiée, TEST DELIVERY — safe to delete, Tassili Airlines — DEMO, Vérification Auditeur — Isolée), chacun explicitement étiqueté par son scope (Démo/Test/Production).

**Ce que dit le propriétaire :** « L'auditeur, en tant que rôle transversal légitime, voit tous les tenants côte à côte — mais un responsable pédagogique d'un tenant ne voit jamais les données d'un autre tenant, ni en liste ni par URL devinée. »

**Point de conformité technique :** Isolation multi-tenant appliquée au niveau des requêtes serveur pour les rôles à périmètre restreint (responsable pédagogique) — le rôle auditeur a un accès global légitime et documenté, jamais une fuite entre tenants pour les autres rôles.

**Ce qu'il ne faut pas prétendre :** L'accès global de l'auditeur à tous les tenants est une propriété **du rôle auditeur spécifiquement** (lecture seule) — ne pas généraliser cette visibilité à un autre rôle.

> **Rafraîchi le 2026-08-31 :** la version précédente ne montrait aucun panneau de filtres (Recherche/Type) — ajouté depuis — et montrait à tort une carte « Nouveau client » pour l'auditeur. **Vérifié en direct sur staging que ce n'est plus le cas** (`canWrite = role !== "auditor"` dans le code actuel, confirmé par un test live avant toute conclusion) : capture obsolète, jamais une fuite RBAC réelle.

---

## 32 — Mode Aperçu candidat

**Capture :** `32-candidate-preview-mode.png`

**Ce que l'auditeur voit :** Écran `/apercu-candidat/[id]` ouvert depuis la fiche d'un examen publié : bannière permanente « MODE APERÇU — aucune action ne sera enregistrée dans l'historique du candidat », puis le même moteur d'examen que verrait un vrai candidat (chronomètre, navigateur de questions, progression) affiché en lecture/manipulation locale uniquement.

**Ce que dit le propriétaire :** « Un responsable peut vérifier exactement ce qu'un candidat va voir avant de publier ou de contacter quiconque — sans jamais créer une trace, un score ou une notification. »

**Point de conformité technique :** `PreviewRunner.tsx` est un composant volontairement SÉPARÉ du moteur réel (`ExamRunner.tsx`) — aucune Server Action n'y est importée (ni sauvegarde de réponse, ni soumission), donc structurellement incapable d'écrire dans `attempts`/`attempt_answers`/`results`, quel que soit un bug futur de garde applicative. Toute interaction reste un état React local, perdu au rafraîchissement.

**Ce qu'il ne faut pas prétendre :** Le chronomètre affiché en mode aperçu est purement illustratif (jamais décompté, jamais lié à un `expires_at` serveur réel) — ne jamais le présenter comme un décompte authentique.

> **Preuve ajoutée le 2026-08-31 :** absente du dossier original (fonctionnalité déjà présente dans le produit mais jamais capturée).

---

*Fin du dossier de référence — 33/33 captures documentées (31 numérotées + §10bis + §32). Voir `SCREENSHOT_INDEX.md` pour l'index tabulaire, `KOST_EEXAM_V2_DEMO_SHORT.md` pour la séquence de présentation live (≈25 minutes), `KOST_EEXAM_V2_DEMO_FULL.md` pour le parcours narratif complet, `RESPONSIVE_EVIDENCE.md` pour les preuves mobile/tablette.*
