# KOST DGR/CBTA exact-head readiness audit — 2026-11-25 19:02 Africa/Algiers

## Scope and evidence boundary

Read-only audit of `relaxsaadi/cbta`, PR #3, `ai/dgr-stage2b-handoff`, the ten function-specific DGR packages, Stage 2B.1 native E-EXAM code, current related PRs/issues, workflow runs and repository branch metadata.

Audited code-bearing head: `7378a23abde4f7d1e827e7c4193e49e3e841d5cb`. This note is documentation-only; it does not alter questions, answers, source evidence, reviewer records, import flags, Moodle records or application code.

## 1. GitHub snapshot

- Repository visibility: PUBLIC.
- PR #3: OPEN / DRAFT / UNMERGED.
- Head: `ai/dgr-stage2b-handoff` at `7378a23abde4f7d1e827e7c4193e49e3e841d5cb`.
- Base: `main` at `e115196448753d2871b9885a0ea5cbdaf071790e`.
- PR comparison: 778 commits ahead, 0 behind; 250 changed files.
- Branch-list metadata reports the DGR handoff branch `protected=false`; the repository rulesets collection is empty. The branch-protection administration endpoint returns 403 to this integration. Issue #118's latest owner-side verification also records `main` as unprotected. No repository settings were changed.

## 2. Exact-head DGR workflows

All five runs below completed against the exact audited SHA `7378a23abde4f7d1e827e7c4193e49e3e841d5cb`.

