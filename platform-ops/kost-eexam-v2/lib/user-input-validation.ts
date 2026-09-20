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

type ValidationResult<T> =
  | { value: T; error: null }
  | { value: null; error: string };

export function normalizeEmailAddress(input: string): ValidationResult<string> {
  const email = input.trim().toLowerCase();
  if (!email) return { value: "", error: null };
  if (CONTROL_CHARS.test(email) || email.length > 254 || !EMAIL_SHAPE.test(email)) {
    return { value: null, error: "Adresse email invalide." };
  }
  return { value: email, error: null };
}

export function normalizeAccountIdentity(
  input: CandidateIdentityInput,
  options: { emailRequired: boolean }
): ValidationResult<NormalizedCandidateIdentity> {
  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const emailResult = normalizeEmailAddress(input.email);

  if (emailResult.error) return { value: null, error: emailResult.error };
  if (!fullName || !username) {
    return { value: null, error: "Nom complet et identifiant sont obligatoires." };
  }
  if (options.emailRequired && !emailResult.value) {
    return { value: null, error: "L'email est obligatoire." };
  }
  if (CONTROL_CHARS.test(fullName) || CONTROL_CHARS.test(username)) {
    return { value: null, error: "Nom, identifiant ou email contient un caractère de contrôle interdit." };
  }

  return { value: { fullName, username, email: emailResult.value }, error: null };
}

/**
 * Canonical server-side identity validation for candidate provisioning.
 * Browser input types are UX only and are never treated as an integrity
 * boundary. The rule deliberately stays permissive for Unicode names and
 * identifiers while rejecting empty/control-character values and obviously
 * malformed email addresses.
 */
export function normalizeCandidateIdentity(input: CandidateIdentityInput): ValidationResult<NormalizedCandidateIdentity> {
  const result = normalizeAccountIdentity(input, { emailRequired: true });
  if (result.error) {
    if (result.error === "Nom complet et identifiant sont obligatoires." || result.error === "L'email est obligatoire.") {
      return { value: null, error: "Champs obligatoires manquants (full_name, username, email)." };
    }
    return result;
  }
  return result;
}
