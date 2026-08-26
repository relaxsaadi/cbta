# DGR Moodle Bank Integration — Inspection Report & Proposed Plan (2026-08-25)

## 0. INCIDENT — cache lock failure, found + fixed 2026-08-26 (pre-audit)

**Symptom:** site admin (`kostadmin`) got "Impossible d'enclencher un
verrouillage pour le cache." opening/editing courses.

**Root cause:** every PHP CLI script this session ran via plain `docker
exec moodle-stack_moodle_1 php ...` — i.e. **as root**, since `docker
exec` defaults to the container's root user. Apache/PHP actually runs as
`daemon` (uid 1). `cachestore_file`'s own internal file-locking directory
(`<moodledata>/cache/cachestore_file/default_application/filelocks/`,
plus assorted `core_coursehiddengroups`/`core_questiondata`/etc. cache
entries) got created **owned by root** by those scripts. When the real
site admin's browser session (running as `daemon`) later tried to
`fopen()` those same lock files to acquire the lock Moodle requires
before rebuilding `core/coursemodinfo` (`requirelockingbeforewrite`),
`fopen()` failed with permission denied → Moodle's cache layer reports
this generically as "unable to acquire a lock". Confirmed by direct
reproduction: `get_fast_modinfo()` failed 100% of the time, only for the
courses/questions this session's root-run scripts had touched (all
Functions 7.1–7.10 courses); pre-existing courses (2, 3, 19, 20) were
unaffected. A first purge attempt (`cache_helper::purge_all()`) made it
*worse* — because I ran that purge as root too, so the freshly
regenerated lock files were **also** root-owned, extending the problem
from one course to ten.

Note: this is a plain Unix file-ownership issue, **not** related to the
"cachelock_file_default → mysql_lock_factory" resolution documented
elsewhere in Moodle's `\core\lock` subsystem (that subsystem is for
cron/session locks; `cachestore_file` has its own separate, private
file-locking implementation that this incident actually involves).

**Fix applied (no Moodle core file touched):**
1. Backup: full `mysqldump` before any change
   (`local-data/moodle-backups/moodle_pre_cachefix_20260826.sql.gz`).
2. `chown -R daemon:daemon /bitnami/moodledata` on the container (143
   root-owned files/dirs fixed to match the ownership of everything else
   in that tree — metadata-only, no data touched).
3. `cache_helper::purge_all()` re-run correctly this time, as `daemon`
   (`docker exec -u daemon ...`), so regenerated caches are owned right.
4. **Going forward: every Moodle CLI script on this server must be run as
   `docker exec -u daemon moodle-stack_moodle_1 php ...`, never as plain
   root**, to prevent recreating this exact issue. Noting this prominently
   since it applies to any future session touching this Moodle instance.

**Verification (read-only, as `daemon` — matches the real admin
workflow):**

| Check | Result |
|---|---|
| `/admin/search.php` (capability + `admin_get_root()`) | PASS |
| Course list loads (12 KOST-DGR-% courses) | PASS |
| Function 7.1 course opens | PASS |
| Function 7.2 course opens | PASS |
| All 10 Function courses (`get_fast_modinfo`, fresh process each) | PASS |
| Question Bank — system-context `KOST DGR — PRODUCTION` tree (11 cats: parent + 10 Fonction 7.X) | PASS |
| Individual question opens (`Q-7.2-001` via `question_bank::load_question()`) | PASS |
| Exam/attempt review path (existing Function 7.1 pilot attempt, read-only) | PASS |
| Candidate exam flow intact (`test_candidate`, 35 pre-existing finished attempts, none touched) | PASS |
| Console sync (92 function-tagged production questions, unchanged) | PASS |

Nothing in `mdl_question`, `mdl_quiz_attempts`, `mdl_grade_grades`, course
content, or candidate results was read-write touched by this fix — only
filesystem ownership metadata and derived (safely-regenerable) cache
content.

**Visible navigation for tomorrow (unchanged by this fix, confirmed
live-readable):**

