// Resend's public webhook must not buffer arbitrarily large unauthenticated
// requests before Svix signature verification. This cap applies to ACTUAL
// streamed bytes even when Content-Length is missing or inaccurate.
// Typical provider lifecycle events are much smaller than this 1 MiB limit.
export const MAX_RESEND_WEBHOOK_BODY_BYTES = 1024 * 1024;

export function hasSvixSignatureHeaders(headers: Headers): boolean {
  return Boolean(
    headers.get("svix-id")?.trim() &&
    headers.get("svix-timestamp")?.trim() &&
    headers.get("svix-signature")?.trim()
  );
}

export type BoundedWebhookBody =
  | { tooLarge: true }
  | { tooLarge: false; rawBody: string };

/**
 * Read the exact UTF-8 text used by the current Svix HMAC verifier without
 * letting untrusted request bodies grow without bound. A streaming decoder
 * preserves multibyte characters split across transport chunks.
 *
 * A claimed small Content-Length is never trusted: every chunk is counted.
 * Empty/malformed Content-Length falls back to the same stream byte cap.
 */
export async function readBoundedWebhookBody(request: Request): Promise<BoundedWebhookBody> {
  const advertised = request.headers.get("content-length");
  if (advertised !== null && /^\d+$/.test(advertised) &&
      Number(advertised) > MAX_RESEND_WEBHOOK_BODY_BYTES) {
    return { tooLarge: true };
  }

  if (!request.body) return { tooLarge: false, rawBody: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let rawBody = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESEND_WEBHOOK_BODY_BYTES) {
        // Prevent any further buffering; no HMAC or JSON parsing occurs.
        try { await reader.cancel(); } catch { /* Already closed stream. */ }
        return { tooLarge: true };
      }
      rawBody += decoder.decode(value, { stream: true });
    }
    rawBody += decoder.decode();
    return { tooLarge: false, rawBody };
  } finally {
    reader.releaseLock();
  }
}
