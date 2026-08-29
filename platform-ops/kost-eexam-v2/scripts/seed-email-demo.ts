// Fixture E2E dédiée au sous-système email (mission email §61-69) —
// séparée de scripts/seed-demo.ts pour ne PAS modifier le jeu de données
// existant (déjà consommé par 8 scénarios e2e qui n'ont pas besoin
// d'email). Doit tourner APRÈS seed-demo.ts (réutilise son admin/
// responsable/groupe démo). scope='demo' partout, jamais mélangé à la
// production.
//
// Crée :
//  1. Un candidat 'pending_activation' AVEC email dans le groupe démo
//     existant — jeton d'activation en clair capturé ici (jamais stocké
//     en base au-delà de son hash, voir lib/activation-tokens.ts) et
//     écrit dans un fichier de fixture JSON, exactement comme un email
//     réel en contiendrait un — ce script tient le rôle de "boîte mail"
//     pour les tests E2E locaux (EMAIL_MODE=log ne délivre jamais rien
//     de réel, voir playwright.config.ts).
//  2. Un DEUXIÈME tenant complet (entreprise + groupe + responsable +
//     candidat) totalement indépendant du groupe démo — nécessaire pour
//     prouver l'isolation multi-client (§48/§68) sur /notifications,
//     jamais testable avec un seul tenant.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, closeDb } from "../lib/db";
import { createUser, createUserPendingActivation, findUserByUsername } from "../lib/users";
import { createCompany } from "../lib/companies";
import { createGroup, addCandidateToGroup, getGroup } from "../lib/groups";
import { createActivationToken } from "../lib/activation-tokens";
import { notifyAccountCreated } from "../lib/email/events";

function ensureStaffUser(username: string, fullName: string, role: "administrator" | "pedagogical_manager" | "auditor", password: string): number {
  const existing = findUserByUsername(username);
  if (existing) return existing.id;
  return createUser({ username, password, fullName, role });
}

async function main() {
  const db = getDb();

  const adminId = ensureStaffUser("admin", "Admin KOST (démo)", "administrator", "ChangeMoi123!");
  const demoManager = findUserByUsername("responsable.demo");
  if (!demoManager) throw new Error("seed-demo.ts doit tourner avant seed-email-demo.ts (responsable.demo introuvable).");
  const demoGroup = db.prepare(`SELECT id FROM groups WHERE name LIKE 'Air Algérie — DGR%'`).get() as { id: number } | undefined;
  if (!demoGroup) throw new Error("seed-demo.ts doit tourner avant seed-email-demo.ts (groupe démo introuvable).");
  const demoGroupFull = getGroup(demoGroup.id);
  if (!demoGroupFull) throw new Error("groupe démo introuvable via getGroup().");

  // --- 1. Candidat pending_activation AVEC email, groupe démo existant ---
  let activationCandidateId: number;
  const existingActivationCandidate = findUserByUsername("candidat.e2e.activation");
  if (existingActivationCandidate) {
    activationCandidateId = existingActivationCandidate.id;
  } else {
    activationCandidateId = createUserPendingActivation({
      username: "candidat.e2e.activation",
      fullName: "Amel E2E (activation)",
      role: "candidate",
      email: "candidat.e2e.activation@example.test",
    });
    addCandidateToGroup(demoGroup.id, activationCandidateId, demoManager.id);
  }
  const { token: activationToken, expiresAt: activationExpiresAt } = createActivationToken({
    userId: activationCandidateId,
    purpose: "account_setup",
    createdBy: adminId,
  });
  // ACCOUNT_CREATED réel (mission email §10) — exactement le même appel
  // que le flux d'invitation réel (app/(app)/groups/actions.ts), pour que
  // /notifications ait une VRAIE ligne à afficher/filtrer dans les tests.
  await notifyAccountCreated({
    userId: activationCandidateId,
    email: "candidat.e2e.activation@example.test",
    firstName: "Amel",
    companyId: demoGroupFull.company_id,
    companyName: demoGroupFull.company_name,
    groupName: demoGroupFull.name,
    usernameOrEmail: "candidat.e2e.activation@example.test",
    activationToken,
    expiresAt: activationExpiresAt,
  });

  // --- 2. Deuxième tenant complet, isolé du groupe démo ---
  const isolationManagerId = ensureStaffUser("responsable.e2e2", "Yasmine E2E (responsable isolation)", "pedagogical_manager", "ChangeMoi123!");
  let isolationCompanyId = (db.prepare(`SELECT id FROM companies WHERE name = 'Client E2E Isolation'`).get() as { id: number } | undefined)?.id;
  if (!isolationCompanyId) {
    isolationCompanyId = createCompany({ name: "Client E2E Isolation", scope: "demo", createdBy: adminId });
  }
  let isolationGroupId = (db.prepare(`SELECT id FROM groups WHERE name = 'Groupe E2E Isolation'`).get() as { id: number } | undefined)?.id;
  if (!isolationGroupId) {
    isolationGroupId = createGroup({
      companyId: isolationCompanyId,
      name: "Groupe E2E Isolation",
      scope: "demo",
      sessionLabel: "Session isolation E2E",
      pedagogicalManagerId: isolationManagerId,
      createdBy: isolationManagerId,
    });
  }
  let isolationCandidateId = findUserByUsername("candidat.e2e.isolation")?.id;
  if (!isolationCandidateId) {
    isolationCandidateId = createUserPendingActivation({
      username: "candidat.e2e.isolation",
      fullName: "Yanis E2E (isolation)",
      role: "candidate",
      email: "candidat.e2e.isolation@example.test",
    });
    addCandidateToGroup(isolationGroupId, isolationCandidateId, isolationManagerId);
  }
  const { token: isolationToken, expiresAt: isolationExpiresAt } = createActivationToken({
    userId: isolationCandidateId,
    purpose: "account_setup",
    createdBy: adminId,
  });
  await notifyAccountCreated({
    userId: isolationCandidateId,
    email: "candidat.e2e.isolation@example.test",
    firstName: "Yanis",
    companyId: isolationCompanyId,
    companyName: "Client E2E Isolation",
    groupName: "Groupe E2E Isolation",
    usernameOrEmail: "candidat.e2e.isolation@example.test",
    activationToken: isolationToken,
    expiresAt: isolationExpiresAt,
  });

  const fixture = {
    activationToken,
    activationCandidateUsername: "candidat.e2e.activation",
    activationCandidateFullName: "Amel E2E (activation)",
    isolationManagerUsername: "responsable.e2e2",
    isolationCandidateFullName: "Yanis E2E (isolation)",
    demoManagerUsername: "responsable.demo",
  };
  writeFileSync(resolve(import.meta.dirname, "../tests/e2e/.email-fixtures.json"), JSON.stringify(fixture, null, 2));

  console.log("Fixtures email E2E créées :");
  console.log(`  candidat.e2e.activation (pending_activation, jeton capturé pour /activer, ACCOUNT_CREATED réel envoyé)`);
  console.log(`  2e tenant isolé : Client E2E Isolation / responsable.e2e2 / candidat.e2e.isolation (ACCOUNT_CREATED réel envoyé)`);

  closeDb();
}

main();
