# Function 7.3 — Stage 2B.1 regulatory/bilingual exception (2026-10-19)

**DRAFT / PRE-PRODUCTION / NOT APPROVED / NOT READY.**

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
