import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyResendWebhookSignature } from "../../lib/email/webhook";

// Entirely synthetic; no real webhook secret, network call or recipient.
const id = "synthetic-svix-id-333";
const body = '{"type":"email.delivered","data":{"email_id":"synthetic-333"}}';
function signedHeader(key: Buffer, timestamp: string) {
  return "v1," + createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
}
function verify(secret: string, header: string, timestamp: string) {
  return verifyResendWebhookSignature({
    secret, svixId: id, svixTimestamp: timestamp, svixSignature: header, rawBody: body,
  });
}

test("#333: malformed nonempty whsec configuration MUST NOT authenticate the empty-HMAC-key signature", () => {
  const ts = String(Math.floor(Date.now() / 1000));
  // Buffer.from("!!!!", "base64") is an empty Buffer in Node.
  const forgedFromEmptyKey = signedHeader(Buffer.alloc(0), ts);
  assert.equal(verify("whsec_!!!!", forgedFromEmptyKey, ts).valid, false);
  assert.equal(verify("whsec_", forgedFromEmptyKey, ts).valid, false);
  assert.equal(verify("!!!!", forgedFromEmptyKey, ts).valid, false);
});

test("#333: trivial, noncanonical, malformed, and short signing keys are rejected", () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const tiny = Buffer.from("abc");
  const signedWithTiny = signedHeader(tiny, ts);
  assert.equal(verify("whsec_YWJj", signedWithTiny, ts).valid, false);
  assert.equal(verify("whsec_YWJj!!!", signedWithTiny, ts).valid, false);
  assert.equal(verify("whsec_===", signedWithTiny, ts).valid, false);
  // 16 bytes of synthetic material is the supported minimum.
  const shortKey = Buffer.alloc(15, 1);
  assert.equal(verify("whsec_" + shortKey.toString("base64"), signedHeader(shortKey, ts), ts).valid, false);
});

test("#333: provider-format valid 24-byte Base64 key, padded/unpadded and raw compatible", () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const actual = Buffer.alloc(24, 0x5a);
  const encoded = actual.toString("base64");
  const signature = signedHeader(actual, ts);
  assert.equal(verify("whsec_" + encoded, signature, ts).valid, true);
  assert.equal(verify(encoded, signature, ts).valid, true);
  assert.equal(verify("whsec_" + encoded.replace(/=+$/, ""), signature, ts).valid, true);
});

test("#333: only v1 signatures; rotation list, malformed signature and stale timestamp fail safely", () => {
  const ts = String(Math.floor(Date.now() / 1000));
  const key = Buffer.alloc(24, 0x32);
  const encoded = "whsec_" + key.toString("base64");
  const sig = signedHeader(key, ts);
  assert.equal(verify(encoded, "v0," + sig.slice(3), ts).valid, false);
  assert.equal(verify(encoded, "v1,!!!!", ts).valid, false);
  assert.equal(verify(encoded, "v1,AAAA " + sig, ts).valid, true);
  assert.equal(verify(encoded, "v1,AAAA\t" + sig, ts).valid, true);
  const old = String(Number(ts) - 900);
  assert.equal(verify(encoded, signedHeader(key, old), old).valid, false);
});