```
Site Administration → (Question bank is per-course in the Moodle UI, but
this bank lives at SYSTEM context, so the fastest reliable path is via
any course's own Question bank screen, which can browse "the entire
question bank" the admin has access to)
  → open any course (e.g. one of the Function 7.X courses, or Site home)
  → Question bank → Categories → find "KOST DGR — PRODUCTION"
      → expand → "Fonction 7.1" … "Fonction 7.10"
  → click a category → question list appears → click a question name to open it
```

Each Function's own course (`KOST DGR — Fonction 7.X`) also has its own
quiz ("DGR — Fonction 7.X — Production…") which is the fastest way to
show one function's exam specifically without navigating the full
system-context tree.

Scope: make banks 7.1→7.10 usable in Moodle as ten independent
per-function exams, per the mission brief. This file is the Step-1
documentation the brief requires before any write action, plus the
proposed Step-2 architecture. **No write action has been taken in Moodle
yet.** Everything below is read-only findings + a proposal awaiting
go-ahead.

## 0. Access used for this inspection

- SSH (key `~/.ssh/hostarts_kost_moodle`, root) to `102.206.40.221`
  (`exam-kost.hostarts.dz`), which hosts both `moodle-stack_moodle_1`
  (bitnamilegacy/moodle, Moodle 5.0.1) and `moodle-stack_db_1` (MySQL 8.4)
  Docker containers, plus the unrelated `kost-console-stack_console_1`.
- All Moodle inspection was done via a PHP CLI script using Moodle's own
  `$DB->get_records_sql()` — **SELECT only**, no `insert_record` /
  `update_record` / `delete_records` / `execute()` call anywhere. Nothing
  was changed on the server.
- Source question-bank content was read from this repo's own git history
  (branch `ai/dgr-stage2b-handoff`, tip `31ba744`) via `git show`, without
  checking out or merging that branch. That branch is **not merged** into
  `console/finalization-2026-08-25` (current branch) — its `docs/DGR_*.md`
  files (the actual 453-item question source) are absent from the current
  working tree.

## 1. Current Moodle state (as-is, documented before any change)

### 1.1 Question categories that exist today

| Cat ID | Name | Context | Notes |
|---|---|---|---|
| 4 | **"Secourisme"** | Course 3 (`KOST-DGR-SAMPLE-EXAMS`, hidden) | **Mislabeled legacy category** — holds 4 "DGR Sample Q1–Q4" multichoice questions (étiquetage, classe UN, documentation, responsabilité). Untagged. Not mapped to any Function. This is the "catégorie incorrecte comme Secourisme" the brief warned about. |
| 5 | "Practice / Training" | Course 4 (`KOST-PRACTICE-TEST`, hidden) | 4 generic UI-familiarization questions, explicitly non-regulatory. Fine as-is. |
| 15 | "ANAC Demo — Procédural (Fictif)" | Course 19 (`ANAC-DEMO-2026`) | 6 fictional procedural questions for the audit demo (navigation, flag, timer, disconnect...). Non-regulatory. |
| 16 | "DGR Échantillon Vérifié — Démo ANAC (Tier A, Fonction 7.1)" | Course 20 (`ANAC-DEMO-DGR-SAMPLE-2026`) | **Already exists**: 10 real Function 7.1 questions (`DGR-7.1-002`…`DGR-7.1-018`), explicitly labelled Tier A/FROZEN in the quiz intro text. This is the audit-demo sample from a prior session (matches the memory note "ANAC audit demo 26/08/2026… needs cleanup afterward"). **Out of this mission's scope per your instructions (don't touch the ANAC demo/PDF work) — left untouched.** |

No question category anywhere is currently organized by DGR Function
7.1–7.10 as a real production bank. The only Function-labelled content is
the 10-item ANAC demo sample above.

### 1.2 Courses, quizzes, tags, cohorts

- **Course 2 — `KOST-DGR-QBANKS`** ("Banques de questions (conteneur
  technique)", hidden, category "Catégorie 1"): **exists, empty** — zero
  question categories under it. This reads as a container prepared in
  advance for exactly this integration, never populated.
- **Course 3 — `KOST-DGR-SAMPLE-EXAMS`** (hidden): holds category 4
  ("Secourisme") and quiz `DGR Function 7.3 — Sample Exam` (id 1, 2
  questions) — despite its name, its 2 questions are the generic
  "Secourisme" sample items, not real 7.3 content. Legacy/confusing,
  flagged for later cleanup, not touched.
