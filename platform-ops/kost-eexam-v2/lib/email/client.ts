// Client Resend — instance unique, créée paresseusement (jamais au chargement
// du module, pour que l'app démarre même sans RESEND_API_KEY configuré —
// seul un envoi réel en mode "send"/"allowlist" en a besoin). La clé n'est
// JAMAIS conservée dans une variable de module autre que celle interne du
// SDK Resend lui-même.
// Pas de garde "server-only" — voir lib/email/audit.ts pour la
// justification (module de domaine, doit rester testable via node:test).
// Même précédent que lib/passwords.ts (manipule aussi une matière
// sensible sans ce garde) : la clé elle-même n'est jamais exposée par ce
// module (lue une seule fois via getResendApiKeyOrThrow(), jamais
// réexportée), donc aucun risque réel même en cas d'import accidentel.
import { Resend } from "resend";
import { getResendApiKeyOrThrow } from "./config";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (client) return client;
  client = new Resend(getResendApiKeyOrThrow());
  return client;
}
