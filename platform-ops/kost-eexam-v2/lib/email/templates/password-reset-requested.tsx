// Événement PASSWORD_RESET_REQUESTED (mission email §12) — WIRED.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice, ExpiryNote } from "./shared";

export const TEMPLATE_ID = "password-reset-requested";
export const TEMPLATE_VERSION = "v2";

export function passwordResetRequestedSubject(): string {
  return "Réinitialisation de votre mot de passe KOST E-EXAM";
}

export interface PasswordResetRequestedProps {
  firstName: string;
  /** Mission "COMPLETE USER MANAGEMENT" §19 — l'identifiant de connexion
   * doit toujours être rappelé sur cet email, qu'il s'agisse d'une demande
   * candidat (self-service) ou d'un envoi déclenché par un admin. */
  username: string;
  resetUrl: string;
  expiresAtFormatted: string;
}

export default function PasswordResetRequestedEmail({ firstName, username, resetUrl, expiresAtFormatted }: PasswordResetRequestedProps) {
  return (
    <EmailShell preview="Cliquez pour choisir un nouveau mot de passe.">
      <Title>Réinitialisation de votre mot de passe</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte KOST E-EXAM.</Paragraph>
      <InfoCard rows={[{ label: "Identifiant de connexion", value: username }]} />
      <CTAButton href={resetUrl}>Choisir un nouveau mot de passe</CTAButton>
      <ExpiryNote expiresAt={expiresAtFormatted} />
      <SecurityNotice>
        Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet email — votre mot de passe actuel reste
        inchangé. Pour toute question, contactez le support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
