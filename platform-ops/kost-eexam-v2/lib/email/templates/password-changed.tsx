// Événement PASSWORD_CHANGED (mission email §12) — WIRED. Notification de
// sécurité pure : jamais désactivable (voir MANDATORY_EVENT_TYPES).
import { EmailShell, Title, Paragraph, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "password-changed";
export const TEMPLATE_VERSION = "v1";

export function passwordChangedSubject(): string {
  return "Votre mot de passe KOST E-EXAM a été modifié";
}

export interface PasswordChangedProps {
  firstName: string;
  changedAtFormatted: string;
}

export default function PasswordChangedEmail({ firstName, changedAtFormatted }: PasswordChangedProps) {
  return (
    <EmailShell preview="Confirmation de la modification de votre mot de passe.">
      <Title>Votre mot de passe a été modifié</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre mot de passe KOST E-EXAM a été modifié le {changedAtFormatted}.</Paragraph>
      <SecurityNotice>
        Si vous n&apos;êtes pas à l&apos;origine de cette modification, contactez immédiatement le support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
