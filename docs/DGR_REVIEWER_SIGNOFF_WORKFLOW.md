# DGR/CBTA Qualified-Reviewer Sign-Off Workflow

This file defines the full gate sequence a question-bank item must pass
through to reach `APPROVED`, and the exact sign-off mechanics for each
gate. It complements, and does not replace:

- `docs/DGR_EN_REVIEWER_GUIDE.md` — the bilingual (EN) reviewer's own
  onboarding guide and per-item sign-off format.
- `docs/DGR_EN_TERMINOLOGY_MASTER.md` — the cross-function terminology
  audit an EN reviewer should resolve before per-item review.
- `.claude/rules/dgr-stage2b.md` — the hard source-tier rules this
  workflow implements; in particular rules 4 and 5.
- `docs/RECOVERED_STAGE2A_CONTEXT.md`'s "Binding source restrictions
  recovered" (10 numbered rules) — restrictions 8, 9, and 10 are the direct
  origin of this workflow's gate structure.

**This file is preparation only.** No item's status is changed by writing
it. No reviewer has been named or engaged. Zero items anywhere in the
program are `APPROVED`.

## The four gates, in required order

An item reaches `APPROVED` only after all four gates below are complete,
each with its own named person and date recorded — not a single
"reviewed" checkbox. This mirrors the FR-status / EN-status / Approval
three-column structure already used in `docs/DGR_STAGE_2B_STATUS.md` and
every `docs/DGR_PRODUCTION_BANK_7.X.md` file; `APPROVED` requires all three
columns to show a completed, dated, named state simultaneously — not just
the Approval column.

### Gate 1 — FR Tier A regulatory verification

**What:** The item's correct answer and every distractor are checked
against the current IATA DGR 67th Edition 2026 (French, Addendum 1
integrated) — not the KOST course material the item was originally
drafted from (which is Tier B, and confirmed built on the 66th Edition for
every function in this program), not a legacy exam/practice book (Tier
C), and not this session's own paraphrase of either.

**Who:** Whoever has authenticated access to the IATA Digital Publications
Bookshelf and reads the actual current text — this can be an AI session
with a working Bookshelf connection (as Function 7.1's 11 pilot items
were), a human with Bookshelf access, or both. This is evidence-gathering,
not a judgment call, so it does not require the same "qualified reviewer"
credential as Gates 2–3 — but every claim must cite an exact current
section/table/page reference, per rule 6 (no bulk-copying licensed text;
concise references and conclusions only).

**Resulting FR status** (exactly one, no others):
- `FROZEN FR / SOURCE VERIFIED` — current text read, confirms the item
  as drafted (or confirms it with a documented wording correction).
- `FR SOURCE GAP CONFIRMED` — current text was read and does not support
  the item's premise (e.g. Q-7.1-001: the DGR glossary deliberately
  excludes the term). This is a terminal, decisive state, not a failure —
  it means the item's basis must be re-attributed to Tier B/C, not deleted
  outright, per the precedent set for Q-7.1-001.
- `FR SOURCE CONFLICT` — current text contradicts a prior source or
  another item's basis; do not resolve by guessing, record the conflict
  explicitly (see the Function 7.9/7.10 Block-7 star-rating precedent for
  how a conflict gets logged and later independently resolved).
