import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation marchandises dangereuses Algérie";
const description =
  "Formation marchandises dangereuses Algérie : parcours CBTA 7.1 à 7.10, centre référencé IATA, agréé ANAC. Présentiel à Alger ou à distance. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-marchandises-dangereuses-algerie",
  locale: "fr",
  keywords: [
    "formation marchandises dangereuses Algérie",
    "formation DGR Algérie",
    "marchandises dangereuses avion Algérie",
    "CBTA Algérie",
  ],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-marchandises-dangereuses-algerie"
      eyebrow="Langue courante · transport aérien"
      h1="Formation marchandises dangereuses Algérie"
      description={description}
      lead={[
        `Formation marchandises dangereuses Algérie : l'intitulé courant pour le transport aérien des marchandises dangereuses (DGR) ; KOST Academy, ${OFFICIAL_FR}, cadre le parcours selon les tâches réelles.`,
        "Cette page s'adresse à qui cherche la formation sans passer par le sigle DGR. La page formation DGR Algérie reste la page pays. Les deux se renvoient l'une vers l'autre. Aucun montant n'est affiché.",
      ]}
      sections={[
        {
          id: "perimetre",
          title: "Ce que recouvre une formation marchandises dangereuses en Algérie",
          paragraphs: [
            "Dans le langage courant, « marchandises dangereuses » désigne des matières ou objets qui peuvent nuire à la santé, à la sécurité, aux biens ou à l'environnement. Par avion, ce sujet est encadré par les règles du transport aérien, souvent appelées DGR (Dangerous Goods Regulations) dans les entreprises de fret. Une formation marchandises dangereuses en Algérie, sur ce site, vise ce transport aérien : préparation d'un envoi, acceptation, manutention, chargement, information d'un équipage, ou contrôle au titre de la sûreté.",
            "Ce n'est pas une formation ADR, qui concerne la route. Un salarié qui ne fait que charger un camion, sans lien avec un vol, n'est pas pour autant dans une fonction 7.1 à 7.10. À l'inverse, un colis qui quitte un entrepôt algérien pour un aéroport entre dans le sujet dès que les tâches touchent l'expédition aérienne. Le dire clairement évite de mélanger deux régimes. Si votre besoin est routier, cette page n'est pas le bon cadrage.",
            "Les personnes concernées travaillent chez un expéditeur, un transitaire, un handler, une compagnie, ou dans une équipe de sûreté, à Alger ou ailleurs dans le pays. Le métier affiché ne choisit pas la fonction. On part de ce que la personne fait sur le colis ou le dossier.",
          ],
        },
        {
          id: "cbta",
          title: "Approche CBTA et fonctions 7.1 à 7.10",
          paragraphs: [
            "CBTA signifie une formation et une évaluation fondées sur les compétences liées aux tâches, et non sur une ancienne catégorie collée à un intitulé de poste. Les fonctions vont de 7.1 (préparation des expéditions) à 7.10 (contrôle de sûreté), en passant par le fret général, l'acceptation, la manutention, les passagers, la planification du chargement et les équipages. Chaque fonction a sa page. La structure de 7.1 n'est pas recopiée sur les autres.",
            "Deux personnes « au cargo » peuvent relever de fonctions différentes : l'une prépare la déclaration de l'expéditeur, l'autre accepte le colis, une troisième ne voit que du fret non déclaré comme dangereux. La proposition écrite retient la ou les fonctions après cette description. L'ancienne grille, encore cherchée sous le nom de catégorie 6, est expliquée à part et n'équivaut pas automatiquement à 7.3.",
          ],
        },
        {
          id: "cadre",
          title: "Cadre ANAC, IT 38-25 et sources OACI / IATA",
          paragraphs: [
            "En Algérie, le cadre à ouvrir comprend l'ANAC, l'instruction technique n° 38-25 du 13 février 2025 relative à la sécurité du transport aérien des marchandises dangereuses, l'Annexe 18 de l'OACI, le Doc 9284 et le DGR IATA dans l'édition courante. Ces textes ne se remplacent pas. L'exploitant, l'expéditeur et l'assistant en escale n'y ont pas le même rôle.",
            "La page IT ANAC 38-25 formation indique où télécharger l'instruction sur anac.dz et ce que le guide public des exploitants dit du programme de formation. Elle ne se substitue pas au PDF. Une exigence écrite d'un opérateur s'y ajoute lorsqu'elle existe : elle se lit dans le manuel, pas par analogie.",
          ],
        },
        {
          id: "modalites",
          title: "Présentiel à Alger ou classe virtuelle",
          paragraphs: [
            "Le présentiel au centre se tient à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y décrit pas de salle. Pour une équipe hors d'Alger, en Algérie, les autres modalités sont l'intra dans les locaux du client et la classe virtuelle animée depuis Alger. Il n'y a pas de centre KOST à Oran, Constantine, Annaba, Béjaïa, Sétif ou Hassi Messaoud : ces villes ont leurs propres pages, qui disent la même chose.",
            "Le choix dépend du nombre de participants, des sites et des tâches. Il est confirmé dans la proposition. Hors Algérie, la classe virtuelle part d'Alger ; un présentiel sur place n'est étudié qu'après autorisation écrite préalable d'IATA.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'ANAC ou l'opérateur. Ce n'est pas une date d'expiration publiée ici. Une personne formée autrefois sous un autre intitulé est revue à partir de ses tâches actuelles.",
            "Le détail est sur la page recyclage DGR 24 mois. Les fonctions 7.1 et 7.3 ont une ancre recyclage lorsque la fonction est déjà identifiée.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez les tâches, le nombre de personnes, la ville, et si vous pensez à Bab Ezzouar, à un intra ou à une classe virtuelle. Le mot « marchandises dangereuses » suffit pour ouvrir la demande : la fonction sera proposée ensuite, pas déduite de ce libellé.",
            "La réponse passe par le formulaire, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383. Elle est écrite. La page formation DGR Algérie et la page formation DGR Alger complètent ce cadrage, l'une pour le pays, l'autre pour le présentiel dans la capitale.",
          ],
        },
      ]}
      faqs={[
        {
          q: "DGR et marchandises dangereuses, est-ce la même chose ?",
          a: "Sur ce site, DGR désigne le cadre du transport aérien des marchandises dangereuses. Cette page explique l'intitulé en langue courante. La page formation DGR Algérie reste la page pays.",
        },
        {
          q: "Est-ce une formation ADR routière ?",
          a: "Non. Le sujet est le transport par avion. Le régime routier n'est pas traité comme équivalent.",
        },
        {
          q: "Où a lieu le présentiel ?",
          a: "Au centre d'Alger, 176 Cité Boushaki, Bab Ezzouar, ou en intra chez le client, ou en classe virtuelle depuis Alger. Il n'y a pas d'autre centre annoncé en Algérie.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/reglementation-dgr-algerie", label: "Réglementation" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/formation-dgr-categorie-6", label: "Catégorie 6" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation marchandises dangereuses Algérie", path: "/formation-marchandises-dangereuses-algerie" },
      ]}
      ctaTitle="Demander une proposition écrite"
      ctaText="Décrivez les tâches liées au transport aérien. Le sigle DGR n'est pas nécessaire pour écrire."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation marchandises dangereuses en Algérie."
    />
  );
}
