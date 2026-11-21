const BLOCKED_DGR_MARKETING_CLAIMS: Array<{ label: string; pattern: RegExp }> = [
  {
    label: "IATA/CBTA first-or-only provider claim",
    pattern: /\b(?:1er|premier|seul)\s+(?:centre|provider)\b[^\n]{0,120}\b(?:IATA|CBTA)\b/i,
  },
  {
    label: "IATA/CBTA certification or accreditation claim",
    pattern: /\b(?:certifi(?:e|é|ée|es|és)?|accr[eé]dit(?:e|é|ée|es|és)?)\b[^\n]{0,80}\b(?:IATA|CBTA|ANAC)\b/i,
  },
  {
    label: "official IATA certification/certificate claim",
    pattern: /\b(?:certification|certificat)\s+(?:officiel(?:le)?\s+)?IATA\b/i,
  },
  {
    label: "IATA recognition claim",
    pattern: /\breconnu(?:e|es|s)?\b[^\n]{0,60}\bIATA\b/i,
  },
  {
    label: "ANAC/IATA approval claim",
    pattern: /\b(?:agr[eé]ment|approbation|homologation|autorisation)\b[^\n]{0,80}\b(?:ANAC|IATA)\b/i,
  },
  {
    label: "unsupported regulatory deadline claim",
    pattern: /\b(?:deadline|[eé]ch[eé]ance|renforcement)\b[^\n]{0,80}\b(?:IATA|ANAC)\b/i,
  },
  {
    label: "stale August/September 2026 campaign claim",
    pattern: /\b(?:ao[uû]t|septembre)\s+2026\b/i,
  },
  {
    label: "unsupported punitive consequence claim",
    pattern: /\b(?:amende|interdiction\s+de\s+vol|responsabilit[eé]\s+p[eé]nale|suspension\s+de\s+vol)\b/i,
  },
];

export const SAFE_DGR_MARKETING_RULES = `
Règles de conformité obligatoires :
- Décris KOST uniquement comme organisme de formation DGR/CBTA, sauf si une preuve d'approbation actuelle et vérifiable est explicitement fournie dans les données d'entrée.
- Ne prétends jamais que KOST est le premier, le seul, certifié, accrédité, agréé, reconnu ou officiellement approuvé par IATA ou ANAC sans cette preuve explicite.
- N'invente aucune obligation légale, sanction, amende, responsabilité pénale, interdiction/suspension de vol, date limite réglementaire, taux de réussite, prix, session, référence client ou numéro d'agrément.
- Ne présente pas une fonction CBTA comme applicable à un prospect par simple déduction sectorielle : utilise uniquement les fonctions explicitement fournies par une analyse validée.
- Pour les exigences réglementaires, reste prudent : "selon les exigences applicables à votre activité" et demande une vérification sur la source réglementaire actuelle si nécessaire.
- N'utilise pas les anciennes campagnes août/septembre 2026 comme urgence commerciale.
`;

export function assertSafeDgrMarketingCopy(text: string): void {
  const candidate = text.replace(/\s+/g, " ").trim();
  for (const { label, pattern } of BLOCKED_DGR_MARKETING_CLAIMS) {
    if (pattern.test(candidate)) {
      throw new Error(`[dgr-marketing] blocked generated copy: ${label}`);
    }
  }
}
