import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA en Algérie — KOST GROUP",
  description:
    "Parcours de formation DGR / CBTA en Algérie à définir selon les tâches exercées. Sources, autorisations, évaluation et modalités à vérifier avant inscription.",
  alternates: { canonical: "/formation-dgr-algerie" },
  keywords: [
    "formation IATA DGR Algérie",
    "formation marchandises dangereuses Algérie",
    "CBTA Algérie",
    "IATA DGR Alger",
    "formation DGR ANAC Algérie",
  ],
  openGraph: {
    title: "Parcours DGR / CBTA en Algérie — KOST GROUP",
    description:
      "Formation marchandises dangereuses selon les tâches et exigences applicables. Aucune reconnaissance ou intervention sur site n'est garantie automatiquement.",
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
        keyFeature: "Périmètre et modalités à confirmer après analyse des tâches",
        localContext: {
          title: "Formation DGR en Algérie : cadre ANAC et spécificités du secteur pétro-gazier",
          paragraphs: [
            "Les exigences de formation au transport aérien de marchandises dangereuses dépendent des tâches réellement exercées, des sources en vigueur, de l'autorité compétente et des procédures des opérateurs. Une fonction CBTA ne se déduit pas du seul intitulé de poste.",
            "KOST peut étudier un besoin de formation sous réserve des règles et autorisations locales applicables. Lieu, dates, prix, évaluation, certificat et conditions de reconnaissance doivent être confirmés par proposition écrite ; aucune reconnaissance universelle IATA ou nationale n'est garantie.",
          ],
          aeroports: [
            "Houari Boumédiène — Alger (ALG)",
            "Ahmed Ben Bella — Oran (ORN)",
            "Mohamed Boudiaf — Constantine (CZL)",
            "Rabah Bitat — Annaba (AAE)",
            "Krim Belkacem — Hassi Messaoud (HME)",
          ],
        },
      }}
    />
  );
}
