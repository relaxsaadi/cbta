import "server-only";
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/**
 * Connexion MySQL READ-WRITE — mais structurellement limitée : le compte
 * `kost_console_rw` ne détient GRANT SELECT/INSERT/UPDATE QUE sur les 3
 * tables propres à la console (kost_console_incidents,
 * kost_console_incident_events, kost_console_feedback). Il n'a aucun accès
 * à une seule table `mdl_*` — vérifié via `SHOW GRANTS` côté serveur, pas
 * seulement une convention côté code. La console ne peut donc PAS écrire
 * dans Moodle, même par erreur de requête.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_RW_HOST,
      port: Number(process.env.MYSQL_RW_PORT ?? 3306),
      user: process.env.MYSQL_RW_USER,
      password: process.env.MYSQL_RW_PASSWORD,
      database: process.env.MYSQL_RW_DATABASE ?? "moodle",
      ssl: undefined,
      connectionLimit: 5,
    });
  }
  return pool;
}

export async function queryReadWrite<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export async function execReadWrite(
  sql: string,
  params: unknown[] = []
): Promise<{ insertId: number; affectedRows: number }> {
  const [result] = await getPool().query(sql, params);
  const r = result as mysql.ResultSetHeader;
  return { insertId: r.insertId, affectedRows: r.affectedRows };
}
