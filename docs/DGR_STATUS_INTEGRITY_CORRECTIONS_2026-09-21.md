# DGR 7.1–7.10 status-integrity corrections — 2026-09-21

This addendum records **documentation/status-accounting defects only** across the DGR program status and review artifacts. It does not promote any question, change a source decision, complete bilingual review, or imply ANAC/IATA approval.

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

## Function 7.5 — blueprint ceiling vs. uncovered-evidence wording conflict

The Function 7.5 production bank's Batch-3 ceiling table records leaf `0.5.1` at **3/3 (at ceiling)** and states that no further item may be drafted against that leaf without new source evidence expanding its pool. The Stage 2A blueprint likewise sets `0.5.1` to a provisional **count/ceiling of 3**.

Later in the same production-bank narrative, however, slide 88's second material-code table is described as **“real remaining headroom”** for a possible Batch 4, and `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` repeats that wording. Those statements are incompatible with the current blueprint ceiling: the slide may be **unallocated, genuinely distinct evidence**, but it is **not available drafting headroom under the current 3-item ceiling**.

Until the Function 7.5 blueprint is deliberately re-evaluated from source yield, treat the slide-88 material-code table as `UNALLOCATED_EVIDENCE / CEILING_REVIEW_REQUIRED`, not as permission to draft `Q-7.5-045` (or any fourth `0.5.1` item). A future ceiling increase, if justified, must be an explicit blueprint revision with traceable evidence; it must not be inferred from the production-bank prose. This correction changes no existing question, Tier-A state, EN-review state, reviewer state, or approval status.

## Function 7.6 — EN review package carries stale FR Tier-A statuses

`docs/DGR_EN_REVIEW_PACKAGE_7.6.md` was prepared when the first 33 Function 7.6 questions were still Tier-B-only. Its package-level status block still says **all 33 items remain `DRAFT — Tier B only, SOURCE REQUIRED for Tier A`**, and the repeated per-item `FR status` fields mirror that historical state.

The later consolidated Tier-A pass recorded in `docs/DGR_PRODUCTION_BANK_7.6.md` supersedes that FR-side snapshot. Within the 33 items covered by the EN package:

- **11 items are now `FROZEN FR / SOURCE VERIFIED`:** `Q-7.6-005`, `007`, `011`, `012`, `013`, `015`, `016`, `017`, `020`, `023`, `025`;
- **2 items are partially confirmed / flagged:** `Q-7.6-008`, `Q-7.6-018`;
- **20 items remain without a completed Tier-A verification attempt** in that consolidated pass.

This is a **stale-copy defect in the EN review package, not a reason to promote EN status**. Every EN translation in that package still remains `BILINGUAL TECHNICAL REVIEW REQUIRED`, and every approval field remains `PENDING REVIEWER + DATE`. Until the package is regenerated from current per-item FR state, reviewers must take FR source status from the production bank/per-item reconciliation, not from the duplicated `FR status` labels inside the EN package.

Do not mechanically change the 33 EN-review fields to `FROZEN`: only the 11 named items have that later FR source-verification state, and FR verification still does not satisfy bilingual review or final approval.

## Functions 7.2–7.10 — EN review packages carry historical FR-status mirrors

The 7.6 defect above is **systemic, not isolated**. The EN review packages for Functions **7.2, 7.3, 7.4, 7.5, 7.7, 7.8, 7.9, and 7.10** also retain package-level and repeated per-item statements saying that every covered FR item remains `DRAFT — Tier B only, SOURCE REQUIRED for Tier A`. Those statements were true when each EN package was drafted, but later Tier-A work recorded in the corresponding production banks supersedes them.

Confirmed examples proving the duplicated FR-status mirrors are stale:

