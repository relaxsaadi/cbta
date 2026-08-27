// PDF d'un guide (addendum §12-17) — même source (lib/guides.ts) que
// l'écran /guide/*, jamais un contenu ressaisi séparément.
import { Document, Page, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./theme";
import { PdfHeader, PdfFooter, type DocumentMeta } from "./DocumentChrome";
import type { Guide } from "../guides";

const P = { fontSize: 9, color: "#1a1a1a", marginBottom: 6, lineHeight: 1.4 } as const;
const LI = { fontSize: 9, color: "#1a1a1a", marginBottom: 4, lineHeight: 1.4 } as const;

export function GuideDocument({ guide, meta }: { guide: Guide; meta: DocumentMeta }) {
  // Aplatit sections → paragraphes/étapes en une liste plate d'éléments
  // <Text>, chacun avec une clé unique — évite tout Fragment imbriqué
  // (le moteur de rendu de @react-pdf/renderer n'a besoin que de ses
  // primitives natives, pas de la sémantique React DOM habituelle).
  const body = guide.sections.flatMap((section, sIdx) => {
    const items: React.ReactNode[] = [
      <Text key={`h-${sIdx}`} style={pdfStyles.h2}>{section.heading}</Text>,
    ];
    section.paragraphs?.forEach((p, i) => items.push(<Text key={`p-${sIdx}-${i}`} style={P}>{p}</Text>));
    section.steps?.forEach((s, i) => items.push(<Text key={`s-${sIdx}-${i}`} style={LI}>{i + 1}. {s}</Text>));
    return items;
  });

  return (
    <Document title={meta.docTitle} author="KOST E-EXAM" creator="KOST E-EXAM">
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader meta={meta} />
        <Text style={P}>{guide.intro}</Text>
        {body}
        <PdfFooter meta={meta} />
      </Page>
    </Document>
  );
}