- **Course 4 — `KOST-PRACTICE-TEST`**: practice quiz, fine as-is.
- **Courses 19/20 — ANAC demo**: out of scope, left untouched.
- **Tags**: 5 tag *definitions* exist system-wide (`function-7.3`,
  `sample-exam`, `practice-test`, `anac-demo`, `dgr-sample-tier-a`) but
  **zero tag instances** are actually attached to any question — the
  tagging scheme was set up but never used.
- **Cohorts**: none. **Course groups**: none. No group/cohort workflow
  exists yet — Section 6 of the brief starts from a blank slate.
- **Enrolments**: 1 test user per demo/practice/sample course only — no
  real candidates in the system yet.
- **Roles**: standard Moodle roles + 3 console-specific roles
  (`kost_console_admin_role`, `kost_console_auditor_role`,
  `kost_console_service`). No DGR-specific instructor/candidate role
  distinctions yet.

### 1.3 Where the actual 7.1–7.10 question content lives

It is **not** in this repo's checked-out files, not in `public/documents/`,
and not obviously in the connected Google Drive (that Drive has the raw
PDF/video course materials per function, e.g.
`DGR-FONCTION 7.1/Règlement... CBTA 7.1.pdf`, but not a question-status
tracker).

It **is** in this same git repository, on branch `ai/dgr-stage2b-handoff`
(pushed to `origin`, not merged), as a very disciplined, already-completed
verification program:

- `docs/DGR_PRODUCTION_BANK_7.1.md` … `7.10.md` — the 453 items themselves
  (question text, options, correct-answer rationale, distractor rationale,
  DGR citation, **FR status**, **EN status**, **Approval** — see format
  below).
- `docs/DGR_TIER_A_INVENTORY.md` — the exact current count.
- `docs/DGR_SOURCE_REGISTER.md` — full citations backing every FROZEN item.
- `docs/DGR_REVIEWER_SIGNOFF_WORKFLOW.md` + `.claude/rules/dgr-stage2b.md`
  — the governance rules this program follows.

Per-item format actually used (sampled from `Q-7.1-013`):

```
## Q-7.1-013 — Définition réglementaire d'une marchandise dangereuse
**Sub-task:** 0.1.1 Comprendre la définition
**Type:** MCQ, single-answer
**Stem (FR):** ...
**Options:** (one marked **(Correct)**, 3 distractors)
**Correct answer rationale:** ...
**Distractor rationale:** ...
**Source basis:** Tier A — DGR 67th Ed. 2026, §1.0 ...
**FR status:** FROZEN FR / SOURCE VERIFIED (Tier A confirmed 2026-08-25).
**EN status:** BILINGUAL TECHNICAL REVIEW REQUIRED.
**Approval:** PENDING REVIEWER + DATE.
```

**Important nuance for your decision:** *every* item in the program,
including all FROZEN ones, currently shows `Approval: PENDING REVIEWER +
DATE` — the separate 4-gate qualified-reviewer sign-off
(`DGR_REVIEWER_SIGNOFF_WORKFLOW.md`) has not started for any item; zero
items anywhere are `APPROVED`. Your brief's own priority rule ("FROZEN FR
/ SOURCE VERIFIED → admissible pour intégration contrôlée") sets the bar
at FROZEN, distinct from that reviewer-sign-off gate — I'm importing on
that basis, flagging the distinction rather than deciding it myself.

### 1.4 Current status counts (per `DGR_TIER_A_INVENTORY.md`, dated today)

453 items total, across all 10 functions:

| Status | Count | Import? |
|---|---|---|
| FROZEN FR / SOURCE VERIFIED | **218** | ✅ Yes — this session's target |
| FR SOURCE GAP CONFIRMED | 13 | ❌ No — per brief, decide separately later (Tier B/C basis) |
| PARTIALLY CONFIRMED (partial Tier A) | ~24 | ❌ No |
| STALE CITATION / SOURCE CONFLICT | 3 | ❌ No |
| NOT ATTEMPTED (Tier A not attempted / Tier B only) | ~195 | ❌ No |

