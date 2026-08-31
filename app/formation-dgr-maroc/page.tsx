import type { Metadata } from "next";
import CountryLandingPage from "@/components/CountryLandingPage";

export const metadata: Metadata = {
  title: "Formation IATA DGR au Maroc — Méthode CBTA",
  description:
    "Formation DGR pour les professionnels du Maroc, méthode CBTA. Sessions à Casablanca ou intra-entreprise, en lien avec la réglementation DGAC Maroc & OACI.",
  alternates: { canonical: "/formation-dgr-maroc" },
  keywords: [
    "formation IATA DGR Maroc",
    "formation marchandises dangereuses Maroc",
    "DGR Casablanca",
    "CBTA Maroc",
    "formation DGR DGAC Maroc",
  ],
  openGraph: {
    title: "Formation IATA DGR au Maroc — KOST GROUP",
    description:
      "Formation DGR, méthode CBTA, pour transitaires, cargo aérien et compagnies au Maroc.",
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
        savingsVsParis: 45,
        testimonialName: "Karim E.",
        testimonialPoste: "Agent de fret aérien",
        testimonialVille: "Casablanca",
        testimonialText:
          "Formation de qualité, contenu à jour de l'édition IATA DGR en vigueur. L'évaluation CBTA est rigoureuse mais le formateur nous a très bien préparés.",
        keyFeature: "Formation DGR méthode CBTA, sans se déplacer en Europe",
        localContext: {
          title: "Formation DGR au Maroc : contexte réglementaire et enjeux sectoriels",
          paragraphs: [
            "Le transport aérien de marchandises dangereuses au Maroc est encadré par la DGAC Maroc (Direction Générale de l'Aviation Civile), conformément à l'Annexe 18 de l'OACI et aux Instructions Techniques de l'IATA. Toute entreprise impliquée dans l'expédition, l'acceptation ou la manutention de marchandises dangereuses par voie aérienne est légalement tenue de former et certifier son personnel selon les normes DGR IATA en vigueur.",
            "Royal Air Maroc (RAM) et Air Arabia Maroc appliquent des politiques DGR strictes à leurs agents de fret agréés (AFA), transitaires et partenaires cargo. Un certificat IATA DGR valide est exigé pour tout intervenant dans la chaîne logistique aérienne. Sans certification conforme, vos expéditions risquent d'être bloquées ou refusées au départ, avec des pénalités pouvant aller jusqu'à la suspension de l'agrément cargo.",
            "Les secteurs chimique, pharmaceutique, cosmétique et pétrolier marocains sont particulièrement concernés par la réglementation marchandises dangereuses. Les plateformes logistiques de la zone franche de Tanger Med — premier port de conteneurs d'Afrique — génèrent également un volume important de fret aérien réglementé.",
            "Faire appel à KOST GROUP vous permet de former vos équipes selon la méthode CBTA à un tarif jusqu'à 45 % inférieur à celui pratiqué à Paris ou Bruxelles. Nos formateurs peuvent se déplacer directement dans vos locaux à Casablanca, Marrakech ou Agadir dès 6 participants, ou vous accueillir en session inter-entreprises à Alger.",
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
