// Notes de "gap" honnêtes pour les 5 contrôles encore Partial (voir analyse
// Phase 3 §1) — jamais générées automatiquement, écrites une fois après
// analyse manuelle de chaque item. Toute autre exigence n'a pas de gap
// identifié dans le périmètre actuellement suivi.
export const ANAC_GAP_NOTES: Record<string, string> = {
  "OS compatibility":
    "Only tested from macOS (test runner) + Linux (Docker host) via Playwright, which proves browser-engine compatibility, not native OS compatibility. Gap: no test performed on a native Windows machine.",
  "Question bank populated with regulatory content":
    "Only 4 sample questions exist, created for technical validation. Gap: official DGR regulatory question content has not yet been authored — a KOST Academy pedagogical task, not a technical one.",
  "Exam creation, modification, deletion":
    "Real exams exist because KOST staff created them directly in Moodle Quiz, which is real but not a controlled demonstration. An attempt via Moodle's real create_module()/update_module() API hit a confirmed Moodle 5.0.1 core bug (password forced NULL, reviewattempt corrupted). An earlier claim based on direct SQL writes into mdl_quiz/mdl_course_modules with manually-triggered audit events has been retracted — a raw SQL write does not exercise Moodle's real validation or business logic and cannot serve as functional proof, even with a real audit event attached. Gap: no accepted functional demonstration of this capability yet.",
  "ANAC platform audit agreement":
    "Formal agreement with ANAC is in progress but not yet finalized or recorded in this system. Gap: entirely external/contractual — cannot be closed by any technical change.",
};
