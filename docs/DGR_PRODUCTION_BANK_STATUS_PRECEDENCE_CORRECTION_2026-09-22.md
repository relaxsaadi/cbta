# DGR production-bank status-precedence correction — 2026-09-22

This is a documentation/data-integrity safeguard for the Functions 7.1–7.10 question-bank program. It does **not** change a question's regulatory answer, source evidence, FR/EN review result, reviewer state, Moodle state, or approval state, and it does not imply ANAC or IATA approval.

## Finding

Several production-bank files preserve drafting-time status blocks below a later consolidated Tier-A verification summary. In those files, a reader can encounter both:

- a later consolidated pass stating that some questions are `FROZEN FR / SOURCE VERIFIED`, `PARTIALLY CONFIRMED`, `SOURCE GAP`, or otherwise reconciled against current DGR evidence; and
- an older current-sounding block such as `Status of this batch — read before using any item below` followed by `All ... items in this batch are DRAFT` / `None has been Tier A-verified against the current IATA DGR 67th Edition` and, in some cases, a stale statement that the Bookshelf is still blocked.

Those statements cannot both be interpreted as the current status of the same items. The lower drafting-time text is useful historical provenance, but after a later all-batches reconciliation it must be labelled as historical/superseded rather than presented as current controlling status.

The contradiction is especially clear in Functions 7.7–7.10, where the file header records a consolidated 2026-08-25 Tier-A pass and enumerates verified/partial outcomes, while later batch-introduction blocks still state that no item in that batch has been Tier-A verified. Similar preserved drafting-time sections must be treated consistently wherever they occur in Functions 7.1–7.10.

## Exact-head CI observation

On exact head `52691a5eda49a9810abe2d2ba35d07776dac491f`, the regression fixtures passed and the real consistency gate failed, identifying **18 unlabelled stale status statements** across these production banks:

- Function 7.3: 2 occurrences (near lines 967 and 1998);
- Function 7.4: 2 occurrences (near lines 1048 and 2218);
- Function 7.6: 2 occurrences (near lines 960 and 1991);
- Function 7.7: 3 occurrences (near lines 44, 950 and 1901);
- Function 7.8: 3 occurrences (near lines 41, 1081 and 2208);
- Function 7.9: 3 occurrences (near lines 39, 1019 and 1967);
- Function 7.10: 3 occurrences (near lines 44, 1152 and 2241).

Functions 7.1, 7.2 and 7.5 did not produce this specific detector violation on that exact head. That does **not** certify their regulatory correctness or overall current-status accuracy; it only means they did not match this narrowly defined contradiction condition.

## Controlling precedence

When status statements disagree, use this order of authority:

1. direct per-item current-DGR evidence and the current per-item reconciliation state;
2. the function's later consolidated verification/reconciliation summary, but only as a summary of the underlying per-item evidence;
3. current source/competency matrix and governed review artifacts;
4. historical drafting-time batch narrative, only when explicitly labelled `HISTORICAL`, `ORIGINAL`, or `SUPERSEDED`.

A later summary never substitutes for missing per-item Tier-A provenance. The separate direct-evidence gate still controls whether a `FROZEN`, import-eligible, or confirmed-gap state is actually defensible.

## Required correction rule

If a production bank contains a consolidated all-batches Tier-A pass, any preserved earlier statement equivalent to `None has been Tier A-verified` must be either:

- explicitly labelled as historical/superseded in its local context; or
- regenerated/replaced from the current per-item state.

Do **not** delete useful drafting provenance merely to make a gate pass. Prefer a clear historical label when the text documents a real earlier state.

Likewise, stale operational statements such as `Bookshelf session remains blocked` must not be read as present-tense owner blockers when a later verified pass in the same file proves the session was subsequently available. They may remain only as historical context.

## Approval and bilingual boundary

This correction does not promote any question. In particular:

- `FR SOURCE VERIFIED` is not `APPROVED`;
- EN bilingual technical review remains a separate gate;
- final approval still requires the named qualified reviewer and review date required by program governance;
- unresolved `SOURCE GAP`, `SOURCE CONFLICT`, `PARTIAL`, or direct-provenance holds remain unresolved until their own evidence closes them.

## CI enforcement

`scripts/check-dgr-production-bank-status-precedence.mjs` is a negative consistency gate. For production banks that contain a consolidated all-batches Tier-A pass, it rejects an unlabelled later statement that no item has been Tier-A verified. It accepts the same drafting-time statement when the nearby text explicitly marks it as original/historical/superseded.

The detector does not infer regulatory correctness, Tier-A completion, reviewer completion, or approval from the absence of a contradiction. Its purpose is only to prevent stale drafting narrative from masquerading as current bank status.

## Readiness impact

Until the contradictory status blocks are reconciled or explicitly historical, the production-bank documentation is not sufficiently unambiguous for a defensible release/readiness package. This is separate from the existing direct Tier-A provenance blocker, human FR/EN review gates, and technical platform blockers.

Overall status therefore remains **PRE-PRODUCTION**. Do not use `platform ready to use` on the strength of a consolidated summary while contradictory current-sounding batch status remains in the same controlled artifact.
