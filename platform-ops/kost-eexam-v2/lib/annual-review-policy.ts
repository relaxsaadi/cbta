import type { AnnualReviewDecision } from "./questions";

export interface AnnualReviewPolicyInput {
  reviewYear: number;
  reviewDate: string;
  decision: AnnualReviewDecision;
  reviewerQualification?: string;
}

function parseExactDateOnly(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10) === value ? value : undefined;
}

/**
 * Server-side policy for annual-review evidence integrity.
 *
 * This deliberately does not manufacture reviewer identity, qualification,
 * edition, or dates. Non-terminal states remain representable while a
 * terminal REVUE_TERMINEE requires documented reviewer authority and a
 * coherent, already-occurred review date.
 *
 * A durable review-evidence locator is tracked separately by readiness
 * blocker #16 and is intentionally not invented here.
 */
export function validateAnnualReviewPolicy(input: AnnualReviewPolicyInput, now = new Date()): string | undefined {
  if (!Number.isInteger(input.reviewYear) || input.reviewYear < 2000 || input.reviewYear > 2100) {
    return "Année de revue invalide.";
  }

  const exactReviewDate = parseExactDateOnly(input.reviewDate);
  if (!exactReviewDate) return "Date de revue invalide.";

  const today = now.toISOString().slice(0, 10);
  if (exactReviewDate > today) return "La date de revue ne peut pas être dans le futur.";

  const dateYear = Number(exactReviewDate.slice(0, 4));
  if (input.reviewYear !== dateYear) {
    return "L’année applicable doit correspondre à l’année de la date de revue.";
  }

  if (input.decision === "REVUE_TERMINEE" && !input.reviewerQualification?.trim()) {
    return "La qualification ou l’autorité du réviseur est obligatoire pour marquer la revue comme terminée.";
  }

  return undefined;
}
