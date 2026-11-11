import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Alger | CBTA KOST Academy";
const description =
  "Formation DGR Alger pour les entreprises de la capitale. Centre CBTA référencé IATA, agréé ANAC, fonctions 7.1 à 7.10. Demandez une proposition écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-alger",
  locale: "fr",
  keywords: ["formation DGR Alger", "formation DGR Bab Ezzouar", "CBTA Alger", "DGR Houari Boumediene"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-alger"
      eyebrow="Alger · Bab Ezzouar"
      h1="Formation DGR Alger"
      description={description}
      lead={[
        `Formation DGR Alger : KOST Academy, ${OFFICIAL_FR}, forme les équipes des entreprises d'Alger, en présentiel à Bab Ezzouar ou en classe virtuelle.`,
        "La page pays reste formation DGR Algérie. Celle-ci répond à la recherche d'une session dans la capitale : qui est concerné autour du fret aérien, comment la fonction 7.1 à 7.10 est choisie, et comment recevoir une proposition écrite. Aucun montant n'est affiché ici.",
      ]}
      sections={[
        {
          id: "concernes",
          title: "Qui est concerné à Alger",
          paragraphs: [
            "À Alger, une formation DGR concerne les personnes qui préparent, acceptent, manutentionnent, contrôlent ou transportent des marchandises dangereuses par voie aérienne. Le bassin est celui du fret et du passage à l'aéroport Houari Boumediene, des transitaires et commissionnaires installés entre Dar El Beida, Bab Ezzouar, Rouiba et les zones d'activité de la capitale, des handlers, des compagnies qui exploitent des vols au départ d'Alger, et des équipes de sûreté qui voient du fret, du courrier ou des bagages.",
            "Les expéditeurs industriels de l'agglomération sont aussi concernés dès qu'un colis classé quitte leur site pour un vol : échantillons, produits chimiques, batteries, aérosols, matières infectieuses ou équipements sous pression. Le fait de travailler « dans le cargo » ou « à l'aéroport » ne désigne pas encore la bonne fonction. Il faut décrire les tâches : classer, emballer, étiqueter, documenter, accepter, stocker, charger, filtrer, ou informer un équipage.",
            "KOST est implantée à Alger, au 176 Cité Boushaki, Bab Ezzouar, et à Paris. Les sessions présentielles annoncées sur cette page se tiennent à Bab Ezzouar. Paris n'est pas présenté ici comme une salle de formation DGR de substitution.",
          ],
        },
        {
          id: "fonctions",
          title: "Choisir la fonction CBTA 7.1 à 7.10 selon les tâches réellement exercées",
          paragraphs: [
            "L'approche CBTA remplace l'ancienne habitude de coller une catégorie à un intitulé de poste. Les fonctions 7.1 à 7.10 décrivent des familles de tâches : préparation des expéditions, traitement du fret général, acceptation des marchandises dangereuses, manutention et chargement, passagers et bagages, planification du chargement, équipage de conduite, opérations et dispatch, équipage de cabine, contrôle de sûreté. Une équipe d'Alger peut avoir besoin de deux fonctions distinctes si les personnes ne font pas le même travail.",
            "Pour une proposition utile, indiquez pour chaque participant ce qu'il fait concrètement dans la semaine, les documents qu'il signe, et s'il agit pour l'expéditeur, pour un transitaire, pour un handler ou pour l'exploitant. La page de chaque fonction, de 7.1 à 7.10, sert de repère. Elle ne remplace pas cette description.",
          ],
          subsections: [
            {
              title: "Pourquoi un intitulé de poste ne suffit pas",
              paragraphs: [
                "Deux « agents cargo » peuvent avoir des tâches opposées : l'un prépare la déclaration de l'expéditeur, l'autre contrôle un colis à l'acceptation, un troisième ne voit que du fret général. Leur attribuer la même fonction parce que la carte de visite est identique produit une session trop large pour les uns et incomplète pour les autres. KOST part des tâches, puis retient la ou les fonctions 7.x qui les couvrent. Un ancien numéro de catégorie, un secteur d'activité ou le nom de l'aéroport ne suffit pas pour trancher.",
              ],
            },
          ],
        },
        {
          id: "modalites",
          title: "Présentiel à Alger (176 Cité Boushaki, Bab Ezzouar) ou classe virtuelle",
          paragraphs: [
            "Le présentiel se tient au centre de Bab Ezzouar, 176 Cité Boushaki. C'est l'adresse de formation DGR en présentiel que cette page annonce en Algérie. Les participants d'Alger et de la proche banlieue s'y rendent pour une session inter-entreprises, ou l'entreprise demande une session intra dans ses propres locaux lorsqu'elle préfère regrouper son équipe sur site.",
            "La classe virtuelle convient lorsque les personnes sont réparties entre un bureau à Alger, un entrepôt et un bureau de passage, ou lorsqu'une partie de l'équipe ne peut pas se déplacer. Elle est animée depuis le centre d'Alger. Le choix entre présentiel à Bab Ezzouar, intra dans les locaux du client à Alger, et classe virtuelle est confirmé dans la proposition, avec la langue de travail et le nombre de participants. Les horaires du centre sont le dimanche au jeudi.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "La réglementation IATA DGR prévoit un recyclage à des intervalles ne dépassant pas 24 mois. Cet intervalle doit être confirmé dans l'édition courante et selon les exigences de l'ANAC ou de l'opérateur applicables à l'équipe. Il ne s'agit pas d'une date d'expiration publiée sur cette page, ni d'une durée collée automatiquement à une attestation.",
            "Une personne formée il y a plusieurs années sous une ancienne catégorie doit être revue à partir de ses tâches actuelles, pas de l'intitulé d'origine. Le détail est sur la page recyclage DGR 24 mois. Pour les fonctions 7.1 et 7.3, les pages dédiées comportent aussi un repère de recyclage.",
          ],
        },
        {
          id: "cadre",
          title: "Cadre applicable : ANAC, IT 38-25, sources OACI et IATA courantes",
          paragraphs: [
            "En Algérie, le transport aérien des marchandises dangereuses s'apprécie au regard de l'ANAC, de l'instruction technique n° 38-25 du 13 février 2025 relative à la sécurité du transport aérien des marchandises dangereuses, de l'Annexe 18 de l'OACI, du Doc 9284 (Instructions techniques) et du DGR IATA dans son édition courante. Ces textes ne se remplacent pas les uns les autres : l'exploitant, l'expéditeur et l'assistant en escale n'y ont pas le même rôle.",
            "Avant une inscription, l'entreprise vérifie l'édition du DGR qu'elle utilise, le manuel de l'opérateur s'il y en a un, et le texte ANAC en vigueur. La page IT ANAC 38-25 formation renvoie vers la liste officielle des instructions sur anac.dz et vers le guide public des exploitants qui cite cette instruction. Elle ne se substitue pas au PDF officiel.",
          ],
        },
        {
          id: "proposition",
          title: "Comment obtenir une proposition écrite",
          paragraphs: [
            "Écrivez ce que fait chaque groupe de participants, la fonction pressentie s'il y en a une, le nombre de personnes, la préférence entre Bab Ezzouar, intra à Alger et classe virtuelle, et la date à laquelle la session précédente, s'il y en a eu une, a eu lieu. KOST répond par écrit : formulaire de cette page, e-mail cbta@kostacademy.com, ou WhatsApp +213 542 305 383. Aucun rendez-vous téléphonique n'est proposé.",
            "La proposition confirme le périmètre, la modalité et les conditions. Tant qu'elle n'est pas émise, cette page reste un cadrage. Elle ne vaut ni devis, ni calendrier ferme, ni conclusion réglementaire pour un colis particulier.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Où se tient la formation DGR Alger en présentiel ?",
          a: "Au centre KOST, 176 Cité Boushaki, Bab Ezzouar. Une classe virtuelle depuis ce centre, ou une session intra dans les locaux du client à Alger, peut être proposée à la place. KOST est aussi implantée à Paris ; cette page n'y annonce pas de salle DGR.",
        },
        {
          q: "Quelle différence avec la page formation DGR Algérie ?",
          a: "La page Algérie cadre le besoin au niveau du pays. Celle-ci répond à la requête « formation DGR Alger » et précise le présentiel à Bab Ezzouar. Les deux se renvoient l'une à l'autre.",
        },
        {
          q: "Le titre du poste choisit-il la fonction 7.x ?",
          a: "Non. La fonction suit les tâches réellement exercées. Deux personnes avec le même intitulé peuvent relever de fonctions différentes.",
        },
        {
          q: "Comment recevoir une réponse ?",
          a: "Par écrit uniquement : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/reglementation-dgr-algerie", label: "Réglementation DGR Algérie" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
        { href: "/formation-dgr-oran", label: "Formation DGR Oran" },
        { href: "/planning", label: "Planning" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/a-propos", label: "À propos" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Alger", path: "/formation-dgr-alger" },
      ]}
      ctaTitle="Demander une proposition écrite pour Alger"
      ctaText="Décrivez les tâches des participants et la modalité souhaitée : présentiel à Bab Ezzouar, intra chez vous à Alger, ou classe virtuelle."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Alger."
    />
  );
}
