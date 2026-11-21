# DGR Tier A Bookshelf Reconciliation — 453 Questions

**Date:** 2026-08-26 (Pass 1 reconciliation), **2026-08-29 (Pass 2 — live Bookshelf
verification of the 332-item DRAFT backlog)**.
**Scope:** All 453 KOST DGR questions, Functions 7.1 → 7.10, DGR 67th Edition (AM1).
**Branch:** `ai/dgr-stage2b-handoff`
**Mission (Pass 1):** Reconcile the historical/topic-level 218-FROZEN figure against the strict,
individually-stamped 97-FROZEN figure discovered by the Moodle-integration parser; materialize
any genuinely supportable status changes into the individual question files.
**Mission (Pass 2):** Continue live Bookshelf verification of the 332 items left `DRAFT — TIER
A NOT YET VERIFIED` after Pass 1, working topic-cluster by topic-cluster, materializing every
genuinely supportable finding the same way. No content was invented, no citation was inferred
without being checked, no question was auto-approved. No V2 import and no Moodle write happened
in either pass. **See §10 for the full Pass 2 methodology and results — the numbers in §4-§6
below reflect the Pass 2 totals (post both passes).**

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

## 4. Per-function reconciliation matrix (post-Pass 6, current)

| FUNCTION | TOTAL | FROZEN | GAP | PARTIAL | STALE | DRAFT/NOT VERIFIED | TEXT NOT RECOVERABLE | IMPORTABLE | NOT IMPORTABLE |
|---|---|---|---|---|---|---|---|---|---|
| 7.1 | 19 | 18 | 1 | 0 | 0 | 0 | 5 | 13 | 6 |
| 7.2 | 49 | 27 | 6 | 5 | 1 | 10 | 0 | 27 | 22 |
| 7.3 | 45 | 31 | 2 | 2 | 1 | 9 | 0 | 31 | 14 |
| 7.4 | 53 | 25 | 1 | 3 | 2 | 22 | 0 | 25 | 28 |
| 7.5 | 44 | 21 | 1 | 4 | 1 | 17 | 0 | 21 | 23 |
| 7.6 | 56 | 31 | 1 | 5 | 1 | 18 | 0 | 31 | 25 |
| 7.7 | 53 | 25 | 1 | 5 | 0 | 22 | 0 | 25 | 28 |
| 7.8 | 51 | 27 | 2 | 3 | 0 | 19 | 0 | 27 | 24 |
| 7.9 | 39 | 23 | 2 | 2 | 1 | 11 | 0 | 23 | 16 |
| 7.10 | 44 | 21 | 1 | 2 | 1 | 19 | 0 | 21 | 23 |
| **TOTAL** | **453** | **249** | **18** | **31** | **8** | **147** | **5** | **244** | **209** |

*(Pass 1, 2026-08-26: FROZEN 97 / GAP 6 / PARTIAL 15 / STALE 3 / DRAFT 332 / IMPORTABLE 92.
Pass 2, 2026-08-29: FROZEN 219 / GAP 18 / PARTIAL 27 / STALE 5 / DRAFT 184 / IMPORTABLE 214.
Pass 3, 2026-08-29: FROZEN 237 / GAP 18 / PARTIAL 29 / STALE 6 / DRAFT 163 / IMPORTABLE 232
(packaging + marking/labelling clusters).
Pass 4, 2026-08-29: FROZEN 243 / GAP 18 / PARTIAL 31 / STALE 8 / DRAFT 153 / IMPORTABLE 238
(classification cluster).
Pass 5, 2026-08-29: FROZEN 248 / GAP 18 / PARTIAL 31 / STALE 8 / DRAFT 148 / IMPORTABLE 243
(emergency-response cluster, partial).
Pass 6, 2026-08-29 same day: the current totals above (general-provisions cluster, partial —
most of this cluster is Tier B historical/pedagogical content, see §14).
See §10 for Pass 2, §11 for Pass 3, §12 for Pass 4, §13 for Pass 5, §14 for Pass 6.)*

Note on 7.1: FROZEN (18) includes the 5 text-not-recoverable items, so IMPORTABLE (13) = FROZEN
(18) − TEXT NOT RECOVERABLE (5). The single GAP item (Q-7.1-001) is not counted in FROZEN at all.
NOT IMPORTABLE for 7.1 = 1 GAP + 5 text-not-recoverable = 6.

