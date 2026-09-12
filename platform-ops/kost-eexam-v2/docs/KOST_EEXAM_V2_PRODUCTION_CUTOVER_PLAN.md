# KOST E-EXAM V2 — Plan de bascule production

**Statut : PLAN UNIQUEMENT — RIEN CI-DESSOUS N'A ÉTÉ EXÉCUTÉ.**

> [!CAUTION]
> Le rapport `docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md` du **2026-08-28** est un **snapshot historique superseded**. Il ne peut plus, à lui seul, satisfaire un pré-requis GO. Toute bascule doit se fonder sur un **head reconcilié actuel**, le snapshot courant des blockers, et des preuves d'exécution fraîches rattachées à ce même SHA.

Ce document décrit COMMENT la bascule serait exécutée le jour venu. Il ne
constitue ni une autorisation, ni une exécution. Mission §55 : aucune étape
ci-dessous ne sera exécutée sans une demande explicite, séparée, du propriétaire
de la plateforme — la bascule finale reste la seule action irréversible/visible
de l'extérieur nécessitant une autorisation explicite.

Voir `docs/KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md` uniquement pour son
**snapshot historique daté du 2026-08-28**. Pour un GO/NO-GO actuel, utiliser
la dernière réconciliation des blockers et les preuves CI/runtime du même head.

---

## 1. Périmètre de la bascule

