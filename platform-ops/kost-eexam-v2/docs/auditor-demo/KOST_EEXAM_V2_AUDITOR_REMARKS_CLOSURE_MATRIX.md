# KOST E-EXAM V2 — Matrice de clôture des observations de l'auditeur

**Mission :** Close Auditor Remarks — 31 août 2026
**Application :** KOST E-EXAM V2 — Staging : https://staging.kostacademy.com
**Support :** cbta@kostacademy.com

Statuts utilisés : **CLOSED** (preuve applicative/documentaire réelle) —
**PARTIAL** (couvert en partie, limite honnête documentée) — **OPEN — HUMAN
ACTION** (le système fournit l'outil, une action humaine réelle reste à
accomplir) — **OPEN — CLARIFICATION** (l'observation de l'auditeur reste
ambiguë, aucune supposition faite).

Aucune ligne n'est marquée CLOSED sans preuve applicative ou documentaire
citée explicitement.

| No. | Observation de l'auditeur | Action mise en œuvre | Statut | Preuve applicative | Preuve documentaire | Action humaine restante | Clarification requise |
|---|---|---|---|---|---|---|---|
| 1 | Les questions peuvent inclure Vrai/Faux | Type `true_false` déjà supporté nativement (8 types de question) | **CLOSED** | `lib/schema.sql::questions.qtype CHECK (... 'true_false' ...)`, `/question-bank` | — | — | — |
| 2 | Mise à jour/enrichissement annuel de la banque selon le manuel DGR applicable | Table `question_annual_reviews` (année, édition applicable, décision) + formulaire de saisie sur `/question-bank/[id]/edit` | **CLOSED** (mécanisme) / **OPEN — HUMAN ACTION** (exécution réelle) | Schéma + `lib/questions.ts::recordAnnualReview/getAnnualReviewHistory` + UI | `docs/regulatory/KOST_QUESTION_BANK_VALIDATION_PROCEDURE.md` §7 | La revue 2026 elle-même reste à mener et à enregistrer par un instructeur habilité — **aucune ligne n'a été créée automatiquement** | — |
| 3 | Revue annuelle par un instructeur habilité | Champs réviseur (nom, qualification, date, décision) sur chaque revue enregistrée | **CLOSED** (mécanisme) / **OPEN — HUMAN ACTION** (revue réelle) | `question_annual_reviews.reviewer_name/reviewer_qualification/review_date` | idem §7 | Identifier l'instructeur habilité réel et mener la revue 2026 | — |
| 4 | Contrôle des questions répétitives/doublons | Méthodologie de recherche avant publication + décompte de contrôle | **CLOSED** | Décompte vérifié ce jour : **0 doublon réglementaire** sur 244 questions confirmées | `docs/regulatory/KOST_QUESTION_BANK_VALIDATION_PROCEDURE.md` §4, `docs/KOST_EEXAM_V2_TIER_A_244_MIGRATION_REPORT.md` | Réappliquer la vérification à chaque nouvelle question (déjà décrit comme étape répétable) | — |
| 5 | Procédure claire de validation des questions | Procédure interne formalisée, du brouillon à la revue annuelle | **CLOSED** | — | `docs/regulatory/KOST_QUESTION_BANK_VALIDATION_PROCEDURE.md` (+ PDF, 4 pages) | — | — |
| 6 | Support pédagogique, vidéos et plateforme décrits | 5 guides PDF par rôle + section Manuel d'organisation proposée | **PARTIAL** | `docs/auditor-demo/final-guides/*.pdf` | idem + `KOST_EEXAM_V2_AMENDEMENT_MANUEL_ORGANISATION_OUTILS_PEDAGOGIQUES.md` | Aucune vidéo n'existe — voir ligne 22/§32 « TO PRODUCE » | — |
| 7 | Le module d'examen fournit des rapports détaillés | Rapport individuel, rapport global de session, liste officielle, exports CSV | **CLOSED** | 6 routes PDF (`/api/reports/*`), vérifiées visuellement sans chevauchement | — | — | — |
| 8 | Rapport individuel par candidat (identité, questions, réponses, date, score) | `IndividualReportDocument` — identité, tentative, résultat, question par question | **CLOSED** | `lib/pdf/IndividualReportDocument.tsx`, `/api/reports/individual/[attemptId]` | — | — | — |
| 9 | Rapport global de session en PDF après examen | `SessionReportDocument` — statistiques + liste candidats | **CLOSED** | `lib/pdf/SessionReportDocument.tsx`, `/api/reports/session/[assessmentId]` | — | — | — |
| 10 | Le candidat doit pouvoir télécharger son rapport individuel | Bouton « Télécharger le rapport » sur `/mes-resultats` et `/results/[attemptId]`, isolation stricte à sa propre tentative | **CLOSED** | `app/(app)/mes-resultats/page.tsx`, `app/api/reports/individual/[attemptId]/route.tsx` (403 si `attempt.candidate_user_id !== session.userId`) | — | — | — |
| 11 | Le rapport individuel doit montrer chaque question et chaque réponse | Niveau « détaillé » — question, réponse candidat, réponse correcte, statut | **CLOSED** | `IndividualReportDocument.tsx` (mode `level=detailed`) | — | — | — |
| 12 | KOST E-EXAM V2 cité dans le Manuel d'organisation, section Outils pédagogiques | Manuel réel introuvable dans l'espace de travail — texte prêt à intégrer proposé | **PARTIAL — PROPOSED AMENDMENT** | — | `KOST_EEXAM_V2_AMENDEMENT_MANUEL_ORGANISATION_OUTILS_PEDAGOGIQUES.md` | Intégration formelle par le titulaire réel du Manuel d'organisation | — |
| 13 | Support des candidats société ET particulier | `client_type`/`candidate_type` — annuaire unifié Entreprise/Particulier | **CLOSED** (déjà implémenté, non modifié cette mission) | `app/(app)/companies/CreateClientPicker.tsx`, `companies.client_type`, `users.candidate_type` | `docs/auditor-demo/screenshots/` (captures Entreprise/Particulier existantes) | — | — |
| 14 | Familiarisation/formation planifiée pour le PERSONNEL et les CANDIDATS | Champ `audience` (candidats/personnel/mixte) sur chaque session | **PARTIAL** | `familiarization_sessions.audience`, formulaire `/familiarisation` | — | Le suivi de présence **par participant individuel** reste structurellement lié à un roster candidat (`candidate_user_id`) — une session peut être **déclarée** pour le personnel, mais le suivi nominatif détaillé d'un membre du personnel comme participant n'est pas encore un roster générique. Limite documentée, pas cachée. | — |
| 15 | Sessions de familiarisation avec feuille de présence | `AttendanceSheetDocument` — PDF téléchargeable | **CLOSED** | `/api/reports/attendance-sheet/[sessionId]`, rendu vérifié visuellement (0 chevauchement) | — | — | — |
| 16 | Historique/preuve des sessions de familiarisation et participants conservés | Historique par candidat (`getCandidateFamiliarizationHistory`) + preuve rattachée (`familiarization_evidence`) | **CLOSED** | `lib/familiarization.ts`, section « Preuves rattachées » sur `/familiarisation/[id]` | — | Rattacher réellement une référence de preuve pour chaque session déjà tenue (aucune n'est fabriquée automatiquement) | — |
| A | Certaines questions Vrai/Faux doivent-elles être non notées ? | Aucune fonctionnalité de question non notée implémentée sur la base de cette seule transcription | **OPEN — CLARIFICATION** | Vrai/Faux : SUPPORTED (noté normalement, comme tout autre type) | — | — | **Oui** — voir §27 réponse à l'auditeur |
| B | Remarque finale sur « la configuration » | Contexte insuffisant pour agir | **OPEN — CLARIFICATION** | — | — | — | **Oui** — « Pouvez-vous préciser le point relatif à la configuration de la plateforme que vous souhaitez voir documenté ou démontré ? » |

## Synthèse

- **Observations identifiées :** 18 (16 numérotées + 2 points ambigus A/B)
- **CLOSED :** 11 (n° 1, 4, 5, 7, 8, 9, 10, 11, 13, 15, 16)
- **PARTIAL :** 3 (n° 6, 12, 14)
- **OPEN — HUMAN ACTION :** intégré dans n° 2 et 3 (mécanisme CLOSED, exécution humaine réelle en attente)
- **OPEN — CLARIFICATION :** 2 (A, B)

Aucune ligne CLOSED de ce tableau ne repose sur une donnée fabriquée,
une revue humaine simulée, ou une preuve d'assiduité inventée.

---

*Ce document décrit l'état réel de KOST E-EXAM V2 au 31 août 2026. Il ne
constitue pas, à lui seul, une approbation réglementaire de l'ANAC ou de
l'IATA. Support : cbta@kostacademy.com*
