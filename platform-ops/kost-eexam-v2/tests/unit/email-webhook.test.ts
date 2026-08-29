import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

// Mission email §37-38/§67 — vérification de signature webhook Resend
// (standard Svix natif, lib/email/webhook.ts). Un secret synthétique
// suffit pour tester l'algorithme lui-même — aucune dépendance au vrai
// RESEND_WEBHOOK_SECRET.
describe("Vérification de signature webhook Resend (Svix natif)", async () => {
  const { verifyResendWebhookSignature } = await import("../../lib/email/webhook");

  function sign(secretB64: string, id: string, timestamp: string, body: string): string {
    const secretBytes = Buffer.from(secretB64, "base64");
    const signedContent = `${id}.${timestamp}.${body}`;
    const sig = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
    return `v1,${sig}`;
  }

  const SECRET = `whsec_${Buffer.from("test-secret-material-32-bytes!!").toString("base64")}`;
  const SECRET_B64 = SECRET.slice("whsec_".length);

  test("une signature valide, fraîche, est acceptée", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, timestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, true);
  });

  test("une signature invalide (mauvais secret) est rejetée", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const wrongSecretB64 = Buffer.from("completely-different-secret!!!!").toString("base64");
    const signature = sign(wrongSecretB64, id, timestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, false);
  });

  test("un corps modifié après signature est rejeté (intégrité)", () => {
    const id = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, timestamp, body);
    const tamperedBody = JSON.stringify({ type: "email.delivered", data: { email_id: "DIFFERENT" } });
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: timestamp, svixSignature: signature, rawBody: tamperedBody });
    assert.equal(result.valid, false);
  });

  test("un timestamp trop ancien (rejeu) est rejeté même avec une signature par ailleurs correcte", () => {
    const id = "msg_123";
    const oldTimestamp = String(Math.floor(Date.now() / 1000) - 3600); // 1h dans le passé
    const body = JSON.stringify({ type: "email.delivered", data: { email_id: "abc" } });
    const signature = sign(SECRET_B64, id, oldTimestamp, body);
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: id, svixTimestamp: oldTimestamp, svixSignature: signature, rawBody: body });
    assert.equal(result.valid, false);
  });

  test("en-têtes manquants sont rejetés proprement (jamais une exception non gérée)", () => {
    const result = verifyResendWebhookSignature({ secret: SECRET, svixId: null, svixTimestamp: null, svixSignature: null, rawBody: "{}" });
    assert.equal(result.valid, false);
  });
});
