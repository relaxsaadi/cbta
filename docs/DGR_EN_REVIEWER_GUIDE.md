# DGR/CBTA Bilingual EN Review — Reviewer Guide

**Read this first if you are the qualified bilingual DGR reviewer picking
up this work for the first time.** It explains what this review is, what
it is not, where everything lives, and exactly how to record a completed
review. It was prepared by Claude Code as **preparation material only** —
no review has been performed by an AI on any item, and nothing in this
guide or the files it points to authorizes you or anyone else to skip a
step described here.

---

## 1. What this review is — and is NOT

### What it is

A **bilingual technical review** of the French→English translation
drafts prepared across `docs/DGR_EN_REVIEW_PACKAGE_7.1.md` through
`docs/DGR_EN_REVIEW_PACKAGE_7.10.md` (453 question-bank items across
Functions 7.1–7.10). For each item, the review checks:

1. **Meaning-equivalence** — does the English stem, correct answer, and
   every distractor carry exactly the same regulatory meaning as the
   French side, not a loose paraphrase?
2. **Terminology accuracy and consistency** — is the English DGR/aviation
   terminology correct, and used the same way across every item that uses
   it (see `docs/DGR_EN_TERMINOLOGY_MASTER.md`)?
3. **Distractor plausibility preserved in translation** — does each wrong
   answer remain plausible-but-wrong to an English-speaking candidate,
   rather than becoming obviously wrong for an EN-specific reason (an
   idiom that didn't survive translation, a distractor that only "sounds
   wrong" in French)?

### What it is NOT

- **It is not Tier A regulatory verification.** Per
  `.claude/rules/dgr-stage2b.md` rule 5, **FR source verification and EN
  bilingual technical review are separate gates.** Confirming that an
  English sentence is a faithful, well-worded translation of the French
  item tells you nothing about whether the underlying French fact is
  itself correct against the current IATA DGR 67th Edition 2026 (French,
  Addendum 1 integrated) — Tier A verification is a distinct, separate
  step performed against the regulation text itself, not against a
  translation.
- **It is not French technical sign-off.** A qualified DGR instructor
  confirming the French item's regulatory correctness is a third, also
  separate, gate.
- **Completing an EN review does NOT make an item `APPROVED`.** Per
  `.claude/rules/dgr-stage2b.md` rule 4, `APPROVED` requires **all
  three** of the following, each with its own **named reviewer and
  real review date**:
  1. FR Tier A regulatory verification (against the current official
     67th Edition/Addendum 1 text itself, not a summary or a course
     citation of it),
  2. FR qualified-reviewer technical sign-off,
  3. EN bilingual technical review sign-off by a named, qualified
     bilingual DGR reviewer.

  If you complete every EN review in every package, the honest resulting
  status for those items is **"EN bilingual review complete; FR Tier A
  verification and/or FR technical sign-off still required"** — not
  `APPROVED`. Do not let volume or thoroughness on the EN side imply the
  other two gates are satisfied; they are not, and nothing about this
  review substitutes for them.
- **It is not a source-accuracy audit against KOST's own course slides.**
  The FR item text in most packages is either copied verbatim from the
  production bank (`docs/DGR_PRODUCTION_BANK_7.X.md`) or, for the
  Function 7.1 pilot only, reconstructed as a "working gloss" from
  documented source-basis conclusions (see that package's own Critical
  Provenance Note) — check the relevant package's provenance note before
  assuming the French text shown is the live-administered wording.

---

## 2. Where to find things

**Read in this order:**

1. **`docs/DGR_EN_TERMINOLOGY_MASTER.md`** — read this FIRST. It
   cross-references all ten packages' terminology tables and flags every
   place two functions chose different English wording for the same
   French term, plus every term that's consistently used but still
   unverified. Resolving a term here once (Part A: cross-function
   inconsistencies; Part B: consistent-but-unverified) saves you from
   re-deciding the same question separately in each of up to 8–9
   packages, and gives you a single place to record your resolution
   before it propagates back into the individual packages.
2. **The per-function package**, `docs/DGR_EN_REVIEW_PACKAGE_7.X.md`, for
   the function you're reviewing. Each package contains:
   - A provenance note explaining where the FR text came from for that
     batch (verbatim production-bank text vs. reconstructed gloss — read
     this before trusting the FR wording shown).
   - Every item with its FR text, EN draft translation, source basis,
     any item-specific terminology decision, and current status.
   - Its own "Bilingual terminology table" (already folded into the
     master file above, but useful in-package for item cross-references).
   - A "Reviewer instructions and checklist" section with the exact
     per-item checklist and sign-off format (reproduced in section 3
     below).
3. **`docs/DGR_PRODUCTION_BANK_7.X.md`** — the underlying production bank
   for that function, if you need the full drafting rationale, batch
   history, or source citations behind a specific item beyond what the EN
   package shows.
4. **`docs/DGR_STAGE2A_FUNCTION_7.X_BLUEPRINT.md`** and
   **`docs/DGR_STAGE1_FUNCTION_7.X_DRAFT.md`** (plus that function's
   `_CROSSVALIDATION.md` file, where present) — the Stage 1/2A blueprint
   behind the item structure, if you need full context on why a
   particular sub-task, block, or item count exists.
5. **`docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`** — the shared status tracker
   across both AI agents working this program; useful for orientation on
   what stage each function is at, but not itself a source of regulatory
   truth.
6. **`docs/DGR_SOURCE_REGISTER.md`** and **`docs/DGR_STAGE_2B_STATUS.md`**
   — authoritative FR status/source-basis records for the Function 7.1
   pilot items specifically; consult these before trusting any Function
   7.1 package's reconstructed FR gloss.

---

## 3. How to record a completed review for one item

Every package's "Reviewer instructions and checklist" section defines the
same sign-off format. Do not invent a different one. Per item:

```
Item: Q-7.X-0YY
Reviewer name (qualified bilingual DGR instructor): ____________________
Reviewer DGR/CBTA role or credential: ____________________
Review date (YYYY-MM-DD): ____________________
Verified against live-administered FR item text (not just this draft): YES / NO
Regulatory accuracy — FR: PASS / FAIL / CONDITIONAL — notes: ____________
Regulatory accuracy — EN: PASS / FAIL / CONDITIONAL — notes: ____________
Meaning-equivalence FR↔EN: PASS / FAIL / CONDITIONAL — notes: ____________
Terminology consistency: PASS / FAIL / CONDITIONAL — notes: ____________
Distractor plausibility (EN): PASS / FAIL / CONDITIONAL — notes: ____________
Final status: BILINGUAL TECHNICAL REVIEW COMPLETE / REVISION REQUIRED (specify)
Approval: [Named reviewer] + [Date]
```

**Exactly what to change, and where:**

- In the relevant `docs/DGR_EN_REVIEW_PACKAGE_7.X.md` file, find the
  item's `- **EN status:**` line (currently `BILINGUAL TECHNICAL REVIEW
  REQUIRED` for every item in every package) and change it to
  `BILINGUAL TECHNICAL REVIEW COMPLETE (reviewed by <full name>, <DGR/CBTA
  role or credential>, <YYYY-MM-DD>)` **only if every one of the five
  PASS/FAIL/CONDITIONAL checks above is PASS**. If any check is FAIL or
  CONDITIONAL, the status becomes `REVISION REQUIRED` with your notes on
  what needs to change, and the item goes back to drafting — it does not
  become "complete with caveats."
- Find the item's `- **Approval:**` line (currently `PENDING REVIEWER +
  DATE`) and replace it with **your real name, qualification and the real
  date** you completed the EN review — e.g. `Approval: Jane Doe,
  DGR/CBTA Instructor (IATA cert. #XXXXX) — 2026-09-03`. This package
  field records the EN reviewer event; it does not by itself change the
  item's program-level Approval state to `APPROVED`.
- **Never fabricate a reviewer name, qualification or date, and never
  backdate or postdate.** The date must be a real calendar date on which
  the review actually occurred. If you are reviewing on behalf of someone
  else, or a review was verbally agreed but not yet formally signed,
  leave the field as `PENDING REVIEWER + DATE` until the actual sign-off
  happens. An anonymous, unqualified, impossible-dated, future-dated or
  undated sign-off is not accepted anywhere in this program
  (`.claude/rules/dgr-stage2b.md` rule 4).
- If your review changes the terminology decision for a term already
  covered by `docs/DGR_EN_TERMINOLOGY_MASTER.md` Part A or B, **also**
  update the master file's entry for that term (note your resolution and
  the date), and check whether the same term needs the same fix applied
  in every other package the master file lists as affected — that
  propagation is the entire point of resolving it once in the master
  file rather than n times.
- **This guide does not itself change any item's status.** Only an actual
  named, qualified, dated sign-off recorded in the package file (as above)
  changes an item's EN review status. Reading this guide, or reading the
  master terminology file, closes nothing by itself.

---

## 4. Suggested review order (a suggestion, not a mandate)

You are the domain expert — order the work however makes sense to you.
One reasonable sequence, if you have no other preference:

1. **Resolve the 16 cross-function terminology inconsistencies** in
   `docs/DGR_EN_TERMINOLOGY_MASTER.md` Part A first. Each one, once
   decided, is a single decision that corrects multiple items across
   multiple functions — this is the highest-leverage work available
   before touching individual items.
2. **Resolve the 6 consistent-but-unverified terms** in Part B next — same
   logic, lower volume.
3. **Spot-check Part C's "established/standard" list** for anything that
   looks wrong to you specifically (it is marked low-risk based on
   general DG-English fluency, not on having read an official English
   67th Edition text — your judgment as the qualified reviewer outranks
   that marking).
4. **Then work function-by-function**, in whatever order you prefer — the
   program's own numeric order (7.1 → 7.10) is a reasonable default since
   it matches how the packages were built and cross-referenced, but there
   is no dependency forcing that order once the shared terminology
   questions in steps 1–3 are settled.
5. Within a function, the pilot/Batch 1 items are generally the
   highest-confidence FR-side items (frozen/source-verified in Function
   7.1's case) — reviewing those first may build useful pattern-familiarity
   before the later, larger batches.

---

## 5. Reminder

**No item in this entire program may be marked `APPROVED` by this guide,
by `docs/DGR_EN_TERMINOLOGY_MASTER.md`, or by completing EN bilingual
review alone — no matter how many items are reviewed or how thoroughly.**
`APPROVED` requires named, qualified where applicable, dated sign-off on
all three separate gates (FR Tier A verification, FR technical reviewer
sign-off, EN bilingual review sign-off) as described in section 1 above.
If you are unsure whether an item's FR Tier A verification is already
complete, check `docs/DGR_SOURCE_REGISTER.md` and
`docs/DGR_STAGE_2B_STATUS.md` (Function 7.1) or the relevant function's
row in `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` (Functions 7.2–7.10) — as
of this guide's preparation, Tier A verification is either not started or
only partially complete for every function, so assume it is still
required unless one of those files explicitly says otherwise for the
specific item in front of you.