| Workflow | Run | Result |
|---|---:|---|
| DGR import CSV structure | [45657376769](https://github.com/relaxsaadi/cbta/actions/runs/45657376769) | PASS |
| DGR controlled reviewer admission | [45657375782](https://github.com/relaxsaadi/cbta/actions/runs/45657375782) | PASS |
| DGR governance regression integrity | [45657376760](https://github.com/relaxsaadi/cbta/actions/runs/45657376760) | PASS |
| DGR direct Tier-A provenance | [45657376808](https://github.com/relaxsaadi/cbta/actions/runs/45657376808) | FAIL |
| DGR regulatory readiness | [45657376909](https://github.com/relaxsaadi/cbta/actions/runs/45657376909) | FAIL |

The two failing runs are data/evidence failures, not runner failures. Regression fixtures pass; the live evidence gate rejects sampled, representative, cross-applied or otherwise non-item-specific provenance and missing affirmative current-edition item evidence.

### Ten-function inventory and direct Tier-A holds

| Function | Official task rows | Questions | Distinct Tier-A-affected questions | FROZEN provenance exceptions | FR/EN status mismatches |
|---|---:|---:|---:|---:|---:|
| 7.1 | 44 | 19 | 18 | 0 | 0 |
| 7.2 | 23 | 49 | 29 | 4 | 11 |
| 7.3 | 33 | 45 | 30 | 18 | 20 |
| 7.4 | 37 | 53 | 25 | 10 | 13 |
| 7.5 | 25 | 44 | 20 | 12 | 16 |
| 7.6 | 28 | 56 | 31 | 13 | 18 |
| 7.7 | 27 | 53 | 25 | 14 | 19 |
| 7.8 | 23 | 51 | 27 | 12 | 15 |
| 7.9 | 24 | 39 | 22 | 14 | 16 |
| 7.10 | 23 | 44 | 20 | 10 | 12 |
| **Total** | **287** | **453** | **247** | **107** | **140** |

The 247 Tier-A-affected IDs were independently counted from the exact-head direct-provenance job log. The 107 FROZEN provenance exceptions and 140 FR/EN status-mirror mismatches are separate diagnostic populations and must not be added to the 247.

The current import-candidate artifact contains 453 candidates, all `IMPORT_ELIGIBLE=NO`, with no blank blocker fields. The 236 legacy `Next_Action` strings that say “Import-eligible” are historical hints only; they do not override the current NO flag or blocker. The canonical qualified-reviewer registry is empty. Zero questions are established APPROVED.

### Matrix task-row states

The following are counts of each matrix's own FR source-verification state by official task row, not question counts and not approval counts. All ten matrices explicitly preserve gaps/conflicts rather than inferring regulatory absence.

| Function | DRAFT / NOT YET VERIFIED | PARTIALLY CONFIRMED | SOURCE GAP (incl. unresolved) | SOURCE CONFLICT |
|---|---:|---:|---:|---:|
| 7.1 | 36 | 5 | 2 | 1 |
| 7.2 | 18 | 0 | 4 | 1 |
| 7.3 | 22 | 8 | 2 | 1 |
| 7.4 | 22 | 9 | 4 | 2 |
| 7.5 | 8 | 10 | 5 | 2 |
| 7.6 | 10 | 13 | 4 | 1 |
| 7.7 | 13 | 10 | 4 | 0 |
| 7.8 | 8 | 12 | 3 | 0 |
| 7.9 | 8 | 11 | 3 | 2 |
| 7.10 | 9 | 10 | 2 | 2 |

Each function has its own official task set, source/competency matrix and Stage 2A blueprint. The independent task counts above differ by function; Function 7.1's 44-task structure has not been copied to the others. Function 7.8's official task table has no Block 7; Function 7.9's separate task identities remain separate; Function 7.10 retains its own power-bank threshold conflict.

All ten FR banks and all ten separate EN review packages are present. The EN packages remain translation/reviewer drafts: bilingual technical review is required and approval is pending reviewer plus date. No package is a substitute for independent qualified human review. The 140 exact-head mirror findings remain unresolved. No new licensed IATA Bookshelf item verification or human FR/EN sign-off was performed in this run.

## 3. Stage 2B.1 — native E-EXAM audit

Native branch remains `feature/kost-eexam-v2-native` at `e8489ee040ef7da23fcaa916c0d3ff47dfd16973`. Direct source read reconfirmed:

1. `lib/questions.ts::isAdmissibleWhereClause()` still uses `reviewer_status != 'REJECTED'`; PENDING can pass the legacy production-admission predicate. Production must require explicit APPROVED backed by a named active qualified reviewer, qualification reference, actual review date/version and separate EN review.
2. `app/(app)/exam-preparation/actions.ts::createAssessmentAction()` reads scope from client FormData and passes it into draft creation without comparing it with the selected group's persisted scope.
3. `app/api/reports/individual/[attemptId]/route.tsx` checks candidate ownership, `show_result` and deferred timing, but the native branch does not require explicit answer-key release, terminal attempt status and completed grading before detailed PDF disclosure.

### Tested but unintegrated E-EXAM work

The current passing work is a stacked line, not independent patches:

- PR #381 introduces atomic submission/grading/result/audit persistence.
- PR #399 adds server-authoritative expiry and transition-winner handling. Exact-head E-EXAM validation [42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728) passes.
- PR #419 adds terminal-attempt, completed-grading and explicit answer-key checks for detailed candidate PDFs. Exact-head E-EXAM validation [45573321513](https://github.com/relaxsaadi/cbta/actions/runs/45573321513) passes (751 unit tests, 93 Playwright E2E tests, builds and local backup/restore drill).

PR #419 remains OPEN / DRAFT / UNMERGED and is 196 commits ahead / 2 behind the native branch. Reconcile the two native-only commits; do not merge/rebase the stack blindly.

Additional positive isolated validations:
- PR #415 exact Resend webhook UTF-8/HMAC byte handling: E-EXAM validation [45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631) passes. PR remains draft and is based on a separate webhook branch.
- PR #398 binds candidate autosave to frozen question type and subquestion IDs: E-EXAM validation [42295521395](https://github.com/relaxsaadi/cbta/actions/runs/42295521395) passes. PR remains draft and is based on a separate scenario-corruption branch.
- PR #401 public DGR claims compile gate [44987097818](https://github.com/relaxsaadi/cbta/actions/runs/44987097818) passes; this is not regulatory validation or ANAC/IATA approval. PR #414 is another overlapping public-claims branch with no workflow run returned. The two branches are divergent (51 ahead / 60 behind in the comparison); do not merge either blindly.
- PR #413's import-hold CSV validator is already present in the current PR #3 tree: the current and PR #413 script blob SHAs match, and the current CSV has explicit NO blockers. PR #412's Function 7.10 blueprint correction is also byte-identical in the current tree. Their open draft branches need not be merged merely to obtain those already-present changes.
- Older EN-guide PRs #408–#410 and #411 are still draft/divergent. Current package files have since changed; compare/port only after exact content review. Their existence does not close the current 140 mirror findings.

### Other open technical blockers

- Candidate/data integrity: #37, #40, #41, #65, #68.
- Tenant isolation and account recovery: #81, #82, #83, #84.
- Notification/outbox durability and provider semantics: #99, #225, #321, #323, #326, #328.
- Deployment/cutover/recovery: #73, #228, #13, #80.

Local SQLite snapshot/retention integrity controls exist and the PR #419 local restore drill passes. Independent encrypted off-site durability and restore proof remain open. Issue #73 records that the current deployment preflight can mutate the shared live datastore; issue #228 records that DNS-only rollback after V2 writes can lose data. These are not resolved by a local restore drill.

## 4. Security and confidentiality

- The repository remains PUBLIC and the public DGR handoff branch contains the ten answer-bearing production-bank files, ten EN packages and reconciliation artifacts. Issue #340 remains OPEN. Public answer-key exposure is an exam-integrity blocker even if an item later passes regulatory review.
- Issue #340's prior scan separately recorded 42 quoted Bookshelf/DGR reference fields across Functions 7.2–7.10, 35 exact substring matches in public bank Markdown and one additional 278-character reference field requiring licensing review. No source text is reproduced here. This is a probable additional licensed-source exposure, not a licensing conclusion.
- Current `middleware.ts` on `main` and the DGR handoff still accepts `?secret=CRON_SECRET`. Code search still finds `NEXT_PUBLIC_CRON_SECRET` in four browser dashboard pages. PR #298's static cron/CSRF workflow [45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152) passes, but PR #298 remains draft/unmerged and no live deployment acceptance is established.
- Issue #418: test-harness documentation was sanitized on the native feature branch; owner-side password rotation/reset if applicable, session/token invalidation, Moodle role/allowlist and access-log review, and historical-copy assessment remain pending. Sanitization does not retract Git history, forks, caches or downloaded copies.
- The DGR handoff branch reports `protected=false`; rulesets collection is empty. The branch-protection administration endpoint is inaccessible to this integration. Owner/admin configuration and a test-PR enforcement proof remain necessary.

## 5. Claude Code and related branch/PR monitoring

Repository-scoped open-PR searches for author `claude` and `anthropic` returned no matching PRs. The inspected Claude-coauthored work in PR #416 is SEO metadata wording, not DGR question-bank or E-EXAM release implementation. No new Claude-authored DGR/E-EXAM implementation PR was identified.

Several older AI/audit DGR and E-EXAM branches remain in the repository; branch names are not evidence of integration or readiness. PRs #408–#415 and #398–#401 were reviewed as above. Keep draft branches separate until their exact diffs are reconciled against the current candidate.

## 6. Release disposition

**PLATFORM NOT READY — not yet technically/pre-production ready.**

Critical technical gates remain open: strict production reviewer admission, server-authoritative assessment scope, integrated candidate-report protection, tenant/privacy controls, secure cron authentication, confidential bank containment, durable outbox/retry behavior, deterministic deployment/cutover and independent off-site restore. The 67th Edition 2026 evidence and qualified human FR/EN review gates also remain open across the ten functions.

Owner actions: protect release branches and require the merge-safe governance-integrity check; contain/retire exposed answer-bearing items and assess historical/licensed-source copies; complete credential/session/Moodle-log review; authorize item-specific IATA 67th Edition verification; appoint qualified FR and independent EN reviewers; reconcile the E-EXAM stack into one release candidate; complete live Moodle staging, deployment and off-site restore acceptance.

No question was approved or imported by this audit; the current candidate CSV remains 453/453 NO, and historical staging/import traces require a separate live-data inventory. No PR was merged. No production deployment or live Moodle acceptance was performed or validated by this audit. No DRM bypass. No ANAC/IATA approval claimed.


## Documentation-only follow-up — 2026-11-25 19:06 Africa/Algiers

The audit's code-bearing baseline remains `7378a23abde4f7d1e827e7c4193e49e3e841d5cb`. Two documentation-only commits followed it: `0ca44a87142acc31a075d7fd9bf63cdcff7470d1` (new audit file) and `f29dd6522b2dc3b144c98ccd99670768f6e9b4b2` (clarified historical-import/deployment wording). No application code, bank content, answer keys, reviewer records, import flags or Moodle data changed.

Current PR #3 head is `f29dd6522b2dc3b144c98ccd99670768f6e9b4b2`, 780 commits ahead / 0 behind `main`, 251 changed files, OPEN / DRAFT / UNMERGED. All five DGR workflows were rerun against that exact current head:

| Workflow | Run | Result |
|---|---:|---|
| DGR import CSV structure | [45672421482](https://github.com/relaxsaadi/cbta/actions/runs/45672421482) | PASS |
| DGR controlled reviewer admission | [45672421128](https://github.com/relaxsaadi/cbta/actions/runs/45672421128) | PASS |
| DGR governance regression integrity | [45672421125](https://github.com/relaxsaadi/cbta/actions/runs/45672421125) | PASS |
| DGR direct Tier-A provenance | [45672421029](https://github.com/relaxsaadi/cbta/actions/runs/45672421029) | FAIL |
| DGR regulatory readiness | [45672421063](https://github.com/relaxsaadi/cbta/actions/runs/45672421063) | FAIL |

The exact-current-head logs again report 247 distinct Tier-A-affected question IDs, 107 FROZEN provenance exceptions, 140 FR/EN status-mirror discrepancies, 287/287 matrix task rows, 453/453 FR and EN IDs, an empty qualified-reviewer registry, zero established APPROVED questions and 453/453 import candidates held NO with explicit blockers. The failure is substantive evidence/readiness, not CI infrastructure.
