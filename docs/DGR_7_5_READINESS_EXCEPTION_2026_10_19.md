# Function 7.5 — Stage 2B.1 source/bilingual exceptions (2026-10-19)

**DRAFT / PRE-PRODUCTION / NOT APPROVED / NOT READY.** This note documents GitHub CI/repository audit only. It is **not** a direct reading of licensed IATA DGR 67th Edition 2026, a claim that an answer is wrong, a human signoff, or proof of IATA/ANAC authorization.

## Function-specific basis

Function 7.5 has its **own 25 official leaf tasks** from TABLEAU 7.5.A, recorded in `docs/DGR_OFFICIAL_TASK_SET_7.5.md`; it is not Function 7.1's task model. Consult `docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md`, `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.5.md`, `docs/DGR_PRODUCTION_BANK_7.5.md` (**44** draft IDs, Q-7.5-001–044) and separate `docs/DGR_EN_REVIEW_PACKAGE_7.5.md` (translations drafted, not independently approved).

## Exact-head findings

At PR #3 head `47343df68e4a4ea301c68651d13241be6d55cfbb`, the [Direct item Tier-A provenance check](https://github.com/relaxsaadi/cbta/actions/runs/39223102579/job/117962829428) and [Full DGR readiness check](https://github.com/relaxsaadi/cbta/actions/runs/39223097425/job/117962995265) failed.

- **Twelve FROZEN/source-verified items lack sufficient direct item-specific provenance**, according to the readiness CI: `Q-7.5-002`, `006`, `007`, `010`, `015`, `017`, `020`, `028`, `029`, `030`, `038`, `040`. Representative or cross-applied evidence does not justify positive current-edition source status.
- **Seventeen stale/missing effective FR-status mirrors in the EN package**: `Q-7.5-002`, `006`, `007`, `010`, `012`, `015`, `016`, `017`, `018`, `020`, `025`, `027`, `028`, `029`, `030`, `038`, `040`. These **overlap** the twelve; do not sum them.
- `Q-7.5-018` additionally requires individual affirmative support before preserving a definitive `FR SOURCE GAP CONFIRMED` classification. A source gap in training slides is not proof that IATA DGR itself is silent.
- `Q-7.5-026` has a **separate source conflict at task 5.2.2** (see the existing matrix correction and open draft PR #288). It must remain fail-closed and is not counted as an additional FROZEN item above.

The broader strict current-edition evidence checker flags more terminal claims than the narrowly classified twelve; this note does not treat a sample as comprehensive substantive regulatory verification. This note did not inspect candidate-visible runtime data.

## Blocking acceptance requirements

Verify each regulatory assertion directly against the applicable current **IATA DGR 67th Edition 2026** with precise section locator, source language/version, claim/item association and access-controlled evidence. Preserve explicit `SOURCE GAP`, `SOURCE CONFLICT` and `TIER_A_PROVENANCE_UNRESOLVED` states where warranted. Resolve effective FR bank/matrix/CSV classifications *before* mirroring them into the separate EN review package. Require a named qualified FR reviewer/date and independent qualified bilingual EN reviewer/date before any `APPROVED` or import-promotion change. Never make a readiness check pass by relabeling questions without evidence; already-published runtime items require separate withdrawal/verification.

No questions, answers, scoring, reviewer status, secrets, licensed text or runtime eligibility changed by this documentation; this finding does not close any Moodle/E-EXAM technical gate.
