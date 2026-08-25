// Classification Production / Démo / Entraînement — dérivée UNIQUEMENT du
// nom réel du cours et/ou de l'examen Moodle (auto-déclaré par les
// personnes qui les ont créés : "Sample Exams (Demo)", "ANAC AUDIT DEMO",
// "Practice Test", etc.). Jamais une supposition ni une donnée inventée —
// si aucun marqueur textuel n'est trouvé, l'entrée est classée
// "production" par défaut (comportement le plus prudent : on ne masque
// jamais une vraie donnée de production en la faisant passer pour une démo).
//
// Utilisé pour que les KPI "Vue d'ensemble" / "Rapports" ne mélangent pas
// silencieusement des tentatives de démonstration ou d'entraînement avec
// de vraies tentatives d'examen réglementaire — voir le filtre "Périmètre
// des données" exposé sur ces pages.
export type DataScope = "production" | "demo" | "practice";

const PRACTICE_MARKERS = [/practice/i, /pratique/i, /entra[iî]nement/i];
const DEMO_MARKERS = [/\bdemo\b/i, /\bdémo\b/i, /anac audit/i, /fictif/i, /\(demo\)/i];

export function classifyScope(...names: (string | null | undefined)[]): DataScope {
  const joined = names.filter(Boolean).join(" ");
  if (PRACTICE_MARKERS.some((r) => r.test(joined))) return "practice";
  if (DEMO_MARKERS.some((r) => r.test(joined))) return "demo";
  return "production";
}

export const SCOPE_LABELS: Record<DataScope, string> = {
  production: "Production",
  demo: "Démo",
  practice: "Entraînement",
};

export const SCOPE_BADGE: Record<DataScope, "verified" | "warning" | "neutral"> = {
  production: "verified",
  demo: "warning",
  practice: "neutral",
};

// Filtre par défaut des vues "exploitation" (KPI Vue d'ensemble, Rapports) :
// données de production uniquement. L'utilisateur peut explicitement
// choisir d'inclure démos/entraînements via le filtre de périmètre —
// aucune donnée réelle n'est jamais supprimée, seulement masquée par défaut
// de l'agrégat destiné au pilotage.
export const DEFAULT_SCOPE_FILTER: DataScope[] = ["production"];
export const ALL_SCOPES: DataScope[] = ["production", "demo", "practice"];

export function parseScopeParam(value: string | undefined): DataScope[] {
  if (value === "all") return ALL_SCOPES;
  if (value === "production") return ["production"];
  return DEFAULT_SCOPE_FILTER;
}