- **7.2:** the EN package says all 28 covered items remain Tier-B-only, while the production bank already records `Q-7.2-001`, `004`, `005`, `009`, `010`, and `011` as Tier-A confirmed in Batch 1, and `Q-7.2-002` as `FR SOURCE GAP CONFIRMED`.
- **7.3:** the EN package says all 32 covered items remain Tier-B-only, while the later consolidated production-bank pass records 20 verified items overall, including covered IDs such as `Q-7.3-001`, `005`, `006`, `008`, `011`, `013`, `014`, `015`, `016`, `018`, `022`, `026`, `027`, `028`, and `030`.
- **7.4:** the EN package says all 53 items remain Tier-B-only, while the production bank later records 11 `FROZEN FR / SOURCE VERIFIED`, 3 partially confirmed/flagged, and 39 not attempted.
- **7.5:** the EN package says all 29 covered items remain Tier-B-only, while the production bank later records 13 verified items overall and 4 partially confirmed/flagged; several verified IDs fall inside the package range, including `Q-7.5-002`, `006`, `007`, `010`, `015`, `016`, `017`, `020`, `028`, and `029`.
- **7.6:** use the dedicated reconciliation immediately above.
- **7.7:** the EN package says all 33 covered items remain Tier-B-only, while the production bank later records 16 verified items overall and 3 partially confirmed/flagged; covered verified IDs include `Q-7.7-003`, `005`, `013`, `014`, `015`, `016`, `017`, `018`, `022`, `024`, `026`, and `Q-7.7-006`/`019` are among the covered flagged items.
- **7.8:** the EN package says all 32 covered items remain Tier-B-only, while the production bank later records 12 verified items overall plus later cross-applied findings; covered verified IDs include `Q-7.8-007`, `008`, `009`, `011`, `016`, `017`, and `021`, with covered `Q-7.8-010` and `018` also carrying later cross-applied findings.
- **7.9:** the EN package says all 31 covered items remain Tier-B-only, while the production bank later records 15 verified items overall plus two cross-applied danger/risque findings; covered verified IDs include `Q-7.9-004`, `007`, `011`, `014`, `015`, `016`, `017`, `019`, `020`, `021`, `025`, `027`, and `029`.
- **7.10:** the EN package says all 32 covered items remain Tier-B-only, while the production bank later records 12 verified items overall plus two cross-applied findings; the verified IDs are all inside the package range (`Q-7.10-005`, `007`, `013`, `014`, `015`, `016`, `017`, `018`, `020`, `024`, `026`, `030`).

This correction is intentionally **one-way and status-preserving**:

1. The production-bank/per-item Tier-A evidence is authoritative for FR source status.
2. The EN packages remain authoritative only for the drafted EN text/review work they actually contain, not for duplicated FR source-status snapshots that predate later Tier-A work.
3. **No EN item is promoted.** `BILINGUAL TECHNICAL REVIEW REQUIRED` and `PENDING REVIEWER + DATE` remain unchanged until a named qualified bilingual reviewer completes and dates the review with durable evidence.
4. Regeneration must be per item. Do not bulk-change every duplicated FR-status field to `FROZEN`; verified, partial, `SOURCE_GAP`, `SOURCE_CONFLICT`, and unattempted states must remain distinct.

## Function 7.10 wording correction

The sentence `This closes the Tier A verification pass for all ten functions in this session` must not be read as full Tier-A completion. The same 7.10 row records 30/44 items as not attempted. The only defensible interpretation is that the session's **partial cross-function pass ended**, not that all ten functions achieved complete Tier-A verification.

## Required follow-up before these status artifacts can become a live dashboard/reviewer view

1. Rebuild each FR Tier-A cell from per-item durable evidence rather than narrative/session summaries.
2. Preserve the corrected 7.4–7.7 arithmetic above; do not reintroduce a separate question count for zero-question source-gap leaves.
3. Reconcile Function 7.5 `0.5.1` so uncovered slide-88 evidence cannot be mistaken for drafting headroom unless the blueprint ceiling is explicitly revised from source yield.
4. Regenerate the duplicated FR-status mirrors in **every EN review package from 7.2 through 7.10** from current per-item evidence, without changing EN review state.
5. Keep explicit `SOURCE_GAP` / `SOURCE_CONFLICT` / unresolved states in the underlying regulatory artifacts.
6. Keep EN draft-package preparation distinct from completed EN bilingual review.
7. Keep every function non-`APPROVED` until named qualified reviewer + date + evidence are present.

Until those steps are complete, `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` remains a historical/session log, and stale duplicated FR-status fields in review packages must not be treated as production-readiness authority.
