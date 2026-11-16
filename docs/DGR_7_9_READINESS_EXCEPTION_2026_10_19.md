# Function 7.9 — regulatory and bilingual readiness exception (2026-10-19)


## 2026-11-16 strict-current-edition Tier-A evidence scope correction (current PR #3 head)

At exact PR #3 head `e28314184f4305eeb9df9015efe38742725f88d2`, the [direct item Tier-A provenance CI job](https://github.com/relaxsaadi/cbta/actions/runs/43788447331/job/133041237829) flags **22 distinct Function 7.9 questions** with terminal regulatory-state evidence that is representative, cross-applied or otherwise insufficiently direct for an item-specific current-edition claim. This is broader than the **14 historically FROZEN/source-verified** questions highlighted by the separate [full-readiness CI job](https://github.com/relaxsaadi/cbta/actions/runs/43788447365/job/133041343501). The fourteen remain blocked; the additional **eight** distinct items are `Q-7.9-001`, `002`, `010`, `026`, `028`, `033`, `034` and `037`.

**Complete 22-item strict provenance diagnostic** (all IDs prefixed `Q-7.9-`): `001`, `002`, `004`, `007`, `010`, `011`, `014`, `015`, `017`, `019`, `020`, `021`, `025`, `026`, `027`, `028`, `029`, `033`, `034`, `036`, `037`, `039`. Within this set, `Q-7.9-001`, `002`, `010` and `033` **also lack explicit per-item IATA DGR 67th Edition 2026 binding**. These diagnostic categories overlap; do not add their counts.

Separately, the same-head full-readiness job reports **16 bank/EN mirrored-FR-status discrepancies** (listed in the 2026-11-14 section below). Status-mirror reconciliation does not itself constitute qualified independent EN review. `Q-7.9-022` and `023` remain `SOURCE GAP UNRESOLVED` despite not appearing in the 22-item terminal-state diagnostic, and `Q-7.9-032` remains `SOURCE CONFLICT` concerning the 2026 power-bank addendum. **No item among the 39 provisional questions is hereby verified or promoted.**

Each affected regulatory assertion requires an independently traceable, authorized **IATA DGR 67th Edition 2026 Tier-A** reference with exact edition/addendum, section/table/page, language, per-item evidence and applicability check. Missing/conflicting sources must retain explicit `SOURCE GAP` / `SOURCE CONFLICT` holds. Require named qualified FR reviewer/date and separate qualified EN bilingual reviewer/date before `APPROVED`, and keep new imports blocked until all question-level release conditions are met. This is a documentation-only audit correction based on CI diagnostics, **not** a fresh reading of the licensed DGR, human approval, Moodle/console acceptance or ANAC/IATA authorization. No question, answer, key, approval, reviewer, import flag or runtime data is changed.

## 2026-11-14 exact-head FR↔EN status-count update (supersedes the historical 18 count below)

At PR #3 head `760d0c31cc5e44cafa4963e43ab88167e19e1bc9`, the [Full DGR readiness job](https://github.com/relaxsaadi/cbta/actions/runs/43599551184/job/132461247506) reports **16**, not 18, Function 7.9 bank/EN mirrored-FR-status mismatches: `Q-7.9-004`, `007`, `009`, `011`, `014`, `015`, `016`, `017`, `019`, `020`, `021`, `025`, `027`, `029`, `036`, `039` (all with `Q-7.9-` prefix). The older 18-item finding below belongs to the historical head `024aee9d`, and includes `Q-7.9-022` and `Q-7.9-023`, which are **no longer in this particular current mirror-failure list**; both still remain **SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED**. The same current job still reports **14** FROZEN/source-verified items lacking adequately individualized direct Tier-A evidence. Do not sum these overlapping sets, infer FR/EN approval, or restore stale `FR SOURCE GAP CONFIRMED` statuses. The 39 provisional 7.9 questions remain blocked from import pending direct current licensed 2026 evidence, separately qualified dated FR and EN human review, and release-security acceptance. This update changes documentation only; no question, answer, reviewer, import, or deployment state was altered.

## 2026-11-12 superseding regulatory evidence correction — Q-7.9-022 / Q-7.9-023

Both items are now effectively **`SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**, not `FR SOURCE GAP CONFIRMED`. The Q-7.1-001 historical Appendice A / §1.0 / targeted `Risque` search was limited; it did not prove DGR-wide absence of danger/risque treatment or independently check these F7.9 items. KOST slides 31–33 are Tier B course material. Direct authorized current IATA DGR 67th Edition 2026 Tier A item evidence or a governed, explicitly non-DGR pedagogical source decision is required, along with a named qualified FR reviewer/date and separate qualified EN reviewer/date. Their prior cross-applied August statuses are audit history, not current signoff. No answer/stem/distractor, approval, import or deployment changed; both remain blocked from secure production exams.


## 2026-11-12 new item-level conflict: Q-7.9-032

This function's own question Q-7.9-032 historically used DGR 67th Edition/AM1 §§2.3.5.8.3 and 2.3.5.8.4(c) (2026-08-25) for operator-approval thresholds of >15 PED and >20 spare batteries, while including external batteries. [IATA's public operator guidance, 31 March 2026](https://www.iata.org/contentassets/90f8038b0eea42069554b2f4530f49ea/guidance-to-operators---power-banks.pdf), discussing the ICAO TI addendum effective 27 March 2026, distinguishes personal-use power banks and limits them to two (pp. 1, 4, 10). The effective item state is now **`SOURCE CONFLICT — 2026 POWER_BANK_ADDENDUM_REVIEW_REQUIRED`** until independently reviewed direct licensed 2026 FR DGR/addendum text, State/operator applicability, named qualified FR/date and separate EN/date support a scoped decision. No claim that ordinary spare-battery threshold itself is universally false. No question answer was changed; do not import or approve.

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
