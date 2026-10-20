import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA Algérie — Périmètre par Fonction",
  description:
    "Formation DGR / CBTA en Algérie. Le périmètre 7.1 à 7.10 est déterminé à partir des tâches réelles, des sources courantes applicables et de la revue requise pour chaque fonction.",
  alternates: { canonical: "/formation-dgr-algerie" },
  keywords: [
    "formation DGR Algérie",
    "formation marchandises dangereuses Algérie",
    "CBTA Algérie",
    "DGR Alger",
    "formation DGR aviation Algérie",
  ],
  openGraph: {
    title: "Formation DGR / CBTA Algérie — Périmètre par Fonction",
    description:
      "Parcours DGR / CBTA 7.1 à 7.10 en Algérie, avec périmètre déterminé à partir des tâches et sources applicables. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
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
        savingsVsParis: 0,
      }}
    />
  );
}
