import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Tunisie | CBTA, à distance";
const description =
  "Formation DGR Tunisie en classe virtuelle depuis Alger. Centre CBTA référencé IATA, agréé ANAC, fonctions 7.1 à 7.10. Demandez une proposition écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-tunisie",
  locale: "fr",
  keywords: ["formation DGR Tunisie", "CBTA Tunisie", "marchandises dangereuses Tunis", "formation DGR à distance Tunisie"],
  languages: {
    fr: "/formation-dgr-tunisie",
  },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-tunisie"
      eyebrow="Tunisie · classe virtuelle depuis Alger"
      h1="Formation DGR Tunisie"
      description={description}
      lead={[
        `Formation DGR Tunisie : KOST Academy, ${OFFICIAL_FR}, accompagne les entreprises tunisiennes en classe virtuelle depuis Alger, après vérification des exigences locales applicables.`,
        "Aucun centre KOST n'est annoncé en Tunisie. Le centre CBTA est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y place pas la session. Un présentiel en Tunisie n'est étudié qu'après autorisation écrite préalable d'IATA. Aucun montant n'est publié.",
      ]}
      sections={[
        {
          id: "public",
          title: "Public concerné en Tunisie",
          paragraphs: [
            "La demande vient des compagnies, des handlers, des transitaires, des équipes fret et des personnels d'aéroport qui préparent, acceptent, manutentionnent ou contrôlent des marchandises dangereuses par voie aérienne depuis la Tunisie. Le bureau peut être à Tunis, à l'aéroport ou dans une zone logistique : le lieu ne choisit pas la fonction. Ce qui compte, c'est le geste — classer, emballer, documenter, accepter, stocker, charger, filtrer, ou informer un équipage.",
            "Un transitaire qui prépare des expéditions et un agent qui les accepte pour le compte d'un exploitant ne suivent pas le même parcours, même s'ils répondent tous les deux à « formation DGR Tunisie ». Décrivez les tâches par groupe de participants. Les pages 7.1 à 7.10 servent de repère. La page Afrique en français situe cette page parmi les autres pays pour lesquels une page existe réellement.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : classe virtuelle depuis Alger",
          paragraphs: [
            "La modalité ordinaire pour une équipe en Tunisie est la classe virtuelle animée depuis le centre d'Alger. Les participants restent sur place. La session présentielle au centre, si l'équipe peut se déplacer, a lieu à Bab Ezzouar, pas dans une salle tunisienne de KOST. Il n'y a pas de centre, de bureau de formation ni d'antenne KOST à annoncer à Tunis ou ailleurs en Tunisie.",
            "Indiquez le nombre de personnes, les sites, et si tout le monde a les mêmes tâches. La proposition confirme la classe virtuelle ou le déplacement à Alger. Elle ne crée pas une adresse locale pour les besoins de la page.",
          ],
          subsections: [
            {
              title: "Présentiel hors Algérie seulement après autorisation écrite préalable d'IATA",
              paragraphs: [
                "Un formateur dans les locaux du client en Tunisie n'est pas une modalité ouverte par défaut. Il ne s'étudie qu'après une autorisation écrite préalable d'IATA, et après vérification des exigences de l'autorité tunisienne compétente et de l'opérateur. Tant que cet écrit n'existe pas, la formation DGR Tunisie se cadre en classe virtuelle depuis Alger, ou en présentiel à Bab Ezzouar pour celles et ceux qui s'y rendent. La page anglaise CBTA DGR training Africa reprend la même limite pour les autres pays.",
              ],
            },
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les fonctions couvrent la préparation des expéditions, le fret général, l'acceptation des marchandises dangereuses, la manutention et le chargement, les passagers et les bagages, la planification du chargement, l'équipage de conduite, les opérations et le dispatch, l'équipage de cabine, et la sûreté. L'agrément annoncé porte sur les fonctions 7.1 à 7.10, référence ANAC/DSOA/SAL-DGR/01/2026. Il ne dispense pas de la description des tâches tunisiennes.",
            "Une ancienne catégorie encore écrite dans un manuel tunisien ou dans un contrat ne se convertit pas d'elle-même. La page catégorie 6 le montre pour l'intitulé d'acceptation le plus cité : la fonction 7.3 n'est retenue que si les tâches le justifient. Le DGR IATA courant, l'Annexe 18 de l'OACI et le Doc 9284 restent les sources internationales habituelles, dans leur édition applicable.",
          ],
        },
        {
          id: "autorite",
          title: "Exigences de l'autorité tunisienne et de l'opérateur à vérifier avant inscription",
          paragraphs: [
            "Avant une inscription, l'entreprise vérifie ce que l'autorité de l'aviation civile compétente en Tunisie et le manuel de l'opérateur exigent pour le rôle visé. Cette page ne nomme pas une reconnaissance automatique, et elle ne recopie pas un article réglementaire tunisien qu'elle n'a pas sous les yeux. Si vous avez le texte ou la référence du manuel, joignez-les à la demande.",
            "L'agrément ANAC de KOST est un agrément algérien, pour les fonctions 7.1 à 7.10, référence ANAC/DSOA/SAL-DGR/01/2026. Il ne se présente pas comme une décision de l'autorité tunisienne. La proposition écrite dira ce qui peut être affirmé et ce qui doit rester en vérification. Les pages Maroc et Algérie décrivent d'autres cadres nationaux ; elles ne s'appliquent pas telles quelles à Tunis.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur applicables à l'équipe tunisienne. Ce n'est pas une date d'expiration publiée ici. Une session ancienne, même suivie sous une autre catégorie, se revoit à partir des tâches actuelles.",
            "Le détail de l'intervalle est sur la page recyclage DGR 24 mois. Les fonctions 7.1 et 7.3 ont en plus une ancre recyclage sur leur propre page, lorsque la fonction est déjà identifiée.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez les tâches, les villes en Tunisie, le nombre de participants, la fonction pressentie s'il y en a une, et si une formation antérieure existe. Précisez que vous visez la classe virtuelle depuis Alger, le déplacement à Bab Ezzouar, ou que vous voulez seulement savoir si un présentiel en Tunisie est étudiable — il ne l'est qu'avec l'autorisation écrite IATA.",
            "La réponse passe par le formulaire de la page, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383. Elle est écrite. Aucun appel n'est proposé pour réserver la session.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre en Tunisie ?",
          a: "Non. La formation DGR Tunisie se fait en classe virtuelle depuis Alger, ou en présentiel à Bab Ezzouar si les participants s'y rendent. Un présentiel en Tunisie suppose une autorisation écrite préalable d'IATA.",
        },
        {
          q: "L'agrément ANAC vaut-il décision de l'autorité tunisienne ?",
          a: "Non. La référence ANAC/DSOA/SAL-DGR/01/2026 est l'agrément algérien pour les fonctions 7.1 à 7.10. Les exigences tunisiennes et celles de l'opérateur se vérifient à part.",
        },
        {
          q: "Le titre du poste en Tunisie choisit-il la fonction ?",
          a: "Non. La fonction 7.1 à 7.10 suit les tâches réellement exercées, comme sur les autres pages du site.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-maroc", label: "Formation DGR Maroc" },
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-10", label: "DGR 7.10" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Tunisie", path: "/formation-dgr-tunisie" },
      ]}
      ctaTitle="Demander une proposition écrite pour la Tunisie"
      ctaText="Décrivez les tâches des équipes en Tunisie. La modalité de départ est la classe virtuelle depuis Alger."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Tunisie."
    />
  );
}
