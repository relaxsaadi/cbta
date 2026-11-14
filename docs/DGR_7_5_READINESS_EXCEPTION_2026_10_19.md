# Function 7.5 — Stage 2B.1 source/bilingual exceptions (2026-10-19)

**DRAFT / PRE-PRODUCTION / NOT APPROVED / NOT READY.** This note documents GitHub CI/repository audit only. It is **not** a direct reading of licensed IATA DGR 67th Edition 2026, a claim that an answer is wrong, a human signoff, or proof of IATA/ANAC authorization.

## 2026-11-12 superseding Q-7.5-018 finding

The historical definitive `FR SOURCE GAP CONFIRMED (cross-applied)` classification overstated the limited §1.0/Appendix A/targeted-term review inherited from Q-7.1-001. Effective item state: **`SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`**; mirrored in the bank, matrix, FR CSV, blocked V2 import CSV and separate EN draft package. The course example remains Tier B. No new 2026 licensed direct item check, complete DGR-wide absence finding, qualified dated FR/EN reviewer, changed answer, approval, import or deployment is claimed.

## 2026-11-12 Q-7.5-011 potential updated-source conflict — HOLD

The item concerning operator approval for more than 15 PED / more than 20 spare batteries was historically classified `FROZEN FR / SOURCE VERIFIED` on a 2026-08-25 reading of DGR 67e/AM1 §2.3.5.8.3 and §2.3.5.8.4(c). Its explanation also placed external batteries/power banks within the older spare-battery category. **IATA public operator guidance dated 2026-03-31**, discussing the ICAO Technical Instructions addendum effective **2026-03-27**, expressly separates personal-use power banks (maximum two) from other spares. See [IATA source, pp. 1, 4, 10](https://www.iata.org/contentassets/90f8038b0eea42069554b2f4530f49ea/guidance-to-operators---power-banks.pdf). The historical evidence is a lead, not clearance of the question's power-bank scope, and the public guidance alone is not a direct authorized FR 67th Edition 2026 review. The exact item is now **`SOURCE CONFLICT — 2026 POWER_BANK_ADDENDUM_REVIEW_REQUIRED`** and non-importable pending 2026 source/addendum, operator and jurisdiction applicability, named qualified FR/date and separate EN bilingual/date checks. No question answer changed; no claim that the ordinary-spare-battery numeric fact is itself false.

## Function-specific basis

Function 7.5 has its **own 25 official leaf tasks** from TABLEAU 7.5.A, recorded in `docs/DGR_OFFICIAL_TASK_SET_7.5.md`; it is not Function 7.1's task model. Consult `docs/DGR_STAGE2A_FUNCTION_7.5_BLUEPRINT.md`, `docs/DGR_SOURCE_COMPETENCY_MATRIX_7.5.md`, `docs/DGR_PRODUCTION_BANK_7.5.md` (**44** draft IDs, Q-7.5-001–044) and separate `docs/DGR_EN_REVIEW_PACKAGE_7.5.md` (translations drafted, not independently approved).

## Exact-head findings

At PR #3 head `47343df68e4a4ea301c68651d13241be6d55cfbb`, the [Direct item Tier-A provenance check](https://github.com/relaxsaadi/cbta/actions/runs/39223102579/job/117962829428) and [Full DGR readiness check](https://github.com/relaxsaadi/cbta/actions/runs/39223097425/job/117962995265) failed.

- **Twelve FROZEN/source-verified items lack sufficient direct item-specific provenance**, according to the readiness CI: `Q-7.5-002`, `006`, `007`, `010`, `015`, `017`, `020`, `028`, `029`, `030`, `038`, `040`. Representative or cross-applied evidence does not justify positive current-edition source status.
- **Seventeen stale/missing effective FR-status mirrors in the EN package**: `Q-7.5-002`, `006`, `007`, `010`, `012`, `015`, `016`, `017`, `018`, `020`, `025`, `027`, `028`, `029`, `030`, `038`, `040`. These **overlap** the twelve; do not sum them.
- `Q-7.5-018`: **superseded 2026-11-12** — previous cross-applied source-gap confirmation is historical, not current. Direct item-specific 2026 Tier A evidence is required; absence throughout the DGR was never established by a targeted glossary review.
- `Q-7.5-026` has a **separate source conflict at task 5.2.2** (see the existing matrix correction and open draft PR #288). It must remain fail-closed and is not counted as an additional FROZEN item above.

The broader strict current-edition evidence checker flags more terminal claims than the narrowly classified twelve; this note does not treat a sample as comprehensive substantive regulatory verification. This note did not inspect candidate-visible runtime data.

## Blocking acceptance requirements

Verify each regulatory assertion directly against the applicable current **IATA DGR 67th Edition 2026** with precise section locator, source language/version, claim/item association and access-controlled evidence. Preserve explicit `SOURCE GAP`, `SOURCE CONFLICT` and `TIER_A_PROVENANCE_UNRESOLVED` states where warranted. Resolve effective FR bank/matrix/CSV classifications *before* mirroring them into the separate EN review package. Require a named qualified FR reviewer/date and independent qualified bilingual EN reviewer/date before any `APPROVED` or import-promotion change. Never make a readiness check pass by relabeling questions without evidence; already-published runtime items require separate withdrawal/verification.

No questions, answers, scoring, reviewer status, secrets, licensed text or runtime eligibility changed by this documentation; this finding does not close any Moodle/E-EXAM technical gate.
