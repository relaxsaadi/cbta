import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR Algérie — Certification en 3 Jours à Alger",
  description:
    "Obtenez votre certificat IATA DGR en 3 jours à Alger. 1er centre CBTA agréé d'Algérie. Conforme ANAC. Catégories 7.1 à 7.10. Places limitées — prochaine session août 2026.",
  alternates: { canonical: "/formation-dgr-algerie" },
  keywords: [
    "formation IATA DGR Algérie",
    "formation marchandises dangereuses Algérie",
    "CBTA Algérie",
    "IATA DGR Alger",
    "formation DGR ANAC Algérie",
  ],
  openGraph: {
    title: "Formation IATA DGR Algérie — Certification en 3 Jours à Alger",
    description:
      "Certificat IATA DGR en 3 jours à Alger. 1er centre CBTA agréé d'Algérie. Conforme ANAC. Places limitées.",
    url: "https://dgr.kostacademy.com/formation-dgr-algerie",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "formation-dgr-algerie",
        pays: "Algérie",
        paysPreposition: "en",
        capitale: "Alger",
        autoriteRegionale: "l'ANAC (Autorité Nationale de l'Aviation Civile algérienne)",
        codeIso: "DZ",
        langue: "fr",
        savingsVsParis: 50,
        testimonialName: "Rachid B.",
        testimonialPoste: "Responsable cargo",
        testimonialVille: "Alger",
        testimonialText:
          "Formation sérieuse, formateur IATA certifié, examen officiel CBTA. Toute mon équipe est certifiée en 4 jours. Je recommande vivement.",
        keyFeature: "Le seul centre IATA CBTA Provider certifié basé en Algérie",
      }}
    />
  );
}
