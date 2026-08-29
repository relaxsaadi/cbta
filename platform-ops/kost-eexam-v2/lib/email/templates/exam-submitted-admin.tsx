// Événement EXAM_SUBMITTED_ADMIN (mission "COMPLETE CANDIDATE EXAM
// LIFECYCLE", 2026-08-29, §34-36) — WIRED. Notifie le staff responsable
// (responsable pédagogique du groupe/tenant + alerte admin configurée,
// voir lib/email/events.ts) qu'un candidat a envoyé son examen. JAMAIS les
// réponses du candidat dans cet email.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "exam-submitted-admin";
export const TEMPLATE_VERSION = "v1";

export function examSubmittedAdminSubject(candidateName: string): string {
  return `${candidateName} a envoyé son examen KOST E-EXAM`;
}

export interface ExamSubmittedAdminProps {
  candidateName: string;
  candidateUsername: string;
  companyName: string;
  groupName: string;
  examName: string;
  functionLabel: string;
  submittedAtFormatted: string;
  statusLabel: string;
  attemptUrl: string;
}

export default function ExamSubmittedAdminEmail({
  candidateName,
  candidateUsername,
  companyName,
  groupName,
  examName,
  functionLabel,
  submittedAtFormatted,
  statusLabel,
  attemptUrl,
}: ExamSubmittedAdminProps) {
  return (
    <EmailShell preview={`${candidateName} a envoyé son examen.`}>
      <Title>Un candidat a envoyé son examen</Title>
      <InfoCard
        rows={[
          { label: "Candidat", value: candidateName },
          { label: "Identifiant", value: candidateUsername },
          { label: "Entreprise", value: companyName },
          { label: "Groupe / Session", value: groupName },
          { label: "Examen", value: examName },
          { label: "Fonction DGR", value: functionLabel },
          { label: "Date d'envoi", value: submittedAtFormatted },
          { label: "Statut", value: statusLabel },
        ]}
      />
      <Paragraph>Aucune réponse du candidat n&apos;est incluse dans cet email — consultez la tentative pour le détail.</Paragraph>
      <CTAButton href={attemptUrl}>Voir la tentative</CTAButton>
    </EmailShell>
  );
}
