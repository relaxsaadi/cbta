// Événement ACCOUNT_REACTIVATED (mission email §14) — WIRED.
import { EmailShell, Title, Paragraph, CTAButton } from "./shared";

export const TEMPLATE_ID = "account-reactivated";
export const TEMPLATE_VERSION = "v1";

export function accountReactivatedSubject(): string {
  return "Votre compte KOST E-EXAM est réactivé";
}

export interface AccountReactivatedProps {
  firstName: string;
  loginUrl: string;
}

export default function AccountReactivatedEmail({ firstName, loginUrl }: AccountReactivatedProps) {
  return (
    <EmailShell preview="Votre compte est de nouveau actif.">
      <Title>Votre compte est réactivé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre compte KOST E-EXAM a été réactivé. Vous pouvez de nouveau vous connecter.</Paragraph>
      <CTAButton href={loginUrl}>Accéder à KOST E-EXAM</CTAButton>
    </EmailShell>
  );
}
