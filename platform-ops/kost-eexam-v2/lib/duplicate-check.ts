// Détection de doublon candidat (mission "FIX NESRINE/FETHI STAGING
// DELIVERY + PREVENT DUPLICATE CANDIDATE CREATION", 2026-08-30, §8-9) —
// SOURCE UNIQUE réutilisée par les 3 points d'entrée de création de
// compte candidat (assistant /users/nouveau, "Ajouter un candidat" sur
// /groups/[id], import CSV en masse) — jamais une réimplémentation locale
// divergente dans chacun.
//
// Incident réel ayant motivé cette mission : deux comptes "Nesrine"
// distincts existaient en staging (id 60 et 61), créés à ~5 minutes
// d'intervalle avec un identifiant ET un email chacun LÉGÈREMENT
// différents (aucune collision exacte, même insensible à la casse — voir
// diagnostic 2026-08-30) — cette fonction ne prétend PAS détecter les
// fautes de frappe (hors-scope, risquerait des faux positifs), mais
// détecte fiablement le cas courant et bien plus fréquent : le MÊME
// identifiant/email ressaisi avec une casse ou des espaces de bord
// différents (jamais détecté aujourd'hui, la contrainte UNIQUE SQLite sur
// `username`/`email` est sensible à la casse par défaut).
import { getDb } from "./db";
import { hasUserAccess, type ScopeSession } from "./tenant-scope";

export interface DuplicateMatch {
  userId: number;
  /** Le compte trouvé est-il dans le périmètre visible de l'acteur courant
   * (lib/tenant-scope.ts::hasUserAccess) ? Si NON, aucun détail (nom,
   * entreprise, statut...) ne doit jamais être révélé — seul un message
   * générique est renvoyé à l'appelant (§9). */
  visible: boolean;
}

/** Normalisation identique des deux côtés de la comparaison (jamais
 * l'espace de bord/la casse d'origine) — mêmes règles que
 * lib/users.ts::normalizeUsername pour l'identifiant, appliquées ici
 * aussi à l'email pour la même raison. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Recherche un compte EXISTANT dont l'identifiant OU l'email normalisé
 * correspond exactement à celui fourni — jamais une correspondance floue
 * (nom similaire, distance de Levenshtein, etc.), qui produirait des faux
 * positifs bloquant des créations légitimes. `email` est optionnel (le
 * flux "Créer sans envoyer maintenant" pour un Particulier n'en exige
 * pas) — la recherche se limite alors à l'identifiant. */
export function findDuplicateAccount(session: ScopeSession, username: string | undefined, email: string | undefined, excludeUserId?: number): DuplicateMatch | null {
  const normalizedUsername = username ? normalize(username) : undefined;
  const normalizedEmail = email ? normalize(email) : undefined;
  if (!normalizedUsername && !normalizedEmail) return null;

  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (normalizedUsername) {
    clauses.push(`LOWER(TRIM(username)) = ?`);
    params.push(normalizedUsername);
  }
  if (normalizedEmail) {
    clauses.push(`LOWER(TRIM(email)) = ?`);
    params.push(normalizedEmail);
  }
  let sql = `SELECT id FROM users WHERE (${clauses.join(" OR ")})`;
  if (excludeUserId) {
    sql += ` AND id != ?`;
    params.push(excludeUserId);
  }
  const row = db.prepare(`${sql} LIMIT 1`).get(...params) as { id: number } | undefined;

  if (!row) return null;
  return { userId: row.id, visible: hasUserAccess(session, row.id) };
}

/** Message générique EXACT requis par la mission (§9) — jamais complété
 * par un détail (nom, entreprise, statut) quand `visible` est faux, quel
 * que soit l'appelant. */
export const CROSS_TENANT_DUPLICATE_MESSAGE = "Un compte utilisant cet identifiant ou cette adresse existe déjà. Contactez l'administrateur.";

/** Message visible (même tenant / administrateur) — le nom N'EST
 * délibérément PAS interpolé ici (le champ reste générique, la fiche
 * cible elle-même affichera son propre nom) pour rester correct même si
 * l'appelant décide de ne montrer que le message sans le lien. */
export const VISIBLE_DUPLICATE_MESSAGE = "Un compte correspondant existe déjà.";
