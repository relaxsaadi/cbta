// Événement PASSWORD_CHANGED (mission email §12) — WIRED. Notification de
// sécurité pure : jamais désactivable (voir MANDATORY_EVENT_TYPES).
import { EmailShell, Title, Paragraph, CTAButton, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "password-changed";
export const TEMPLATE_VERSION = "v2";

export function passwordChangedSubject(): string {
  return "Votre mot de passe KOST E-EXAM a été modifié";
}

export interface PasswordChangedProps {
  firstName: string;
  /** Mission "COMPLETE USER MANAGEMENT" §20 — rappel de l'identifiant,
   * jamais du mot de passe lui-même. */
  username: string;
  changedAtFormatted: string;
  loginUrl: string;
}

export default function PasswordChangedEmail({ firstName, username, changedAtFormatted, loginUrl }: PasswordChangedProps) {
  return (
    <EmailShell preview="Confirmation de la modification de votre mot de passe.">
      <Title>Votre mot de passe a été modifié</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        Le mot de passe du compte KOST E-EXAM identifié par <strong>{username}</strong> a été modifié le {changedAtFormatted}.
      </Paragraph>
      <CTAButton href={loginUrl}>Accéder à KOST E-EXAM</CTAButton>
      <SecurityNotice>
        Si vous n&apos;êtes pas à l&apos;origine de cette modification, contactez immédiatement le support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
