// Vérification de signature webhook Resend (mission email §37-38) —
// implémentation native du standard Svix (HMAC-SHA256), même principe que
// lib/mfa.ts (TOTP natif) : zéro dépendance externe pour un algorithme
// suffisamment simple à implémenter correctement avec node:crypto, plutôt
// que d'ajouter le paquet `svix` pour ce seul point d'entrée. Référence :
// https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
// (Resend signe ses webhooks avec Svix — mêmes en-têtes, même format de
// secret whsec_<base64>).
//
// Pas de garde `import "server-only"` ici (même justification que
// lib/mfa.ts/lib/passwords.ts) : le secret est reçu en PARAMÈTRE (jamais
// lu depuis process.env dans ce fichier — voir lib/email/config.ts pour
// ça), donc aucun risque réel de fuite même bundlé côté client par erreur.
// Reste un module de pure logique cryptographique, testable via node:test
// (mission §72 : VALID_WEBHOOK/INVALID_WEBHOOK/DUPLICATE_WEBHOOK).
import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_SECONDS = 5 * 60; // §37 — fenêtre anti-rejeu raisonnable

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

/** Ne fait JAMAIS confiance à une requête webhook non signée (§37 dernière
 * ligne). Compare en temps constant, jamais avec `===` sur la signature
 * elle-même (évite une attaque par mesure de temps sur la comparaison). */
export function verifyResendWebhookSignature(params: {
  secret: string;
  svixId: string | null;
  svixTimestamp: string | null;
  svixSignature: string | null;
  rawBody: string;
}): WebhookVerificationResult {
  const { secret, svixId, svixTimestamp, svixSignature, rawBody } = params;
  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, reason: "En-têtes svix-id/svix-timestamp/svix-signature manquants." };
  }

  const tsNum = Number(svixTimestamp);
  if (!Number.isFinite(tsNum)) return { valid: false, reason: "svix-timestamp invalide." };
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsNum) > TOLERANCE_SECONDS) {
    return { valid: false, reason: "svix-timestamp hors tolérance (rejeu potentiel ou horloge désynchronisée)." };
  }

  const secretRaw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const secretBytes = Buffer.from(secretRaw, "base64");
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected, "base64");

  // svix-signature peut contenir plusieurs signatures espacées
  // ("v1,sig1 v1,sig2") — rotation de secret côté Resend. Une seule doit
  // correspondre.
  const candidates = svixSignature.split(" ").map((part) => part.split(",")[1]).filter(Boolean) as string[];
  for (const candidate of candidates) {
    let candidateBuf: Buffer;
    try {
      candidateBuf = Buffer.from(candidate, "base64");
    } catch {
      continue;
    }
    if (candidateBuf.length === expectedBuf.length && timingSafeEqual(candidateBuf, expectedBuf)) {
      return { valid: true };
    }
  }
  return { valid: false, reason: "Signature invalide." };
}
