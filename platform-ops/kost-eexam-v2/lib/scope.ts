// Scope explicite Production/Démo/Test — colonne réelle en base sur chaque
// table qui en a besoin (companies, groups, assessments), pas dérivé d'un
// nom par regex comme en V1 (§30 de la mission : « chaque objet démo doit
// porter un scope explicite »). Aucune dépendance server-only : ce module
// est importé aussi bien par des Server Components que par des composants
// client pour l'affichage des badges.
export type Scope = "production" | "demo" | "test";

export const SCOPE_LABELS: Record<Scope, string> = {
  production: "Production",
  demo: "Démo",
  test: "Test",
};

export const SCOPE_BADGE: Record<Scope, "verified" | "warning" | "neutral"> = {
  production: "verified",
  demo: "warning",
  test: "neutral",
};

export const ALL_SCOPES: Scope[] = ["production", "demo", "test"];
export const DEFAULT_SCOPE_FILTER: Scope[] = ["production"];

export function parseScopeParam(value: string | undefined): Scope[] {
  if (value === "all") return ALL_SCOPES;
  if (value === "production") return ["production"];
  if (value === "demo" || value === "test") return [value];
  return DEFAULT_SCOPE_FILTER;
}
