// Configuration ESLint flat manquante depuis la création du projet (jamais
// committée — vérifié via l'historique git, aucune trace). eslint-config-next
// était déjà une dépendance installée (package.json) sans jamais être
// branchée. Trouvé en exécutant `pnpm lint` pendant la mission "ADMIN/
// CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30, §48 — full regression).
//
// eslint-config-next@16 exporte déjà un flat config natif (voir
// node_modules/eslint-config-next/dist/index.js) — passer par
// @eslint/eslintrc::FlatCompat (approche historiquement documentée pour
// ESLint 8) produit ici une erreur réelle ("Converting circular structure
// to JSON", incompatibilité de version entre eslint@9.39 et la chaîne de
// résolution de plugins de FlatCompat) — jamais nécessaire avec cette
// version du preset, donc jamais utilisé ici.
import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**", "data/**", "docs/**"],
  },
];

export default eslintConfig;
