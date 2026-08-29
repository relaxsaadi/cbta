# KOST E-EXAM V2 — Migration report: 244 confirmed DGR questions

Mission: "RENDRE KOST E-EXAM V2 OPÉRATIONNEL AVEC LES 244 QUESTIONS DGR
CONFIRMÉES" (owner decision, 2026-08-29). Import + staging operational
readiness only — no production cutover.

## Source

- Branch: `ai/dgr-stage2b-handoff`
- Commit: `5a3b51e215362daa378af5864844e9d0a98a7603`
- Authoritative file: `docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv`
  (244/453 rows `IMPORT_ELIGIBLE=YES`)
- Structural content: `docs/DGR_EN_REVIEW_PACKAGE_7.X.md` (primary),
  `docs/DGR_PRODUCTION_BANK_7.X.md` (fallback + explanation)

## Result

| | |
|---|---|
| Already in V2 before this run | 92 |
| New questions imported | 152 |
| Existing question fixed (see below) | 1 (Q-7.1-013) |
| **Total confirmed bank** | **244** |
| Duplicates | 0 |
| Non-eligible active | 0 |

Per function: 7.1:13, 7.2:27, 7.3:31, 7.4:25, 7.5:21, 7.6:31, 7.7:25,
7.8:27, 7.9:23, 7.10:21 — matches the reconciliation CSV exactly.

## Architecture delivered

- `scripts/extract-tier-a-candidates.py` — reads a local `.tier-a-extracts/`
  cache (gitignored, refresh command documented in the file header) and
  emits the **full current eligible set** (not a delta) as a stable JSON
  envelope. Never invents content; unparseable items are reported as
  `BLOCKED` with a reason, never silently dropped.
- `scripts/sync-tier-a-questions.ts` — idempotent sync engine, keyed on
  `kost_question_id`. States: `NEW` / `UPDATED VERSION` / `SKIPPED` /
  `BLOCKED`. Hard-rejects (`BLOCKED`) any candidate whose
  `source_status` isn't exactly `FROZEN_SOURCE_VERIFIED`, independent of
  what the extractor already filtered — defense in depth. Default mode is
  `PREVIEW` (no writes); `--commit` applies. Never rewrites a
  `question_versions` row an exam snapshot already references — an
  update always creates a new version via `addQuestionVersion`.
- Future incremental batches (e.g. 244 → 281 as more Tier A items are
  verified): refresh `.tier-a-extracts/` from the new CSV/markdown state,
  re-run the extractor (always full-set), then `sync-tier-a-questions.ts
  --commit` — already-present items come back `SKIPPED` automatically,
  only genuinely new/changed ones write.

## Human-facing status label

`lib/questions.ts::SOURCE_STATUS_LABELS` — `FROZEN_SOURCE_VERIFIED` now
displays as **"Confirmé — source DGR vérifiée"** everywhere it's shown to
an administrator/pedagogical-responsible/auditor (`question-bank/page.tsx`,
`CreateQuestionForm.tsx`). The **database value is unchanged**
(`FROZEN_SOURCE_VERIFIED`, for audit compatibility). This does not mean
"ANAC approved" and does not imply `reviewer_status = APPROVED` (still
`PENDING` on all 244, never auto-approved).

## Data-quality findings (surfaced, not silently fixed)

### 1. Corrupted `SOURCE_REFERENCE` / `DGR_Reference` column (upstream bug)

127 of the 152 new-eligible rows in **both**
`docs/DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv` (`SOURCE_REFERENCE`)
and `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv` (`DGR_Reference`)
carry the **identical** value `"§1.0, §1.1.2, §1.1.3, §3.0.1.1"`. Root
cause: the reconciliation script that generated these columns for the
2026-08-29 promoted batch appears to have lifted a "representative
sample" citation list — four *other* items' references, quoted for
illustration inside each row's own promotion rationale — as if it were
that row's own reference, instead of the row's actual individual
citation.

**Never used as-is here.** Per each row's `Final_Reconciled_Status` text,
a genuinely per-row `SOURCE: <text> RATIONALE:` fragment exists; it was
used **only** when it itself names a real DGR `§` section (44/152 items).
For the other 108, `regulatory_reference` was left `NULL` — an honest gap,
not a guess (dgr-stage2b rules 1/6/7).

