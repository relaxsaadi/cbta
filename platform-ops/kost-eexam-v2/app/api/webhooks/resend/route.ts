import { NextResponse } from "next/server";
import {
  verifyResendWebhookSignature,
  applyWebhookEvent,
  normalizeProviderEventTimestamp,
} from "@/lib/email/webhook";
import { isResendWebhookSecretConfigured, getResendWebhookSecretOrThrow } from "@/lib/email/config";
import { hasSvixSignatureHeaders, readBoundedWebhookBody } from "@/lib/email/webhook-request";

// Route publique authentifiée exclusivement par signature Svix/Resend.
// Depuis #100, le svix-id signé sert aussi d'identité idempotente durable
// de l'événement et payload.created_at devient l'horodatage provider de
// référence. Aucun événement de cycle de vie n'est appliqué sans ces deux
// preuves valides.
export async function POST(request: Request) {
  if (!isResendWebhookSecretConfigured()) {
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET non configuré côté serveur." }, { status: 503 });
  }

  // Reject unsigned calls before reading even one byte of their body.
  // The shared verifier below still performs the actual HMAC/time checks.
  if (!hasSvixSignatureHeaders(request.headers)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  // Request.text() alone is unbounded on the public Route Handler. Enforce
  // a real streamed-byte ceiling before cryptographic/JSON processing.
  const bounded = await readBoundedWebhookBody(request);
  if (bounded.tooLarge) {
    return NextResponse.json({ error: "Corps webhook trop volumineux." }, { status: 413 });
  }
  const rawBody = bounded.rawBody;
  const svixId = request.headers.get("svix-id");
  const verification = verifyResendWebhookSignature({
    secret: getResendWebhookSecretOrThrow(),
    svixId,
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
    rawBody,
  });

  if (!verification.valid) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: { type?: string; created_at?: string; data?: { email_id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const messageId = payload.data?.email_id;
  const eventType = payload.type;
  const providerCreatedAt = normalizeProviderEventTimestamp(payload.created_at);
  if (!messageId || !eventType || !svixId || !providerCreatedAt) {
    return NextResponse.json(
      { error: "Champs data.email_id / type / created_at ou identité svix-id manquants ou invalides." },
      { status: 400 }
    );
  }

  let result: ReturnType<typeof applyWebhookEvent>;
  try {
    result = applyWebhookEvent(eventType, messageId, {
      providerEventId: svixId,
      providerCreatedAt,
    });
  } catch {
    // Never ACK signed evidence that SQLite could not retain. The
    // provider may retry; do not leak internal DB diagnostics or tokens.
    return NextResponse.json({ error: "Événement fournisseur non conservé." }, { status: 503 });
  }
  if (!result.applied && result.reason === "deferred_unmatched") {
    // Durable signed inbox, no invented notification match or resend.
    return NextResponse.json({ ok: true, deferred: true });
  }
  if (!result.applied && result.reason === "unknown_message_id") {
    // Message inconnu de cette plateforme : accusé réception sans retry
    // infini côté fournisseur, mais aucune donnée locale n'est inventée.
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!result.applied && result.reason === "invalid_event_evidence") {
    return NextResponse.json({ error: "Preuve d'événement fournisseur invalide." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
