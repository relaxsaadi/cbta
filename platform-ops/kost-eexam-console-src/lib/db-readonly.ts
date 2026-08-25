import "server-only";
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/**
 * Connexion MySQL READ-ONLY (compte kost_console_ro, SELECT uniquement,
 * restreint au réseau Docker interne). Utilisée uniquement pour les
 * données non exposées par les Web Services Moodle (taille de la banque de
 * questions, taux de réussite agrégé, etc. — voir proposition Phase 1 §5).
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_RO_HOST,
      port: Number(process.env.MYSQL_RO_PORT ?? 3306),
      user: process.env.MYSQL_RO_USER,
      password: process.env.MYSQL_RO_PASSWORD,
      database: process.env.MYSQL_RO_DATABASE ?? "moodle",
      ssl: undefined,
      connectionLimit: 5,
    });
  }
  return pool;
}

export async function queryReadOnly<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}
