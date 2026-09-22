# DGR V2 import-candidate provenance correction — 2026-09-22

This is a downstream data-integrity/readiness safeguard for the Functions 7.1–7.10 question-bank program. It does **not** change any regulatory answer, source evidence, FR/EN review result, reviewer state, approval state, Moodle state, or ANAC/IATA claim.

## Finding

`docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` is an operational derivative intended to say which reconciled questions may proceed toward V2 import. A fresh audit found that this derivative can still advertise `IMPORT_ELIGIBLE=YES` for rows whose durable reconciliation text explicitly admits that the item's own current-DGR citation was **not independently read/re-read** and that only representative/sample evidence was checked.

Concrete examples currently include `Q-7.3-040`, `Q-7.3-041`, `Q-7.3-042`, `Q-7.3-043`, `Q-7.3-044`, `Q-7.4-002`, `Q-7.4-004`, and `Q-7.4-006`. In those rows, the import artifact carries `FROZEN FR / SOURCE VERIFIED` plus `IMPORT_ELIGIBLE=YES`, while the same durable evidence states that the item's own specific citation was not independently re-read during the pass.

These examples are sufficient to prove a downstream synchronization defect; they are **not** an exhaustive list of every affected row.

## Correct interpretation

An item must not be treated as production-import-eligible merely because an earlier reconciliation or generated derivative says `FROZEN` when its durable evidence explicitly records missing item-specific current IATA DGR 67th Edition 2026 verification/search.

For import-readiness purposes, such a row remains:

`DIRECT_ITEM_EVIDENCE_REQUIRED / IMPORT HOLD`

until the item's own tested claim is checked directly against the current controlled source and the per-item reconciliation is updated consistently.

The downstream import file must then be regenerated from the reconciled source of truth. Do not hand-edit a sampled-only row to `YES` merely to make a gate pass.

## Fail-closed consistency rules

The V2 import-candidate artifact is safe to use as production import authority only when every `IMPORT_ELIGIBLE=YES` row satisfies all of the following:

1. a matching per-item reconciliation row exists;
2. the import row has `FROZEN FR / SOURCE VERIFIED` as its current FR status;
3. the reconciliation row is still in a FROZEN state;
4. no durable reconciliation/import text explicitly admits that the item's own current-DGR citation/search was not independently performed;
5. the import row has no non-empty blocker field.

These are negative integrity checks only. Passing them does **not** prove the regulatory answer is correct, does not complete EN bilingual review, and does not constitute final approval.

## CI enforcement

`scripts/check-dgr-import-candidate-provenance.mjs` parses both controlled CSV artifacts with quoted/multiline-field support and fails closed when an import-eligible row conflicts with the per-item provenance record. Regression fixtures cover:

- sampled-only FROZEN evidence advertised as import-eligible — rejected;
- the same sampled-only evidence truthfully held at `IMPORT_ELIGIBLE=NO` — accepted by this narrow gate;
- direct item-specific evidence with import eligibility — accepted by this narrow gate;
- an import-eligible row with no matching reconciliation record — rejected;
- quoted multiline CSV fields and doubled quotes.

The gate intentionally does not rewrite either CSV and does not promote/demote regulatory content automatically.

## Relationship to the existing direct-provenance blocker

`docs/DGR_TIER_A_DIRECT_EVIDENCE_CORRECTION_2026-09-22.md` controls the upstream per-item evidence rule. This correction controls the downstream operational mirror so that a stale generated import list cannot bypass the upstream hold.

After direct per-item evidence is reconciled function-by-function, regenerate `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` from that current state and rerun both gates.

## Readiness impact

Until the import-candidate artifact is reconciled, it must **not** be used as an authoritative production import list. This is an additional regulatory/data-integrity blocker alongside the existing direct Tier-A provenance, production-bank status-precedence, independent EN review, named qualified reviewer/date, and technical platform gates.

Overall status remains **PRE-PRODUCTION**. Do not describe the platform as `platform ready to use` on the strength of a stale import-candidate derivative.
