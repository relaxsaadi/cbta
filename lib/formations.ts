export type Formation = {
  slug: string;
  code: string;
  title: string;
  publicCible: string;
  duree: string;
  prixEur: number;
  prixUsd: number;
  category: "initial" | "recurrent" | "specialise";
  description: string;
  programme: string[];
  postes: string[];
};

export const FORMATIONS: Formation[] = [
  {
    slug: "dgr-7-1",
    code: "DGR 7.1 Initial",
    title: "Préparation des expéditions de marchandises dangereuses",
    publicCible: "Expéditeurs, packers, freight forwarders",
    duree: "4 jours / 32h",
    prixEur: 1800,
    prixUsd: 1950,
    category: "initial",
    description:
      "Formation initiale IATA CBTA pour le personnel responsable de la préparation, de la classification et de la documentation des expéditions de marchandises dangereuses par voie aérienne.",
    programme: [
      "Réglementation IATA DGR 2026 (67e édition)",
      "Classification des 9 classes de marchandises dangereuses",
      "Identification, marquage et étiquetage",
      "Emballages UN approuvés et compatibilité",
      "Documents de transport et déclaration de l'expéditeur",
      "Quantités exemptées et limitées",
      "Lithium batteries, biens de consommation, matières infectieuses",
      "Cas pratiques et examen IATA officiel",
    ],
    postes: [
      "Expéditeurs et déclarants DG",
      "Responsables emballage et conditionnement",
      "Freight forwarders et commissionnaires",
      "Responsables qualité et conformité cargo",
    ],
  },
  {
    slug: "dgr-7-1-recurrent",
    code: "DGR 7.1 Recurrent",
    title: "Renouvellement préparation expéditions DG",
    publicCible: "Personnel déjà certifié 7.1",
    duree: "3 jours / 24h",
    prixEur: 1400,
    prixUsd: 1520,
    category: "recurrent",
    description:
      "Recyclage CBTA obligatoire tous les 24 mois pour maintenir la qualification 7.1.",
    programme: [
      "Mises à jour IATA DGR 2026 vs édition précédente",
      "Révision des classes et étiquetages",
      "Nouveaux variants opérateurs",
      "Lithium batteries — règles 2026",
      "Cas pratiques et examen IATA",
    ],
    postes: [
      "Tout personnel certifié 7.1 arrivant à échéance",
    ],
  },
  {
    slug: "dgr-7-2",
    code: "DGR 7.2",
    title: "Traitement et acceptation du fret général",
    publicCible: "Agents fret général, acceptation cargo",
    duree: "2 jours / 16h",
    prixEur: 900,
    prixUsd: 980,
    category: "specialise",
    description:
      "Formation pour le personnel chargé du traitement du fret non-DG mais devant identifier et refuser les DG cachées.",
    programme: [
      "Identification des marchandises dangereuses cachées",
      "Procédures de refus et escalade",
      "Documents fret et indices de DG non déclarées",
      "Coordination avec acceptation DG",
      "Examen IATA",
    ],
    postes: [
      "Agents acceptation cargo",
      "Personnel handling fret",
      "Manutentionnaires fret général",
    ],
  },
  {
    slug: "dgr-7-3",
    code: "DGR 7.3 Initial",
    title: "Acceptation des expéditions de marchandises dangereuses",
    publicCible: "Agents acceptation DG (compagnies, GHA)",
    duree: "5 jours / 40h",
    prixEur: 2100,
    prixUsd: 2280,
    category: "initial",
    description:
      "Formation initiale CBTA la plus complète, destinée aux agents qui acceptent au nom de la compagnie aérienne les expéditions de marchandises dangereuses.",
    programme: [
      "Ensemble du programme 7.1",
      "Procédures d'acceptation et checklist DG",
      "Variants opérateurs et restrictions étatiques",
      "NOTOC et briefing équipage",
      "Stockage et ségrégation au sol",
      "Gestion des non-conformités et rejets",
      "Cas pratiques d'acceptation et examen IATA",
    ],
    postes: [
      "Agents d'acceptation DG compagnies aériennes",
      "Responsables cargo GHA (ground handling)",
      "Superviseurs DG en escale",
    ],
  },
  {
    slug: "dgr-7-3-recurrent",
    code: "DGR 7.3 Recurrent",
    title: "Renouvellement acceptation DG",
    publicCible: "Personnel déjà certifié 7.3",
    duree: "3 jours / 18h",
    prixEur: 1500,
    prixUsd: 1630,
    category: "recurrent",
    description:
      "Recyclage CBTA obligatoire tous les 24 mois pour la fonction 7.3.",
    programme: [
      "Mises à jour IATA DGR 2026",
      "Nouveautés sur les variants opérateurs",
      "Cas d'acceptation difficiles retour d'expérience",
      "Examen IATA",
    ],
    postes: ["Personnel 7.3 arrivant à échéance de 24 mois"],
  },
  {
    slug: "dgr-7-4",
    code: "DGR 7.4",
    title: "Agent de piste et personnel de manutention",
    publicCible: "Agents piste, chargement, manutention",
    duree: "2 jours / 16h",
    prixEur: 900,
    prixUsd: 980,
    category: "specialise",
    description:
      "Formation pour les agents piste qui chargent, déchargent, transportent ou stockent des marchandises dangereuses.",
    programme: [
      "Reconnaissance des classes et étiquettes",
      "Ségrégation au sol et compatibilité",
      "Procédures de chargement aéronef",
      "Plans de chargement et NOTOC",
      "Réponse aux incidents au sol",
      "Examen IATA",
    ],
    postes: [
      "Agents de piste",
      "Chargeurs et déchargeurs",
      "Caristes et manutentionnaires zone cargo",
    ],
  },
  {
    slug: "dgr-7-5",
    code: "DGR 7.5",
    title: "Handling passagers et bagages",
    publicCible: "Agents enregistrement, embarquement",
    duree: "2 jours / 16h",
    prixEur: 850,
    prixUsd: 920,
    category: "specialise",
    description:
      "Formation des agents passage à reconnaître les marchandises dangereuses dans les bagages cabine et soute.",
    programme: [
      "DG autorisées, restreintes et interdites en bagages",
      "Lithium batteries, e-cigarettes, fauteuils électriques",
      "Affichage et information passagers",
      "Procédures de refus et de saisie",
      "Examen IATA",
    ],
    postes: [
      "Agents d'enregistrement",
      "Agents d'embarquement",
      "Superviseurs escale passagers",
    ],
  },
  {
    slug: "dgr-7-6",
    code: "DGR 7.6",
    title: "Loadmaster et planificateur de chargement",
    publicCible: "Loadmasters, agents load control",
    duree: "1 jour / 8h",
    prixEur: 650,
    prixUsd: 700,
    category: "specialise",
    description:
      "Formation pour les responsables du plan de chargement et de la masse-centrage incluant les marchandises dangereuses.",
    programme: [
      "Lecture et validation NOTOC",
      "Ségrégation soute et compatibilité",
      "Limites quantitatives par aéronef",
      "Communication équipage et briefing",
      "Examen IATA",
    ],
    postes: [
      "Loadmasters",
      "Agents load control",
      "Planificateurs vol cargo et passagers",
    ],
  },
  {
    slug: "dgr-7-7",
    code: "DGR 7.7",
    title: "Personnel navigant technique (PNT)",
    publicCible: "Pilotes, copilotes",
    duree: "1 jour / 8h",
    prixEur: 650,
    prixUsd: 700,
    category: "specialise",
    description:
      "Formation IATA DGR pour le personnel navigant technique : connaissance des DG embarquées, NOTOC, gestion d'incident en vol.",
    programme: [
      "Vue d'ensemble réglementation DGR",
      "Lecture du NOTOC en cockpit",
      "Procédures d'urgence DG en vol (ICAO Doc 9481)",
      "Communication ATC en cas d'incident",
      "Examen IATA",
    ],
    postes: ["Commandants de bord", "Officiers pilotes de ligne"],
  },
  {
    slug: "dgr-7-8",
    code: "DGR 7.8",
    title: "Officiers ops vol et flight dispatchers",
    publicCible: "Dispatchers, ops vol",
    duree: "1 jour / 8h",
    prixEur: 650,
    prixUsd: 700,
    category: "specialise",
    description:
      "Formation pour les officiers d'opérations aériennes qui préparent les vols transportant des marchandises dangereuses.",
    programme: [
      "Réglementation et variants opérateurs",
      "Préparation NOTOC",
      "Restrictions de routes et survols",
      "Coordination chargement / équipage",
      "Examen IATA",
    ],
    postes: [
      "Flight dispatchers",
      "Officiers d'opérations vol",
      "OCC controllers",
    ],
  },
  {
    slug: "dgr-7-9",
    code: "DGR 7.9",
    title: "Personnel navigant commercial (PNC)",
    publicCible: "Hôtesses et stewards",
    duree: "1 jour / 8h",
    prixEur: 650,
    prixUsd: 700,
    category: "specialise",
    description:
      "Formation IATA DGR pour le personnel de cabine : DG en bagages cabine, gestion d'incident batterie lithium, communication cockpit.",
    programme: [
      "DG autorisées en cabine et restrictions",
      "Incidents batteries lithium en cabine",
      "Procédures d'urgence et fire containment bag",
      "Communication équipage technique",
      "Examen IATA",
    ],
    postes: ["Personnel navigant commercial", "Chefs de cabine"],
  },
  {
    slug: "dgr-7-10",
    code: "DGR 7.10",
    title: "Personnel sécurité et screening",
    publicCible: "Agents sûreté, screeners",
    duree: "1 jour / 8h",
    prixEur: 650,
    prixUsd: 700,
    category: "specialise",
    description:
      "Formation des agents de sûreté qui inspectent fret et bagages et doivent identifier les marchandises dangereuses non déclarées.",
    programme: [
      "Identification visuelle et au scanner",
      "Étiquettes, marques, matières suspectes",
      "Procédures d'escalade et de saisie",
      "Coordination avec agents acceptation DG",
      "Examen IATA",
    ],
    postes: [
      "Agents de sûreté cargo",
      "Screeners bagages",
      "Superviseurs sûreté aéroportuaire",
    ],
  },
];

export const getFormationBySlug = (slug: string): Formation | undefined =>
  FORMATIONS.find((f) => f.slug === slug);

export const COUNTRIES = [
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
];

export const WHATSAPP_NUMBER = "+213770772619";
export const WHATSAPP_LINK = `https://wa.me/213770772619?text=${encodeURIComponent(
  "Bonjour, j'aimerais des informations sur vos formations CBTA"
)}`;
export const PHONE_DISPLAY = "+213 770 77 26 19";