Per-function FROZEN counts are not tabulated as a single current total
anywhere (the per-function table in the inventory is an explicitly-marked
*stale baseline*, since updated by 5 topic-based passes this session) — at
import time I'll re-derive the exact per-function FROZEN list directly
from each `DGR_PRODUCTION_BANK_7.X.md`'s own status lines, cross-checked
against `DGR_SOURCE_REGISTER.md`, rather than trust a hand count. Rough
distribution for planning purposes (baseline + topic promotions): every
function has at least ~7 FROZEN items today; 7.2 and 7.8 are the largest
(~25-30).

## 2. Proposed target architecture (awaiting your confirmation)

### 2.1 Question bank tree

Create, at **Moodle system context** (not tied to any single course):

```
KOST DGR — PRODUCTION          (parent question category)
├── Fonction 7.1
├── Fonction 7.2
├── ...
└── Fonction 7.10
```

**Why system context, not the existing `KOST-DGR-QBANKS` container
course (id 2):** a quiz's random-question picker can only reach question
categories in its own course's context or an *ancestor* context (course
category → system). A sibling course's categories (like course 2's would
be) are not reachable without relying on Moodle 4+'s newer explicit
"share this question bank with other courses" feature, which I'd rather
not depend on for something this important without testing it first.
System context is the long-standing, unambiguous way to make one bank
selectable from any course's quiz, with no special sharing step. Course 2
stays empty/unused unless you'd prefer it as the home instead — flagging
this as a real decision, not assuming.

Each `Fonction 7.X` category will only ever contain items already tagged
`FROZEN FR / SOURCE VERIFIED` for that function — nothing else — so a
7.1 exam configured to draw from "Fonction 7.1" structurally cannot surface
a 7.3 item.

### 2.2 Metadata carried per imported question

Everything the brief requires, stored via Moodle's native `idnumber` field
(doc ID, e.g. `Q-7.1-013` — this is the built-in Moodle field precisely
meant for an external stable ID) plus question tags (never shown to the
candidate) for the rest:

- **Moodle idnumber** ← doc ID (`Q-7.1-013`) — gives the doc-ID↔Moodle-ID
  traceability table for free (queryable directly).
- **Tags** (not candidate-visible): `function-7.1`, `subtask-0.1.1`,
  `status-frozen-fr-verified`, `lang-fr`, `verified-2026-08-25`,
  `reviewer-pending`.
- **Question category**: `Fonction 7.X`.
- A companion `docs/DGR_MOODLE_IMPORT_TRACEABILITY.csv` (doc ID → Moodle
  question ID → category ID → import date) as the durable audit trail the
  brief asks for, independent of Moodle itself.

### 2.3 Per-function exam template

One quiz template per function (`DGR — Fonction 7.1 — Examen`, …,
`7.10`), each: random draw from its own `Fonction 7.X` category only,
timer, 1 attempt (configurable), grade-to-pass **left blank for you to
set per KOST's own policy — I will not invent a universal IATA/ANAC pass
threshold**, open/close dates left as a per-session (per-group) setting
rather than baked into the template.

### 2.4 Groups/cohorts

Moodle **cohorts** (system-wide, e.g. `Groupe Démo — Fonction 7.1`) are the
right primitive — reusable across courses, matching the brief's "create
cohort → assign exam → open session" workflow. One demo cohort with no
real candidates, as instructed.

## 3. Legacy items found — flagged, not touched

- Category 4 "Secourisme" (4 old sample questions) and course 3
  `KOST-DGR-SAMPLE-EXAMS` / quiz "DGR Function 7.3 — Sample Exam" — misnamed
  legacy demo content, not real 7.3 questions. Recommend archiving
  (rename + hide) once the real Fonction 7.X banks exist, in a later pass.
- 5 orphaned tag definitions with zero instances (`function-7.3`,
  `sample-exam`, `practice-test`, `anac-demo`, `dgr-sample-tier-a`) —
  harmless, can stay or be cleaned up later.

## 4. Backup / rollback plan (required before any write, per the brief)

Not yet executed — proposed sequence for your go-ahead:

