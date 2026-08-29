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
  { table: "users", column: "mfa_secret", ddl: "ALTER TABLE users ADD COLUMN mfa_secret TEXT" },
  { table: "users", column: "mfa_recovery_codes_json", ddl: "ALTER TABLE users ADD COLUMN mfa_recovery_codes_json TEXT" },
  // Mission "COMPLETE USER MANAGEMENT" (2026-08-29).
  { table: "users", column: "candidate_type", ddl: "ALTER TABLE users ADD COLUMN candidate_type TEXT" },
  { table: "users", column: "archived_at", ddl: "ALTER TABLE users ADD COLUMN archived_at TEXT" },
  // Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §56 — traçabilité
  // de la correction manuelle (qui, quel commentaire) ; jamais posées par
  // gradeAttempt() (notation automatique), uniquement par submitManualGrade().
  { table: "attempt_answers", column: "graded_by", ddl: "ALTER TABLE attempt_answers ADD COLUMN graded_by INTEGER REFERENCES users(id)" },
  { table: "attempt_answers", column: "grader_comment", ddl: "ALTER TABLE attempt_answers ADD COLUMN grader_comment TEXT" },
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
    // Colonnes EXPLICITES des deux côtés (jamais SELECT * positionnel) —
    // voir le commentaire au-dessus de migrateUsersStatusCheckConstraint
    // pour l'incident réel qui a révélé ce piège : ALTER TABLE ADD COLUMN
    // ajoute toujours en FIN de table, un ordre physique qui peut donc
    // diverger de l'ordre logique déclaré dans un CREATE TABLE _new, même
    // quand les deux tables ont exactement les mêmes noms de colonnes.
    db.exec(`
      INSERT INTO incident_actions_new (id, incident_id, action_type, target_type, target_id, actor_user_id, detail, created_at)
      SELECT id, incident_id, action_type, target_type, target_id, actor_user_id, detail, created_at FROM incident_actions;
    `);
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

