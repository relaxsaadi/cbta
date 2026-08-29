import { randomBytes } from "node:crypto";
import { getDb, nowIso } from "./db";
import { hashPassword } from "./passwords";
import { hasCompletedActivation } from "./activation-tokens";
import type { ConsoleRole } from "./session";

export type UserStatus = "pending_activation" | "active" | "suspended" | "archived";
export type CandidateType = "particulier" | "entreprise";

export interface UserRow {
  id: number;
  email: string | null;
  username: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  status: UserStatus;
  mfa_enabled: number;
  mfa_secret: string | null;
  mfa_recovery_codes_json: string | null;
  created_at: string;
  last_login_at: string | null;
  candidate_type: CandidateType | null;
  archived_at: string | null;
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
  candidateType?: CandidateType;
}): number {
  const db = getDb();
  const result = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, email, phone, candidate_type) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(params.username, hashPassword(params.password), params.fullName, params.email ?? null, params.phone ?? null, params.candidateType ?? null);
  const userId = Number(result.lastInsertRowid);
  const role = db.prepare(`SELECT id FROM roles WHERE code = ?`).get(params.role) as { id: number } | undefined;
  if (!role) throw new Error(`Rôle inconnu : ${params.role}`);
  db.prepare(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`).run(userId, role.id);
  return userId;
}

export function setUserStatus(userId: number, status: UserStatus): void {
  getDb().prepare(`UPDATE users SET status = ? WHERE id = ?`).run(status, userId);
}

/** Réactivation SÛRE d'un compte suspendu (mission "FIX ACCOUNT
 * LIFECYCLE GUARDS", 2026-08-29) — remplace tout appel direct à
 * `setUserStatus(id, "active")` depuis une action de réactivation. Ne
 * bascule JAMAIS vers 'active' un compte qui n'a jamais complété le flux
 * d'activation légitime (voir hasCompletedActivation()) — le restaure
 * plutôt vers 'pending_activation', l'état sûr qui exige toujours que le
 * candidat crée lui-même son mot de passe. Retourne l'état restauré pour
 * que l'appelant sache quelle notification (le cas échéant) envoyer.
 * N'écrit rien si le compte n'est pas actuellement 'suspended' — une
 * réactivation n'a de sens que depuis cet état, jamais un no-op déguisé
 * en changement réel. */
export function reactivateUserSafely(userId: number): { changed: boolean; newStatus: "active" | "pending_activation" | null } {
  const user = findUserById(userId);
  if (!user || user.status !== "suspended") return { changed: false, newStatus: null };
  const newStatus = hasCompletedActivation(userId) ? "active" : "pending_activation";
  setUserStatus(userId, newStatus);
  return { changed: true, newStatus };
}

export type ActivationDenialReason = "suspended" | "already_active" | "archived";

/** Détermine si un compte à CE statut peut légitimement compléter le
 * flux d'activation par jeton (mission "FIX ACCOUNT LIFECYCLE GUARDS",
 * 2026-08-29 — bug réel : un jeton valide/non consommé l'emportait
 * jusqu'ici sur une suspension administrative explicite intervenue après
 * l'envoi de l'invitation). Seul 'pending_activation' est activable —
 * jamais 'suspended' (une décision administrative explicite ne doit
 * jamais pouvoir être contournée par un simple lien encore valide),
 * jamais 'active' (déjà fait, éviter de retraiter), et jamais 'archived'
 * (mission "COMPLETE USER MANAGEMENT", 2026-08-29 — même bug de classe :
 * un compte pending_activation archivé AVANT d'avoir jamais été activé
 * conserverait un jeton account_setup valide ; sans ce cas explicite, ce
 * jeton contournerait silencieusement l'archivage et ferait passer le
 * compte à 'active'). Fonction pure, testable indépendamment de
 * app/activer/actions.ts (qui porte les messages FR exacts affichés au
 * candidat). */
export function activationDenialReason(status: UserRow["status"]): ActivationDenialReason | null {
  if (status === "suspended") return "suspended";
  if (status === "active") return "already_active";
  if (status === "archived") return "archived";
  return null;
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
export function createUserPendingActivation(params: {
  username: string;
  fullName: string;
  role: ConsoleRole;
  email?: string;
  phone?: string;
  candidateType?: CandidateType;
}): number {
  const db = getDb();
  const unusablePassword = randomBytes(32).toString("hex");
  const result = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, email, phone, status, candidate_type) VALUES (?, ?, ?, ?, ?, 'pending_activation', ?)`)
    .run(params.username, hashPassword(unusablePassword), params.fullName, params.email ?? null, params.phone ?? null, params.candidateType ?? null);
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
export function updateUserProfile(userId: number, params: { fullName: string; email?: string; phone?: string; candidateType?: CandidateType | null }): void {
  if (params.candidateType !== undefined) {
    getDb()
      .prepare(`UPDATE users SET full_name = ?, email = ?, phone = ?, candidate_type = ? WHERE id = ?`)
      .run(params.fullName, params.email ?? null, params.phone ?? null, params.candidateType, userId);
    return;
  }
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

/** Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — type de candidat
 * (Particulier/Entreprise), réglable indépendamment d'une édition complète
 * de fiche (ex. depuis l'action "Affecter à une entreprise", qui doit
 * pouvoir faire basculer 'particulier' → 'entreprise' sans redemander tous
 * les autres champs). Jamais appelée pour créer une entreprise fictive —
 * uniquement une étiquette sur le compte lui-même. */
export function setCandidateType(userId: number, candidateType: CandidateType | null): void {
  getDb().prepare(`UPDATE users SET candidate_type = ? WHERE id = ?`).run(candidateType, userId);
}

/** Archivage (mission "COMPLETE USER MANAGEMENT", §14-17) — décision de
 * cycle de vie NORMALE (départ, doublon...), distincte d'une suspension
 * (mesure de sécurité réversible, souvent liée à un incident — voir
 * lib/incidents.ts). Connexion structurellement bloquée (même garde que
 * pending_activation/suspended, voir lib/auth.ts), sessions actives
 * révoquées par l'appelant (même geste que quickSuspendAction — pas
 * dupliqué ici, lib/sessions-registry.ts reste le seul point d'écriture).
 * Ne touche JAMAIS group_members/assessment_assignments/attempts/results —
 * l'archivage est un filtre de visibilité, jamais une suppression de
 * données. No-op si le compte n'est pas actuellement archivable au sens où
 * il est DÉJÀ archivé (jamais un archivage "en double"). */
export function archiveUser(userId: number): { changed: boolean } {
  const user = findUserById(userId);
  if (!user || user.status === "archived") return { changed: false };
  getDb().prepare(`UPDATE users SET status = 'archived', archived_at = ? WHERE id = ?`).run(nowIso(), userId);
  return { changed: true };
}

/** Restauration (§14-17) — symétrique de reactivateUserSafely() : ne
 * bascule JAMAIS vers 'active' un compte qui n'a jamais réellement complété
 * l'activation par jeton (même garde hasCompletedActivation() que la
 * réactivation d'un compte suspendu — un archivage n'efface pas cette
 * exigence). No-op si le compte n'est pas actuellement 'archived'. */
export function restoreUser(userId: number): { changed: boolean; newStatus: "active" | "pending_activation" | null } {
  const user = findUserById(userId);
  if (!user || user.status !== "archived") return { changed: false, newStatus: null };
  const newStatus = hasCompletedActivation(userId) ? "active" : "pending_activation";
  getDb().prepare(`UPDATE users SET status = ?, archived_at = NULL WHERE id = ?`).run(newStatus, userId);
  return { changed: true, newStatus };
}

export class UsernameConflictError extends Error {
  constructor(message = "Cet identifiant est déjà utilisé par un autre compte.") {
    super(message);
    this.name = "UsernameConflictError";
  }
}

/** Normalisation d'identifiant — mêmes règles à la création (implicite,
 * jamais appliquées jusqu'ici puisque le champ était immuable) et au
 * changement : minuscules, espaces de bord retirés. Ne réécrit jamais le
 * contenu au-delà de ça (pas de translittération) — un identifiant reste
 * ce que l'admin/le candidat a saisi, seulement normalisé pour la
 * comparaison d'unicité. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Changement d'identifiant de connexion (mission §18-21 — jusqu'ici
 * volontairement IMMUABLE, voir le commentaire historique sur
 * updateUserProfile ci-dessus). Rendu possible ici SANS casser la
 * continuité de traçabilité : `username` n'est référencé nulle part par
 * clé étrangère (audit_logs/sessions/attempts référencent tous `user_id`,
 * l'identifiant numérique stable) — seul le TEXTE affiché change, jamais
 * l'identité du compte. Unicité et normalisation appliquées ici, jamais
 * côté appelant. Retourne l'ancien identifiant pour que l'appelant puisse
 * auditer old→new et déclencher USERNAME_CHANGED. */
export function changeUsername(userId: number, newUsername: string): { oldUsername: string; newUsername: string } {
  const user = findUserById(userId);
  if (!user) throw new Error("Compte introuvable.");
  const normalized = normalizeUsername(newUsername);
  if (!normalized) throw new Error("L'identifiant ne peut pas être vide.");
  if (normalized === user.username) return { oldUsername: user.username, newUsername: user.username };

  const conflict = getDb().prepare(`SELECT 1 FROM users WHERE username = ? AND id != ?`).get(normalized, userId);
  if (conflict) throw new UsernameConflictError();

  getDb().prepare(`UPDATE users SET username = ? WHERE id = ?`).run(normalized, userId);
  return { oldUsername: user.username, newUsername: normalized };
}

/** Résultat d'inspection de dépendances avant suppression définitive
 * (mission §22 — sécurité STRICTE). `blockers` est une liste de raisons
 * lisibles (FR), jamais un simple booléen seul — l'admin doit savoir
 * POURQUOI un compte ne peut pas être supprimé. Volontairement large :
 * couvre autant les dépendances "métier" explicitement citées par la
 * mission (tentatives/résultats/affectations/incidents/familiarisation)
 * que les colonnes FK réelles du schéma SANS `ON DELETE CASCADE` qui
 * provoqueraient sinon une violation de contrainte brute au DELETE (ex. un
 * compte qui a créé un client/groupe/question/examen, ou agi dans un
 * incident) — jamais un crash SQLite non géré à la place d'un message FR
 * clair. notification_log est délibérément ABSENT de cette liste : un
 * compte invité mais jamais touché depuis a toujours au moins une ligne
 * ACCOUNT_CREATED (routine, pas une preuve de participation réelle au
 * programme) — voir hardDeleteUser() ci-dessous pour comment cette table
 * est préservée sans pour autant bloquer un compte réellement inutilisé. */
export function canHardDeleteUser(userId: number): { safe: boolean; blockers: string[] } {
  const db = getDb();
  const blockers: string[] = [];
  const exists1 = (sql: string): boolean => Boolean(db.prepare(sql).get(userId));
  const exists2 = (sql: string): boolean => Boolean(db.prepare(sql).get(userId, userId));

  if (exists1(`SELECT 1 FROM attempts WHERE candidate_user_id = ?`)) blockers.push("Cet utilisateur possède un historique d'examen (tentative(s) enregistrée(s)).");
  if (exists1(`SELECT 1 FROM assessment_assignments WHERE candidate_user_id = ?`)) blockers.push("Cet utilisateur est affecté à au moins un examen.");
  if (exists1(`SELECT 1 FROM familiarization_attendance WHERE candidate_user_id = ?`)) blockers.push("Cet utilisateur a une présence enregistrée à une session de familiarisation.");
  if (exists1(`SELECT 1 FROM incidents WHERE responsible_user_id = ?`)) blockers.push("Cet utilisateur est référencé comme responsable dans un incident.");
  if (exists1(`SELECT 1 FROM incidents WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé un signalement d'incident.");
  if (exists2(`SELECT 1 FROM incident_actions WHERE actor_user_id = ? OR (target_type = 'user' AND target_id = ?)`))
    blockers.push("Cet utilisateur est lié à une action d'incident (auteur ou cible).");
  if (exists1(`SELECT 1 FROM companies WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé une entreprise cliente.");
  if (exists2(`SELECT 1 FROM groups WHERE created_by = ? OR pedagogical_manager_id = ?`)) blockers.push("Cet utilisateur a créé ou gère un groupe.");
  if (exists1(`SELECT 1 FROM group_members WHERE added_by = ?`)) blockers.push("Cet utilisateur a ajouté un membre à un groupe.");
  if (exists1(`SELECT 1 FROM user_functions WHERE assigned_by = ?`)) blockers.push("Cet utilisateur a affecté une fonction DGR à un candidat.");
  if (exists1(`SELECT 1 FROM questions WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé une question.");
  if (exists1(`SELECT 1 FROM question_versions WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé une version de question.");
  if (exists1(`SELECT 1 FROM assessments WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé un examen.");
  if (exists1(`SELECT 1 FROM assessment_assignments WHERE assigned_by = ?`)) blockers.push("Cet utilisateur a affecté un candidat à un examen.");
  if (exists1(`SELECT 1 FROM familiarization_sessions WHERE organized_by = ?`)) blockers.push("Cet utilisateur a organisé une session de familiarisation.");
  if (exists1(`SELECT 1 FROM familiarization_attendance WHERE marked_by = ?`)) blockers.push("Cet utilisateur a marqué une présence de familiarisation.");
  if (exists1(`SELECT 1 FROM exports WHERE requested_by = ?`)) blockers.push("Cet utilisateur a demandé un export.");
  if (exists1(`SELECT 1 FROM imports WHERE imported_by = ?`)) blockers.push("Cet utilisateur a importé des données.");
  if (exists1(`SELECT 1 FROM platform_settings WHERE updated_by = ?`)) blockers.push("Cet utilisateur a modifié un réglage plateforme.");
  if (exists1(`SELECT 1 FROM sessions WHERE revoked_by = ?`)) blockers.push("Cet utilisateur a révoqué la session d'un autre compte.");
  if (exists1(`SELECT 1 FROM activation_tokens WHERE created_by = ?`)) blockers.push("Cet utilisateur a créé un jeton d'invitation pour un autre compte.");
  if (exists1(`SELECT 1 FROM email_suppressions WHERE created_by = ?`)) blockers.push("Cet utilisateur a ajouté une adresse à la liste de suppression email.");
  if (exists1(`SELECT 1 FROM audit_logs WHERE actor_user_id = ?`)) blockers.push("Cet utilisateur a effectué au moins une action journalisée dans l'audit.");

  return { safe: blockers.length === 0, blockers };
}

/** Suppression définitive STRICTE (mission §22) — réservée à un compte
 * "inutilisé" au sens de canHardDeleteUser() ci-dessus ; revérifie elle-
 * même la sécurité (jamais fait confiance à un appelant qui aurait
 * contourné la vérification en amont) et lève si une dépendance protégée
 * apparaît. `notification_log` est explicitement PRÉSERVÉ (jamais supprimé
 * — c'est une preuve d'audit de communication) mais `user_id` y est mis à
 * NULL pour ne pas violer la contrainte de clé étrangère tout en gardant
 * la ligne (recipient_email/event_type/statut restent lisibles). Les
 * jetons d'activation propres à ce compte (`activation_tokens.user_id`,
 * ON DELETE CASCADE) sont des enregistrements éphémères — leur suppression
 * est explicitement autorisée par la mission ("peut supprimer les
 * enregistrements éphémères sûrs"). */
export function hardDeleteUser(userId: number): void {
  const check = canHardDeleteUser(userId);
  if (!check.safe) {
    throw new Error("Cet utilisateur possède un historique d'examen et ne peut pas être supprimé définitivement. Vous pouvez archiver son compte.");
  }
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`UPDATE notification_log SET user_id = NULL WHERE user_id = ?`).run(userId);
    const result = db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    if ((result.changes as number) === 0) throw new Error("Compte introuvable.");
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
