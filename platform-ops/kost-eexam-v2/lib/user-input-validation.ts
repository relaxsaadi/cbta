const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CandidateIdentityInput {
  fullName: string;
  username: string;
  email: string;
}

export interface NormalizedCandidateIdentity {
  fullName: string;
  username: string;
  email: string;
}

export function normalizeEmailAddress(input: string): { value?: string; error?: string } {
  const email = input.trim().toLowerCase();
  if (!email) return { value: "" };
  if (CONTROL_CHARS.test(email) || email.length > 254 || !EMAIL_SHAPE.test(email)) {
    return { error: "Adresse email invalide." };
  }
  return { value: email };
}

export function normalizeAccountIdentity(
  input: CandidateIdentityInput,
  options: { emailRequired: boolean }
):
  | { value: NormalizedCandidateIdentity; error?: never }
  | { value?: never; error: string } {
  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const emailResult = normalizeEmailAddress(input.email);

  if (emailResult.error) return { error: emailResult.error };
  if (!fullName || !username) {
    return { error: "Nom complet et identifiant sont obligatoires." };
  }
  if (options.emailRequired && !emailResult.value) {
    return { error: "L'email est obligatoire." };
  }
  if (CONTROL_CHARS.test(fullName) || CONTROL_CHARS.test(username)) {
    return { error: "Nom, identifiant ou email contient un caractère de contrôle interdit." };
  }

  return { value: { fullName, username, email: emailResult.value ?? "" } };
}

/**
 * Canonical server-side identity validation for candidate provisioning.
 * Browser input types are UX only and are never treated as an integrity
 * boundary. The rule deliberately stays permissive for Unicode names and
 * identifiers while rejecting empty/control-character values and obviously
 * malformed email addresses.
 */
export function normalizeCandidateIdentity(input: CandidateIdentityInput):
  | { value: NormalizedCandidateIdentity; error?: never }
  | { value?: never; error: string } {
  const result = normalizeAccountIdentity(input, { emailRequired: true });
  if (result.error) {
    if (result.error === "Nom complet et identifiant sont obligatoires." || result.error === "L'email est obligatoire.") {
      return { error: "Champs obligatoires manquants (full_name, username, email)." };
    }
    return { error: result.error };
  }
  return result;
}
