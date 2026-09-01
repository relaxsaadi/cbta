// Rapport global d'examen — version SIMPLE (mission "URGENT AUDITOR
// FOLLOW-UP", 2026-08-31, Issue 1) : l'auditeur veut un PDF simple listant
// Candidat / Résultat / Mention (RÉUSSITE/ÉCHEC), téléchargeable directement
// depuis l'écran de résultats — au lieu de devoir passer par un export CSV.
// Réutilise EXACTEMENT getSessionReport() (lib/assessments.ts) — jamais une
// requête dupliquée — et reste volontairement DISTINCT du "Rapport global
// PDF" existant (lib/pdf/SessionReportDocument.tsx, orienté paysage,
// statistiques agrégées détaillées) : les deux documents ont un public et
// un usage différents, aucun des deux ne remplace l'autre.
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { SessionReportRow } from "../assessments";

/** Résultat "complétude" — jamais RÉUSSITE/ÉCHEC ici, uniquement l'état
 * d'avancement de la tentative (§3 : colonne "Résultat", distincte de
 * "Mention"). */
function resultatLabel(r: SessionReportRow): string {
  if (!r.attempt_status) return "Non commencé";
  if (r.attempt_status === "in_progress") return "En cours";
  if (r.attempt_status === "abandoned") return "Abandonné";
  // submitted / auto_submitted :
  if (r.passed === null) return "Envoyé — en attente de correction";
  return r.score_100 !== null ? `${r.score_100} / 100` : "Terminé";
}

/** Mention RÉUSSITE/ÉCHEC — JAMAIS fabriquée quand le résultat n'est pas
 * réellement final (§3/§9 de la mission : "do NOT fabricate RÉUSSITE/ÉCHEC
 * ... use truthful status"). Un examen soumis mais encore
 * AWAITING_MANUAL_REVIEW (passed IS NULL malgré un statut "submitted") est
 * distingué explicitement d'un examen jamais terminé — même détection déjà
 * utilisée à l'écran (results r.passed via getSessionReport(), jamais
 * recalculée séparément ici). */
function mentionLabel(r: SessionReportRow): { text: string; kind: "success" | "fail" | "pending" | "none" } {
  const isSubmitted = r.attempt_status === "submitted" || r.attempt_status === "auto_submitted";
  if (isSubmitted && r.passed === null) return { text: "EN ATTENTE DE CORRECTION", kind: "pending" };
  if (r.passed === 1) return { text: "RÉUSSITE", kind: "success" };
  if (r.passed === 0) return { text: "ÉCHEC", kind: "fail" };
  return { text: "NON FINALISÉ", kind: "none" };
}

export function GlobalExamReportDocument({
  rows,
  assessmentName,
  examDate,
  meta,
}: {
  rows: SessionReportRow[];
  assessmentName: string;
  /** Date de l'examen déjà formatée (fr-FR) par l'appelant — première
   * tentative démarrée, ou date de publication si aucune tentative encore. */
  examDate: string;
  meta: DocumentMeta;
}) {
  const sorted = [...rows].sort((a, b) => a.full_name.localeCompare(b.full_name, "fr"));

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />

        <Text style={pdfStyles.h2}>RAPPORT GLOBAL D&apos;EXAMEN</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Examen</Text><Text style={pdfStyles.fieldValue}>{assessmentName}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Client</Text><Text style={pdfStyles.fieldValue}>{meta.company ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Groupe / session</Text><Text style={pdfStyles.fieldValue}>{meta.groupOrSession ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Fonction DGR</Text><Text style={pdfStyles.fieldValue}>{meta.function ?? "—"}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Date</Text><Text style={pdfStyles.fieldValue}>{examDate}</Text></View>
            <View style={pdfStyles.field}><Text style={pdfStyles.fieldLabel}>Candidats</Text><Text style={pdfStyles.fieldValue}>{sorted.length}</Text></View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow} fixed>
            <Text style={[pdfStyles.tableCellHeader, { width: "8%" }]}>N°</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "37%" }]}>Candidat</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "27%" }]}>Résultat</Text>
            <Text style={[pdfStyles.tableCellHeader, { width: "28%" }]}>Mention</Text>
          </View>
          {sorted.map((r, i) => {
            const mention = mentionLabel(r);
            const mentionStyle =
              mention.kind === "success" ? pdfStyles.badgeOk : mention.kind === "fail" ? pdfStyles.badgeFail : undefined;
            return (
              <View key={r.candidate_user_id} style={pdfStyles.tableRow} wrap={false}>
                <Text style={[pdfStyles.tableCell, { width: "8%" }]}>{i + 1}</Text>
                <Text style={[pdfStyles.tableCell, { width: "37%" }]}>{r.full_name}</Text>
                <Text style={[pdfStyles.tableCell, { width: "27%" }]}>{resultatLabel(r)}</Text>
                <Text style={[pdfStyles.tableCell, mentionStyle, { width: "28%", fontWeight: 700 }]}>{mention.text}</Text>
              </View>
            );
          })}
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
