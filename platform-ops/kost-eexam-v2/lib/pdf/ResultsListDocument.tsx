// Liste officielle des résultats (addendum §8) — distincte du rapport
// global de session (lib/pdf/SessionReportDocument.tsx, orienté analyse
// avec statistiques agrégées) : ce document est la liste NOMINATIVE
// officielle candidat → résultat pour un examen/session donné, triée par
// ordre alphabétique, prête à être affichée/signée/archivée. Mêmes
// données authoritatives (getSessionReport()), présentation différente.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { SessionReportRow } from "../assessments";

const STATUS_LABEL: Record<string, string> = { in_progress: "En cours", submitted: "Terminé", auto_submitted: "Terminé (auto)", abandoned: "Abandonné" };

export function ResultsListDocument({
  rows,
  assessmentName,
  passThresholdPct,
  meta,
}: {
  rows: SessionReportRow[];
  assessmentName: string;
  passThresholdPct: number;
  meta: DocumentMeta;
}) {
  const sorted = [...rows].sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));
  const finished = sorted.filter((r) => r.attempt_status && r.attempt_status !== "in_progress");
  const admisCount = finished.filter((r) => r.passed === 1).length;

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>Liste officielle des résultats</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Examen / évaluation</Text><Text style={pdfStyles.fieldValue}>{assessmentName}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Seuil de réussite</Text><Text style={pdfStyles.fieldValue}>{passThresholdPct}%</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Candidats convoqués</Text><Text style={pdfStyles.fieldValue}>{sorted.length}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Admis</Text><Text style={[pdfStyles.fieldValue, pdfStyles.badgeOk]}>{admisCount} / {finished.length}</Text></View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>N°</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "32%" }]}>Candidat</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>Note /100</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>%</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>Mention</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>Statut</Text>
          </View>
          {sorted.map((r, i) => (
            <View key={r.candidate_user_id} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{i + 1}</Text>
              <Text style={[pdfStyles.tableCell, { width: "32%" }]}>{r.full_name}</Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }]}>{r.score_100 ?? "—"}</Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }]}>{r.percentage !== null ? `${r.percentage}%` : "—"}</Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }, r.passed === null ? undefined : r.passed ? pdfStyles.badgeOk : pdfStyles.badgeFail]}>
                {r.passed === null ? "—" : r.passed ? "ADMIS" : "ÉCHEC"}
              </Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }]}>{r.attempt_status ? STATUS_LABEL[r.attempt_status] : "Non commencé"}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30, flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 8, color: "#5a5a5a" }}>Certifié par : ____________________________</Text>
            <Text style={{ fontSize: 7, color: "#5a5a5a", marginTop: 4 }}>Nom, fonction, signature</Text>
          </View>
          <View>
            <Text style={{ fontSize: 8, color: "#5a5a5a" }}>Date : ____________________________</Text>
          </View>
        </View>

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
