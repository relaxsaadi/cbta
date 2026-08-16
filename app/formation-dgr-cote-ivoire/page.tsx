import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR en Côte d'Ivoire — Centre CBTA Certifié",
  description:
    "Formation IATA DGR-CBTA certifiée pour les professionnels de Côte d'Ivoire. Sessions à Abidjan ou intra-entreprise. Conforme ANAC CI & OACI. Certificat valable 24 mois.",
  alternates: { canonical: "/formation-dgr-cote-ivoire" },
  keywords: [
    "formation IATA DGR Côte d'Ivoire",
    "formation marchandises dangereuses Abidjan",
    "DGR Côte d'Ivoire",
    "CBTA Abidjan",
    "formation DGR ANAC Côte d'Ivoire",
  ],
  openGraph: {
    title: "Formation IATA DGR en Côte d'Ivoire — KOST GROUP",
    description:
      "Formation DGR CBTA certifiée pour les professionnels du fret aérien en Côte d'Ivoire.",
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
        savingsVsParis: 55,
        testimonialName: "Adjoua K.",
        testimonialPoste: "Responsable logistique",
        testimonialVille: "Abidjan",
        testimonialText:
          "Centre sérieux, formateur certifié IATA, programme conforme DGR 63e édition. Notre équipe est opérationnelle et conforme OACI.",
        keyFeature: "Formation intra-entreprise disponible à Abidjan — votre équipe reste sur place",
        localContext: {
          title: "Formation DGR en Côte d'Ivoire : cadre ANAC CI et enjeux du hub d'Abidjan",
          paragraphs: [
            "En Côte d'Ivoire, le transport aérien de marchandises dangereuses est encadré par l'ANAC CI (Autorité Nationale de l'Aviation Civile de Côte d'Ivoire), qui applique l'Annexe 18 de l'OACI et les Instructions Techniques IATA. Tout acteur de la chaîne cargo aérien — transitaire, agent de fret, compagnie aérienne ou expéditeur — doit certifier son personnel DGR avant toute manutention de marchandises réglementées, avec un renouvellement obligatoire tous les 24 mois.",
            "L'aéroport Félix-Houphouët-Boigny d'Abidjan est la principale porte d'entrée du fret aérien ivoirien et un hub régional pour l'Afrique de l'Ouest. Air Côte d'Ivoire, en développement sur son réseau régional, ainsi que les compagnies étrangères desservant Abidjan, exigent une certification IATA DGR valide de leurs agents cargo et partenaires de handling agréés.",
            "La Côte d'Ivoire est un exportateur majeur de produits agricoles (cacao, café, anacarde) et importe des volumes croissants de produits chimiques, pharmaceutiques et d'équipements industriels — catégories fréquemment soumises à la réglementation marchandises dangereuses (batteries lithium, liquides inflammables, matières corrosives). Une équipe certifiée DGR IATA réduit le risque de refus d'embarquement ou de blocage douanier pour vos expéditions.",
            "KOST GROUP organise des sessions de formation DGR IATA intra-entreprise à Abidjan dès 6 participants, assurées par des formateurs IATA certifiés qui se déplacent directement sur votre site. Le certificat CBTA délivré est identique à celui obtenu à Paris ou Bruxelles, à un tarif nettement inférieur, et reconnu par l'ANAC CI ainsi que par les 300+ compagnies membres de l'IATA.",
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
