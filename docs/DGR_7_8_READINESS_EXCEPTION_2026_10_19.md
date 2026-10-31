# Function 7.8 — regulatory and bilingual readiness exception (2026-10-19)

**Scope:** KOST DGR/CBTA Stage 2B.1; PR #3; Function **7.8 — flight operations personnel / flight dispatchers**. **DRAFT / PRE-PRODUCTION / NOT APPROVED.** This is a repository and exact-head GitHub Actions audit, **not** a fresh reading of licensed IATA DGR 67th Edition 2026 text, qualified FR/EN signoff, or ANAC/IATA authorization.

## Function-specific CBTA task authority and draft scope

- `docs/DGR_OFFICIAL_TASK_SET_7.8.md` records **23 independently derived official leaf tasks** from the separately cross-validated **IATA CBTA Training Guidance Ed.1 (2023), TABLEAU 7.8.A** (PDF p.34 / printed p.30): **Block 0 = 18; Block 6.2 = 5; Block 7 = absent**. Do not invent a reporting Block 7 from local over-teaching, or copy Function 7.1's 44-task structure.
- Separate source-governed artifacts exist: `docs/DGR_STAGE2A_FUNCTION_7.8_BLUEPRINT.md` (provisional *source-yield ceiling*, not a quota), `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.8.md`, `docs/DGR_PRODUCTION_BANK_7.8.md` (**51 drafted items**), and `docs/DGR_EN_REVIEW_PACKAGE_7.8.md` (**51 matching draft EN item IDs**).
- The source/competency matrix records local gaps separately from current-edition rule verification. **Task 0.3.2** is a local source limitation; do not infer current IATA DGR text from that local gap. Older **66th Edition-related Tier B** course slides and past representative/cross-applied checks cannot establish direct per-item **67th Edition 2026 Tier-A** support.

## Exact-head test evidence and unresolved regulatory claims

Audited PR #3 HEAD `864afaa03c982cd6a409cc84fcf18592372fbaac` (2026-10-19). The [DGR regulatory readiness run #548](https://github.com/relaxsaadi/cbta/actions/runs/39182766947) and [DGR direct Tier-A provenance run #232](https://github.com/relaxsaadi/cbta/actions/runs/39182766679) **FAIL**; these are test-policy failures, **not** proof that the underlying answers are incorrect.

**12** Function 7.8 items still have `FROZEN FR / SOURCE VERIFIED` labels despite representative or insufficiently individualized 2026 Tier-A evidence:

`Q-7.8-007`, `Q-7.8-008`, `Q-7.8-009`, `Q-7.8-011`, `Q-7.8-016`, `Q-7.8-017`, `Q-7.8-021`, `Q-7.8-033`, `Q-7.8-035`, `Q-7.8-040`, `Q-7.8-043`, `Q-7.8-047`.

**Two additional direct-evidence exceptions:** `Q-7.8-018` and `Q-7.8-036` assert `FR SOURCE GAP CONFIRMED` without item-specific affirmative evidence sufficient to establish the claimed *regulatory absence*. Treat these as unresolved source-classification questions, not confirmed DGR absences. Local pedagogical definitions may require a separately governed non-DGR source; do not fabricate a DGR rule.

The stricter affirmative-evidence job additionally flags other terminal-state source assertions on this function as cross-applied, batch-derived, or missing explicit item-specific current-edition binding. Its wider finding is **not** limited to the 12 frozen items and must be resolved item-by-item.

## FR-status mirror and independent EN review

The same exact-head full-readiness job reports **17** overlapping Function 7.8 entries with missing, unclassified, or stale **EN-package mirrored FR status**:

`Q-7.8-007`, `Q-7.8-008`, `Q-7.8-009`, `Q-7.8-011`, `Q-7.8-016`, `Q-7.8-017`, `Q-7.8-018`, `Q-7.8-021`, `Q-7.8-027`, `Q-7.8-033`, `Q-7.8-035`, `Q-7.8-036`, `Q-7.8-040`, `Q-7.8-043`, `Q-7.8-046`, `Q-7.8-047`, `Q-7.8-050`.

These findings **overlap** the 12-item Tier-A list; do not add them as 29 distinct errors. **Do not blindly copy a potentially over-promoted FROZEN state into EN** just to satisfy the checker. First reconcile effective FR claim/source state against direct evidence, matrix, bank, and import-control CSV; only then update the EN package's *FR status mirror*. Actual `BILINGUAL TECHNICAL REVIEW REQUIRED` is independent and remains pending.

## Remediation and release gates

1. For every regulatory claim, correct answer and material distractor, bind the exact current **IATA DGR 67th Edition 2026** source/version/locator and access-controlled evidence record to the **specific item**; keep qualified reviewer identity and verification date independently auditable. If evidence is unavailable/contradictory, retain explicit `SOURCE GAP` / `SOURCE CONFLICT` or `TIER_A_PROVENANCE_UNRESOLVED`; do not claim verified absence without affirmative support.
2. Verify the French source claims with a **named qualified FR reviewer + date**; separately commission English bilingual technical review and record its **named qualified reviewer + date**. No item can become `APPROVED` from an automated check or copied source claim.
3. Keep import/production eligibility **NO** until direct provenance, FR/EN approvals, and safety gates are real; reconcile already-imported runtime records separately if any exist. Never overwrite historical answers, scores, or audit trails to achieve a green check.
4. Keep PR #3 **DRAFT**. A green task/CSV structure test is not an exam security, historical integrity, deployment, recovery, or regulatory-readiness proof. The failed Vercel target for the commercial `kost-funnel` website is **not evidence of Moodle/E-EXAM deployment failure**; verify platform deployments separately.

**Outcome:** **NOT READY**. This document records unresolved evidence and status consistency; it changes no question, correct answer, review status, regulatory fact, secret, or ANAC/IATA claim.
