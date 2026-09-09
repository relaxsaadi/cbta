import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Resend — idempotence fournisseur réelle", async () => {
  const originalFetch = globalThis.fetch;

  before(() => {
    process.env.EMAIL_MODE = "send";
    process.env.RESEND_API_KEY = "re_test_provider_idempotency";
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
    setupTestDb();
  });

  after(() => {
    globalThis.fetch = originalFetch;
    delete process.env.EMAIL_MODE;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_ALLOWED_RECIPIENTS;
  });

  test("la clé durable est transmise comme option HTTP Resend, jamais comme header du message", async () => {
    const key = "provider-idempotency-contract-211";
    let providerHeader: string | null = null;
    let messagePayload: Record<string, unknown> = {};

    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      providerHeader = headers.get("Idempotency-Key");
      messagePayload = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: "email_provider_211" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof globalThis.fetch;

    const { queueAndSendEmail } = await import("../../lib/email/send");
    const result = await queueAndSendEmail({
      eventType: "EXAM_ASSIGNED",
      idempotencyKey: key,
      recipientEmail: "provider-idempotency@example.com",
      userId: null,
      tenant: { companyId: null, companyName: null },
      sender: { name: "KOST E-EXAM", address: "exam@kostacademy.com" },
      rendered: {
        subject: "Provider idempotency test",
        html: "<p>test</p>",
        text: "test",
        templateId: "test",
        templateVersion: "v1",
      },
    });

    assert.equal(result.status, "SENT");
    assert.equal(providerHeader, key, "Resend doit recevoir Idempotency-Key au niveau de la requête HTTP");

    const customMessageHeaders = messagePayload.headers as Record<string, unknown> | undefined;
    assert.equal(
      customMessageHeaders?.["Idempotency-Key"],
      undefined,
      "la clé d'idempotence ne doit jamais être injectée comme header personnalisé du message"
    );
  });
});
