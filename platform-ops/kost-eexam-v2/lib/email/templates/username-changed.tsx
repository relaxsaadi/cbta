// Événement USERNAME_CHANGED (mission "COMPLETE USER MANAGEMENT",
// 2026-08-29, §21) — WIRED via lib/users.ts::changeUsername(). Notification
// de sécurité obligatoire (voir MANDATORY_EVENT_TYPES) : un changement
// d'identifiant de connexion doit toujours être confirmé, comme un
// changement de mot de passe. JAMAIS le mot de passe ici.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "username-changed";
export const TEMPLATE_VERSION = "v1";

export function usernameChangedSubject(): string {
  return "Votre identifiant KOST E-EXAM a été modifié";
}

export interface UsernameChangedProps {
  firstName: string;
  newUsername: string;
  loginUrl: string;
}

export default function UsernameChangedEmail({ firstName, newUsername, loginUrl }: UsernameChangedProps) {
  return (
    <EmailShell preview="Votre identifiant de connexion KOST E-EXAM a changé.">
      <Title>Votre identifiant a été modifié</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre identifiant de connexion KOST E-EXAM a été modifié par un administrateur.</Paragraph>
      <InfoCard rows={[{ label: "Nouvel identifiant", value: newUsername }]} />
      <CTAButton href={loginUrl}>Accéder à KOST E-EXAM</CTAButton>
      <SecurityNotice>
        Votre mot de passe n&apos;a pas changé. Si vous ne vous attendiez pas à cette modification, contactez immédiatement le
        support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
