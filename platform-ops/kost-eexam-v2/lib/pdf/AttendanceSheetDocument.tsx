// Feuille de présence — familiarisation (addendum §18-21, CRITIQUE
// AUDIT). Contrairement aux autres documents (un seul bloc signature en
// pied de page), CHAQUE candidat a ici sa propre zone de signature —
// c'est une preuve de présence nominative, pas un résumé statistique.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { AttendanceRow } from "../familiarization";
import { formatAlgeriaDateTime, formatAlgeriaTime } from "../timezone";

const AUDIENCE_LABELS: Record<string, string> = {
  candidats: "Candidats",
  personnel: "Personnel",
  mixte: "Mixte (personnel + candidats)",
};

export function AttendanceSheetDocument({
  rows,
  location,
  heldAt,
  endedAt,
  audience,
  meta,
}: {
  rows: AttendanceRow[];
  location: string | null;
  heldAt: string;
  endedAt?: string | null;
  audience?: string | null;
  meta: DocumentMeta;
}) {
  const sorted = [...rows].sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>Feuille de présence — familiarisation</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Début</Text><Text style={pdfStyles.fieldValue}>{formatAlgeriaDateTime(heldAt, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Fin</Text><Text style={pdfStyles.fieldValue}>{endedAt ? formatAlgeriaTime(endedAt, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Lieu / mode</Text><Text style={pdfStyles.fieldValue}>{location ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Public visé</Text><Text style={pdfStyles.fieldValue}>{audience ? (AUDIENCE_LABELS[audience] ?? audience) : "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Participants convoqués</Text><Text style={pdfStyles.fieldValue}>{sorted.length}</Text></View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "5%" }]}>N°</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "27%" }]}>Participant</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "13%" }]}>Rôle</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "13%" }]}>Présent</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "42%" }]}>Signature</Text>
          </View>
          {sorted.map((r, i) => (
            <View key={r.candidate_user_id} style={[pdfStyles.tableRow, { minHeight: 26 }]} wrap={false}>
              <Text style={[pdfStyles.tableCell, { width: "5%" }]}>{i + 1}</Text>
              <Text style={[pdfStyles.tableCell, { width: "27%" }]}>{r.full_name}</Text>
              <Text style={[pdfStyles.tableCell, { width: "13%" }]}>Candidat</Text>
              <Text style={[pdfStyles.tableCell, { width: "13%" }, r.present ? pdfStyles.badgeOk : undefined]}>{r.present ? "Oui" : "Non"}</Text>
              <View style={[pdfStyles.tableCell, { width: "42%", borderBottomWidth: 0.75, borderBottomColor: "#d8dce3" }]}>
                <Text> </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 8, color: "#5a5a5a" }}>Animateur / responsable de la session : ____________________________ Signature : ____________________________</Text>
        </View>

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
