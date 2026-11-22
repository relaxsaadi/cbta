import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Sénégal — KOST GROUP",
  description:
    "Parcours de formation DGR / CBTA au Sénégal à définir selon les tâches exercées. Sources, autorisations, évaluation et modalités à vérifier avant inscription.",
  alternates: { canonical: "/formation-dgr-senegal" },
  keywords: [
    "formation IATA DGR Sénégal",
    "formation marchandises dangereuses Dakar",
    "DGR Sénégal",
    "CBTA Dakar",
    "formation DGR ANAC Sénégal",
  ],
  openGraph: {
    title: "Parcours DGR / CBTA au Sénégal — KOST GROUP",
    description:
      "Formation marchandises dangereuses selon les tâches et exigences applicables. Aucune reconnaissance ou intervention sur site n'est garantie automatiquement.",
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
        keyFeature: "Périmètre et modalités à confirmer après analyse des tâches",
        localContext: {
          title: "Formation DGR au Sénégal : réglementation ANACIM et enjeux du hub Afrique de l'Ouest",
          paragraphs: [
            "Les exigences de formation au transport aérien de marchandises dangereuses dépendent des tâches réellement exercées, des sources en vigueur, de l'autorité compétente et des procédures des opérateurs. Une fonction CBTA ne se déduit pas du seul intitulé de poste.",
            "KOST peut étudier un besoin de formation sous réserve des règles et autorisations locales applicables. Lieu, dates, prix, évaluation, certificat et conditions de reconnaissance doivent être confirmés par proposition écrite ; aucune reconnaissance universelle IATA ou nationale n'est garantie.",
          ],
          aeroports: [
            "Aéroport International Blaise Diagne — Dakar (DSS)",
            "Aéroport Léopold Sédar Senghor — Dakar (DKR, fret domestique)",
            "Ziguinchor (ZIG)",
          ],
        },
      }}
    />
  );
}
