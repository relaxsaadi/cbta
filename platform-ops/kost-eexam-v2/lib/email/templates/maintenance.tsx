// Événements MAINTENANCE_STARTED / MAINTENANCE_COMPLETED (mission email
// §29) — WIRED. Un seul fichier, deux exports (contenu quasi-identique,
// même principe que mfa-disabled pour éviter la duplication inutile).
import { EmailShell, Title, Paragraph } from "./shared";

export const MAINTENANCE_STARTED_TEMPLATE_ID = "maintenance-started";
export const MAINTENANCE_COMPLETED_TEMPLATE_ID = "maintenance-completed";
export const TEMPLATE_VERSION = "v1";

export function maintenanceStartedSubject(): string {
  return "Maintenance en cours — KOST E-EXAM";
}
export function maintenanceCompletedSubject(): string {
  return "Maintenance terminée — KOST E-EXAM";
}

export function MaintenanceStartedEmail({ firstName }: { firstName: string }) {
  return (
    <EmailShell preview="La plateforme est en maintenance temporaire.">
      <Title>Maintenance en cours</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>
        KOST E-EXAM est actuellement en maintenance. Le démarrage de nouvelles tentatives d&apos;examen est
        temporairement suspendu. Les tentatives déjà commencées ne sont pas affectées.
      </Paragraph>
      <Paragraph>Merci de votre patience.</Paragraph>
    </EmailShell>
  );
}

export function MaintenanceCompletedEmail({ firstName }: { firstName: string }) {
  return (
    <EmailShell preview="La maintenance est terminée, la plateforme est de nouveau disponible.">
      <Title>Maintenance terminée</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>La maintenance de KOST E-EXAM est terminée. La plateforme est de nouveau pleinement disponible.</Paragraph>
    </EmailShell>
  );
}