// Même procédure que migrateIncidentActionsCheckConstraint ci-dessus,
// pour users.status (mission email §8-9 : nouvelle valeur
// 'pending_activation' — compte créé sans mot de passe communiqué, en
// attente du flux d'activation sécurisé par jeton).
function migrateUsersStatusCheckConstraint(db: ReturnType<typeof getDb>) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'`).get() as { sql: string } | undefined;
  // Correspondance sur la valeur d'énumération EXACTE avec guillemets —
  // même discipline défensive que migrateUsersArchivedStatus() ci-dessous,
  // après le faux positif réel trouvé sur "archived"/"archived_at" (aucune
  // collision connue ici aujourd'hui, mais le même principe s'applique si
  // une future colonne contenait "pending_activation" dans son nom).
  if (!row || row.sql.includes("'pending_activation'")) return;

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation','active','suspended')),
        mfa_enabled INTEGER NOT NULL DEFAULT 0,
        mfa_secret TEXT,
        mfa_recovery_codes_json TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        last_login_at TEXT
      );
    `);
    // Colonnes EXPLICITES des deux côtés, JAMAIS "SELECT * FROM users" —
    // bug réel trouvé en déployant cette migration sur staging (2026-08-29) :
    // la vraie table users a mfa_secret/mfa_recovery_codes_json ajoutées
    // via ALTER TABLE ADD COLUMN (donc physiquement APRÈS last_login_at,
    // ordre historique d'une mission antérieure), alors que users_new
    // ci-dessus les déclare entre mfa_enabled et created_at (ordre
    // "logique" identique à lib/schema.sql). Un INSERT positionnel décalait
    // donc chaque colonne d'un cran à partir de mfa_secret — la valeur
    // de mfa_secret (souvent NULL, MFA non activée) atterrissait dans
    // users_new.created_at (NOT NULL) et cassait la contrainte pour tout
    // utilisateur sans MFA. Rejoué et vérifié après correction : succès
    // réel sur staging, zéro perte de données (voir docs/
    // KOST_EEXAM_V2_RESEND_OPERATIONS.md pour le compte-rendu complet).
    db.exec(`
      INSERT INTO users_new (id, email, username, password_hash, full_name, phone, status, mfa_enabled, mfa_secret, mfa_recovery_codes_json, created_at, last_login_at)
      SELECT id, email, username, password_hash, full_name, phone, status, mfa_enabled, mfa_secret, mfa_recovery_codes_json, created_at, last_login_at FROM users;
    `);
    db.exec(`DROP TABLE users;`);
    db.exec(`ALTER TABLE users_new RENAME TO users;`);
    db.exec("COMMIT");
    console.log("Contrainte users.status élargie (pending_activation).");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

// Deuxième élargissement de la même contrainte (mission "COMPLETE USER
// MANAGEMENT", 2026-08-29) — ajoute 'archived'. Fonction SÉPARÉE plutôt
// que de modifier migrateUsersStatusCheckConstraint ci-dessus : cette
// dernière est gardée par `row.sql.includes("pending_activation")`, qui
// est déjà vrai sur staging (déjà migrée) — elle ne se redéclencherait
// jamais pour ajouter 'archived'. Garde dédiée sur "archived" à la place.
// Doit tourner APRÈS applyAdditiveColumns() (candidate_type/archived_at
// doivent déjà exister) — voir l'ordre dans main() plus bas. Colonnes
// explicites des deux côtés, même discipline que ci-dessus (jamais
// SELECT *, voir le commentaire long ci-dessus pour l'incident réel qui a
// établi cette règle).
function migrateUsersArchivedStatus(db: ReturnType<typeof getDb>) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'`).get() as { sql: string } | undefined;
  // Bug réel trouvé en testant CETTE migration localement avant tout
  // déploiement (2026-08-29) : un simple .includes("archived") remonte un
  // FAUX POSITIF dès qu'applyAdditiveColumns() a ajouté la colonne
  // `archived_at` — son NOM contient la sous-chaîne "archived", donc la
  // garde croyait la contrainte déjà élargie et sautait la reconstruction
  // entière, silencieusement (confirmé : un INSERT avec status='archived'
  // échouait ensuite sur l'ANCIENNE contrainte). Correction : chercher la
  // valeur d'énumération EXACTE telle qu'elle apparaît dans la clause
  // CHECK ('archived', avec les deux guillemets), qui ne correspond
  // jamais au nom d'une colonne.
  if (!row || row.sql.includes("'archived'")) return;

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_activation','active','suspended','archived')),
        mfa_enabled INTEGER NOT NULL DEFAULT 0,
        mfa_secret TEXT,
        mfa_recovery_codes_json TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        last_login_at TEXT,
        candidate_type TEXT,
        archived_at TEXT
      );
    `);
    db.exec(`
      INSERT INTO users_new (id, email, username, password_hash, full_name, phone, status, mfa_enabled, mfa_secret, mfa_recovery_codes_json, created_at, last_login_at, candidate_type, archived_at)
      SELECT id, email, username, password_hash, full_name, phone, status, mfa_enabled, mfa_secret, mfa_recovery_codes_json, created_at, last_login_at, candidate_type, archived_at FROM users;
    `);
    db.exec(`DROP TABLE users;`);
    db.exec(`ALTER TABLE users_new RENAME TO users;`);
    db.exec("COMMIT");
    console.log("Contrainte users.status élargie (archived).");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §41-50 — élargit
// questions.qtype pour accepter 'numeric'/'short_answer'. Garde sur la
// valeur d'énumération EXACTE entre guillemets (même discipline que
// migrateUsersArchivedStatus ci-dessus, après le faux positif réel trouvé
// sur "archived"/"archived_at" cette même session).
function migrateQuestionsQtypeCheckConstraint(db: ReturnType<typeof getDb>) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'questions'`).get() as { sql: string } | undefined;
  if (!row || row.sql.includes("'numeric'")) return;

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE questions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kost_question_id TEXT NOT NULL UNIQUE,
        function_code TEXT NOT NULL REFERENCES functions(code),
        subtask TEXT,
        qtype TEXT NOT NULL DEFAULT 'mcq_single' CHECK (qtype IN ('mcq_single','mcq_multi','true_false','numeric','short_answer')),
        language TEXT NOT NULL DEFAULT 'fr',
        source_status TEXT NOT NULL DEFAULT 'NOT_ATTEMPTED' CHECK (source_status IN
          ('FROZEN_SOURCE_VERIFIED','DRAFT','PARTIAL','STALE','SOURCE_GAP','SOURCE_CONFLICT','NOT_ATTEMPTED')),
        regulatory_reference TEXT,
        reviewer_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (reviewer_status IN ('PENDING','APPROVED','REJECTED')),
        review_date TEXT,
        verification_date TEXT,
        current_version_id INTEGER,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        created_by INTEGER REFERENCES users(id),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );
    `);
    // Colonnes explicites des deux côtés — jamais SELECT * (voir l'incident
    // réel documenté au-dessus de migrateUsersStatusCheckConstraint).
    db.exec(`
      INSERT INTO questions_new (id, kost_question_id, function_code, subtask, qtype, language, source_status, regulatory_reference, reviewer_status, review_date, verification_date, current_version_id, active, created_at, created_by, updated_at)
      SELECT id, kost_question_id, function_code, subtask, qtype, language, source_status, regulatory_reference, reviewer_status, review_date, verification_date, current_version_id, active, created_at, created_by, updated_at FROM questions;
    `);
    db.exec(`DROP TABLE questions;`);
    db.exec(`ALTER TABLE questions_new RENAME TO questions;`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_questions_function ON questions(function_code);`);
    db.exec("COMMIT");
    console.log("Contrainte questions.qtype élargie (numeric, short_answer) — les 244 questions existantes sont réinsérées à l'identique, aucune valeur modifiée.");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

