import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "IT ANAC 38-25 formation | Cadre DGR Algérie";
const description =
  "IT ANAC 38-25 formation : instruction du 13 février 2025 sur le transport aérien des marchandises dangereuses, et cadrage CBTA. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "it-anac-38-25-formation",
  locale: "fr",
  keywords: ["IT ANAC 38-25 formation", "instruction technique 38-25", "ANAC marchandises dangereuses", "formation DGR ANAC"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="it-anac-38-25-formation"
      eyebrow="Texte officiel à lire · cadrage formation"
      h1="IT ANAC 38-25 formation"
      description={description}
      lead={[
        "IT ANAC 38-25 formation : l'instruction technique n° 38-25 du 12 Chaabane 1446 correspondant au 13 février 2025, relative à la sécurité du transport aérien des marchandises dangereuses, fait partie du cadre à vérifier pour toute formation DGR en Algérie.",
        `KOST Academy, ${OFFICIAL_FR}, utilise cette page pour situer l'instruction, indiquer où la lire, et proposer un parcours CBTA. Elle ne remplace pas le PDF officiel et ne publie aucun montant.`,
      ]}
      sections={[
        {
          id: "objet",
          title: "Qu'est-ce que l'IT ANAC 38-25",
          paragraphs: [
            "Sur la liste publique des instructions techniques de l'ANAC (anac.dz/fr/instruction-technique/), l'instruction n° 38-25 est datée du 12 Chaabane 1446 correspondant au 13 février 2025. Son objet affiché est : « relative à la sécurité du transport aérien des marchandises dangereuses ». L'autorité émettrice est l'Agence nationale de l'aviation civile. Le texte lui-même est le PDF proposé au téléchargement sur cette liste, pas un résumé de site de formation.",
            "Le guide public de l'ANAC adressé aux exploitants qui demandent une approbation particulière pour le transport de marchandises dangereuses (fichier Guide publié sous le chemin 2025/02 sur anac.dz) cite cette instruction parmi ses documents de référence, aux côtés de la loi 98-06, de l'Annexe 18 à la Convention de Chicago, du Doc 9284 de l'OACI, du Doc 9481 et du document IATA sur la réglementation des marchandises dangereuses. Ce guide est un guide d'exploitant. Il n'est pas l'instruction.",
          ],
        },
        {
          id: "consulter",
          title: "Où consulter le texte officiel et les guides ANAC associés",
          paragraphs: [
            "La porte d'entrée est la page « Instruction technique » du site de l'ANAC, rubrique 2025, ligne 38. Téléchargez le PDF et lisez-le dans son état publié. Si l'ANAC publie ensuite un amendement, c'est la version listée ce jour-là qui fait foi, pas la date citée ici.",
            "Le guide des exploitants reste utile pour voir comment l'ANAC présente, dans un document public de février 2025, le dossier d'approbation : procédures alignées sur le Doc 9284 et sur l'IT 38-25, manuel d'exploitation, et programme de formation. Il se lit en complément, avec ses propres limites. La page réglementation DGR Algérie du site rappelle la méthode : ne pas faire dire à un texte plus qu'il ne dit.",
          ],
        },
        {
          id: "formation",
          title: "Ce que le cadre public indique sur la formation",
          paragraphs: [
            "Dans le guide des exploitants, l'ANAC indique que l'exploitant met en place un programme de formation approuvé par l'ANAC pour tout son personnel impliqué dans la préparation des marchandises dangereuses par voie aérienne, y compris les recyclages, avec la mention « 24 mois », et que ce programme est détaillé dans le manuel d'exploitation, partie D. Le même guide prévoit, dans la partie formation du manuel, des programmes pour l'équipage de conduite, l'équipage de cabine, le personnel d'exploitation au sol, le contrôle des opérations et le personnel fret. Il distingue formation initiale, recyclage et formation périodique selon les catégories de personnel.",
            "Le guide note aussi que les expéditeurs qui préparent des marchandises dangereuses au transport aérien doivent être formés par un organisme répondant aux conditions qu'il formule. Cette phrase vise les expéditeurs dans le dossier d'un exploitant. Elle ne se transpose pas, mot pour mot, en slogan. Sur ce site, la formulation tenue est celle d'un centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ANAC/DSOA/SAL-DGR/01/2026.",
            "Le sigle CBTA figure dans les abréviations du guide. L'approche retenue par KOST est l'approche par compétences : les fonctions 7.1 à 7.10 suivent les tâches, pas un intitulé de poste. Le guide, de son côté, emploie encore par endroits le vocabulaire des catégories dans les pièces du manuel. Cette coexistence se constate dans le document public. Elle ne crée pas d'équivalence automatique entre une ancienne catégorie et une fonction 7.x.",
          ],
          subsections: [
            {
              title: "Ne pas interpréter au-delà du texte en vigueur",
              paragraphs: [
                "Cette page ne cite pas d'article interne de l'IT 38-25 qu'elle n'a pas reproduit depuis le PDF. Elle ne dit pas qu'une formation est obligatoire pour tel métier au-delà de ce que le guide public écrit pour les exploitants et les expéditeurs. Si votre question porte sur un article précis, ouvrez le PDF de l'instruction et, au besoin, envoyez la référence dans la demande de proposition. Une exigence d'opérateur reste une exigence d'opérateur : elle ne devient pas une règle universelle parce qu'elle figure dans un manuel.",
              ],
            },
          ],
        },
        {
          id: "fonctions",
          title: "Lien avec les fonctions CBTA 7.1 à 7.10 et l'agrément KOST",
          paragraphs: [
            "Les fonctions 7.1 à 7.10 couvrent la préparation des expéditions, le fret général, l'acceptation des marchandises dangereuses, la manutention et le chargement, les passagers et bagages, la planification du chargement, l'équipage de conduite, les opérations et le dispatch, l'équipage de cabine, et le contrôle de sûreté. L'agrément annoncé est celui des fonctions 7.1 à 7.10, référence ANAC/DSOA/SAL-DGR/01/2026. Il ne dispense pas de décrire les tâches : deux salariés du même exploitant peuvent relever de fonctions différentes.",
            "Le centre de formation en présentiel est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris. Les sessions de cette page se cadrent à Bab Ezzouar, en intra chez le client, ou en classe virtuelle depuis Alger. Les pages de chaque fonction restent le détail opérationnel ; celle-ci reste le cadrage réglementaire algérien.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage, évaluation et attestations : ce qui doit être confirmé",
          paragraphs: [
            "Le guide public relie le programme de l'exploitant à des recyclages mentionnés avec l'intervalle de 24 mois, et il indique un stage de rafraîchissement tous les deux ans pour les formateurs DGR. Le DGR IATA, de son côté, prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante. Ces deux phrases ne sont pas une date d'expiration d'attestation publiée par KOST. La page recyclage DGR 24 mois explique pourquoi l'intervalle ne doit pas être transformé en échéance inventée.",
            "L'évaluation et le document remis au participant dépendent du parcours retenu et des exigences applicables. Ils sont décrits dans la proposition écrite, pas figés ici. Tant que l'édition du DGR, le PDF de l'IT et le manuel de l'opérateur n'ont pas été confrontés, le statut d'une affirmation reste « à vérifier ».",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition de formation alignée sur ce cadre",
          paragraphs: [
            "Indiquez les tâches, la fonction pressentie, le fait que vous visez un cadre ANAC / IT 38-25, et si vous êtes exploitant, expéditeur, transitaire ou assistant en escale. Joignez, si vous les avez, la référence du manuel et la date de la dernière formation. KOST répond par le formulaire, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383.",
            "La proposition dit quelles fonctions sont étudiées et ce qui doit encore être lu dans le PDF officiel. Elle ne présente pas cette page comme le texte de l'instruction.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Où télécharger l'IT 38-25 ?",
          a: "Sur la page des instructions techniques de l'ANAC, anac.dz/fr/instruction-technique/, rubrique 2025, instruction n° 38-25 du 13 février 2025. Le PDF officiel prime sur ce résumé.",
        },
        {
          q: "Le guide des exploitants remplace-t-il l'instruction ?",
          a: "Non. Le guide la cite parmi ses références et décrit un dossier d'approbation pour les exploitants. L'instruction reste le texte à ouvrir pour son contenu propre.",
        },
        {
          q: "Le guide impose-t-il un recyclage à 24 mois ?",
          a: "Il mentionne des recyclages avec l'indication « 24 mois » dans le programme de formation de l'exploitant, à détailler au manuel d'exploitation. L'édition courante du DGR IATA et l'IT elle-même doivent être vérifiées avant d'en faire une échéance.",
        },
        {
          q: "Comment demander une formation dans ce cadre ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383. Décrivez les tâches plutôt qu'un intitulé de poste.",
        },
      ]}
      links={[
        { href: "/reglementation-dgr-algerie", label: "Réglementation DGR Algérie" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/a-propos", label: "À propos" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "IT ANAC 38-25 formation", path: "/it-anac-38-25-formation" },
      ]}
      ctaTitle="Demander une proposition alignée sur l'IT 38-25"
      ctaText="Précisez votre rôle (exploitant, expéditeur, transitaire, assistance) et les tâches à couvrir. La lecture du PDF officiel reste de votre côté pour les articles que vous voulez citer."
      whatsappMessage="Bonjour, je souhaite une proposition écrite de formation DGR dans le cadre de l'IT ANAC 38-25."
    />
  );
}
