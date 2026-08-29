// Événement MFA_ENABLED (mission email §13) — WIRED. Jamais de secret/QR/
// codes de secours dans cet email.
import { EmailShell, Title, Paragraph, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "mfa-enabled";
export const TEMPLATE_VERSION = "v1";

export function mfaEnabledSubject(): string {
  return "Authentification à deux facteurs activée";
}

export interface MfaEnabledProps {
  firstName: string;
}

export default function MfaEnabledEmail({ firstName }: MfaEnabledProps) {
  return (
    <EmailShell preview="L'authentification à deux facteurs est maintenant active sur votre compte.">
      <Title>Authentification à deux facteurs activée</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        L&apos;authentification à deux facteurs (2FA) vient d&apos;être activée sur votre compte KOST E-EXAM. Un code de
        vérification vous sera désormais demandé à chaque connexion.
      </Paragraph>
      <SecurityNotice>Si vous n&apos;êtes pas à l&apos;origine de cette activation, contactez immédiatement le support KOST.</SecurityNotice>
    </EmailShell>
  );
}
