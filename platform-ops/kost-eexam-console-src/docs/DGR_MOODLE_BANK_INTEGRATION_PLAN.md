# DGR Moodle Bank Integration — Inspection Report & Proposed Plan (2026-08-25)

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

## 6. Unrelated finding surfaced during inspection (flagging, not fixing)

`platform-ops/kost-eexam-console-src/smoke-test-prod.mjs` (tracked in git,
imported into this repo as part of the recent "import kost-eexam-console
live source as tracked baseline" commit) contains a **plaintext real
Moodle account password** for `console_admin` in a committed test script.
This is now in this repo's git history. Out of scope for this mission
(console work is excluded), but flagging because it's a live credential in
version control — worth rotating that account's password and scrubbing/
git-history-cleaning that file when you next touch the console, whether or
not this repo is ever pushed somewhere with broader access.
