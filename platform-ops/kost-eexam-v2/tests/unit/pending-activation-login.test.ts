import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission email §8 CRITIQUE — un compte 'pending_activation' est créé avec
// un mot de passe totalement inconnu (aucune chaîne devinable ne doit
// jamais le vérifier), et passe à 'active' avec le VRAI mot de passe
// choisi par le candidat lui-même une fois le flux d'activation complété.
//
// N'importe PAS lib/auth.ts ici (porte "import server-only", volontaire —
// ce module touche sessions/audit et ne doit jamais risquer un bundle
// client ; voir lib/mfa.ts pour l'exception inverse sur les modules de
// pure logique). Le comportement "login() refuse un compte
// pending_activation avec un message d'activation" est donc couvert côté
// E2E (tests/staging/), pas ici — cohérent avec le reste de cette suite,
// où lib/auth.ts n'a jamais eu de test unitaire direct pour la même
// raison structurelle.
describe("Cycle de vie pending_activation -> active (lib/users.ts)", async () => {
  before(() => setupTestDb());

  const { createUserPendingActivation, setPasswordAndActivate, findUserByUsername } = await import("../../lib/users");
  const { verifyPassword } = await import("../../lib/passwords");
  const { getDb } = await import("../../lib/db");

  test("createUserPendingActivation crée un compte 'pending_activation' avec un password_hash qu'aucun mot de passe deviné ne peut vérifier", () => {
    createUserPendingActivation({ username: "candidat.pending", fullName: "Candidat Pending", role: "candidate", email: "pending@example.com" });
    const user = findUserByUsername("candidat.pending");
    assert.ok(user);
    assert.equal(user!.status, "pending_activation");

    // Aucune des tentatives "évidentes" ne doit jamais correspondre — le
    // hash porte une valeur aléatoire de 32 octets que personne ne connaît.
    for (const guess of ["", "password", "123456", user!.username, "candidat.pending", "azerty123"]) {
      assert.equal(verifyPassword(guess, user!.password_hash), false, `le mot de passe deviné "${guess}" ne doit jamais vérifier`);
    }
  });

  test("setPasswordAndActivate fait passer le compte à 'active' ET le mot de passe choisi par le candidat vérifie désormais correctement", () => {
    const userId = createUserPendingActivation({ username: "candidat.pending2", fullName: "Candidat Pending 2", role: "candidate", email: "pending2@example.com" });
    const before = getDb().prepare(`SELECT status, password_hash FROM users WHERE id = ?`).get(userId) as { status: string; password_hash: string };
    assert.equal(before.status, "pending_activation");

    setPasswordAndActivate(userId, "MonNouveauMotDePasse123!");

    const after = getDb().prepare(`SELECT status, password_hash FROM users WHERE id = ?`).get(userId) as { status: string; password_hash: string };
    assert.equal(after.status, "active");
    assert.notEqual(after.password_hash, before.password_hash, "le hash doit avoir changé");
    assert.equal(verifyPassword("MonNouveauMotDePasse123!", after.password_hash), true, "le mot de passe choisi par le candidat doit désormais vérifier");
    assert.equal(verifyPassword("un-autre-mot-de-passe", after.password_hash), false);
  });

  test("deux comptes pending_activation distincts reçoivent des hachages différents (jamais un secret partagé/prévisible)", () => {
    createUserPendingActivation({ username: "candidat.pendingA", fullName: "A", role: "candidate", email: "a@example.com" });
    createUserPendingActivation({ username: "candidat.pendingB", fullName: "B", role: "candidate", email: "b@example.com" });
    const a = findUserByUsername("candidat.pendingA")!;
    const b = findUserByUsername("candidat.pendingB")!;
    assert.notEqual(a.password_hash, b.password_hash);
  });
});
