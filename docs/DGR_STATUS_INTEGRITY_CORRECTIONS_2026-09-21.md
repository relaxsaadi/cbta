# DGR 7.1–7.10 status-integrity corrections — 2026-09-21

This addendum records **documentation/status-accounting defects only** in `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`. It does not promote any question, change a source decision, complete bilingual review, or imply ANAC/IATA approval.

The per-item production-bank/source evidence remains authoritative. Where this addendum identifies a column or narrative conflict, the correct next action is to reconcile from durable per-item evidence — **not** choose numbers that make the dashboard look complete.

## Non-negotiable approval rule

For every Function 7.1 through 7.10, `FROZEN FR/SOURCE VERIFIED` is source verification only. `APPROVED` remains prohibited unless there is a named qualified reviewer, a review date, and the required durable review evidence. FR Tier-A verification and EN bilingual technical review remain separate gates.

## Function 7.2 — column misalignment

The current 7.2 row places `EN DRAFT PREPARED — REVIEW REQUIRED (49 items)` in the **FR Tier A verification** column and `Not started` in the **EN review** column. The same row's detailed narrative records the actual partial FR state as:

- 23/49 `FROZEN FR/SOURCE VERIFIED`;
- 2/49 `FR SOURCE GAP CONFIRMED`;
- the remainder still DRAFT with partial or no Tier-A attempt recorded per item.

The EN package is prepared for review; that is not completed bilingual review.

## Functions 7.4–7.10 — stale FR Tier-A table cells

The FR Tier-A cells for 7.4–7.10 still show `Not started` or older blocker wording even though the Notes in those same rows contain later partial Tier-A passes. Until the table is rebuilt from per-item evidence, those cells must not be treated as live readiness status.

## Function 7.4 — Batch-2 zero-item leaf-count conflict

The Function 7.4 Batch-2 narrative says that **“only 4 leaves have zero items”**, but the same sentence enumerates three non-gap zero-item leaves (`4.2.4`, `0.6.2`, `6.3.2`) **plus** three confirmed `SOURCE_GAP` leaves (`4.2.5`, `6.1.1`, `6.3.4`). At that Batch-2 point, the narrative therefore identifies **six** zero-item leaves, not four.

This is a prose/counting defect only. Do not change any underlying leaf evidence or question status merely to make the sentence balance. The later Batch-3 narrative is separately consistent with its own point in time: `4.2.4` and `0.6.2` were subsequently drafted, leaving `6.3.2` plus the three confirmed `SOURCE_GAP` leaves as the four still-undrafted leaves.

## Correction of the prior 7.4–7.7 arithmetic finding

A previous version of this addendum incorrectly classified Functions 7.4–7.7 as `STATUS_CONFLICT`. That finding was itself an accounting error and is withdrawn.

The production-bank consolidated Tier-A notes already partition each bank consistently:

| Function | Authoritative consolidated note | Bank total | Result |
|---|---|---:|---|
| 7.4 | 11 verified + 3 partially confirmed/flagged + 39 not attempted | 53 | 53/53 — internally consistent |
| 7.5 | 13 verified + 4 partially confirmed/flagged + 27 not attempted | 44 | 44/44 — internally consistent |
| 7.6 | 16 verified + 3 partially confirmed/flagged + 37 not attempted | 56 | 56/56 — internally consistent |
| 7.7 | 16 verified + 3 partially confirmed/flagged + 34 not attempted | 53 | 53/53 — internally consistent |

The false +1 in each earlier calculation came from counting the `danger/risque` silence item twice: once correctly inside the production bank's **partially confirmed / flagged** bucket (`Q-7.4-027`, `Q-7.5-018`, `Q-7.6-018`, `Q-7.7-019`) and then incorrectly a second time as a separate question-level `SOURCE GAP` bucket.

Do not confuse **source-gap task leaves with zero drafted questions** with an additional question-status count. A zero-question source-gap leaf is a coverage/source state, not another question to add to the bank total. No per-item question status is changed by this correction, and no regulatory claim is promoted.

### Other displayed later-pass arithmetic that is internally consistent

- 7.8: 12 verified + 2 source gaps + 1 partial + 36 not attempted = 51/51.
- 7.9: 15 verified + 2 source gaps + 22 not attempted = 39/39.
- 7.10: 12 verified + 1 source gap + 1 partial + 30 not attempted = 44/44.

These arithmetic checks do **not** mean those functions are regulatory-ready. Human EN review and qualified-reviewer approval remain open.

## Function 7.10 wording correction

The sentence `This closes the Tier A verification pass for all ten functions in this session` must not be read as full Tier-A completion. The same 7.10 row records 30/44 items as not attempted. The only defensible interpretation is that the session's **partial cross-function pass ended**, not that all ten functions achieved complete Tier-A verification.

## Required follow-up before this status file can become a live dashboard

1. Rebuild each FR Tier-A cell from per-item durable evidence rather than narrative/session summaries.
2. Preserve the corrected 7.4–7.7 arithmetic above; do not reintroduce a separate question count for zero-question source-gap leaves.
3. Keep explicit `SOURCE_GAP` / `SOURCE_CONFLICT` / unresolved states in the underlying regulatory artifacts.
4. Keep EN draft-package preparation distinct from completed EN bilingual review.
5. Keep every function non-`APPROVED` until named qualified reviewer + date + evidence are present.

Until those steps are complete, `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` remains a historical/session log, not a column-accurate production-readiness dashboard.
