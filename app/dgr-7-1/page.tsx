import type { Metadata } from "next";
import DGRPage from "@/components/DGRPage";
import { getFormationBySlug } from "@/lib/formations";
import { courseSchema } from "@/lib/page-meta";

const formation = getFormationBySlug("dgr-7-1")!;
export const metadata: Metadata = {
  title: "Formation DGR 7.1 en Algérie — KOST Academy",
  description:
    "Programme DGR 7.1 en Algérie. Contenu adapté aux tâches réelles et aux exigences réglementaires vérifiées. Contactez KOST pour définir vos besoins.",
  alternates: { canonical: `/${formation.slug}` },
  openGraph: {
    title: "Formation DGR 7.1 en Algérie — KOST Academy",
    description: "Programme DGR 7.1 à définir selon les tâches exercées et les sources réglementaires vérifiées.",
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
