// Événement INCIDENT_RESOLVED (mission email §29) — WIRED.
import { EmailShell, Title, Paragraph } from "./shared";

export const TEMPLATE_ID = "incident-resolved";
export const TEMPLATE_VERSION = "v1";

export function incidentResolvedSubject(): string {
  return "Incident résolu — KOST E-EXAM";
}

export interface IncidentResolvedProps {
  firstName: string;
}

export default function IncidentResolvedEmail({ firstName }: IncidentResolvedProps) {
  return (
    <EmailShell preview="L'incident concernant votre compte a été résolu.">
      <Title>Incident résolu</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>L&apos;incident concernant votre compte ou votre session KOST E-EXAM a été résolu.</Paragraph>
      <Paragraph>Pour toute question, contactez votre responsable pédagogique ou le support KOST.</Paragraph>
    </EmailShell>
  );
}
