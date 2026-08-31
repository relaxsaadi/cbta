import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR Algérie — Session de 3 Jours à Alger",
  description:
    "Formation DGR en 3 jours à Alger, méthode CBTA, couvrant les catégories 7.1 à 7.10. Sessions mensuelles, en lien avec la réglementation ANAC.",
  alternates: { canonical: "/formation-dgr-algerie" },
  keywords: [
    "formation IATA DGR Algérie",
    "formation marchandises dangereuses Algérie",
    "CBTA Algérie",
    "IATA DGR Alger",
    "formation DGR ANAC Algérie",
  ],
  openGraph: {
    title: "Formation IATA DGR Algérie — Session de 3 Jours à Alger",
    description:
      "Formation DGR en 3 jours à Alger, méthode CBTA, en lien avec la réglementation ANAC. Places limitées.",
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
        savingsVsParis: 50,
        testimonialName: "Rachid B.",
        testimonialPoste: "Responsable cargo",
        testimonialVille: "Alger",
        testimonialText:
          "Formation sérieuse, formateur expérimenté, évaluation CBTA rigoureuse. Toute mon équipe a terminé la formation en 4 jours. Je recommande vivement.",
        keyFeature: "Formation DGR dispensée localement à Alger, méthode CBTA",
        localContext: {
          title: "Formation DGR en Algérie : cadre ANAC et spécificités du secteur pétro-gazier",
          paragraphs: [
            "En Algérie, la réglementation du transport aérien de marchandises dangereuses relève de l'ANAC (Autorité Nationale de l'Aviation Civile), qui applique les standards de l'Annexe 18 de l'OACI ainsi que les Instructions Techniques IATA. Tout transitaire, agent de fret ou compagnie aérienne opérant depuis le territoire algérien doit certifier son personnel DGR avant toute manipulation de marchandises réglementées, avec un renouvellement obligatoire tous les 24 mois.",
            "Air Algérie, compagnie nationale, ainsi que les compagnies étrangères desservant Alger, exigent une certification IATA DGR à jour de la part de leurs agents cargo et de leurs partenaires de handling. L'aéroport Houari Boumédiène concentre l'essentiel du fret aérien international du pays, tandis que des plateformes régionales comme Oran, Constantine et Annaba traitent des volumes croissants.",
            "L'Algérie étant un pays producteur d'hydrocarbures majeur, le secteur pétrolier et gazier (échantillons, produits chimiques, équipements sous pression liés à l'exploration et à la production) génère un volume important d'expéditions classées marchandises dangereuses, notamment depuis les zones d'activité de Hassi Messaoud. KOST GROUP propose d'ailleurs un programme dédié aux professionnels du pétrole et du gaz en complément de la formation DGR générale.",
            "KOST GROUP dispense ses formations DGR directement à Alger, selon la méthode CBTA, évitant à vos équipes tout déplacement à l'étranger.",
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
