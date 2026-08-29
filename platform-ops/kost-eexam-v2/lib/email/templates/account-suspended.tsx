// Événement ACCOUNT_SUSPENDED (mission email §14) — WIRED.
import { EmailShell, Title, Paragraph } from "./shared";

export const TEMPLATE_ID = "account-suspended";
export const TEMPLATE_VERSION = "v1";

export function accountSuspendedSubject(): string {
  return "Votre compte KOST E-EXAM a été suspendu";
}

export interface AccountSuspendedProps {
  firstName: string;
}

export default function AccountSuspendedEmail({ firstName }: AccountSuspendedProps) {
  return (
    <EmailShell preview="Votre compte a été temporairement suspendu.">
      <Title>Votre compte a été suspendu</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        Votre compte KOST E-EXAM a été temporairement suspendu par votre responsable pédagogique ou un
        administrateur. Vous ne pouvez plus vous connecter tant que cette suspension est active.
      </Paragraph>
      <Paragraph>Pour en savoir plus ou demander la levée de cette suspension, contactez votre responsable pédagogique ou le support KOST.</Paragraph>
    </EmailShell>
  );
}
