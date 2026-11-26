/**
 * Registry of every public, indexable page. Drives the sitemap, hreflang,
 * the footer/home internal-link blocks, "formations liées" blocks and llms.txt.
 */

export type PageGroup =
  | "home"
  | "algerie-villes"
  | "algerie-themes"
  | "fonctions"
  | "international"
  | "english"
  | "pratique"
  | "legal";

export type SitePage = {
  path: string; // "" for home
  lang: "fr" | "en";
  /** "dz": Algeria pages (DA prices, KOST billing). "intl": other countries. */
  region: "dz" | "intl";
  group: PageGroup;
  label: string;
  /** Equivalent page in the other language (reciprocal hreflang). */
  alt?: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

const p = (
  path: string,
  lang: "fr" | "en",
  region: "dz" | "intl",
  group: PageGroup,
  label: string,
  priority = 0.8,
  changeFrequency: SitePage["changeFrequency"] = "monthly",
  alt?: string,
): SitePage => ({ path, lang, region, group, label, priority, changeFrequency, alt });

export const SITE_PAGES: SitePage[] = [
  p("", "fr", "dz", "home", "Accueil", 1.0, "weekly"),

  // Algérie — villes
  p("/formation-dgr-alger", "fr", "dz", "algerie-villes", "Formation DGR Alger", 0.9),
  p("/formation-dgr-oran", "fr", "dz", "algerie-villes", "Formation DGR Oran", 0.9),
  p("/formation-dgr-constantine", "fr", "dz", "algerie-villes", "Formation DGR Constantine", 0.9),
  p("/formation-dgr-annaba", "fr", "dz", "algerie-villes", "Formation DGR Annaba", 0.9),
  p("/formation-dgr-bejaia", "fr", "dz", "algerie-villes", "Formation DGR Béjaïa", 0.9),
  p("/formation-dgr-setif", "fr", "dz", "algerie-villes", "Formation DGR Sétif", 0.9),
  p("/formation-dgr-hassi-messaoud", "fr", "dz", "algerie-villes", "Formation DGR Hassi Messaoud", 0.9),

  // Algérie — thèmes
  p("/formation-dgr-algerie", "fr", "dz", "algerie-themes", "Formation DGR Algérie", 0.9, "monthly", "/iata-dangerous-goods-training-algeria"),
  p("/formation-marchandises-dangereuses-algerie", "fr", "dz", "algerie-themes", "Formation marchandises dangereuses Algérie", 0.9),
  p("/formation-iata-dgr-cbta", "fr", "dz", "algerie-themes", "Formation IATA DGR CBTA", 0.9),
  p("/it-anac-38-25-formation", "fr", "dz", "algerie-themes", "IT ANAC 38-25 : formation", 0.9),
  p("/recyclage-dgr-24-mois", "fr", "dz", "algerie-themes", "Recyclage DGR 24 mois", 0.9, "monthly", "/iata-dgr-recurrent-training"),
  p("/formation-dgr-categorie-6", "fr", "dz", "algerie-themes", "Formation DGR catégorie 6", 0.9),
  p("/reglementation-dgr-algerie", "fr", "dz", "algerie-themes", "Réglementation DGR Algérie", 0.9),
  p("/formation-dgr-petrole-gaz", "fr", "dz", "algerie-themes", "Formation DGR pétrole et gaz", 0.9),
  p("/formation-dgr-pharmacie", "fr", "dz", "algerie-themes", "Formation DGR pharmacie", 0.9),
  p("/formation-dgr-transitaires", "fr", "dz", "algerie-themes", "Formation DGR transitaires", 0.9),
  p("/entreprises", "fr", "dz", "algerie-themes", "Solutions entreprises", 0.75),

  // Fonctions 7.1 à 7.10
  p("/dgr-7-1", "fr", "dz", "fonctions", "DGR 7.1 — Préparation des envois"),
  p("/dgr-7-2", "fr", "dz", "fonctions", "DGR 7.2 — Fret général"),
  p("/dgr-7-3", "fr", "dz", "fonctions", "DGR 7.3 — Acceptation DG"),
  p("/dgr-7-4", "fr", "dz", "fonctions", "DGR 7.4 — Manutention et chargement"),
  p("/dgr-7-5", "fr", "dz", "fonctions", "DGR 7.5 — Passagers et bagages"),
  p("/dgr-7-6", "fr", "dz", "fonctions", "DGR 7.6 — Planification du chargement"),
  p("/dgr-7-7", "fr", "dz", "fonctions", "DGR 7.7 — Équipage de conduite"),
  p("/dgr-7-8", "fr", "dz", "fonctions", "DGR 7.8 — Opérations et dispatch"),
  p("/dgr-7-9", "fr", "dz", "fonctions", "DGR 7.9 — Équipage de cabine"),
  p("/dgr-7-10", "fr", "dz", "fonctions", "DGR 7.10 — Contrôle de sûreté"),

  // International (FR)
  p("/formation-dgr-afrique", "fr", "intl", "international", "Formation DGR Afrique", 0.9, "monthly", "/cbta-dgr-training-africa"),
  p("/formation-dgr-maroc", "fr", "intl", "international", "Formation DGR Maroc", 0.9),
  p("/formation-dgr-tunisie", "fr", "intl", "international", "Formation DGR Tunisie", 0.9),
  p("/formation-dgr-senegal", "fr", "intl", "international", "Formation DGR Sénégal", 0.9),
  p("/formation-dgr-cote-ivoire", "fr", "intl", "international", "Formation DGR Côte d'Ivoire", 0.9),
  p("/formation-dgr-cameroun", "fr", "intl", "international", "Formation DGR Cameroun", 0.9),
  p("/formation-dgr-mali", "fr", "intl", "international", "Formation DGR Mali", 0.9),
  p("/formation-dgr-gabon", "fr", "intl", "international", "Formation DGR Gabon", 0.9),

  // English
  p("/iata-dangerous-goods-training-algeria", "en", "dz", "english", "Dangerous goods training Algeria", 0.9, "monthly", "/formation-dgr-algerie"),
  p("/iata-dgr-recurrent-training", "en", "intl", "english", "IATA DGR recurrent training", 0.9, "monthly", "/recyclage-dgr-24-mois"),
  p("/cbta-dgr-training-africa", "en", "intl", "english", "CBTA DGR training Africa", 0.9, "monthly", "/formation-dgr-afrique"),
  p("/iata-dgr-course-nigeria", "en", "intl", "english", "IATA DGR course Nigeria", 0.9),
  p("/iata-dgr-course-ghana", "en", "intl", "english", "IATA DGR course Ghana", 0.9),
  p("/iata-dgr-course-kenya", "en", "intl", "english", "IATA DGR course Kenya", 0.9),

  // Pratique
  p("/planning", "fr", "dz", "pratique", "Planning", 0.9, "weekly"),
  p("/promos", "fr", "dz", "pratique", "Offres", 0.85, "weekly"),
  p("/a-propos", "fr", "dz", "pratique", "À propos", 0.7),
  p("/contact", "fr", "dz", "pratique", "Contact", 0.75),

  // Légal
  p("/mentions-legales", "fr", "dz", "legal", "Mentions légales", 0.2, "yearly"),
  p("/confidentialite", "fr", "dz", "legal", "Confidentialité", 0.2, "yearly"),
];

export const GROUP_LABELS: Record<PageGroup, { fr: string; en: string }> = {
  home: { fr: "Accueil", en: "Home" },
  "algerie-villes": { fr: "Formation DGR par ville", en: "DGR training by city (Algeria)" },
  "algerie-themes": { fr: "Formations DGR Algérie", en: "DGR training in Algeria" },
  fonctions: { fr: "Fonctions 7.1 à 7.10", en: "Functions 7.1 to 7.10" },
  international: { fr: "Formation DGR à l'international", en: "DGR training abroad (French)" },
  english: { fr: "Pages en anglais", en: "English pages" },
  pratique: { fr: "Pratique", en: "Practical" },
  legal: { fr: "Légal", en: "Legal" },
};

export function getSitePage(path: string): SitePage | undefined {
  const normalized = path === "/" ? "" : path.replace(/\/$/, "");
  return SITE_PAGES.find((page) => page.path === normalized);
}

export function pagesInGroup(group: PageGroup): SitePage[] {
  return SITE_PAGES.filter((page) => page.group === group);
}

/** True for every page that is not explicitly about another country. */
export function isAlgeriaPath(path: string): boolean {
  return getSitePage(path)?.region !== "intl";
}

/**
 * Canonical + reciprocal hreflang (fr/en + x-default → French version) for a
 * path. Pages without an equivalent get only their canonical.
 */
export function alternatesFor(path: string) {
  const page = getSitePage(path);
  const canonical = path || "/";
  if (!page?.alt) return { canonical };
  const fr = page.lang === "fr" ? page.path : page.alt;
  const en = page.lang === "en" ? page.path : page.alt;
  return {
    canonical,
    languages: { fr, en, "x-default": fr },
  };
}

/**
 * "Formations liées" — a stable, topical selection (≥ 6 links) for a page:
 * siblings in its group first, then the main Algeria hubs.
 */
export function relatedPages(path: string, max = 8): SitePage[] {
  const page = getSitePage(path);
  if (!page) return [];
  const hubsFr = [
    "/formation-dgr-algerie",
    "/formation-marchandises-dangereuses-algerie",
    "/formation-dgr-alger",
    "/it-anac-38-25-formation",
    "/recyclage-dgr-24-mois",
    "/formation-iata-dgr-cbta",
  ];
  const hubsEn = [
    "/iata-dangerous-goods-training-algeria",
    "/iata-dgr-recurrent-training",
    "/cbta-dgr-training-africa",
    "/iata-dgr-course-nigeria",
    "/iata-dgr-course-ghana",
    "/iata-dgr-course-kenya",
  ];
  const siblings = SITE_PAGES.filter(
    (other) => other.group === page.group && other.path !== page.path && other.group !== "legal",
  );
  const hubs = (page.lang === "en" ? hubsEn : hubsFr)
    .map((hub) => getSitePage(hub))
    .filter((hub): hub is SitePage => Boolean(hub));
  const seen = new Set<string>([page.path]);
  const out: SitePage[] = [];
  for (const candidate of [...siblings, ...hubs]) {
    if (seen.has(candidate.path)) continue;
    seen.add(candidate.path);
    out.push(candidate);
    if (out.length >= max) break;
  }
  return out;
}
