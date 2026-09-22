export const QUESTION_LANGUAGES = ["fr", "en"] as const;

export type QuestionLanguage = (typeof QUESTION_LANGUAGES)[number];

/**
 * Question-bank language is a controlled integrity field, not free text.
 * Callers may provide a fallback only for legacy UI paths that pre-date the
 * language selector; any explicit unsupported value still fails closed.
 */
export function parseQuestionLanguage(value: unknown, fallback?: QuestionLanguage): QuestionLanguage {
  const raw = value == null ? "" : String(value).trim().toLowerCase();
  if (!raw && fallback) return fallback;
  if (raw === "fr" || raw === "en") return raw;
  throw new Error("Langue de question invalide — seules les valeurs fr et en sont autorisées.");
}

/**
 * Candidate-facing True/False labels follow the question language while the
 * semantic answer keys remain stable (`true` / `false`) for grading and
 * historical compatibility.
 */
export function trueFalseChoicesForLanguage(language: QuestionLanguage): { key: "true" | "false"; text: string }[] {
  return language === "en"
    ? [
        { key: "true", text: "True" },
        { key: "false", text: "False" },
      ]
    : [
        { key: "true", text: "Vrai" },
        { key: "false", text: "Faux" },
      ];
}
