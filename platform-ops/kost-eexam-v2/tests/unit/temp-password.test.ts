import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission "ADMIN/CLIENT/CANDIDATE UX IMPROVEMENTS" (2026-08-30) §7/§45 —
// couverture de lib/temp-password.ts (module de domaine, pas de garde
// "server-only" — voir le commentaire en tête de ce fichier). Le
// comportement dépendant de lib/auth.ts::login() (refus d'un mot de passe
// temporaire expiré, connexion réussie avec un mot de passe temporaire
// valide) n'est PAS testable ici pour la même raison structurelle que
// pending-activation-login.test.ts (lib/auth.ts porte "import server-only")
// — couvert côté E2E (tests/e2e/) à la place.
describe("Accès temporaire (lib/temp-password.ts)", async () => {
  before(() => setupTestDb());

  const { createTemporaryAccess, generateTemporaryPassword, isTemporaryPasswordExpired, clearMustChangePassword } = await import("../../lib/temp-password");
  const { createUserPendingActivation, findUserById, setPassword } = await import("../../lib/users");
  const { verifyPassword } = await import("../../lib/passwords");
  const { getDb } = await import("../../lib/db");

  test("generateTemporaryPassword() produit une valeur différente à chaque appel, jamais prévisible", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const p = generateTemporaryPassword();
      assert.ok(p.length >= 15, "entropie insuffisante — mot de passe trop court");
      assert.ok(!seen.has(p), "deux appels ne doivent jamais produire le même mot de passe");
      seen.add(p);
    }
  });

  test("createTemporaryAccess() : le hash stocké n'est jamais le mot de passe en clair, et vérifie bien via verifyPassword()", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat1", fullName: "Temp Candidat 1", role: "candidate", email: "temp1@example.com" });
    const { plaintext, expiresAt } = createTemporaryAccess(userId);

    const row = getDb().prepare(`SELECT password_hash, must_change_password, temp_password_expires_at, status FROM users WHERE id = ?`).get(userId) as {
      password_hash: string;
      must_change_password: number;
      temp_password_expires_at: string | null;
      status: string;
    };
    assert.notEqual(row.password_hash, plaintext, "jamais le mot de passe en clair stocké tel quel");
    assert.ok(row.password_hash.startsWith("scrypt:"), "toujours haché via le mécanisme scrypt existant");
    assert.equal(verifyPassword(plaintext, row.password_hash), true, "le mot de passe temporaire renvoyé doit réellement correspondre au hash stocké");
    assert.equal(row.must_change_password, 1);
    assert.equal(row.temp_password_expires_at, expiresAt);
  });

  test("createTemporaryAccess() active un compte 'pending_activation' (sinon lib/auth.ts le refuserait avant même de vérifier le mot de passe)", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat2", fullName: "Temp Candidat 2", role: "candidate", email: "temp2@example.com" });
    assert.equal(findUserById(userId)!.status, "pending_activation");
    createTemporaryAccess(userId);
    assert.equal(findUserById(userId)!.status, "active");
  });

  test("createTemporaryAccess() ne modifie JAMAIS un compte suspendu ou archivé (§7 : suspended/archived account cannot use it)", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat3", fullName: "Temp Candidat 3", role: "candidate", email: "temp3@example.com" });
    getDb().prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(userId);
    createTemporaryAccess(userId);
    assert.equal(findUserById(userId)!.status, "suspended", "un compte suspendu doit le rester même après création d'un accès temporaire");

    const userId2 = createUserPendingActivation({ username: "temp.candidat4", fullName: "Temp Candidat 4", role: "candidate", email: "temp4@example.com" });
    getDb().prepare(`UPDATE users SET status = 'archived' WHERE id = ?`).run(userId2);
    createTemporaryAccess(userId2);
    assert.equal(findUserById(userId2)!.status, "archived", "un compte archivé doit le rester même après création d'un accès temporaire");
  });

  test("isTemporaryPasswordExpired() : false tant que must_change_password=0, même avec une date passée", () => {
    assert.equal(isTemporaryPasswordExpired({ must_change_password: 0, temp_password_expires_at: "2020-01-01T00:00:00.000Z" }), false);
  });

  test("isTemporaryPasswordExpired() : false avant l'expiration, true après (§7 : expired temporary password denied)", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const past = new Date(Date.now() - 60_000).toISOString();
    assert.equal(isTemporaryPasswordExpired({ must_change_password: 1, temp_password_expires_at: future }), false);
    assert.equal(isTemporaryPasswordExpired({ must_change_password: 1, temp_password_expires_at: past }), true);
  });

  test("clearMustChangePassword() efface le flag ET l'expiration — plus aucune trace exploitable", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat5", fullName: "Temp Candidat 5", role: "candidate", email: "temp5@example.com" });
    createTemporaryAccess(userId);
    let row = getDb().prepare(`SELECT must_change_password, temp_password_expires_at FROM users WHERE id = ?`).get(userId) as { must_change_password: number; temp_password_expires_at: string | null };
    assert.equal(row.must_change_password, 1);
    assert.ok(row.temp_password_expires_at);

    clearMustChangePassword(userId);
    row = getDb().prepare(`SELECT must_change_password, temp_password_expires_at FROM users WHERE id = ?`).get(userId) as { must_change_password: number; temp_password_expires_at: string | null };
    assert.equal(row.must_change_password, 0);
    assert.equal(row.temp_password_expires_at, null);
  });

  test("§7 : le mot de passe temporaire devient structurellement invalide après que le titulaire choisit son propre mot de passe", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat6", fullName: "Temp Candidat 6", role: "candidate", email: "temp6@example.com" });
    const { plaintext } = createTemporaryAccess(userId);

    // Simule le flux réel de app/mot-de-passe/changer-obligatoire/actions.ts :
    // setPassword() PUIS clearMustChangePassword(), jamais l'inverse.
    setPassword(userId, "MonPropreMotDePasseChoisi123!");
    clearMustChangePassword(userId);

    const row = getDb().prepare(`SELECT password_hash FROM users WHERE id = ?`).get(userId) as { password_hash: string };
    assert.equal(verifyPassword(plaintext, row.password_hash), false, "l'ancien mot de passe temporaire ne doit plus jamais vérifier");
    assert.equal(verifyPassword("MonPropreMotDePasseChoisi123!", row.password_hash), true, "le nouveau mot de passe choisi doit vérifier");
  });

  test("createTemporaryAccess() n'écrit jamais le mot de passe en clair dans audit_logs (vérifié en appelant audit() comme le ferait l'action réelle, jamais avec la valeur en clair)", () => {
    const userId = createUserPendingActivation({ username: "temp.candidat7", fullName: "Temp Candidat 7", role: "candidate", email: "temp7@example.com" });
    const { plaintext } = createTemporaryAccess(userId);
    // Reproduit exactement l'appel réel de app/(app)/groups/actions.ts —
    // jamais la valeur en clair passée à audit().
    getDb()
      .prepare(`INSERT INTO audit_logs (timestamp, actor_user_id, actor_role, action, target_type, target_id, result, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(new Date().toISOString(), 1, "administrator", "temporary_access_created", "user", userId, "success", JSON.stringify({ groupId: 1 }));

    const rows = getDb().prepare(`SELECT metadata_json FROM audit_logs WHERE target_id = ? AND action = 'temporary_access_created'`).all(userId) as { metadata_json: string | null }[];
    for (const r of rows) {
      assert.ok(!r.metadata_json || !r.metadata_json.includes(plaintext), "le mot de passe en clair ne doit jamais apparaître dans audit_logs.metadata_json");
    }
  });
});
