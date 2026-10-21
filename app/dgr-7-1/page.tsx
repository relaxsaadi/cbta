import type { Metadata } from "next";
import DGRPage from "@/components/DGRPage";
import { getFormationBySlug } from "@/lib/formations";
import { courseSchema } from "@/lib/page-meta";

const formation = getFormationBySlug("dgr-7-1")!;
export const metadata: Metadata = {
  title: "Formation DGR 7.1 en Algérie — KOST Academy",
  description:
    "Formation DGR 7.1 en Algérie : préparation des expéditions, adaptée aux tâches réelles. Centre CBTA référencé IATA, agréé ANAC.",
  alternates: { canonical: `/${formation.slug}` },
  openGraph: {
    title: "Formation DGR 7.1 en Algérie — KOST Academy",
    description:
      "Formation DGR 7.1 en Algérie : préparation des expéditions, adaptée aux tâches réelles. Centre CBTA référencé IATA, agréé ANAC.",
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
