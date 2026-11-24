import type { Metadata } from "next";
import DGRPage from "@/components/DGRPage";
import { getFormationBySlug } from "@/lib/formations";
import { buildFormationMetadata, courseSchema } from "@/lib/page-meta";

const formation = getFormationBySlug("dgr-7-1")!;
export const metadata: Metadata = {
  ...buildFormationMetadata(formation),
  title: "Formation DGR 7.1 IATA Algérie — Expéditeurs",
  description:
    "Formation IATA DGR 7.1 (expéditeurs, packers, transitaires) à Alger avec le seul centre CBTA Provider certifié d'Algérie. 4 jours, examen officiel inclus.",
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
