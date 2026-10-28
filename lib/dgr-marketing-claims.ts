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
    // Authority-first wording (e.g. "IATA certifié") evades the claim-first check.
    label: "IATA/CBTA/ANAC certification or accreditation claim (authority-first)",
    pattern: /\b(?:IATA|CBTA|ANAC)\b[^\n]{0,80}\b(?:certifi(?:e|é|ée|es|és)?|accr[eé]dit(?:e|é|ée|es|és)?)\b/i,
  },
  {
    // Adjectives such as "agréé ANAC" are not matched by the noun "agrément".
    label: "ANAC/IATA adjectival authorization or approval claim",
    pattern: /\b(?:agr[eé][eé](?:e|s|es)?|approuv[eé](?:e|s|es)?|homologu[eé](?:e|s|es)?|autoris[eé](?:e|s|es)?)[^\n]{0,80}\b(?:ANAC|IATA)\b|\b(?:ANAC|IATA)\b[^\n]{0,80}\b(?:agr[eé][eé](?:e|s|es)?|approuv[eé](?:e|s|es)?|homologu[eé](?:e|s|es)?|autoris[eé](?:e|s|es)?)/i,
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
    pattern: /(?:^|[^\p{L}\p{N}_])(?:deadline|[eé]ch[eé]ance|renforcement)\b[^\n]{0,80}\b(?:IATA|ANAC)\b/iu,
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

// Generated email bodies are HTML. A claim may be split by inline tags or
// HTML entities while remaining plainly visible to a recipient. Evaluate both
// text projections; this is a defence-in-depth veto, not regulatory approval.
function decodeMarketingEntities(input: string): string {
  const namedFrenchEntities: Record<string, string> = {
    nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ',
    aacute: 'á', agrave: 'à', acirc: 'â', auml: 'ä',
    ccedil: 'ç',
    eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë',
    iacute: 'í', igrave: 'ì', icirc: 'î', iuml: 'ï',
    oacute: 'ó', ograve: 'ò', ocirc: 'ô', ouml: 'ö',
    uacute: 'ú', ugrave: 'ù', ucirc: 'û', uuml: 'ü',
    yacute: 'ý', yuml: 'ÿ',
    amp: '&', quot: '"', apos: "'", laquo: '«', raquo: '»',
  };
  return input
    .replace(/&([a-z][a-z0-9]+);/gi, (raw, name: string) =>
      namedFrenchEntities[name.toLowerCase()] ?? raw)
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_match, code: string) => {
      const value = /^x/i.test(code)
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isInteger(value) && value >= 32 && value <= 0x10ffff
        ? String.fromCodePoint(value)
        : ' ';
    });
}

export function assertSafeDgrMarketingCopy(text: string): void {
  const decoded = decodeMarketingEntities(text).normalize('NFC');
  const views = [
    decoded,
    decoded.replace(/<[^>]*>/g, ''),
    decoded.replace(/<[^>]*>/g, ' '),
  ].map((value) => value.replace(/\s+/g, ' ').trim());

  for (const { label, pattern } of BLOCKED_DGR_MARKETING_CLAIMS) {
    if (views.some((candidate) => pattern.test(candidate))) {
      throw new Error(`[dgr-marketing] blocked generated copy: ${label}`);
    }
  }
}
