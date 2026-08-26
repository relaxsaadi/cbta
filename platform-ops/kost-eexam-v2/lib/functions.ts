import { getDb } from "./db";

export interface FunctionRow {
  code: string;
  label: string;
}

export function listFunctions(): FunctionRow[] {
  return getDb().prepare(`SELECT * FROM functions ORDER BY code`).all() as unknown as FunctionRow[];
}
