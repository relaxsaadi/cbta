import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Béjaïa | Intra ou à distance";
const description =
  "Formation DGR Béjaïa : intra chez le client, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-bejaia",
  locale: "fr",
  keywords: ["formation DGR Béjaïa", "formation DGR Bejaia", "CBTA Béjaïa", "marchandises dangereuses Béjaïa"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-bejaia"
      eyebrow="Béjaïa · pas de centre local"
      h1="Formation DGR Béjaïa"
      description={description}
      lead={[
        "Formation DGR Béjaïa : KOST Academy accompagne les entreprises de Béjaïa en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger.",
        `KOST Academy est un ${OFFICIAL_FR}. Il n'y a pas de centre KOST à Béjaïa. L'adresse de présentiel en Algérie est le 176 Cité Boushaki, Bab Ezzouar. L'URL de cette page est sans accent (/formation-dgr-bejaia) ; la requête avec accents reste dans le titre et le H1. KOST est aussi implantée à Paris, sans session décrite ici. Aucun montant n'est publié.`,
      ]}
      sections={[
        {
          id: "concernes",
          title: "Entreprises de Béjaïa concernées",
          paragraphs: [
            "Béjaïa associe un port, l'aéroport Abane Ramdane (BJA), des transitaires et de l'industrie. La formation cherchée ici porte sur les marchandises dangereuses par voie aérienne : préparation d'un envoi qui partira par vol, acceptation, manutention, ou contrôle avant embarquement. Le trafic du port, y compris les flux d'hydrocarbures ou de conteneurs, situe des entreprises. Il ne leur attribue pas une fonction CBTA.",
            "Cette page ne copie pas Annaba, autre ville portuaire, ni Sétif, ville intérieure voisine qui a sa propre page. Si des participants sont à Sétif et d'autres à Béjaïa, décrivez les deux groupes. Le nom de la wilaya ne suffit pas.",
            "L'aéroport Abane Ramdane relie la ville aux vols. Il ne remplace pas la description du travail. Une équipe du port qui prépare un dossier pour un vol au départ de Béjaïa, ou qui remet le colis à Alger pour embarquement, n'a pas les mêmes tâches qu'une équipe qui reste sur un flux maritime. Notez le point de bascule : à partir de quand le colis est traité comme un envoi aérien. C'est ce point, avec les documents signés, qui permet de retenir ou d'écarter une fonction. Les hydrocarbures et les conteneurs expliquent pourquoi des entreprises de Béjaïa cherchent la formation. Ils ne dictent pas 7.1, 7.3 ou 7.4.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "L'intra se tient chez le client à Béjaïa, au port, à l'aéroport ou en ville, selon vos locaux. La classe virtuelle est animée depuis Alger. Le présentiel au centre se tient à Bab Ezzouar. Il n'y a pas de salle KOST à Béjaïa.",
            "La proposition confirme la modalité avec les effectifs et les tâches. Elle ne crée pas d'antenne locale pour répondre à la recherche.",
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les fonctions couvrent la préparation des expéditions, le fret général, l'acceptation des marchandises dangereuses, la manutention et le chargement, les passagers, la planification du chargement, les équipages, le dispatch et la sûreté. Un bureau d'expédition et un poste d'acceptation ne partagent pas la fonction parce qu'ils sont dans la même ville.",
            "Décrivez les documents signés et le moment où le colis est remis pour un vol. Le cadre algérien à vérifier reste l'ANAC, l'IT 38-25 du 13 février 2025, l'Annexe 18 de l'OACI, le Doc 9284 et le DGR IATA courant.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'ANAC ou l'opérateur. Aucune date d'expiration n'est affichée. Une ancienne catégorie ne se reconduit pas sous le même numéro.",
            "Voir la page recyclage DGR 24 mois, et les ancres des pages 7.1 et 7.3 si la fonction est déjà connue.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez « Béjaïa » avec l'accent ou sans : les deux désignent cette page. Ajoutez les tâches, le nombre de personnes, et la modalité : intra, classe virtuelle, ou présentiel à Bab Ezzouar.",
            "La réponse passe par le formulaire, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383. Elle est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Pourquoi l'adresse est-elle sans accent ?",
          a: "L'URL est /formation-dgr-bejaia. Le titre, le H1 et l'amorce gardent « Formation DGR Béjaïa ».",
        },
        {
          q: "Y a-t-il un centre KOST à Béjaïa ?",
          a: "Non. Intra chez le client, classe virtuelle depuis Alger, ou présentiel à Bab Ezzouar.",
        },
        {
          q: "Le port choisit-il la fonction ?",
          a: "Non. Il situe des entreprises. La fonction suit les tâches du transport aérien.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/formation-dgr-setif", label: "Formation DGR Sétif" },
        { href: "/formation-dgr-annaba", label: "Formation DGR Annaba" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Béjaïa", path: "/formation-dgr-bejaia" },
      ]}
      ctaTitle="Demander une proposition pour Béjaïa"
      ctaText="Indiquez l'intra à Béjaïa, la classe virtuelle, ou le présentiel à Bab Ezzouar."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Béjaïa."
    />
  );
}
