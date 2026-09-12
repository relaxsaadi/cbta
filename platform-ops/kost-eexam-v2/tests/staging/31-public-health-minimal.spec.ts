import { test, expect } from "@playwright/test";

// Security hardening regression: /api/health is intentionally public for
// external monitoring, so it must expose operational health only. Presence
// of email-provider configuration belongs to authenticated admin surfaces,
// not to an unauthenticated reconnaissance endpoint.
test("public health response does not expose email configuration metadata", async ({ request }) => {
  const response = await request.get("/api/health");
  expect([200, 503]).toContain(response.status());

  const body = (await response.json()) as Record<string, unknown>;
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("db");
  expect(body).toHaveProperty("backup");
  expect(body).toHaveProperty("restoreTest");

  expect(body).not.toHaveProperty("email");
  const serialized = JSON.stringify(body);
  expect(serialized).not.toContain("resendApiKeyConfigured");
  expect(serialized).not.toContain("resendWebhookSecretConfigured");
  expect(serialized).not.toContain("allowedRecipientsCount");
  expect(serialized).not.toContain("adminAlertRecipientConfigured");
});