1. `docker exec moodle-stack_db_1 mysqldump --single-transaction moodle
   > moodle_pre_dgr_import_<date>.sql.gz` (full DB dump, taken from the
   `db` container directly — read-only against the running instance).
2. Copy the dump off-server (e.g. to this machine) before any write.
3. Record the dump's exact timestamp + a `SELECT MAX(id) FROM
   mdl_question` / `mdl_question_categories` "high-water mark" so a
   partial rollback (delete only what this session added) is possible
   without restoring the whole DB if something goes wrong mid-import.
4. Only after 1–3: create the category tree, then import.

## 4bis. Backup executed (2026-08-25)

- Full `mysqldump --single-transaction` of the `moodle` DB taken via
  `root@localhost` inside `moodle-stack_db_1` (the `moodleuser` app account
  turns out to reject direct client connections — see note below — so the
  dump used the container's root DB account instead; read/dump only, no
  writes).
- Copied off-server to
  `platform-ops/kost-eexam-console-src/local-data/moodle-backups/moodle_pre_dgr_import_20260825.sql.gz`
  (gzip-verified, 899KB). **Gitignored** — added
  `/local-data/moodle-backups/` to `.gitignore` before this file could ever
  be committed (it contains password hashes).
- High-water marks recorded (everything at/after these IDs is attributable
  to this session and can be surgically deleted without a full restore):

  | Table | Max ID before this session |
  |---|---|
  | `question_categories` | 16 |
  | `question` / `question_bank_entries` / `question_versions` | 89 |
  | `tag` | 6 |
  | `tag_instance` | 7 |
  | `course` | 20 |
  | `quiz` | 11 |
  | `quiz_slots` | 86 |
  | `cohort` | 0 (none existed) |
  | `context` | 83 |

  System context id = **1** (target for the new category tree, per your
  confirmed choice).

- **Side note found while backing up:** the `moodleuser` DB account (used
  by the Next.js console's read-only/read-write layers) gets "Access
  denied" when connecting directly via the `mysql`/`mariadb` CLI client
  from either the app or db container (tried `localhost`, `127.0.0.1`, and
  `db`/its current container IP) — yet the live console app clearly works.
  Either the grant's host pattern doesn't match a fresh client connection
  from those addresses, or Moodle/the console hold a long-lived connection
  from before a container IP change. Not investigated further (console
  infra is out of this mission's scope) but worth knowing if a future
  session needs direct DB access under that account.

## 5. Explicitly out of scope this session (per your instructions)

Console refactor, ANAC PDF work, writing new questions, redoing Tier A
verification itself. The ANAC demo (course 19/20, category 15/16, quiz
10/11) is left exactly as-is.

## 5bis. Function 7.1 controlled pilot — executed 2026-08-25 (superseding the "wait for go-ahead on all 218" pause above)

Per explicit follow-up instruction: **Function 7.1 only**, not the other 9
functions. Full detail/traceability in
`docs/DGR_MOODLE_IMPORT_TRACEABILITY_7.1.csv`. Summary:

- Function 7.1 has 19 items total: 18 `FROZEN FR / SOURCE VERIFIED`
  (Q-7.1-002–019) + 1 `FR SOURCE GAP CONFIRMED` (Q-7.1-001, excluded).
- Of the 18 FROZEN items, **13 had recoverable full question text** (10
  already existed in Moodle as the ANAC-demo sample, category 16; 3 more —
  Q-7.1-014/017/019 — had full verbatim text in
  `docs/DGR_PRODUCTION_BANK_7.1.md`, not yet in Moodle).
- **5 FROZEN items (Q-7.1-005/007/008/010/012) were NOT imported.** Their
  full stem/options text does not exist in any source this session could
  reach — confirmed via `docs/AI_HANDOFF.md`, `docs/PLATFORM_READINESS_
  REPORT.md`, and `docs/DGR_EN_REVIEW_PACKAGE_7.1.md`'s own provenance
  note: by design (licensing rule 6), this repo stores only source
  citations/conclusions for the original 12-item pilot, not the verbatim
  text; "the live, administered copy of the pilot question text lives
  outside this environment." A full read-only scan of every question
  category in this Moodle instance confirms it is not there either.
  Reconstructing wording from the citation notes would mean authoring new
  question text — out of this mission's scope ("ne pas créer de nouvelles
  questions") and a real regulatory-accuracy risk, so these 5 were left
  out rather than guessed. They need the human owner to supply the live
  copy (or explicitly authorize reconstruction from the source-register
  notes for the 2 that have rich-enough detail: Q-7.1-007, Q-7.1-008).
- The 10 existing questions were **moved** (not just referenced) from
  category 16 into the new category 18 ("Fonction 7.1"), using Moodle's
  own `question_move_questions_to_category()` API (handles file/tag/
  context migration correctly) — verified safe beforehand: quiz 11
  references questions by `questionbankentryid`, not by category, so this
  move does not affect quiz 11 at all (re-verified after the move: quiz
  11's 10 slots are unchanged). This was chosen over leaving them in place
  so the new quiz can honestly be described as using ONLY the Fonction 7.1
  production category, per instruction.
- All 13 questions retrofitted/created with `idnumber` = doc ID and tags
  `function-7.1`, `status-frozen-fr-verified`, `lang-fr`,
  `reviewer-pending`.
- New quiz: **"DGR — Fonction 7.1 — Échantillon réglementaire vérifié"**
  (id 12), course `KOST-DGR-7.1-PILOT` (id 21, hidden), 13 fixed slots
  (no random/category draw — `question_set_references` count = 0),
  settings mirrored from quiz 11 (unlimited attempts, no in-attempt
  review, 20 min).
- End-to-end test: `test_candidate` (existing test account, already used
  for Practice Test) enrolled, one real attempt driven through Moodle's
  own quiz-attempt API (`quiz_prepare_and_start_new_attempt` +
  `process_attempt`, not raw SQL) — attempt id 60, state `finished`,
  13/13, grade 100% in `mdl_grade_grades`, confirmed queryable via the
  same join shape the console's `results-data.ts` already uses.
  (A first attempt, id 59, hit a real qtype_multichoice API-usage bug in
  my own test script — `get_correct_response()`'s index format isn't what
  `prepare_simulated_post_data()` expects; fixed to use the answer's text
  instead — and was cleanly deleted via `quiz_delete_attempt()`.)
- Isolation proof: all 13 slots resolve to category 18 only; Functions
  7.2–7.10 categories (19–27) remain at 0 questions each — structurally
  impossible for any other function's item to appear.
- Rollback: high-water marks recorded in §4bis; additionally, everything
  from this pilot is scoped to question ids 90–92 (new), qbe ids 90–92,
  course id 21, quiz id 12, plus the category-16→18 move (reversible via
  the same API in reverse) and the idnumber/tag additions on question ids
  80–89 (reversible by clearing those fields). Full DB dump from §4bis
  remains the whole-instance fallback.

## 5ter. Functions 7.2–7.10 — full overnight run, executed 2026-08-25

Per the follow-up "continue autonomously" instruction. One important
correction discovered while building this: my earlier report's headline
count of "218 FROZEN items across all functions" (from
`DGR_TIER_A_INVENTORY.md`'s aggregate claim) does **not match** what is
actually recorded per-item in each function's own
`docs/DGR_PRODUCTION_BANK_7.X.md` file. A rigorous parser (built and
self-validated against Function 7.1's known-good data before use) reading
each item's own `**FR status:**` field directly finds:

| Function | Items in file | FROZEN (per-item field) |
|---|---|---|
| 7.1 | 19 (12 in a separate pilot-status file + 7 here) | 18 |
| 7.2 | 49 | 21 |
| 7.3 | 45 | 7 |
| 7.4 | 53 | 7 |
| 7.5 | 44 | 7 |
| 7.6 | 56 | 8 |
| 7.7 | 53 | 7 |
| 7.8 | 51 | 10 |
| 7.9 | 39 | 5 |
| 7.10 | 44 | 7 |
| **Total** | **453** | **97** |

The gap between 218 and 97 is likely because the topic-based
"cross-application" verification passes described in
`DGR_TIER_A_INVENTORY.md` updated that separate tracking document without
always writing the promotion back into the item's own file. That's a
process question for the parallel Tier-A project, not something resolved
here — I'm importing strictly on each item's own recorded field, per this
round's explicit instruction, and flagging the discrepancy rather than
picking a number.

All 97 FROZEN items across Functions 7.1–7.10 had full, recoverable stem +
options text **except the 5 already reported for Function 7.1**
(Q-7.1-005/007/008/010/012 — still not imported, unchanged from the pilot
report). For Functions 7.2–7.10, every FROZEN item's text was complete and
well-formed (verified programmatically: exactly one correct option per
MCQ, a Vrai/Faux value for every True/False item) — zero exclusions for
missing/ambiguous content this round.

**Parser bugs found and fixed before trusting any output** (both would
have silently under-imported or truncated content if missed):
1. Options wrapping onto a second markdown line were being dropped
   (continuation lines don't start with `-`) — fixed to accumulate wrapped
   lines instead of discarding them.
2. Function 7.6's later batches nest items one heading level deeper (`###`
   instead of `##`, because they sit under a `## Batch 2` section) — the
   original regex only matched `##`, silently missing every item in
   Batches 2–3. Fixed to match `##`–`####`. After the fix, every function's
   total parsed item count matches its expected total from
   `DGR_TIER_A_INVENTORY.md` exactly (Function 7.1 excepted, for the
   known, already-documented reason above).

