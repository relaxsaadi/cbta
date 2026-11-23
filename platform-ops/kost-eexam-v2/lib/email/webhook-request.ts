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
  | { tooLarge: false; invalidEncoding: true }
  | { tooLarge: false; invalidEncoding: false; rawBody: string };

/**
 * Read the exact UTF-8 text used by the current Svix HMAC verifier without
 * letting untrusted request bodies grow without bound.
 *
 * Fatal decoding rejects malformed UTF-8 instead of replacing invalid bytes.
 * ignoreBOM=true preserves a leading UTF-8 BOM in rawBody, so the string
 * re-encodes to the same bytes that arrived on the wire before HMAC checking.
 * A claimed small Content-Length is never trusted: every chunk is counted.
 */
export async function readBoundedWebhookBody(request: Request): Promise<BoundedWebhookBody> {
  const advertised = request.headers.get("content-length");
  if (advertised !== null && /^\d+$/.test(advertised) &&
      Number(advertised) > MAX_RESEND_WEBHOOK_BODY_BYTES) {
    return { tooLarge: true };
  }

  if (!request.body) return { tooLarge: false, invalidEncoding: false, rawBody: "" };

  const reader = request.body.getReader();
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
        // Stop consuming malformed input. Never normalize it into a different
        // HMAC input or pass it to provider-event processing.
        try { await reader.cancel(); } catch { /* Already closed stream. */ }
        return { tooLarge: false, invalidEncoding: true };
      }
    }

    try {
      // Flush catches a truncated multibyte sequence at end-of-stream.
      rawBody += decoder.decode();
    } catch {
      return { tooLarge: false, invalidEncoding: true };
    }

    return { tooLarge: false, invalidEncoding: false, rawBody };
  } finally {
    reader.releaseLock();
  }
}
