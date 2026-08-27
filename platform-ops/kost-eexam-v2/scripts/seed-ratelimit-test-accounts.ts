// Comptes dédiés à la preuve propre du limiteur anti-force-brute — §"RATE-
// LIMIT TEST — CLEAN PROOF" de la revue pré-auditeur. Le compte de test
// précédent (candidat3.staging) restait verrouillé d'une exécution à
// l'autre (fenêtre de 15 min du limiteur en mémoire), rendant la preuve
// non déterministe. Deux comptes FRAÎCHEMENT créés ici, jamais utilisés
// ailleurs dans le pilote, garantissent un état initial connu (aucun
// échec enregistré) à chaque exécution du script de seed — et donc un
// test reproductible sans dépendre du minutage d'une exécution
// précédente.
import { randomBytes } from "node:crypto";
import { getDb, closeDb } from "../lib/db";
import { createUser, findUserByUsername } from "../lib/users";

function randomPassword(): string {
  return randomBytes(12).toString("base64url");
}

function ensureUser(username: string, fullName: string): { id: number; password: string | null } {
  const existing = findUserByUsername(username);
  if (existing) return { id: existing.id, password: null };
  const password = randomPassword();
  const id = createUser({ username, password, fullName, role: "candidate" });
  return { id, password };
}

function main() {
  getDb();
  const subject = ensureUser("ratelimit-test.staging", "Compte Test Limiteur (sujet)");
  const unrelated = ensureUser("ratelimit-unrelated.staging", "Compte Test Limiteur (témoin non affecté)");

  console.log("\n=== IDENTIFIANTS TEST LIMITEUR (hors Git) ===");
  for (const [label, u, username] of [
    ["sujet", subject, "ratelimit-test.staging"],
    ["témoin", unrelated, "ratelimit-unrelated.staging"],
  ] as const) {
    if (u.password) console.log(`${label.padEnd(10)} ${username.padEnd(28)} ${u.password}`);
    else console.log(`${label.padEnd(10)} ${username.padEnd(28)} (déjà existant — mot de passe non régénéré)`);
  }
  console.log("===\n");

  closeDb();
}

main();
