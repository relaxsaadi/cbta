// Structure de démonstration STAGING — §5 de la phase "STAGING DEPLOY +
// REAL DGR PILOT". Contrairement à scripts/seed-demo.ts (dev local), CE
// script NE crée AUCUNE question fictive — le staging n'utilise que le
// contenu réel importé par scripts/import-function-7-1-real.ts. Les mots
// de passe sont générés aléatoirement ici (pas de valeur fixe committée),
// écrits UNE fois sur la sortie standard pour transmission hors Git, et ne
// sont jamais réutilisés pour la production.
import { randomBytes } from "node:crypto";
import { getDb, closeDb } from "../lib/db";
import { createUser, findUserByUsername } from "../lib/users";
import { createCompany } from "../lib/companies";
import { createGroup, addCandidateToGroup } from "../lib/groups";

function randomPassword(): string {
  // 16 caractères hex-encodés depuis 12 octets aléatoires — température de
  // divertissement nulle, jamais un mot du dictionnaire.
  return randomBytes(12).toString("base64url");
}

function ensureUser(username: string, fullName: string, role: "administrator" | "pedagogical_manager" | "auditor" | "candidate"): { id: number; password: string | null } {
  const existing = findUserByUsername(username);
  if (existing) return { id: existing.id, password: null }; // déjà créé — mot de passe déjà communiqué, ne pas le regénérer silencieusement
  const password = randomPassword();
  const id = createUser({ username, password, fullName, role });
  return { id, password };
}

function main() {
  getDb();

  const credentials: { username: string; role: string; password: string | null }[] = [];

  const admin = ensureUser("admin.staging", "Administrateur Staging", "administrator");
  credentials.push({ username: "admin.staging", role: "administrateur", password: admin.password });

  const manager = ensureUser("responsable.staging", "Responsable Pédagogique Staging", "pedagogical_manager");
  credentials.push({ username: "responsable.staging", role: "responsable_pedagogique", password: manager.password });

  const auditor = ensureUser("auditeur.staging", "Auditeur Staging", "auditor");
  credentials.push({ username: "auditeur.staging", role: "auditeur", password: auditor.password });

  // Compte dédié à la démonstration d'incident (§8 de la phase) — distinct
  // des 3 candidats de l'examen pilote, pour ne jamais affecter leur
  // parcours.
  const incidentDemo = ensureUser("incident-demo.staging", "Compte Démo Incident", "candidate");
  credentials.push({ username: "incident-demo.staging", role: "candidat_demo_incident", password: incidentDemo.password });

  const candidateNames = ["Yasmine Kaced (pilote)", "Riad Boumediene (pilote)", "Amel Ferhati (pilote)"];
  const candidateIds: number[] = [];
  candidateNames.forEach((name, i) => {
    const username = `candidat${i + 1}.staging`;
    const u = ensureUser(username, name, "candidate");
    credentials.push({ username, role: "candidat", password: u.password });
    candidateIds.push(u.id);
  });

  const companyId = createCompany({ name: "Air Algérie — DEMO", scope: "demo", createdBy: admin.id });
  const groupId = createGroup({
    companyId,
    name: "Air Algérie — DGR Démonstration",
    scope: "demo",
    sessionLabel: "Pilote Fonction 7.1 — staging",
    pedagogicalManagerId: manager.id,
    createdBy: manager.id,
  });
  for (const cid of candidateIds) addCandidateToGroup(groupId, cid, manager.id);

  console.log(`\nStructure créée : Air Algérie — DEMO (id=${companyId}) / Air Algérie — DGR Démonstration (id=${groupId}), ${candidateIds.length} candidat(s) pilote(s) affecté(s).`);
  console.log("\n=== IDENTIFIANTS TEMPORAIRES (hors Git — à transmettre de façon sécurisée, à faire tourner après revue) ===");
  for (const c of credentials) {
    if (c.password) {
      console.log(`${c.role.padEnd(28)} ${c.username.padEnd(28)} ${c.password}`);
    } else {
      console.log(`${c.role.padEnd(28)} ${c.username.padEnd(28)} (compte déjà existant — mot de passe non régénéré)`);
    }
  }
  console.log("===\n");

  closeDb();
}

main();
