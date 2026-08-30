// Événement TEMPORARY_ACCESS_CREATED (mission "ADMIN/CLIENT/CANDIDATE UX
// IMPROVEMENTS", 2026-08-30, §9) — WIRED. Contient le mot de passe
// temporaire EN CLAIR (nécessaire — c'est tout l'objet de cet email) :
// jamais d'information d'examen/question sans rapport (§9 : "Do not include
// unrelated exam/question information"), jamais un contenu réutilisé pour
// autre chose que cet accès précis.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "temporary-access-created";
export const TEMPLATE_VERSION = "v1";

export function temporaryAccessCreatedSubject(): string {
  return "Votre accès KOST E-EXAM a été créé";
}

export interface TemporaryAccessCreatedProps {
  firstName: string;
  username: string;
  temporaryPassword: string;
  expiresAtFormatted: string;
  loginUrl: string;
}

export default function TemporaryAccessCreatedEmail({ firstName, username, temporaryPassword, expiresAtFormatted, loginUrl }: TemporaryAccessCreatedProps) {
  return (
    <EmailShell preview="Votre accès temporaire KOST E-EXAM — à remplacer lors de votre première connexion.">
      <Title>Votre accès KOST E-EXAM a été créé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre accès KOST E-EXAM a été créé.</Paragraph>
      <InfoCard
        rows={[
          { label: "Identifiant", value: username },
          { label: "Mot de passe temporaire", value: temporaryPassword },
        ]}
      />
      <Paragraph>Ce mot de passe est temporaire et doit être remplacé lors de votre première connexion.</Paragraph>
      <CTAButton href={loginUrl}>Se connecter à KOST E-EXAM</CTAButton>
      <Paragraph>Ce mot de passe temporaire expire le {expiresAtFormatted}. Passé ce délai, il sera refusé — contactez un administrateur pour un nouvel accès.</Paragraph>
      <SecurityNotice>
        Pour votre sécurité, vous devrez choisir un nouveau mot de passe lors de votre première connexion. Si vous
        n&apos;êtes pas à l&apos;origine de cette demande, contactez immédiatement le support KOST : cbta@kostacademy.com.
      </SecurityNotice>
    </EmailShell>
  );
}
