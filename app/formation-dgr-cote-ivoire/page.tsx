import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR en Côte d'Ivoire — Centre CBTA Certifié",
  description:
    "Formation IATA DGR-CBTA certifiée pour les professionnels de Côte d'Ivoire. Sessions à Abidjan ou intra-entreprise. Conforme ANAC CI & OACI. Certificat valable 24 mois.",
  alternates: { canonical: "/formation-dgr-cote-ivoire" },
  keywords: [
    "formation IATA DGR Côte d'Ivoire",
    "formation marchandises dangereuses Abidjan",
    "DGR Côte d'Ivoire",
    "CBTA Abidjan",
    "formation DGR ANAC Côte d'Ivoire",
  ],
  openGraph: {
    title: "Formation IATA DGR en Côte d'Ivoire — KOST GROUP",
    description:
      "Formation DGR CBTA certifiée pour les professionnels du fret aérien en Côte d'Ivoire.",
    url: "https://dgr.kostacademy.com/formation-dgr-cote-ivoire",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "formation-dgr-cote-ivoire",
        pays: "Côte d'Ivoire",
        paysPreposition: "en",
        capitale: "Abidjan",
        autoriteRegionale: "l'ANAC CI (Autorité Nationale de l'Aviation Civile de Côte d'Ivoire)",
        codeIso: "CI",
        langue: "fr",
        savingsVsParis: 55,
        testimonialName: "Adjoua K.",
        testimonialPoste: "Responsable logistique",
        testimonialVille: "Abidjan",
        testimonialText:
          "Centre sérieux, formateur certifié IATA, programme conforme DGR 63e édition. Notre équipe est opérationnelle et conforme OACI.",
        keyFeature: "Formation intra-entreprise disponible à Abidjan — votre équipe reste sur place",
      }}
    />
  );
}