**Per-function result (all 9 ran clean, zero blockers):**

| Function | Eligible (FROZEN, text-complete) | Imported | Category | Course/Quiz | Attempt result | Isolation |
|---|---|---|---|---|---|---|
| 7.2 | 21 | 21 | 19 (Fonction 7.2) | course 22 / quiz 13 | 21/21, 100% | PASS |
| 7.3 | 7 | 7 | 20 (Fonction 7.3) | course 23 / quiz 14 | 7/7, 100% | PASS |
| 7.4 | 7 | 7 | 21 (Fonction 7.4) | course 24 / quiz 15 | 7/7, 100% | PASS |
| 7.5 | 7 | 7 | 22 (Fonction 7.5) | course 25 / quiz 16 | 7/7, 100% | PASS |
| 7.6 | 8 | 8 | 23 (Fonction 7.6) | course 26 / quiz 17 | 8/8, 100% | PASS |
| 7.7 | 7 | 7 | 24 (Fonction 7.7) | course 27 / quiz 18 | 7/7, 100% | PASS |
| 7.8 | 10 | 10 | 25 (Fonction 7.8) | course 28 / quiz 19 | 10/10, 100% | PASS |
| 7.9 | 5 | 5 | 26 (Fonction 7.9) | course 29 / quiz 20 | 5/5, 100% | PASS |
| 7.10 | 7 | 7 | 27 (Fonction 7.10) | course 30 / quiz 21 | 7/7, 100% | PASS |

