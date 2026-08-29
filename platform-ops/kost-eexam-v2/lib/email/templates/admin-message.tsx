// Événement ADMIN_MESSAGE (mission "COMPLETE USER MANAGEMENT", 2026-08-29,
// §36-40) — WIRED via app/(app)/users/actions.ts::sendMessageAction().
// Réutilise entièrement l'infrastructure email existante (outbox,
// idempotence, webhook, RBAC, EMAIL_MODE) — ce gabarit est la SEULE pièce
// nouvelle, jamais une seconde architecture d'email. Le destinataire est
// verrouillé côté serveur (jamais un email arbitraire, voir la Server
// Action) — ce composant se contente d'afficher le contenu déjà validé.
import { EmailShell, Title, Paragraph, InfoCard, CTAButton, SecurityNotice } from "./shared";

export const TEMPLATE_ID = "admin-message";
export const TEMPLATE_VERSION = "v1";

export function adminMessageSubject(subject: string): string {
  return subject;
}

export interface AdminMessageProps {
  firstName: string;
  senderName: string;
  messageTypeLabel: string;
  subject: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export default function AdminMessageEmail({ firstName, senderName, messageTypeLabel, subject, bodyText, ctaLabel, ctaUrl }: AdminMessageProps) {
  const paragraphs = bodyText.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  return (
    <EmailShell preview={subject}>
      <Title>{subject}</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <InfoCard rows={[{ label: "Type de message", value: messageTypeLabel }, { label: "Expéditeur", value: senderName }]} />
      {paragraphs.length > 0 ? (
        paragraphs.map((p, i) => <Paragraph key={i}>{p}</Paragraph>)
      ) : (
        <Paragraph>{bodyText}</Paragraph>
      )}
      {ctaLabel && ctaUrl && <CTAButton href={ctaUrl}>{ctaLabel}</CTAButton>}
      <SecurityNotice>
        Ce message vous a été envoyé directement par un responsable KOST Academy via KOST E-EXAM. Pour toute question,
        répondez à cet email ou contactez le support KOST.
      </SecurityNotice>
    </EmailShell>
  );
}
