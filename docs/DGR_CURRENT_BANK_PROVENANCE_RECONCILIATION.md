# DGR/CBTA current-bank provenance reconciliation gate

Status date: 2026-08-31

Scope: Functions 7.1 through 7.10. This is a governance/readiness checkpoint only. It does not change any question text, `source_status`, `reviewer_status`, assessment, Moodle record, or production deployment.

## Why this checkpoint exists

The current KOST E-EXAM V2 staging bank contains 244 questions imported as `FROZEN_SOURCE_VERIFIED`, while every one of those 244 remains `reviewer_status=PENDING`.

The 2026-08-29 migration report also records a material provenance-quality problem in the 152 questions added during that migration:

- 127/152 upstream `SOURCE_REFERENCE` / `DGR_Reference` cells contain the same corrupted representative citation list and therefore cannot be trusted as per-item evidence;
- only 44/152 newly imported questions had a usable per-row `SOURCE: ...` fragment naming a real DGR section;
- the remaining 108/152 were intentionally imported with `regulatory_reference = NULL` rather than a guessed reference.

Therefore **"244 imported/source-status FROZEN" must not be treated as equivalent to "244 independently defensible Tier-A Gate-1 completions"** under the standing readiness standard.

This checkpoint is also necessary because `docs/DGR_REVIEWER_SIGNOFF_WORKFLOW.md` still contains an older 2026-08-25 Gate-1 count, while later 2026-08-29 reconciliation/import material uses the broader 244-question label. The two timelines must be reconciled explicitly rather than silently choosing the more favorable count.

## Current imported bank by function

These are database/import counts, **not** regulatory approval counts:

| Function | Imported as `FROZEN_SOURCE_VERIFIED` | Human reviewer status |
|---|---:|---|
| 7.1 | 13 | PENDING |
| 7.2 | 27 | PENDING |
| 7.3 | 31 | PENDING |
| 7.4 | 25 | PENDING |
| 7.5 | 21 | PENDING |
| 7.6 | 31 | PENDING |
| 7.7 | 25 | PENDING |
| 7.8 | 27 | PENDING |
| 7.9 | 23 | PENDING |
| 7.10 | 21 | PENDING |
| **Total** | **244** | **244 PENDING** |

No row in this table is `APPROVED` merely because it is imported or carries a FROZEN source status.

## Controlling Gate-1 standard for every function

For each question in 7.1 through 7.10, the source/competency ledger must end in exactly one evidence state supported by recoverable current evidence:

1. `TIER_A_VERIFIED` — direct current IATA DGR 67th Edition 2026 evidence located and recorded with a precise section/table locator; or
2. `SOURCE_GAP` — the current Tier-A source was checked and does not support the regulatory premise; or
3. `SOURCE_CONFLICT` — current Tier-A evidence conflicts with another source/basis and the conflict remains explicit; or
4. `PROVENANCE_MISSING` — the repository/import record does not yet contain enough recoverable evidence to defend the existing source-verification stamp.

`PROVENANCE_MISSING` is not a failure to preserve data; it is the honest state until direct evidence is recovered. Do not backfill it from the known-corrupted citation columns.

## Required per-item provenance record

A Gate-1-complete regulatory claim requires, at minimum:

- function code and the question's own CBTA task/sub-task mapping;
- exact current DGR baseline: 67th Edition 2026 plus applicable addendum state;
- precise section/table/appendix locator for each regulatory claim;
- verification outcome (`TIER_A_VERIFIED`, `SOURCE_GAP`, or `SOURCE_CONFLICT`);
- evidence locator sufficient for an auditor to retrace the verification without copying licensed text into the repository;
- verification date tied to the real verification event;
- verifier identity/qualification where the platform workflow requires it.

A nullable or corrupted reference is not enough to prove this gate.

## Function-by-function reconciliation rule

Do not mechanically transfer Function 7.1's 44-leaf structure or its question counts to any other function. For each of 7.2 through 7.10, continue using that function's own Stage-1 task table, Stage-2A blueprint, production bank, FR verification record, and separate EN review package.

For each function publish a current reconciliation summary containing:

| Required count | Meaning |
|---|---|
| `TIER_A_VERIFIED` | Exact current DGR 67e/2026 provenance recovered |
| `SOURCE_GAP` | Current Tier-A checked; premise not supported |
| `SOURCE_CONFLICT` | Current evidence conflicts; unresolved explicitly |
| `PROVENANCE_MISSING` | Existing FROZEN stamp not yet defensible from recoverable per-item evidence |
| `FR_REVIEW_COMPLETE` | Named qualified FR technical reviewer + date |
| `EN_REVIEW_COMPLETE` | Separate named bilingual technical reviewer + date |
| `APPROVED` | Final approval only after all required gates are complete |

The sum of the first four provenance states must equal that function's current bank size before the function can be described as provenance-reconciled.

## Approval boundary

Even after Gate 1 is reconciled, no question may become `APPROVED` without the existing separate human gates:

- named qualified FR technical reviewer + date;
- separate EN bilingual technical review where applicable + named reviewer/date;
- final approval recorded by a named qualified reviewer + date.

No ANAC or IATA approval is implied by any internal KOST status.

## Platform implications

This provenance reconciliation does not replace the open technical readiness blockers. In particular, production assessment eligibility must still be hardened so `reviewer_status=PENDING` questions cannot enter a production assessment merely because `source_status=FROZEN_SOURCE_VERIFIED`.

Until both technical production-integrity gates and the human/regulatory gates are complete, the safe overall label remains:

**PRE-PRODUCTION READY — technical/data-integrity remediation + human regulatory review pending.**

Do not use `platform ready to use` on the strength of the 244 import count alone.