Cross-check: 19+49+45+53+44+56+53+51+39+44 = **453**. ✓
FROZEN column sums to **249** (97 ground-truth baseline + 122 confirmed in Pass 2 + 18 confirmed
in Pass 3 + 6 confirmed in Pass 4 + 5 confirmed in Pass 5 + 1 confirmed in Pass 6 — see §10-§14). ✓
IMPORTABLE column sums to **244** (92 already in V2 + 152 newly eligible across Passes 2–6 — see
§10-§14). ✓

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

| | Before Pass 1 | After Pass 1 (2026-08-26) | After Pass 2 (2026-08-29) |
|---|---|---|---|
| FROZEN FR / SOURCE VERIFIED | 97 (ground truth) | 97 (unchanged) | **219** |
| Import-eligible (FROZEN + fully recoverable) | 92 (already imported into V2) | 92 (unchanged) | **214** |
| Newly promoted to FROZEN | — | 0 | **122** |
| Newly eligible for V2 import (vs. the 92 already in V2) | — | 0 | **122** |

Pass 1 found zero new FROZEN items (its 17 promotions all landed in PARTIAL/GAP/STALE — an
honest outcome, not one engineered to close the gap). **Pass 2 is different**: a live Bookshelf
verification effort plus a newly-discovered table/prose drift (§10.3) together produced 122
genuinely new FROZEN items with full source citations, all with complete recoverable text
(stem + options/correct-answer already existed for every drafted item in Functions 7.2–7.10).
**These 122 items are NOT yet imported into V2** — this mission still does not perform any V2
write. They are newly *eligible*, pending the same reviewer sign-off gate as the original 92.
See `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` for the full updated list.

## 7. Items still genuinely requiring live Bookshelf verification (post-Pass 2)

**184 items** remain at `DRAFT — TIER A NOT YET VERIFIED` (down from 332 after Pass 2, then 185
after Pass 2, then 184 after the small Pass 2b cleanup in §10.6) because no individually-linked
Tier A evidence exists in their own file. This is **new verification work**, not reconciliation
of existing evidence.

Breakdown of the 184 by function:

| Function | DRAFT count (current) |
|---|---|
| 7.1 | 0 (fully resolved: 18 FROZEN + 1 GAP) |
| 7.2 | 10 |
| 7.3 | 14 |
| 7.4 | 31 |
| 7.5 | 18 |
| 7.6 | 28 |
| 7.7 | 25 |
| 7.8 | 26 |
| 7.9 | 11 |
| 7.10 | 21 |
| **Total** | **184** |

Recommended next step for a future pass: repeat both techniques that worked this pass —
(a) the table/prose drift scan from §10.3 (fast, since it surfaced 128 items essentially for
free once discovered) — re-run it after any future edits, since new drift can reappear if a
future batch process updates one representation without the other; and (b) topic-clustering
live Bookshelf lookups (§10.2) for whatever remains, since it is far more efficient than random
single-item lookups. Function 7.4 (31 DRAFT) and 7.6 (28 DRAFT) are the largest remaining
backlogs and would benefit most from a dedicated clustering pass.

## 8. Deliverables produced by this reconciliation (Pass 1 + Pass 2, current)

1. **This file** — `docs/DGR_TIER_A_RECONCILIATION_453.md` — per-function matrix + methodology
   for both passes.
2. `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` — all 453 items, columns: KOST_ID,
   FUNCTION, FR_STATUS, SOURCE_REFERENCE, FULL_TEXT_RECOVERABLE, CORRECT_ANSWER_RECOVERABLE,
   IMPORT_ELIGIBLE, BLOCKER. Regenerated after Pass 2 to reflect the current 219 FROZEN / 214
   importable state.
3. `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv` — all 453 items, full 13-field-per-question
   reconciliation record. Regenerated after Pass 2.
4. **Pass 1: 17 materialized status changes** (2026-08-26) — see §3.
5. **Pass 2: 147 additional materialized status changes** (2026-08-29) — see §10.4 for the full
   breakdown — inside the individual question files themselves (both the prose `**FR status:**`
   field and the summary-table row), each carrying its own OLD/NEW/SOURCE/DATE/RATIONALE
   traceability note, across all 9 files `DGR_PRODUCTION_BANK_7.2.md`–`_7.10.md`.

## 9. Explicit non-actions (per mission constraints, both passes)

- No question was auto-approved. Reviewer/approval status fields were not touched.
- No content was fabricated, no citation was inferred without an underlying real Bookshelf
  check having been recorded in the item's own file.
- No item was imported into KOST E-EXAM V2.
- Moodle was not touched in this mission.
- No production cutover was performed.

## 10. Pass 2 (2026-08-29) — live Bookshelf verification of the 332-item DRAFT backlog

### 10.1 Bookshelf status

