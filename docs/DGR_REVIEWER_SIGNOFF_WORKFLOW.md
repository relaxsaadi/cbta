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
each with its own named person and real review date recorded — not a single
"reviewed" checkbox. Review dates must be valid calendar dates and may not
be postdated. This mirrors the FR-status / EN-status / Approval three-column
structure already used in `docs/DGR_STAGE_2B_STATUS.md` and every
`docs/DGR_PRODUCTION_BANK_7.X.md` file; `APPROVED` requires all three
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
with a working Bookshelf connection, a human with Bookshelf access, or
both. This is evidence-gathering, not a judgment call, so it does not
require the same "qualified reviewer" credential as Gates 2–3 — but every
claim must cite an exact current section/table/page reference, per rule 6
(no bulk-copying licensed text; concise references and conclusions only).

**Resulting FR status** (exactly one, no others):
- `FROZEN FR / SOURCE VERIFIED` — current text read, confirms the item
  as drafted (or confirms it with a documented wording correction). This
  is the only Gate-1 state that can continue toward production
  `APPROVED` for a regulatory claim.
- `FR SOURCE GAP CONFIRMED` — current text was read and does not support
  the item's regulatory premise. This is a decisive diagnostic state,
  but it is **not** an approval-eligible Gate-1 pass. The item may remain
  recorded for drafting/history on its Tier B/C basis, but it must be
  repaired, re-attributed, or rewritten so the production claim itself is
  supported and then re-verified before it can continue toward
  `APPROVED`.
- `FR SOURCE CONFLICT` — current text contradicts a prior source or
  another item's basis; do not resolve by guessing, record the conflict
  explicitly and keep the item non-approved until the conflict is
  independently resolved and the resulting production claim is verified.
- Anything still `DRAFT — Tier B only, SOURCE REQUIRED for Tier A`,
  `PARTIALLY CONFIRMED`, `STALE CITATION`, `SOURCE REQUIRED`, or another
  unresolved source state has not passed this gate.

### Gate 2 — FR qualified technical reviewer sign-off

**What:** A named, qualified DGR/CBTA instructor reviews the item
(post-Gate-1) for pedagogical soundness, distractor fairness, alignment
with the item's own Stage 2A leaf sub-task, and correct question-type
usage (MCQ/True-False conventions) — a human-judgment layer Gate 1's
text-matching alone doesn't cover.

**Who:** Must be a real, named, qualified individual — a DGR instructor
with the standing to certify exam content for KOST's CBTA program. Do not
infer or assume this is the same person as the Bookshelf-access holder in
Gate 1, or the EN reviewer in Gate 3 — they may or may not be, but this
workflow does not presume it either way.

**Recording the sign-off:** append to the item's FR status field, e.g.
`FROZEN FR / SOURCE VERIFIED — FR TECHNICAL REVIEW COMPLETE (reviewed by
<full name>, <DGR/CBTA role or credential>, <YYYY-MM-DD>)`.

### Gate 3 — EN bilingual reviewer sign-off

**What:** Covered in full by `docs/DGR_EN_REVIEWER_GUIDE.md` — meaning-
equivalence, terminology consistency (via `docs/DGR_EN_TERMINOLOGY_MASTER.md`),
and distractor plausibility preserved across the FR→EN translation.

**Who:** A named, qualified bilingual DGR reviewer. May be the same person
as Gate 2 if they are bilingual, or a different person — not presumed
either way.

**Recording the sign-off:** change the item's EN status field from
`BILINGUAL TECHNICAL REVIEW REQUIRED` to `BILINGUAL TECHNICAL REVIEW
COMPLETE (reviewed by <full name>, <bilingual DGR/CBTA role or credential>,
<YYYY-MM-DD>)`. The qualification is recorded explicitly so the durable
artifact proves that the reviewer was not merely named, but identified in
the qualified DGR/bilingual role required by this gate.

### Gate 4 — `APPROVED`

**What:** Once Gates 1–3 are all individually complete and recorded for
one item, the item's Approval field changes from `PENDING REVIEWER +
DATE` to `APPROVED — <reviewer name>, <YYYY-MM-DD>` (the reviewer name
here should be whoever takes final accountability for the item as a
whole — often, but not necessarily, the Gate 2 FR reviewer). The date must
be the real sign-off date: a valid calendar date that is not in the
future.

**Hard rule, no exceptions:** an item may not be marked `APPROVED` if any
of Gates 1–3 shows a pending, incomplete, `DRAFT`, `SOURCE GAP`,
`SOURCE CONFLICT`, `STALE CITATION`, `PARTIALLY CONFIRMED`, or equivalent
unresolved state. `FR SOURCE GAP CONFIRMED` is useful evidence that the
current Tier-A text was actually checked and did not support the premise;
it must remain visibly non-approved until the production claim is repaired
or re-attributed and then receives direct current Tier-A verification.

## Historical status note

Older snapshots in this repository recorded early pilot counts while Gate
1 work was still being established. Those dated counts are historical
only and must not be used as current readiness evidence. Current program
status is determined from the per-function source/competency matrices,
production-bank artifacts, EN review packages, and the deterministic CI
gates on the exact branch head.

In particular:

- a `SOURCE GAP` or `SOURCE CONFLICT` is never counted as a production
  approval pass;
- representative/sample verification is not item-specific verification;
- FR source verification does not imply EN bilingual review;
- no item becomes `APPROVED` unless the durable Gate 1→2→3→4 chain is
  complete on that item.

## What this workflow does NOT authorize

- It does not authorize marking any item `APPROVED` — that requires all
  four gates genuinely complete, with real names, DGR/bilingual
  qualifications where required, and real dates.
- It does not authorize inventing a reviewer name, credential, or date to
  fill in a gate.
- It does not authorize treating Gate 1 (Tier A) as optional or
  skippable — an item cannot reach `APPROVED` on Gates 2–4 alone.
- It does not authorize promoting an item whose direct current source
  state is `SOURCE GAP`, `SOURCE CONFLICT`, or otherwise unresolved.
- It does not claim `PLATFORM READY TO USE` or any other program-level
  readiness label — see `docs/PLATFORM_READINESS_REPORT.md` and
  `docs/FULL_PROGRAM_READINESS_SCOPE.md` for those labels' own criteria,
  which are separate from and broader than this per-item workflow.
