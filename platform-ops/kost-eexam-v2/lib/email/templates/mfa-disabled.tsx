// Événement MFA_DISABLED (mission email §13) — WIRED. Sensible à la
// sécurité : distingue désactivation par le titulaire vs par un admin.
import { EmailShell, Title, Paragraph, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "mfa-disabled";
export const TEMPLATE_VERSION = "v1";

export function mfaDisabledSubject(): string {
  return "Authentification à deux facteurs désactivée";
}

export interface MfaDisabledProps {
  firstName: string;
  byAdmin: boolean;
}

export default function MfaDisabledEmail({ firstName, byAdmin }: MfaDisabledProps) {
  return (
    <EmailShell preview="L'authentification à deux facteurs a été désactivée sur votre compte.">
      <Title>Authentification à deux facteurs désactivée</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        {byAdmin
          ? "L'authentification à deux facteurs de votre compte KOST E-EXAM a été désactivée par un administrateur, dans le cadre d'une procédure de récupération de compte."
          : "L'authentification à deux facteurs vient d'être désactivée sur votre compte KOST E-EXAM."}
      </Paragraph>
      <SecurityNotice>Si vous n&apos;êtes pas à l&apos;origine de cette action, contactez immédiatement le support KOST.</SecurityNotice>
    </EmailShell>
  );
}
