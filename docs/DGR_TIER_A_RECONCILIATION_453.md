# DGR Tier A Bookshelf Reconciliation — 453 Questions

**Date:** 2026-08-26 (reconciliation), report finalized 2026-08-29
**Scope:** All 453 KOST DGR questions, Functions 7.1 → 7.10, DGR 67th Edition (AM1).
**Branch:** `ai/dgr-stage2b-handoff`
**Mission:** Reconcile the historical/topic-level 218-FROZEN figure against the strict,
individually-stamped 97-FROZEN figure discovered by the Moodle-integration parser; materialize
any genuinely supportable status changes into the individual question files; do **not** invent,
infer, or auto-approve anything. No V2 import and no Moodle write happened in this mission.

---

## 1. Root cause of the 218 vs. 97 discrepancy

Each `docs/DGR_PRODUCTION_BANK_7.X.md` file (X = 2…10) carries a question's status in **two
places**:

1. An **individual prose block** (`## Q-7.X-NNN` … `**FR status:** …`) — written and updated
   per-item, as each item was actually checked against the Bookshelf. This is authoritative.
2. A **per-batch summary table** row — often written earlier, in bulk, and not always kept in
   sync with (1) as individual verification progressed.

The historical ~218 FROZEN figure was derived from a keyword/topic-level reading that leaned on
representation (2) and on cross-referenced topic narratives in `DGR_TIER_A_INVENTORY.md`. It
counted topic-level conclusions ("the lithium battery topic is settled") as if they applied
uniformly to every item under that topic, which is not a valid inference — a topic being
generally well-understood does not mean every individual question about it was itself checked
against the current DGR text.

A strict, byte-level re-parse of representation (1) — the field the Moodle-integration pass
actually consumed — found exactly **97 individually-stamped `FROZEN FR / SOURCE VERIFIED`**
items. This was cross-validated against the real Moodle traceability CSVs recovered from
`console/finalization-2026-08-25` (`DGR_MOODLE_IMPORT_TRACEABILITY_7.X.csv`) and the arithmetic
matches exactly: 18+21+7+7+7+8+7+10+5+7 = **97**, of which **92** are importable and **5** are
excluded (see §3).

Function 7.1 is structurally different — it lives entirely in `docs/DGR_STAGE_2B_STATUS.md` as a
single table (no prose/table duplication), so no drift was possible there; its 18/19 FROZEN count
was already reliable and is confirmed unchanged.

## 2. Methodology

1. Parsed all 453 items' **individual** FR-status field (prose for 7.2–7.10, single table for
   7.1) — never the topic narrative — as the authoritative current status.
2. Cross-referenced the per-batch summary-table row for the same item as the "historical /
   topic-analysis conclusion" field, to expose drift explicitly rather than silently trust either
   source.
3. For every item still at `DRAFT — TIER A NOT YET VERIFIED` in its individual field, inspected
   the **actual free text** of that field for a genuine, individually-linked finding (not a
   topic-level assumption). This was done by computing the exact frequency distribution of
   verbatim prose strings across all DRAFT items: one string occurring 322 times is the true
   untouched boilerplate; a handful of short strings occurring a few times are other shared
   boilerplate variants; every remaining string is unique, individually-authored text that
   required manual reading.
4. Of the DRAFT items with individually unique text, **17** contained a real, traceable Tier A
   finding (an actual Bookshelf lookup outcome, not a guess) sufficient to materialize a status
   change under the mission's closed-set vocabulary. The other 332 remain unchanged at
   `DRAFT — TIER A NOT YET VERIFIED` because no individually-linked evidence exists in their own
   file — per the mission rule, topic-level plausibility is not sufficient grounds to promote a
   specific question.
5. Materialized all 17 promotions **in the individual question files** (both the prose
   `**FR status:**` line and the summary-table row), each with an appended traceability note:
   `**Reconciliation (2026-08-26):** OLD STATUS: … NEW STATUS: … SOURCE: … RATIONALE: …`.
   No historical text was deleted — only appended to.
6. Separately verified full-text/answer recoverability (importability) per FROZEN item via
   content-completeness markers (`**Stem (FR):**`, `**Options:**`, `**Correct answer:**`) and via
   the ground-truth Moodle traceability CSVs. This is kept as a distinct flag from "source
   verified" per the mission's explicit instruction not to conflate the two concepts.

## 3. The 17 materialized promotions

