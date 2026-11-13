import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA en Côte d'Ivoire — KOST GROUP",
  description:
    "Parcours de formation DGR / CBTA en Côte d'Ivoire à définir selon les tâches exercées. Sources, autorisations, évaluation et modalités à vérifier avant inscription.",
  alternates: { canonical: "/formation-dgr-cote-ivoire" },
  keywords: [
    "formation IATA DGR Côte d'Ivoire",
    "formation marchandises dangereuses Abidjan",
    "DGR Côte d'Ivoire",
    "CBTA Abidjan",
    "formation DGR ANAC Côte d'Ivoire",
  ],
  openGraph: {
    title: "Parcours DGR / CBTA en Côte d'Ivoire — KOST GROUP",
    description:
      "Formation marchandises dangereuses selon les tâches et exigences applicables. Aucune reconnaissance ou intervention sur site n'est garantie automatiquement.",
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
        keyFeature: "Périmètre et modalités à confirmer après analyse des tâches",
        localContext: {
          title: "Formation DGR en Côte d'Ivoire : cadre ANAC CI et enjeux du hub d'Abidjan",
          paragraphs: [
            "Les exigences de formation au transport aérien de marchandises dangereuses dépendent des tâches réellement exercées, des sources en vigueur, de l'autorité compétente et des procédures des opérateurs. Une fonction CBTA ne se déduit pas du seul intitulé de poste.",
            "KOST peut étudier un besoin de formation sous réserve des règles et autorisations locales applicables. Lieu, dates, prix, évaluation, certificat et conditions de reconnaissance doivent être confirmés par proposition écrite ; aucune reconnaissance universelle IATA ou nationale n'est garantie.",
          ],
          aeroports: [
            "Félix-Houphouët-Boigny — Abidjan (ABJ)",
            "Yamoussoukro (ASK)",
            "Bouaké (BYK)",
            "San Pedro (SPY)",
          ],
        },
      }}
    />
  );
}
