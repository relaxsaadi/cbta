export const FAMILIARIZATION_AUDIENCES = [
  { value: "candidats", label: "Candidats", includesCandidates: true },
  { value: "personnel", label: "Personnel", includesCandidates: false },
  { value: "mixte", label: "Mixte (personnel + candidats)", includesCandidates: true },
] as const;

export type FamiliarizationAudience = (typeof FAMILIARIZATION_AUDIENCES)[number]["value"];

const ALLOWED_AUDIENCES = new Set<string>(FAMILIARIZATION_AUDIENCES.map((entry) => entry.value));

/**
 * Server-boundary parser for familiarisation audience values.
 * Client form values are untrusted; unknown/forged values must never be
 * persisted or used to decide outbound candidate notifications.
 */
export function parseFamiliarizationAudience(value: FormDataEntryValue | null): FamiliarizationAudience | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return ALLOWED_AUDIENCES.has(normalized) ? (normalized as FamiliarizationAudience) : null;
}

/** Candidate invitations are valid only for candidate-facing audiences. */
export function familiarizationAudienceIncludesCandidates(audience: FamiliarizationAudience): boolean {
  return audience === "candidats" || audience === "mixte";
}
