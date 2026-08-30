// Frontière d'autorisation multi-client (cross-tenant) — trouvée absente à
// l'audit sécurité pré-auditeur : le modèle de données a toujours porté
// l'assignation (groups.pedagogical_manager_id, companies.created_by), mais
// AUCUNE page/action/route ne la faisait respecter — un responsable
// pédagogique authentifié pouvait lire (et pour certaines actions, écrire)
// les données de N'IMPORTE QUEL client, pas seulement le sien, dès lors
// qu'il en devinait/manipulait l'identifiant. Ce module est l'UNIQUE
// source de vérité de cette frontière — chaque page/action qui touche à
// une entreprise, un groupe, une évaluation ou une tentative doit passer
// par une des fonctions ci-dessous, jamais réimplémenter la vérification
// localement.
//
// Périmètre par rôle (tel que spécifié) :
//   - administrator : accès global, aucune restriction.
//   - auditor       : lecture globale (périmètre d'audit prévu), jamais
//                     d'écriture (déjà garanti ailleurs par
//                     requireWriteRole, qui exclut structurellement
//                     "auditor" de la liste des rôles autorisés).
//   - pedagogical_manager : restreint aux groupes qu'il gère
//                     (groups.pedagogical_manager_id = son id) et, par
//                     extension, aux entreprises où il gère au moins un
//                     groupe OU qu'il a lui-même créées (companies.created_by)
//                     — ce deuxième cas couvre le flux normal "créer un
//                     client → puis créer son premier groupe", qui
//                     échouerait sinon immédiatement après la création du
//                     client.
//   - candidate     : jamais concerné par ce module — son isolement est
//                     structurel (lib/results.ts filtre par
//                     candidate_user_id = session.userId, jamais par un
//                     paramètre venant du client ; voir mes-resultats/page.tsx).
//
// Choix délibéré : une ressource hors périmètre est traitée comme
// INTROUVABLE (404, notFound()) plutôt que comme un refus explicite — un
// refus confirmerait l'existence de l'identifiant deviné pour un autre
// client, ce qu'un 404 ne fait pas. Les pages appellent les prédicats
// `hasXAccess` ci-dessous puis `notFound()` elles-mêmes ; les Server
// Actions (mutations) lèvent `TenantAccessError` directement, cohérent
// avec le style throw-based de requireWriteRole().
import { getDb } from "./db";
import type { ConsoleRole } from "./session";

export interface ScopeSession {
  userId: number;
  role: ConsoleRole;
}

// Message par défaut contient volontairement « autorisé » — app/(app)/error.tsx
// détecte une erreur d'accès sur ce mot pour afficher « Accès refusé »
// plutôt que l'écran d'erreur générique (même heuristique que
// UnauthorizedError de lib/rbac.ts, dont ce cas est le pendant côté
// périmètre client plutôt que rôle).
export class TenantAccessError extends Error {
  constructor(message = "Ressource non autorisée pour ce compte — hors du périmètre client.") {
    super(message);
    this.name = "TenantAccessError";
  }
}

/** Groupes gérés par ce responsable — base de toute la frontière. */
export function getManagedGroupIds(userId: number): number[] {
  return (getDb().prepare(`SELECT id FROM groups WHERE pedagogical_manager_id = ?`).all(userId) as { id: number }[]).map(
    (r) => r.id
  );
}

/** null = aucune restriction (administrator/auditor) ; sinon la liste
 * (potentiellement vide) des groupes gérés par ce responsable — à utiliser
 * pour restreindre une requête de LISTE (résultats, exports CSV), jamais
 * pour un accès direct par identifiant (utiliser hasXAccess ci-dessous). */
export function scopedGroupIdsOrNull(session: ScopeSession): number[] | null {
  if (session.role !== "pedagogical_manager") return null;
  return getManagedGroupIds(session.userId);
}

export function hasGroupAccess(session: ScopeSession, groupId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  return !!getDb()
    .prepare(`SELECT 1 FROM groups WHERE id = ? AND pedagogical_manager_id = ?`)
    .get(groupId, session.userId);
}

export function hasCompanyAccess(session: ScopeSession, companyId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  const db = getDb();
  const created = db.prepare(`SELECT 1 FROM companies WHERE id = ? AND created_by = ?`).get(companyId, session.userId);
  if (created) return true;
  return !!db
    .prepare(`SELECT 1 FROM groups WHERE company_id = ? AND pedagogical_manager_id = ?`)
    .get(companyId, session.userId);
}

export function hasAssessmentAccess(session: ScopeSession, assessmentId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  return !!getDb()
    .prepare(
      `SELECT 1 FROM assessments a JOIN groups g ON g.id = a.group_id WHERE a.id = ? AND g.pedagogical_manager_id = ?`
    )
    .get(assessmentId, session.userId);
}

/** Addendum §18-21 — module de familiarisation : une session porte sur un
 * groupe, même frontière qu'un examen (hasAssessmentAccess ci-dessus). */
