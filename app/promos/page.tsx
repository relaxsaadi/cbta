import type { Metadata } from "next";
import PromosPage from "@/components/PromosPage";

export const metadata: Metadata = {
  title: "Offres Spéciales IATA DGR 2026 — KOST GROUP",
  description:
    "Offres promotionnelles formations IATA DGR CBTA. Pack Groupe, Early Bird, Formation intra-entreprise à prix réduit. Économisez jusqu'à 30% sur votre certification IATA.",
  alternates: { canonical: "/promos" },
  openGraph: {
    title: "Promos Formations IATA DGR — KOST GROUP",
    description: "Pack Groupe · Early Bird · Intra-entreprise · Économisez jusqu'à 30% sur votre certification IATA.",
    url: "/promos",
  },
};

export default function Page() {
  return <PromosPage />;
}
