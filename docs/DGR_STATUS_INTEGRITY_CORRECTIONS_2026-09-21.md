# DGR 7.1–7.10 status-integrity corrections — 2026-09-21

This addendum records **documentation/status-accounting defects only** in `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`. It does not promote any question, change a source decision, complete bilingual review, or imply ANAC/IATA approval.

The per-item production-bank/source evidence remains authoritative. Where this addendum identifies an arithmetic or column conflict, the correct next action is a per-item recount/reconciliation — **not** choosing the number that makes the table look complete.

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

### Status-accounting conflicts requiring per-item recount

Four rows contain arithmetic inconsistencies in their own later Tier-A narrative. These are `STATUS_CONFLICT` findings, not regulatory-source conflicts, and **must not be resolved by inference**:

| Function | Narrative counts currently written | Arithmetic vs bank total | Required treatment |
|---|---|---|---|
| 7.4 | 11 verified + 1 source gap + 3 partial + 39 not attempted | 54 categories for a 53-item bank | `STATUS_CONFLICT` — recount per item before correcting the dashboard |
| 7.5 | 13 verified + 1 source gap + 4 partial + 27 not attempted | 45 categories for a 44-item bank | `STATUS_CONFLICT` — recount per item before correcting the dashboard |
| 7.6 | 16 verified + 1 source gap + 3 partial + 37 not attempted | 57 categories for a 56-item bank | `STATUS_CONFLICT` — recount per item before correcting the dashboard |
| 7.7 | 16 verified + 1 source gap + 3 partial + 34 not attempted | 54 categories for a 53-item bank | `STATUS_CONFLICT` — recount per item before correcting the dashboard |

Do not guess whether the over-count sits in `partial`, `not attempted`, or another category. Reconcile against the per-item bank/source records first.

### Rows whose displayed later-pass arithmetic is internally consistent

- 7.8: 12 verified + 2 source gaps + 1 partial + 36 not attempted = 51/51.
- 7.9: 15 verified + 2 source gaps + 22 not attempted = 39/39.
- 7.10: 12 verified + 1 source gap + 1 partial + 30 not attempted = 44/44.

These arithmetic checks do **not** mean those functions are regulatory-ready. Human EN review and qualified-reviewer approval remain open.

## Function 7.10 wording correction

The sentence `This closes the Tier A verification pass for all ten functions in this session` must not be read as full Tier-A completion. The same 7.10 row records 30/44 items as not attempted. The only defensible interpretation is that the session's **partial cross-function pass ended**, not that all ten functions achieved complete Tier-A verification.

## Required follow-up before this status file can become a live dashboard

1. Rebuild each FR Tier-A cell from per-item durable evidence rather than narrative/session summaries.
2. Resolve the 7.4–7.7 `STATUS_CONFLICT` arithmetic by per-item recount without changing underlying statuses merely to balance totals.
3. Keep explicit `SOURCE_GAP` / `SOURCE_CONFLICT` / unresolved states in the underlying regulatory artifacts.
4. Keep EN draft-package preparation distinct from completed EN bilingual review.
5. Keep every function non-`APPROVED` until named qualified reviewer + date + evidence are present.

Until those steps are complete, `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` remains a historical/session log, not a column-accurate production-readiness dashboard.
