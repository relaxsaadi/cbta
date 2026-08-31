import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR au Cameroun — Méthode CBTA",
  description:
    "Formation DGR pour les professionnels du Cameroun, méthode CBTA. Sessions à Douala ou Yaoundé, ou intra-entreprise, en lien avec la réglementation CCAA & OACI.",
  alternates: { canonical: "/formation-dgr-cameroun" },
  keywords: [
    "formation IATA DGR Cameroun",
    "formation marchandises dangereuses Douala",
    "DGR Cameroun",
    "CBTA Douala",
    "formation DGR CCAA Cameroun",
  ],
  openGraph: {
    title: "Formation IATA DGR au Cameroun — KOST GROUP",
    description:
      "Formation DGR, méthode CBTA, pour le transport aérien de marchandises dangereuses au Cameroun.",
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
        savingsVsParis: 50,
        testimonialName: "Emmanuel N.",
        testimonialPoste: "Agent de fret international",
        testimonialVille: "Douala",
        testimonialText:
          "Formation professionnelle, évaluation CBTA rigoureuse. Notre compagnie aérienne partenaire a accepté le certificat sans difficulté. Je recommande KOST GROUP.",
        keyFeature: "Disponible en intra-entreprise à Douala ou Yaoundé",
        localContext: {
          title: "Formation DGR au Cameroun : obligations CCAA et enjeux du hub Afrique centrale",
          paragraphs: [
            "La Cameroon Civil Aviation Authority (CCAA) est l'autorité compétente pour la réglementation du transport aérien de marchandises dangereuses au Cameroun. Alignée sur les normes de l'OACI (Annexe 18) et les Instructions Techniques de l'IATA, la CCAA impose à tout opérateur du secteur cargo aérien — transitaires, agents de fret, compagnies aériennes et expéditeurs — de former et certifier leur personnel DGR avant toute manipulation de matières réglementées.",
            "Douala, principal hub économique et aéroportuaire du Cameroun, concentre l'essentiel des flux de fret aérien d'Afrique centrale. Camair-Co assure des liaisons régionales et la présence de majors pétrolières comme TotalEnergies génère un volume important d'expéditions soumises à la réglementation DGR (hydrocarbures, produits chimiques, équipements sous pression). La certification de vos équipes est une obligation légale et une condition sine qua non pour maintenir vos accréditations cargo.",
            "Le secteur minier et forestier camerounais, en plein développement, implique également l'export de produits classés en marchandises dangereuses (batteries lithium pour équipements industriels, matières corrosives, explosifs de carrière). Une équipe certifiée DGR IATA garantit la conformité de vos déclarations d'expédition et réduit le risque de refus à l'embarquement ou de blocage en douane.",
            "KOST GROUP organise des sessions de formation DGR intra-entreprise à Douala ou Yaoundé dès 6 participants, méthode CBTA. Le coût est jusqu'à 50 % inférieur aux centres de formation européens.",
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
