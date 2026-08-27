# KOST E-EXAM V2 — Checklist démo live auditeur (20 min max)

**URL :** https://staging.kostacademy.com
**Version :** `kost-eexam-v2-auditor-review-2026-08-27` — voir
`KOST_EEXAM_V2_AUDITOR_REREVIEW.md` pour le dossier complet.

Chaque ligne = une preuve concrète, pas une explication. Cocher au fur et
à mesure.

| # | Min | Étape | Preuve à observer |
|---|---|---|---|
| 1 | 0–1 | Connexion candidat | `candidat1.staging` → landing sur « Mes examens » |
| 2 | 1–3 | Passer un examen | Ouvrir un examen → instructions → « Commencer » → chronomètre visible et décompte réellement → répondre → « Terminer » |
| 3 | 3–4 | Résultat candidat | « Mes résultats » → score et mention (ADMIS/ÉCHEC) affichés selon la config |
| 4 | 4–5 | Connexion responsable | `responsable.staging` → « Vue d'ensemble » scopée à ses propres clients |
| 5 | 5–6 | Détail question par question | « Résultats » → cliquer un candidat → chaque question, réponse candidat vs réponse correcte, points |
| 6 | 6–7 | Rapport individuel PDF | Bouton « PDF détaillé » → vrai fichier téléchargé, en-tête KOST E-EXAM + métadonnées complètes |
| 7 | 7–8 | Rapport global + liste officielle | Fiche examen → « Rapport global » → statistiques → « Liste officielle PDF » et « CSV » |
| 8 | 8–9 | Créer et affecter un examen | « Préparation des examens » → créer → publier → écran « À qui affecter cet examen ? » (3 choix) visible |
| 9 | 9–10 | Familiarisation | « Familiarisation » → créer une session → marquer un candidat présent → « Feuille de présence PDF » |
| 10 | 10–12 | Incident + action immédiate | « Incidents » → déclarer → suspendre un compte → tenter de se connecter avec ce compte → refus visible |
| 11 | 12–13 | Reprise incident | Réactiver le compte → nouvelle connexion réussie → clôturer l'incident → historique complet visible |
| 12 | 13–14 | Connexion administrateur | `admin.staging` → mode maintenance : activer → bannière visible → désactiver |
| 13 | 14–15 | Connexion auditeur | `auditeur.staging` → aucun bouton d'écriture visible nulle part |
| 14 | 15–16 | Isolation multi-client | `responsable-b.staging` → jamais les données de l'autre client, ni en liste ni par URL devinée (404) |
| 15 | 16–17 | Guides | « Guide » (n'importe quel rôle) → contenu à l'écran → « Télécharger PDF » |
| 16 | 17–18 | Journal d'audit | `admin.staging` ou `auditeur.staging` → « Journal d'audit » → traçabilité des actions ci-dessus |
| 17 | 18–19 | Export CSV | « Résultats » → filtrer → « Export CSV (résultats) » et « (réponses détaillées) » → fichiers réels |
| 18 | 19–20 | Sauvegarde/restauration | « Système » → dernière sauvegarde et dernier test de restauration, tous deux réussis |

**Si le temps manque :** prioriser 1→3 (candidat), 5→7 (rapports), 10→11
(incident), 14 (isolation) — c'est le cœur de ce que l'addendum demandait
de prouver.