export function hasFamiliarizationSessionAccess(session: ScopeSession, familiarizationSessionId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  return !!getDb()
    .prepare(
      `SELECT 1 FROM familiarization_sessions fs JOIN groups g ON g.id = fs.group_id WHERE fs.id = ? AND g.pedagogical_manager_id = ?`
    )
    .get(familiarizationSessionId, session.userId);
}

export function hasAttemptAccess(session: ScopeSession, attemptId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  return !!getDb()
    .prepare(
      `SELECT 1 FROM attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN groups g ON g.id = a.group_id
       WHERE at.id = ? AND g.pedagogical_manager_id = ?`
    )
    .get(attemptId, session.userId);
}

/** Un incident SANS group_id est un incident PLATEFORME (panne, cyberattaque
 * globale…) — visible de tous les rôles habilités, jamais restreint. Un
 * incident AVEC group_id est propre à un client, visible seulement du
 * responsable qui gère ce groupe (ou administrator/auditor). */
export function hasIncidentAccess(session: ScopeSession, incidentId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  const row = getDb().prepare(`SELECT group_id FROM incidents WHERE id = ?`).get(incidentId) as { group_id: number | null } | undefined;
  if (!row) return false;
  if (row.group_id === null) return true; // incident plateforme
  return hasGroupAccess(session, row.group_id);
}

/** Candidats membres d'au moins un groupe géré par ce responsable — base
 * du périmètre pour les sessions actives (lib/sessions-registry.ts). */
export function getManagedCandidateUserIds(userId: number): number[] {
  return (
    getDb()
      .prepare(
        `SELECT DISTINCT gm.candidate_user_id AS id
         FROM group_members gm
         JOIN groups g ON g.id = gm.group_id
         WHERE g.pedagogical_manager_id = ?`
      )
      .all(userId) as { id: number }[]
  ).map((r) => r.id);
}

/** null = aucune restriction (administrator/auditor) ; sinon la liste des
 * user_id visibles pour ce responsable sur une liste de type "sessions
 * actives" — lui-même PLUS les candidats de ses groupes. Jamais les
 * autres responsables/administrateurs/auditeurs (leur simple présence en
 * ligne est elle-même une information à ne pas exposer hors périmètre). */
export function scopedUserIdsForSessionsOrNull(session: ScopeSession): number[] | null {
  if (session.role !== "pedagogical_manager") return null;
  return [session.userId, ...getManagedCandidateUserIds(session.userId)];
}

/** Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — frontière PRÉVUE pour
 * /users et sa fiche détaillée : un responsable pédagogique ne doit
 * jamais voir/agir sur un compte hors de son périmètre — ni un autre
 * membre du staff, ni un candidat "Particulier" pas encore affecté à l'un
 * de ses groupes. Réutilise getManagedCandidateUserIds() — jamais une
 * requête réimplémentée localement dans les Server Actions de /users.
 *
 * DÉCISION DE POLITIQUE PRODUIT, PAS UN OUBLI (confirmée et documentée
 * lors de deux audits transversaux indépendants, 2026-08-30) :
 * `/users`, `/users/nouveau` et `/users/[id]` restent **ADMIN ONLY**
 * (`guardPage("administrator")`, `requireWriteRole("administrator")` sur
 * chaque action) — un responsable pédagogique n'atteint AUCUNE de ces
 * routes aujourd'hui, quel que soit le compte ciblé, y compris DANS son
 * propre périmètre. Cette fonction reste donc du CODE MORT (zéro
 * appelant dans tout le dépôt, vérifié par grep les deux fois) — conservée
 * volontairement plutôt que supprimée, en cas d'ouverture future de
 * /users au rôle responsable pédagogique.
 *
 * Le responsable pédagogique gère déjà, dans son propre périmètre
 * tenant : /companies, /groups (créer un groupe, ajouter/retirer un
 * candidat — y compris CRÉER le compte candidat via « Ajouter un
 * candidat »), /exam-preparation (créer/publier/reprogrammer un examen),
 * /grading (corriger une réponse en attente). Aucun flux produit existant
 * n'a été identifié qui nécessiterait, en plus, l'administration
 * SENSIBLE d'un compte (édition libre de tous les champs, suspension/
 * archivage/suppression définitive, changement d'identifiant,
 * réinitialisation MFA, affiliation cross-tenant) — cette administration
 * reste donc, par choix, strictement administrateur. Ne pas élargir sans
 * décision explicite du propriétaire de la plateforme. */
export function hasUserAccess(session: ScopeSession, targetUserId: number): boolean {
  if (session.role !== "pedagogical_manager") return true;
  return getManagedCandidateUserIds(session.userId).includes(targetUserId);
}

/** Pour les Server Actions (mutations) — lève plutôt que de retourner un
 * booléen, cohérent avec requireWriteRole(). */
export function assertAccess(ok: boolean, message?: string): void {
  if (!ok) throw new TenantAccessError(message);
}
