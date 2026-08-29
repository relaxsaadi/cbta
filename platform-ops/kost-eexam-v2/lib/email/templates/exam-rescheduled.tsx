// Événement EXAM_RESCHEDULED (mission email §20) — TEMPLATE_ONLY : gabarit
// prêt et prévisualisable, pas encore raccordé à un déclencheur
// automatique (aucune fonction "reschedule" n'existe encore dans
// lib/assessments.ts — voir docs/KOST_EEXAM_V2_EMAIL_ARCHITECTURE.md).
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-rescheduled";
export const TEMPLATE_VERSION = "v1";

export function examRescheduledSubject(): string {
  return "Votre examen KOST E-EXAM a été reprogrammé";
}

export interface ExamRescheduledProps {
  firstName: string;
  examName: string;
  oldDateFormatted: string | null;
  newDateFormatted: string | null;
  examUrl: string;
}

export default function ExamRescheduledEmail({ firstName, examName, oldDateFormatted, newDateFormatted, examUrl }: ExamRescheduledProps) {
  return (
    <EmailShell preview="La date de votre examen a changé.">
      <Title>Votre examen a été reprogrammé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>La date de votre examen « {examName} » a été modifiée.</Paragraph>
      <InfoCard
        rows={[
          { label: "Ancienne date", value: oldDateFormatted ?? "Non définie" },
          { label: "Nouvelle date", value: newDateFormatted ?? "Non définie" },
        ]}
      />
      <CTAButton href={examUrl}>Voir mon examen</CTAButton>
    </EmailShell>
  );
}
