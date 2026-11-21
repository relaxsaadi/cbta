import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Maroc — Périmètre par Fonction",
  description:
    "Formation DGR / CBTA au Maroc. Le périmètre 7.1 à 7.10 est déterminé à partir des tâches réelles, des sources courantes applicables et de la revue requise pour chaque fonction.",
  alternates: { canonical: "/formation-dgr-maroc" },
  keywords: [
    "formation DGR Maroc",
    "formation marchandises dangereuses Maroc",
    "DGR Casablanca",
    "CBTA Maroc",
    "formation DGR aviation Maroc",
  ],
  openGraph: {
    title: "Formation DGR / CBTA au Maroc — Périmètre par Fonction",
    description:
      "Parcours DGR / CBTA 7.1 à 7.10 au Maroc, avec périmètre déterminé à partir des tâches et sources applicables. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
    url: "https://dgr.kostacademy.com/formation-dgr-maroc",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "formation-dgr-maroc",
        pays: "Maroc",
        paysPreposition: "au",
        capitale: "Casablanca",
        autoriteRegionale: "la DGAC Maroc (Direction Générale de l'Aviation Civile)",
        codeIso: "MA",
        langue: "fr",
        savingsVsParis: 0,
      }}
    />
  );
}
