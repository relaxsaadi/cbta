// Configuration email — lecture centralisée des variables d'environnement
// (mission email §6/§55-56). Même convention que le reste du dépôt (lecture
// inline avec erreur explicite à la première utilisation, voir
// lib/session.ts::getSessionOptions) — mais centralisée ICI plutôt que
// dispersée, car §4 de la mission demande explicitement UN SEUL point de
// vérité pour l'expéditeur/les URLs/le mode, pas des lectures éparpillées
// dans chaque route.
//
// RÈGLE ABSOLUE (§0/§57) : ce module ne doit JAMAIS logger, retourner ou
// exposer la valeur de RESEND_API_KEY / RESEND_WEBHOOK_SECRET — seules des
// fonctions de PRÉSENCE (booléen) existent pour ces deux-là.

export type EmailMode = "log" | "allowlist" | "send";

export interface EmailSenderIdentity {
  name: string;
  address: string;
}

function readOptional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

/** §56 — ne JAMAIS dumper process.env ; uniquement CONFIGURED/MISSING. */
export function isResendApiKeyConfigured(): boolean {
  return Boolean(readOptional("RESEND_API_KEY"));
}

export function isResendWebhookSecretConfigured(): boolean {
  return Boolean(readOptional("RESEND_WEBHOOK_SECRET"));
}

/** Jamais exportée/loggée ailleurs — lue une seule fois ici, transmise
 * directement au SDK Resend (lib/email/client.ts) sans jamais transiter par
 * une variable intermédiaire journalisable. */
export function getResendApiKeyOrThrow(): string {
  const key = readOptional("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY manquant côté serveur — voir docs/KOST_EEXAM_V2_RESEND_OPERATIONS.md.");
  return key;
}

export function getResendWebhookSecretOrThrow(): string {
  const secret = readOptional("RESEND_WEBHOOK_SECRET");
  if (!secret) throw new Error("RESEND_WEBHOOK_SECRET manquant côté serveur — la vérification de signature webhook est obligatoire.");
  return secret;
}

/** §53 — sécurité de staging : "log" n'envoie jamais rien (écrit
 * uniquement notification_log), "allowlist" n'envoie réellement qu'aux
 * adresses listées dans EMAIL_ALLOWED_RECIPIENTS (les autres sont
 * SUPPRESSED), "send" envoie normalement (réservé production). Défaut le
 * PLUS sûr si non configuré : "log" — jamais un envoi réel par accident. */
export function getEmailMode(): EmailMode {
  const raw = readOptional("EMAIL_MODE");
  if (raw === "send" || raw === "allowlist" || raw === "log") return raw;
  return "log";
}

export function getAllowedRecipients(): string[] {
  const raw = readOptional("EMAIL_ALLOWED_RECIPIENTS");
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getDefaultTimezone(): string {
  return readOptional("EMAIL_DEFAULT_TIMEZONE") ?? "Europe/Paris";
}

export function getAppBaseUrl(): string {
  const url = readOptional("APP_BASE_URL");
  if (!url) throw new Error("APP_BASE_URL manquant côté serveur — nécessaire pour construire les liens d'email (activation, examen, résultat...).");
  return url.replace(/\/$/, "");
}

export function getAdminAlertRecipient(): string | undefined {
  return readOptional("ADMIN_ALERT_RECIPIENT");
}

// §7 — identités d'expéditeur pilotées par l'environnement, jamais codées
// en dur dans le code métier (chaque événement choisit LAQUELLE de ces 4
// identités via lib/email/events.ts, jamais une adresse littérale).
//
// Bug réel trouvé au premier envoi réel (mission de test de livraison
// contrôlée, 2026-08-29) : `.env.example` documente EMAIL_FROM_EXAM (et
// les 3 autres) au format complet `"Nom <email>"`, et c'est exactement ce
// qui a été déployé sur staging — mais getSenderExam() ne prenait que la
// valeur brute comme `address` puis send.ts la réenveloppait une seconde
// fois (`${name} <${address}>`), produisant un `from` invalide à deux
// niveaux ("KOST E-EXAM <KOST E-EXAM <exam@kostacademy.com>>"), rejeté
// par Resend (validation_error). extractEmailAddress() ci-dessous accepte
// les deux formats (adresse nue OU "Nom <email>") — jamais un
// réenveloppement, quel que soit ce que contient la variable.
function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1]! : raw).trim();
}

export function getSenderExam(): EmailSenderIdentity {
  return { name: "KOST E-EXAM", address: extractEmailAddress(readOptional("EMAIL_FROM_EXAM") ?? "exam@kostacademy.com") };
}
export function getSenderNotifications(): EmailSenderIdentity {
  return { name: "KOST Academy", address: extractEmailAddress(readOptional("EMAIL_FROM_NOTIFICATIONS") ?? "notifications@kostacademy.com") };
}
export function getSenderSecurity(): EmailSenderIdentity {
  return { name: "KOST Security", address: extractEmailAddress(readOptional("EMAIL_FROM_SECURITY") ?? "security@kostacademy.com") };
}
export function getSenderSupport(): EmailSenderIdentity {
  return { name: "KOST Support", address: extractEmailAddress(readOptional("EMAIL_FROM_SUPPORT") ?? "support@kostacademy.com") };
}
export function getReplyTo(): string | undefined {
  return readOptional("EMAIL_REPLY_TO");
}

/** §56 — rapport de configuration sûr (présence uniquement), utilisé par
 * /api/health et le centre d'aperçu admin. Ne JAMAIS étendre cette
 * fonction pour inclure une valeur de secret. */
export function safeEmailConfigReport(): {
  resendApiKeyConfigured: boolean;
  resendWebhookSecretConfigured: boolean;
  emailMode: EmailMode;
  allowedRecipientsCount: number;
  appBaseUrlConfigured: boolean;
  adminAlertRecipientConfigured: boolean;
} {
  return {
    resendApiKeyConfigured: isResendApiKeyConfigured(),
    resendWebhookSecretConfigured: isResendWebhookSecretConfigured(),
    emailMode: getEmailMode(),
    allowedRecipientsCount: getAllowedRecipients().length,
    appBaseUrlConfigured: Boolean(readOptional("APP_BASE_URL")),
    adminAlertRecipientConfigured: Boolean(readOptional("ADMIN_ALERT_RECIPIENT")),
  };
}
