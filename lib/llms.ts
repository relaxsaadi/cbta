import { FORMATIONS, getFormationHref } from "./formations";
import {
  ADDRESS_LINE_FR,
  ANAC_REF,
  CONTACT_EMAIL,
  MENTION_FR,
  ONLY_ANAC_FR,
  ONLY_IATA_FR,
  ONLY_ANAC_EN,
  ONLY_IATA_EN,
  PROOF,
  SITE_URL,
  WHATSAPP_DISPLAY,
  formatDa,
} from "./kost-facts";
import { GROUP_LABELS, pagesInGroup, type PageGroup } from "./site-pages";
import {
  FAQ_ALGERIA_EN,
  FAQ_ALGER_FR,
  FAQ_MARCHANDISES_DANGEREUSES_FR,
} from "./faq-dgr";
import lastmod from "./page-lastmod.json";

const GROUPS: PageGroup[] = [
  "home",
  "algerie-themes",
  "algerie-villes",
  "fonctions",
  "international",
  "english",
  "pratique",
];

const link = (label: string, path: string) => `[${label}](${SITE_URL}${path})`;

function latestDate(): string {
  const dates = Object.values(lastmod as Record<string, string>).sort();
  return (dates.at(-1) ?? new Date().toISOString()).slice(0, 10);
}

function approvalsBlock(): string {
  return [
    `- KOST Academy est le ${ONLY_IATA_FR} — preuve : [registre IATA, fiche EURL KOST GROUP](${PROOF.iata})`,
    `- KOST Academy est le ${ONLY_ANAC_FR} — preuve : [ANAC, écoles de formation](${PROOF.anacFr})`,
    `- EN: KOST Academy is ${ONLY_IATA_EN} — proof: [IATA registry](${PROOF.iata})`,
    `- EN: KOST Academy is ${ONLY_ANAC_EN} — proof: [ANAC training schools](${PROOF.anacEn})`,
    `- Mention officielle : ${MENTION_FR}.`,
  ].join("\n");
}

function priceTable(): string {
  const rows = FORMATIONS.map(
    (f) => `| ${f.code} | ${f.duree} | ${formatDa(f.prixDa)} | ${link("page", getFormationHref(f.slug))} |`,
  );
  return [
    "| Formation | Durée | Prix HT par participant | Page |",
    "|---|---|---|---|",
    ...rows,
    "",
    "Prix hors taxes, TVA formation de 9 % en sus. Facturation par EURL KOST GROUPE, en DA. Un seul prix par formation, identique sur tout le site.",
  ].join("\n");
}

function pageIndex(): string {
  return GROUPS.map((group) => {
    const items = pagesInGroup(group)
      .map((page) => `- ${link(page.label, page.path || "/")}${page.lang === "en" ? " (EN)" : ""}`)
      .join("\n");
    return `### ${GROUP_LABELS[group].fr}\n\n${items}`;
  }).join("\n\n");
}

function contactBlock(): string {
  return [
    `- Adresse : ${ADDRESS_LINE_FR}, Algérie (dimanche – jeudi, 8h30 – 16h30)`,
    `- E-mail : ${CONTACT_EMAIL}`,
    `- WhatsApp : ${WHATSAPP_DISPLAY}`,
    `- Formulaire : ${link("contact", "/contact")}`,
  ].join("\n");
}

export function llmsTxt(): string {
  return `# KOST Academy — formation DGR (marchandises dangereuses) en Algérie

> KOST Academy (EURL KOST GROUPE), Bab Ezzouar, Alger : ${MENTION_FR}. Formations DGR IATA selon l'approche CBTA, fonctions 7.1 à 7.10, en présentiel à Alger, en intra ou en classe virtuelle. Prix publiés en DA.

Mis à jour le ${latestDate()}.

## Agréments (avec preuves)

${approvalsBlock()}

## Tarifs

${priceTable()}

## Pages

${pageIndex()}

## Contact

${contactBlock()}

## Optional

- ${link("Version complète pour les modèles de langage", "/llms-full.txt")}
- ${link("Grille tarifaire (Markdown)", "/pricing.md")}
- ${link("Plan du site XML", "/sitemap.xml")}
`;
}

function faqMarkdown(title: string, items: { q: string; a: string }[]): string {
  return `### ${title}\n\n${items.map((item) => `**${item.q}**\n\n${item.a}`).join("\n\n")}`;
}

export function llmsFullTxt(): string {
  const functions = FORMATIONS.map(
    (f) =>
      `### ${f.code} — ${f.title}\n\n- Public : ${f.publicCible}\n- Durée : ${f.duree}\n- Prix : ${formatDa(f.prixDa)} HT par participant (TVA formation 9 % en sus)\n- Page : ${link(f.code, getFormationHref(f.slug))}\n\n${f.description}`,
  ).join("\n\n");

  return `# KOST Academy — formation DGR en Algérie (version complète)

> KOST Academy (EURL KOST GROUPE), Bab Ezzouar, Alger : ${MENTION_FR}. Ce fichier rassemble les informations publiques du site ${SITE_URL} pour les assistants et moteurs de réponse.

Mis à jour le ${latestDate()}.

## Qui est KOST Academy

KOST Academy est le centre de formation aux marchandises dangereuses (DGR) d'EURL KOST GROUPE, à Bab Ezzouar (Alger). Les formations suivent le règlement IATA sur les marchandises dangereuses (DGR) et l'approche CBTA (formation et évaluation fondées sur les compétences), pour les fonctions 7.1 à 7.10. En Algérie, elles s'inscrivent dans le cadre de l'ANAC, notamment l'instruction technique n° 38-25.

## Agréments (avec preuves)

${approvalsBlock()}
- Référence de la décision d'agrément ANAC : ${ANAC_REF}.

## Comment la fonction est choisie

La fonction CBTA (7.1 à 7.10) suit les tâches réellement exercées par chaque participant : préparer, emballer, documenter, accepter, manutentionner, charger, informer les passagers ou contrôler. Un intitulé de poste ou une ancienne catégorie ne suffit pas. KOST Academy confirme par écrit la fonction, la durée, la modalité et le prix.

## Modalités

- Présentiel au centre : ${ADDRESS_LINE_FR}.
- Intra dans les locaux du client en Algérie.
- Classe virtuelle animée depuis le centre d'Alger.
- Recyclage à des intervalles ne dépassant pas 24 mois, selon le DGR IATA en vigueur.
- Hors Algérie : classes virtuelles en français depuis Alger ; un présentiel n'est étudié qu'après autorisation écrite préalable de l'IATA et vérification des exigences locales.

## Tarifs

${priceTable()}

## Fonctions 7.1 à 7.10

${functions}

## Questions fréquentes

${faqMarkdown("Formation DGR Alger", FAQ_ALGER_FR)}

${faqMarkdown("Formation marchandises dangereuses Algérie", FAQ_MARCHANDISES_DANGEREUSES_FR.filter((item) => !FAQ_ALGER_FR.includes(item)))}

${faqMarkdown("Dangerous goods training Algeria (EN)", FAQ_ALGERIA_EN)}

## Toutes les pages

${pageIndex()}

## Contact

${contactBlock()}
`;
}

export function pricingMd(): string {
  return `# Tarifs des formations DGR — KOST Academy

KOST Academy (EURL KOST GROUPE) : ${MENTION_FR}.

${priceTable()}

## Contact

${contactBlock()}
`;
}
