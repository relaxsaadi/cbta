// Événement EXAM_DEADLINE_REMINDER (mission email §22, rappel OPTIONNEL)
// — WIRED via lib/email/reminders.ts, envoyé uniquement aux candidats
// affectés n'ayant encore aucune tentative sur l'examen (voir la requête
// dans reminders.ts) — jamais à un candidat qui a déjà composé.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "exam-deadline-reminder";
export const TEMPLATE_VERSION = "v1";

export function examDeadlineReminderSubject(): string {
  return "Échéance proche pour votre examen — KOST E-EXAM";
}

export interface ExamDeadlineReminderProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  closeAtFormatted: string;
  examUrl: string;
}

export default function ExamDeadlineReminderEmail({ firstName, examName, functionLabel, closeAtFormatted, examUrl }: ExamDeadlineReminderProps) {
  return (
    <EmailShell preview="La fenêtre de votre examen se ferme bientôt.">
      <Title>Échéance proche pour votre examen</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Vous n&apos;avez pas encore composé l&apos;examen suivant, dont la fenêtre se ferme bientôt.</Paragraph>
      <InfoCard
        rows={[
          { label: "Examen", value: examName },
          { label: "Fonction", value: functionLabel },
          { label: "Fermeture", value: closeAtFormatted },
        ]}
      />
      <CTAButton href={examUrl}>Démarrer mon examen</CTAButton>
      <SecurityNotice>Passé ce délai, contactez votre responsable pédagogique pour connaître la marche à suivre.</SecurityNotice>
    </EmailShell>
  );
}
