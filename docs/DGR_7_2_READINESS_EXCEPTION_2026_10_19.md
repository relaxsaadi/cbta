# Function 7.2 — Stage 2B.1 source and bilingual exceptions (2026-10-19)

**DRAFT / PRE-PRODUCTION / NOT APPROVED / NOT READY.** This is a repository/CI audit, not direct examination of licensed IATA DGR 67th Edition 2026 text, not qualified human verification, and not evidence of IATA/ANAC authorization.

## Distinct function baseline

The canonical Function 7.2 task set is `docs/DGR_OFFICIAL_TASK_SET_7.2.md`: **23** leaf tasks independently derived from its own CBTA TABLEAU 7.2.A, not from Function 7.1. See its own Stage 2A blueprint, `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.2.md`, production draft `docs/DGR_PRODUCTION_BANK_7.2.md` (**49** questions, Q-7.2-001–049), and separately unapproved `docs/DGR_EN_REVIEW_PACKAGE_7.2.md`.

## Reproducible exact-head findings

At PR #3 head `47343df68e4a4ea301c68651d13241be6d55cfbb`, the [Direct item Tier-A provenance check](https://github.com/relaxsaadi/cbta/actions/runs/39223102579/job/117962829428) and [Full DGR readiness check](https://github.com/relaxsaadi/cbta/actions/runs/39223097425/job/117962995265) fail. Their diagnostic classifications are *not* proof that any question is substantively wrong.

- **Four FROZEN / source-verified claims relying on representative or non-item-specific evidence:** `Q-7.2-035`, `039`, `044`, `049`. Source-verified labels cannot substitute for directly bound claim-specific current-edition evidence.
- **Three affirmative SOURCE GAP classifications needing direct individual proof:** `Q-7.2-002`, `031`, `045`. A reported local/course gap, missing locator or sampling result alone cannot prove DGR-wide absence. Preserve unresolved source classification pending an authoritative current-edition check.
- **Eleven effective FR-status vs EN-package stale/missing mirrors:** `Q-7.2-003`, `006`, `023`, `028`, `031`, `035`, `037`, `039`, `044`, `045`, `049`. These sets overlap and should **not be added together**.
- **Distinct task-level conflict:** `Q-7.2-042` (UN3373/UN3245, task 0.5.2) has a separate fail-closed source-conflict record/PR #289. Do not silently reclassify it as verified or assume its PR is merged.

A broader strict affirmative-source check raises other issues beyond these headline counts. Current candidate-visible runtime data and imports were **not** tested by this note.

## Binding gates

For every item, record its exact Function 7.2 task/competency, current **IATA DGR 67th Edition 2026** Tier-A edition/section/locator and access-controlled direct evidence, with separate `SOURCE GAP` / `SOURCE CONFLICT` / `TIER_A_PROVENANCE_UNRESOLVED` where required. Reconcile current effective FR state across bank, matrix, CSV and EN review package **without** promoting FROZEN or APPROVED just to satisfy CI. Named, qualified FR regulator-source verifier + actual date and a separately named qualified EN bilingual reviewer + actual date are required before approval/import promotion. Keep unverified items out of production, and evaluate already-published runtime items separately.

No question text, answer, reviewer signoff, data-integrity record, import approval, licensed source material or regulatory claim was modified by this documentation.
