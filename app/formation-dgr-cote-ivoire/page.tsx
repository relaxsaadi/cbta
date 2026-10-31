import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA en Côte d'Ivoire — Périmètre par Fonction",
  description:
    "Formation DGR / CBTA en Côte d'Ivoire. Le périmètre 7.1 à 7.10 est déterminé à partir des tâches réelles, des sources courantes applicables et de la revue requise pour chaque fonction.",
  alternates: { canonical: "/formation-dgr-cote-ivoire" },
  keywords: [
    "formation DGR Côte d'Ivoire",
    "formation marchandises dangereuses Abidjan",
    "DGR Côte d'Ivoire",
    "CBTA Abidjan",
    "formation DGR aviation Côte d'Ivoire",
  ],
  openGraph: {
    title: "Formation DGR / CBTA en Côte d'Ivoire — Périmètre par Fonction",
    description:
      "Parcours DGR / CBTA 7.1 à 7.10 en Côte d'Ivoire, avec périmètre déterminé à partir des tâches et sources applicables. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
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
        savingsVsParis: 0,
      }}
    />
  );
}