// Mission "COMPLETE CANDIDATE EXAM LIFECYCLE" (2026-08-29) §26-30/§55-57 —
// results.passed devient NULLABLE (résultat réellement inconnu tant qu'une
// correction manuelle est en attente, jamais un booléen fabriqué) +
// nouvelle colonne grading_state. SQLite n'a pas d'ALTER TABLE pour
// assouplir une contrainte NOT NULL — même procédure de reconstruction.
function migrateResultsGradingState(db: ReturnType<typeof getDb>) {
  const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'results'`).get() as { sql: string } | undefined;
  if (!row || row.sql.includes("grading_state")) return;

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE results_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL UNIQUE REFERENCES attempts(id) ON DELETE CASCADE,
        raw_score REAL NOT NULL,
        max_raw_score REAL NOT NULL,
        score_100 REAL NOT NULL,
        percentage REAL NOT NULL,
        pass_threshold_pct INTEGER NOT NULL,
        passed INTEGER,
        grading_state TEXT NOT NULL DEFAULT 'COMPLETE' CHECK (grading_state IN ('COMPLETE','AWAITING_MANUAL_REVIEW')),
        graded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        locked INTEGER NOT NULL DEFAULT 0
      );
    `);
    // Toutes les lignes existantes ont forcément été notées entièrement
    // automatiquement (aucune question à correction manuelle n'existait
    // avant cette mission) — grading_state='COMPLETE' (défaut) et passed
    // conserve sa vraie valeur 0/1 existante, jamais réécrite.
    db.exec(`
      INSERT INTO results_new (id, attempt_id, raw_score, max_raw_score, score_100, percentage, pass_threshold_pct, passed, grading_state, graded_at, locked)
      SELECT id, attempt_id, raw_score, max_raw_score, score_100, percentage, pass_threshold_pct, passed, 'COMPLETE', graded_at, locked FROM results;
    `);
    db.exec(`DROP TABLE results;`);
    db.exec(`ALTER TABLE results_new RENAME TO results;`);
    db.exec("COMMIT");
    console.log("Table results reconstruite (passed nullable + grading_state) — résultats existants préservés à l'identique.");
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
  migrateUsersStatusCheckConstraint(db);
  migrateUsersArchivedStatus(db); // doit tourner APRÈS applyAdditiveColumns (candidate_type/archived_at)
  migrateQuestionsQtypeCheckConstraint(db);
  migrateResultsGradingState(db);

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
