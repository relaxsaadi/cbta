import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Oran | Intra ou à distance";
const description =
  "Formation DGR Oran : intra chez le client, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-oran",
  locale: "fr",
  keywords: ["formation DGR Oran", "DGR Oran intra", "CBTA Oran", "marchandises dangereuses Oran"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-oran"
      eyebrow="Oran · pas de centre local"
      h1="Formation DGR Oran"
      description={description}
      lead={[
        `Formation DGR Oran : KOST Academy accompagne les entreprises d'Oran (fret, transit, port, aéroport, industrie) en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger. KOST Academy est un ${OFFICIAL_FR}.`,
        "Il n'y a pas de centre KOST à Oran. Le centre CBTA est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y ouvre pas de session. Aucun montant n'est publié : la proposition écrite décrit la modalité retenue.",
      ]}
      sections={[
        {
          id: "concernes",
          title: "Entreprises d'Oran concernées",
          paragraphs: [
            "La recherche « formation DGR Oran » vient en général d'équipes qui expédient, acceptent ou manutentionnent des marchandises dangereuses liées au fret aérien, alors que leur bureau est à Oran. Sont concernés les transitaires et agents de fret, les équipes portuaires dont une partie du flux part ensuite par avion, les personnels de l'aéroport Ahmed Ben Bella, les handlers, les compagnies qui y opèrent, et les industriels de l'ouest, y compris la pétrochimie et la chimie, dès qu'un colis classé est préparé pour un vol.",
            "Le port, la zone industrielle et l'aéroport ne créent pas trois formations différentes. Ils créent des tâches différentes : préparer une expédition, contrôler une déclaration, accepter un colis, le stocker, le charger, ou filtrer un envoi. C'est cette liste qui permet de retenir une ou plusieurs fonctions parmi 7.1 à 7.10. Un secteur, même très présent à Oran, ne suffit pas à attribuer une fonction.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra à Oran chez le client, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "Trois modalités sont étudiées pour une équipe basée à Oran. L'intra se tient dans les locaux du client, à Oran, lorsque le groupe est assez regroupé pour qu'un formateur se déplace. La classe virtuelle est animée depuis le centre d'Alger, sans déplacement des participants. Le présentiel au centre se tient à Bab Ezzouar : les participants d'Oran se rendent à Alger pour la session.",
            "Le choix dépend du nombre de personnes, de la dispersion des sites, de la langue de travail et des tâches à couvrir. Il est confirmé par écrit. Aucune de ces modalités ne suppose un bureau ou une salle KOST à Oran.",
          ],
          subsections: [
            {
              title: "Le centre CBTA KOST est à Alger, pas à Oran",
              paragraphs: [
                "KOST n'a pas de centre de formation à Oran, ni d'antenne à annoncer dans l'ouest du pays. L'adresse de formation présentielle en Algérie est le 176 Cité Boushaki, Bab Ezzouar, Alger. L'autre implantation de KOST est à Paris, sans session DGR décrite sur cette page. Si une recherche locale laisse croire à une salle à Oran, la réponse est non : intra chez le client, classe virtuelle depuis Alger, ou déplacement des participants à Bab Ezzouar.",
              ],
            },
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 déterminées par les tâches réelles",
          paragraphs: [
            "Les fonctions vont de la préparation des expéditions (7.1) au contrôle de sûreté (7.10), en passant par le fret général, l'acceptation des marchandises dangereuses, la manutention, les passagers, la planification du chargement et les équipages. Une équipe oranaise de transit n'a pas automatiquement la même fonction qu'une équipe d'acceptation à l'aéroport, même si les deux cherchent une formation DGR Oran.",
            "Décrivez les gestes : classification, emballage, marquage, document de transport, contrôle à l'acceptation, entreposage, chargement, information de l'équipage, inspection. Joignez, s'il existe, le manuel de l'opérateur ou la consigne interne qui désigne déjà un rôle. Ces pièces aident à cadrer. Elles ne remplacent pas la lecture des tâches actuelles. Les pages 7.1 à 7.10 détaillent chaque entrée sans copier la structure de l'une sur les autres.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon les exigences de l'autorité ou de l'opérateur qui s'appliquent à l'équipe d'Oran. Cette page ne publie pas de date d'expiration, ni une durée de validité d'attestation inventée.",
            "Lorsqu'une formation ancienne a été suivie sous un autre intitulé, le recyclage repart des tâches d'aujourd'hui. Le cadre général est sur la page recyclage DGR 24 mois. Les repères des fonctions 7.1 et 7.3 sont sur leurs pages, à l'ancre recyclage.",
          ],
        },
        {
          id: "cadre",
          title: "Cadre ANAC et sources OACI / IATA à vérifier avant inscription",
          paragraphs: [
            "Même si la session a lieu à Oran en intra ou à distance, le cadre algérien reste celui de l'ANAC, de l'instruction technique n° 38-25 du 13 février 2025, de l'Annexe 18 de l'OACI, du Doc 9284 et du DGR IATA courant. Une exigence propre à un exploitant ou à un donneur d'ordre peut s'y ajouter. Elle se vérifie dans le manuel applicable, pas par analogie avec une autre ville.",
            "La page IT ANAC 38-25 formation indique où lire le texte officiel et ce que le guide public des exploitants dit du programme de formation, y compris le recyclage. Elle ne conclut pas à la place de l'entreprise sur un envoi précis au départ d'Oran ou d'Alger.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Indiquez la ville des participants (Oran ou plusieurs sites), les tâches, le nombre de personnes, et la modalité préférée : intra à Oran, classe virtuelle, ou présentiel à Bab Ezzouar. Ajoutez si une session antérieure a déjà eu lieu et sous quel intitulé, sans considérer cet intitulé comme une fonction acquise.",
            "La réponse est écrite : formulaire de la page, cbta@kostacademy.com, ou WhatsApp +213 542 305 383. Il n'y a pas de prise de rendez-vous par téléphone. La proposition confirme ensuite le périmètre et la modalité. Le cadrage pétrole et gaz ou transitaires peut être utile en complément si les tâches le justifient, sans attribution automatique.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre de formation à Oran ?",
          a: "Non. Le centre CBTA est à Alger, 176 Cité Boushaki, Bab Ezzouar. Pour Oran, les modalités sont l'intra chez le client, la classe virtuelle depuis Alger, ou le présentiel à Bab Ezzouar.",
        },
        {
          q: "Une entreprise du port d'Oran relève-t-elle d'office d'une fonction ?",
          a: "Non. Le port, l'aéroport ou l'industrie indiquent un contexte. La fonction 7.1 à 7.10 suit les tâches réellement exercées sur les marchandises dangereuses par voie aérienne.",
        },
        {
          q: "Peut-on suivre la session sans venir à Alger ?",
          a: "Oui, si la proposition retient l'intra à Oran ou la classe virtuelle. Le présentiel au centre, lui, a lieu à Bab Ezzouar.",
        },
        {
          q: "Comment obtenir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/formation-dgr-petrole-gaz", label: "Pétrole et gaz" },
        { href: "/formation-dgr-transitaires", label: "Transitaires" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/planning", label: "Planning" },
        { href: "/contact", label: "Contact" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Oran", path: "/formation-dgr-oran" },
      ]}
      ctaTitle="Demander une proposition écrite pour Oran"
      ctaText="Précisez si vous souhaitez un intra à Oran, une classe virtuelle, ou un présentiel au centre de Bab Ezzouar."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Oran."
    />
  );
}