**Action needed upstream (flagged for the other coordinating session):**
fix the reconciliation-CSV generator so each row's `SOURCE_REFERENCE`/
`DGR_Reference` reflects that row's own individually-verified citation,
not a copy of an illustrative sample list. Until fixed, do not trust
these two columns for display without cross-checking
`Final_Reconciled_Status`'s own `SOURCE:` fragment the way this migration
did.

### 2. Test-pollution stem, fixed

`Q-7.1-013` (already-migrated, from the original 92) had `[MODIFIÉ APRÈS
PUBLICATION — TEST VERSIONNAGE]` appended ~35 times to its stem — leftover
residue from an earlier session's versioning-immutability test, never
cleaned up. **This exact polluted text was already baked into the
DGR_REVIEWER_PRINT_PACK PDFs generated earlier this session** (Function
7.1, "QUESTION 13"). Fixed via a new clean version (old polluted versions
preserved as immutable history, never shown to candidates — confirmed 0
current/active versions carry the pollution after the fix). **The
reviewer print pack PDFs should be regenerated** before/if handed to the
paper reviewer, to avoid showing this garbled text on the printed sheet.

### 3. English "True"/"False" choices on French true/false questions

24 already-migrated true_false questions (from the original 92) have
their choices stored as `[{"key":"A","text":"True"},{"key":"B","text":"False"}]`
instead of the French `[{"key":"A","text":"Vrai"},{"key":"B","text":"Faux"}]`
used everywhere else on this all-French exam platform. List:
Q-7.2-005/010/011/015/019/024/027/043, Q-7.3-033/038, Q-7.5-036,
Q-7.6-004/031/042, Q-7.7-001/012/032/033, Q-7.8-006/023/049,
Q-7.9-034/037, Q-7.10-028.

**Deliberately left untouched** — the sync engine detected this as a
would-be `UPDATED VERSION` diff for every one of these 24 (their stem is
identical, only choice-language differs) and it was excluded from this
run's `--commit` scope per dgr-stage2b rule 8 (no reason on file to
change a frozen item beyond "display language," which needs an explicit
owner decision, not an autonomous call). Fixing is a one-line
`sync-tier-a-questions.ts --commit` re-run once these 24 IDs' candidate
JSON is regenerated with the correct French choices and explicitly
approved.

## Verification performed

- 43/43 unit tests pass; `npx tsc --noEmit` clean.
- Import PREVIEW → COMMIT → re-run PREVIEW (idempotency proof: second run
  shows `NEW: 0`, all 152+1 come back `SKIPPED`).
- Live DB checks: 244 total, exact per-function breakdown, 0 duplicates,
  0 non-eligible active, `reviewer_status` still `PENDING` on all 244.
- New E2E suite `tests/staging/31-tier-a-multi-function-acceptance.spec.ts`:
  real responsable-pédagogique creates+publishes 2 real exams via the
  real wizard (Function 7.3: 7→31 admissible, Function 7.6: 8→31
  admissible) — admissible count shown matches exactly (function
  isolation proof). A real candidate (Yasmine Kaced, Air Algérie — DEMO)
  completes both exams live end-to-end (real timer, real random question
  selection, dynamic correct-answer matching against live DB content —
  not hardcoded positions), scores 100% Réussi on both. Real PDF
  (`%PDF-` magic verified) and CSV export confirmed to contain the new
  attempts. Re-run confirms full idempotency.
- Fixed 3 pre-existing regression specs (03/09/20) that assumed a
  candidate has exactly one attempt — no longer true now that the same
  demo candidates have real attempts across 3 functions; re-verified
  19/19 non-skipped tests across 01/02/03/04/09/13/14/20 pass.
- V1/Moodle confirmed untouched throughout: `moodle-stack_moodle_1` /
  `moodle-stack_db_1` / `kost-console-stack_console_1` containers show
  uninterrupted uptime (4/9/3 days) across the whole mission, only
  `kost-eexam-v2` was rebuilt/restarted.

## Not done (explicitly out of scope this run)

- The 24 English-choice true/false questions above (owner decision
  needed).
- The remaining 209 non-eligible items (DRAFT/PARTIAL/SOURCE_GAP/etc.) —
  Tier A verification continues as a separate workstream.
- Production cutover (`exam.kostacademy.com`, Moodle removal, DNS) — not
  executed, not implied by this migration.
