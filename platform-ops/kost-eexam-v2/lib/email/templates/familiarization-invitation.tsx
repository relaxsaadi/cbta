// Événement FAMILIARIZATION_INVITATION (mission email §26) — WIRED.
// N'appelle JAMAIS la familiarisation une certification (dernière ligne
// du §26).
import { EmailShell, Title, Paragraph, InfoCard } from "./shared";

export const TEMPLATE_ID = "familiarization-invitation";
export const TEMPLATE_VERSION = "v1";

export function familiarizationInvitationSubject(): string {
  return "Invitation — Séance de familiarisation KOST E-EXAM";
}

export interface FamiliarizationInvitationProps {
  firstName: string;
  functionLabel: string;
  heldAtFormatted: string;
  location: string | null;
}

export default function FamiliarizationInvitationEmail({ firstName, functionLabel, heldAtFormatted, location }: FamiliarizationInvitationProps) {
  return (
    <EmailShell preview="Vous êtes invité(e) à une séance de familiarisation.">
      <Title>Séance de familiarisation</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        Vous êtes invité(e) à une séance de familiarisation avec la plateforme KOST E-EXAM, avant votre examen réel.
        Cette séance est une préparation pratique — elle ne constitue pas une certification.
      </Paragraph>
      <InfoCard
        rows={[
          { label: "Fonction", value: functionLabel },
          { label: "Date", value: heldAtFormatted },
          ...(location ? [{ label: "Lieu", value: location }] : []),
        ]}
      />
      <Paragraph>Merci de vous présenter à l&apos;heure indiquée.</Paragraph>
    </EmailShell>
  );
}
