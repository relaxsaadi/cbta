// Événement INCIDENT_DECLARED (mission email §29) — WIRED. JAMAIS le
// détail/la preuve d'un incident (dernière ligne du §29) — uniquement
// qu'un incident affectant ce compte/examen a été déclaré.
import { EmailShell, Title, Paragraph } from "./shared";

export const TEMPLATE_ID = "incident-declared";
export const TEMPLATE_VERSION = "v1";

export function incidentDeclaredSubject(): string {
  return "Incident déclaré sur votre session KOST E-EXAM";
}

export interface IncidentDeclaredProps {
  firstName: string;
}

export default function IncidentDeclaredEmail({ firstName }: IncidentDeclaredProps) {
  return (
    <EmailShell preview="Un incident a été déclaré et est en cours de traitement.">
      <Title>Incident en cours de traitement</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        Un incident concernant votre compte ou votre session KOST E-EXAM a été déclaré par un responsable
        pédagogique ou un administrateur. Il est actuellement en cours de traitement.
      </Paragraph>
      <Paragraph>Vous serez informé(e) dès sa résolution. Pour toute question, contactez votre responsable pédagogique.</Paragraph>
    </EmailShell>
  );
}
