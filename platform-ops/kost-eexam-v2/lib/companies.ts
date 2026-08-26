import { getDb } from "./db";
import type { Scope } from "./scope";

export interface CompanyRow {
  id: number;
  name: string;
  scope: Scope;
  created_at: string;
  created_by: number | null;
}

export function listCompanies(scopes?: Scope[]): CompanyRow[] {
  const db = getDb();
  if (!scopes || scopes.length === 0) {
    return db.prepare(`SELECT * FROM companies ORDER BY name`).all() as unknown as CompanyRow[];
  }
  const placeholders = scopes.map(() => "?").join(",");
  return db
    .prepare(`SELECT * FROM companies WHERE scope IN (${placeholders}) ORDER BY name`)
    .all(...scopes) as unknown as CompanyRow[];
}

export function getCompany(id: number): CompanyRow | undefined {
  return getDb().prepare(`SELECT * FROM companies WHERE id = ?`).get(id) as CompanyRow | undefined;
}

export function createCompany(params: { name: string; scope: Scope; createdBy: number }): number {
  const result = getDb()
    .prepare(`INSERT INTO companies (name, scope, created_by) VALUES (?, ?, ?)`)
    .run(params.name, params.scope, params.createdBy);
  return Number(result.lastInsertRowid);
}

export function companyGroupCount(companyId: number): number {
  const row = getDb().prepare(`SELECT COUNT(*) AS n FROM groups WHERE company_id = ?`).get(companyId) as { n: number };
  return row.n;
}
