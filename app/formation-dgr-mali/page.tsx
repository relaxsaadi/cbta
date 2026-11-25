import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Mali | CBTA, à distance";
const description =
  "Formation DGR Mali en classe virtuelle depuis Alger. Centre CBTA référencé IATA, agréé ANAC, fonctions 7.1 à 7.10. Demandez une proposition écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-mali",
  locale: "fr",
  keywords: ["formation DGR Mali", "CBTA Mali", "marchandises dangereuses Bamako", "DGR fret Bamako"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-mali"
      eyebrow="Mali · classe virtuelle depuis Alger"
      h1="Formation DGR Mali"
      description={description}
      lead={[
        `Formation DGR Mali : KOST Academy, ${OFFICIAL_FR}, accompagne les entreprises maliennes en classe virtuelle depuis Alger, après vérification des exigences locales applicables.`,
        "Aucun centre KOST n'est annoncé au Mali. Le centre CBTA est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y place pas la session. Un présentiel au Mali n'est étudié qu'après autorisation écrite préalable d'IATA. Aucun montant n'est publié.",
      ]}
      sections={[
        {
          id: "public",
          title: "Public concerné au Mali",
          paragraphs: [
            "La demande vient du fret, du transit, des handlers, des compagnies et des équipes d'aéroport qui préparent, acceptent, manutentionnent ou contrôlent des marchandises dangereuses par voie aérienne. Bamako, et l'aéroport de Bamako-Sénou, concentre l'essentiel des vols internationaux. Des bureaux de transit peuvent aussi être hors de la capitale : le lieu ne choisit pas la fonction.",
            "Le Mali est enclavé. Une partie des envois aériens s'organise avec des partenaires à Dakar ou à Abidjan, ce qui explique les liens vers les pages Sénégal et Côte d'Ivoire. Ces pages décrivent d'autres cadres nationaux. Elles ne s'appliquent pas telles quelles à Bamako. On décrit les tâches faites au Mali : classer, emballer, documenter, accepter, stocker, charger, filtrer, ou informer un équipage.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : classe virtuelle depuis Alger",
          paragraphs: [
            "La modalité ordinaire est la classe virtuelle animée depuis le centre d'Alger. Les participants restent à Bamako ou sur leurs sites. S'ils peuvent se déplacer, le présentiel au centre a lieu à Bab Ezzouar, pas dans une salle malienne de KOST. Il n'y a pas de centre, de bureau de formation ni d'antenne à annoncer à Bamako.",
            "Indiquez le nombre de personnes et si tout le monde a les mêmes tâches. La proposition confirme la classe virtuelle ou le déplacement à Alger.",
          ],
          subsections: [
            {
              title: "Présentiel hors Algérie seulement après autorisation écrite préalable d'IATA",
              paragraphs: [
                "Un formateur dans les locaux du client au Mali n'est pas une modalité ouverte par défaut. Il ne s'étudie qu'après une autorisation écrite préalable d'IATA, et après vérification des exigences de l'autorité de l'aviation civile compétente au Mali et de l'opérateur. Tant que cet écrit n'existe pas, la formation DGR Mali se cadre en classe virtuelle depuis Alger, ou en présentiel à Bab Ezzouar. La page Tunisie et la page Gabon décrivent la même limite pour d'autres pays, avec d'autres contextes de fret.",
              ],
            },
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les fonctions couvrent la préparation des expéditions, le fret général, l'acceptation, la manutention, les passagers, la planification du chargement, les équipages, le dispatch et la sûreté. L'agrément annoncé porte sur les fonctions 7.1 à 7.10, référence ANAC/DSOA/SAL-DGR/01/2026. C'est un agrément algérien. Il ne se présente pas comme une décision de l'autorité malienne.",
            "Une ancienne catégorie dans un contrat ne se convertit pas d'elle-même. La page catégorie 6 le montre pour l'intitulé d'acceptation : 7.3 n'est retenue que si les tâches le justifient. Le DGR IATA courant, l'Annexe 18 de l'OACI et le Doc 9284 restent les sources internationales habituelles.",
          ],
        },
        {
          id: "autorite",
          title: "Exigences de l'autorité malienne et de l'opérateur à vérifier",
          paragraphs: [
            "Avant une inscription, l'entreprise vérifie ce que l'autorité compétente au Mali et le manuel de l'opérateur exigent pour le rôle visé. Cette page ne cite pas un article réglementaire malien et ne revendique pas une reconnaissance automatique. Si vous avez le texte ou la référence du manuel, joignez-les.",
            "La proposition séparera ce qui peut être affirmé de ce qui reste à vérifier. Les pages Sénégal et Côte d'Ivoire ne remplacent pas cette vérification.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur applicables à l'équipe malienne. Ce n'est pas une date d'expiration publiée ici. Une session ancienne se revoit à partir des tâches actuelles.",
            "Le détail est sur la page recyclage DGR 24 mois. Les fonctions 7.1 et 7.3 ont une ancre recyclage lorsque la fonction est déjà identifiée.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez les tâches, les villes au Mali, le nombre de participants, et si vous visez la classe virtuelle depuis Alger ou le déplacement à Bab Ezzouar. Un présentiel au Mali ne s'étudie qu'avec l'autorisation écrite IATA.",
            "La réponse passe par le formulaire, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383. Elle est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre au Mali ?",
          a: "Non. La formation se fait en classe virtuelle depuis Alger, ou en présentiel à Bab Ezzouar. Un présentiel au Mali suppose une autorisation écrite préalable d'IATA.",
        },
        {
          q: "L'agrément ANAC est-il une décision malienne ?",
          a: "Non. La référence ANAC/DSOA/SAL-DGR/01/2026 est l'agrément algérien pour les fonctions 7.1 à 7.10. Les exigences maliennes et celles de l'opérateur se vérifient à part.",
        },
        {
          q: "Bamako-Sénou choisit-il la fonction ?",
          a: "Non. L'aéroport situe les vols. La fonction suit les tâches réellement exercées.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique" },
        { href: "/formation-dgr-senegal", label: "Formation DGR Sénégal" },
        { href: "/formation-dgr-cote-ivoire", label: "Formation DGR Côte d'Ivoire" },
        { href: "/formation-dgr-tunisie", label: "Formation DGR Tunisie" },
        { href: "/formation-dgr-gabon", label: "Formation DGR Gabon" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Mali", path: "/formation-dgr-mali" },
      ]}
      ctaTitle="Demander une proposition écrite pour le Mali"
      ctaText="Décrivez les tâches des équipes au Mali. La modalité de départ est la classe virtuelle depuis Alger."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Mali."
    />
  );
}
