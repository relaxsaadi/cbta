// Événement EXAM_RESCHEDULED (mission email §20, WIRED depuis la mission
// "COMPLETE REAL EXAM RESCHEDULING WORKFLOW", 2026-08-29) — déclenché par
// lib/assessments.ts::rescheduleAssessment(), appelée depuis
// app/(app)/exam-preparation/actions.ts::rescheduleAssessmentAction.
// Affiche l'ouverture ET la fermeture, ancienne et nouvelle — jamais
// seulement une "date" générique — ainsi que la fonction DGR concernée.
// Jamais de question/réponse/référence DGR interne (§47).
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-rescheduled";
export const TEMPLATE_VERSION = "v2";

export function examRescheduledSubject(): string {
  return "Votre examen KOST E-EXAM a été reprogrammé";
}

export interface ExamRescheduledProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  oldOpenAtFormatted: string | null;
  oldCloseAtFormatted: string | null;
  newOpenAtFormatted: string | null;
  newCloseAtFormatted: string | null;
  examUrl: string;
}

export default function ExamRescheduledEmail({
  firstName,
  examName,
  functionLabel,
  oldOpenAtFormatted,
  oldCloseAtFormatted,
  newOpenAtFormatted,
  newCloseAtFormatted,
  examUrl,
}: ExamRescheduledProps) {
  return (
    <EmailShell preview="La fenêtre de votre examen a changé.">
      <Title>Votre examen a été reprogrammé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        La fenêtre de disponibilité de votre examen « {examName} » a été modifiée. Merci de noter les nouvelles dates
        ci-dessous.
      </Paragraph>
      <InfoCard
        rows={[
          { label: "Examen", value: examName },
          { label: "Fonction", value: functionLabel },
          { label: "Ancienne ouverture", value: oldOpenAtFormatted ?? "Non définie" },
          { label: "Ancienne fermeture", value: oldCloseAtFormatted ?? "Non définie" },
          { label: "Nouvelle ouverture", value: newOpenAtFormatted ?? "Non définie" },
          { label: "Nouvelle fermeture", value: newCloseAtFormatted ?? "Non définie" },
        ]}
      />
      <CTAButton href={examUrl}>Voir mon examen</CTAButton>
    </EmailShell>
  );
}
