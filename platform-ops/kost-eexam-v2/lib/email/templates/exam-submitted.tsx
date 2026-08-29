// Événement EXAM_SUBMITTED (mission "COMPLETE CANDIDATE EXAM LIFECYCLE",
// 2026-08-29, §31) — WIRED. Confirmation candidat après envoi réel de
// l'examen (manuel ou auto-soumission par expiration du chronomètre).
// JAMAIS les réponses, la bonne réponse, un ID interne de question ou une
// référence DGR — même politique de confidentialité que EXAM_ASSIGNED.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-submitted";
export const TEMPLATE_VERSION = "v1";

export function examSubmittedSubject(): string {
  return "Votre examen KOST E-EXAM a bien été envoyé";
}

export interface ExamSubmittedProps {
  firstName: string;
  username: string;
  examName: string;
  functionLabel: string;
  submittedAtFormatted: string;
  statusLabel: string;
  examUrl: string;
}

export default function ExamSubmittedEmail({ firstName, username, examName, functionLabel, submittedAtFormatted, statusLabel, examUrl }: ExamSubmittedProps) {
  return (
    <EmailShell preview="Votre examen a bien été envoyé.">
      <Title>Votre examen a bien été envoyé</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Votre examen KOST E-EXAM a bien été envoyé.</Paragraph>
      <InfoCard
        rows={[
          { label: "Examen", value: examName },
          { label: "Fonction", value: functionLabel },
          { label: "Date d'envoi", value: submittedAtFormatted },
          { label: "Statut", value: statusLabel },
          { label: "Identifiant de connexion", value: username },
        ]}
      />
      <CTAButton href={examUrl}>Voir mon espace KOST E-EXAM</CTAButton>
    </EmailShell>
  );
}
