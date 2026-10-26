// Resend's public webhook must not buffer arbitrarily large unauthenticated
// requests before Svix signature verification. This cap applies to ACTUAL
// streamed bytes even when Content-Length is missing or inaccurate.
// Typical provider lifecycle events are much smaller than this 1 MiB limit.
export const MAX_RESEND_WEBHOOK_BODY_BYTES = 1024 * 1024;

// Reject malformed wire bytes before any Svix HMAC comparison or JSON parsing.
export class InvalidWebhookEncodingError extends Error {
  constructor() {
    super("Resend webhook body is not valid UTF-8");
    this.name = "InvalidWebhookEncodingError";
  }
}

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
 * letting untrusted request bodies grow without bound. A strict streaming
 * decoder preserves split multibyte characters, rejects malformed sequences,
 * and does not silently remove a leading UTF-8 BOM. The HMAC therefore uses
 * the provider's original bytes, with no lossy text normalization.
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
  // Default TextDecoder strips a leading BOM and substitutes U+FFFD for
  // invalid bytes. Either would authenticate bytes different from the wire.
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
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
      try {
        rawBody += decoder.decode(value, { stream: true });
      } catch {
        throw new InvalidWebhookEncodingError();
      }
    }
    try {
      rawBody += decoder.decode();
    } catch {
      throw new InvalidWebhookEncodingError();
    }
    return { tooLarge: false, rawBody };
  } catch (error) {
    // Do not continue consuming malformed bytes or acknowledge read errors.
    try { await reader.cancel(); } catch { /* Already closed. */ }
    throw error;
  } finally {
    reader.releaseLock();
  }
}
