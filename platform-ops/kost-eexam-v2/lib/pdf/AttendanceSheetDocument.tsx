// Feuille de présence — familiarisation (addendum §18-21, CRITIQUE
// AUDIT). Contrairement aux autres documents (un seul bloc signature en
// pied de page), CHAQUE candidat a ici sa propre zone de signature —
// c'est une preuve de présence nominative, pas un résumé statistique.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { AttendanceRow } from "../familiarization";

export function AttendanceSheetDocument({
  rows,
  location,
  heldAt,
  meta,
}: {
  rows: AttendanceRow[];
  location: string | null;
  heldAt: string;
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
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Date / heure</Text><Text style={pdfStyles.fieldValue}>{new Date(heldAt).toLocaleString("fr-FR")}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Lieu</Text><Text style={pdfStyles.fieldValue}>{location ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Candidats convoqués</Text><Text style={pdfStyles.fieldValue}>{sorted.length}</Text></View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "6%" }]}>N°</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "34%" }]}>Candidat</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "15%" }]}>Présent</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "45%" }]}>Signature</Text>
          </View>
          {sorted.map((r, i) => (
            <View key={r.candidate_user_id} style={[pdfStyles.tableRow, { minHeight: 26 }]} wrap={false}>
              <Text style={[pdfStyles.tableCell, { width: "6%" }]}>{i + 1}</Text>
              <Text style={[pdfStyles.tableCell, { width: "34%" }]}>{r.full_name}</Text>
              <Text style={[pdfStyles.tableCell, { width: "15%" }, r.present ? pdfStyles.badgeOk : undefined]}>{r.present ? "Oui" : "Non"}</Text>
              <View style={[pdfStyles.tableCell, { width: "45%", borderBottomWidth: 0.75, borderBottomColor: "#d8dce3" }]}>
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
