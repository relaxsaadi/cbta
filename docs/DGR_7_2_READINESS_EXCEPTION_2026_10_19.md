# Function 7.2 — Stage 2B.1 source and bilingual exceptions (2026-10-19)

## 2026-11-16 strict Tier-A diagnostic scope — distinct from four FROZEN failures

The [direct item Tier-A provenance CI job](https://github.com/relaxsaadi/cbta/actions/runs/43777563865) on exact PR #3 head `9f32c247a26c1eda0aee9f484d3ce5bfc4c8b9a8` flags **29 distinct Function 7.2 IDs** under its *strict terminal regulatory-state diagnostic*. This is broader than the **four historically FROZEN** items (`Q-7.2-035`, `039`, `044`, `049`) reported by the headline readiness gate. The extra **25** must not be treated as automatically source-verified merely because they are absent from that four-item FROZEN subset.

- **Strict diagnostic, 29 unique IDs:** `Q-7.2-001`, `004`, `005`, `007`, `008`, `009`, `010`, `011`, `013`, `014`, `015`, `016`, `017`, `018`, `019`, `020`, `021`, `024`, `025`, `026`, `027`, `034`, `035`, `039`, `040`, `041`, `043`, `044`, `049`.
- **Within those 29, 20** lack an explicit **per-item IATA DGR 67th Edition 2026** edition binding: `004`, `005`, `007`, `008`, `009`, `010`, `011`, `013`, `014`, `015`, `016`, `018`, `019`, `021`, `024`, `025`, `026`, `027`, `040`, `041`. Each suffix in this paragraph refers to `Q-7.2-NNN`.
- **Four** (`035`, `039`, `044`, `049`) lack a concrete per-item `DGR_Reference` and an affirmative current-edition `Bookshelf_Evidence_Found=YES` record. **Two others** (`008`, `021`) lack an affirmative item-specific direct read/search/verification signal. These are *overlapping subsets*, not additional questions to add to 29.
- The [Full DGR readiness CI job](https://github.com/relaxsaadi/cbta/actions/runs/43777563728) separately reports **10 overlapping FR-bank/EN-package mirror mismatches** for Function 7.2. The three historically affirmative SOURCE GAP examples `002`, `031`, `045` and the distinct `042` SOURCE CONFLICT remain under their own unresolved evidence gates; absence from the 29 terminal-state diagnostic is not clearance.

These are **CI provenance/metadata diagnostics, not substantive verification of licensed DGR text** and not proof that each answer is factually wrong. Retain `SOURCE GAP`, `SOURCE CONFLICT`, and unresolved Tier-A classifications as applicable. Require controlled item-specific evidence for both the regulatory assertion and answer, qualified **FR reviewer name/date**, separate qualified **EN bilingual reviewer name/date**, and final authorized decision. **No APPROVED, no production import, and no confidentiality reinstatement** are justified by this reporting correction. No question text, answers, reviewer record, status, or import eligibility is changed here.

## 2026-11-14 exact-head reconciliation — current diagnostic precedence

At PR #3 head `6b5ed21b478c6fa521bb16ed2f7cc674f40ae14b`, the [Full DGR readiness CI run](https://github.com/relaxsaadi/cbta/actions/runs/43574521664) still **fails**. It reports **4** historically FROZEN Function 7.2 items with representative/non-individualized Tier-A evidence (`Q-7.2-035`, `039`, `044`, `049`) and **10** overlapping bank/EN-package FR-status mirrors (`Q-7.2-003`, `006`, `023`, `028`, `031`, `035`, `037`, `039`, `044`, `049`). The **11** EN-mirror exceptions documented below are an earlier exact-head snapshot, **not the current CI count**: `Q-7.2-045` is no longer in this particular mirror warning, but remains `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED` in the current per-item reconciliation register. Its omission from this warning is **not** clearance, qualified review, approval, or import eligibility.

The Function 7.2 baseline remains **23** own-function CBTA leaf tasks and **49** provisional items, all `IMPORT_ELIGIBLE=NO`. Current source-specific direct IATA DGR 67th Edition 2026 evidence, named dated qualified FR verification and independent EN bilingual review are not established by this diagnostic correction. This note does not modify any question, key, evidence, reviewer, or import CSV. Re-evaluate against future exact-head CI rather than carrying forward any fixed count.

## 2026-11-13 provenance correction — Q-7.2-022

The previous `FR SOURCE GAP CONFIRMED` label reused a historical §9.5.1.2 section-specific mismatch; for 7.3 it also cross-applied the 7.2 conclusion. Such a finding does not establish the claimed employer/employee duty is absent throughout the current 67th Edition 2026. Correct current state: `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`. The original record remains historical, not direct item-specific Tier A evidence. Tier B course basis only; no question/answer change, approval, EN sign-off, or eligibility for import. Named, qualified FR verifier/date and a separate EN technical reviewer/date remain required.

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