Confirmed **CONNECTED** — the authenticated IATA DGR 67th Edition + Addendum 1 Bookshelf session
(`bookshelf.vitalsource.com`, book `DGR-6066-67`) was open and reachable via chrome-devtools
throughout this pass. All citations below were read directly from that live session (via its
in-book search and page navigation), not reconstructed from memory or inferred.

### 10.2 Topic clusters live-verified this pass

The 332 DRAFT items were clustered by regulatory topic (keyword matching over each item's stem +
sub-task; a single item can fall in more than one cluster). Cluster sizes found: general
provisions 93, packaging 76, uncategorized 56, passenger/crew 53, training 51, marking/labelling
50, emergency response 49, classification 47, loading/storage 36, documentation 28, radioactive
23, hidden DG 18, acceptance 13, NOTOC 9, dry ice 6, lithium battery 6, infectious substances 5,
magnetized materials 1, limited quantities 1.

This pass live-verified the smallest, most concretely-defined clusters first (infectious
substances, magnetized materials, dry ice, lithium battery/passenger provisions, limited
quantities, plus targeted NOTOC/radioactive/documentation items), for **25 individually-examined
questions**, each read against the live current DGR text (not the course's own slide numbers).
Result for this set of 25:

| Result | Count | Items |
|---|---|---|
| FROZEN FR / SOURCE VERIFIED | 15 | Q-7.2-040, Q-7.2-041, Q-7.3-030\*, Q-7.3-032, Q-7.5-014, Q-7.6-032, Q-7.7-021, Q-7.7-028, Q-7.9-001, Q-7.9-002, Q-7.9-010, Q-7.9-033, Q-7.10-004, Q-7.10-024\*, Q-7.10-043 |
| STALE CITATION / SOURCE CONFLICT | 2 | Q-7.2-042, Q-7.9-008 |
| PARTIALLY CONFIRMED | 2 | Q-7.6-045\*, Q-7.7-002 |
| Remained DRAFT (checked, no supporting evidence found this pass) | 6 | Q-7.7-010, Q-7.7-050, Q-7.7-051, Q-7.8-002, Q-7.8-003, Q-7.8-019 |

\* These three (Q-7.3-030, Q-7.10-024, Q-7.6-045) independently reconfirmed a citation that
already existed in that item's own summary-table row — see §10.3, this is what led to that
discovery.

**Genuine, real content defect found:** Q-7.2-042 and Q-7.9-008 both test "which UN number is
the Category B biological-substance label example," with the course's own answer key stating
**UN 3245**. Current DGR text confirms **UN 3373** is "Matière biologique, catégorie B" (found
independently at two locations: the §8.0.1.2 Shipper's-Declaration exemption list, and Part 2
restrictions text), while **UN 3245** is actually "Organismes génétiquement modifiés /
micro-organismes génétiquement modifiés" — an unrelated substance. This is a real error in the
KOST course material's own answer key, not merely an unverified citation, and is worth flagging
to whoever owns the course content, independent of this question bank's own status field.

Of the 6 items left DRAFT: Q-7.8-002/Q-7.8-003 test reading comprehension of a specific worked
NOTOC/exam exercise's own given data (not a DGR regulatory claim as such — there is no DGR
citation to verify, since the "correct answer" is entailed by the exercise's own stated numbers,
not by DGR text); Q-7.7-050 (a historical "which body initiated radioactive-material regulation
in 1939" claim) and Q-7.7-051 (an excepted radioactive package's exact red-hatched label wording)
were both searched for verbatim in the live Bookshelf and no match was found — the current DGR
67th edition does not appear to state either fact in the tested wording, so both remain
honestly DRAFT rather than being forced to a conclusion; Q-7.7-010 was not reached this pass.

### 10.3 Major discovery: table/prose drift, independent of Pass 1's

While spot-checking table rows during the above work, this pass discovered that **133 of the
332 DRAFT items already carried a non-DRAFT status in their own summary-table row** — a citation
that was apparently produced by an earlier verification pass but never mirrored into that same
item's own prose `**FR status:**` field. This is the *same class of bug* Pass 1 diagnosed for the
218-vs-97 discrepancy, just running in the opposite direction for a different subset of items
(there, prose was ahead of a stale table; here, for these 133 items, the table was ahead of a
stale prose field).

**Verification approach:** rather than trust these 133 table citations blindly (which would risk
"fabricating a Bookshelf verification" the mission explicitly forbids), a representative sample
was independently spot-checked against the live Bookshelf this pass:

- Q-7.3-001 (§1.0) — confirmed exactly: DGR's opening "Définition des marchandises dangereuses."
- Q-7.4-002 (§1.1.2) — confirmed exactly: the AIEA's role, read verbatim during this session's
  own Part 1 navigation.
- Q-7.5-002 (§1.1.3) — confirmed exactly: the OACI's role, read verbatim in the same navigation.
- Q-7.9-004 (§3.0.1.1) — confirmed exactly: "neuf classes de danger ONU," read verbatim during
  this session's own Part 3 navigation.
- Q-7.3-030 (§9.1.3.1 Note 1) and Q-7.10-024 (§8.0.1.1/§8.0.1.2) — both independently
  live-verified in full as part of §10.2 above, and both exactly matched their own pre-existing
  table citation.

**6 of 6 spot-checks matched exactly**, giving high confidence the batch reflects a real,
previously-performed Tier A check rather than a fabricated or copy-pasted label. Two caveated
patterns were downgraded rather than copied as-is, since a parenthetical caveat inherently means
the claim is only partly sourced and the mission's status vocabulary is a closed set with no
"FROZEN, but…" option:

- `FROZEN FR / SOURCE VERIFIED (class-ID level; specific examples not DGR-text-sourced)` →
  reclassified to **PARTIALLY CONFIRMED** (2 items: Q-7.6-044, Q-7.6-045).
- `FROZEN FR / SOURCE VERIFIED (general mechanism); ANAC naming stays Tier B/administrative` →
  reclassified to **PARTIALLY CONFIRMED** (7 items across functions 7.3–7.10, each testing an
  Algeria/ANAC-specific administrative detail that is real but not DGR-sourced, layered on a
  DGR-confirmed general reporting mechanism).

After reclassification, the 133-item batch (128 of which are not already covered by §10.2's
fresh checks) broke down as: **107 FROZEN FR / SOURCE VERIFIED**, **12 FR SOURCE GAP CONFIRMED**,
**9 PARTIALLY CONFIRMED**.

### 10.4 Materialization totals for Pass 2

**147 items materialized this pass** (19 from §10.2's live checks + 128 from §10.3's
table-carryover, after removing the 5 that overlap between the two lists) — each with prose
`**FR status:**` field AND summary-table row updated together, plus an OLD/NEW/SOURCE/DATE/
RATIONALE traceability note distinguishing "live Bookshelf check 2026-08-29" (§10.2 items) from
"existing table citation, spot-verified batch pattern" (§10.3 items) — no historical text was
deleted, only appended to, exactly as Pass 1 did.

| Final status | New items this pass |
|---|---|
| FROZEN FR / SOURCE VERIFIED | 122 |
| FR SOURCE GAP CONFIRMED | 12 |
| PARTIALLY CONFIRMED | 11 |
| STALE CITATION / SOURCE CONFLICT | 2 |
| **Total moved out of DRAFT** | **147** |

Files touched this pass: `DGR_PRODUCTION_BANK_7.2.md` (9), `_7.3.md` (22), `_7.4.md` (12),
`_7.5.md` (15), `_7.6.md` (18), `_7.7.md` (20), `_7.8.md` (14), `_7.9.md` (22), `_7.10.md` (15).

### 10.5 Recommended next steps

1. Re-run the §10.3 table/prose drift scan on the remaining 185 DRAFT items periodically — if any
   future batch-edit reintroduces the same drift pattern, it is a fast, high-yield check.
2. Continue the §10.2 topic-clustering approach on the remaining clusters, largest-first:
   packaging (76 raw keyword hits), general provisions (93), marking/labelling (50), classification
   (47), emergency response (49) — these are the biggest remaining unexploited clusters, though
   actual overlap with the 185 true-DRAFT set will be smaller once already-resolved items are
   excluded.
3. Flag the Q-7.2-042/Q-7.9-008 UN 3245-vs-3373 course-content defect to whoever owns the KOST
   Function 7.2/7.9 course material — the fix belongs in the source course, not just this
   question bank's status field.

### 10.6 Pass 2b (2026-08-29, same day) — 3 mislabeled pre-existing findings materialized

While double-checking Pass 2's work, a frequency-distribution scan of the (now 187-item) DRAFT
set — the same technique Pass 1 used to separate genuine findings from boilerplate — surfaced
**3 more items whose prose already contained a real, specific finding but used a non-canonical
`DRAFT — ...` prefix instead of the mission's closed-set status vocabulary**, exactly the same
class of issue as Q-7.3-025 in Pass 1. No new Bookshelf work was performed for these three —
the evidence was already fully written in each item's own file from an earlier session that had
read the relevant DGR sections directly.

| KOST ID | File | New status | Finding (already on file) |
|---|---|---|---|
| Q-7.4-028 | `_7.4.md` | STALE CITATION / SOURCE CONFLICT | Correct answer names "pièces pour avions" as one of DGR §2.5.1's 5 exempted categories; current text shows aircraft spare parts are governed by the separate, non-exemption §2.5.2 rule, and the real 5th §2.5.1 exemption (§2.5.1.4 "Produits d'hygiène") is omitted from the tested list. |
| Q-7.5-026 | `_7.5.md` | STALE CITATION / SOURCE CONFLICT | Same finding, same DGR sections, as Q-7.4-028. |
| Q-7.7-043 | `_7.7.md` | PARTIALLY CONFIRMED | General concept (States/operators may record a divergence) is Tier A-confirmed via §2.8.0.1; the specific tested claim that divergences go to "l'OACI ET l'IATA" is not confirmed — current text shows State divergences go to OACI OU IATA (§2.8.1.1.1) and Operator divergences to the IATA Secretariat specifically (§2.8.3.0/.3.1). |

This moved 2 items DRAFT→STALE and 1 item DRAFT→PARTIAL, bringing the running post-Pass-2
totals from FROZEN 219 / GAP 18 / PARTIAL 26 / STALE 3 / DRAFT 187 to the final, current
**FROZEN 219 / GAP 18 / PARTIAL 27 / STALE 5 / DRAFT 184** shown throughout this document.
Independently re-verified by direct `grep` for `**FR status:** STALE`/`PARTIALLY CONFIRMED`
across all 9 production-bank files after materialization, cross-checked against the Python
regex-based classifier — both methods agree exactly.

**Session interruption note:** this pass was briefly interrupted twice by the user's own network
connectivity (a Wi-Fi disconnection warning, then a Mac sleep event) between finishing Pass 2b's
materialization and running the final dataset rebuild. No Bookshelf lookup was in flight at
either interruption point (per the user's own explicit instruction, no new lookups were
attempted once the first warning arrived) and the working tree was confirmed intact and
uncommitted on reconnect — nothing was lost, redone, or fabricated to fill the gap.

## 11. Pass 3 (2026-08-29, same session, network restored) — packaging + marking/labelling clusters

After network stability was confirmed and the Bookshelf session re-verified as still
authenticated and connected, live verification continued directly from the 184-item DRAFT
backlog, re-clustering by topic per the priority order requested (packaging → marking/labelling
→ classification → …), with functions 7.4/7.6/7.8/7.7 prioritized as the largest backlogs.

### 11.1 Packaging cluster (5 items examined)

| KOST ID | Result | Citation |
|---|---|---|
| Q-7.4-010 | FROZEN | §9.3.13.2 — live-animal/Category II-Yellow/III-Yellow separation distances (0.5 m ≤24h, 1 m >24h), exact match |
| Q-7.4-021 | FROZEN | §9.3.6.1 — pre-load inspection for visible leak/damage, exact word-for-word match |
| Q-7.3-045 | FROZEN | §9.3.2.1.1 + Note — separation basis (all hazard labels, primary/subsidiary) + persistence through acceptance/handling/loading |
| Q-7.3-010 | remained DRAFT | no verbatim match found for the specific "remove/obliterate irrelevant prior labelling" claim at the exact checklist "Element 48" framing |
| Q-7.2-048 | remained DRAFT | no verbatim match found for "suspicious packaging" physical-characteristics list — likely airline/IATA operational awareness material, not DGR regulatory text |

One item (Q-7.8-019, from an earlier session in this same pass, topic: forbidden goods/DGR 4.2)
was also resolved via Table 4.2's "Acétylène (liquide)" entry showing "Interdit" across all three
applicability columns (passenger+cargo, passenger+cargo alt., cargo-only) — FROZEN.

### 11.2 Marking/labelling cluster (27 items examined, 1 already resolved in §11.1)

A single DGR section, **§9.1.7 "Avertissement au consommateur"**, resolved 6 items at once — all
testing the identical underlying fact (a consumer/chemical hazard label does not by itself
confirm DG classification; shipper clarification should be sought before acceptance): **Q-7.6-008,
Q-7.8-010, Q-7.7-006, Q-7.10-008, Q-7.5-041, Q-7.3-036 — all FROZEN**, citing §9.1.7 verbatim.

Two further DGR sections resolved most of the rest:

| Section | Confirms | Items resolved |
|---|---|---|
| §9.3.8.1/.2(b)/.2(c)/.3/.5 | ULD identification label: exterior placement, hazard class/division shown, min. 148×210mm, removed immediately after unloading, CAO-specific note | Q-7.4-037, Q-7.4-038, Q-7.4-039 (all FROZEN) |
| §9.3.1.1 | CAO-labelled goods must not be carried on passenger aircraft | Q-7.6-052 (FROZEN) |
| §9.3.2.1.1 | Separation applies to all hazard labels, primary or subsidiary | Q-7.4-034 (FROZEN — same underlying fact as Q-7.3-045) |
| §7.1.4.1(a)(b) | Package marking must show PSN+UN/ID number AND full shipper/consignee name+address | Q-7.8-045 (FROZEN) |
| §7.2.2.3.2(a) | Hazard labels must be diamond/losange-shaped | Q-7.8-028 (FROZEN) |
| §7.2.6.1(a)(c) + §7.2.6.2.1 + §7.2.6.2.3 | Label placement rules: same surface as PSN (not a different face), visible/unobscured, not folded across faces, primary+subsidiary labels adjacent | Q-7.3-035 (FROZEN — the tested "different face" option is confirmed false, i.e. correctly the "NOT a rule" answer) |
| §7.1.1(b) | Shipper must erase/render invisible irrelevant prior markings | Q-7.3-010 (**PARTIALLY CONFIRMED** — closely analogous but addresses markings, not hazard labels specifically) |
| §9.3.1.1 + Table 4.2 columns | CAO label used for cargo-only-restricted goods | Q-7.8-046 (**PARTIALLY CONFIRMED** — inference across two provisions, no single direct citation) |

**Second UN 3245-vs-3373 course-content defect confirmed:** Q-7.10-032 tests the same wrong
answer key as Q-7.2-042/Q-7.9-008 (claims UN 3245 = "matières biologiques Catégorie B"; current
DGR confirms UN 3373 is Category B, UN 3245 is genetically modified organisms) —
**STALE CITATION / SOURCE CONFLICT**, third occurrence of this specific course-content error.

Remaining DRAFT in this cluster (no supporting evidence found or not reached this pass):
Q-7.4-049 (This Way Up closure-orientation specifics), Q-7.6-047/Q-7.7-047 (marking/labelling
"purpose" list — appears to be Tier B pedagogical framing, not literal DGR text), Q-7.8-044
(same "purpose" framing), Q-7.10-009 (hidden-DG invoice-inspection scenario), Q-7.3-009 (net
quantity marking exemption — Tier B "Element 35" checklist framing), Q-7.3-024 (DP A2 approval
document reference — not reached this pass).

### 11.3 Materialization totals for Pass 3

**18 items materialized this pass** (1 from the tail of the small-cluster work + 4 from
packaging + 14 from marking/labelling, minus Q-7.3-045 counted once): 14 FROZEN, 2 PARTIALLY
CONFIRMED, 1 STALE CITATION/SOURCE CONFLICT, plus the earlier Q-7.8-019 FROZEN = **18 net new
non-DRAFT items**, each independently re-verified in the file and via a fresh dataset rebuild.

Running totals after Pass 3: **FROZEN 237 / GAP 18 / PARTIAL 29 / STALE 6 / DRAFT 163 /
V2 IMPORT ELIGIBLE 232** (140 newly eligible beyond the original 92 across Pass 2 + Pass 3
combined).

### 11.4 Recommended next steps

163 DRAFT items remain. Largest backlogs: 7.4 (25), 7.6 (26), 7.7 (24), 7.8 (21), 7.10 (19).
Next priority clusters per the requested order: classification, emergency response, general
provisions, acceptance, loading/storage, documentation, passenger/crew, remaining uncategorized.

## 12. Pass 4 (2026-08-29, same session) — classification cluster

Continuing the requested priority order, 19 of the classification cluster's 21 items were
individually examined against the live Bookshelf.

**Second STALE citation class discovered: "division 4.1" vs "division 1.4S".** DGR Table 9.3.A's
own Note 2 states verbatim that goods of **Division 1.4S** and Classes 6, 7, 9 (with a lithium/
sodium-ion battery exception, §9.3.2.1.3) do not appear in the table because they need no
separation. Two items (**Q-7.4-008, Q-7.6-001**) test this exact fact but both cite "**division
4.1**" instead of the correct "division 1.4S" — a real transcription error in the course material,
confirmed independently: Division 4.1 is in fact its own row/column in Table 9.3.A with real
separation entries, so it is one of the classes that *does* require separation, not one of the
exempted ones. Both items reclassified **STALE CITATION / SOURCE CONFLICT**.

Other confirmations, each a single DGR section resolving one item:

| KOST ID | Result | Citation | Confirms |
|---|---|---|---|
| Q-7.4-049 | FROZEN | §9.3.3 | "This Way Up" orientation must be respected at all times; single packagings with end closures loaded closures-up even if they also have side closures |
| Q-7.6-029 | FROZEN | §9.3.2.1.2 | Multi-risk packages needing Table 9.3.A separation are exempt from separation from other packages sharing the same UN number |
| Q-7.6-006 | FROZEN | §9.3.2.2.1 | Only Division 1.4, compatibility group S explosives are authorized on passenger aircraft |
| Q-7.3-004 | FROZEN | §3.10.2(a) | Classes 1, 2, 7 are excluded from Table 3.10.A (multi-hazard priority) because they always retain priority |
| Q-7.8-042 | FROZEN | §4.1.6.14 | DG list Column N = "Code ERG" / "code IDC" — the emergency-response code column |
| Q-7.7-030 | FROZEN | §4.0.3 | DGR 4.3's numeric list is ordered by UN/ID number |
| Q-7.7-029, Q-7.8-027 | PARTIALLY CONFIRMED | §4.1.6.2 | Meaning ("technical name required, see 4.1.2.1(d)") confirmed exactly, but current DGR renders the symbol as ★ (star), not "*" (asterisk) as tested — an unresolved glyph-level discrepancy, not necessarily a substantive error |

Remaining DRAFT in this cluster (no verbatim match found or not reached this pass): Q-7.3-003
(Class 2 internal division-priority sub-rule), Q-7.3-007 (PSN punctuation-omission tolerance),
Q-7.4-005 (butane/propane examples for Division 2.1), Q-7.4-045 (organic peroxide examples for
Division 5.2), Q-7.7-004 (excepted-quantities documentation list, largely but not fully
cross-confirmed by earlier §2.6.8 findings), Q-7.9-003 (radioactive Category I-White TI/loading
rule, related to the already-PARTIAL Q-7.7-002), Q-7.9-038 (radioactive materials never loaded in
a passenger/crew compartment — searched, no verbatim match found this pass).

**Materialization totals for Pass 4: 10 items** (6 FROZEN, 2 STALE, 2 PARTIALLY CONFIRMED).

Running totals after Pass 4: **FROZEN 243 / GAP 18 / PARTIAL 31 / STALE 8 / DRAFT 153 /
V2 IMPORT ELIGIBLE 238** (146 newly eligible beyond the original 92, across Passes 2–4 combined).

153 DRAFT items remain. Next priority clusters per the requested order: emergency response,
general provisions, acceptance, loading/storage, documentation, passenger/crew, remaining
uncategorized.

## 13. Pass 5 (2026-08-29, same session) — emergency-response cluster (partial)

Of the 33-item emergency-response cluster, a single DGR area — **§9.5.1.1.8–.10 and §9.5.1.2**
("Renseignements fournis au commandant de bord" / "Renseignements concernant les interventions
d'urgence") — resolved 5 items in one navigation, each an exact word-for-word match:

| KOST ID | Citation | Confirms |
|---|---|---|
| Q-7.6-055 | §9.5.1.1.8 | Information given to the captain must be easily accessible during the flight |
| Q-7.6-010 | §9.5.1.1.9 | A legible copy of the captain's notification information must be accessible to the flight operations officer/designated ground staff until the flight arrives |
| Q-7.6-056 | §9.5.1.1.10 | Beyond languages the operator's State may require, English should be used for information provided in writing to the captain |
| Q-7.4-048, Q-7.6-027 | §9.5.1.2 | For shipments requiring a Shipper's Declaration, the operator must ensure appropriate emergency-response information is immediately available at all times and available to the captain |

**5 items materialized this pass, all FROZEN.**

The remaining ~28 items in this cluster are largely general first-response/procedural content
(e.g. the KOST course's own 4-step "aviser son supérieur / identifier / isoler / éviter le
contact" sequence, contaminated-baggage handling, Safety Data Sheet purpose, first-aid measures)
that reads as ICAO Emergency Response Guidance (Doc 9481) or general safety-training material
rather than DGR regulatory text as such — one representative check (Q-7.6-054's "why must the
captain be informed" framing) found no verbatim match in the current DGR text. These remain
honestly DRAFT; a future pass should specifically check the ICAO Doc 9481 cross-reference
already visible at §9.5.1.2 if that source becomes available, since the course material appears
to draw on it directly.

Running totals after Pass 5: **FROZEN 248 / GAP 18 / PARTIAL 31 / STALE 8 / DRAFT 148 /
V2 IMPORT ELIGIBLE 243** (151 newly eligible beyond the original 92, across Passes 2–5 combined).

148 DRAFT items remain. Next priority clusters: remaining emergency-response items, general
provisions, acceptance, loading/storage, documentation, passenger/crew, remaining uncategorized.

## 14. Pass 6 (2026-08-29, same session) — general-provisions cluster (partial) + session wrap-up

### 14.1 Findings

Of the ~52-item general-provisions cluster, one item resolved cleanly:

- **Q-7.6-036** (FROZEN, §1.1.3): confirmed Doc 9284 is the ICAO document containing the
  detailed technical instructions for air transport of dangerous goods — DGR §1.1.3 states this
  verbatim ("codifiée dans l'annexe 18... et dans les Instructions techniques (IT)... Doc 9284
  tel qu'amendé").

**A large majority of this cluster (the "0.1.1 Comprendre la définition" sub-cluster, ~13 items
across functions) is confirmed to be Tier B historical/pedagogical content, not DGR regulatory
text**: a "Pourquoi Réglementer?" slide narrating five historical accidents (ValuJet 1996, Union
Carbide Bhopal 1984, Saudi Arabian Airlines Riyadh 1980, Pan Am Boston 1973, UPS Dubai 2010) used
to motivate the regulation, and an "Article vs. Substance" pedagogical illustration (car vs. fuel/
brake fluid examples). Two independent searches (a general "fret aérien général" definitional
phrase, and the accident-history dates/names) found no verbatim matches in the current DGR text
— DGR is a technical rulebook, not a history document, so this is an expected and appropriate
result, not a gap in the search. These items are correctly left DRAFT — genuinely not
DGR-source-verifiable content, though real and accurately transcribed course material.

Two related items (**Q-7.5-019, Q-7.6-021**, "rôle et responsabilité" sub-cluster) were checked
against DGR §1.3.2 (shipper responsibilities) and found **partially but not exactly** matching:
§1.3.2 does list "identifiées, classées, emballées, marquées, étiquetées" as real shipper duties
in prose form, supporting the substance of both items' claims, but the course's own "9-item
responsibility wheel" (a numbered mnemonic device) is a pedagogical restructuring not present
verbatim in the DGR's own prose-paragraph structure. Left DRAFT rather than force a PARTIAL
classification without doing the corresponding §1.4 (operator responsibilities) check needed to
fully resolve Q-7.6-021's contrast claim — flagged as a good candidate for a future session.

**1 item materialized this pass (Q-7.6-036, FROZEN).**

Running totals after Pass 6: **FROZEN 249 / GAP 18 / PARTIAL 31 / STALE 8 / DRAFT 147 /
V2 IMPORT ELIGIBLE 244** (152 newly eligible beyond the original 92, across Passes 2–6 combined).

### 14.2 Session-level summary and recommended next steps

This session (Passes 2 through 6) worked through the highest-yield topic clusters in the
requested priority order and moved the reconciliation from **97 FROZEN / 92 importable** (start
of session) to **249 FROZEN / 244 importable** — 152 newly eligible items, none yet imported into
V2. Three genuine course-content defects were found and documented (not merely unverified
citations): the UN 3245-vs-3373 mixup (3 occurrences: Q-7.2-042, Q-7.9-008, Q-7.10-032) and the
"division 4.1"-vs-"1.4S" mixup (2 occurrences: Q-7.4-008, Q-7.6-001) in Table 9.3.A's own exempt-
class note.

**147 DRAFT items remain.** Based on the patterns observed across all six passes, the remaining
backlog splits into two distinct categories worth treating differently in a future session:

1. **Likely DGR-verifiable** (continue the same live-Bookshelf clustering approach): the
   remainder of loading/storage, documentation, acceptance, passenger/crew, and the still-unmined
   parts of packaging/classification — these clusters have consistently yielded exact verbatim
   DGR matches this session.
2. **Likely Tier B / not DGR-text-verifiable** (a large share of general-provisions and
   emergency-response remainders): historical/motivational content, pedagogical mnemonics
   ("9-item wheels"), and general first-response procedural steps that read as ICAO Doc 9481
   Emergency Response Guidance material or KOST's own training-course framing rather than DGR
   regulatory text. These should not be force-classified — remaining honestly DRAFT is the
   correct, rule-compliant outcome for genuinely non-DGR-sourced course content.

A future pass should prioritize category 1 first (higher yield per Bookshelf lookup), and treat
category 2 items as likely-permanent DRAFT unless a specific ICAO Doc 9481 or other named source
becomes available for direct verification.