- Anything still `DRAFT — Tier B only, SOURCE REQUIRED for Tier A` has not
  passed this gate yet. **This is the status of 442 of this program's 453
  items as of 2026-08-25** (all of Functions 7.2–7.10, plus 7 of Function
  7.1's 19). Gate 1 is currently blocked program-wide by the
  `chrome-devtools` MCP connection issue documented in
  `docs/AI_HANDOFF.md`'s "Tier A retry #2" entry — resuming Gate 1 for any
  item requires that connection to be re-bound to an authenticated
  Bookshelf tab first.

### Gate 2 — FR qualified technical reviewer sign-off

**What:** A named, qualified DGR/CBTA instructor reviews the item
(post-Gate-1) for pedagogical soundness, distractor fairness, alignment
with the item's own Stage 2A leaf sub-task, and correct question-type
usage (MCQ/True-False conventions) — a human-judgment layer Gate 1's
text-matching alone doesn't cover.

**Who:** Must be a real, named, qualified individual — a DGR instructor
with the standing to certify exam content for KOST's CBTA program. **No
such person has been identified or engaged in this session.** Do not
infer or assume this is the same person as the Bookshelf-access holder in
Gate 1, or the EN reviewer in Gate 3 — they may or may not be, but this
workflow does not presume it either way.

**Recording the sign-off:** append to the item's FR status field, e.g.
`FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by
<full name>, <role/credential>, <YYYY-MM-DD>)`.

### Gate 3 — EN bilingual reviewer sign-off

**What:** Covered in full by `docs/DGR_EN_REVIEWER_GUIDE.md` — meaning-
equivalence, terminology consistency (via `docs/DGR_EN_TERMINOLOGY_MASTER.md`),
and distractor plausibility preserved across the FR→EN translation.

**Who:** A named, qualified bilingual DGR reviewer. May be the same person
as Gate 2 if they are bilingual, or a different person — not presumed
either way. **No such person has been identified or engaged in this
session.**

**Recording the sign-off:** change the item's EN status field from
`BILINGUAL TECHNICAL REVIEW REQUIRED` to `BILINGUAL TECHNICAL REVIEW
COMPLETE (reviewed by <full name>, <YYYY-MM-DD>)`, per
`docs/DGR_EN_REVIEWER_GUIDE.md`'s own format.

### Gate 4 — `APPROVED`

**What:** Once Gates 1–3 are all individually complete and recorded for
one item, the item's Approval field changes from `PENDING REVIEWER +
DATE` to `APPROVED — <reviewer name>, <YYYY-MM-DD>` (the reviewer name
here should be whoever takes final accountability for the item as a
whole — often, but not necessarily, the Gate 2 FR reviewer).

**Hard rule, no exceptions:** an item may not be marked `APPROVED` if any
of Gates 1–3 shows a pending, incomplete, `DRAFT`, `SOURCE GAP`, or
`SOURCE CONFLICT` state. A `FR SOURCE GAP CONFIRMED` item (like the
precedent for Q-7.1-001) can still reach Gates 2–4 on its Tier B/C basis —
"gap confirmed" is a valid terminal Gate-1 outcome, not a block — but it
must be labeled as such throughout, never silently upgraded to imply Tier
A support it doesn't have.

## Current program-wide status against this workflow (2026-08-25)

| Gate | Items that have passed it | Items that have not |
|---|---|---|
| Gate 1 (Tier A) | 11 of Function 7.1's 12 pilot items (`FROZEN FR / SOURCE VERIFIED`) + 1 (`FR SOURCE GAP CONFIRMED`, itself a terminal pass) = **12/453** | 441/453 — blocked on the chrome-devtools reconnection |
| Gate 2 (FR reviewer) | **0/453** | 453/453 — no FR reviewer has been named/engaged |
| Gate 3 (EN reviewer) | **0/453** | 453/453 — all 453 items have a translation *draft*, none has been *reviewed* |
| Gate 4 (`APPROVED`) | **0/453** | 453/453 |

Nothing in this table is new information invented for this document — it
restates facts already recorded in `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`,
`docs/DGR_STAGE_2B_STATUS.md`, and each function's own production bank and
EN review package files. This document's only job is to make the
end-to-end path from `DRAFT` to `APPROVED` explicit and traceable to those
existing sources, not to advance any item's actual status.

## What this workflow does NOT authorize

- It does not authorize marking any item `APPROVED` — that requires all
  four gates genuinely complete, with real names and dates.
- It does not authorize inventing a reviewer name, credential, or date to
  fill in a gate.
- It does not authorize treating Gate 1 (Tier A) as optional or
  skippable — an item cannot reach `APPROVED` on Gates 2–4 alone.
- It does not claim `PLATFORM READY TO USE` or any other program-level
  readiness label — see `docs/PLATFORM_READINESS_REPORT.md` and
  `docs/FULL_PROGRAM_READINESS_SCOPE.md` for those labels' own criteria,
  which are separate from and broader than this per-item workflow.
