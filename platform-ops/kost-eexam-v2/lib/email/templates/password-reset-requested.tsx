// Événement PASSWORD_RESET_REQUESTED (mission email §12) — WIRED.
import { EmailShell, Title, Paragraph, CTAButton, SecurityNotice, ExpiryNote } from "./shared";

export const TEMPLATE_ID = "password-reset-requested";
export const TEMPLATE_VERSION = "v1";

export function passwordResetRequestedSubject(): string {
  return "Réinitialisation de votre mot de passe KOST E-EXAM";
}

export interface PasswordResetRequestedProps {
  firstName: string;
  resetUrl: string;
  expiresAtFormatted: string;
}

export default function PasswordResetRequestedEmail({ firstName, resetUrl, expiresAtFormatted }: PasswordResetRequestedProps) {
  return (
    <EmailShell preview="Cliquez pour choisir un nouveau mot de passe.">
      <Title>Réinitialisation de votre mot de passe</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte KOST E-EXAM.</Paragraph>
      <CTAButton href={resetUrl}>Choisir un nouveau mot de passe</CTAButton>
      <ExpiryNote expiresAt={expiresAtFormatted} />
      <SecurityNotice>
        Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email — votre mot de passe actuel reste
        inchangé. Pour toute question, contactez le support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
