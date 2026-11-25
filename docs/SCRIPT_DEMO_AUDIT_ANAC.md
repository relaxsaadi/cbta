# Script de démonstration — Audit ANAC du 26/08/2026

**Plateforme :** KOST E-EXAM (console : `console.kostacademy.com`) + Moodle (`exam.kostacademy.com`)
**Durée cible :** 15 à 20 minutes
**Préparé le :** 25/08/2026
**À dire en introduction, avant de commencer :**

> « Ce que je vais vous montrer aujourd'hui repose sur deux choses : la plateforme de production réelle — que vous allez voir fonctionner en direct, avec ses vraies données techniques — et un **parcours candidat de démonstration**, clairement isolé et marqué comme tel, pour ne pas vous faire passer un vrai examen réglementaire DGR. Je vous préciserai à chaque étape ce qui est réel et vérifié, ce qui est partiel, et ce qui reste à faire. »

**Rappels pour moi-même, à ne jamais oublier pendant l'audit :**
- Ne jamais dire que la plateforme est « accréditée par l'ANAC » — l'accord d'audit avec l'ANAC est **en cours**, pas finalisé. Seule l'accréditation IATA CBTA est signée et peut être présentée comme acquise.
- La checklist affichée dans la console est une **checklist technique KOST**, pas un document officiel ANAC — je le dis explicitement à l'écran 10.
- Seuls deux rôles de connexion existent réellement dans la console : **Administrateur** et **Auditeur**. Si l'auditeur demande à voir un rôle « instructeur » ou « exam manager », je réponds honnêtement : ces mots apparaissent dans le texte de certaines pages mais ne correspondent à aucun compte fonctionnel aujourd'hui — c'est un écart produit documenté, pas une fonctionnalité cachée.
- La banque de questions DGR réglementaire (Fonctions 7.1 à 7.10) est un travail de vérification en cours, **stocké en documents de travail**, pas encore chargée dans la banque de questions Moodle en production. Ne jamais laisser entendre que le contenu réglementaire complet est déjà en ligne.

---

## 1. Vue générale de la plateforme

- **Écran à ouvrir :** `console.kostacademy.com/login`, puis se connecter en administrateur, puis **Overview**.
- **Menu à cliquer :** aucun avant connexion ; après connexion, c'est la première page.
- **Ce que je dois montrer :** le tableau de bord général — nombre de candidats, d'examens terminés, taux de réussite, taille de la banque de questions ; le bandeau « PRODUCTION » en haut à droite ; le bouton « Presentation Mode ».
- **Ce que je dois dire :**
  > « Voici la console d'administration KOST E-EXAM. C'est un environnement de production réel — vous le voyez marqué « PRODUCTION » en haut. J'ai activé un mode « Presentation » qui masque automatiquement les noms, emails et adresses IP réels à l'écran, sans jamais modifier les données sous-jacentes — c'est pour vous montrer de vraies données tout en protégeant l'identité des candidats réels. »
- **Preuve apportée :** connexion réelle authentifiée contre Moodle (pas de base de comptes séparée) ; chiffres calculés en direct depuis la base de données.
- **Limites à mentionner honnêtement :**
  - Le widget « Recent Exam Activity » de cette page affiche encore un texte hérité (« Coming in Phase 2 ») alors que les examens sont bel et bien en ligne — c'est une étiquette de texte obsolète, pas un problème fonctionnel ; la preuve réelle est visible plus loin sur la page **Exams**.

---

## 2. Architecture et statut opérationnel

- **Écran à ouvrir :** menu **System**.
- **Ce que je dois montrer :** les tuiles d'infrastructure — HTTPS actif, base de données non exposée publiquement, serveur Ubuntu/Docker chez Hostarts (Algérie), espace disque disponible, statut des sauvegardes.
- **Ce que je dois dire :**
  > « La plateforme tourne sur un serveur dédié en Algérie, chez Hostarts, avec Docker : un conteneur pour Moodle, un pour la base de données MySQL, un pour cette console. Le certificat de sécurité HTTPS est valide sur les deux domaines, et la base de données n'est jamais accessible directement depuis internet — uniquement en interne. »
- **Preuve apportée :** vérifications techniques directes (poignée de main TLS en direct, ports réseau), pas une simple affirmation.
- **Limites à mentionner honnêtement :** le système d'exploitation du serveur (Ubuntu 20.04) a atteint sa fin de support standard ; une mise à niveau est recommandée à moyen terme mais n'est pas un blocage de sécurité immédiat (accès SSH par clé uniquement, pare-feu correctement configuré).

