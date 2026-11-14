import type { Metadata } from "next";
import PromosPage from "@/components/PromosPage";

export const metadata: Metadata = {
  title: "Offres Formation DGR / CBTA — KOST GROUP",
  description:
    "Demandez une proposition écrite pour une formation DGR / CBTA. Prix, remises, dates, durée, modalités et documents délivrés sont confirmés pour l'offre concernée.",
  alternates: { canonical: "/promos" },
  openGraph: {
    title: "Offres Formation DGR / CBTA — KOST GROUP",
    description:
      "Conditions commerciales sur devis, séparées de la validation réglementaire et du choix de la fonction CBTA.",
    url: "/promos",
  },
};

export default function Page() {
  return <PromosPage />;
}
