# KOST E-EXAM V2 — Dossier de re-revue auditeur

**Version gelée :** `kost-eexam-v2-auditor-review-2026-08-27`
**Commit :** `d365c1ea589e387b1ab993ea31a17b08fcaa118d`
**Déployé le :** 2026-08-27, 09:58:28 UTC
**URL :** https://staging.kostacademy.com

---

## 1. Objet

Ce document accompagne la version figée de KOST E-EXAM V2 soumise à re-revue
auditeur, après traitement complet de l'addendum auditeur (27 sections) et
des 3 lacunes d'autorisation identifiées lors de la revue précédente. Il
décrit ce qui est réellement implémenté, testé et déployé — rien de plus.

**Ceci est un environnement de STAGING, pas la production.** V1 (le système
existant sur `exam.kostacademy.com` / `console.kostacademy.com`) n'a jamais
été touché — vérifié après chaque déploiement de cette phase.

Ce document ne constitue **ni une approbation ANAC, ni une déclaration de
disponibilité pour la production**. Voir §17.

## 2. URL de staging

https://staging.kostacademy.com — base de données, secrets et conteneur
Docker isolés de V1 (exam./console.kostacademy.com), qui restent sur leur
propre stack inchangée.

## 3. Rôles

| Rôle | Identifiant de démonstration | Périmètre |
|---|---|---|
| Candidat | `candidat1.staging`, `candidat2.staging`, `candidat3.staging` | Ses propres tentatives/résultats uniquement |
| Responsable pédagogique | `responsable.staging` (Company A), `responsable-b.staging` (Company B) | Ses propres clients/groupes créés ou gérés |
| Administrateur | `admin.staging` | Accès global, actions plateforme réservées |
| Auditeur | `auditeur.staging` | Lecture globale, écriture impossible (appliqué serveur, pas seulement masqué à l'écran) |

Mots de passe fournis séparément, hors de ce document (jamais commités).

## 4. Workflow général

Entreprise → Groupe/Session → Candidats → Fonction DGR → Évaluation
(Exercice/Test/Examen) → Affectation (groupe entier / candidats sélectionnés
/ individuel) → Passage → Notation → Résultats → Rapports (écran + PDF/CSV) →
Familiarisation (avant l'examen, module séparé) → Incidents (au besoin,
tout au long).

## 5. Corrections apportées après l'audit

- **3 lacunes d'autorisation fermées** : `/incidents`, `/overview`, `/sessions`
  scopés au périmètre du responsable pédagogique (même mécanisme centralisé
  `lib/tenant-scope.ts`, jamais un second modèle d'autorisation).
- **Rejet explicite au lieu d'un filtrage silencieux** : affecter un examen à
  un candidat hors périmètre/hors groupe est maintenant refusé côté serveur,
  avec message clair (« Ce candidat n'appartient pas au groupe sélectionné
  ou n'est pas autorisé dans votre périmètre. ») et trace d'audit de la
  tentative refusée — aucune affectation partielle n'est jamais créée.
- **Métadonnées standard sur tous les documents PDF** : titre KOST E-EXAM,
  entreprise, groupe/session, fonction, identifiant examen, date/heure de
  génération, généré par qui, identifiant document/version, page X/Y,
  classification « Document interne KOST ».
- **Correction d'affichage** : une durée de tentative inférieure à une
  minute affiche désormais « < 1 min » au lieu de « 0 min » (trompeur),
  sur l'écran, le CSV et les PDF concernés.

## 6. Parcours candidat

Connexion → « Mes examens » (affectés par groupe ou individuellement) →
instructions → chronomètre serveur (indépendant du navigateur) → réponses →
soumission → « Mes résultats » (score/statut selon ce que l'examen autorise
à afficher, immédiat ou différé) → téléchargement PDF de son propre rapport
si activé.

## 7. Parcours responsable pédagogique

Créer client → créer groupe → ajouter candidats → créer évaluation
(vérification du nombre de questions admissibles avant de fixer les
paramètres) → publier (figeage définitif des questions à cet instant,
choix explicite du mode d'affectation) → suivre la progression → consulter
les résultats → générer les rapports.

## 8. Création d'examen

Type (Exercice/Test/Examen, chacun avec des réglages de tentatives et de
correction par défaut différents), fonction DGR, groupe, source des
questions (aléatoire parmi les questions admissibles), nombre de questions,
durée, seuil de réussite, mélange questions/réponses, visibilité du
résultat. Publication = figeage (versionnage) : éditer une question après
publication ne modifie jamais rétroactivement une tentative déjà passée.

## 9. Affectation groupe/fonction

À la publication, l'écran demande explicitement : **« À qui affecter cet
examen ? »** — Tout le groupe / Certains candidats du groupe / Un candidat
individuel. Après publication, des candidats supplémentaires du groupe
peuvent être affectés, et un candidat non commencé peut être retiré. Un
candidat hors groupe/périmètre est toujours rejeté (voir §5).

## 10. Résultats et détail question par question

Liste filtrable (client, groupe, fonction, examen, candidat, date,
réussite/échec). Détail d'une tentative : identité, tentative (début, fin,
durée avec correction « < 1 min »), résultat (score/100, pourcentage,
mention ADMIS/ÉCHEC), puis chaque question avec réponse candidat, réponse
correcte, correct/incorrect, points, et l'explication figée au moment de la
tentative (jamais la version courante de la question).

## 11. Rapports PDF/CSV

10 documents PDF réels, chacun avec le même socle de métadonnées standard
(§5), tous générés depuis les mêmes données authoritatives que l'écran
correspondant (jamais une valeur dupliquée/ressaisie) :

1. Rapport individuel — simple et détaillé
2. Rapport global de session (statistiques agrégées, avertissement si
   échantillon trop petit pour être représentatif)
3. Liste officielle des résultats (nominative, triée, zone de signature)
4. Procédure incident/cyberattaque/interruption de service
5. Guide candidat · 6. Guide responsable pédagogique · 7. Guide
   administrateur · 8. Guide auditeur · 9. Guide de session
10. Feuille de présence — familiarisation (zone de signature par candidat)

Export CSV résumé et détaillé, avec les mêmes filtres que l'écran
« Résultats » (client/groupe/fonction/examen/candidat/date/résultat).

## 12. Gestion des incidents

Déclaration (type, sévérité low/medium/high/critical, description, système
et personnes concernées, client/groupe ou « plateforme »). Fiche incident :
actions réelles tracées automatiquement (effet + entrée d'historique +
journal d'audit global), note d'investigation, preuve rattachée, mesure
corrective, clôture.

## 13. Actions de sécurité

Ciblées : suspendre/réactiver un compte, révoquer ses sessions, suspendre/
réouvrir un examen précis. Plateforme (administrateur uniquement) : mode
maintenance (bloque nouvelles connexions ET nouvelles tentatives en un
geste), blocage indépendant des nouvelles connexions, blocage indépendant
des nouvelles tentatives — l'administrateur reste toujours exempté du
blocage de connexion. **Continuité d'examen** : une tentative déjà en cours
n'est jamais interrompue par ces blocages, seul le démarrage d'une nouvelle
tentative est concerné.

## 14. Guides

5 guides (candidat, responsable pédagogique, administrateur, auditeur,
session), chacun consultable à l'écran ET téléchargeable en PDF depuis la
même source de contenu (jamais deux versions qui pourraient diverger). Le
guide de session est un guide de conduite opérationnelle (avant/pendant/
après une session réelle), pas un module supplémentaire.

## 15. Familiarisation

Module distinct des évaluations : déclarer une session (groupe, fonction,
date, lieu) crée automatiquement une ligne de présence pour chaque candidat
actuel du groupe (absent par défaut). Marquer présent/absent individuellement.
Historique de familiarisation tenu par candidat, visible sur la fiche de
chaque session. Feuille de présence PDF avec zone de signature propre à
chaque candidat.

## 16. Isolation multi-client (tenant isolation)

Un responsable pédagogique ne voit et n'affecte jamais rien d'un autre
client — vérifié en navigation normale, en manipulation d'URL directe
(réponse 404, jamais « accès refusé », pour ne pas confirmer l'existence
d'un identifiant deviné) et en appel serveur/API direct (paramètre forgé
sans effet, la restriction serveur s'applique toujours en ET). Administrateur
et auditeur conservent un accès global en lecture (auditeur) ou global
(administrateur), par conception.

## 17. Sauvegarde / restauration

Politique : RPO 24h, RTO 30 min, rétention 14 copies quotidiennes / 4
copies hebdomadaires. Sauvegarde complète et test de restauration exécutés
et réussis à plusieurs reprises sur cet environnement (dernière sauvegarde
réussie et dernier test de restauration réussi consultables sur l'écran
« Système »).

## 18. Limites connues

- **Staging uniquement** — aucun déploiement en production, aucune
  promotion au-dessus de V1.
- **Contenu réel limité** — 7 questions DGR Fonction 7.1 réelles
  (FROZEN_SOURCE_VERIFIED) importées à ce jour ; aucune importation
  supplémentaire effectuée pour cette revue, sur instruction explicite.
- **Suite de tests** — 29/29 tests unitaires passent ; les 69 scénarios
  E2E passent tous individuellement, ainsi qu'une vérification ciblée
  consolidée en 22 points (auditor-critical) en une seule passe continue.
  L'exécution répétée de la suite complète en rafale peut ponctuellement
  rencontrer un dépassement de délai lié à la charge du serveur de staging
  (jamais le même scénario deux fois de suite, jamais reproductible en
  isolation) — signalé ici en toute transparence plutôt que dissimulé.
- **Cosmétique** — aucune autre anomalie d'affichage connue au moment du
  gel.

## 19. Déclaration finale

Cette version est un **candidat de revue pour staging**, destiné à une
nouvelle relecture par l'auditeur. Elle ne constitue **pas** une approbation
ANAC, et ne doit **pas** être présentée comme « prête pour la production » —
ces deux affirmations resteront fausses tant qu'elles n'auront pas été
formellement établies par les parties compétentes.