Each function: questions created directly in its own system-context
`Fonction 7.X` category (idnumber = doc ID, tags `function-7.X` /
`status-frozen-fr-verified` / `lang-fr` / `reviewer-pending`), one new
hidden course + quiz built with fixed slots only (zero
`question_set_references`, so no random draw could ever cross a function
boundary), `test_candidate` enrolled and run through one real attempt via
Moodle's own quiz-attempt API (not raw SQL), isolation re-verified by
direct query after each import. Full per-item traceability in
`docs/DGR_MOODLE_IMPORT_TRACEABILITY_7.X.csv` for each function.

**Console synchronization — verified read-only, zero code changes
needed or deployed.** Reproduced the console's own queries
(`question-bank-data.ts`, `exams-data.ts`, `data-scope.ts`'s
`classifyScope()`) directly against Moodle: all 92 newly-tagged questions
(13 for 7.1 + 79 for 7.2–7.10) and all 10 exams (the 7.1 pilot + 9 new)
resolve to the correct `Function 7.X` label and `production` scope,
automatically, through the console's existing, unmodified code — it
already derives function from the `function-7.X` tag and scope from
course/category naming, exactly matching what this import produces. (One
false alarm during this check: my own first diagnostic script mis-used
Moodle's `get_records_sql()`, which silently collapses multiple rows
sharing a key — not a real data problem, just a bug in my own throwaway
verification script, caught and fixed before trusting the result.) The
only remaining "Non classée" production-scope questions are the 4
pre-existing legacy "Secourisme" items, already flagged in this doc's
§1.1/§3 — unrelated to tonight's work.

