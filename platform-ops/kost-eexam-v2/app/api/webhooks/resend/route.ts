import { NextResponse } from "next/server";
import { verifyResendWebhookSignature, applyWebhookEvent } from "@/lib/email/webhook";
import { isResendWebhookSecretConfigured, getResendWebhookSecretOrThrow } from "@/lib/email/config";

// Webhook Resend (mission email §37-38) — reçoit les statuts de livraison
// réels (sent/delivered/delayed/bounced/complained/failed). JAMAIS de
// confiance sans vérification de signature (voir lib/email/webhook.ts,
// standard Svix natif). Idempotent par construction : une UPDATE SQL sur
// le même provider_message_id vers le même statut final n'a pas d'effet
// de bord différent si rejouée (§37 — "duplicate event: no duplicate side
// effects").
//
// Route PUBLIQUE (voir proxy.ts PUBLIC_PATHS) — Resend n'envoie jamais de
// cookie de session ; sa propre signature EST l'authentification, même
// principe que /api/attempts/sweep (jeton partagé) mais avec vérification
// cryptographique au lieu d'une simple égalité de chaîne.
export async function POST(request: Request) {
  if (!isResendWebhookSecretConfigured()) {
    // §38 — ne jamais fabriquer un secret : si absent, la route reste en
    // place (prête) mais refuse tout événement tant que le secret n'est
    // pas configuré, plutôt que d'accepter des requêtes non vérifiables.
    return NextResponse.json({ error: "RESEND_WEBHOOK_SECRET non configuré côté serveur." }, { status: 503 });
  }

  const rawBody = await request.text();
  const verification = verifyResendWebhookSignature({
    secret: getResendWebhookSecretOrThrow(),
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
    rawBody,
  });

  if (!verification.valid) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: { type?: string; data?: { email_id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const messageId = payload.data?.email_id;
  const eventType = payload.type;
  if (!messageId || !eventType) {
    return NextResponse.json({ error: "Champs data.email_id / type manquants." }, { status: 400 });
  }

  // Logique d'application déportée dans lib/email/webhook.ts::applyWebhookEvent()
  // — ce handler reste mince et testable (voir la justification en tête
  // de ce fichier lib).
  const result = applyWebhookEvent(eventType, messageId);
  if (!result.applied && result.reason === "unknown_message_id") {
    return NextResponse.json({ ok: true, ignored: true });
  }
  return NextResponse.json({ ok: true });
}
