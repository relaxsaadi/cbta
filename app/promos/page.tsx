import type { Metadata } from "next";
import PromosPage from "@/components/PromosPage";

export const metadata: Metadata = {
  title: "Offres Spéciales Formation IATA DGR 2026",
  description:
    "Offres promotionnelles formations IATA DGR, méthode CBTA. Pack Groupe, Early Bird, Intra-entreprise. Économisez jusqu'à 25% sur votre formation DGR.",
  alternates: { canonical: "/promos" },
  openGraph: {
    title: "Offres Spéciales Formation IATA DGR 2026",
    description: "Pack Groupe · Early Bird · Intra-entreprise · Économisez jusqu'à 25% sur votre formation DGR.",
    url: "/promos",
  },
};

export default function Page() {
  return <PromosPage />;
}
