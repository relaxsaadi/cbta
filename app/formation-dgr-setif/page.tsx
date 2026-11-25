import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Sétif | Intra ou à distance";
const description =
  "Formation DGR Sétif : intra chez le client, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-setif",
  locale: "fr",
  keywords: ["formation DGR Sétif", "formation DGR Setif", "CBTA Sétif", "marchandises dangereuses Sétif"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-setif"
      eyebrow="Sétif · pas de centre local"
      h1="Formation DGR Sétif"
      description={description}
      lead={[
        "Formation DGR Sétif : KOST Academy accompagne les entreprises de Sétif en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger.",
        `KOST Academy est un ${OFFICIAL_FR}. Il n'y a pas de centre KOST à Sétif. Le présentiel au centre est à Alger, 176 Cité Boushaki, Bab Ezzouar. L'URL est sans accent (/formation-dgr-setif) ; le titre et le H1 gardent l'accent. Paris est une implantation de KOST, sans session décrite ici. Aucun montant n'est publié.`,
      ]}
      sections={[
        {
          id: "concernes",
          title: "Entreprises de Sétif concernées",
          paragraphs: [
            "Sétif est une ville intérieure de logistique, de transit, d'industrie et d'aéroport. L'aéroport 8 Mai 1945, sur la commune d'Aïn Arnat, est la plateforme aérienne du bassin. Les équipes visées préparent, acceptent, manutentionnent ou contrôlent des marchandises dangereuses qui partent ou arrivent par vol. Il n'y a pas de port à Sétif : ne transposez pas le cadrage de Béjaïa ou d'Annaba.",
            "L'industrie et les transitaires de la ville peuvent expédier des colis classés sans être une compagnie. Le secteur ne choisit pas la fonction. On note les tâches : classification, emballage, documents, acceptation, stockage, chargement, contrôle. Constantine, autre pôle de l'est intérieur, a sa page si des participants y sont basés.",
            "Certains envois quittent Sétif par la route vers Alger avant le vol, d'autres sont remis à l'aéroport 8 Mai 1945. Les deux cas peuvent relever d'une formation marchandises dangereuses aériennes dès que les tâches portent sur la préparation ou le traitement pour l'avion. Le trajet routier intermédiaire n'est pas traité ici comme un régime ADR. Dites si vos gens préparent le dossier à Sétif, s'ils accompagnent le colis jusqu'à l'aéroport local, ou s'ils le remettent à un transitaire d'Alger. Cette précision évite de former une équipe entière alors que deux personnes signent les documents. Béjaïa, plus proche du port, ne sert de modèle que si vous y avez aussi du personnel.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "L'intra a lieu dans les locaux du client à Sétif. La classe virtuelle est animée depuis Alger. Le présentiel au centre a lieu à Bab Ezzouar. Il n'y a pas de salle KOST à Sétif ni à Aïn Arnat.",
            "Si le groupe est réparti entre Sétif et un autre site, dites-le. La proposition peut retenir la classe virtuelle plutôt qu'un déplacement, ou l'inverse. Ce choix n'est pas figé ici.",
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les dix fonctions couvrent des travaux différents, de la préparation des expéditions au contrôle de sûreté. Deux salariés du même transitaire peuvent ne pas relever de la même fonction. Les pages 7.1 à 7.10 détaillent chaque entrée sans copier la structure de 7.1.",
            "Le cadre algérien à ouvrir avant inscription est l'ANAC, l'IT 38-25, l'Annexe 18 de l'OACI, le Doc 9284 et le DGR IATA dans l'édition utilisée par l'entreprise. Une exigence d'opérateur se lit dans son manuel.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'ANAC ou l'opérateur. Cette page ne publie pas de date de fin. Le renouvellement suit les tâches actuelles.",
            "Voir recyclage DGR 24 mois. Distinguez dans la demande les personnes déjà formées et celles qui débutent.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez Sétif avec ou sans accent. Ajoutez les tâches, les effectifs, et la modalité : intra à Sétif, classe virtuelle, ou présentiel à Bab Ezzouar. Mentionnez Béjaïa ou Constantine seulement si des participants y travaillent.",
            "Formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383. La réponse est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "L'URL sans accent est-elle la bonne page ?",
          a: "Oui. /formation-dgr-setif est l'adresse. Le titre et le H1 restent « Formation DGR Sétif ».",
        },
        {
          q: "Y a-t-il un centre à Sétif ?",
          a: "Non. Intra chez le client, classe virtuelle depuis Alger, ou présentiel à Bab Ezzouar.",
        },
        {
          q: "L'aéroport 8 Mai 1945 change-t-il la fonction ?",
          a: "Il situe les vols. La fonction 7.1 à 7.10 suit les tâches, pas le nom de l'aéroport.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/formation-dgr-constantine", label: "Formation DGR Constantine" },
        { href: "/formation-dgr-bejaia", label: "Formation DGR Béjaïa" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Sétif", path: "/formation-dgr-setif" },
      ]}
      ctaTitle="Demander une proposition pour Sétif"
      ctaText="Précisez l'intra à Sétif, la classe virtuelle, ou le présentiel à Bab Ezzouar."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Sétif."
    />
  );
}
