import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation DGR / CBTA au Cameroun — KOST GROUP",
  description:
    "Parcours de formation DGR / CBTA au Cameroun à définir selon les tâches exercées. Sources, autorisations, évaluation et modalités à vérifier avant inscription.",
  alternates: { canonical: "/formation-dgr-cameroun" },
  keywords: [
    "formation IATA DGR Cameroun",
    "formation marchandises dangereuses Douala",
    "DGR Cameroun",
    "CBTA Douala",
    "formation DGR CCAA Cameroun",
  ],
  openGraph: {
    title: "Parcours DGR / CBTA au Cameroun — KOST GROUP",
    description:
      "Formation marchandises dangereuses selon les tâches et exigences applicables. Aucune reconnaissance ou intervention sur site n'est garantie automatiquement.",
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
        keyFeature: "Périmètre et modalités à confirmer après analyse des tâches",
        localContext: {
          title: "Formation DGR au Cameroun : obligations CCAA et enjeux du hub Afrique centrale",
          paragraphs: [
            "Les exigences de formation au transport aérien de marchandises dangereuses dépendent des tâches réellement exercées, des sources en vigueur, de l'autorité compétente et des procédures des opérateurs. Une fonction CBTA ne se déduit pas du seul intitulé de poste.",
            "KOST peut étudier un besoin de formation sous réserve des règles et autorisations locales applicables. Lieu, dates, prix, évaluation, certificat et conditions de reconnaissance doivent être confirmés par proposition écrite ; aucune reconnaissance universelle IATA ou nationale n'est garantie.",
          ],
          aeroports: [
            "Douala International (DLA)",
            "Yaoundé Nsimalen (NSI)",
            "Garoua International (GOU)",
            "Bafoussam (BFX)",
          ],
        },
      }}
    />
  );
}
