# KOST E-EXAM V2 — Plan de bascule production

**Statut : PLAN UNIQUEMENT — RIEN CI-DESSOUS N'A ÉTÉ EXÉCUTÉ.**

Ce document décrit COMMENT la bascule serait exécutée le jour venu. Il ne
constitue ni une autorisation, ni une exécution. Mission §55 : même si le
rapport de readiness conclut à un GO technique, aucune étape ci-dessous ne
sera exécutée sans une demande explicite, séparée, du propriétaire de la
plateforme — la bascule finale reste la seule action irréversible/visible
de l'extérieur nécessitant une autorisation explicite.

Voir `docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md` pour l'état
technique détaillé au moment de la rédaction de ce plan.

---

## 1. Périmètre de la bascule

| Élément | Aujourd'hui (V1) | Après bascule (V2) |
|---|---|---|
| Domaine candidat/staff | `exam.kostacademy.com` (Moodle) | `exam.kostacademy.com` (V2 natif) |
| Domaine console séparée | `console.kostacademy.com` (app Next.js V1, lit Moodle) | fusionné dans V2 — plus de console séparée |
| Backend | Moodle (PHP/MySQL) | Next.js 16 + node:sqlite, aucune dépendance Moodle |
| Staging V2 (actuel) | — | `staging.kostacademy.com` (inchangé, reste l'environnement de test après bascule) |

## 2. Pré-requis GO — doivent tous être vrais avant de déclencher ce plan

1. `docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md` conclut **PRODUCTION CUTOVER: GO**, sans blocage humain/réglementaire actif de type bloquant (voir sa section D pour la liste exacte des blocages restants et leur nature).
2. Une revue humaine qualifiée du contenu réglementaire réel (au minimum Fonction 7.1, idéalement toutes les fonctions migrées) a formellement fait passer le statut de FROZEN/SOURCE VERIFIED à APPROVED pour au moins les fonctions qui seront utilisées en premier en production (mission §47 — jamais fait automatiquement).
3. Décision explicite du propriétaire sur MFA obligatoire pour les comptes administrateur (actuellement disponible, pas forcé — voir §14 du rapport).
4. Décision explicite du propriétaire sur la copie de sauvegarde chiffrée hors site (actuellement MISSING — dépend du choix d'hébergement final).
5. Autorisation explicite, séparée, de procéder à CETTE bascule précise (mission §55).

## 3. Sauvegarde pré-bascule (les deux systèmes)

1. **V1 (Moodle)** — déclencher manuellement `/root/backups/scripts/backup.sh` (dump MySQL + moodledata + config), vérifier le fichier produit et son `sha256`, copier hors du serveur de production avant de continuer.
2. **V2** — `docker exec kost-eexam-v2 node_modules/.bin/tsx scripts/backup.ts`, vérifier `/system` (statut "Réussie"), copier `data/backups/*.db` le plus récent hors du serveur.
3. Ne PAS continuer si l'une des deux sauvegardes échoue.

## 4. Migration des comptes/contenu

- **Comptes candidats/responsables/administrateurs réels** — export depuis Moodle/console V1 (identifiants, rôles, appartenance société/groupe), import contrôlé dans V2 via un script dédié (à écrire à ce moment — aucun script de migration de comptes réels n'existe aujourd'hui, seul l'import CSV candidat par candidat/groupe existe côté V2, suffisant pour un import manuel mais pas encore automatisé pour un volume de production complet). **Ne jamais réutiliser un mot de passe existant tel quel** — réinitialisation forcée ou lien d'activation à la première connexion, à décider.
- **Contenu réel DGR** — déjà migré function par function dans V2 pour les items FROZEN/SOURCE VERIFIED récupérables (92/97, voir §3bis du gap analysis) — vérifier qu'aucune régression n'a eu lieu entre cette rédaction et la bascule (re-comparer les comptes par fonction).
- **Historique des résultats/tentatives V1** — décision à prendre : rester consultable uniquement dans V1 (lecture seule, archivé), ou migré dans V2 pour continuité candidat. Aucune décision prise à ce jour — à trancher avant la bascule.

## 5. Domaine cible et TLS

1. Nouveau certificat Let's Encrypt pour `exam.kostacademy.com` pointant vers le conteneur V2 (`kost-eexam-v2`, port interne 3000) — même mécanisme `certbot` déjà en place et prouvé sur `staging.kostacademy.com`.
2. Nouveau vhost nginx (`deploy/nginx-v2-vhost.conf.example` adapté) pour `exam.kostacademy.com`.
3. **DNS** — pointer `exam.kostacademy.com` vers le même serveur (déjà le cas si c'est le même hébergeur que Moodle) ou vers la nouvelle cible si l'hébergement change (non tranché — voir §8 du rapport de readiness).
4. `console.kostacademy.com` — à décider : rediriger vers `exam.kostacademy.com` (V2 a fusionné les deux), ou laisser en lecture seule temporairement pour consultation de l'historique V1.

## 6. Fenêtre de maintenance

- **Recommandé** : hors heures d'examen actives, avec préavis aux clients/candidats connus.
- Activer le mode maintenance V1 si disponible (empêche de nouvelles connexions Moodle pendant la bascule) — sinon, coordonner par communication directe.
- Durée estimée : 30–60 min (DNS/TLS + vérifications de fumée), en excluant la migration de comptes/contenu qui doit être terminée et vérifiée AVANT ce créneau, pas pendant.

## 7. Tests de fumée post-bascule (obligatoires avant de considérer la bascule terminée)

1. `https://exam.kostacademy.com/login` répond, TLS valide, en-têtes de sécurité présents (mêmes vérifications que §11/§11bis du gap analysis, refaites sur le nouveau domaine).
2. Connexion réussie pour un compte de chaque rôle (administrateur, responsable, candidat, auditeur).
3. Un candidat réel peut démarrer un examen réel, répondre, se faire chronométrer, soumettre — résultat noté correctement.
4. Un rapport PDF individuel + CSV se téléchargent réellement (pas seulement un 200 vide).
5. `/api/health` répond `"status":"healthy"`.
6. Sauvegarde manuelle immédiate après bascule (RPO ne doit jamais dépendre uniquement du cron 2h du matin pour le tout premier jour).
7. V1 (`console.kostacademy.com` s'il reste actif, ou toute autre dépendance résiduelle) toujours fonctionnel si non désactivé intentionnellement.

## 8. Stratégie DNS et rollback

- **TTL DNS** — abaisser le TTL du enregistrement `exam.kostacademy.com` (ex. 300s) au moins 24h AVANT la bascule, pour permettre un rollback rapide si besoin.
- **Rollback** — remettre l'enregistrement DNS sur l'IP/la configuration précédente (V1). Aucune donnée V1 n'aura été modifiée par la bascule (migration = copie, jamais une suppression de V1) — un rollback DNS seul suffit à revenir à V1 tel quel.
- **Délai de rollback** — décision à prendre AVANT la bascule, pas pendant : combien de temps après la bascule un rollback reste-t-il la réponse par défaut à un problème sérieux (ex. 4h, 24h) plutôt qu'un correctif en avant ("roll forward").
- **Critères d'abandon (abort criteria)** — déclencher un rollback immédiat si : taux d'erreur applicatif anormal sur `/api/health` ou les journaux, un candidat perd une tentative en cours de façon non récupérable, une fuite de données cross-tenant est détectée, ou toute régression touchant l'intégrité de la notation.

## 9. Monitoring post-bascule

- `deploy/monitor.sh` (déjà réel sur staging) à installer identiquement sur la cible production dès la bascule — pas après.
- Surveillance renforcée les premières 48h : vérification manuelle de `/system` et `/var/log/kost-eexam-v2-alerts.log` au moins 2×/jour (le monitoring actuel journalise mais ne pousse pas de notification active — voir §12 du gap analysis).
- Premier test de restauration réel sur les données de PRODUCTION (pas seulement staging) dans la semaine suivant la bascule.

## 10. Ce que ce plan ne tranche PAS (décisions du propriétaire, pas de ce document)

- Hébergement final (rester sur le serveur actuel vs migrer) — impacte directement §5 et §8 ci-dessus.
- MFA obligatoire pour tous les administrateurs avant ou après la bascule.
- Sort de `console.kostacademy.com` (fusion complète vs redirection vs conservation temporaire lecture seule).
- Sort de l'historique de résultats V1 (migré vs archivé séparément).
- Copie de sauvegarde chiffrée hors site — outil/emplacement à choisir.
- Canal d'alerte actif (e-mail/SMS/Slack) pour le monitoring — actuellement journalisation seule.

---

**Rappel final (mission §55)** : la validation de ce plan par lecture ne
constitue pas une autorisation de l'exécuter. Chaque étape ci-dessus reste
à exécuter uniquement sur demande explicite et séparée, jamais en
conséquence automatique d'un rapport de readiness favorable.
