# DGR EN review-package FR-status mirror correction — 2026-09-23

## Scope

This correction applies to the controlled bilingual review packages for **Functions 7.1 through 7.10**:

- `docs/DGR_EN_REVIEW_PACKAGE_7.1.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.2.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.3.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.4.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.5.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.6.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.7.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.8.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.9.md`
- `docs/DGR_EN_REVIEW_PACKAGE_7.10.md`

It does **not** change regulatory answers, Tier-A evidence, EN translation wording, reviewer identity, reviewer qualification, or approval state.

## Finding

The EN packages duplicate each item's French regulatory/source-review status so a bilingual reviewer can see the state of the French source item while reviewing the English draft. Some of those duplicated FR status labels are stale.

A concrete example is Function 7.2. The EN package still states globally that every item's FR status is `DRAFT — Tier B only, SOURCE REQUIRED for Tier A`, and its per-item `Q-7.2-001` status repeats that DRAFT state. The current Function 7.2 production-bank record, however, records `Q-7.2-001` as `FROZEN FR / SOURCE VERIFIED` after the 2026-08-25 current-DGR verification pass. Other Function 7.2 items have current `SOURCE GAP` states rather than the old blanket DRAFT state.

This is a **cross-artifact governance defect**. It is not evidence that an EN translation is reviewed or that the current FR regulatory conclusion is itself correct. The direct Tier-A provenance gates remain authoritative for that separate question.

## Required precedence

For a duplicated FR status shown inside an EN review package:

1. `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv` supplies the current per-item state and durable evidence narrative.
2. That recorded state is **not blindly authoritative** when the same row explicitly admits that its own current-DGR citation/search was not independently performed. In that case the effective mirror state is `TIER_A_PROVENANCE_UNRESOLVED` / `SOURCE_GAP_UNRESOLVED` with `DIRECT_ITEM_EVIDENCE_REQUIRED`, matching the direct-provenance policy.
3. The EN package may keep its own independent `EN status` and `Approval` fields.
4. Updating the FR mirror must **never** promote the EN review state.
5. `BILINGUAL TECHNICAL REVIEW COMPLETE` and `APPROVED` remain prohibited unless the controlled reviewer/sign-off requirements are independently satisfied with a named qualified reviewer and date.
6. If the current FR state is downgraded because direct Tier-A evidence is insufficient, the EN package mirror must follow that downgrade; it must not preserve a more favorable historical label.

## CI correction

`scripts/check-dgr-en-package-fr-status-mirror.mjs` now checks all ten EN review packages against the effective current per-item state. For each package item it requires:

- a valid `Q-7.x-###` heading bound to the package function;
- exactly one explicit per-item `**FR status:**` field;
- a matching reconciliation row and function;
- the same current status class (`FROZEN`, `SOURCE GAP`, `CONFLICT`, `DRAFT`, or provenance `UNRESOLVED`) as the effective per-item state;
- an `UNRESOLVED` mirror instead of terminal `FROZEN`/confirmed-gap when the reconciliation row itself explicitly admits missing direct current-DGR evidence.

The check is wired into `.github/workflows/dgr-regulatory-readiness.yml` with regression fixtures. It is intentionally fail-closed. A passing result means only that duplicated FR status labels in EN review packages are synchronized with the effective per-item state. It does **not** prove regulatory correctness, bilingual equivalence, reviewer qualification, or approval.

## Remediation rule

Regenerate or edit the stale FR mirror fields from the effective per-item state, function by function. Do not bulk-copy Function 7.1 wording or structure into Functions 7.2–7.10, do not turn an explicitly unresolved direct-evidence row into a terminal status merely because its legacy bucket says FROZEN/GAP, and do not use this synchronization work to alter the separately governed EN-review status.
