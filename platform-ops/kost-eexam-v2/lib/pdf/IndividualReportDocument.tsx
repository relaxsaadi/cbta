// Rapport individuel PDF (addendum §4, étendu par la mission "FINAL PRODUCT
// IMPROVEMENTS BEFORE AUDITOR PDF" 2026-08-31 §1-3) — deux niveaux
// configurables : "simple" (identité, examen, statut, note, %, mention,
// date/durée) et "detailed" (+ question par question : réponse candidat,
// réponse correcte, juste/faux, points). Consomme directement AttemptDetail
// (lib/results.ts getAttemptDetail()) — jamais une copie/re-saisie des
// données, exactement les mêmes valeurs que l'écran de détail
// (/results/[attemptId]) : même isAnswered (lib/questions.ts) et même
// attemptStatusLabel (lib/results.ts).
//
// §3 — sécurité anti-fabrication : ce document est maintenant généré même
// pour une tentative EN COURS ou EN ATTENTE DE CORRECTION MANUELLE (le
// bouton n'est plus masqué côté écran, voir results/[attemptId]/page.tsx —
// cette même page affiche déjà le détail question par question sans
// condition de statut, donc aucune exposition nouvelle). La carte
// "Résultat" ne montre donc les nombres QUE si grading_state === 'COMPLETE'
// ; sinon un message texte explicite remplace les champs numériques —
// jamais un score/une mention "—" ambigu à la place d'un "pas encore noté".
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles, pdfSafeText } from "./theme";
import { formatAlgeriaDate, formatAlgeriaTime } from "../timezone";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { AttemptDetail } from "../results";
import { attemptStatusLabel } from "../results";
import { formatCorrectAnswerForDisplay, formatCandidateAnswerForDisplay, isAnswered } from "../questions";