---

## 3. Parcours candidat (démonstration live)

- **Écran à ouvrir :** nouvel onglet de navigateur (de préférence en navigation privée) → `exam.kostacademy.com/login/index.php`.
- **Compte à utiliser :** `anac_demo_candidat` (voir identifiants remis séparément).
- **Ce que je dois montrer, dans l'ordre :**
  1. Connexion avec le compte candidat fictif.
  2. Le tableau de bord candidat : « ANAC AUDIT DEMO — Parcours Candidat & Instructeur » apparaît clairement comme un examen distinct, avec le bandeau **DÉMONSTRATION / AUDIT**.
  3. Ouvrir l'examen de démonstration : la page d'instructions **avant de commencer** (vérifiez votre identité, connexion stable, le chronomètre démarre dès le début, fermeture du navigateur déconseillée) et le texte du disclaimer.
  4. Démarrer la tentative → fenêtre de confirmation du chronomètre.
  5. Répondre à 1 ou 2 questions, montrer le chronomètre qui décompte en haut, montrer le bouton « Marquée » (flag) sur une question.
  6. Utiliser la navigation latérale pour sauter directement à la dernière question (pas besoin de répondre aux 6 en direct, question de temps).
  7. Cliquer « Terminer le test… » → page de résumé (« Réponse enregistrée » pour chaque question, icône de drapeau visible sur la question marquée).
  8. Cliquer « Tout envoyer et terminer » → fenêtre de confirmation finale.
  9. Confirmer → écran « Examen soumis avec succès », statut « Terminée », horodatage réel.
- **Ce que je dois dire :**
  > « Voici exactement ce que voit un candidat. Ce parcours utilise un compte et un examen de démonstration clairement séparés — vous voyez le bandeau qui l'indique partout. Toutes les mécaniques sont réelles : chronomètre, signalement de question, navigation libre, confirmation avant envoi définitif, protection contre la double soumission — une fois soumis, il n'y a plus moyen de revenir modifier les réponses. »
- **Preuve apportée :** tentative réelle enregistrée dans Moodle (base de données), avec horodatage de début et de fin réels ; visible immédiatement après côté administrateur (voir écran 7 — Résultats).
- **Limites à mentionner honnêtement :**
  - Ce test de démonstration ne contient **aucune question réglementaire DGR** — uniquement des questions génériques sur le fonctionnement de la plateforme.
  - Après soumission, ce quiz de démonstration ne réaffiche pas le score à l'écran candidat (« Relecture non autorisée ») — c'est le même comportement conservateur que l'examen réel ; le résultat est montré côté administrateur à l'écran 7, pas ici.
  - Le test de reconnexion après perte de connexion et l'incident technique en direct ne sont pas rejoués en live (trop long) — je peux dire : « la reprise de session après rafraîchissement de page a été testée et fonctionne : la tentative et le chronomètre sont conservés côté serveur » (évidence technique déjà vérifiée, pas rejouée devant vous aujourd'hui).

---

## 4. Parcours instructeur / administrateur

**Rappel important à dire à voix haute avant cet écran :**
> « Je vais vous montrer ce qu'un administrateur fait réellement. La page de connexion mentionne aussi des rôles « exam manager » et « instructeur » — je suis transparent avec vous : ces rôles ne sont **pas encore fonctionnels** aujourd'hui, seuls **administrateur** et **auditeur** existent réellement et sont testés. C'est un écart produit documenté, pas quelque chose que je vous cache. »

- **Écran à ouvrir :** menu **Exam Preparation**, puis **Identity Verification**.
- **Ce que je dois montrer :**
  1. **Exam Preparation** : les paramètres réels de l'examen de démonstration — durée (10 min), nombre de tentatives (illimité pour la démo, 1 pour un vrai examen), fenêtre d'ouverture/fermeture, mélange des réponses.
  2. **Identity Verification** : le formulaire d'enregistrement d'une vérification d'identité, et l'historique (avec le mode Presentation actif, les noms réels apparaissent en initiales).
  3. *(Optionnel, si le temps le permet)* Enregistrer en direct une nouvelle vérification pour le candidat démo — remplir Candidat / Nom complet / Examen / Session, cliquer « Record verification », montrer que l'entrée apparaît immédiatement et ne peut plus être modifiée ensuite.
- **Ce que je dois dire :**
  > « Avant qu'un candidat commence, un surveillant vérifie son identité contre une pièce officielle et son compte Moodle — aucune copie de la pièce n'est stockée, uniquement l'enregistrement de la vérification elle-même, horodaté et non modifiable après coup. »
