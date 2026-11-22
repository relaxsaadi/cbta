import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Maroc — KOST GROUP",
  description:
    "Parcours de formation DGR / CBTA au Maroc à définir selon les tâches exercées. Sources, autorisations, évaluation et modalités à vérifier avant inscription.",
  alternates: { canonical: "/formation-dgr-maroc" },
  keywords: [
    "formation IATA DGR Maroc",
    "formation marchandises dangereuses Maroc",
    "DGR Casablanca",
    "CBTA Maroc",
    "formation DGR DGAC Maroc",
  ],
  openGraph: {
    title: "Parcours DGR / CBTA au Maroc — KOST GROUP",
    description:
      "Formation marchandises dangereuses selon les tâches et exigences applicables. Aucune reconnaissance ou intervention sur site n'est garantie automatiquement.",
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
        keyFeature: "Périmètre et modalités à confirmer après analyse des tâches",
        localContext: {
          title: "Formation DGR au Maroc : contexte réglementaire et enjeux sectoriels",
          paragraphs: [
            "Les exigences de formation au transport aérien de marchandises dangereuses dépendent des tâches réellement exercées, des sources en vigueur, de l'autorité compétente et des procédures des opérateurs. Une fonction CBTA ne se déduit pas du seul intitulé de poste.",
            "KOST peut étudier un besoin de formation sous réserve des règles et autorisations locales applicables. Lieu, dates, prix, évaluation, certificat et conditions de reconnaissance doivent être confirmés par proposition écrite ; aucune reconnaissance universelle IATA ou nationale n'est garantie.",
          ],
          aeroports: [
            "Mohammed V — Casablanca (CMN)",
            "Marrakech Menara (RAK)",
            "Agadir Al Massira (AGA)",
            "Fès–Saïss (FEZ)",
            "Tanger Ibn Batouta (TNG)",
          ],
        },
      }}
    />
  );
}
