// Rapport individuel PDF (addendum §4) — deux niveaux configurables :
// "simple" (identité, examen, note, %, mention, date/durée) et "detailed"
// (+ question par question : réponse candidat, réponse correcte,
// juste/faux, points). Consomme directement AttemptDetail
// (lib/results.ts getAttemptDetail()) — jamais une copie/re-saisie des
// données, exactement les mêmes valeurs que l'écran de détail.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { AttemptDetail } from "../results";
import { formatCorrectAnswerForDisplay, formatCandidateAnswerForDisplay } from "../questions";

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

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>Identité</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Candidat</Text><Text style={pdfStyles.fieldValue}>{detail.candidate_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Identifiant</Text><Text style={pdfStyles.fieldValue}>{detail.candidate_username}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Entreprise</Text><Text style={pdfStyles.fieldValue}>{detail.company_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Groupe / session</Text><Text style={pdfStyles.fieldValue}>{detail.group_name}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Fonction</Text><Text style={pdfStyles.fieldValue}>{detail.function_code}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Examen</Text><Text style={pdfStyles.fieldValue}>{detail.assessment_name}</Text></View>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Tentative</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Date</Text><Text style={pdfStyles.fieldValue}>{startedAt.toLocaleDateString("fr-FR")}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Heure début</Text><Text style={pdfStyles.fieldValue}>{startedAt.toLocaleTimeString("fr-FR")}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Heure fin</Text><Text style={pdfStyles.fieldValue}>{submittedAt ? submittedAt.toLocaleTimeString("fr-FR") : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Tentative n°</Text><Text style={pdfStyles.fieldValue}>{detail.attempt_number}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Durée autorisée</Text><Text style={pdfStyles.fieldValue}>{detail.duration_minutes_allowed} min</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Durée réelle</Text><Text style={pdfStyles.fieldValue}>{durationMin === null ? "—" : durationMin < 1 ? "< 1 min" : `${durationMin} min`}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Nombre de questions</Text><Text style={pdfStyles.fieldValue}>{detail.question_count}</Text></View>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Résultat</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Bonnes réponses</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeOk]}>{detail.correct_count ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Mauvaises réponses</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeFail]}>{detail.incorrect_count ?? "—"}</Text></View>
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

        {level === "detailed" && (
          <>
            <Text style={pdfStyles.h2}>Détail question par question</Text>
            {detail.questions.map((q) => (
              <View key={q.position} style={pdfStyles.questionBlock} wrap={false}>
                <Text style={{ fontSize: 8.5, fontWeight: 700 }}>
                  Question {q.position} — {q.isCorrect === null ? "Non noté" : q.isCorrect ? "JUSTE" : "FAUX"} ({q.pointsAwarded ?? "—"} / {q.points} pt)
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
                    <Text style={pdfStyles.choiceLine}>Réponse du candidat : {formatCandidateAnswerForDisplay(q.qtype, q.candidateAnswer, q.choices)}</Text>
                    <Text style={[pdfStyles.choiceLine, pdfStyles.choiceCorrect]}>
                      {q.qtype === "numeric" ? "Réponse correcte" : "Réponses acceptées"} : {formatCorrectAnswerForDisplay(q.qtype, q.correctAnswer)}
                    </Text>
                  </>
                )}
                {/* Mission "MISSION FINALE CIBLÉE" (2026-08-30) — matching/
                    ordering/scenario : même paire candidat/correcte que
                    ci-dessus, formatée par le point d'entrée unique
                    partagé (jamais une 5e implémentation divergente). */}
                {(q.qtype === "matching" || q.qtype === "ordering" || q.qtype === "scenario") && (
                  <>
                    <Text style={pdfStyles.choiceLine}>Réponse du candidat : {formatCandidateAnswerForDisplay(q.qtype, q.candidateAnswer, q.choices)}</Text>
                    <Text style={[pdfStyles.choiceLine, pdfStyles.choiceCorrect]}>Réponse correcte : {formatCorrectAnswerForDisplay(q.qtype, q.correctAnswer, q.choices)}</Text>
                  </>
                )}
                {q.explanation && <Text style={{ fontSize: 7.5, marginTop: 3, color: "#5a5a5a" }}>Explication : {q.explanation}</Text>}
              </View>
            ))}
          </>
        )}

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
