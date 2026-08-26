import { getDb, nowIso } from "./db";
import { hashPassword } from "./passwords";
import type { ConsoleRole } from "./session";

export interface UserRow {
  id: number;
  email: string | null;
  username: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  status: "active" | "suspended";
  mfa_enabled: number;
  created_at: string;
  last_login_at: string | null;
}

export function findUserByUsername(username: string): UserRow | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE username = ?`).get(username) as UserRow | undefined;
}

export function findUserById(id: number): UserRow | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
}

export function getRoleForUser(userId: number): ConsoleRole | null {
  const row = getDb()
    .prepare(`SELECT r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? LIMIT 1`)
    .get(userId) as { code: ConsoleRole } | undefined;
  return row?.code ?? null;
}

export function createUser(params: {
  username: string;
  password: string;
  fullName: string;
  role: ConsoleRole;
  email?: string;
  phone?: string;
}): number {
  const db = getDb();
  const result = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, email, phone) VALUES (?, ?, ?, ?, ?)`)
    .run(params.username, hashPassword(params.password), params.fullName, params.email ?? null, params.phone ?? null);
  const userId = Number(result.lastInsertRowid);
  const role = db.prepare(`SELECT id FROM roles WHERE code = ?`).get(params.role) as { id: number } | undefined;
  if (!role) throw new Error(`Rôle inconnu : ${params.role}`);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, role.id);
  return userId;
}

export function setUserStatus(userId: number, status: "active" | "suspended"): void {
  getDb().prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status, userId);
}

export function touchLastLogin(userId: number): void {
  getDb().prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).run(nowIso(), userId);
}

export function listUsersByRole(role: ConsoleRole): UserRow[] {
  return getDb()
    .prepare(
      `SELECT u.* FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id AND r.code = ?
       ORDER BY u.full_name`
    )
    .all(role) as unknown as UserRow[];
}
