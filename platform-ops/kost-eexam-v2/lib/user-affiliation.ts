// Affiliation client/groupe d'un candidat (mission "COMPLETE USER
// MANAGEMENT", 2026-08-29, §22-24 de la spec). Décision d'architecture
// délibérée : PAS de nouvelle colonne `users.company_id`. L'affiliation
// "entreprise" d'un candidat est entièrement DÉRIVÉE de son appartenance à
// un/des groupe(s) (`group_members` → `groups.company_id`) — c'est déjà la
// source de vérité utilisée ailleurs dans le code (voir
// lib/email/resend-actions.ts::resendInvitation, qui résout exactement
// cette même jointure). Ajouter une colonne parallèle créerait une seconde
// source de vérité pouvant diverger de la réalité des groupes — jamais
// souhaitable. group_members.PK composite (group_id, candidate_user_id)
// supporte déjà nativement le multi-groupe, donc aucun changement de schéma
// n'était nécessaire pour cette partie de la mission.
import { getDb } from "./db";
import { addCandidateToGroup, removeCandidateFromGroup, getGroup, createGroup } from "./groups";
import { setCandidateType } from "./users";
import { createCompany } from "./companies";
import type { Scope } from "./scope";

export interface CandidateGroupRow {
  group_id: number;
  group_name: string;
  session_label: string | null;
  company_id: number;
  company_name: string;
  added_at: string;
}

/** Tous les groupes (donc entreprises) dont ce candidat est actuellement
 * membre — potentiellement plusieurs (multi-groupe déjà supporté),
 * potentiellement aucun (Particulier non affecté). */
export function listCandidateGroups(userId: number): CandidateGroupRow[] {
  return getDb()
    .prepare(
      `SELECT g.id AS group_id, g.name AS group_name, g.session_label, c.id AS company_id, c.name AS company_name, gm.added_at
       FROM group_members gm
       JOIN groups g ON g.id = gm.group_id
       JOIN companies c ON c.id = g.company_id
       WHERE gm.candidate_user_id = ?
       ORDER BY gm.added_at DESC`
    )
    .all(userId) as unknown as CandidateGroupRow[];
}

/** Résumé "entreprise principale" — le groupe le plus récemment rejoint,
 * utilisé partout où une SEULE ligne de contexte tenant est nécessaire
 * (fiche candidat, gabarits email). null si le candidat n'est membre
 * d'aucun groupe (Particulier non affecté, ou Particulier tout court). */
export function getPrimaryCompanyContext(userId: number): { companyId: number; companyName: string; groupId: number; groupName: string } | null {
  const row = getDb()
    .prepare(
      `SELECT c.id AS company_id, c.name AS company_name, g.id AS group_id, g.name AS group_name
       FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN companies c ON c.id = g.company_id
       WHERE gm.candidate_user_id = ? ORDER BY gm.added_at DESC LIMIT 1`
    )
    .get(userId) as { company_id: number; company_name: string; group_id: number; group_name: string } | undefined;
  if (!row) return null;
  return { companyId: row.company_id, companyName: row.company_name, groupId: row.group_id, groupName: row.group_name };
}

/** Historique protégé liant CE candidat à CE groupe précis — condition de
 * blocage pour tout retrait/changement (§24 : « si l'historique tenant ne
 * peut pas être préservé en sécurité : BLOQUER »). Couvre affectations
 * d'examen, tentatives (même si l'examen a depuis été supprimé du pool,
 * `assessments.group_id` reste la source), et présence de familiarisation —
 * les trois catégories de preuve de participation réelle sous ce groupe. */
export function hasProtectedGroupHistory(userId: number, groupId: number): boolean {
  const db = getDb();
  const viaAssignments = db
    .prepare(
      `SELECT 1 FROM assessment_assignments aa JOIN assessments a ON a.id = aa.assessment_id
       WHERE aa.candidate_user_id = ? AND a.group_id = ? LIMIT 1`
    )
    .get(userId, groupId);
  if (viaAssignments) return true;

  const viaAttempts = db
    .prepare(
      `SELECT 1 FROM attempts at JOIN assessments a ON a.id = at.assessment_id
       WHERE at.candidate_user_id = ? AND a.group_id = ? LIMIT 1`
    )
    .get(userId, groupId);
  if (viaAttempts) return true;

  const viaFamiliarization = db
    .prepare(
      `SELECT 1 FROM familiarization_attendance fa JOIN familiarization_sessions fs ON fs.id = fa.session_id
       WHERE fa.candidate_user_id = ? AND fs.group_id = ? LIMIT 1`
    )
    .get(userId, groupId);
  return Boolean(viaFamiliarization);
}

export class AffiliationError extends Error {}

/** Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §1-4 —
 * bug réel diagnostiqué : un candidat 'particulier' n'avait jusqu'ici
 * AUCUN groupe (§3 "pas d'entreprise rattachée" masque le bloc
 * d'affectation dans l'assistant de création), donc ne pouvait
 * structurellement se voir affecter aucun examen (assessments.group_id
 * est NOT NULL — vérifié dans lib/schema.sql). Provisionne l'entreprise/
 * groupe "plomberie" minimale nécessaire, JAMAIS montrée à l'admin comme
 * un vrai client (companies.client_type='particulier', exclue par défaut
 * de listCompanies()/listCompaniesForManager()) et JAMAIS un nom
 * d'organisation inventé (le nom reprend celui du candidat lui-même —
 * "Do NOT force Entreprise = Particulier or create a fake organization
 * name", exigence explicite de la mission). N'appelle JAMAIS
 * addUserToGroup() (qui basculerait candidate_type vers 'entreprise' —
 * addCandidateToGroup() directement, la primitive brute). Idempotent :
 * un appel répété pour le même candidat réutilise l'entreprise/groupe déjà
 * provisionné plutôt que d'en recréer un nouveau à chaque fois. */
export function provisionParticulierAccess(userId: number, fullName: string, actorId: number, scope: Scope): { companyId: number; groupId: number } {
  const existing = getDb()
    .prepare(
      `SELECT c.id AS company_id, g.id AS group_id
       FROM group_members gm
       JOIN groups g ON g.id = gm.group_id
       JOIN companies c ON c.id = g.company_id
       WHERE gm.candidate_user_id = ? AND c.client_type = 'particulier'
       LIMIT 1`
    )
    .get(userId) as { company_id: number; group_id: number } | undefined;
  if (existing) return { companyId: existing.company_id, groupId: existing.group_id };

  const companyId = createCompany({ name: fullName, scope, createdBy: actorId, clientType: "particulier" });
  const groupId = createGroup({ companyId, name: "Session individuelle", scope, createdBy: actorId });
  addCandidateToGroup(groupId, userId, actorId);
  return { companyId, groupId };
}

/** "Affecter à un groupe" / "Ajouter à un groupe" (§23-24) — toujours sans
 * risque (ajout pur, jamais de suppression) : idempotent, ne casse jamais
 * d'historique. Bascule `candidate_type` vers 'entreprise' si le compte
 * n'était pas déjà explicitement marqué ainsi (un candidat rejoignant un
 * groupe client EST par définition un candidat entreprise) — ne redescend
 * jamais 'entreprise' → 'particulier' automatiquement (seule une action
 * explicite le fait, voir setCandidateType côté action). */
export function addUserToGroup(userId: number, groupId: number, actorId: number): void {
  const group = getGroup(groupId);
  if (!group) throw new AffiliationError("Groupe introuvable.");
  addCandidateToGroup(groupId, userId, actorId);
  setCandidateType(userId, "entreprise");
}

/** "Retirer d'un groupe" (§23) — BLOQUÉ si un historique protégé existe
 * pour ce couple (candidat, groupe) précis (§24 dernière ligne : « ne
 * jamais sacrifier l'isolation à la commodité » — appliqué ici comme
 * « ne jamais sacrifier la preuve d'historique à la commodité »). */
export function removeUserFromGroupSafely(userId: number, groupId: number): { removed: boolean; blockedReason?: string } {
  if (hasProtectedGroupHistory(userId, groupId)) {
    return {
      removed: false,
      blockedReason: "Ce candidat a un historique d'examen ou de familiarisation sous ce groupe — retrait impossible sans perdre cette preuve. Utilisez « Ajouter à un groupe » pour l'affecter ailleurs SANS le retirer, ou archivez le compte.",
    };
  }
  removeCandidateFromGroup(groupId, userId);
  return { removed: true };
}

/** "Changer de groupe/d'entreprise" (§22-24) — remplace l'appartenance à
 * `oldGroupId` par `newGroupId`. BLOQUE l'opération ENTIÈRE (n'ajoute même
 * pas le nouveau groupe) si l'ancien groupe porte un historique protégé
 * pour ce candidat — un succès partiel ("ajouté au nouveau, mais toujours
 * aussi dans l'ancien contre la volonté de l'admin") serait plus déroutant
 * qu'un blocage net avec explication. L'admin dispose de "Ajouter à un
 * groupe" (ci-dessus) comme alternative non destructive. */
export function changeUserGroup(userId: number, oldGroupId: number, newGroupId: number, actorId: number): { changed: boolean; blockedReason?: string } {
  const newGroup = getGroup(newGroupId);
  if (!newGroup) throw new AffiliationError("Groupe cible introuvable.");
  if (hasProtectedGroupHistory(userId, oldGroupId)) {
    return {
      changed: false,
      blockedReason: "Ce candidat a un historique d'examen ou de familiarisation sous son groupe actuel — changement impossible sans perdre cette preuve. Utilisez « Ajouter à un groupe » pour l'affecter également au nouveau groupe SANS le retirer de l'ancien, ou archivez le compte.",
    };
  }
  removeCandidateFromGroup(oldGroupId, userId);
  addCandidateToGroup(newGroupId, userId, actorId);
  setCandidateType(userId, "entreprise");
  return { changed: true };
}
