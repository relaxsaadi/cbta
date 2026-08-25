# Full-program readiness scope — Functions 7.1 → 7.10

Effective 2026-08-25. This file clarifies the end condition for the user's expanded scope.

## Scope correction

The current `docs/PLATFORM_READINESS_REPORT.md` label `TECHNICALLY READY / PRE-PRODUCTION READY — HUMAN REGULATORY REVIEW PENDING` applies to the **core platform/runtime evidence gathered so far**, not to completion of the full DGR/CBTA production-question program.

The user explicitly expanded the final project scope to cover **all Functions 7.1 through 7.10**. Therefore, do not interpret the core-platform label as a final project-completion label.

## Final project end condition

The project may be described as fully ready only when BOTH tracks are complete:

### Track A — platform/runtime readiness

- candidate exam lifecycle evidenced end-to-end;
- timer/autosave/reconnect/expiry/submission/scoring/integrity evidenced;
- RBAC model implemented and tested for every role actually advertised/required;
- audit trail/integrity evidenced;
- Moodle ↔ console integration evidenced;
- security/configuration gates passed;
- cross-browser/device/accessibility critical defects resolved or formally accepted with documented rationale;
- deployment/rollback/backups/restore evidenced;
- credentials exposed during diagnostics rotated where applicable.

### Track B — DGR/CBTA production-question program

For each Function 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, and 7.10:

1. Stage 1 task/sub-task structure independently derived from that function's own source set.
2. Stage 1 cross-validation completed; source gaps/conflicts explicitly recorded.
3. Function-specific Stage 2A blueprint produced and corrected after second-pass validation.
4. Source-supported production-bank scope/ceiling established; no arbitrary quota filling.
5. Regulatory-fact questions gated against current IATA DGR 67th Edition 2026 Tier A evidence.
6. Correct answer and every distractor traceable.
7. FR source-verification state explicit for every item.
8. EN bilingual technical review kept as a separate gate.
9. No `APPROVED` status without named qualified reviewer + review date.
10. Function-specific bank represented cleanly in the exam platform with revision/source/reviewer metadata and no cross-function leakage unless explicitly mapped.

## Current full-program status at creation

- 7.1: Stage 1 + Stage 2A complete; 12-item pilot terminal; production expansion batch drafted at Tier B and still needs current Tier A gating where regulatory facts are involved.
- 7.2: Stage 1 provisional draft complete (23 leaf sub-tasks); second-pass validation, Stage 2A, questions, Tier A and EN still open.
- 7.3: Stage 1 provisional draft complete (33 leaf sub-tasks); practice-book source gap identified; second-pass validation, Stage 2A, questions, Tier A and EN still open.
- 7.4–7.10: Stage 1 not yet completed.

See `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for the live per-function table.

## Required next-pass order

Do not stop at Function 7.3. Continue autonomously in this order unless a source dependency justifies a different sequence:

1. Close remaining **core technical gaps**: WCAG AA contrast defect, advertised manager/instructor role decision/implementation + server-side tests, any cross-browser timing defect that is a real product issue, and password rotation after the diagnostic exposure.
2. Re-establish licensed Bookshelf access in a fresh session when needed for Tier A checks; do not bypass DRM.
3. Finish Function 7.1 production expansion with Tier A source gates.
4. Cross-validate Function 7.2 Stage 1 → produce corrected Stage 2A → draft/verify bank.
5. Cross-validate Function 7.3 Stage 1 → produce corrected Stage 2A → draft/verify bank while retaining the practice-book SOURCE GAP.
6. Derive and complete the same pipeline for Functions 7.4 → 7.10, one function at a time.
7. Build EN review packages and reviewer sign-off packages, but do not self-approve them.
8. Update the final readiness report to distinguish:
   - core platform technically ready;
   - full 7.1–7.10 content-program completion;
   - EN/human regulatory review status.

## Final labels

Use these labels precisely:

- `CORE PLATFORM TECHNICALLY READY` — only when Track A critical gates are passed, even if DGR program expansion is incomplete.
- `FULL PROGRAM PRE-PRODUCTION READY — HUMAN REGULATORY REVIEW PENDING` — only when Track A is passed and Track B is complete except EN/named-reviewer human gates.
- `PLATFORM READY TO USE` — only when the user-defined deployment/readiness checklist is satisfied for the intended operational use and no critical unresolved technical/content gate remains. Do not imply ANAC/IATA approval unless separately evidenced.

Do not allow a prior narrower-scope readiness label to terminate work on Functions 7.4–7.10.