**Not touched:** ANAC procedural demo (course 19/quiz 10), Function 7.1's
ANAC Tier-A sample quiz (11 — its 10 questions were already moved into the
production category during the 7.1 pilot, not tonight), the legacy
Secourisme category, production/demo/practice separation intact throughout.

**Backup:** fresh full `mysqldump` taken after this run
(`local-data/moodle-backups/moodle_post_7.2-7.10_import_20260825.sql.gz`,
gitignored), in addition to the pre-import one from the 7.1 pilot.
Everything created tonight is additionally scoped to question ids 93–171,
qbe ids 93–171, course ids 22–30, quiz ids 13–21 — a surgical rollback
(delete only those ranges) remains possible without a full restore.

## 5quater. Documentation reconciliation — 2026-08-25 (no Moodle change)

Follow-up request: reconcile the parallel Tier-A project's own tracking
docs (on branch `ai/dgr-stage2b-handoff`, not merged here) against the
strict per-item counts established above, since `DGR_TIER_A_INVENTORY.md`,
`DGR_FUNCTIONS_PROGRAM_STATUS.md`, and `DGR_SOURCE_REGISTER.md` all state
an aggregate **"218 FROZEN"** that doesn't match what's actually stamped
per-item (97).

Read-only, no Moodle write. Found the exact root cause with a checkable
example: `Q-7.2-036` is listed in `DGR_TIER_A_INVENTORY.md` as a
topic-analysis "PARTIALLY CONFIRMED" finding, but its own file
(`DGR_PRODUCTION_BANK_7.2.md`) still stamps `**FR status:** DRAFT — Tier B
only. SOURCE REQUIRED for Tier A.` — the analysis conclusion was never
written back to the item. Confirmed exact full breakdown from the same
parser used for import (453 total): **97 FROZEN, 5 GAP, 2 STALE, 0
PARTIAL at the stamped-field level, 349 DRAFT** (undifferentiated
Tier-B-only / not-attempted / inconclusive-search at the file level).

Edited (via an isolated git worktree, so as not to disturb that branch's
own in-progress uncommitted work) and pushed to `ai/dgr-stage2b-handoff`
as commit `759da21`:
- `DGR_TIER_A_INVENTORY.md` — added a full reconciliation section at the
  top (the table above, the Q-7.2-036 example, and the same audit-facing
  summary statement below), leaving the rest of the file as historical
  record.
- `DGR_FUNCTIONS_PROGRAM_STATUS.md` / `DGR_SOURCE_REGISTER.md` — short
  pointer notes at the top, referencing the fuller note above.

No item's status was changed anywhere. Nothing was re-verified against
the Bookshelf for this pass (not needed — this is pure arithmetic
reconciliation of what's already on file).

**Audit-facing operational statement (final):** 453 questions exist in
the working program. 97 currently carry individually-stamped FROZEN FR /
SOURCE VERIFIED status. 92 of those are integrated in Moodle across
Functions 7.1–7.10. 5 Function 7.1 items remain excluded because their
exact full question wording is not safely recoverable. No DRAFT/PARTIAL/
STALE item was imported.

Final console re-verification (read-only, same method as §5ter) reran
clean: identical numbers, zero drift, zero code changes needed.

## 6. Unrelated finding surfaced during inspection (flagging, not fixing)

`platform-ops/kost-eexam-console-src/smoke-test-prod.mjs` (tracked in git,
imported into this repo as part of the "import kost-eexam-console live
source as tracked baseline" commit) contained a **plaintext real Moodle
account password** for `console_admin` in a committed test script.
**Update: already fixed** — a concurrent session committed
`41bd6a2 security(console): rotate leaked Moodle credentials, remove
plaintext secrets from source` on this same branch while this pilot was
in progress (password rotated, 12 affected files cleaned/removed). No
action needed from this session; noting it only so the fix isn't
mistaken for still-outstanding.
