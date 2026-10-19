# Function 7.9 — regulatory and bilingual readiness exception (2026-10-19)

**Scope:** KOST DGR/CBTA Stage 2B.1 / PR #3 / Function **7.9 (Personnel de cabine)**. **DRAFT / PRE-PRODUCTION / NOT APPROVED.** This is an exact-head CI and repository traceability audit, **not** a fresh reading of licensed IATA DGR 67th Edition text and not an IATA/ANAC approval.

## Function-specific authority and current draft

- `docs/DGR_OFFICIAL_TASK_SET_7.9.md` derives **24 independent CBTA leaf tasks** from IATA CBTA Training Guidance Ed.1 (2023), **TABLEAU 7.9.A**, as separately cross-validated in the Function 7.9 Stage 1 records. Its actual official selection is **Block 0 = 16; Block 5.2 = 2; Block 6.2 = 2; Block 7 = 4**; never copy Function 7.1's 44-task structure or another function's assessment plan.
- Own artifacts: `docs/DGR_STAGE2A_FUNCTION_7.9_BLUEPRINT.md` (source-yield *provisional ceiling*, not a required item quota), `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.9.md`, `docs/DGR_PRODUCTION_BANK_7.9.md` (**39** drafted items) and `docs/DGR_EN_REVIEW_PACKAGE_7.9.md` (unapproved bilingual draft). Exact-head [Full DGR readiness job](https://github.com/relaxsaadi/cbta/actions/runs/39178057395) reports 39 bank IDs, 39 EN IDs, no missing/extra EN IDs and 24 matrix tasks with no missing/extra matrix linkage. Structural coverage is **not** regulatory correctness.
- **Function-specific local source constraints:** Task 0.3.2 is a local SOURCE GAP with no production question; accident/incident reporting questions can map to both 7.1 and 7.2 without merging those official task identities.
- The current KOST course material references the **66th Edition** and is **Tier B**, not sufficient direct IATA DGR 67th Edition 2026 Tier-A evidence. Historical cross-applied citation summaries and old `FROZEN` labels cannot establish item-specific current-edition verification by themselves.

## Exact-head failure evidence

At PR #3 exact head `024aee9dcb738cdc77af8918b91e499f6a6796dd`, the [regulatory readiness run 39178057395](https://github.com/relaxsaadi/cbta/actions/runs/39178057395) (Full DGR readiness job `117824805878`) and [direct Tier-A provenance run 39178057437](https://github.com/relaxsaadi/cbta/actions/runs/39178057437) **FAIL**. The former identifies **14** Function 7.9 questions still marked `FROZEN FR / SOURCE VERIFIED` despite representative, cross-applied or non-item-specific evidence:

`Q-7.9-004`, `Q-7.9-007`, `Q-7.9-011`, `Q-7.9-014`, `Q-7.9-015`, `Q-7.9-017`, `Q-7.9-019`, `Q-7.9-020`, `Q-7.9-021`, `Q-7.9-025`, `Q-7.9-027`, `Q-7.9-029`, `Q-7.9-036`, `Q-7.9-039`.

A separate direct-provenance check flags **2** item(s) asserting `FR SOURCE GAP CONFIRMED` without direct item-specific evidence for a *confirmed regulatory absence*:

`Q-7.9-022`, `Q-7.9-023`.

**Source-claim caution:** The regulator-absence assertions for Q-7.9-022 and Q-7.9-023 (danger/risque discussion) require direct current-edition evidence before any FR SOURCE GAP CONFIRMED disposition. A failed evidence gate does not prove a particular answer legally correct or incorrect.

## Separate FR↔EN state-mirror reconciliation

The same exact-head full-readiness job reports **18** overlapping item(s) whose EN review package has missing, unclassifiable or stale **mirrored FR status** compared with the bank:

`Q-7.9-004`, `Q-7.9-007`, `Q-7.9-009`, `Q-7.9-011`, `Q-7.9-014`, `Q-7.9-015`, `Q-7.9-016`, `Q-7.9-017`, `Q-7.9-019`, `Q-7.9-020`, `Q-7.9-021`, `Q-7.9-022`, `Q-7.9-023`, `Q-7.9-025`, `Q-7.9-027`, `Q-7.9-029`, `Q-7.9-036`, `Q-7.9-039`.

These 18 status mismatches overlap the 14 provenance findings. **Do not add the counts as independent regulatory errors.** Do not blindly mirror a potentially over-promoted `FROZEN` source state into EN to make the test green. First establish each item's **effective** FR state with direct 2026 evidence and then synchronize the EN *mirror only*, leaving actual EN review `BILINGUAL TECHNICAL REVIEW REQUIRED`.

## Required remediation and release consequence

1. Verify each regulatory assertion, answer and material distractor with **direct current IATA DGR 67th Edition 2026 Tier-A evidence** (authenticated licensed artifact identity, edition/version, exact section/table/page, language, item-level binding). If missing/contradictory, explicitly retain `TIER_A_PROVENANCE_UNRESOLVED`, `SOURCE GAP` or `SOURCE CONFLICT` as applicable. A gap in an old course cannot establish absence from the current DGR.
2. Reconcile **bank effective FR state → source/competency matrix → per-item CSV/import state → EN-package mirrored FR state** without changing exam content, answers or review history just to silence CI. Require qualified named **FR** verifier + date and a **separate qualified EN** bilingual reviewer + date before any `APPROVED` or import promotion.
3. Hold unresolved items out of **new** imports; separately audit already-deployed Moodle/E-EXAM candidate-visible content. A repository eligibility flag does not retract historical runtime questions.
4. Preserve independent platform gates: candidate workflow, roles/RBAC, audit/historical attempt integrity, bilingual rendering, Moodle/console integration, published question-type/grading immutability, app security, reproducible build/tests, deployment/runbook, monitoring, backup/recovery and limitations. The unrelated commercial `kost-funnel` Vercel failure cannot certify Moodle/E-EXAM status.

**Disposition:** Function 7.9 **NOT APPROVED — direct 2026 evidence + qualified FR/EN review pending**; KOST exam platform **NOT READY**. This note changes no question/answer, production eligibility, signer/approval, security setting, credential, runtime database or ANAC/IATA status.
