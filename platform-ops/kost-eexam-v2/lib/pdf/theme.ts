// Style partagé pour tous les documents PDF KOST E-EXAM — une seule
// source pour la charte visuelle, jamais redéfinie document par document.
import { StyleSheet, Font } from "@react-pdf/renderer";

export const COLORS = {
  navy: "#0f1f3d",
  accent: "#2f6feb",
  text: "#1a1a1a",
  textMuted: "#5a5a5a",
  border: "#d8dce3",
  bgSubtle: "#f4f6f9",
  verified: "#16794f",
  critical: "#b3261e",
};

// Police système standard — évite de dépendre d'une police externe non
// embarquée (Helvetica est la police par défaut de @react-pdf/renderer,
// toujours disponible sans configuration réseau).
Font.registerHyphenationCallback((word) => [word]);

/** Défaut réel trouvé lors du contrôle qualité visuel du rapport
 * individuel (mission "FINAL PRODUCT IMPROVEMENTS BEFORE AUDITOR PDF",
 * 2026-08-31, §39) : Helvetica (police standard de @react-pdf/renderer)
 * n'a qu'un encodage WinAnsi — "→" (U+2192) n'y existe pas et se rendait
 * comme un caractère erroné dans le PDF final (jamais visible côté écran,
 * où "→" s'affiche correctement partout). Utilitaire PARTAGÉ pour
 * substituer ce caractère (et d'éventuels autres hors WinAnsi trouvés
 * plus tard) UNIQUEMENT à la frontière PDF — jamais dans
 * formatCorrectAnswerForDisplay/formatCandidateAnswerForDisplay
 * elles-mêmes (lib/questions.ts), qui restent le seul point d'entrée
 * partagé écran+PDF et doivent continuer d'afficher "→" correctement à
 * l'écran. Appliqué pour l'instant dans IndividualReportDocument.tsx ;
 * les autres documents PDF utilisant "→" (Guide/IncidentProcedure/
 * ResultsList) n'ont pas été revérifiés visuellement cette mission —
 * candidats à un même correctif dans un passage ultérieur. */
export function pdfSafeText(text: string): string {
  return text.replace(/→/g, "->");
}

export const pdfStyles = StyleSheet.create({
  page: { paddingTop: 100, paddingBottom: 56, paddingHorizontal: 40, fontSize: 9.5, color: COLORS.text, fontFamily: "Helvetica" },
  headerFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingHorizontal: 40,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.navy,
  },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 13, fontWeight: 700, color: COLORS.navy },
  brandSub: { fontSize: 7.5, color: COLORS.textMuted, marginTop: 1 },
  docTitle: { fontSize: 12, fontWeight: 700, color: COLORS.text, marginTop: 10 },
  classification: {
    fontSize: 7,
    color: COLORS.textMuted,
    borderWidth: 0.75,
    borderColor: COLORS.border,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 14 },
  metaItem: { minWidth: 100 },
  metaLabel: { fontSize: 6.5, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.3 },
  metaValue: { fontSize: 8.5, color: COLORS.text, marginTop: 1, fontWeight: 700 },
  footerFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderTopWidth: 0.75,
    borderTopColor: COLORS.border,
    fontSize: 7,
    color: COLORS.textMuted,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  /** Ligne support KOST Academy — addendum §2 (2026-08-31), sur son propre
   * Text pour ne jamais entrer en conflit de largeur avec "Page X / Y". */
  footerSupport: { marginTop: 2, fontSize: 6.5, color: COLORS.textMuted },
  h2: { fontSize: 11, fontWeight: 700, color: COLORS.navy, marginTop: 14, marginBottom: 6 },
  card: { borderWidth: 0.75, borderColor: COLORS.border, borderRadius: 3, padding: 10, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  field: { minWidth: 90, marginBottom: 6 },
  fieldLabel: { fontSize: 7, color: COLORS.textMuted },
  fieldValue: { fontSize: 9, color: COLORS.text, fontWeight: 700, marginTop: 1 },
  table: { display: "flex", width: "auto", marginTop: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: COLORS.border, paddingVertical: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.bgSubtle, paddingVertical: 4, borderBottomWidth: 0.75, borderBottomColor: COLORS.border },
  tableCell: { fontSize: 8, paddingHorizontal: 3 },
  tableCellHeader: { fontSize: 7, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", paddingHorizontal: 3 },
  badgeOk: { color: COLORS.verified, fontWeight: 700 },
  badgeFail: { color: COLORS.critical, fontWeight: 700 },
  questionBlock: { borderWidth: 0.75, borderColor: COLORS.border, borderRadius: 3, padding: 8, marginBottom: 7 },
  choiceLine: { fontSize: 8, marginTop: 2 },
  choiceCorrect: { color: COLORS.verified },
  choiceChosenWrong: { color: COLORS.critical },
});
