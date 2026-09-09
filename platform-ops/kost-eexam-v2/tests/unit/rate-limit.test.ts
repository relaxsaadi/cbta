import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildLoginRateLimitKey,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
} from "../../lib/rate-limit";

// Sécurité — trouvé absent lors de la revue sécurité de la phase staging :
// rien n'empêchait un nombre illimité de tentatives de connexion. Voir
// lib/rate-limit.ts pour les limites assumées (mémoire de processus, pas de
// magasin partagé multi-instance).
//
// Les buckets mot de passe et MFA sont explicitement séparés : un succès du
// premier facteur ne peut donc jamais effacer l'historique d'échecs du
// second. Le parcours auth réel est aussi couvert par l'E2E dédié #47.
describe("Anti-force-brute — limiteur autonome", () => {
  test("bloque après 5 échecs et se réinitialise sur reset", () => {
    const key = "203.0.113.1:test.user:password";

    for (let i = 0; i < 5; i++) {
      assert.equal(checkLoginRateLimit(key).allowed, true, `tentative ${i + 1}/5 devrait encore être autorisée`);
      recordLoginFailure(key);
    }
    const blocked = checkLoginRateLimit(key);
    assert.equal(blocked.allowed, false, "la 6e tentative doit être bloquée");
    assert.ok(blocked.retryAfterSeconds > 0);

    resetLoginRateLimit(key);
    assert.equal(checkLoginRateLimit(key).allowed, true, "après reset (ex. connexion réussie), autorisé de nouveau");
  });

  test("deux utilisateurs sur la même IP ont des compteurs indépendants", () => {
    const keyA = buildLoginRateLimitKey("203.0.113.2", "alice", "password");
    const keyB = buildLoginRateLimitKey("203.0.113.2", "bob", "password");

    for (let i = 0; i < 5; i++) recordLoginFailure(keyA);
    assert.equal(checkLoginRateLimit(keyA).allowed, false);
    assert.equal(checkLoginRateLimit(keyB).allowed, true, "bob ne doit pas être bloqué par les échecs d'alice");
  });

  test("mot de passe et MFA ont des buckets indépendants pour le même IP+utilisateur", () => {
    const passwordKey = buildLoginRateLimitKey("203.0.113.3", "alice", "password");
    const mfaKey = buildLoginRateLimitKey("203.0.113.3", "alice", "mfa");
    assert.notEqual(passwordKey, mfaKey);

    for (let i = 0; i < 5; i++) recordLoginFailure(mfaKey);
    assert.equal(checkLoginRateLimit(mfaKey).allowed, false);
    assert.equal(checkLoginRateLimit(passwordKey).allowed, true);

    // Un reset du facteur 1 ne doit pas ouvrir de nouvelle tentative MFA.
    resetLoginRateLimit(passwordKey);
    assert.equal(checkLoginRateLimit(mfaKey).allowed, false);

    resetLoginRateLimit(mfaKey);
    assert.equal(checkLoginRateLimit(mfaKey).allowed, true);
  });
});
