import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Cameroun — Périmètre par Fonction",
  description:
    "Formation DGR / CBTA au Cameroun. Le périmètre 7.1 à 7.10 est déterminé à partir des tâches réelles, des sources courantes applicables et de la revue requise pour chaque fonction.",
  alternates: { canonical: "/formation-dgr-cameroun" },
  keywords: [
    "formation DGR Cameroun",
    "formation marchandises dangereuses Douala",
    "DGR Cameroun",
    "CBTA Douala",
    "formation DGR aviation Cameroun",
  ],
  openGraph: {
    title: "Formation DGR / CBTA au Cameroun — Périmètre par Fonction",
    description:
      "Parcours DGR / CBTA 7.1 à 7.10 au Cameroun, avec périmètre déterminé à partir des tâches et sources applicables. Aucune fonction n'est attribuée automatiquement selon l'intitulé du poste.",
    url: "https://dgr.kostacademy.com/formation-dgr-cameroun",
  },
};

export default function Page() {
  return (
    <CountryLandingPage
      data={{
        slug: "formation-dgr-cameroun",
        pays: "Cameroun",
        paysPreposition: "au",
        capitale: "Douala",
        autoriteRegionale: "la CCAA (Cameroon Civil Aviation Authority)",
        codeIso: "CM",
        langue: "fr",
        savingsVsParis: 0,
      }}
    />
  );
}
