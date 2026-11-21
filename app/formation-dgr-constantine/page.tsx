import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Constantine | Intra ou distance";
const description =
  "Formation DGR Constantine : intra chez le client, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-constantine",
  locale: "fr",
  keywords: ["formation DGR Constantine", "CBTA Constantine", "marchandises dangereuses Constantine", "DGR est Algérie"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-constantine"
      eyebrow="Constantine · pas de centre local"
      h1="Formation DGR Constantine"
      description={description}
      lead={[
        "Formation DGR Constantine : KOST Academy accompagne les entreprises de Constantine en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger.",
        `KOST Academy est un ${OFFICIAL_FR}. Il n'y a pas de centre KOST à Constantine. Le centre est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y décrit pas de salle. Aucun montant n'est publié.`,
      ]}
      sections={[
        {
          id: "concernes",
          title: "Entreprises de Constantine concernées",
          paragraphs: [
            "La recherche vient d'équipes de logistique, de transit, d'aéroport et d'industrie basées à Constantine et dans l'est intérieur. L'aéroport Mohamed Boudiaf (CZL) est la plateforme aérienne de la ville. Les transitaires qui y préparent ou y suivent des envois, les industriels qui expédient un colis classé, et les personnels qui acceptent ou manutentionnent du fret aérien sont les publics visés.",
            "Constantine n'est pas Annaba : le port et l'aéroport d'Annaba ont leur page. Ce n'est pas non plus Sétif. Le point commun est l'absence de centre KOST. La différence est le bassin de tâches. Décrivez si le travail est la préparation d'une expédition, l'acceptation, l'entrepôt, ou un contrôle de sûreté. Le nom de la ville ne tranche pas.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "L'intra se tient dans les locaux du client à Constantine. La classe virtuelle est animée depuis Alger. Le présentiel au centre se tient à Bab Ezzouar, pour les participants qui s'y rendent. Aucune de ces formules n'ouvre une salle KOST à Constantine, ni à l'aéroport Mohamed Boudiaf.",
            "Le choix dépend du nombre de personnes, de la dispersion entre la ville et d'éventuels sites voisins, et des tâches. Il est confirmé par écrit.",
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les fonctions vont de la préparation des expéditions à la sûreté, en passant par le fret général, l'acceptation, la manutention, les passagers, la planification du chargement et les équipages. Deux agents au même intitulé peuvent relever de fonctions différentes. On part des gestes : classer, emballer, documenter, accepter, stocker, charger, filtrer.",
            "Les pages 7.1 à 7.10 servent de repère. La structure de 7.1 n'est pas copiée sur les autres. Une ancienne catégorie, y compris la catégorie 6, ne s'applique pas automatiquement.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'ANAC ou l'opérateur. Ce n'est pas une date d'expiration affichée ici. Le recyclage repart des tâches actuelles, pas de l'intitulé de la session précédente.",
            "Le détail est sur la page recyclage DGR 24 mois. Indiquez dans la demande qui est en parcours initial et qui est en renouvellement.",
          ],
        },
        {
          id: "cadre",
          title: "Cadre ANAC à vérifier avant inscription",
          paragraphs: [
            "Même si la session a lieu à Constantine en intra ou à distance, le cadre algérien reste celui de l'ANAC, de l'instruction technique n° 38-25 du 13 février 2025, de l'Annexe 18 de l'OACI, du Doc 9284 et du DGR IATA courant. Une consigne d'opérateur s'y ajoute si elle existe.",
            "La page IT ANAC 38-25 formation renvoie vers le texte officiel. Elle ne conclut pas à la place de l'entreprise sur un envoi au départ de Constantine ou d'Alger.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Indiquez les tâches, le nombre de personnes, et la modalité : intra à Constantine, classe virtuelle, ou présentiel à Bab Ezzouar. Les pages Annaba et Sétif existent pour d'autres villes de l'est ; ne les utilisez que si des participants y sont réellement basés.",
            "Écrivez via le formulaire, à cbta@kostacademy.com ou sur WhatsApp +213 542 305 383. La réponse est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre à Constantine ?",
          a: "Non. Les modalités sont l'intra chez le client, la classe virtuelle depuis Alger, ou le présentiel à Bab Ezzouar.",
        },
        {
          q: "L'aéroport Mohamed Boudiaf impose-t-il une fonction ?",
          a: "Non. Il situe les vols. La fonction 7.1 à 7.10 suit les tâches.",
        },
        {
          q: "Cette page remplace-t-elle celle d'Annaba ?",
          a: "Non. Annaba a sa page, notamment pour le port et son aéroport. Constantine vise la logistique, le transit, l'aéroport Mohamed Boudiaf et l'industrie de la ville.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/formation-dgr-annaba", label: "Formation DGR Annaba" },
        { href: "/formation-dgr-setif", label: "Formation DGR Sétif" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Constantine", path: "/formation-dgr-constantine" },
      ]}
      ctaTitle="Demander une proposition pour Constantine"
      ctaText="Précisez l'intra à Constantine, la classe virtuelle, ou le présentiel à Bab Ezzouar."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Constantine."
    />
  );
}
