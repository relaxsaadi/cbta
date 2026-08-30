import { getDb } from "./db";
import type { Scope } from "./scope";

export type ClientType = "entreprise" | "particulier";

export interface CompanyRow {
  id: number;
  name: string;
  scope: Scope;
  /** Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §1-4 —
   * 'particulier' marque une entreprise "plomberie" auto-provisionnée par
   * provisionParticulierAccess() (lib/user-affiliation.ts) pour qu'un
   * candidat Particulier reste éligible à un examen (assessments.group_id
   * est NOT NULL) — jamais montrée comme un vrai client. listCompanies()/
   * listCompaniesForManager() l'excluent par défaut (voir includeParticulierPlumbing). */
  client_type: ClientType;
  created_at: string;
  created_by: number | null;
}

export function listCompanies(scopes?: Scope[], includeParticulierPlumbing = false): CompanyRow[] {
  const db = getDb();
  const clauses: string[] = [];
  const args: string[] = [];
  // COALESCE, jamais un simple != : en SQL, NULL != 'particulier' vaut NULL
  // (donc exclu), ce qui masquerait à tort toute ligne pas encore
  // rattrapée par backfillCompanyClientType (scripts/migrate.ts) — jamais
  // souhaitable, une entreprise réelle ne doit jamais disparaître d'une
  // liste à cause d'un backfill pas encore joué.
  if (!includeParticulierPlumbing) clauses.push(`COALESCE(client_type, 'entreprise') != 'particulier'`);
  if (scopes && scopes.length > 0) {
    clauses.push(`scope IN (${scopes.map(() => "?").join(",")})`);
    args.push(...scopes);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db.prepare(`SELECT * FROM companies ${where} ORDER BY name`).all(...args) as unknown as CompanyRow[];
}

export function getCompany(id: number): CompanyRow | undefined {
  return getDb().prepare(`SELECT * FROM companies WHERE id = ?`).get(id) as CompanyRow | undefined;
}

/** Frontière multi-client (voir lib/tenant-scope.ts) — les seules
 * entreprises qu'un responsable pédagogique doit pouvoir seulement
 * LISTER : celles qu'il a créées, ou où il gère au moins un groupe. */
export function listCompaniesForManager(userId: number, includeParticulierPlumbing = false): CompanyRow[] {
  return getDb()
    .prepare(
      `SELECT DISTINCT c.* FROM companies c
       WHERE (c.created_by = ?
          OR EXISTS (SELECT 1 FROM groups g WHERE g.company_id = c.id AND g.pedagogical_manager_id = ?))
         ${includeParticulierPlumbing ? "" : "AND COALESCE(c.client_type, 'entreprise') != 'particulier'"}
       ORDER BY c.name`
    )
    .all(userId, userId) as unknown as CompanyRow[];
}

export function createCompany(params: { name: string; scope: Scope; createdBy: number; clientType?: ClientType }): number {
  const result = getDb()
    .prepare(`INSERT INTO companies (name, scope, created_by, client_type) VALUES (?, ?, ?, ?)`)
    .run(params.name, params.scope, params.createdBy, params.clientType ?? "entreprise");
  return Number(result.lastInsertRowid);
}

export function companyGroupCount(companyId: number): number {
  const row = getDb().prepare(`SELECT COUNT(*) AS n FROM groups WHERE company_id = ?`).get(companyId) as { n: number };
  return row.n;
}