- **Preuve apportée :** table dédiée en base de données, écriture en append-only (pas d'UPDATE/DELETE possible), déjà utilisée pour de vraies vérifications antérieures.
- **Limites à mentionner honnêtement :**
  - La création/modification/suppression d'un examen se fait aujourd'hui **directement dans Moodle** par l'équipe technique KOST, pas depuis un bouton de cette console — c'est un choix d'architecture volontaire (Moodle reste la source de vérité), pas un manque. Une tentative de test automatisé de ce cycle complet a rencontré un bug connu de Moodle 5.0.1 lui-même (non lié à KOST) ; ce point est donc classé « Partiel » en toute transparence dans la checklist (écran 9).

---

## 5. Sessions

- **Écran à ouvrir :** menu **Sessions**.
- **Ce que je dois montrer :** les fenêtres d'ouverture/fermeture des examens réels et de démonstration, avec les compteurs de tentatives en direct.
- **Ce que je dois dire :**
  > « Cette page dérive directement des fenêtres d'ouverture/fermeture configurées dans Moodle pour chaque examen — ce ne sont pas des données saisies séparément, donc pas de risque de désynchronisation. »
- **Preuve apportée :** lecture en direct depuis Moodle (mêmes données que l'écran Exams).
- **Limites à mentionner honnêtement :** il n'existe pas encore de calendrier de planification dédié pour créer une nouvelle session depuis la console elle-même — la planification se fait en configurant la fenêtre d'ouverture/fermeture du quiz dans Moodle.

---

## 6. Monitoring

- **Écran à ouvrir :** revenir sur **Sessions** puis **Results** (il n'existe pas de page nommée « Monitoring » séparée — je le dis clairement plutôt que d'improviser).
- **Ce que je dois dire :**
  > « Il n'y a pas de module appelé « Monitoring » à part entière aujourd'hui — le suivi d'une tentative en cours se fait via les compteurs en direct de la page Sessions, et l'état exact de chaque tentative (en cours / terminée) est visible en temps réel sur la page Résultats, que je vous montre maintenant. »
- **Preuve apportée :** les compteurs sont recalculés à chaque chargement de page depuis la base de données réelle — ce n'est pas un instantané figé.
- **Limites à mentionner honnêtement :** pas de tableau de bord de supervision live multi-candidats en temps réel (type liste des candidats actuellement en train de composer) — seulement l'état par tentative individuelle.

---

## 7. Résultats

- **Écran à ouvrir :** menu **Results**.
- **Ce que je dois montrer :** la tentative du candidat démo tout en haut de la liste — grade 100/100, résultat « Pass », statut « Completed », durée réelle (~1 min 24 s) — juste après le passage à l'écran 3.
- **Ce que je dois dire :**
  > « Voici exactement la tentative que je viens de faire devant vous il y a un instant, avec sa note réelle, calculée uniquement par Moodle — jamais recalculée par cette console. »
- **Preuve apportée :** note lue directement depuis `mdl_grade_grades` (le carnet de notes officiel de Moodle), pas une valeur stockée séparément.
- **Limites à mentionner honnêtement :** aucun flux de validation manuelle séparé pour les questions à correction automatique (QCM/Vrai-Faux) — Moodle considère une tentative « terminée » comme définitive dès la soumission, ce qui est cohérent tant qu'il n'y a pas de question à correction manuelle (rédaction libre) dans l'examen réel.

---

## 8. Rapports

- **Écran à ouvrir :** menu **Reports**.
- **Ce que je dois montrer :** taux de réussite agrégé, score moyen, temps moyen de complétion, filtre par Fonction DGR.
- **Ce que je dois dire :**
  > « Ces chiffres agrégés sont recalculés en direct à partir des mêmes tentatives réelles que la page Résultats — aucune donnée fictive de production n'est utilisée ici. »
- **Preuve apportée :** mêmes sources de données que Results, agrégées.
- **Limites à mentionner honnêtement :** le filtre par Fonction DGR ne peut être pertinent qu'une fois de vraies questions réglementaires taguées par fonction chargées en production — actuellement le contenu réel du bank est encore en préparation (voir écran 9, Question Bank).

---

## 9. Audit & Compliance

- **Écran à ouvrir :** menu **Audit & Compliance**.
- **Ce que je dois montrer :** le bandeau de synthèse (30 exigences suivies, ~26 Vérifiées / ~4 Partielles / 0 Non configurées à la date de préparation de ce document — les chiffres exacts peuvent varier légèrement d'ici demain car ils sont recalculés en direct) ; le Centre de preuves (cartes cliquables) ; le détail par catégorie plus bas sur la page.
- **Ce que je dois dire :**
  > « C'est la page centrale de conformité technique. Chaque ligne est reliée à une preuve technique vérifiable, pas à une simple case cochée. Le texte en haut le précise : « aucun statut n'est jamais affiché comme Vérifié sans une source réellement contrôlée ». Pour chaque exigence « Partielle », la raison exacte est écrite noir sur blanc, avec ce qu'il reste à faire. »
- **Preuve apportée :** chaque carte/ligne est reliée à une requête en direct sur la base de données réelle, un test Playwright réel, ou un document versionné réel (jamais une valeur codée en dur affichée comme vraie).
- **Limites à mentionner honnêtement (dire clairement les 4 « Partiel ») :**
  1. **Compatibilité OS** : testé sur macOS et Linux uniquement, pas de test sur Windows natif.
  2. **Contenu réglementaire de la banque de questions** : seules des questions d'exemple/démonstration existent aujourd'hui dans Moodle ; le contenu réglementaire DGR officiel (Fonctions 7.1 à 7.10) est en cours de vérification source par source dans un processus séparé, pas encore chargé en production.
  3. **Cycle de vie complet d'un examen (créer/modifier/supprimer)** : les examens sont créés directement dans Moodle par l'équipe KOST (réel), mais une démonstration automatisée de bout en bout de ce cycle a buté sur un bug confirmé de Moodle 5.0.1 lui-même — honnêtement documenté, pas contourné par un raccourci non fiable.
  4. **Accord d'audit ANAC** : en cours de discussion avec l'ANAC, pas encore formalisé dans ce système — c'est un point contractuel externe, pas technique.

---

## 10. ANAC Checklist

- **Écran à ouvrir :** menu **ANAC Checklist**.
- **Ce que je dois montrer :** le bandeau d'avertissement en haut de page, puis le tableau « Exigence ANAC (zone d'audit) → Contrôle KOST correspondant → Statut → Preuve → Écart ».
- **Ce que je dois dire, mot pour mot :**
  > « Je tiens à être très clair sur ce tableau : ce n'est **pas un document officiel de l'ANAC**. Aucun document ANAC ligne par ligne ne nous a été fourni à ce jour. C'est une **checklist KOST de préparation à l'audit et de conformité technique**, construite pour couvrir les grandes catégories d'audit habituelles — sécurité, accessibilité, banque de questions, gestion des examens, performance, rapports, conformité réglementaire, formation, retour d'expérience. Si vous avez un document ANAC officiel à nous transmettre, nous pourrons revérifier ce tableau ligne par ligne contre celui-ci. »
- **Preuve apportée :** table imprimable/exportable en PDF (bouton « Print / Export PDF » en haut à droite) — utile si l'auditeur souhaite une copie papier.
- **Limites à mentionner honnêtement :** ce tableau ne remplace pas un audit ANAC formel — c'est un outil de préparation interne.

---

## 11. Evidence Pack

- **Écran à ouvrir :** menu **Evidence Pack**.
- **Ce que je dois montrer :** les groupes de preuves techniques (TLS, sauvegardes, test de restauration, réplication hors-site, charge, rôles, banque de questions, etc.), chacun relié à la même source que les écrans précédents.
- **Ce que je dois dire :**
  > « Ceci est un condensé imprimable de toutes les preuves techniques, dans un format pensé pour être remis à un auditeur — sans jamais inclure de mot de passe, de jeton d'accès, de clé privée, ou de donnée personnelle brute. »
- **Preuve apportée :** exactement les mêmes données sources que Audit & Compliance — aucune preuve reformulée avec une valeur différente.
- **Limites à mentionner honnêtement :** aucune — ce document est délibérément un simple export des preuves déjà montrées, pas une nouvelle affirmation.

---

## 12. Sécurité

- **Écran à ouvrir :** menu **Security Procedure**.
- **Ce que je dois montrer :** la procédure de réponse aux incidents de sécurité (version 1.0, datée), les niveaux de gravité, les rôles impliqués (par fonction, pas par nom de personne), la checklist de préservation des preuves.
- **Ce que je dois dire :**
  > « Nous avons une procédure écrite et versionnée pour réagir à un incident de sécurité, accessible à tous les rôles de la console. Par ailleurs, le trafic est chiffré de bout en bout (HTTPS/TLS), la base de données n'est jamais exposée publiquement, l'accès serveur se fait uniquement par clé SSH, et les cookies de session sont configurés selon les bonnes pratiques (HttpOnly, Secure, SameSite strict). »
- **Preuve apportée :** document versionné réel + vérifications réseau/TLS déjà montrées à l'écran 2.
- **Limites à mentionner honnêtement :** l'existence de cette procédure documente la façon de réagir — elle ne garantit pas à elle seule l'absence de toute vulnérabilité ; un point mineur d'accessibilité (contraste de couleur sur deux écrans) reste identifié et non corrigé à ce jour, sans impact sur la sécurité des données.

---

## 13. Journaux d'audit

- **Écran à ouvrir :** menu **Audit & Compliance → Audit Logs**, ou directement **Audit Logs** si présent dans le menu.
- **Ce que je dois montrer :** le nombre total d'événements journalisés (plusieurs milliers), avec filtre par utilisateur / action / composant / adresse IP.
- **Ce que je dois dire :**
  > « Chaque action sur Moodle est journalisée nativement — connexions, tentatives, modifications administratives — de façon continue, et cette console les affiche en lecture seule uniquement : elle ne peut jamais modifier ce journal. »
- **Preuve apportée :** journal natif Moodle (`mdl_logstore_standard_log`), alimenté en continu, non modifiable depuis la console.
- **Limites à mentionner honnêtement :** les actions propres à la console elle-même (vérifications d'identité, incidents, retours d'expérience) sont journalisées dans des tables séparées, propres à la console, pas dans le même journal Moodle — les deux sources sont réelles mais distinctes.

---

## 14. Sauvegardes

- **Écran à ouvrir :** revenir sur **System** ou **Audit & Compliance** (carte « Backups » / « Off-site Replication »).
- **Ce que je dois montrer :** la date de la dernière sauvegarde locale réussie, la date de la dernière copie hors-site vérifiée.
- **Ce que je dois dire :**
  > « Une sauvegarde automatique complète (base de données, contenu des cours, code, configuration) tourne chaque nuit, avec une copie chiffrée répliquée hors du serveur. La dernière sauvegarde et sa copie hors-site ont toutes deux réussi ce matin. »
- **Preuve apportée :** journal de sauvegarde horodaté, avec sommes de contrôle (checksums), consultable sur le serveur.
- **Limites à mentionner honnêtement :** la copie hors-site dépend d'une connexion réseau (Tailscale) vers un ordinateur du propriétaire de KOST Academy qui doit rester allumé et connecté — ce n'est pas un stockage cloud indépendant. C'est un point opérationnel à surveiller, pas un défaut de conception (la sauvegarde locale elle-même n'est jamais compromise si cette copie hors-site est temporairement indisponible).

---

## 15. Test de restauration

- **Écran à ouvrir :** rester sur **System** / **Audit & Compliance** (carte « Restore Test »).
- **Ce que je dois montrer :** le résultat du dernier test de restauration, avec la date **du jour même** de la préparation de cette démonstration.
- **Ce que je dois dire :**
  > « Nous ne nous contentons pas de sauvegarder : nous testons régulièrement la restauration elle-même, dans un environnement isolé et jetable, séparé de la production. Le dernier test, exécuté aujourd'hui, a restauré 491 tables sur 491 et 9 comptes utilisateurs, avec l'archive de contenu des cours vérifiée intègre. »
- **Preuve apportée :** test réel exécuté dans un conteneur temporaire isolé (jamais connecté au réseau ou aux volumes de production), supprimé automatiquement après le test.
- **Limites à mentionner honnêtement :** je présente le résultat déjà obtenu aujourd'hui plutôt que de relancer la commande en direct devant vous — la procédure existe et est documentée si vous souhaitez qu'elle soit rejouée sous vos yeux à un autre moment, avec un délai d'environ une minute d'exécution.

---

## Clôture

> « Pour résumer : la plateforme fonctionne réellement, les rôles administrateur et auditeur sont testés et fonctionnels, les sauvegardes et la restauration sont vérifiées, et chaque affirmation de conformité que je vous ai montrée est reliée à une preuve technique consultable — pas à une simple déclaration. Les points encore ouverts (contenu réglementaire complet, rôles instructeur/exam manager, accord formel avec l'ANAC) sont documentés honnêtement dans la checklist elle-même, avec ce qu'il reste à faire. »

**Ne pas oublier de proposer :** remettre à l'auditeur l'export PDF de l'ANAC Checklist et/ou de l'Evidence Pack (bouton « Print / Export PDF » sur chaque page), si souhaité.