| KOST ID | File | Old status | New status | Reason (short) |
|---|---|---|---|---|
| Q-7.2-003 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | PARTIALLY CONFIRMED | Tier A search performed 2026-08-25, partial match against current DGR §2.2 |
| Q-7.2-006 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | PARTIALLY CONFIRMED | Same cluster — partial confirmation only |
| Q-7.2-023 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | PARTIALLY CONFIRMED | Same cluster — partial confirmation only |
| Q-7.2-028 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | PARTIALLY CONFIRMED | Same cluster — partial confirmation only |
| Q-7.2-037 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | PARTIALLY CONFIRMED | "3-State scope" cluster — partial confirmation |
| Q-7.4-043 | `DGR_PRODUCTION_BANK_7.4.md` | DRAFT | PARTIALLY CONFIRMED | "3-State scope" cluster — partial confirmation |
| Q-7.5-025 | `DGR_PRODUCTION_BANK_7.5.md` | DRAFT | PARTIALLY CONFIRMED | "3-State scope" cluster — partial confirmation |
| Q-7.10-041 | `DGR_PRODUCTION_BANK_7.10.md` | DRAFT | PARTIALLY CONFIRMED | "3-State scope" cluster — partial confirmation |
| Q-7.4-013 | `DGR_PRODUCTION_BANK_7.4.md` | DRAFT | PARTIALLY CONFIRMED | NOTOC "plan de chargement" pair — partial confirmation |
| Q-7.6-009 | `DGR_PRODUCTION_BANK_7.6.md` | DRAFT | PARTIALLY CONFIRMED | NOTOC "plan de chargement" pair — partial confirmation |
| Q-7.5-012 | `DGR_PRODUCTION_BANK_7.5.md` | DRAFT | PARTIALLY CONFIRMED | Individually-linked partial finding |
| Q-7.5-027 | `DGR_PRODUCTION_BANK_7.5.md` | DRAFT | PARTIALLY CONFIRMED | Individually-linked partial finding |
| Q-7.6-038 | `DGR_PRODUCTION_BANK_7.6.md` | DRAFT | PARTIALLY CONFIRMED | Individually-linked partial finding |
| Q-7.9-009 | `DGR_PRODUCTION_BANK_7.9.md` | DRAFT | PARTIALLY CONFIRMED | Individually-linked partial finding |
| Q-7.8-050 | `DGR_PRODUCTION_BANK_7.8.md` | DRAFT | PARTIALLY CONFIRMED | Individually-linked partial finding |
| Q-7.2-008 | `DGR_PRODUCTION_BANK_7.2.md` | DRAFT | FR SOURCE GAP CONFIRMED | Exhaustive Part 9 §9.1.1/§9.1.3 search found zero DGR anchor — likely KOST operational SOP, not DGR text |
| Q-7.3-025 | `DGR_PRODUCTION_BANK_7.3.md` | DRAFT | STALE CITATION / SOURCE CONFLICT | Finding already existed in the item's own text but lacked the canonical status prefix — promoted to make it queryable/materialized |

None of the 17 promotions reached `FROZEN FR / SOURCE VERIFIED` — a partial or negative finding,
by definition, cannot be promoted all the way to FROZEN. This is why **V2 import eligibility is
unchanged at 92** (see §5) even though 17 items moved out of the DRAFT bucket.

## 4. Per-function reconciliation matrix

| FUNCTION | TOTAL | FROZEN | GAP | PARTIAL | STALE | DRAFT/NOT VERIFIED | TEXT NOT RECOVERABLE | IMPORTABLE | NOT IMPORTABLE |
|---|---|---|---|---|---|---|---|---|---|
| 7.1 | 19 | 18 | 1 | 0 | 0 | 0 | 5 | 13 | 6 |
| 7.2 | 49 | 21 | 4 | 5 | 0 | 19 | 0 | 21 | 28 |
| 7.3 | 45 | 7 | 1 | 0 | 1 | 36 | 0 | 7 | 38 |
| 7.4 | 53 | 7 | 0 | 2 | 1 | 43 | 0 | 7 | 46 |
| 7.5 | 44 | 7 | 0 | 3 | 1 | 33 | 0 | 7 | 37 |
| 7.6 | 56 | 8 | 0 | 2 | 0 | 46 | 0 | 8 | 48 |
| 7.7 | 53 | 7 | 0 | 0 | 0 | 46 | 0 | 7 | 46 |
| 7.8 | 51 | 10 | 0 | 1 | 0 | 40 | 0 | 10 | 41 |
| 7.9 | 39 | 5 | 0 | 1 | 0 | 33 | 0 | 5 | 34 |
| 7.10 | 44 | 7 | 0 | 1 | 0 | 36 | 0 | 7 | 37 |
| **TOTAL** | **453** | **97** | **6** | **15** | **3** | **332** | **5** | **92** | **361** |

Note on 7.1: FROZEN (18) includes the 5 text-not-recoverable items, so IMPORTABLE (13) = FROZEN
(18) − TEXT NOT RECOVERABLE (5). The single GAP item (Q-7.1-001) is not counted in FROZEN at all.
NOT IMPORTABLE for 7.1 = 1 GAP + 5 text-not-recoverable = 6.

Cross-check: 19+49+45+53+44+56+53+51+39+44 = **453**. ✓
FROZEN column sums to **97** (matches the ground-truth Moodle traceability figure exactly). ✓
IMPORTABLE column sums to **92** (matches the ground-truth "already in V2" figure exactly). ✓

