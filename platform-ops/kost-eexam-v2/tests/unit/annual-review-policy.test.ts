import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { validateAnnualReviewPolicy } from "../../lib/annual-review-policy";

const NOW = new Date("2026-09-01T12:00:00.000Z");

describe("annual review terminal policy", () => {
  test("rejects REVUE_TERMINEE without reviewer qualification/authority", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2026,
        reviewDate: "2026-08-31",
        decision: "REVUE_TERMINEE",
        reviewerQualification: "   ",
      },
      NOW
    );
    assert.equal(error, "La qualification ou l’autorité du réviseur est obligatoire pour marquer la revue comme terminée.");
  });

  test("rejects a future review date", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2026,
        reviewDate: "2026-09-02",
        decision: "REVUE_TERMINEE",
        reviewerQualification: "Instructeur DGR — autorité documentée",
      },
      NOW
    );
    assert.equal(error, "La date de revue ne peut pas être dans le futur.");
  });

  test("rejects an impossible calendar date", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2026,
        reviewDate: "2026-02-31",
        decision: "REVUE_EN_COURS",
      },
      NOW
    );
    assert.equal(error, "Date de revue invalide.");
  });

  test("rejects reviewYear inconsistent with the actual review date", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2025,
        reviewDate: "2026-08-31",
        decision: "REVUE_TERMINEE",
        reviewerQualification: "Instructeur DGR — autorité documentée",
      },
      NOW
    );
    assert.equal(error, "L’année applicable doit correspondre à l’année de la date de revue.");
  });

  test("accepts a coherent completed review with documented reviewer authority", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2026,
        reviewDate: "2026-08-31",
        decision: "REVUE_TERMINEE",
        reviewerQualification: "Instructeur DGR — autorité documentée",
      },
      NOW
    );
    assert.equal(error, undefined);
  });

  test("keeps non-terminal states representable without fabricated qualification", () => {
    const error = validateAnnualReviewPolicy(
      {
        reviewYear: 2026,
        reviewDate: "2026-08-31",
        decision: "A_REVOIR",
      },
      NOW
    );
    assert.equal(error, undefined);
  });
});
