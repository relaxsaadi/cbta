// Événement EXAM_ASSIGNED (mission email §17) — WIRED. JAMAIS le texte des
// questions, les bonnes réponses, un ID interne de question ou une
// référence DGR (§17, dernières lignes / §47 confidentialité).
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-assigned";
export const TEMPLATE_VERSION = "v1";

export function examAssignedSubject(): string {
  return "Un examen KOST E-EXAM vous a été attribué";
}

export interface ExamAssignedProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  companyName: string;
  groupName: string;
  openAtFormatted: string | null;
  closeAtFormatted: string | null;
  durationMinutes: number;
  attemptsAllowed: number;
  examUrl: string;
}

export default function ExamAssignedEmail({
  firstName,
  examName,
  functionLabel,
  companyName,
  groupName,
  openAtFormatted,
  closeAtFormatted,
  durationMinutes,
  attemptsAllowed,
  examUrl,
}: ExamAssignedProps) {
  const rows = [
    { label: "Examen", value: examName },
    { label: "Fonction", value: functionLabel },
    { label: "Entreprise", value: companyName },
    { label: "Groupe / Session", value: groupName },
    ...(openAtFormatted ? [{ label: "Ouverture", value: openAtFormatted }] : []),
    ...(closeAtFormatted ? [{ label: "Clôture", value: closeAtFormatted }] : []),
    { label: "Durée", value: `${durationMinutes} minutes` },
    { label: "Tentative(s) autorisée(s)", value: attemptsAllowed === 0 ? "Illimitées" : String(attemptsAllowed) },
  ];
  return (
    <EmailShell preview={`Un nouvel examen (${functionLabel}) vous a été attribué.`}>
      <Title>Un examen vous a été attribué</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Un examen KOST E-EXAM vous a été attribué. Voici les informations importantes :</Paragraph>
      <InfoCard rows={rows} />
      <Paragraph>
        Une fois commencé, le chronomètre ne s&apos;arrête plus. À expiration, l&apos;examen est soumis
        automatiquement, même si vous n&apos;avez pas terminé.
      </Paragraph>
      <CTAButton href={examUrl}>Voir mon examen</CTAButton>
    </EmailShell>
  );
}
