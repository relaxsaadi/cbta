import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Hassi Messaoud | Intra / distance";
const description =
  "Formation DGR Hassi Messaoud : intra sur site, classe virtuelle ou présentiel à Alger. Centre CBTA référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-hassi-messaoud",
  locale: "fr",
  keywords: ["formation DGR Hassi Messaoud", "DGR pétrole Algérie", "CBTA Hassi Messaoud", "fret aérien Hassi Messaoud"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-hassi-messaoud"
      eyebrow="Hassi Messaoud · pas de centre sur place"
      h1="Formation DGR Hassi Messaoud"
      description={description}
      lead={[
        "Formation DGR Hassi Messaoud : KOST Academy accompagne les entreprises du bassin pétrolier et logistique de Hassi Messaoud en intra chez le client, en classe virtuelle, ou en présentiel au centre d'Alger.",
        `KOST Academy est un ${OFFICIAL_FR}. Il n'y a pas de centre KOST à Hassi Messaoud. Le centre est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y ouvre pas de session. Aucun montant n'est publié.`,
      ]}
      sections={[
        {
          id: "pourquoi",
          title: "Pourquoi les entreprises de Hassi Messaoud cherchent une formation DGR",
          paragraphs: [
            "Hassi Messaoud concentre des activités d'énergie et de logistique dont une partie des flux quitte le bassin par avion : échantillons, produits chimiques, batteries, équipements sous pression, pièces et colis classés au titre des marchandises dangereuses. Les équipes concernées peuvent être chez un opérateur, un prestataire logistique, un transitaire qui prépare l'expédition, ou un intervenant qui remet le colis à un vol au départ de l'aéroport Krim Belkacem (HME) ou via Alger.",
            "Le secteur pétrole et gaz explique le contexte. Il n'attribue pas une fonction 7.x. Une personne qui prépare la documentation d'expédition n'a pas les mêmes tâches qu'une personne qui accepte un colis, le stocke ou le charge. La page formation DGR pétrole et gaz décrit ce cadrage sectoriel. Celle-ci le situe à Hassi Messaoud, sans créer de centre local et sans conclure qu'une base pétrolière relève d'office de 7.1 ou de 7.3.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : intra sur site, classe virtuelle, ou présentiel à Alger",
          paragraphs: [
            "Trois modalités sont étudiées. L'intra se tient dans les locaux du client sur le bassin, lorsque le groupe est regroupé et que le déplacement d'un formateur est retenu dans la proposition. La classe virtuelle est animée depuis le centre d'Alger, sans déplacement des participants. Le présentiel au centre se tient à Bab Ezzouar : les participants se rendent à Alger.",
            "Aucune de ces modalités ne suppose un bureau KOST à Hassi Messaoud, à la base, ou à l'aéroport. L'adresse de formation présentielle en Algérie reste le 176 Cité Boushaki, Bab Ezzouar. Le choix est confirmé par écrit, avec le nombre de personnes, la langue et les tâches.",
          ],
        },
        {
          id: "petrole",
          title: "Lien avec le cadrage pétrole et gaz déjà publié",
          paragraphs: [
            "La page pétrole et gaz rappelle qu'un secteur ne suffit pas à choisir la fonction. Elle sert de complément : on y voit les familles de tâches fréquentes dans l'énergie (préparation d'expédition, acceptation, manutention, sûreté) sans liste de clients et sans volume inventé. Pour Hassi Messaoud, on ajoute seulement le lieu de travail et la modalité possible sur site.",
            "Si une partie de l'équipe est à Alger et l'autre sur le bassin, la proposition peut combiner une session à Bab Ezzouar et une classe virtuelle, ou un intra, selon ce que les tâches et les effectifs permettent. Ce n'est pas décidé sur cette page.",
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches",
          paragraphs: [
            "Les fonctions couvrent la préparation des expéditions, le fret général, l'acceptation des marchandises dangereuses, la manutention et le chargement, les passagers et bagages, la planification du chargement, les équipages, le dispatch et la sûreté. Sur un site pétrolier, plusieurs de ces fonctions peuvent coexister dans des équipes distinctes. On les décrit séparément.",
            "Indiquez ce que chaque groupe reçoit, contrôle, peut refuser, signe, et à qui il transmet le colis. Les pages 7.1 et 7.3 sont les repères les plus souvent ouverts pour l'expédition et l'acceptation. Elles ne s'appliquent que si les tâches correspondent. Le cadre algérien reste l'ANAC, l'IT 38-25, l'Annexe 18 de l'OACI, le Doc 9284 et le DGR IATA courant.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur qui s'applique à l'équipe du bassin. Cette page ne publie pas de date d'expiration. Une formation ancienne, même suivie sous une autre catégorie, se revoit à partir des tâches d'aujourd'hui.",
            "Le détail de l'intervalle est sur la page recyclage DGR 24 mois. Les rotations de personnel sur site rendent utile de distinguer les parcours initiaux et les recyclages dans la même demande.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Précisez les sites (Hassi Messaoud, autres bases, Alger), les tâches, les effectifs, et la modalité souhaitée : intra sur site, classe virtuelle, ou présentiel à Bab Ezzouar. Joignez, s'il existe, la consigne de l'opérateur qui désigne déjà un rôle.",
            "Écrivez via le formulaire, à cbta@kostacademy.com ou sur WhatsApp +213 542 305 383. La réponse est écrite. Elle ne crée pas d'implantation à Hassi Messaoud.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre à Hassi Messaoud ?",
          a: "Non. Les modalités sont l'intra chez le client, la classe virtuelle depuis Alger, ou le présentiel à Bab Ezzouar.",
        },
        {
          q: "Le pétrole et gaz impose-t-il une fonction ?",
          a: "Non. Le secteur est un contexte. La fonction 7.1 à 7.10 suit les tâches. La page pétrole et gaz le détaille.",
        },
        {
          q: "L'aéroport Krim Belkacem change-t-il le cadrage ?",
          a: "Il situe une partie des vols. Il ne choisit pas la fonction à la place de la description des tâches.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-petrole-gaz", label: "Pétrole et gaz" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-alger", label: "Formation DGR Alger" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Planning" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/it-anac-38-25-formation", label: "IT ANAC 38-25" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Hassi Messaoud", path: "/formation-dgr-hassi-messaoud" },
      ]}
      ctaTitle="Demander une proposition pour Hassi Messaoud"
      ctaText="Indiquez si vous visez un intra sur site, une classe virtuelle, ou un présentiel à Bab Ezzouar."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Hassi Messaoud."
    />
  );
}
