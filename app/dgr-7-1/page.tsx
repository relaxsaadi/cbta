import type { Metadata } from "next";
import DGRPage from "@/components/DGRPage";
import { getFormationBySlug } from "@/lib/formations";
import { courseSchema } from "@/lib/page-meta";

const formation = getFormationBySlug("dgr-7-1")!;
export const metadata: Metadata = {
  title: "Formation DGR 7.1 IATA Algérie — Expéditeurs & Fret",
  description:
    "Formation IATA DGR 7.1 : préparez vos expéditions de marchandises dangereuses. CBTA certifié, reconnu par 300+ compagnies IATA. Devis gratuit sous 24h.",
  alternates: { canonical: `/${formation.slug}` },
  openGraph: {
    title: "Formation DGR 7.1 IATA Algérie — Expéditeurs & Fret",
    description: formation.description,
    url: `/${formation.slug}`,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema(formation)) }}
      />
      <DGRPage formation={formation} />
    </>
  );
}
