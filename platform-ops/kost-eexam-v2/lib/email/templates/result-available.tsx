// Événement RESULT_AVAILABLE (mission email §24) — WIRED. Politique
// configurable RESULT_AVAILABLE_ONLY (défaut) / RESULT_WITH_SCORE.
// JAMAIS le détail des réponses/corrections dans l'email (dernière ligne
// du §24).
import { EmailShell, Title, Paragraph, InfoCard, CTAButton } from "./shared";

export const TEMPLATE_ID = "result-available";
export const TEMPLATE_VERSION = "v1";

export function resultAvailableSubject(): string {
  return "Votre résultat KOST E-EXAM est disponible";
}

export interface ResultAvailableProps {
  firstName: string;
  examName: string;
  functionLabel: string;
  resultUrl: string;
  withScore: boolean;
  passed?: boolean;
  score100?: number;
  percentage?: number;
  passThresholdPct?: number;
}

export default function ResultAvailableEmail({ firstName, examName, functionLabel, resultUrl, withScore, passed, score100, percentage, passThresholdPct }: ResultAvailableProps) {
  return (
    <EmailShell preview="Votre résultat d'examen est disponible.">
      <Title>Votre résultat est disponible</Title>
      <Paragraph>Bonjour {firstName},</Paragraph>
      <Paragraph>Le résultat de votre examen est maintenant disponible.</Paragraph>
      {withScore ? (
        <InfoCard
          rows={[
            { label: "Examen", value: examName },
            { label: "Fonction", value: functionLabel },
            { label: "Résultat", value: passed ? "ADMIS" : "ÉCHEC" },
            { label: "Note", value: `${score100}/100` },
            { label: "Pourcentage", value: `${percentage}%` },
            { label: "Seuil de réussite", value: `${passThresholdPct}%` },
          ]}
        />
      ) : (
        <InfoCard rows={[{ label: "Examen", value: examName }, { label: "Fonction", value: functionLabel }]} />
      )}
      <CTAButton href={resultUrl}>Voir mon résultat</CTAButton>
    </EmailShell>
  );
}
