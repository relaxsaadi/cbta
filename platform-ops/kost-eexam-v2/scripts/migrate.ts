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

// `CREATE TABLE IF NOT EXISTS` (lib/schema.sql) n'ajoute jamais une
// colonne à une table DÉJÀ existante — nécessaire sur staging/production
// où la table `incidents` porte déjà des lignes réelles. `ALTER TABLE ...
// ADD COLUMN` n'a pas de variante idempotente native en SQLite ; on
// vérifie donc via PRAGMA table_info avant d'exécuter, pour que ce script
// reste rejouable sans erreur sur une base déjà migrée (même garantie
// d'idempotence que le reste de ce fichier — §28, aucune migration
// destructive).
const ADDITIVE_COLUMNS: Array<{ table: string; column: string; ddl: string }> = [
  { table: "incidents", column: "group_id", ddl: "ALTER TABLE incidents ADD COLUMN group_id INTEGER REFERENCES groups(id)" },
  {
    table: "assessment_question_snapshots",
    column: "explanation_snapshot",
    ddl: "ALTER TABLE assessment_question_snapshots ADD COLUMN explanation_snapshot TEXT",
  },
];

function applyAdditiveColumns(db: ReturnType<typeof getDb>) {
  for (const { table, column, ddl } of ADDITIVE_COLUMNS) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (cols.some((c) => c.name === column)) continue;
    db.exec(ddl);
    console.log(`Colonne ajoutée : ${table}.${column}`);
  }
}

// Contrairement à ADDITIVE_COLUMNS (ajout de colonne), le CHECK sur
// incident_actions.action_type (addendum §9-11 : 6 nouvelles valeurs pour
// le mode maintenance / blocage connexions / blocage nouvelles tentatives)
// est figé dans la DDL de création — SQLite n'a pas d'ALTER TABLE pour
// modifier un CHECK. Reconstruction de table (procédure officielle
// SQLite), gardée par une lecture de sqlite_master.sql pour rester
// idempotente et rejouable sans erreur sur une base déjà migrée.
function migrateIncidentActionsCheckConstraint(db: ReturnType<typeof getDb>) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'incident_actions'`).get() as { sql: string } | undefined;
  if (!row || row.sql.includes("enable_maintenance_mode")) return; // déjà à jour (ou table pas encore créée — schema.sql vient de la créer avec le nouveau CHECK)

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE incident_actions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL CHECK (action_type IN
          ('suspend_account','reactivate_account','force_logout','revoke_sessions',
           'suspend_assessment','reopen_assessment','attach_evidence','note','corrective_measure','close',
           'enable_maintenance_mode','disable_maintenance_mode',
           'block_new_logins','unblock_new_logins',
           'block_new_attempts','unblock_new_attempts')),
        target_type TEXT,
        target_id INTEGER,
        actor_user_id INTEGER REFERENCES users(id),
        detail TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);
    db.exec(`INSERT INTO incident_actions_new SELECT * FROM incident_actions;`);
    db.exec(`DROP TABLE incident_actions;`);
    db.exec(`ALTER TABLE incident_actions_new RENAME TO incident_actions;`);
    db.exec("COMMIT");
    console.log("Contrainte incident_actions.action_type élargie (mode maintenance / blocages).");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

function main() {
  const db = getDb();
  const schema = readFileSync(resolve(import.meta.dirname, "../lib/schema.sql"), "utf-8");
  db.exec(schema);
  console.log("Schéma appliqué.");

  applyAdditiveColumns(db);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_incidents_group ON incidents(group_id)`);
  migrateIncidentActionsCheckConstraint(db);

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
