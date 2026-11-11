import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_FR, exactMatchMetadata } from "@/lib/exact-match";

const title = "Formation DGR catégorie 6 | Approche CBTA";
const description =
  "Formation DGR catégorie 6 : relier l'ancienne grille IATA à la fonction CBTA selon les tâches réelles. Centre référencé IATA, agréé ANAC. Offre écrite.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "formation-dgr-categorie-6",
  locale: "fr",
  keywords: ["formation DGR catégorie 6", "catégorie 6 DGR", "CBTA 7.3", "ancienne catégorie IATA"],
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="fr"
      slug="formation-dgr-categorie-6"
      eyebrow="Ancienne grille · pas une équivalence automatique"
      h1="Formation DGR catégorie 6"
      description={description}
      lead={[
        `Formation DGR catégorie 6 : beaucoup d'entreprises cherchent encore cet intitulé de l'ancienne grille IATA ; KOST Academy, ${OFFICIAL_FR}, cadre le besoin à partir des tâches réellement exercées.`,
        "La catégorie 6 n'est pas convertie d'office en fonction 7.3. Cette page explique ce que recouvrait cet ancien intitulé, comment passer à l'approche CBTA, et comment demander une proposition écrite. Aucun montant n'est affiché.",
      ]}
      sections={[
        {
          id: "ancienne-grille",
          title: "Ce qu'était la formation DGR catégorie 6 dans l'ancienne grille IATA",
          paragraphs: [
            "Avant la généralisation de l'approche par compétences, le DGR IATA organisait la formation en catégories numérotées, chacune associée à un type de travail. Dans cette grille, la catégorie 6 était souvent associée au personnel d'acceptation : les agents de l'exploitant ou de l'assistant en escale qui acceptent des envois de marchandises dangereuses. C'est pour cela que des fiches de poste, des appels d'offres et des manuels parlent encore de « cat. 6 » alors que le cadre de travail courant est devenu le CBTA.",
            "Cette description historique sert à reconnaître la demande. Elle n'est pas une table de conversion. L'édition courante du DGR, le manuel de l'opérateur et les tâches réelles priment sur le souvenir d'un numéro. Si votre document interne cite encore la catégorie 6, joignez-le à la demande : il aide à comprendre l'attente, il n'attribue pas la fonction.",
          ],
        },
        {
          id: "cbta",
          title: "Passage à l'approche CBTA (fonctions 7.1 à 7.10)",
          paragraphs: [
            "Le CBTA (competency-based training and assessment) organise la formation selon des fonctions 7.1 à 7.10, chacune liée à un ensemble de tâches. Préparer une expédition, traiter du fret général, accepter des marchandises dangereuses, manutentionner, gérer des passagers, planifier un chargement, faire partie d'un équipage ou contrôler au titre de la sûreté ne sont pas interchangeables. Le numéro 6 de l'ancienne grille ne survit pas comme synonyme d'une de ces fonctions.",
            "KOST Academy est un centre CBTA référencé IATA, agréé ANAC pour les fonctions 7.1 à 7.10, réf. ANAC/DSOA/SAL-DGR/01/2026. Le passage d'une demande « catégorie 6 » à une fonction 7.x se fait dans la proposition, après lecture des tâches, pas dans le titre de cette page.",
          ],
        },
        {
          id: "correspondances",
          title: "Correspondances possibles, sans attribution automatique",
          paragraphs: [
            "Il est tentant d'écrire « catégorie 6 = 7.3 » parce que les deux parlent d'acceptation. Cette page ne le fait pas. La fonction 7.3 vise le personnel qui traite ou accepte des envois de marchandises dangereuses. Elle n'est retenue que si les tâches le justifient : contrôle de la documentation, vérification de l'emballage, du marquage et de l'étiquetage, décision d'acceptation, selon le partage réel des rôles dans l'entreprise.",
            "Une personne présentée comme « catégorie 6 » peut en pratique préparer des expéditions pour le compte d'un expéditeur, ne voir que du fret général, ou partager son temps entre l'acceptation et la manutention. Dans ces cas, 7.1, 7.2 ou 7.4 peuvent être plus justes, éventuellement avec 7.3. Plusieurs fonctions peuvent coexister dans la même équipe si les personnes ne font pas le même travail.",
          ],
          subsections: [
            {
              title: "La catégorie 6 était souvent associée au personnel d'acceptation",
              paragraphs: [
                "Retenir 7.3 uniquement lorsque les tâches sont celles de l'acceptation des marchandises dangereuses évite deux erreurs. L'une est de former à l'acceptation quelqu'un qui ne fait que préparer ou manutentionner. L'autre est de refuser 7.3 à quelqu'un qui accepte réellement des envois, au motif que son contrat ne porte pas le mot « acceptation ». Le geste compte plus que le titre. La page DGR 7.3 décrit cette fonction sans en faire la suite automatique de la catégorie 6.",
              ],
            },
          ],
        },
        {
          id: "declarer",
          title: "Comment déclarer les tâches pour déterminer la bonne fonction 7.x",
          paragraphs: [
            "Pour chaque participant, notez cinq éléments : ce qu'il reçoit comme colis ou comme dossier, ce qu'il contrôle, ce qu'il a le droit de refuser, quels documents il signe, et à qui il transmet l'envoi ensuite. Ajoutez le lieu : bureau d'un transitaire, comptoir d'acceptation, entrepôt, piste, enregistrement, poste de sûreté. Ces précisions suffisent à écarter les fonctions qui ne correspondent pas.",
            "Si l'entreprise opère en Algérie, le cadre ANAC et l'IT 38-25 restent à vérifier en parallèle, de même que le DGR IATA courant, l'Annexe 18 de l'OACI et le Doc 9284. Une ancienne catégorie citée dans un manuel ne dispense pas de cette lecture. Les pages transitaires et formation DGR Algérie aident à situer le contexte, sans choisir la fonction à votre place.",
          ],
        },
        {
          id: "recyclage",
          title: "Recyclage des agents formés sous l'ancienne catégorie 6",
          paragraphs: [
            "Un agent formé autrefois en catégorie 6 n'est pas « recyclé en catégorie 6 ». On regarde s'il accepte encore des marchandises dangereuses. Si oui, le recyclage se cadre en principe sur la fonction qui couvre ces tâches, souvent 7.3, et seulement si la description le confirme. Si ses tâches ont changé, la fonction change avec elles. L'intervalle à considérer est celui du recyclage DGR, qui ne dépasse pas 24 mois dans le DGR IATA, à confirmer dans l'édition courante et selon l'autorité ou l'opérateur. Ce n'est pas une date d'expiration affichée ici.",
            "La page recyclage DGR 24 mois détaille cet intervalle. Les ancres de recyclage des pages 7.1 et 7.3 servent lorsque la fonction est déjà identifiée.",
          ],
        },
        {
          id: "proposition",
          title: "Comment demander une proposition écrite",
          paragraphs: [
            "Écrivez « catégorie 6 » si c'est le terme de votre appel d'offres ou de votre manuel, puis décrivez les tâches. Indiquez le nombre de personnes, la ville, et la modalité : présentiel à Bab Ezzouar, intra chez vous, ou classe virtuelle depuis Alger. Hors Algérie, la classe virtuelle part d'Alger ; un présentiel sur place n'est étudié qu'après autorisation écrite préalable d'IATA.",
            "La réponse passe par le formulaire, par cbta@kostacademy.com ou par WhatsApp +213 542 305 383. Elle est écrite. Elle nomme la ou les fonctions proposées et ce qui reste à confirmer. Elle ne transforme pas la catégorie 6 en 7.3 par défaut.",
          ],
        },
      ]}
      faqs={[
        {
          q: "La catégorie 6 équivaut-elle à la fonction 7.3 ?",
          a: "Non. La catégorie 6 était souvent associée au personnel d'acceptation, et 7.3 ne peut être retenue que si les tâches actuelles le justifient. Ce n'est pas une équivalence automatique.",
        },
        {
          q: "Pourquoi cette page existe-t-elle encore ?",
          a: "Parce que des entreprises, des manuels et des consultations cherchent encore l'intitulé « formation DGR catégorie 6 ». La page relie cette recherche au CBTA sans faire survivre l'ancienne grille.",
        },
        {
          q: "Faut-il joindre l'ancienne attestation ?",
          a: "Elle est utile pour dater la session précédente et voir l'intitulé suivi. Elle ne choisit pas la fonction du recyclage.",
        },
        {
          q: "Comment recevoir la proposition ?",
          a: "Par écrit : formulaire de la page, cbta@kostacademy.com ou WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/dgr-7-3", label: "DGR 7.3" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/formation-dgr-algerie", label: "Formation DGR Algérie" },
        { href: "/formation-dgr-transitaires", label: "Transitaires" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois" },
        { href: "/entreprises", label: "Entreprises" },
        { href: "/contact", label: "Contact" },
        { href: "/a-propos", label: "À propos" },
      ]}
      crumbs={[
        { name: "Accueil", path: "" },
        { name: "Formation DGR catégorie 6", path: "/formation-dgr-categorie-6" },
      ]}
      ctaTitle="Décrire les tâches derrière la catégorie 6"
      ctaText="Envoyez l'intitulé utilisé dans votre entreprise et, surtout, ce que les personnes font réellement à l'acceptation ou ailleurs."
      whatsappMessage="Bonjour, je souhaite une proposition écrite pour une formation DGR catégorie 6, à cadrer en CBTA."
    />
  );
}
