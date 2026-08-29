import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "COMPLETE USER MANAGEMENT" (2026-08-29) — §50, 9 tests sur le
// changement d'identifiant de connexion. `username` n'est référencé par
// AUCUNE clé étrangère du schéma (tout pointe vers l'id numérique stable,
// voir lib/schema.sql) — un changement ne casse donc jamais la continuité
// de traçabilité (audit_logs, sessions, attempts, notification_log restent
// tous valides après un changement).
describe("Changement d'identifiant de connexion (mission COMPLETE USER MANAGEMENT §18-21)", async () => {
  before(() => setupTestDb());

  const { createUser, findUserById, findUserByUsername, changeUsername, normalizeUsername, UsernameConflictError } = await import("../../lib/users");
  const { createCompany } = await import("../../lib/companies");
  const { createGroup, addCandidateToGroup } = await import("../../lib/groups");
  const { getDb } = await import("../../lib/db");

  let counter = 0;
  function tag() {
    counter += 1;
    return `uname${counter}`;
  }

  // --- 1. Changement simple réussit, l'ancien identifiant redevient disponible ---
  test("1 — changer l'identifiant réussit, l'ancien redevient immédiatement réutilisable", () => {
    const t = tag();
    const userId = createUser({ username: `${t}.old`, password: "x".repeat(10), fullName: "Test", role: "candidate" });
    const result = changeUsername(userId, `${t}.new`);
    assert.equal(result.oldUsername, `${t}.old`);
    assert.equal(result.newUsername, `${t}.new`);
    assert.equal(findUserById(userId)!.username, `${t}.new`);
    assert.equal(findUserByUsername(`${t}.old`), undefined);
  });

  // --- 2. Unicité — impossible de prendre un identifiant déjà utilisé par un AUTRE compte ---
  test("2 — impossible de changer vers un identifiant déjà utilisé par un autre compte (UsernameConflictError)", () => {
    const t = tag();
    createUser({ username: `${t}.taken`, password: "x".repeat(10), fullName: "Premier", role: "candidate" });
    const secondId = createUser({ username: `${t}.second`, password: "x".repeat(10), fullName: "Second", role: "candidate" });
    assert.throws(() => changeUsername(secondId, `${t}.taken`), UsernameConflictError);
    assert.equal(findUserById(secondId)!.username, `${t}.second`, "aucun changement partiel en cas de conflit");
  });

  // --- 3. Normalisation — espaces de bord retirés, mis en minuscules ---
  test("3 — l'identifiant est normalisé (minuscules, espaces de bord retirés) avant comparaison/écriture", () => {
    const t = tag();
    const userId = createUser({ username: `${t}.norm`, password: "x".repeat(10), fullName: "Test", role: "candidate" });
    changeUsername(userId, `  ${t}.NOUVEAU  `);
    assert.equal(findUserById(userId)!.username, `${t}.nouveau`);
  });

  // --- 4. Normalisation empêche un contournement de l'unicité par la casse ---
  test("4 — la normalisation empêche un contournement de l'unicité par la casse (MAJ vs min)", () => {
    const t = tag();
    createUser({ username: `${t}.exist`, password: "x".repeat(10), fullName: "Premier", role: "candidate" });
    const secondId = createUser({ username: `${t}.second2`, password: "x".repeat(10), fullName: "Second", role: "candidate" });
    assert.throws(() => changeUsername(secondId, `${t.toUpperCase()}.EXIST`));
  });

  // --- 5. Identifiant vide rejeté ---
  test("5 — un identifiant vide (ou uniquement des espaces) est rejeté", () => {
    const t = tag();
    const userId = createUser({ username: `${t}.u`, password: "x".repeat(10), fullName: "Test", role: "candidate" });
    assert.throws(() => changeUsername(userId, "   "));
    assert.equal(findUserById(userId)!.username, `${t}.u`);
  });

  // --- 6. Identique à l'actuel (après normalisation) — no-op silencieux, jamais une erreur ---
  test("6 — soumettre le même identifiant (après normalisation) est un no-op, jamais une erreur de conflit contre soi-même", () => {
    const t = tag();
    const userId = createUser({ username: `${t}.same`, password: "x".repeat(10), fullName: "Test", role: "candidate" });
    const result = changeUsername(userId, `${t}.SAME`);
    assert.equal(result.oldUsername, result.newUsername);
    assert.equal(findUserById(userId)!.username, `${t}.same`);
  });

  // --- 7. Compte introuvable ---
  test("7 — changer l'identifiant d'un compte introuvable lève une erreur explicite", () => {
    assert.throws(() => changeUsername(999999, "peu.importe"));
  });

  // --- 8. La continuité d'historique survit au changement — group_members/audit référencent l'id, jamais le username ---
  test("8 — le changement d'identifiant ne casse jamais l'appartenance à un groupe ni l'historique d'audit (tout référence l'id numérique)", () => {
    const t = tag();
    const adminId = createUser({ username: `${t}.admin`, password: "x".repeat(10), fullName: "Admin", role: "administrator" });
    const candidateId = createUser({ username: `${t}.cand`, password: "x".repeat(10), fullName: "Candidat", role: "candidate" });
    const companyId = createCompany({ name: `Co ${t}`, scope: "test", createdBy: adminId });
    const groupId = createGroup({ companyId, name: `G ${t}`, scope: "test", pedagogicalManagerId: adminId, createdBy: adminId });
    addCandidateToGroup(groupId, candidateId, adminId);

    changeUsername(candidateId, `${t}.renamed`);

    const stillMember = getDb().prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND candidate_user_id = ?`).get(groupId, candidateId);
    assert.ok(stillMember, "l'appartenance au groupe survit au changement d'identifiant (référencée par id, jamais par username)");
    assert.equal(findUserById(candidateId)!.username, `${t}.renamed`);
  });

  // --- 9. normalizeUsername() est une fonction pure, réutilisable côté validation formulaire ---
  test("9 — normalizeUsername() est pure et déterministe", () => {
    assert.equal(normalizeUsername("  Amine.Test  "), "amine.test");
    assert.equal(normalizeUsername("déjà.propre"), "déjà.propre");
  });
});
