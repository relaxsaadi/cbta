import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR au Sénégal — Centre CBTA Afrique",
  description:
    "Formation IATA DGR-CBTA certifiée pour les professionnels du Sénégal. Sessions à Dakar ou intra-entreprise. Conforme ANAC Sénégal & OACI. Certificat reconnu mondialement.",
  alternates: { canonical: "/formation-dgr-senegal" },
  keywords: [
    "formation IATA DGR Sénégal",
    "formation marchandises dangereuses Dakar",
    "DGR Sénégal",
    "CBTA Dakar",
    "formation DGR ANAC Sénégal",
  ],
  openGraph: {
    title: "Formation IATA DGR au Sénégal — KOST GROUP",
    description:
      "Formation DGR CBTA certifiée pour les professionnels du transport aérien au Sénégal.",
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
        savingsVsParis: 55,
        testimonialName: "Ibrahima D.",
        testimonialPoste: "Superviseur cargo",
        testimonialVille: "Dakar",
        testimonialText:
          "Nous avons pu certifier toute notre équipe sans envoyer nos agents en Europe. Formation complète, examen officiel CBTA, certificat IATA reconnu.",
        keyFeature: "Économisez le coût des billets et hôtels pour former votre équipe en Europe",
        localContext: {
          title: "Formation DGR au Sénégal : réglementation ANACIM et enjeux du hub Afrique de l'Ouest",
          paragraphs: [
            "Au Sénégal, la réglementation du transport aérien de marchandises dangereuses est placée sous la responsabilité de l'ANACIM (Agence Nationale de l'Aviation Civile et de la Météorologie). Conformément aux standards de l'OACI et aux Instructions Techniques IATA, toute personne impliquée dans la préparation, l'acceptation ou la manutention de marchandises dangereuses par voie aérienne doit détenir une certification DGR IATA à jour, renouvelée tous les 24 mois.",
            "L'AIBD (Aéroport International Blaise Diagne), inauguré en 2017, positionne Dakar comme un hub stratégique pour le fret aérien en Afrique de l'Ouest. Air Sénégal, en plein essor, renforce ses routes cargo régionales vers l'Europe, le Moyen-Orient et les pays voisins. Cette croissance amplifie les obligations DGR pour les transitaires, agents handling et expéditeurs sénégalais.",
            "Le Sénégal connaît une forte expansion de ses exportations agricoles (mangues, haricots verts, produits halieutiques) et de ses importations de produits chimiques et pharmaceutiques — deux catégories soumises à des réglementations marchandises dangereuses strictes (lithium, gaz sous pression, liquides inflammables). La certification de vos équipes est non seulement obligatoire, mais un avantage concurrentiel sur le marché régional.",
            "Avec KOST GROUP, vos équipes sénégalaises obtiennent une certification IATA DGR officielle à un tarif jusqu'à 55 % inférieur aux tarifs européens, sans coût de déplacement international. Nos formateurs se déplacent à Dakar pour des sessions intra-entreprise dès 6 participants, avec facturation possible en FCFA ou en euros.",
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
