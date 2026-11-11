import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR Gabon | CBTA, à distance";
const description =
  "Formation DGR Gabon en classe virtuelle depuis Alger. Centre CBTA référencé IATA, agréé ANAC, fonctions 7.1 à 7.10. Demandez une proposition écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-gabon",
  locale: "fr",
  keywords: ["formation DGR Gabon", "CBTA Gabon", "marchandises dangereuses Libreville", "DGR pétrole Gabon"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-gabon"
      eyebrow="Gabon · classe virtuelle depuis Alger"
      h1="Formation DGR Gabon"
      description={description}
      lead={[
        `Formation DGR Gabon : KOST Academy, ${OFFICIAL_FR}, accompagne les entreprises gabonaises en classe virtuelle depuis Alger, après vérification des exigences locales applicables.`,
        "Aucun centre KOST n'est annoncé au Gabon, ni à Libreville ni à Port-Gentil. Le centre CBTA est à Alger, 176 Cité Boushaki, Bab Ezzouar. KOST est aussi implantée à Paris ; cette page n'y place pas la session. Un présentiel au Gabon n'est étudié qu'après autorisation écrite préalable d'IATA. Aucun montant n'est publié.",
      ]}
      sections={[
        {
          id: "public",
          title: "Public concerné au Gabon",
          paragraphs: [
            "Les demandes viennent du fret, du pétrole et du gaz, des handlers, des compagnies et des équipes d'aéroport. Libreville et l'aéroport Léon-Mba concentrent une grande partie des vols. Port-Gentil concentre une activité pétrolière et logistique dont certains colis classés partent ensuite par avion. Les deux villes peuvent figurer dans la même entreprise sans relever de la même fonction.",
            "Le secteur énergie est le contexte le plus fréquent, pas une fonction imposée. La page formation DGR pétrole et gaz explique ce cadrage sans liste de clients et sans volume. On l'utilise en complément, puis on décrit les tâches gabonaises : préparer une expédition, accepter un colis, le stocker, le charger, ou le contrôler. Ce n'est pas la page Mali, tournée vers le fret ouest-africain de Bamako, ni la page Tunisie.",
          ],
        },
        {
          id: "modalites",
          title: "Modalités : classe virtuelle depuis Alger",
          paragraphs: [
            "La modalité ordinaire est la classe virtuelle depuis le centre d'Alger. Les participants restent à Libreville, à Port-Gentil ou sur un site intérieur. S'ils se déplacent, le présentiel au centre a lieu à Bab Ezzouar. Il n'y a pas de salle KOST au Gabon.",
            "Dites si les personnes partagent les mêmes tâches ou si le bureau de Libreville et le site de Port-Gentil font des travaux différents. La proposition peut alors viser une ou deux fonctions, pas un intitulé de pays.",
          ],
          subsections: [
            {
              title: "Présentiel hors Algérie seulement après autorisation écrite préalable d'IATA",
              paragraphs: [
                "Un formateur sur un site gabonais n'est pas proposé par défaut. Il ne s'étudie qu'après autorisation écrite préalable d'IATA et vérification des exigences de l'autorité de l'aviation civile compétente au Gabon et de l'opérateur. Jusque-là, la formation DGR Gabon se cadre en classe virtuelle depuis Alger, ou en présentiel à Bab Ezzouar. La page Afrique en français relie cette page aux autres pays qui ont réellement une page.",
              ],
            },
          ],
        },
        {
          id: "fonctions",
          title: "Fonctions CBTA 7.1 à 7.10 selon les tâches réelles",
          paragraphs: [
            "Les fonctions couvrent la préparation des expéditions, le fret général, l'acceptation, la manutention, les passagers, la planification du chargement, les équipages, le dispatch et la sûreté. L'agrément ANAC/DSOA/SAL-DGR/01/2026 porte sur les fonctions 7.1 à 7.10. C'est un agrément algérien. Il n'est pas présenté comme une décision de l'autorité gabonaise.",
            "Une ancienne catégorie dans un contrat pétrolier ne se convertit pas d'elle-même. Le DGR IATA courant, l'Annexe 18 de l'OACI et le Doc 9284 restent les sources internationales à ouvrir, avec le manuel de l'opérateur s'il existe.",
          ],
        },
        {
          id: "petrole",
          title: "Lien avec le cadrage pétrole et gaz",
          paragraphs: [
            "Beaucoup d'équipes gabonaises cherchent une formation DGR parce qu'elles expédient ou reçoivent des produits liés à l'énergie : échantillons, produits chimiques, batteries, équipements. La page pétrole et gaz sert à ne pas déduire la fonction du secteur. On y revient après avoir listé les tâches, pas avant.",
            "Si une partie du groupe est en Algérie et l'autre au Gabon, la classe virtuelle depuis Alger peut réunir les deux, sous réserve que les tâches soient décrites par site. Le présentiel commun, lui, est à Bab Ezzouar.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage et intervalle de 24 mois",
          paragraphs: [
            "Le DGR IATA prévoit un recyclage à des intervalles ne dépassant pas 24 mois, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur applicables à l'équipe gabonaise. Ce n'est pas une date d'expiration publiée ici.",
            "Voir la page recyclage DGR 24 mois. Indiquez la date de la session précédente et les tâches d'aujourd'hui, surtout si le poste a changé entre Libreville et un site de production.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez les tâches, les villes (Libreville, Port-Gentil ou autre), le lien éventuel avec le pétrole et le gaz, et si vous visez la classe virtuelle depuis Alger. Un présentiel au Gabon ne s'étudie qu'avec l'autorisation écrite IATA.",
            "Formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383. La réponse est écrite.",
          ],
        },
      ]}
      faqs={[
        {
          q: "KOST a-t-il un centre au Gabon ?",
          a: "Non. Classe virtuelle depuis Alger, ou présentiel à Bab Ezzouar. Un présentiel au Gabon suppose une autorisation écrite préalable d'IATA.",
        },
        {
          q: "Le pétrole et gaz impose-t-il une fonction ?",
          a: "Non. C'est le contexte le plus fréquent. La fonction suit les tâches. Voir la page pétrole et gaz.",
        },
        {
          q: "L'agrément ANAC est-il une décision gabonaise ?",
          a: "Non. La référence ANAC/DSOA/SAL-DGR/01/2026 est l'agrément algérien pour les fonctions 7.1 à 7.10. Les exigences locales et celles de l'opérateur se vérifient à part.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique" },
        { href: "/formation-dgr-petrole-gaz", label: "Pétrole et gaz" },
        { href: "/formation-dgr-tunisie", label: "Formation DGR Tunisie" },
        { href: "/formation-dgr-mali", label: "Formation DGR Mali" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR Gabon", path: "/formation-dgr-gabon" },
      ]}
      ctaTitle="Demander une proposition écrite pour le Gabon"
      ctaText="Décrivez les tâches à Libreville, à Port-Gentil ou sur site. La modalité de départ est la classe virtuelle depuis Alger."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR Gabon."
    />
  );
}
