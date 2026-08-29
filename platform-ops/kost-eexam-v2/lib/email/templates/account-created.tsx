// Événement ACCOUNT_CREATED (mission email §10) — WIRED : déclenché par
// lib/users.ts::createUserPendingActivation(). JAMAIS de mot de passe ici.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice, ExpiryNote } from "./shared";

export const TEMPLATE_ID = "account-created";
export const TEMPLATE_VERSION = "v1";

export function accountCreatedSubject(): string {
  return "Votre accès KOST E-EXAM est prêt";
}

export interface AccountCreatedProps {
  firstName: string;
  companyName: string;
  groupName: string;
  usernameOrEmail: string;
  activationUrl: string;
  expiresAtFormatted: string;
}

export default function AccountCreatedEmail({ firstName, companyName, groupName, usernameOrEmail, activationUrl, expiresAtFormatted }: AccountCreatedProps) {
  return (
    <EmailShell preview="Créez votre mot de passe pour accéder à votre espace d'examen.">
      <Title>Votre accès KOST E-EXAM est prêt</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre compte KOST E-EXAM a été créé.</Paragraph>
      <InfoCard
        rows={[
          { label: "Entreprise", value: companyName },
          { label: "Groupe / Session", value: groupName },
          { label: "Identifiant", value: usernameOrEmail },
        ]}
      />
      <Paragraph>Pour accéder à votre espace, créez votre mot de passe en cliquant sur le bouton ci-dessous.</Paragraph>
      <CTAButton href={activationUrl}>Créer mon mot de passe</CTAButton>
      <ExpiryNote expiresAt={expiresAtFormatted} />
      <SecurityNotice>Si vous n&apos;attendiez pas cette invitation, contactez le support KOST.</SecurityNotice>
    </EmailShell>
  );
}
