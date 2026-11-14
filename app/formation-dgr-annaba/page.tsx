import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Annaba | Intra ou à distance";
const description =
  "Formation DGR Annaba : intra chez le client, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-annaba",
  locale: "fr",
  keywords: ["formation DGR Annaba", "CBTA Annaba", "marchandises dangereuses Annaba", "DGR port Annaba"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-annaba"
      eyebrow="Annaba · pas de centre local"
      h1="Formation DGR Annaba"
      description={description}
      lead={[
        "Formation DGR Annaba : KOST Academy accompagne les entreprises d'Annaba en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger.",
        `KOST Academy est un ${OFFICIAL_FR}. Il n'y a pas de centre KOST à Annaba. Le centre est à Alger, 176 Cité Boushaki, Bab Ezzouar. Paris est une autre implantation ; cette page n'y ouvre pas de session. Aucun montant n'est publié.`,
      ]}
      sections={[
        {
          id: "concernes",
          title: "Entreprises d'Annaba concernées",
          paragraphs: [
            "Annaba réunit un port, l'aéroport Rabah Bitat (AAE), des transitaires et de l'industrie. La formation DGR visée ici concerne le maillon aérien : un colis classé préparé pour un vol, accepté, manutentionné ou contrôlé avant embarquement. Le trafic maritime du port ne constitue pas une fonction 7.1 à 7.10. Il le devient lorsque les tâches portent sur l'expédition ou le traitement par avion.",
            "Cette page ne reprend pas Constantine, qui n'a pas le même port, ni Béjaïa, qui a son propre port et son aéroport. Décrivez les équipes d'Annaba : bureau de transit, zone portuaire dont une partie du fret part ensuite par avion, personnels de l'aéroport, industrie qui expédie des échantillons ou des produits classés.",
            "Un même groupe peut avoir un bureau en ville, un passage au port et un dépôt près de Rabah Bitat. Écrivez qui prépare le dossier d'expédition, qui décide d'accepter le colis pour un vol, et qui le manutentionne. Ces trois gestes ne se forment pas ensemble par principe. Si une partie des personnes ne touche jamais un envoi aérien, dites-le : elles ne sont pas ajoutées à une fonction 7.x pour accompagner les autres. La proposition peut donc couvrir un sous-groupe seulement, avec une modalité adaptée au lieu où ce sous-groupe travaille.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "L'intra a lieu chez le client à Annaba. La classe virtuelle part du centre d'Alger. Le présentiel au centre a lieu à Bab Ezzouar. Il n'existe pas de salle KOST au port ni à l'aéroport Rabah Bitat.",
            "Le choix dépend des effectifs et du fait que les personnes sont au port, à l'aéroport ou en ville. Il est écrit dans la proposition, pas décidé par le nom de la ville.",
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Préparer une expédition, traiter du fret général, accepter des marchandises dangereuses, manutentionner, gérer des passagers, planifier un chargement, faire partie d'un équipage ou contrôler au titre de la sûreté sont des fonctions distinctes. Un transitaire du port et un agent d'acceptation à l'aéroport ne sont pas interchangeables.",
            "Les pages de fonctions servent de repère. Le cadre à vérifier est celui de l'ANAC, de l'IT 38-25, de l'Annexe 18 de l'OACI, du Doc 9284 et du DGR IATA courant. Une consigne d'opérateur s'ajoute si vous l'avez.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur. Aucune date d'expiration n'est publiée ici. On repart des tâches actuelles, y compris si la session précédente portait une ancienne catégorie.",
            "Le détail est sur la page recyclage DGR 24 mois.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Indiquez les tâches, le site (port, aéroport, ville), le nombre de personnes, et la modalité : intra à Annaba, classe virtuelle, ou présentiel à Bab Ezzouar. Si des collègues sont à Constantine, signalez-le : leur page est distincte.",
            "Écrivez par le formulaire, à cbta@kostacademy.com ou sur WhatsApp +213 542 305 383. La réponse est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre à Annaba ?",
          a: "Non. Intra chez le client, classe virtuelle depuis Alger, ou présentiel à Bab Ezzouar.",
        },
        {
          q: "Le port d'Annaba suffit-il à choisir une fonction ?",
          a: "Non. Le port situe l'activité. La fonction suit les tâches liées au transport aérien, pas au trafic maritime en général.",
        },
        {
          q: "Où est le présentiel ?",
          a: "À Alger, 176 Cité Boushaki, Bab Ezzouar, sauf intra dans vos locaux à Annaba ou classe virtuelle.",
        },
        {
          q: "Comment écrire ?",
          a: "Formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-constantine", label: "Formation DGR Constantine" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/formation-dgr-bejaia", label: "Formation DGR Béjaïa" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Annaba", path: "/formation-dgr-annaba" },
      ]}
      ctaTitle="Demander une proposition pour Annaba"
      ctaText="Précisez le port, l'aéroport ou le bureau, et la modalité souhaitée."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Annaba."
    />
  );
}
