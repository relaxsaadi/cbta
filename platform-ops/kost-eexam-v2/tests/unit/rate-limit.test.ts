import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkLoginRateLimit, recordLoginFailure, resetLoginRateLimit } from "../../lib/rate-limit";

// Sécurité — trouvé absent lors de la revue sécurité de la phase staging :
// rien n'empêchait un nombre illimité de tentatives de connexion. Voir
// lib/rate-limit.ts pour les limites assumées (mémoire de processus, pas de
// magasin partagé multi-instance).
//
// L'intégration réelle dans login() (lib/auth.ts, gardé par
// `import "server-only"`, donc non testable directement sous node:test —
// voir le commentaire de lib/db.ts pour la même contrainte) est vérifiée
// bout-en-bout côté serveur réel de staging, pas ici — voir
// tests/staging/08-security-checks.spec.ts.
describe("Anti-force-brute — limiteur autonome", () => {
  test("bloque après 5 échecs et se réinitialise sur reset", () => {
    const key = "203.0.113.1:test.user";

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

  test("deux clés différentes (IP+utilisateur) ont des compteurs indépendants", () => {
    const keyA = "203.0.113.2:alice";
    const keyB = "203.0.113.2:bob"; // même IP, utilisateur différent — pas de blocage collectif du NAT/bureau

    for (let i = 0; i < 5; i++) recordLoginFailure(keyA);
    assert.equal(checkLoginRateLimit(keyA).allowed, false);
    assert.equal(checkLoginRateLimit(keyB).allowed, true, "bob ne doit pas être bloqué par les échecs d'alice");
  });
});
