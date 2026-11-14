import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Sénégal — Périmètre par Fonction",
  description:
    "Formation DGR / CBTA au Sénégal. Le périmètre 7.1 à 7.10 est déterminé à partir des tâches réelles, des sources courantes applicables et de la revue requise pour chaque fonction.",
  alternates: { canonical: "/formation-dgr-senegal" },
  keywords: [
    "formation DGR Sénégal",
    "formation marchandises dangereuses Dakar",
    "DGR Sénégal",
    "CBTA Dakar",
    "formation DGR aviation Sénégal",
  ],
  openGraph: {
    title: "Formation DGR / CBTA au Sénégal — Périmètre par Fonction",
    description:
      "Parcours DGR / CBTA 7.1 à 7.10 au Sénégal, avec périmètre déterminé à partir des tâches et sources applicables. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
    url: "https://dgr.kostacademy.com/formation-dgr-senegal",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "formation-dgr-senegal",
        pays: "Sénégal",
        paysPreposition: "au",
        capitale: "Dakar",
        autoriteRegionale: "l'ANAC Sénégal (Autorité Nationale de l'Aviation Civile du Sénégal)",
        codeIso: "SN",
        langue: "fr",
        savingsVsParis: 0,
      }}
    />
  );
}
