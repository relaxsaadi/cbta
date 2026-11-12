import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Recyclage DGR 24 mois | Formation CBTA";
const description =
  "Recyclage DGR 24 mois : cadrer la fonction CBTA 7.1 à 7.10 et demander une proposition écrite. Centre CBTA référencé IATA, agréé ANAC.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "recyclage-dgr-24-mois",
  locale: "fr",
  keywords: ["recyclage DGR 24 mois", "recyclage DGR", "formation DGR récurrente", "CBTA recyclage"],
  languages: {
    fr: "/recyclage-dgr-24-mois",
    en: "/iata-dgr-recurrent-training",
  },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="recyclage-dgr-24-mois"
      eyebrow="Intervalle à vérifier · pas une date d'expiration"
      h1="Recyclage DGR 24 mois"
      description={description}
      lead={[
        "Recyclage DGR 24 mois : la réglementation IATA DGR prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon les exigences de l'autorité ou de l'opérateur applicables.",
        `KOST Academy, ${OFFICIAL_FR}, cadre ce recyclage à partir des tâches actuelles, en présentiel à Alger (Bab Ezzouar), en intra ou en classe virtuelle. Cette page ne publie aucune date d'expiration et aucun montant.`,
      ]}
      sections={[
        {
          id: "intervalle",
          title: "Ce que signifie un recyclage DGR 24 mois",
          paragraphs: [
            "L'expression « 24 mois » désigne un intervalle maximal entre deux formations de la même fonction, tel que le prévoit le DGR IATA, et non une date gravée sur un document émis par cette page. L'édition courante du DGR doit être relue avant d'annoncer une échéance à une équipe. Une exigence d'opérateur, ou un texte de l'autorité compétente, peut organiser le suivi de façon plus précise. Tant que ces sources ne sont pas ouvertes, on parle d'intervalle à confirmer.",
            "Le guide public de l'ANAC destiné aux exploitants qui demandent une approbation marchandises dangereuses mentionne, pour le programme de formation du personnel impliqué dans la préparation des marchandises dangereuses par voie aérienne, les recyclages avec la mention « 24 mois », à détailler dans le manuel d'exploitation, partie D. Cette phrase du guide ne remplace ni l'instruction technique n° 38-25, ni l'édition courante du DGR. Elle montre seulement que l'intervalle de 24 mois apparaît aussi dans une source publique algérienne, à lire dans son contexte d'exploitant.",
            "KOST ne convertit pas cet intervalle en date de fin affichée sur le site. Si vous avez une attestation antérieure, indiquez la date de la session et la fonction ou l'ancienne catégorie suivie. La proposition dira ce qui peut être confirmé, et ce qui doit encore être vérifié.",
          ],
        },
        {
          id: "verifier",
          title: "Vérifier l'édition IATA DGR courante et les exigences ANAC ou opérateur",
          paragraphs: [
            "Avant d'inscrire une équipe, trois lectures se complètent. D'abord l'édition du DGR IATA réellement en vigueur dans l'entreprise, pas une édition conservée par habitude. Ensuite le texte ANAC applicable, en particulier l'IT n° 38-25 du 13 février 2025, listée sur anac.dz comme relative à la sécurité du transport aérien des marchandises dangereuses. Enfin le manuel de l'opérateur ou la consigne du donneur d'ordre, lorsqu'ils imposent un programme approuvé ou un rôle nommé.",
            "Si ces sources divergent, la proposition le dit au lieu de trancher par un slogan. L'Annexe 18 de l'OACI et le Doc 9284 restent les références techniques internationales habituelles ; elles se consultent dans leur version en vigueur. Aucune de ces sources n'est résumée ici article par article.",
          ],
        },
        {
          id: "cbta",
          title: "Recyclage et approche CBTA : la fonction suit les tâches actuelles",
          paragraphs: [
            "Un recyclage n'est pas la reconduction automatique de l'intitulé suivi la fois précédente. Les tâches ont pu changer : une personne passée de la préparation des expéditions à l'acceptation, ou de l'entrepôt au contrôle des bagages, n'est plus dans la même fonction. Le CBTA demande de repartir des tâches exercées aujourd'hui, puis de retenir la fonction 7.1 à 7.10 correspondante.",
            "L'ancienne grille par catégories, encore citée dans certaines demandes, ne s'ajoute pas comme un synonyme. La page formation DGR catégorie 6 explique ce point pour l'intitulé le plus souvent cherché, sans équivalence automatique vers 7.3.",
          ],
          subsections: [
            {
              title: "Lien avec les parcours initial et recyclage déjà évoqués pour 7.1 et 7.3",
              paragraphs: [
                "Les pages DGR 7.1 et DGR 7.3 comportent une section recyclage. Elle rappelle que le renouvellement suit le même cadrage que le parcours initial : tâches, sources courantes, revue du périmètre. Ces ancres sont utiles lorsque l'équipe sait déjà que le travail est la préparation des expéditions ou l'acceptation. Pour les autres fonctions, on utilise la page de la fonction concernée et la présente page pour l'intervalle de 24 mois. La structure de 7.1 n'est pas recopiée sur 7.2 à 7.10.",
              ],
            },
          ],
        },
        {
          id: "qui",
          title: "Qui doit anticiper un recyclage",
          paragraphs: [
            "Les expéditeurs et transitaires qui préparent des envois, les agents d'acceptation, les équipes de handling et d'entrepôt, les personnels en contact avec les passagers et les bagages, les planificateurs de chargement, les équipages de conduite et de cabine, les dispatchers et les agents de sûreté peuvent tous avoir un recyclage à planifier. Le point commun n'est pas le métier affiché. C'est d'avoir déjà été formé pour une fonction dont les tâches sont encore les leurs, et d'approcher l'intervalle prévu par la source applicable.",
            "Une personne nouvellement affectée à des tâches de marchandises dangereuses n'est pas en recyclage : son parcours est initial, même si des collègues de la même entreprise sont, eux, en renouvellement. Les deux peuvent être traités dans la même proposition s'ils sont décrits séparément.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : présentiel à Alger, intra, ou classe virtuelle",
          paragraphs: [
            "Le présentiel au centre a lieu à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; le recyclage décrit ici ne s'y tient pas par défaut. Pour une équipe hors d'Alger, en Algérie, l'intra chez le client ou la classe virtuelle depuis Alger sont les autres modalités. Il n'y a pas de centre KOST à Oran ni dans les autres villes du pays.",
            "Hors Algérie, la classe virtuelle part du centre d'Alger. Un présentiel sur place n'est étudié qu'après autorisation écrite préalable d'IATA et vérification des exigences de l'autorité locale. Ce n'est pas une option affichée comme disponible par défaut.",
          ],
        },
        {
          id: "documents",
          title: "Documents à préparer pour une proposition écrite",
          paragraphs: [
            "Préparez la liste des participants, leurs tâches actuelles, la fonction ou l'ancienne catégorie de la session précédente, la date de cette session, l'édition du DGR utilisée par l'entreprise si vous la connaissez, et toute exigence écrite de l'opérateur. Indiquez la modalité souhaitée. Ces éléments permettent une proposition cadrée. Ils ne sont pas exigés pour écrire : un message court suffit pour ouvrir l'échange.",
            "Écrivez via le formulaire, à cbta@kostacademy.com, ou sur WhatsApp +213 542 305 383. La réponse est écrite. Le formulaire peut donner lieu à un rappel pour préciser les besoins.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Le recyclage DGR 24 mois est-il une date d'expiration ?",
          a: "Non. C'est un intervalle maximal prévu par le DGR IATA, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur. Cette page ne publie pas de date de fin d'attestation.",
        },
        {
          q: "Une ancienne catégorie se recycle-t-elle sous le même numéro ?",
          a: "Non. On repart des tâches actuelles pour retenir la fonction 7.1 à 7.10. L'ancien numéro ne s'applique pas automatiquement.",
        },
        {
          q: "Où suivre le recyclage ?",
          a: "En présentiel à Bab Ezzouar, en intra chez le client, ou en classe virtuelle depuis Alger. Hors Algérie, le présentiel suppose une autorisation écrite préalable d'IATA.",
        },
        {
          q: "Où lire le repère 7.1 ou 7.3 ?",
          a: "Sur les pages DGR 7.1 et DGR 7.3, section recyclage. Le cadre ANAC est sur la page IT ANAC 38-25 formation.",
        },
      ]}
      links={[
        { href: "/dgr-7-1#recyclage", label: "Recyclage 7.1" },
        { href: "/dgr-7-3#recyclage", label: "Recyclage 7.3" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-categorie-6", label: "Catégorie 6" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
        { href: "/reglementation-dgr-algerie", label: "Réglementation" },
        { href: "/planning", label: "Planning" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/iata-dgr-recurrent-training", label: "IATA DGR recurrent training" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Recyclage DGR 24 mois", path: "/recyclage-dgr-24-mois" },
      ]}
      ctaTitle="Demander une proposition de recyclage"
      ctaText="Indiquez la date de la session précédente, les tâches actuelles et la modalité souhaitée. La fonction sera confirmée à partir de ces éléments."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour un recyclage DGR 24 mois."
    />
  );
}
