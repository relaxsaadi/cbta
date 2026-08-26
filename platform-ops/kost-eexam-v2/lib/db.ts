import { DatabaseSync, StatementSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

// `node:sqlite` renvoie des lignes en objets à PROTOTYPE NUL
// (`Object.create(null)`), pas de vrais littéraux `{}` — vérifié
// directement (`Object.getPrototypeOf(row) === null`). Next.js refuse de
// sérialiser un objet à prototype nul à travers la frontière Server→Client
// (composants client, closures de Server Actions capturées pour la
// progressive enhancement) : « Classes or null prototypes are not
// supported. » Bug réel rencontré en testant le parcours candidat (le
// bouton "Commencer l'examen" ne faisait plus rien — l'action serveur
// échouait silencieusement à la sérialisation). Correctif à la source,
// une seule fois ici, plutôt que de retoucher chaque site d'appel : chaque
// ligne renvoyée par `.get()`/`.all()` est copiée en objet littéral normal
// (`{...row}`, qui a toujours `Object.prototype`) avant de quitter la
// couche base de données.
const originalGet = StatementSync.prototype.get;
StatementSync.prototype.get = function (this: StatementSync, ...args: unknown[]) {
  const row = (originalGet as (...a: unknown[]) => unknown).apply(this, args);
  return row && typeof row === "object" ? { ...(row as object) } : row;
} as StatementSync["get"];

const originalAll = StatementSync.prototype.all;
StatementSync.prototype.all = function (this: StatementSync, ...args: unknown[]) {
  const rows = (originalAll as (...a: unknown[]) => unknown[]).apply(this, args);
  return rows.map((r) => (r && typeof r === "object" ? { ...(r as object) } : r));
} as StatementSync["all"];

// Pas de garde `import "server-only"` ICI (volontaire) : ce module est
// partagé entre le serveur Next.js et les scripts CLI (migrate/seed/backup/
// restore-test, exécutés via `tsx` en dehors du bundler Next — le paquet
// `server-only` lève une exception hors bundler, voir commit). La garde
// reste sur tous les modules `lib/*` de domaine (auth, companies, exams…)
// qui sont eux réellement à risque d'import client — `node:sqlite` lui-même
// est de toute façon inbundlable côté navigateur (module Node natif), donc
// la protection réelle contre une fuite client existe déjà structurellement.
// Connexion SQLite unique, fichier natif Node (`node:sqlite`, aucune
// compilation native — voir docs/KOST_EEXAM_V2_ARCHITECTURE.md §4 pour la
// justification de SQLite plutôt que Postgres/MySQL/Supabase). Mode WAL
// pour permettre des lectures concurrentes pendant une écriture, clés
// étrangères appliquées (jamais implicite en SQLite).
let db: DatabaseSync | null = null;

export function getDbPath(): string {
  const raw = process.env.DB_PATH ?? "./data/kost-eexam-v2.db";
  // turbopackIgnore : ce chemin dépend uniquement d'une variable
  // d'environnement (jamais d'une entrée utilisateur ni du contenu du
  // dossier), donc pas besoin que Turbopack trace tout le projet pour le
  // résoudre statiquement — même pattern que V1 (lib/system-health.ts).
  return resolve(/* turbopackIgnore: true */ process.cwd(), raw);
}

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = getDbPath();
  mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  return db;
}

const stmtCache = new WeakMap<DatabaseSync, Map<string, StatementSync>>();

/** Statement préparé, mis en cache par connexion — évite de re-parser le
 * même SQL à chaque appel dans un handler haute fréquence (heartbeat timer). */
export function prepared(sql: string): StatementSync {
  const conn = getDb();
  let cache = stmtCache.get(conn);
  if (!cache) {
    cache = new Map();
    stmtCache.set(conn, cache);
  }
  let stmt = cache.get(sql);
  if (!stmt) {
    stmt = conn.prepare(sql);
    cache.set(sql, stmt);
  }
  return stmt;
}

/** Transaction stricte : BEGIN IMMEDIATE prend le verrou d'écriture tout de
 * suite (pas en lecture différée) — nécessaire pour que la garantie
 * anti-double-tentative (§9) soit réellement atomique sous accès concurrent,
 * pas seulement protégée par la contrainte d'index (qui, seule, ferait
 * échouer le 2e appel APRÈS un travail partiel déjà fait). */
export function transaction<T>(fn: (conn: DatabaseSync) => T): T {
  const conn = getDb();
  conn.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(conn);
    conn.exec("COMMIT");
    return result;
  } catch (err) {
    try {
      conn.exec("ROLLBACK");
    } catch {
      // rollback peut échouer si la transaction a déjà été annulée par
      // SQLite lui-même (ex. contrainte violée) — sans risque, on ignore.
    }
    throw err;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Ferme la connexion — utilisé par les scripts CLI (migrate/seed/backup)
 * pour permettre au process de sortir proprement. Ne jamais appeler dans le
 * serveur Next.js lui-même (la connexion doit vivre pour tout le process). */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
