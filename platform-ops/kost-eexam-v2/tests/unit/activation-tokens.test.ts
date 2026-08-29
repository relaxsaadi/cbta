import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

// Mission email §8-9/§61 — jetons d'activation/réinitialisation : usage
// unique, limités dans le temps, jamais stockés en clair, un jeton
// consommé ne redevient jamais valide.
describe("Jetons d'activation (lib/activation-tokens.ts)", async () => {
  before(() => setupTestDb());

  const { createActivationToken, verifyActivationToken, consumeActivationToken, invalidatePendingTokens } = await import("../../lib/activation-tokens");
  const { getDb } = await import("../../lib/db");

  function makeUser(username: string): number {
    getDb().prepare(`INSERT INTO users (username, password_hash, full_name, status) VALUES (?, 'h', 'Test', 'pending_activation')`).run(username);
    return (getDb().prepare(`SELECT id FROM users WHERE username = ?`).get(username) as { id: number }).id;
  }

  test("un jeton fraîchement créé est vérifiable et n'est jamais stocké en clair en base", () => {
    const userId = makeUser("u-token-1");
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    const row = verifyActivationToken(token, "account_setup");
    assert.ok(row, "le jeton en clair doit être vérifiable");
    assert.equal(row!.user_id, userId);

    const stored = getDb().prepare(`SELECT token_hash FROM activation_tokens WHERE user_id = ?`).get(userId) as { token_hash: string };
    assert.notEqual(stored.token_hash, token, "jamais le jeton en clair en base — uniquement son hash");
  });

  test("un jeton consommé ne redevient jamais valide (usage unique)", () => {
    const userId = makeUser("u-token-2");
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    const row = verifyActivationToken(token, "account_setup");
    assert.ok(row);
    consumeActivationToken(row!.id);

    const afterConsume = verifyActivationToken(token, "account_setup");
    assert.equal(afterConsume, null, "un jeton consommé doit être refusé");
  });

  test("un jeton expiré est refusé", () => {
    const userId = makeUser("u-token-3");
    const { token } = createActivationToken({ userId, purpose: "password_reset" });
    // Force l'expiration directement en base (simule le passage du temps).
    getDb().prepare(`UPDATE activation_tokens SET expires_at = '2000-01-01T00:00:00.000Z' WHERE user_id = ?`).run(userId);
    const row = verifyActivationToken(token, "password_reset");
    assert.equal(row, null, "un jeton expiré doit être refusé");
  });

  test("un jeton d'un mauvais 'purpose' est refusé (account_setup != password_reset)", () => {
    const userId = makeUser("u-token-4");
    const { token } = createActivationToken({ userId, purpose: "account_setup" });
    const wrongPurpose = verifyActivationToken(token, "password_reset");
    assert.equal(wrongPurpose, null);
  });

  test("invalidatePendingTokens invalide les jetons non consommés existants avant d'en émettre un nouveau (§41 renvoi)", () => {
    const userId = makeUser("u-token-5");
    const { token: firstToken } = createActivationToken({ userId, purpose: "account_setup" });
    invalidatePendingTokens(userId, "account_setup");
    const afterInvalidate = verifyActivationToken(firstToken, "account_setup");
    assert.equal(afterInvalidate, null, "l'ancien jeton doit être invalidé par le renvoi");
  });

  test("un jeton totalement inventé (jamais émis) est toujours refusé", () => {
    const fake = "0".repeat(64);
    const row = verifyActivationToken(fake, "account_setup");
    assert.equal(row, null);
  });
});
