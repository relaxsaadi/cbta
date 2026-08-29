import { randomBytes } from "node:crypto";
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
  status: "pending_activation" | "active" | "suspended";
  mfa_enabled: number;
  mfa_secret: string | null;
  mfa_recovery_codes_json: string | null;
  created_at: string;
  last_login_at: string | null;
}

export function findUserByUsername(username: string): UserRow | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE username = ?`).get(username) as UserRow | undefined;
}

export function findUserById(id: number): UserRow | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
}

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email) as UserRow | undefined;
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

export function setUserStatus(userId: number, status: "pending_activation" | "active" | "suspended"): void {
  getDb().prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status, userId);
}

/** Flux sécurisé (mission email §8-9) — CRITIQUE : jamais de mot de passe
 * communiqué. `password_hash` reçoit le hash d'une valeur aléatoire de 32
 * octets que PERSONNE ne connaît (ni l'admin qui crée le compte, ni ce
 * process au-delà de cet appel — jamais retournée, jamais loggée) ; la
 * connexion est structurellement impossible tant que status reste
 * 'pending_activation' (voir lib/auth.ts). Le candidat n'obtient un VRAI
 * mot de passe qu'en complétant lui-même le flux d'activation par jeton
 * (lib/activation-tokens.ts + app/activer/actions.ts), qui appelle
 * setPasswordAndActivate() ci-dessous. */
export function createUserPendingActivation(params: { username: string; fullName: string; role: ConsoleRole; email?: string; phone?: string }): number {
  const db = getDb();
  const unusablePassword = randomBytes(32).toString("hex");
  const result = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, email, phone, status) VALUES (?, ?, ?, ?, ?, 'pending_activation')`)
    .run(params.username, hashPassword(unusablePassword), params.fullName, params.email ?? null, params.phone ?? null);
  const userId = Number(result.lastInsertRowid);
  const role = db.prepare(`SELECT id FROM roles WHERE code = ?`).get(params.role) as { id: number } | undefined;
  if (!role) throw new Error(`Rôle inconnu : ${params.role}`);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, role.id);
  return userId;
}

/** Appelée UNIQUEMENT par le flux d'activation/réinitialisation par jeton
 * (jamais directement par un admin — voir lib/activation-tokens.ts). Fait
 * passer le compte à 'active' dans le même mouvement que l'écriture du
 * mot de passe choisi par le candidat lui-même. */
export function setPasswordAndActivate(userId: number, plainPassword: string): void {
  getDb().prepare(`UPDATE users SET password_hash = ?, status = 'active' WHERE id = ?`).run(hashPassword(plainPassword), userId);
}

/** Réinitialisation (compte déjà actif) — n'altère jamais status. */
export function setPassword(userId: number, plainPassword: string): void {
  getDb().prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hashPassword(plainPassword), userId);
}

/** Mission "PRODUCTION READINESS" §3 — édition de fiche candidat. Le
 * `username` (identifiant de connexion, référencé partout — audit_logs,
 * sessions, attempts) reste volontairement IMMUABLE ici : un changement
 * casserait la continuité de traçabilité sans bénéfice réel (le nom
 * affiché, lui, est éditable). Pas de UPDATE sur password_hash — la
 * réinitialisation de mot de passe reste une action dédiée séparée. */
export function updateUserProfile(userId: number, params: { fullName: string; email?: string; phone?: string }): void {
  getDb()
    .prepare(`UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?`)
    .run(params.fullName, params.email ?? null, params.phone ?? null, userId);
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
