// Événement EXAM_NOW_AVAILABLE (mission email §22, rappel OPTIONNEL) —
// WIRED via lib/email/reminders.ts.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-now-available";
export const TEMPLATE_VERSION = "v1";

export function examNowAvailableSubject(): string {
  return "Votre examen est maintenant disponible — KOST E-EXAM";
}

export interface ExamNowAvailableProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  closeAtFormatted: string | null;
  durationMinutes: number;
  examUrl: string;
}

export default function ExamNowAvailableEmail({ firstName, examName, functionLabel, closeAtFormatted, durationMinutes, examUrl }: ExamNowAvailableProps) {
  return (
    <EmailShell preview="Votre examen est maintenant ouvert sur KOST E-EXAM.">
      <Title>Votre examen est maintenant disponible</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>L&apos;examen suivant est maintenant ouvert. Vous pouvez le démarrer dès à présent.</Paragraph>
      <InfoCard
        rows={[
          { label: "Examen", value: examName },
          { label: "Fonction", value: functionLabel },
          { label: "Durée", value: `${durationMinutes} minutes` },
          ...(closeAtFormatted ? [{ label: "Fermeture", value: closeAtFormatted }] : []),
        ]}
      />
      <CTAButton href={examUrl}>Démarrer mon examen</CTAButton>
    </EmailShell>
  );
}
