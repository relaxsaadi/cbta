# Démonstration audit — Correction manuelle + Rapport global PDF

Mission "URGENT AUDITOR FOLLOW-UP" (2026-08-31/09-01). Séquence exacte à
suivre en direct devant l'auditeur, sur staging (https://staging.kostacademy.com),
avec les comptes existants (jamais un changement de mot de passe/identifiant).

## Fixture DEMO à utiliser

- **Examen :** `DGR Fonction 7.1 — Correction manuelle DEMO Auditeur` (id=44)
- **Candidat en attente de correction :** Riad Boumediene — `candidat2.staging`
  (synthétique, **jamais** Brahimi/Fethi/Nesrine)
- **Item à corriger :** 1 réponse courte, mode correction manuelle,
  actuellement `is_correct = NULL` — vérifié après le redéploiement du
  2026-09-01, toujours en attente, prêt à être corrigé **en direct** devant
  l'auditeur.
- Un second candidat sur ce même examen (Amel Ferhati) est déjà corrigé —
  normal, sert uniquement de contexte ("plusieurs candidats"), ne pas le
  présenter comme l'item à corriger.

## Séquence de démonstration (≈ 5 minutes)

1. **Connexion Responsable pédagogique** — `responsable.staging` (mot de
   passe existant, ne pas afficher/communiquer à l'écran).
2. **Ouvrir "Correction manuelle"** — menu de gauche → `/grading`. Le
   compteur "Corrections en attente" affiche au moins 1.
3. **Ouvrir l'item DEMO en attente** — carte contenant "Riad Boumediene" et
   l'examen "DGR Fonction 7.1 — Correction manuelle DEMO Auditeur" : le nom
   du candidat, la question, et la réponse réellement saisie par le
   candidat sont visibles ("Réponse du candidat : …").
4. **Entrer la correction** — remplir le champ "Commentaire (optionnel)"
   avec une phrase de correction.
5. **Valider la correction** — cliquer le bouton **"Correcte"** (ou
   "Incorrecte" selon le jugement de l'auditeur/du correcteur — les deux
   sont fonctionnels).
6. **Montrer le résultat finalisé** — la page se recharge sur
   `/grading?graded=1&finalized=1` avec le message "Réponse corrigée —
   résultat finalisé et notifié." ; l'item a disparu de la file d'attente.
7. **Ouvrir les résultats globaux de l'examen** — depuis
   `/exam-preparation`, ouvrir l'examen "DGR Fonction 7.1 — Correction
   manuelle DEMO Auditeur" → bouton "Rapport global" →
   `/exam-preparation/44/rapport-global`.
8. **Télécharger le PDF** — cliquer **"Rapport global PDF"** (bouton
   principal, distinct du "Rapport détaillé PDF (statistiques)" existant) :
   télécharge un PDF simple.
9. **Montrer la liste des candidats** — ouvrir le PDF téléchargé : tableau
   N° / Candidat / Résultat / Mention avec les deux candidats.
10. **Montrer la colonne Résultat** — score/état réel de chaque candidat,
    jamais fabriqué.
11. **Montrer la mention RÉUSSITE/ÉCHEC** — Riad Boumediene affiche
    désormais une mention finale réelle (RÉUSSITE ou ÉCHEC selon la
    correction donnée à l'étape 5), plus jamais "EN ATTENTE DE CORRECTION".

## Repli si l'item DEMO a déjà été corrigé avant la démo

Si quelqu'un corrige accidentellement l'item de Riad Boumediene avant la
session de demain, un nouvel item "à corriger" peut être recréé de façon
sûre (mêmes candidats synthétiques, jamais Brahimi/Fethi/Nesrine) via le
même schéma de fixture que celui documenté dans le rapport final de cette
mission — demander à Claude Code de le reconstituer avant la venue de
l'auditeur plutôt que d'improviser sur des comptes réels.
