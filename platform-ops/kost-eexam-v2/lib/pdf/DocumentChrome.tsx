// En-tête et pied de page standard — appliqués à TOUS les documents PDF
// KOST E-EXAM, sans exception (correction audit du 27/08/2026) :
//   - titre du document KOST E-EXAM
//   - entreprise
//   - groupe/session
//   - fonction
//   - identifiant évaluation/examen
//   - date/heure de génération
//   - généré par
//   - identifiant document/version
//   - page X / Y
//   - classification ("Document interne KOST" par défaut)
//
// Chaque template de document (rapport individuel, rapport global,
// procédure incident, guides, feuille de présence…) compose ces deux
// composants avec ses propres champs de métadonnées — jamais son propre
// en-tête/pied de page réinventé.
import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";

export interface DocumentMeta {
  docTitle: string;
  /** Identifiant/version du document lui-même, ex. "RI-1234-v1" —
   * distinct de l'identifiant de l'examen/entreprise ci-dessous. */
  docId: string;
  generatedBy: string;
  generatedAt: string; // déjà formaté (fr-FR) par l'appelant
  classification?: string;
  company?: string;
  groupOrSession?: string;
  function?: string;
  assessmentId?: string | number;
}

export function PdfHeader({ meta }: { meta: DocumentMeta }) {
  const metaItems: { label: string; value: string }[] = [];
  if (meta.company) metaItems.push({ label: "Entreprise", value: meta.company });
  if (meta.groupOrSession) metaItems.push({ label: "Groupe / session", value: meta.groupOrSession });
  if (meta.function) metaItems.push({ label: "Fonction", value: meta.function });
  if (meta.assessmentId !== undefined) metaItems.push({ label: "Examen / évaluation", value: `#${meta.assessmentId}` });

  return (
    <View style={pdfStyles.headerFixed} fixed>
      <View style={pdfStyles.headerTopRow}>
        <View>
          <Text style={pdfStyles.brand}>KOST E-EXAM</Text>
          <Text style={pdfStyles.brandSub}>KOST Academy — moteur d&apos;examen natif, sans dépendance Moodle</Text>
        </View>
        <Text style={pdfStyles.classification}>{meta.classification ?? "Document interne KOST"}</Text>
      </View>
      <Text style={pdfStyles.docTitle}>{meta.docTitle}</Text>
      {metaItems.length > 0 && (
        <View style={pdfStyles.metaGrid}>
          {metaItems.map((m) => (
            <View key={m.label} style={pdfStyles.metaItem}>
              <Text style={pdfStyles.metaLabel}>{m.label}</Text>
              <Text style={pdfStyles.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function PdfFooter({ meta }: { meta: DocumentMeta }) {
  return (
    <View style={pdfStyles.footerFixed} fixed>
      <Text>
        Généré le {meta.generatedAt} par {meta.generatedBy} — Document : {meta.docId}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  );
}
