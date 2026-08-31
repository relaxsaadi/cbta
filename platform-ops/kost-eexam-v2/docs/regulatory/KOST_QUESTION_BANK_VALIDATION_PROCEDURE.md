# Procédure interne KOST — Validation de la banque de questions DGR

**Document interne KOST Academy** — décrit le processus de contrôle qualité
appliqué par KOST Academy à sa propre banque de questions DGR-CBTA dans
KOST E-EXAM V2.

**Ceci n'est ni une procédure ANAC, ni une procédure IATA, ni une procédure
d'approbation réglementaire.** C'est le mode opératoire interne KOST qui
précède et prépare toute revue/approbation externe éventuelle.

| | |
|---|---|
| Organisation | KOST Academy — Paris / Alger |
| Support | cbta@kostacademy.com |
| Plateforme couverte | KOST E-EXAM V2 (moteur d'examen natif) |
| Date | 31 août 2026 |
| Statut | Procédure interne en vigueur |

---

## 1. Objet

Cette procédure décrit, du brouillon à l'usage opérationnel, le cycle de
vie d'une question de la banque KOST E-EXAM V2 : comment une question est
créée, vérifiée par rapport à sa source réglementaire, contrôlée contre les
doublons, revue par un instructeur habilité, corrigée si nécessaire,
approuvée pour l'usage opérationnel, puis revue annuellement.

Elle s'applique à toute question destinée à un tirage de production
(Examen/Test réel), quelle que soit la fonction DGR (7.1 à 7.10) concernée.

## 2. Les trois statuts — jamais confondus

KOST E-EXAM V2 distingue explicitement **trois** statuts indépendants sur
chaque question. Les confondre serait la principale source d'erreur de ce
processus — cette section fait donc autorité pour toute communication
interne ou externe.

| Statut | Ce qu'il atteste | Ce qu'il **n'**atteste **pas** | Où il vit |
|---|---|---|---|
| **Statut source** (`source_status`) — ex. « CONFIRMÉ — SOURCE DGR VÉRIFIÉE » | Le texte réglementaire source (IATA DGR, édition en vigueur) a été directement consulté et transcrit. | Qu'un instructeur habilité l'a revue ; qu'ANAC/IATA l'a approuvée. | `questions.source_status` |
| **Statut reviewer** (`reviewer_status`) — PENDING / APPROVED / REJECTED | Une revue humaine a eu lieu **au moins une fois**, avec une décision. | Que cette revue a été refaite depuis ; ce n'est jamais un cycle récurrent. | `questions.reviewer_status` |
| **Revue annuelle** (`question_annual_reviews`, nouveau) — À revoir / Revue annuelle en cours / Revue annuelle terminée | Le **cycle annuel récurrent** exigé par l'auditeur : qui a revu, quand, sur quelle édition, avec quelle décision, quelle est la prochaine échéance. | Une approbation réglementaire externe. | table `question_annual_reviews`, une ligne par revue réellement menée |

Une question peut être « source vérifiée » et rester « à revoir » du point
de vue de la revue annuelle — les deux ne sont **jamais** additionnés en un
seul statut affiché.

**Aucun des trois statuts, ni leur combinaison, ne constitue une
approbation ANAC ou IATA de la plateforme ou du contenu.**

## 3. Cycle de vie d'une question

1. **Brouillon** (DRAFT).
2. **Vérification de la source réglementaire** — le texte IATA DGR de
   l'édition en vigueur est directement consulté, la référence est
   enregistrée dans `regulatory_reference` → `source_status =
   FROZEN_SOURCE_VERIFIED` (ou PARTIAL / STALE / SOURCE_GAP /
   SOURCE_CONFLICT si incomplet).
3. **Contrôle des doublons** (voir §4).
4. **Revue par un instructeur habilité** — décision `reviewer_status =
   APPROVED` ou `REJECTED` (voir §5).
5. **Correction si nécessaire** → nouvelle version (`question_versions`) ;
   jamais une modification rétroactive d'une version déjà publiée dans un
   examen (voir §6).
6. **Approbation pour usage opérationnel** — `reviewer_status = APPROVED`
   ET `source_status = FROZEN_SOURCE_VERIFIED` est la seule combinaison
   admissible à un tirage de production (voir
   `lib/questions.ts::isAdmissibleWhereClause`).
7. **Revue annuelle** (voir §7) — un cycle qui se répète chaque année,
   jamais un événement unique.
8. **Archive / historique de version** — `question_versions` +
   `question_annual_reviews` conservent tout ; rien n'est jamais supprimé,
   et le cycle reprend à l'étape 7 chaque nouvelle année.

## 4. Contrôle des doublons

Objectif : garantir **0 doublon réglementaire** dans la banque de
questions.

- Avant publication d'une nouvelle question, l'opérateur vérifie qu'aucune
  question existante ne couvre déjà exactement le même point réglementaire
  pour la même fonction DGR, en recherchant par référence réglementaire
  (`regulatory_reference`) et par mots-clés du texte (`/question-bank`,
  champ Recherche).
- **Une couverture croisée légitime** du même sujet réglementaire par
  plusieurs fonctions DGR (ex. une même règle testée sous un angle
  « acceptation fret » en Fonction 7.1 et sous un angle « formation
  personnel » en Fonction 7.4) n'est **jamais** traitée comme un doublon
  automatique — c'est une couverture pédagogique délibérée.
- Décompte de contrôle attendu : **0 doublon réglementaire** (vérifié par
  cette méthodologie, dernière vérification : voir
  `docs/KOST_EEXAM_V2_TIER_A_244_MIGRATION_REPORT.md` et les rapports
  d'audit associés).

**Étape répétable avant chaque publication de nouvelle question** :
1. Rechercher par référence réglementaire exacte dans `/question-bank`.
2. Rechercher par mots-clés du texte de la question.
3. Si une correspondance existe pour la **même** fonction DGR, vérifier
   qu'il ne s'agit pas d'une reformulation du même point — sinon fusionner
   ou retirer le doublon avant publication.
4. Documenter la vérification (aucune action supplémentaire requise si
   aucune correspondance trouvée — la recherche elle-même constitue la
   preuve de contrôle).

## 5. Revue par un instructeur habilité (revue initiale)

- Toute question destinée à un tirage de production doit avoir
  `reviewer_status = APPROVED`, posé par un opérateur autorisé
  (Responsable pédagogique ou Administrateur) sur `/question-bank`.
- Cette revue reste **ponctuelle** — elle atteste qu'une revue a eu lieu à
  un instant donné, jamais qu'elle se répète automatiquement.
- Une question `REJECTED` n'est **jamais** admissible à un tirage de
  production tant que le rejet n'est pas levé par une nouvelle décision.

## 6. Correction

- Toute correction de contenu crée une **nouvelle version**
  (`question_versions`, append-only) — jamais une modification de la
  version existante.
- Un examen déjà publié référence sa version exacte via
  `assessment_question_snapshots` — une correction ultérieure ne modifie
  **jamais** rétroactivement un examen déjà passé par un candidat.

## 7. Revue annuelle (cycle récurrent — exigence auditeur)

Distincte de la revue initiale (§5), cette revue se répète **chaque
année**, sur l'édition DGR alors en vigueur.

Pour chaque question, un opérateur autorisé (Responsable pédagogique ou
Administrateur) enregistre sur la fiche question
(`/question-bank/[id]/edit`, section « Revue annuelle ») :

| Champ | Description |
|---|---|
| Année applicable | Année du cycle de revue |
| Édition / manuel DGR applicable | Ex. « IATA DGR 67e édition 2026 + Addendum 1 » |
| Nom du réviseur | Instructeur habilité ayant réellement mené la revue |
| Qualification / rôle | Ex. « Instructeur DGR habilité IATA » |
| Date de revue | Date effective de la revue |
| Décision | À revoir / Revue annuelle en cours / Revue annuelle terminée |
| Prochaine échéance | Date limite de la prochaine revue (optionnel) |
| Commentaire | Observations éventuelles |

**Règles impératives** :
- Chaque enregistrement crée une **nouvelle ligne d'historique** — jamais
  un écrasement de la revue précédente. L'historique complet (qui, quand,
  quelle décision, sur quelle édition) reste consultable indéfiniment.
- **Aucune revue n'est jamais générée automatiquement.** Une question sans
  ligne de revue annuelle enregistrée affiche « À revoir » par défaut —
  jamais un statut « terminé » fabriqué.
- Le nom du réviseur et la date doivent correspondre à un événement humain
  réellement survenu. Un opérateur qui saisit ce formulaire (traçé comme
  `created_by`) n'est pas nécessairement le réviseur lui-même — il
  transcrit une décision déjà prise, exactement comme la création d'une
  question transcrit un contenu déjà vérifié.

## 8. Archive et historique de version

- Aucune question ni aucune revue n'est jamais supprimée du système —
  seule la désactivation (`active = 0`) retire une question des futurs
  tirages, en conservant son historique complet (versions, revues,
  utilisation dans des examens déjà publiés).
- Une question déjà utilisée dans un examen publié (`is_protected`) ne
  peut jamais être supprimée définitivement, uniquement désactivée.

## 9. Traçabilité

Chaque étape de ce cycle produit une entrée dans le journal d'audit
KOST E-EXAM V2 (`audit_logs`, écriture seule) : création de question,
nouvelle version, activation/désactivation, et désormais enregistrement
d'une revue annuelle (action `question_annual_review_recorded`).

---

*Ce document décrit un processus interne KOST Academy. Il ne constitue
pas, à lui seul, une approbation réglementaire de l'ANAC ou de l'IATA.
Support : cbta@kostacademy.com*