| Élément | Aujourd'hui (V1) | Après bascule (V2) |
|---|---|---|
| Domaine candidat/staff | `exam.kostacademy.com` (Moodle) | `exam.kostacademy.com` (V2 natif) |
| Domaine console séparée | `console.kostacademy.com` (app Next.js V1, lit Moodle) | fusionné dans V2 — plus de console séparée |
| Backend | Moodle (PHP/MySQL) | Next.js 16 + node:sqlite, aucune dépendance Moodle |
| Staging V2 (actuel) | — | `staging.kostacademy.com` (inchangé, reste l'environnement de test après bascule) |

## 2. Pré-requis GO — doivent tous être vrais avant de déclencher ce plan

1. **Head technique reconcilié et actuel** : identifier un SHA unique de la branche candidate, vérifier le registre des blockers contre ce SHA et fermer tous les blockers critiques techniques, sécurité et intégrité des données avec leur propre preuve d'implémentation/test. Le snapshot historique `KOST_EEXAM_V2_PRODUCTION_READINESS_REPORT.md` du 2026-08-28 ne satisfait pas ce pré-requis.
2. **Preuves fraîches sur ce même SHA** : build production, typecheck, tests unitaires, E2E candidat/staff/auditeur, preuves proxy/rate-limit/concurrency pertinentes, sauvegarde + restore drill, et tout autre gate critique applicable doivent être rerun et rattachés au head candidat. Un nouveau rapport de readiness doit citer sa date, ce SHA et le snapshot des blockers utilisé.
3. Une revue humaine qualifiée du contenu réglementaire réel a formellement validé **uniquement les fonctions effectivement destinées à la production**, avec preuves directes IATA DGR 67e édition 2026 Tier-A, états SOURCE GAP/CONFLICT explicites, vérification FR, revue EN séparée et reviewer humain qualifié nommé + date avant tout `APPROVED`. Aucun GO technique ne peut promouvoir automatiquement une question ni constituer une approbation ANAC/IATA.
4. Décision explicite du propriétaire sur MFA obligatoire pour les comptes administrateur (actuellement disponible, pas forcé).
5. **Copie de sauvegarde chiffrée hors site configurée et restore drill démontré depuis cette copie indépendante** ; la seule sauvegarde locale/same-host ne suffit pas pour la bascule.
6. Autorisation explicite, séparée, de procéder à CETTE bascule précise (mission §55).

## 3. Sauvegarde pré-bascule (les deux systèmes)

1. **V1 (Moodle)** — déclencher manuellement `/root/backups/scripts/backup.sh` (dump MySQL + moodledata + config), vérifier le fichier produit et son `sha256`, copier hors du serveur de production avant de continuer.
2. **V2** — `docker exec kost-eexam-v2 node_modules/.bin/tsx scripts/backup.ts`, vérifier `/system` (statut "Réussie"), copier `data/backups/*.db` le plus récent hors du serveur.
3. Ne PAS continuer si l'une des deux sauvegardes échoue.

## 4. Migration des comptes/contenu

- **Comptes candidats/responsables/administrateurs réels** — export depuis Moodle/console V1 (identifiants, rôles, appartenance société/groupe), import contrôlé dans V2 via un script dédié (à écrire à ce moment — aucun script de migration de comptes réels n'existe aujourd'hui, seul l'import CSV candidat par candidat/groupe existe côté V2, suffisant pour un import manuel mais pas encore automatisé pour un volume de production complet). **Ne jamais réutiliser un mot de passe existant tel quel** — réinitialisation forcée ou lien d'activation à la première connexion, à décider.
- **Contenu réel DGR** — déjà migré function par function dans V2 pour les items FROZEN/SOURCE VERIFIED récupérables (92/97, voir §3bis du gap analysis) — vérifier qu'aucune régression n'a eu lieu entre cette rédaction et la bascule (re-comparer les comptes par fonction). Ces états historiques ne remplacent pas le gate réglementaire 7.1–7.10 décrit au §2.
- **Historique des résultats/tentatives V1** — décision à prendre : rester consultable uniquement dans V1 (lecture seule, archivé), ou migré dans V2 pour continuité candidat. Aucune décision prise à ce jour — à trancher avant la bascule.

## 5. Domaine cible et TLS

1. Nouveau certificat Let's Encrypt pour `exam.kostacademy.com` pointant vers le conteneur V2 (`kost-eexam-v2`, port interne 3000) — même mécanisme `certbot` déjà en place et prouvé sur `staging.kostacademy.com`.
2. Nouveau vhost nginx (`deploy/nginx-v2-vhost.conf.example` adapté) pour `exam.kostacademy.com`.
3. **DNS** — pointer `exam.kostacademy.com` vers le même serveur (déjà le cas si c'est le même hébergeur que Moodle) ou vers la nouvelle cible si l'hébergement change (non tranché).
4. `console.kostacademy.com` — à décider : rediriger vers `exam.kostacademy.com` (V2 a fusionné les deux), ou laisser en lecture seule temporairement pour consultation de l'historique V1.

## 6. Fenêtre de maintenance

- **Recommandé** : hors heures d'examen actives, avec préavis aux clients/candidats connus.
- Activer le mode maintenance V1 si disponible (empêche de nouvelles connexions Moodle pendant la bascule) — sinon, coordonner par communication directe.
- Durée estimée : 30–60 min (DNS/TLS + vérifications de fumée), en excluant la migration de comptes/contenu qui doit être terminée et vérifiée AVANT ce créneau, pas pendant.

## 7. Tests de fumée post-bascule (obligatoires avant de considérer la bascule terminée)

1. `https://exam.kostacademy.com/login` répond, TLS valide, en-têtes de sécurité présents.
2. Connexion réussie pour un compte de chaque rôle (administrateur, responsable, candidat, auditeur).
3. Un candidat réel peut démarrer un examen réel, répondre, se faire chronométrer, soumettre — résultat noté correctement.
4. Un rapport PDF individuel + CSV se téléchargent réellement (pas seulement un 200 vide).
5. `/api/health` répond `"status":"healthy"`.
6. Sauvegarde manuelle immédiate après bascule (RPO ne doit jamais dépendre uniquement du cron 2h du matin pour le tout premier jour).
7. V1 (`console.kostacademy.com` s'il reste actif, ou toute autre dépendance résiduelle) toujours fonctionnel si non désactivé intentionnellement.

> [!IMPORTANT]
> Le test candidat du point 3 crée déjà des écritures V2 (tentative, réponses, résultat et preuves d'audit). Dès qu'il est exécuté avec des données de production, la procédure est dans le régime **post-écriture V2** décrit au §8 : un simple retour DNS vers V1 n'est plus un rollback de données complet.

## 8. Stratégie DNS, frontière de divergence et rollback

- **TTL DNS** — abaisser le TTL du enregistrement `exam.kostacademy.com` (ex. 300s) au moins 24h AVANT la bascule, pour permettre de modifier rapidement le routage si besoin. Un TTL court ne constitue pas, à lui seul, une stratégie de rollback des données.
- **Frontière de cutover** — consigner explicitement l'heure et le checkpoint/sauvegarde vérifié immédiatement avant l'ouverture de V2 aux écritures de production. Cette frontière permet de distinguer un rollback sans divergence d'un rollback après divergence V1/V2.
- **Avant la première écriture V2** — si V2 est encore en maintenance/lecture seule et qu'aucune écriture de production n'a été acceptée, remettre le routage sur V1 peut suffire : V1 reste alors l'unique historique de production depuis la frontière.
- **Après la première écriture V2** — un changement DNS seul vers V1 est **interdit comme procédure normale de rollback**. V1 ne contient pas les nouvelles tentatives, réponses, résultats, audits, changements de compte/session, incidents ou autres écritures déjà commises dans V2. Revenir au routage V1 sans les réconcilier créerait deux historiques divergents et masquerait des données de production valides.
- **Procédure minimale post-écriture** — avant tout retour vers V1 : (1) arrêter/drainer les nouvelles écritures V2 ; (2) créer et vérifier une sauvegarde/checkpoint V2 ; (3) préserver la base et les preuves d'audit V2 intactes ; (4) identifier les écritures depuis la frontière de cutover ; (5) les réconcilier vers le datastore qui sera déclaré autoritatif au moyen d'une procédure testée, ou maintenir la plateforme en état fail-closed/maintenance jusqu'à résolution ; (6) rouvrir le trafic seulement lorsque l'intégrité/continuité est démontrée.
- **Aucun reverse-migration V2→V1 n'est actuellement démontré** — tant qu'un tel mécanisme n'existe pas et n'a pas été testé en environnement jetable, le défaut après une écriture V2 doit privilégier **roll-forward** ou maintenance fail-closed. Un retour d'urgence vers V1 qui abandonnerait la continuité des écritures V2 exige une décision explicite du propriétaire sur l'impact exact ; il ne doit jamais être présenté comme sans perte.
- **Délai de rollback** — le délai temporel seul ne décide pas si un retour V1 est sûr. Le critère déterminant est aussi l'existence ou non d'écritures V2 depuis la frontière. Définir avant la bascule les critères de roll-forward, maintenance et éventuel reverse-migration.
- **Critères d'abandon (abort criteria)** — en cas de taux d'erreur anormal, perte non récupérable de tentative, fuite cross-tenant ou régression de notation : bloquer/drainer d'abord les nouvelles écritures si cela peut être fait sans aggraver l'incident, préserver immédiatement l'état V2, puis appliquer le régime de rollback correspondant à la frontière de divergence. Ne pas masquer une divergence par un simple changement DNS.
- **Preuve obligatoire avant GO** — réaliser en environnement jetable deux drills distincts : (a) échec avant toute écriture V2, retour routage vers V1 sans divergence ; (b) échec après une tentative/résultat/audit V2 commis, démontrant que ces écritures restent préservées et que le datastore autoritatif final est explicite. Ce gate est suivi par le blocker GitHub de continuité cutover/DR.

## 9. Monitoring post-bascule

- `deploy/monitor.sh` (déjà réel sur staging) à installer identiquement sur la cible production dès la bascule — pas après.
- Surveillance renforcée les premières 48h : vérification manuelle de `/system` et `/var/log/kost-eexam-v2-alerts.log` au moins 2×/jour (le monitoring actuel journalise mais ne pousse pas de notification active).
- Premier test de restauration réel sur les données de PRODUCTION (pas seulement staging) dans la semaine suivant la bascule.

## 10. Ce que ce plan ne tranche PAS (décisions du propriétaire, pas de ce document)

- Hébergement final (rester sur le serveur actuel vs migrer) — impacte directement §5 et §8 ci-dessus.
- MFA obligatoire pour tous les administrateurs avant ou après la bascule.
- Sort de `console.kostacademy.com` (fusion complète vs redirection vs conservation temporaire lecture seule).
- Sort de l'historique de résultats V1 (migré vs archivé séparément).
- Fournisseur/emplacement de la copie de sauvegarde chiffrée hors site.
- Canal d'alerte actif (e-mail/SMS/Slack) pour le monitoring — actuellement journalisation seule.
- Procédure et outil éventuels de reverse-migration des écritures V2 vers V1 si un retour post-écriture devait être supporté ; rien de tel n'est démontré aujourd'hui.

---

**Rappel final (mission §55)** : la validation de ce plan par lecture ne
constitue pas une autorisation de l'exécuter. Chaque étape ci-dessus reste
à exécuter uniquement sur demande explicite et séparée, jamais en
conséquence automatique d'un rapport de readiness favorable.
