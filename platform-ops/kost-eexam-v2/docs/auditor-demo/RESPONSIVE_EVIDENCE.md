# KOST E-EXAM V2 — Preuve responsive (mobile / tablette)

**Mission :** "FINAL AUDITOR PACK COMPLETENESS AUDIT" (2026-08-31)
**Environnement :** https://staging.kostacademy.com (Chromium Playwright isolé, viewport réel)
**Route utilisée :** `/apercu-candidat/34` (mode Aperçu candidat, admin) — jamais une vraie tentative candidat créée pour ces captures. `PreviewRunner.tsx` réutilise EXACTEMENT les mêmes composants que le moteur d'examen réel (`Timer`, `QuestionNavigator`) — cette preuve est donc représentative du rendu réel du moteur à ces tailles, sans en avoir les effets de bord (aucune écriture possible dans `attempts`/`attempt_answers`/`results`, voir le commentaire en tête de `PreviewRunner.tsx`).

Aucun débordement horizontal détecté à aucune des 3 tailles (`document.documentElement.scrollWidth > document.documentElement.clientWidth` = `false` partout, vérifié programmatiquement au moment de la capture, pas seulement jugé visuellement).

| Fichier | Taille | Écran | Débordement horizontal | Notes |
|---|---|---|---|---|
| `responsive-mobile-390x844-runner.png` | 390×844 | Moteur d'examen — question 1/8, chronomètre, navigateur de questions | Aucun | Bannière MODE APERÇU, anneau de chronomètre, barre de progression "Question X sur Y", navigateur 1-8, boutons Précédente/Suivante — tous visibles et non tronqués. |
| `responsive-mobile-390x844-final-review.png` | 390×844 | Écran de révision finale — 4 cartes-résumé | Aucun | Grille 2×2, les deux boutons d'action ("Retourner aux questions" / "Terminer et envoyer l'examen") pleinement visibles et atteignables, aucun contrôle inaccessible. |
| `responsive-mobile-430x932-runner.png` | 430×932 | Moteur d'examen — question 1/8 | Aucun | Même mise en page que 390×844, mise à l'échelle correcte. |
| `responsive-tablet-768x1024-runner.png` | 768×1024 | Moteur d'examen — question 1/8, navigation latérale complète visible | Aucun | À cette largeur, la navigation latérale complète (jamais réduite à un menu hamburger) reste visible en plus du moteur d'examen — chronomètre, navigateur de questions et boutons d'action tous accessibles sans défilement horizontal. |

**Vérifié par capture d'écran réelle, jamais par revue de code CSS seule.**
