// Caractéristiques de l'environnement serveur — document d'audit (mission
// "URGENT AUDITOR FOLLOW-UP — ALGERIA TIMEZONE + SERVER CHARACTERISTICS",
// 2026-09-02, Partie B). Consomme lib/server-characteristics.ts (source
// UNIQUE des valeurs, instantané vérifié en direct sur le VPS réel) —
// aucune donnée recalculée/dupliquée ici, uniquement la présentation.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import { SERVER_CHARACTERISTICS, ARCHITECTURE_DESCRIPTION, SECURITY_DISCLAIMER } from "../server-characteristics";
import { formatAlgeriaDateTime } from "../timezone";

export function ServerCharacteristicsDocument({ meta, inspectionDate }: { meta: DocumentMeta; inspectionDate: string }) {
  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>CARACTÉRISTIQUES DE L&apos;ENVIRONNEMENT SERVEUR</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Application</Text>
              <Text style={pdfStyles.fieldValue}>KOST E-EXAM V2</Text>
            </View>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Organisation</Text>
              <Text style={pdfStyles.fieldValue}>KOST Academy</Text>
            </View>
            <View style={pdfStyles.field}>
              <Text style={pdfStyles.fieldLabel}>Date d&apos;inspection</Text>
              <Text style={pdfStyles.fieldValue}>{formatAlgeriaDateTime(inspectionDate, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} — heure d&apos;Algérie</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "34%" }]}>Caractéristique</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "66%" }]}>Valeur</Text>
          </View>
          {SERVER_CHARACTERISTICS.map((c) => (
            <View key={c.label} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.tableCell, { width: "34%", fontWeight: 700 }]}>{c.label}</Text>
              <Text style={[pdfStyles.tableCell, { width: "66%" }]}>{c.value}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.h2}>ARCHITECTURE</Text>
        <View style={pdfStyles.card}>
          <Text style={{ fontSize: 8.5, lineHeight: 1.4 }}>{ARCHITECTURE_DESCRIPTION}</Text>
        </View>

        <Text style={pdfStyles.h2}>AVERTISSEMENT</Text>
        <View style={pdfStyles.card}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, color: "#5a5a5a" }}>{SECURITY_DISCLAIMER}</Text>
        </View>

        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
