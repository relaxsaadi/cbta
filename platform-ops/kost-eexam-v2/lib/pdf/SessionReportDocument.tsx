// Rapport global de session/examen PDF (addendum §6). Consomme
// getSessionReport() directement (lib/assessments.ts) — mêmes lignes et
// mêmes statistiques que l'écran, jamais recalculées séparément ici.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { SessionReportRow, SessionReportStats } from "../assessments";
import { formatAlgeriaTime } from "../timezone";

function fmtTime(iso: string | null): string {
  return iso ? formatAlgeriaTime(iso, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
}
function fmtDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  return minutes < 1 ? "< 1 min" : `${minutes} min`;
}
const STATUS_LABEL: Record<string, string> = { in_progress: "En cours", submitted: "Terminé", auto_submitted: "Terminé (auto)", abandoned: "Abandonné" };

export function SessionReportDocument({
  rows,
  stats,
  assessmentName,
  passThresholdPct,
  durationMinutes,
  meta,
}: {
  rows: SessionReportRow[];
  stats: SessionReportStats;
  assessmentName: string;
  passThresholdPct: number;
  durationMinutes: number;
  meta: DocumentMeta;
}) {
  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        {stats.smallSample && (
          <View style={[pdfStyles.card, { borderColor: "#d99a2b", backgroundColor: "#fdf6e8" }]}>
            <Text style={{ fontSize: 8, color: "#8a5a00" }}>
              Moins de 5 tentatives terminées ({stats.finished}) — moyenne et taux de réussite ci-dessous ne sont pas statistiquement représentatifs.
            </Text>
          </View>
        )}

        <Text style={pdfStyles.h2}>Statistiques</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Convoqués</Text><Text style={pdfStyles.fieldValue}>{stats.convened}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Non commencés</Text><Text style={pdfStyles.fieldValue}>{stats.notStarted}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>En cours</Text><Text style={pdfStyles.fieldValue}>{stats.inProgress}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Terminés</Text><Text style={pdfStyles.fieldValue}>{stats.finished}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Admis</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeOk]}>{stats.passedCount}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Échecs</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeFail]}>{stats.failedCount}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Taux de réussite</Text><Text style={pdfStyles.fieldValue}>{stats.passRatePct !== null ? `${stats.passRatePct}%` : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Moyenne</Text><Text style={pdfStyles.fieldValue}>{stats.average !== null ? `${stats.average}/100` : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Meilleur score</Text><Text style={pdfStyles.fieldValue}>{stats.best !== null ? `${stats.best}/100` : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Score minimum</Text><Text style={pdfStyles.fieldValue}>{stats.worst !== null ? `${stats.worst}/100` : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Seuil</Text><Text style={pdfStyles.fieldValue}>{passThresholdPct}%</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Durée autorisée</Text><Text style={pdfStyles.fieldValue}>{durationMinutes} min</Text></View>
          </View>
        </View>

        <Text style={pdfStyles.h2}>Résultats — {assessmentName}</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "16%" }]}>Candidat</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>Début</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>Fin</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>Durée</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "9%" }]}>Bonnes</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "9%" }]}>Mauvaises</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "9%" }]}>Note /100</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>%</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "10%" }]}>Mention</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>Statut</Text>
          </View>
          {rows.map((r) => (
            <View key={r.candidate_user_id} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.tableCell, { width: "16%" }]}>{r.full_name}</Text>
              <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{fmtTime(r.started_at)}</Text>
              <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{fmtTime(r.submitted_at)}</Text>
              <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{fmtDuration(r.started_at, r.submitted_at)}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.choiceCorrect, { width: "9%" }]}>{r.attempt_status ? r.correct_count : "—"}</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.choiceChosenWrong, { width: "9%" }]}>{r.attempt_status ? r.incorrect_count : "—"}</Text>
              <Text style={[pdfStyles.tableCell, { width: "9%" }]}>{r.score_100 ?? "—"}</Text>
              <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{r.percentage !== null ? `${r.percentage}%` : "—"}</Text>
              <Text style={[pdfStyles.tableCell, { width: "10%" }, r.passed === null ? undefined : r.passed ? pdfStyles.badgeOk : pdfStyles.badgeFail]}>
                {r.passed === null ? "—" : r.passed ? "ADMIS" : "ÉCHEC"}
              </Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }]}>{r.attempt_status ? STATUS_LABEL[r.attempt_status] : "Non commencé"}</Text>
            </View>
          ))}
        </View>

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