export function IndividualReportDocument({
  detail,
  level,
  meta,
}: {
  detail: AttemptDetail;
  level: "simple" | "detailed";
  meta: DocumentMeta;
}) {
  const startedAt = new Date(detail.started_at);
  const submittedAt = detail.submitted_at ? new Date(detail.submitted_at) : null;
  const durationMin = submittedAt ? Math.round((submittedAt.getTime() - startedAt.getTime()) / 60000) : null;

  const inProgress = detail.status === "in_progress";
  const awaitingReview = detail.grading_state === "AWAITING_MANUAL_REVIEW";
  const finalResultAvailable = detail.grading_state === "COMPLETE";
  const statusLabel = attemptStatusLabel(detail.status, detail.grading_state);
  const answeredCount = detail.questions.filter((q) => isAnswered(q.qtype, q.candidateAnswer)).length;
  const unansweredCount = detail.question_count - answeredCount;
  const manuallyGradedCount = detail.questions.filter(
    (q) => q.gradedBy !== null || (q.scenarioGrading && Object.keys(q.scenarioGrading).length > 0)
  ).length;

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>Identité</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Candidat</Text><Text style={pdfStyles.fieldValue}>{detail.candidate_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Identifiant</Text><Text style={pdfStyles.fieldValue}>{detail.candidate_username}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Type de client</Text><Text style={pdfStyles.fieldValue}>{detail.client_type === "particulier" ? "Particulier" : "Entreprise"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Entreprise</Text><Text style={pdfStyles.fieldValue}>{detail.company_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Groupe / session</Text><Text style={pdfStyles.fieldValue}>{detail.group_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Fonction</Text><Text style={pdfStyles.fieldValue}>{detail.function_code}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Examen</Text><Text style={pdfStyles.fieldValue}>{detail.assessment_name}</Text></View>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Tentative</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Statut</Text><Text style={pdfStyles.fieldValue}>{statusLabel}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Date</Text><Text style={pdfStyles.fieldValue}>{formatAlgeriaDate(startedAt, { day: "2-digit", month: "2-digit", year: "numeric" })}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Heure début</Text><Text style={pdfStyles.fieldValue}>{formatAlgeriaTime(startedAt, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Heure fin</Text><Text style={pdfStyles.fieldValue}>{submittedAt ? formatAlgeriaTime(submittedAt, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Tentative n°</Text><Text style={pdfStyles.fieldValue}>{detail.attempt_number}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Durée autorisée</Text><Text style={pdfStyles.fieldValue}>{detail.duration_minutes_allowed} min</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Durée réelle</Text><Text style={pdfStyles.fieldValue}>{durationMin === null ? "—" : durationMin < 1 ? "< 1 min" : `${durationMin} min`}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Nombre de questions</Text><Text style={pdfStyles.fieldValue}>{detail.question_count}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Questions répondues</Text><Text style={pdfStyles.fieldValue}>{answeredCount} / {detail.question_count}</Text></View>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Résultat</Text>
        {finalResultAvailable ? (
          <View style={pdfStyles.card}>
            <View style={pdfStyles.row}>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Bonnes réponses</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeOk]}>{detail.correct_count ?? "—"}</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Mauvaises réponses</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeFail]}>{detail.incorrect_count ?? "—"}</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Non répondues</Text><Text style={pdfStyles.fieldValue}>{unansweredCount}</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Corrigées manuellement</Text><Text style={pdfStyles.fieldValue}>{manuallyGradedCount}</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Score</Text><Text style={pdfStyles.fieldValue}>{detail.score_100 ?? "—"} / 100</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Pourcentage</Text><Text style={pdfStyles.fieldValue}>{detail.percentage !== null ? `${detail.percentage}%` : "—"}</Text></View>
              <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Seuil</Text><Text style={pdfStyles.fieldValue}>{detail.pass_threshold_pct ?? "—"}%</Text></View>
              <View style={pdfStyles.field}>
                <Text style={pdfStyles.fieldLabel}>Mention</Text>
                <Text style={[pdfStyles.fieldValue, detail.passed ? pdfStyles.badgeOk : pdfStyles.badgeFail]}>
                  {detail.passed === null ? "—" : detail.passed ? "ADMIS" : "ÉCHEC"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={pdfStyles.card}>
            <Text style={pdfStyles.fieldValue}>
              {inProgress
                ? "Résultat non disponible — l'examen n'a pas encore été envoyé."
                : awaitingReview
                  ? "Examen envoyé — en attente de correction manuelle avant publication du résultat."
                  : "Résultat non disponible."}
            </Text>
          </View>
        )}

        {level === "detailed" && (
          <>
            <Text style={pdfStyles.h2}>Détail question par question</Text>
            {detail.questions.map((q) => {
              const gradeLabel = inProgress
                ? "Examen en cours"
                : q.isCorrect === null
                  ? (q.qtype === "short_answer" || q.qtype === "scenario" ? "En attente de correction" : "Non noté")
                  : q.isCorrect
                    ? "JUSTE"
                    : "FAUX";
              return (
              <View key={q.position} style={pdfStyles.questionBlock} wrap={false}>
                <Text style={{ fontSize: 8.5, fontWeight: 700 }}>
                  Question {q.position} — {gradeLabel} ({q.pointsAwarded ?? "—"} / {q.points} pt)
                </Text>
                <Text style={{ fontSize: 8, marginTop: 3 }}>{q.stem}</Text>
                {(q.qtype === "mcq_single" || q.qtype === "mcq_multi" || q.qtype === "true_false") &&
                  q.choices.map((c) => {
                    const chosen = (q.candidateAnswer as string[]).includes(c.key);
                    const correct = (q.correctAnswer as string[]).includes(c.key);
                    return (
                      <Text
                        key={c.key}
                        style={[pdfStyles.choiceLine, correct ? pdfStyles.choiceCorrect : chosen ? pdfStyles.choiceChosenWrong : undefined]}
                      >
                        {c.key}. {c.text}
                        {chosen ? "  (réponse du candidat)" : ""}
                        {correct ? "  (réponse correcte)" : ""}
                      </Text>
                    );
                  })}
                {(q.qtype === "numeric" || q.qtype === "short_answer") && (
                  <>
                    <Text style={pdfStyles.choiceLine}>Réponse du candidat : {pdfSafeText(formatCandidateAnswerForDisplay(q.qtype, q.candidateAnswer, q.choices))}</Text>
                    <Text style={[pdfStyles.choiceLine, pdfStyles.choiceCorrect]}>
                      {q.qtype === "numeric" ? "Réponse correcte" : "Réponses acceptées"} : {pdfSafeText(formatCorrectAnswerForDisplay(q.qtype, q.correctAnswer))}
                    </Text>
                  </>
                )}
                {/* Mission "MISSION FINALE CIBLÉE" (2026-08-30) — matching/
                    ordering/scenario : même paire candidat/correcte que
                    ci-dessus, formatée par le point d'entrée unique
                    partagé (jamais une 5e implémentation divergente).
                    pdfSafeText (mission "FINAL PRODUCT IMPROVEMENTS BEFORE
                    AUDITOR PDF" 2026-08-31 §39) : "→" rendait mal sous
                    Helvetica/WinAnsi, voir lib/pdf/theme.ts. */}
                {(q.qtype === "matching" || q.qtype === "ordering" || q.qtype === "scenario") && (
                  <>
                    <Text style={pdfStyles.choiceLine}>Réponse du candidat : {pdfSafeText(formatCandidateAnswerForDisplay(q.qtype, q.candidateAnswer, q.choices))}</Text>
                    <Text style={[pdfStyles.choiceLine, pdfStyles.choiceCorrect]}>Réponse correcte : {pdfSafeText(formatCorrectAnswerForDisplay(q.qtype, q.correctAnswer, q.choices))}</Text>
                  </>
                )}
                {q.explanation && <Text style={{ fontSize: 7.5, marginTop: 3, color: "#5a5a5a" }}>Explication : {q.explanation}</Text>}
              </View>
              );
            })}
          </>
        )}

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
