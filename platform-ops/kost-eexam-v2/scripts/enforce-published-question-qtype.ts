// Issue #58 — migration/enforcement step for published question qtype.
//
// This script is intentionally separate from schema.sql/migrate.ts because it
// performs DATA preflight before installing the SQLite triggers. If legacy
// published rows are structurally inconsistent with their current qtype, the
// migration must fail loudly instead of silently blessing a drifted state.
import { getDb, closeDb } from "../lib/db";
import { enforcePublishedQuestionQtypeIntegrity } from "../lib/published-question-qtype-integrity";

try {
  const result = enforcePublishedQuestionQtypeIntegrity(getDb());
  console.log(
    `Published qtype integrity enforced: ${result.publishedQuestions} published question(s), ${result.baselinesAdded} baseline(s) added.`
  );
} finally {
  closeDb();
}
