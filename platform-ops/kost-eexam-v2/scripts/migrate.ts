// Applique lib/schema.sql puis insère les données de référence (rôles,
// fonctions DGR 7.1-7.10) de façon idempotente. Exécuté en dev via
// `pnpm migrate`, et au démarrage du conteneur en production (§28 : aucune
// migration destructive — ce script ne fait jamais de DROP).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, closeDb } from "../lib/db";

const ROLES: Array<{ code: string; label: string }> = [
  { code: "candidate", label: "Candidat" },
  { code: "pedagogical_manager", label: "Responsable pédagogique" },
  { code: "administrator", label: "Administrateur" },
  { code: "auditor", label: "Auditeur" },
];

const FUNCTIONS: Array<{ code: string; label: string }> = Array.from({ length: 10 }, (_, i) => ({
  code: `7.${i + 1}`,
  label: `Fonction 7.${i + 1}`,
}));

function main() {
  const db = getDb();
  const schema = readFileSync(resolve(import.meta.dirname, "../lib/schema.sql"), "utf-8");
  db.exec(schema);
  console.log("Schéma appliqué.");

  const upsertRole = db.prepare(
    "INSERT INTO roles (code, label) VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET label = excluded.label"
  );
  for (const r of ROLES) upsertRole.run(r.code, r.label);
  console.log(`${ROLES.length} rôles à jour.`);

  const upsertFn = db.prepare(
    "INSERT INTO functions (code, label) VALUES (?, ?) ON CONFLICT(code) DO UPDATE SET label = excluded.label"
  );
  for (const f of FUNCTIONS) upsertFn.run(f.code, f.label);
  console.log(`${FUNCTIONS.length} fonctions DGR à jour.`);

  closeDb();
  console.log("Migration terminée.");
}

main();