## 5. Text-not-recoverable detail (Function 7.1 only)

These 5 items are FROZEN (their tested claim is confirmed against current DGR text) but their
**exact original administered wording** cannot be safely reconstructed — they originate from a
prior pilot exam rather than fresh authorship in this program, and no verbatim source copy of
their full stem/options survived. They are correctly excluded from V2 import until a safe,
non-fabricated recovery (or a fresh re-authoring against the same confirmed DGR citation) is
done. This is a recoverability blocker only — not a source-verification problem.

- Q-7.1-005
- Q-7.1-007
- Q-7.1-008
- Q-7.1-010
- Q-7.1-012

No other item across all 453 questions has a content-completeness gap: all 434 items in
Functions 7.2–7.10 were confirmed (via `**Stem (FR):**` / `**Options:**` / `**Correct answer:**`
marker presence) to have complete authored content, regardless of their Tier A source-verification
status.

## 6. V2 import eligibility — before vs. after reconciliation

| | Before this reconciliation | After this reconciliation |
|---|---|---|
| FROZEN FR / SOURCE VERIFIED | 97 (ground truth, already known) | 97 (unchanged) |
| Import-eligible (FROZEN + fully recoverable) | 92 (already imported into V2) | 92 (unchanged) |
| Newly promoted to FROZEN by this reconciliation | — | 0 |
| Newly eligible for V2 import | — | 0 |

**No new items became V2-import-eligible.** All 17 materialized promotions landed in PARTIAL
(15), GAP (1), or STALE (1) — none reached FROZEN, because none of them had evidence strong
enough to fully confirm the tested claim. This is the expected, correct outcome of an honest
reconciliation: it explains *why* the historical 218 figure was wrong without fabricating new
FROZEN items to "solve" the discrepancy. The 92 items already in V2 remain the complete and
correct import set; no cutover action is required or was taken.

## 7. Items still genuinely requiring live Bookshelf verification

332 items remain at `DRAFT — TIER A NOT YET VERIFIED` because no individually-linked Tier A
evidence exists in their own file. This is **new verification work**, not reconciliation of
existing evidence — the reconciliation mission's scope (find and materialize evidence that
already exists) is exhausted for these items; there is nothing further to reconcile without
performing fresh Bookshelf lookups.

Breakdown of the 332 by function (all currently DRAFT, none excluded from future verification):

| Function | DRAFT count |
|---|---|
| 7.1 | 0 (fully resolved: 18 FROZEN + 1 GAP) |
| 7.2 | 19 |
| 7.3 | 36 |
| 7.4 | 43 |
| 7.5 | 33 |
| 7.6 | 46 |
| 7.7 | 46 |
| 7.8 | 40 |
| 7.9 | 33 |
| 7.10 | 36 |
| **Total** | **332** |

No further narrowing of this list is possible from documentation alone — a "worth re-verifying
first" priority order would require either (a) knowing which of these 332 questions are actually
scheduled for near-term exam use, or (b) another topic-clustering pass (as was done for the
lithium-battery / NOTOC / 3-State clusters that produced this reconciliation's 17 promotions) to
find any remaining natural batches. Recommended next step: repeat the topic-clustering approach
from §2 step 3–4 specifically within the 332, since it is what surfaced all 17 real findings this
pass — random single-item Bookshelf lookups across 332 items would be far less efficient than
another clustering pass.

## 8. Deliverables produced by this reconciliation

1. **This file** — `docs/DGR_TIER_A_RECONCILIATION_453.md` — per-function matrix + methodology.
2. `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` — all 453 items, columns: KOST_ID,
   FUNCTION, FR_STATUS, SOURCE_REFERENCE, FULL_TEXT_RECOVERABLE, CORRECT_ANSWER_RECOVERABLE,
   IMPORT_ELIGIBLE, BLOCKER.
3. `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv` — all 453 items, full 13-field-per-question
   reconciliation record (KOST ID, function, subtask, current status bucket + full text,
   historical/topic conclusion pointer, Bookshelf evidence found, DGR reference, evidence file,
   claim-supported verdict, text/answer recoverability, final reconciled status, reason, next
   action).
4. **17 materialized status changes** inside the individual question files themselves (both the
   prose `**FR status:**` field and the summary-table row), each carrying its own OLD/NEW/
   SOURCE/DATE/RATIONALE traceability note — across `DGR_PRODUCTION_BANK_7.2.md`,
   `_7.3.md`, `_7.4.md`, `_7.5.md`, `_7.6.md`, `_7.8.md`, `_7.9.md`, `_7.10.md`.

## 9. Explicit non-actions (per mission constraints)

- No question was auto-approved. Reviewer/approval status fields were not touched.
- No content was fabricated, no citation was inferred without an underlying real Bookshelf
  check having been recorded in the item's own file.
- No item was imported into KOST E-EXAM V2.
- Moodle was not touched in this mission.
- No production cutover was performed.

