import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation IATA DGR CBTA | Fonctions 7.1-7.10";
const description =
  "Formation IATA DGR CBTA : approche par compétences, fonctions 7.1 à 7.10. Centre CBTA référencé IATA, agréé ANAC. Demandez une offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-iata-dgr-cbta",
  locale: "fr",
  keywords: ["formation IATA DGR CBTA", "approche CBTA", "fonctions 7.1 à 7.10", "formation DGR compétences"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-iata-dgr-cbta"
      eyebrow="Méthode · pas une page pays"
      h1="Formation IATA DGR CBTA"
      description={description}
      lead={[
        `Formation IATA DGR CBTA : KOST Academy, ${OFFICIAL_FR}, explique l'approche par compétences et cadre le parcours à partir des tâches réellement exercées.`,
        "Cette page est explicative. Elle ne remplace pas l'accueil, ni les pages de fonctions, ni les pages pays. Elle dit ce que signifie le passage de l'ancienne grille de catégories aux fonctions 7.1 à 7.10. Aucun montant n'est affiché.",
      ]}
      sections={[
        {
          id: "methode",
          title: "Ce qu'est une formation IATA DGR CBTA",
          paragraphs: [
            "DGR désigne la réglementation du transport aérien des marchandises dangereuses, dans la lignée des Instructions techniques de l'OACI (Doc 9284) et de l'Annexe 18. CBTA désigne l'approche par compétences : on forme et on évalue à partir des tâches qu'une personne exerce, pas à partir d'un numéro de catégorie hérité d'une grille plus ancienne.",
            "L'ancienne grille numérotée, encore cherchée sous des intitulés comme « catégorie 6 », décrivait des types de travail. Elle ne s'utilise plus comme table de conversion. La page catégorie 6 explique ce cas précis : l'intitulé était souvent associé à l'acceptation, et la fonction 7.3 n'est retenue que si les tâches le justifient. Cette page-ci reste au niveau de la méthode, puis renvoie vers la fonction concernée.",
            "Une formation IATA DGR CBTA, dans l'offre de KOST Academy, est donc un parcours dont le périmètre est une ou plusieurs fonctions 7.1 à 7.10, choisi après description du travail réel. Ce n'est pas un label collé à tous les métiers du fret.",
          ],
        },
        {
          id: "fonctions",
          title: "Les fonctions 7.1 à 7.10, déterminées par les tâches",
          paragraphs: [
            "7.1 prépare les expéditions. 7.2 traite le fret présenté comme fret général. 7.3 accepte les marchandises dangereuses. 7.4 manutentionne et charge. 7.5 concerne les passagers et les bagages. 7.6 planifie le chargement. 7.7 vise l'équipage de conduite. 7.8 les opérations et le dispatch. 7.9 l'équipage de cabine. 7.10 le contrôle de sûreté. Chaque ligne a sa page. On ne copie pas le plan de 7.1 sur les neuf autres.",
            "Pour proposer une fonction, il faut savoir ce que la personne reçoit, contrôle, peut refuser, signe, et à qui elle transmet le colis ou l'information. L'intitulé du poste, le secteur et le pays sont un contexte. Ils ne remplacent pas cette liste.",
          ],
        },
        {
          id: "formulation",
          title: "Ce que signifie « centre CBTA référencé IATA, agréé ANAC »",
          paragraphs: [
            "La phrase tenue sur ce site est : centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ANAC/DSOA/SAL-DGR/01/2026. « Référencé IATA » dit que le centre figure comme centre CBTA. « Agréé ANAC » dit l'agrément algérien pour ces fonctions, avec sa référence. La phrase ne dit pas qu'une autorité étrangère a accepté chaque session, ni qu'une compagnie a reconnu un participant en particulier.",
            "La formulation ne transfère pas le référencement en décision d'une autre autorité, et elle n'annonce pas de rang. Le registre public des centres CBTA se consulte sur le site de l'IATA. L'agrément se lit avec sa référence ANAC, pas avec un slogan. La page à propos présente l'organisme. Celle-ci s'arrête à la méthode et à cette formulation.",
          ],
        },
        {
          id: "algerie",
          title: "Lien avec le cadre algérien (ANAC, IT 38-25)",
          paragraphs: [
            "Pour une équipe en Algérie, la méthode CBTA se lit avec l'ANAC et l'instruction technique n° 38-25 du 13 février 2025, relative à la sécurité du transport aérien des marchandises dangereuses. Le guide public des exploitants cite cette instruction parmi ses références, à côté de l'Annexe 18, du Doc 9284 et du document IATA. La page IT ANAC 38-25 formation indique où télécharger le PDF. Elle ne le remplace pas.",
            "Le présentiel au centre est à Alger, Bab Ezzouar. Les autres villes algériennes ont des pages qui disent qu'il n'y a pas de centre local : intra, classe virtuelle, ou déplacement à Bab Ezzouar. Hors Algérie, la classe virtuelle part d'Alger. La page anglaise CBTA DGR training Africa reprend ce modèle pour les équipes qui travaillent en anglais.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur. L'intervalle ne devient pas une date d'expiration publiée ici. Le recyclage repart des tâches actuelles : changer de poste peut changer de fonction.",
            "La page recyclage DGR 24 mois détaille ce point en français. Sa version anglaise est IATA DGR recurrent training.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Décrivez les tâches avant de demander « une formation CBTA » en général. Indiquez le pays, le nombre de personnes, et la modalité. Si vous partez d'une ancienne catégorie, dites-le, puis décrivez le travail réel.",
            "Formulaire de la page, cbta@kostacademy.com ou WhatsApp +213 542 305 383. La réponse est écrite. Elle nommera les fonctions à examiner et renverra, s'il le faut, vers la page de fonction ou la page pays, plutôt que de tout traiter ici.",
          ],
        },
      ]}
      faqs={[
        {
          q: "CBTA remplace-t-il les anciennes catégories ?",
          a: "L'approche courante est par fonctions 7.1 à 7.10, à partir des tâches. Une ancienne catégorie ne se convertit pas automatiquement. Voir la page catégorie 6 pour l'intitulé le plus demandé.",
        },
        {
          q: "Que signifie la formulation du centre ?",
          a: "Centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ANAC/DSOA/SAL-DGR/01/2026. Ce n'est pas une formule d'exclusivité ni une acceptation automatique par une autre autorité.",
        },
        {
          q: "Cette page remplace-t-elle l'accueil ?",
          a: "Non. L'accueil présente l'offre. Cette page explique la méthode et renvoie vers les fonctions et les pages pays.",
        },
        {
          q: "Comment recevoir une proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/", label: "Accueil" },
        { href: "/a-propos", label: "À propos" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-categorie-6", label: "Catégorie 6" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/reglementation-dgr-algerie", label: "Réglementation" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation IATA DGR CBTA", path: "/formation-iata-dgr-cbta" },
      ]}
      ctaTitle="Décrire les tâches, puis demander la proposition"
      ctaText="La méthode CBTA part des tâches. Envoyez-les avec le pays et la modalité souhaitée."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation IATA DGR CBTA."
    />
  );
}
