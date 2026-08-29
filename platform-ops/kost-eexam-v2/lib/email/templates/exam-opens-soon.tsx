// Événement EXAM_OPENS_SOON (mission email §22, rappel OPTIONNEL — voir
// MANDATORY_EVENT_TYPES dans lib/email/types.ts) — WIRED via
// lib/email/reminders.ts, envoyé une seule fois par (examen, candidat)
// grâce à reminder_dispatch_log.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-opens-soon";
export const TEMPLATE_VERSION = "v1";

export function examOpensSoonSubject(): string {
  return "Votre examen ouvre bientôt — KOST E-EXAM";
}

export interface ExamOpensSoonProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  openAtFormatted: string;
  durationMinutes: number;
  examUrl: string;
}

export default function ExamOpensSoonEmail({ firstName, examName, functionLabel, openAtFormatted, durationMinutes, examUrl }: ExamOpensSoonProps) {
  return (
    <EmailShell preview="Votre examen ouvre bientôt sur KOST E-EXAM.">
      <Title>Votre examen ouvre bientôt</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Un rappel : l&apos;examen suivant ouvre prochainement.</Paragraph>
      <InfoCard
        rows={[
          { label: "Examen", value: examName },
          { label: "Fonction", value: functionLabel },
          { label: "Ouverture", value: openAtFormatted },
          { label: "Durée", value: `${durationMinutes} minutes` },
        ]}
      />
      <CTAButton href={examUrl}>Voir mes examens</CTAButton>
    </EmailShell>
  );
}
