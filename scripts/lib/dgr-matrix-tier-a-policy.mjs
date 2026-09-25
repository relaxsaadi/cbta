const NON_VERIFIED_EVIDENCE_RE = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED/i;
const NON_VERIFIED_FR_STATE_RE = /SOURCE GAP|SOURCE CONFLICT|NOT YET VERIFIED|NOT VERIFIED|UNVERIFIED|STALE CITATION|PARTIALLY CONFIRMED|\bDRAFT\b|SOURCE REQUIRED|NOT ATTEMPTED|UNATTEMPTED/i;
const PROVISIONAL_RE = /\b(?:pending|tbd|todo|requested|needed|missing)\b|\bto\s+(?:verify|check|confirm|locate)\b|\b(?:needs?|requires?)\s+(?:verification|checking|confirmation|a\s+locator|locator)\b|(?:à|a)\s+(?:vérifier|verifier|contrôler|controler|confirmer|localiser)/i;
const NON_DIRECT_ITEM_EVIDENCE_RE = /\brepresentative\s+(?:sample|evidence|spot[- ]?check)\b|\b(?:item(?:'s)?\s+own\s+)?(?:specific\s+)?citation\s+(?:was\s+)?not\s+independently\s+re[- ]?read\b|\bnot\s+independently\s+(?:re[- ]?read|read|verified|checked)\b|\bcitation\s+(?:is\s+|was\s+)?used\s+as[- ]is\b|\bfollows?\s+(?:the\s+)?same\s+verified\s+(?:batch\s+)?pattern\b|\bsame\s+(?:verified\s+)?citation\s+pattern\b|\bnot\s+(?:item|claim)[- ]specific\b|\b(?:item|claim)[- ]specific\b.{0,80}\b(?:still\s+)?(?:needs?|requires?)\b.{0,32}\b(?:provenance|verification|re[- ]?read|evidence|source(?:\s+support)?)\b|\b(?:item|claim)[- ]specific\b.{0,48}\b(?:provenance|verification|re[- ]?read|evidence|source(?:\s+support)?)\b.{0,24}\b(?:(?:is|remains?)\s+)?(?:still\s+)?(?:required|needed|missing|unresolved|incomplete)\b|(?:échantillon|echantillon)\s+repr(?:é|e)sentatif(?:ve)?\b|\b(?:citation|référence|reference|preuve|provenance)\b.{0,48}\b(?:non|pas)\s+(?:relue?|vérifi(?:é|e)e?|verifi(?:é|e)e?|contrôl(?:é|e)e?|controlee?)\s+indépendamment\b|\b(?:preuve|evidence|provenance|citation|référence|reference)\b.{0,32}\bnon\s+sp(?:é|e)cifique\b.{0,24}\b(?:item|élément|element|point|question|claim)\b|\b(?:item|élément|element|point|question|claim)\b.{0,24}\bnon\s+sp(?:é|e)cifique\b|\b(?:provenance|preuve|evidence|citation|référence|reference)\b.{0,32}\bsp(?:é|e)cifique\s+(?:à|a)\s+(?:l['’]?item|l['’]?(?:élément|element)|la\s+question|au\s+point|au\s+claim)\b.{0,48}\b(?:reste|restent|est|sont)\s+(?:à|a)\s+(?:confirmer|vérifier|verifier|documenter|tracer|relire)\b|\b(?:item|élément|element|point|question|claim)[- ]sp(?:é|e)cifique\b.{0,64}\b(?:reste|restent|est|sont)\s+(?:à|a)\s+(?:confirmer|vérifier|verifier|documenter|tracer|relire)\b/i;

export function isExplicitNonVerifiedEvidence(value) {
  return NON_VERIFIED_EVIDENCE_RE.test(String(value ?? ""));
}

export function isVerifiedFrState(value) {
  const text = String(value ?? "");
  if (NON_VERIFIED_FR_STATE_RE.test(text)) return false;
  return /FROZEN|SOURCE VERIFIED|\bVERIFIED\b/i.test(text);
}

export function hasIataDgrSourceIdentity(value) {
  const text = String(value ?? "")
    .replace(/[`*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Deterministic provenance syntax only. Both the repository's canonical DGR
  // shorthand and the spelled-out official title must themselves be the source
  // lead (optionally prefixed by a controlled governance-state label). Merely
  // mentioning the official title inside another named source such as a company
  // manual or local guide is not direct IATA Tier-A provenance.
  const sourceLeadMatch = text.match(
    /^(?:(?:SOURCE VERIFIED|FROZEN FR|VERIFIED|CONFIRMED|DIRECT TIER[- ]?A|TIER[- ]?A)\s*(?:[-—:]\s*)?)*(?:(?:IATA\s+)?DGR\b|IATA\s+Dangerous\s+Goods\s+Regulations?\b)/i,
  );
  if (!sourceLeadMatch) return false;

  // A source lead is not sufficient by itself. Without edition binding, a
  // third-party title such as `DGR Company Manual 67th Edition 2026 ...` or
  // `IATA Dangerous Goods Regulations Training Manual 67th Edition 2026 ...`
  // can masquerade as the official source simply because it contains the right
  // words. Require the current-edition marker to follow the controlled source
  // lead directly, allowing punctuation/spacing only.
  const afterLead = text.slice(sourceLeadMatch[0].length);
  return /^\s*(?:[-—:,]\s*)?67(?:th|e|ème|eme)\b/i.test(afterLead);
}

function hasEdition67(value) {
  const text = String(value ?? "");
  return /\b67(?:th|e|ème|eme)\b|67th edition|67e édition/i.test(text);
}

function sourceSegments(value) {
  return String(value ?? "")
    .replace(/[`*_]/g, " ")
    .split(/(?:\r?\n|;|\|)/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function hasCurrentEdition2026(value) {
  // Bind source identity + edition + year to one source segment. Whole-cell
  // co-occurrence is insufficient because an older DGR citation and a separate
  // local/current reference must not combine into synthetic current Tier-A
  // provenance.
  return sourceSegments(value).some(
    (segment) => hasIataDgrSourceIdentity(segment) && hasEdition67(segment) && /\b2026\b/.test(segment),
  );
}

function dottedLocatorHasVersionPrefix(text, index) {
  const prefix = text.slice(Math.max(0, index - 32), index);
  return /(?:^|\b)(?:v(?:er(?:sion)?)?|rev(?:ision)?)\s*[.:#=_-]*\s*$/i.test(prefix);
}

export function hasConcreteLocator(value) {
  const text = String(value ?? "").replace(/[`*_]/g, " ");

  // Deterministic syntax only: this deliberately does not validate the cited
  // licensed IATA text. It requires a durable locator shape beyond the edition
  // and year, such as a section/table/page token or a dotted section number.
  if (
    /§{1,2}\s*\d+(?:\.\d+)*(?:\([a-z0-9]+\))*/i.test(text) ||
    /\b(?:section|subsection|paragraph|para\.?|table|figure|fig\.?|appendix|attachment|page|p\.)\s*(?:[a-z]?\d[\w.-]*|[a-z])\b/i.test(text)
  ) {
    return true;
  }

  // Bare dotted references are used throughout the repository for genuine DGR
  // section locators (for example `5.0.1.2(c)`), so they remain supported.
  // However, a version/revision token such as `v1.0`, `version 2.3` or
  // `rev. 3.1` is not a regulatory locator and must not satisfy this gate.
  const dottedLocatorRe = /\b[1-9]\d?(?:\.\d+){1,5}(?:\([a-z0-9]+\))*/gi;
  for (const match of text.matchAll(dottedLocatorRe)) {
    if (!dottedLocatorHasVersionPrefix(text, match.index ?? 0)) return true;
  }
  return false;
}

export function hasCurrentEdition2026WithConcreteLocator(value) {
  // The concrete locator must belong to the same source segment that identifies
  // IATA DGR 67th Edition 2026. A locator from a separate local/legacy source
  // cannot be borrowed to satisfy the direct Tier-A evidence gate.
  return sourceSegments(value).some(
    (segment) =>
      hasIataDgrSourceIdentity(segment) &&
      hasEdition67(segment) &&
      /\b2026\b/.test(segment) &&
      hasConcreteLocator(segment),
  );
}

export function hasProvisionalPhrase(value) {
  return PROVISIONAL_RE.test(String(value ?? ""));
}

export function hasNonDirectItemEvidence(value) {
  return NON_DIRECT_ITEM_EVIDENCE_RE.test(String(value ?? ""));
}

export function reviewerAndDateLooksComplete(value) {
  const text = String(value ?? "").trim();
  const date = text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ?? "";
  const reviewer = text
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
    .replace(/[|;,/()\-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return Boolean(
    reviewer &&
      date &&
      !/pending|tbd|todo|not yet|non renseign|à renseigner|a renseigner/i.test(reviewer),
  );
}

export function validateTierAEvidenceForFrState({ tierAEvidence, frState, frVerifier }) {
  const errors = [];
  const evidence = String(tierAEvidence ?? "").trim();
  const verified = isVerifiedFrState(frState);
  const nonVerifiedEvidence = isExplicitNonVerifiedEvidence(evidence);

  if (!evidence) {
    errors.push("missing Tier-A evidence or explicit non-verified source state");
    return errors;
  }

  if (verified) {
    if (nonVerifiedEvidence) {
      errors.push("FR state claims verification while Tier-A evidence is explicitly non-verified");
    }
    if (hasProvisionalPhrase(evidence)) {
      errors.push("FR verified state relies on provisional/pending Tier-A evidence wording");
    }
    if (hasNonDirectItemEvidence(evidence)) {
      errors.push("FR verified state relies on representative/indirect or explicitly non-item-specific Tier-A evidence wording");
    }
    if (!hasCurrentEdition2026(evidence)) {
      errors.push("FR verified state lacks explicit IATA DGR 67th Edition 2026 evidence identification");
    }
    if (hasCurrentEdition2026(evidence) && !hasCurrentEdition2026WithConcreteLocator(evidence)) {
      errors.push("FR verified state lacks a concrete section/table/page locator bound to the same current DGR source segment");
    }
    if (!reviewerAndDateLooksComplete(frVerifier)) {
      errors.push("FR verified state lacks a named verifier + ISO review date");
    }
    return errors;
  }

  // A non-verified FR state such as DRAFT / SOURCE GAP / SOURCE CONFLICT may
  // retain representative or prior-locator wording as a reconciliation lead.
  // That wording becomes a hard failure only if the row claims FR verification.
  // Otherwise, a cell presenting affirmative evidence must still identify a
  // current-edition locator rather than vague provisional prose.
  if (nonVerifiedEvidence) return errors;

  if (hasProvisionalPhrase(evidence) && !hasNonDirectItemEvidence(evidence)) {
    errors.push("Tier-A evidence cell is provisional but does not use an explicit non-verified source state");
  }
  if (!hasCurrentEdition2026(evidence)) {
    errors.push("Tier-A evidence is neither an explicit non-verified state nor identified as IATA DGR 67th Edition 2026");
  }
  if (hasCurrentEdition2026(evidence) && !hasCurrentEdition2026WithConcreteLocator(evidence)) {
    errors.push("current-edition Tier-A evidence lacks a concrete section/table/page locator bound to the same current DGR source segment");
  }

  return errors;
}
