import type { Metadata } from "next";
import PromosPage from "@/components/PromosPage";

export const metadata: Metadata = {
  title: "Offres Spéciales Formation IATA DGR 2026",
  description:
    "Offres promotionnelles formations IATA DGR CBTA. Pack Groupe, Early Bird, Intra-entreprise. Économisez jusqu'à 25% sur votre certification IATA.",
  alternates: { canonical: "/promos" },
  openGraph: {
    title: "Offres Spéciales Formation IATA DGR 2026",
    description: "Pack Groupe · Early Bird · Intra-entreprise · Économisez jusqu'à 25% sur votre certification IATA.",
    url: "/promos",
  },
};

export default function Page() {
  return <PromosPage />;
}
