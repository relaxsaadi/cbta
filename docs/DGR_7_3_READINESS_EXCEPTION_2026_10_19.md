# Function 7.3 — Stage 2B.1 regulatory/bilingual exception (2026-10-19)

## 2026-11-15 exact-head CI reconciliation — Function 7.3

At PR #3 head `9b285bae5b648f3afa5b026e90971f38cb94a881`, the [full DGR readiness workflow](https://github.com/relaxsaadi/cbta/actions/runs/43644700749) (job `132599863799`) reports **20** overlapping Function 7.3 bank/EN questions with stale or missing mirrored FR status, versus **21** in the dated 2026-10-19 historical baseline below. Current CI IDs: Q-7.3-001, 005, 006, 008, 010, 011, 013, 014, 015, 016, 018, 022, 026, 027, 028, 040, 041, 042, 043, 044. **Q-7.3-017** no longer appears in *this specific FR/EN mirror diagnostic*: its EN draft now records `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`, matching the current evidence-scope correction. This removal from the diagnostic does **not** establish FR regulatory validity, a resolved DGR-wide source absence, EN approval or import eligibility. The historical 21-item list below is retained as dated audit evidence.

The same exact-head regulatory CI still identifies **18** historically FROZEN Function 7.3 questions lacking individualized direct current-edition Tier-A provenance: Q-7.3-001, 005, 006, 008, 011, 013, 015, 016, 018, 022, 026, 027, 028, 040, 041, 042, 043, 044. Function 7.3 continues to use its **own 33 official CBTA leaf tasks** and **45 provisional bank/EN items**, all non-importable. Program-wide diagnostic totals remain **287** task-matrix rows, **453** draft items (zero import-eligible), **107** FROZEN provenance exceptions and **139** FR/EN mirror mismatches. The [direct item Tier-A provenance workflow](https://github.com/relaxsaadi/cbta/actions/runs/43644700777) and the full regulatory workflow remain **FAIL / release-blocking**; structural/governance controls pass.

These are repository and CI findings, **not** a new direct inspection of controlled IATA DGR 67th Edition 2026 content, not proof of regulatory absence, and not qualified FR or independent EN review. Each claim still requires current-edition item-specific evidence, explicit `SOURCE GAP` / `SOURCE CONFLICT` where applicable, and named qualified dated FR and separately EN reviewers before any authorized `APPROVED` decision. No question, answer, score, reviewer record, source fact, import flag, deployed examination or security setting is changed by this documentation-only correction.

## 2026-11-13 provenance correction — Q-7.3-039

The previous `FR SOURCE GAP CONFIRMED` label reused a historical §9.5.1.2 section-specific mismatch; for 7.3 it also cross-applied the 7.2 conclusion. Such a finding does not establish the claimed employer/employee duty is absent throughout the current 67th Edition 2026. Correct current state: `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`. The original record remains historical, not direct item-specific Tier A evidence. Tier B course basis only; no question/answer change, approval, EN sign-off, or eligibility for import. Named, qualified FR verifier/date and a separate EN technical reviewer/date remain required.

**DRAFT / PRE-PRODUCTION / NOT APPROVED / NOT READY.**

## 2026-11-12 evidence-scope correction — Q-7.3-017

The historical cross-applied `FR SOURCE GAP CONFIRMED` conclusion inherited Q-7.1-001's limited glossary search. That search did not exhaustively assess “Danger” or prove the absence of all relevant wording in the current DGR. Accordingly **the current question-specific state is `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**, retaining Tier B educational basis only. The 2026-08-29 classification remains as a historical record, not terminal current-edition provenance. The bank stem/key, EN translation review, reviewer sign-off, staging assessments, production eligibility and run-time data have not been promoted. Qualified FR direct-source and independent EN review are still required.


## Function-specific baseline

`docs/DGR_OFFICIAL_TASK_SET_7.3.md` independently records **33 leaf tasks** from IATA CBTA Guidance Ed.1 (2023) **TABLEAU 7.3.A** (PDF pp.28–29; Block 0=17, Blocks 3.1–3.3=12, Block 7=4), rather than any 7.1/7.2 template. Own blueprint: `docs/DGR_STAGE2A_FUNCTION_7.3_BLUEPRINT.md`; source/competency ledger: `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.3.md`; draft bank: `docs/DGR_PRODUCTION_BANK_7.3.md` (**45 IDs**); separate unapproved EN draft: `docs/DGR_EN_REVIEW_PACKAGE_7.3.md`. The Stage 1 cross-validation also records a **local practice-book SOURCE GAP**: do not invent missing exercise-source support or classify this as a DGR-wide regulatory absence.

Evidence scope: PR #3 HEAD `9b6cfd2ef8efbd28e127982c637d8f7e739a910f` (checked 2026-10-19); [full regulatory-readiness job](https://github.com/relaxsaadi/cbta/actions/runs/39186220052), [direct Tier-A provenance job](https://github.com/relaxsaadi/cbta/actions/runs/39186220060). Both fail. These are repository/CI audit findings, **not** a fresh reading of licensed IATA DGR 67th Edition 2026 text, proof that an answer is wrong, a qualified human review, or evidence of ANAC/IATA authorization.

## Specific fail-closed exceptions

**Eighteen source-verified/FROZEN claims lacking individualized direct Tier-A proof in exact-head job:** `Q-7.3-001`, `005`, `006`, `008`, `011`, `013`, `015`, `016`, `018`, `022`, `026`, `027`, `028`, `040`, `041`, `042`, `043`, `044`. A representative Bookshelf spot-check of **other** items is not per-item 2026 DGR evidence for these claims.

**Claimed source-gap evidence needs reaffirmation:** `Q-7.3-017` carries `FR SOURCE GAP CONFIRMED` language without sufficiently specific affirmative evidence for absence; retain unresolved source-classification status until examined directly. `Q-7.3-039` also requires source verification according to the bank/matrix, but is not included in the above 18-FROZEN checker class; do not falsely treat it as a newly proven DGR conflict.

**Twenty-one stale/missing FR-status mirrors in the EN package:** `Q-7.3-001`, `005`, `006`, `008`, `010`, `011`, `013`, `014`, `015`, `016`, `017`, `018`, `022`, `026`, `027`, `028`, `040`, `041`, `042`, `043`, `044`. These overlap the 18 FROZEN exceptions; **do not sum** them. Resolve actual bank/matrix/CSV FR source state first, then mirror the resolved FR classification in EN without asserting actual EN reviewer signoff.

The stricter affirmative evidence job flags additional terminal labels that reuse representative/cross-applied statements. Its wider finding is separate from the specifically enumerated 18 + 1 classes.

**Required gates (unchanged):** independently bind each regulatory assertion and answer to precise current **IATA DGR 67th Edition 2026** Tier-A source/version/locator and access-controlled evidence; preserve explicit `SOURCE GAP`, `SOURCE CONFLICT` or `TIER_A_PROVENANCE_UNRESOLVED` when support is absent/contradictory. Verify FR source claims with named qualified reviewer and real date; commission separate EN bilingual technical review with named qualified reviewer/date; never set `APPROVED` or import eligibility on mere structural tests, a copied status or representative/cross-applied sampling. Do not alter historical exam attempts, grades or audit logs to make a test green. **No production promotion.** Platform candidate workflow, RBAC, immutable audit trail, bilingual UX, Moodle/console boundary, security, deployment, backup and restore still require independent live evidence. The commercial-site Vercel failure cannot establish Moodle/E-EXAM deployment state.

**Effect of this audit note:** no question, answer, score, approval, named review, secret, Tier-A source fact or runtime import eligibility was changed.
