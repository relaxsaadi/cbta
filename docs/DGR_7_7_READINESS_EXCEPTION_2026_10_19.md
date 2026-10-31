# Function 7.7 — regulatory and bilingual readiness exception (2026-10-19)

**Scope:** KOST DGR/CBTA Stage 2B.1; PR #3; Function **7.7 — Équipage de conduite**. **DRAFT / PRE-PRODUCTION / NOT APPROVED.** This note records exact-head repository/CI evidence. It is not a re-examination of licensed IATA DGR text and is not an ANAC/IATA approval.

## Independent task and question-source baseline

- `docs/DGR_OFFICIAL_TASK_SET_7.7.md` records **27 independent CBTA leaf tasks**, based on IATA CBTA Training Guidance Ed.1 (2023), **TABLEAU 7.7.A**: Block 0 **18**, Block 6 (6.2) **5**, Block 7 **4**. This task-table evidence controls the Function 7.7 scope, but **does not verify claims against the 2026 IATA DGR 67th Edition**. Do not inherit Function 7.1's 44-task structure.
- Function-specific artifacts are `docs/DGR_STAGE2A_FUNCTION_7.7_BLUEPRINT.md` (provisional source-yield ceiling, not an exam-question quota), `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.7.md`, `docs/DGR_PRODUCTION_BANK_7.7.md` (**53 drafted questions, Q-7.7-001–053**), and `docs/DGR_EN_REVIEW_PACKAGE_7.7.md` (unapproved FR→EN translation material).
- The 7.7 blueprint/competency matrix expressly retain **task 0.3.2** as a local teaching-material **SOURCE GAP** (no question may be invented to fill it). This local coverage gap is not proof that the current DGR contains or does not contain a particular rule.
- The training materials underlying the current draft are older **66th Edition-based Tier B** course materials. Historical narrative claims of Bookshelf verification and cross-application from other functions are **not** individual direct authenticated current-67th-Edition Tier-A evidence and confer no approval.

## Exact GitHub Actions evidence

Examined PR #3 head `024aee9dcb738cdc77af8918b91e499f6a6796dd` (2026-10-19 Algiers time). The [DGR regulatory readiness run 39178057395](https://github.com/relaxsaadi/cbta/actions/runs/39178057395), **Full DGR readiness** job `117824805878`, fails. The [DGR direct Tier-A provenance run 39178057437](https://github.com/relaxsaadi/cbta/actions/runs/39178057437) fails as well. These are repository policy/test findings, not a qualified regulator's determination.

The readiness job flags **14 Function 7.7 questions** labeled `FROZEN FR / SOURCE VERIFIED` despite representative, cross-applied or otherwise non-item-specific regulatory evidence:

`Q-7.7-003`, `005`, `013`, `014`, `016`, `017`, `018`, `022`, `024`, `026`, `041`, `044`, `045`, `048`.

**Additional direct-evidence exception:** `Q-7.7-019` is treated as `FR SOURCE GAP CONFIRMED` without individual direct current-DGR evidence sufficient to substantiate a *confirmed absence* conclusion. Keep this unresolved (`TIER_A_PROVENANCE_UNRESOLVED` / `SOURCE GAP`, as appropriate to the exact claim and the evidence trail), rather than automatically accepting or rejecting the asserted gap.

## EN-package FR-status mirror divergence

The same exact-head readiness job independently flags **20 overlapping Function 7.7 items** whose EN-package mirrored FR state is missing, unclassified, or stale relative to the production bank:

`Q-7.7-002`, `003`, `005`, `013`, `014`, `015`, `016`, `017`, `018`, `019`, `022`, `024`, `026`, `029`, `041`, `043`, `044`, `045`, `046`, `048`.

These lists **overlap**. Neither the 14-item count nor the 20-item count is a tally of distinct confirmed regulatory factual errors. **Do not copy a potentially over-promoted `FROZEN` flag into EN solely to satisfy the mirror checker**; first reconcile the *effective* FR state with the per-item source evidence, matrix, production bank, and CSV import state. Keep EN technical review independent and pending.

## Required fail-closed remediation

1. For each affected item, link each regulatory assertion, right answer and material distractor to **direct current IATA DGR 67th Edition 2026 Tier-A evidence**, including exact locator, edition/version, source language, access-controlled artifact binding, named qualified FR reviewer and dated verification. Do not copy licensed text, bypass DRM, invent evidence, or rely on cross-function sample citations.
2. Represent unresolved or contradictory evidence explicitly using `TIER_A_PROVENANCE_UNRESOLVED`, `SOURCE GAP`, or `SOURCE CONFLICT` as justified. A pedagogical/course-source gap does not establish a regulatory gap. Align the canonical per-item effective FR state and EN mirrored FR state **without completing** EN review; require a separate named qualified EN reviewer and dated bilingual meaning-equivalence check.
3. Keep non-cleared items out of **new** production imports. Check any already-published Moodle/E-EXAM copies by auditable release procedures; setting repository CSV eligibility to `NO` does not retract previously imported questions.
4. Preserve independent Stage 2B.1 technical gates: candidate workflow and attempt history, roles/RBAC/isolation, audit trail, FR/EN behavior, Moodle-console sync, grading/type immutability, app security, clean builds/tests, deployment/runbook, backup/recovery, monitoring and known limitations. The `kost-funnel` commercial Vercel failure does **not** prove E-EXAM/Moodle deployment failure.

**Disposition:** Function **7.7 NOT APPROVED — qualified FR/EN human review pending**; overall exam-platform status **NOT READY**. No exam question/answer, approval, security control, credential, deployment or production runtime data is changed by this document.
