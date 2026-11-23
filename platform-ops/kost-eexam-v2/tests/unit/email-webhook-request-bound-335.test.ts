import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  hasSvixSignatureHeaders,
  MAX_RESEND_WEBHOOK_BODY_BYTES,
  readBoundedWebhookBody,
} from "../../lib/email/webhook-request";
import { verifyResendWebhookSignature } from "../../lib/email/webhook";

// Synthetic requests only. No provider network call, real secret or recipient.
const endpoint = "https://exam.example.invalid/api/webhooks/resend";
function streamRequest(chunks: Uint8Array[], headers?: HeadersInit, onCancel?: () => void): Request {
  let index = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) return controller.close();
      controller.enqueue(chunks[index++]!);
    },
    cancel() { onCancel?.(); },
  });
  return new Request(endpoint, {
    method: "POST",
    headers,
    body: stream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

test("#335: missing, incomplete, and whitespace-only Svix headers reject before body processing", () => {
  assert.equal(hasSvixSignatureHeaders(new Headers()), false);
  assert.equal(hasSvixSignatureHeaders(new Headers({ "svix-id": "msg-1" })), false);
  assert.equal(hasSvixSignatureHeaders(new Headers({
    "svix-id": "msg-1", "svix-timestamp": " ", "svix-signature": "v1,AAAA",
  })), false);
  assert.equal(hasSvixSignatureHeaders(new Headers({
    "svix-id": "msg-1", "svix-timestamp": "123", "svix-signature": "v1,AAAA",
  })), true);
});

test("#335: declared oversized Content-Length is rejected without buffering the body", async () => {
  const request = new Request(endpoint, {
    method: "POST",
    headers: { "content-length": String(MAX_RESEND_WEBHOOK_BODY_BYTES + 1) },
    body: "tiny",
  });
  assert.deepEqual(await readBoundedWebhookBody(request), { tooLarge: true });
});

test("#335: streaming over the body-byte bound is rejected and cancelled without HMAC parsing", async () => {
  let cancelled = false;
  const request = streamRequest(
    [new Uint8Array(MAX_RESEND_WEBHOOK_BODY_BYTES), new Uint8Array(1)],
    undefined,
    () => { cancelled = true; }
  );
  assert.deepEqual(await readBoundedWebhookBody(request), { tooLarge: true });
  assert.equal(cancelled, true);
});

test("#335: an exact-limit body succeeds and a missing Content-Length cannot bypass the bound", async () => {
  const rawBody = "x".repeat(MAX_RESEND_WEBHOOK_BODY_BYTES);
  const request = streamRequest([new TextEncoder().encode(rawBody)]);
  assert.deepEqual(await readBoundedWebhookBody(request), {
    tooLarge: false, invalidEncoding: false, rawBody,
  });
  const empty = new Request(endpoint, { method: "POST" });
  assert.deepEqual(await readBoundedWebhookBody(empty), {
    tooLarge: false, invalidEncoding: false, rawBody: "",
  });
});

test("#338: malformed and truncated UTF-8 are rejected instead of normalized", async () => {
  const malformed = streamRequest([new Uint8Array([0x7b, 0x22, 0x78, 0x22, 0x3a, 0xc3, 0x28, 0x7d])]);
  assert.deepEqual(await readBoundedWebhookBody(malformed), {
    tooLarge: false, invalidEncoding: true,
  });

  const truncated = streamRequest([new Uint8Array([0x7b, 0xc3])]);
  assert.deepEqual(await readBoundedWebhookBody(truncated), {
    tooLarge: false, invalidEncoding: true,
  });
});

test("#338: a leading UTF-8 BOM is preserved in HMAC input, not stripped", async () => {
  const canonicalBody = '{"type":"email.delivered","data":{"email_id":"msg-bom"},"created_at":"2026-11-23T12:00:00Z"}';
  const canonicalBytes = new TextEncoder().encode(canonicalBody);
  const wireBytes = new Uint8Array([0xef, 0xbb, 0xbf, ...canonicalBytes]);
  const request = streamRequest([wireBytes]);
  const bounded = await readBoundedWebhookBody(request);
  assert.equal(bounded.tooLarge, false);
  if (bounded.tooLarge || bounded.invalidEncoding) throw Error("Unexpected body decoding failure");

  assert.equal(bounded.rawBody.charCodeAt(0), 0xfeff);
  assert.deepEqual(new TextEncoder().encode(bounded.rawBody), wireBytes);

  const key = Buffer.alloc(24, 0x45);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const svixId = "synthetic-338-bom";
  const canonicalSignature = "v1," + createHmac("sha256", key)
    .update(`${svixId}.${timestamp}.${canonicalBody}`).digest("base64");

  // A signature for the BOM-free bytes must not authenticate the BOM-prefixed
  // wire body even though JSON text decoding might otherwise erase that BOM.
  assert.equal(verifyResendWebhookSignature({
    secret: "whsec_" + key.toString("base64"),
    svixId, svixTimestamp: timestamp, svixSignature: canonicalSignature,
    rawBody: bounded.rawBody,
  }).valid, false);
});

test("#335/#338: split multibyte UTF-8 bytes preserve the exact signed input", async () => {
  const rawBody = '{"type":"email.delivered","data":{"label":"été 🚀"}}';
  const bytes = new TextEncoder().encode(rawBody);
  // Single-byte transport chunks split both French accents and emoji.
  const request = streamRequest(Array.from(bytes, b => new Uint8Array([b])));
  const bounded = await readBoundedWebhookBody(request);
  assert.equal(bounded.tooLarge, false);
  if (bounded.tooLarge || bounded.invalidEncoding) throw Error("Unexpected body decoding failure");
  assert.equal(bounded.rawBody, rawBody);
  assert.deepEqual(new TextEncoder().encode(bounded.rawBody), bytes);

  const key = Buffer.alloc(24, 0x45);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const svixId = "synthetic-335";
  const signature = "v1," + createHmac("sha256", key)
    .update(`${svixId}.${timestamp}.${rawBody}`).digest("base64");
  assert.equal(verifyResendWebhookSignature({
    secret: "whsec_" + key.toString("base64"),
    svixId, svixTimestamp: timestamp, svixSignature: signature,
    rawBody: bounded.rawBody,
  }).valid, true);
});
