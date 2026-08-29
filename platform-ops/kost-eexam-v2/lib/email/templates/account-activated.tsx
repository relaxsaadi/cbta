// Événement ACCOUNT_ACTIVATED (mission email §11) — WIRED.
import { EmailShell, Title, Paragraph, CTAButton } from "./shared";

export const TEMPLATE_ID = "account-activated";
export const TEMPLATE_VERSION = "v1";

export function accountActivatedSubject(): string {
  return "Votre compte KOST E-EXAM est activé";
}

export interface AccountActivatedProps {
  firstName: string;
  loginUrl: string;
}

export default function AccountActivatedEmail({ firstName, loginUrl }: AccountActivatedProps) {
  return (
    <EmailShell preview="Votre compte est activé — vous pouvez maintenant vous connecter.">
      <Title>Votre compte KOST E-EXAM est activé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre mot de passe a été créé avec succès. Votre compte KOST E-EXAM est maintenant actif.</Paragraph>
      <CTAButton href={loginUrl}>Accéder à KOST E-EXAM</CTAButton>
      <Paragraph>Besoin d&apos;aide ? Contactez le support KOST.</Paragraph>
    </EmailShell>
  );
}
