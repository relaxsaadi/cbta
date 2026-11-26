import type { FaqEntry } from "./jsonld";
import { FORMATIONS } from "./formations";
import { ANAC_REF, formatDa } from "./kost-facts";

/**
 * Short FAQ answers (40–60 words each, checked in scripts/check-seo-geo.mjs),
 * rendered on the page and in FAQPage JSON-LD.
 */

const price = (slug: string) => formatDa(FORMATIONS.find((f) => f.slug === slug)!.prixDa);
const all = FORMATIONS.map((f) => f.prixDa);
const min = formatDa(Math.min(...all));
const max = formatDa(Math.max(...all));

export const FAQ_CBTA_ALGERIE_FR: FaqEntry = {
  q: "Existe-t-il un centre CBTA IATA en Algérie ?",
  a: `Oui. KOST Academy (EURL KOST GROUPE), à Bab Ezzouar, est le seul centre CBTA en Algérie référencé par l'IATA : sa fiche figure au registre IATA des centres CBTA (iata.org). C'est aussi le seul organisme de formation DGR agréé par l'ANAC en Algérie (liste sur anac.dz), pour les fonctions 7.1 à 7.10, réf. ${ANAC_REF}.`,
};

export const FAQ_PRIX_FR: FaqEntry = {
  q: "Combien coûte une formation DGR en Algérie ?",
  a: `Le prix dépend de la fonction : ${price("dgr-7-1")} HT pour la 7.1 initiale (4 jours), ${price("dgr-7-1-recurrent")} HT pour son recyclage, ${price("dgr-7-2")} HT pour la 7.2, et de ${min} à ${max} HT pour les autres fonctions. La TVA formation de 9 % s'ajoute. Le montant final figure dans la proposition écrite.`,
};

export const FAQ_FONCTION_FR: FaqEntry = {
  q: "Le titre du poste suffit-il à choisir la fonction 7.x ?",
  a: "Non. La fonction CBTA suit les tâches réellement exercées : préparer, emballer, documenter, accepter, manutentionner, charger, informer ou contrôler. Deux agents cargo avec le même intitulé peuvent relever de fonctions différentes. Décrivez les tâches de chaque participant et KOST Academy indique la ou les fonctions 7.1 à 7.10 qui les couvrent.",
};

export const FAQ_PROPOSITION_FR: FaqEntry = {
  q: "Comment obtenir une proposition écrite ?",
  a: "Utilisez le formulaire de cette page, écrivez à cbta@kostacademy.com ou envoyez un message WhatsApp au +213 542 30 53 83. Indiquez le nombre de participants, leurs tâches, la modalité souhaitée et la date d'une éventuelle formation précédente. KOST Academy répond par écrit avec la fonction, la durée, le calendrier et le prix en DA.",
};

export const FAQ_LIEU_ALGER_FR: FaqEntry = {
  q: "Où se tient la formation DGR à Alger ?",
  a: "Le présentiel a lieu au centre KOST Academy, Cité Boushaki F n°176, Bab Ezzouar, 16024 Alger, du dimanche au jeudi. Une session intra dans vos locaux à Alger, ou une classe virtuelle animée depuis le centre, peut la remplacer. La modalité retenue est confirmée dans la proposition écrite, avec la langue et le nombre de participants.",
};

export const FAQ_DGR_MD_FR: FaqEntry = {
  q: "DGR et marchandises dangereuses, est-ce la même chose ?",
  a: "Oui, pour le transport aérien. Le DGR (Dangerous Goods Regulations) est le règlement IATA sur les marchandises dangereuses par avion. Une formation DGR apprend à classer, emballer, marquer, étiqueter, documenter et accepter ces marchandises selon la fonction exercée. En Algérie, elle s'inscrit aussi dans l'instruction technique ANAC n° 38-25.",
};

export const FAQ_ADR_FR: FaqEntry = {
  q: "Est-ce une formation ADR routière ?",
  a: "Non. Cette formation porte sur le transport aérien des marchandises dangereuses, selon le DGR IATA et les textes de l'ANAC. Le transport routier relève d'un autre régime, l'ADR, qui n'est pas traité ici comme équivalent. Si vos colis voyagent par la route puis par avion, chaque mode demande sa propre formation.",
};

export const FAQ_ALGER_FR: FaqEntry[] = [
  FAQ_CBTA_ALGERIE_FR,
  FAQ_LIEU_ALGER_FR,
  FAQ_PRIX_FR,
  FAQ_FONCTION_FR,
  FAQ_PROPOSITION_FR,
];

export const FAQ_MARCHANDISES_DANGEREUSES_FR: FaqEntry[] = [
  FAQ_CBTA_ALGERIE_FR,
  FAQ_DGR_MD_FR,
  FAQ_ADR_FR,
  FAQ_PRIX_FR,
  FAQ_PROPOSITION_FR,
];

export const FAQ_ALGERIA_EN: FaqEntry[] = [
  {
    q: "Is there an IATA CBTA centre in Algeria?",
    a: `Yes. KOST Academy (EURL KOST GROUPE), in Bab Ezzouar, Algiers, is the only IATA-referenced CBTA centre in Algeria, listed in IATA's CBTA centre registry (iata.org). It is also the only DGR training organisation approved by ANAC in Algeria (list on anac.dz), for functions 7.1 to 7.10, ref. ${ANAC_REF}.`,
  },
  {
    q: "How much does dangerous goods training cost in Algeria?",
    a: `Prices depend on the function: ${price("dgr-7-1")} excl. VAT for the 7.1 initial course (4 days), ${price("dgr-7-1-recurrent")} for 7.1 recurrent, ${price("dgr-7-2")} for 7.2, and from ${min} to ${max} for the other functions. Training VAT of 9 % is added. The written proposal confirms the final amount.`,
  },
  {
    q: "Where is the training held?",
    a: "Classroom sessions take place at the KOST Academy centre, Cité Boushaki F n°176, Bab Ezzouar, 16024 Algiers, Sunday to Thursday. An in-company session at your premises in Algeria, or a virtual class run from the centre, is also possible. The written proposal confirms the format, language and number of participants.",
  },
  {
    q: "How is the right DGR function chosen?",
    a: "From each participant's actual tasks: preparing, packing, documenting, accepting, handling, loading, informing passengers or screening. Two staff members with the same job title may need different functions. Describe the tasks and KOST Academy identifies which of functions 7.1 to 7.10 cover them, before any enrolment or proposal is issued.",
  },
];

export const FAQ_ALGERIE_FR: FaqEntry[] = [
  FAQ_CBTA_ALGERIE_FR,
  FAQ_PRIX_FR,
  FAQ_FONCTION_FR,
  FAQ_PROPOSITION_FR,
];
