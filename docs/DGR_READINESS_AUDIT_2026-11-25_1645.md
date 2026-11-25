# KOST DGR/CBTA — current readiness audit

**Audit timestamp:** 2026-11-25 16:45 Africa/Algiers  
**Repository:** `relaxsaadi/cbta` (PUBLIC)  
**DGR handoff:** `ai/dgr-stage2b-handoff`  
**Audited code-bearing head before this note:** `56d9deba0f53a0733e349c6dfdc0ee1985e6097e`  
**PR #3:** OPEN / DRAFT / UNMERGED; 776 commits ahead / 0 behind `main`; 249 changed files.

This is a GitHub-side readiness record, not regulatory approval. It contains no licensed IATA DGR text, answer keys, secrets, personal credential scans or production data.

## 1. Exact-head DGR workflows

All five workflows completed against exact checkout `56d9deba0f53a0733e349c6dfdc0ee1985e6097e`. The job logs explicitly show that SHA.

| Workflow | Run | Result |
|---|---:|---|
| CSV import structure | [45625649563](https://github.com/relaxsaadi/cbta/actions/runs/45625649563) | PASS |
| Controlled reviewer registry | [45625649552](https://github.com/relaxsaadi/cbta/actions/runs/45625649552) | PASS |
| Governance regression integrity | [45625649668](https://github.com/relaxsaadi/cbta/actions/runs/45625649668) | PASS |
| Direct item Tier-A provenance | [45625649792](https://github.com/relaxsaadi/cbta/actions/runs/45625649792) | FAIL |
| Full DGR readiness | [45625650112](https://github.com/relaxsaadi/cbta/actions/runs/45625650112) | FAIL |

The failing jobs are substantive fail-closed evidence/artifact gates, not runner or dependency failures. The full-readiness job's regulatory-governance integrity sub-job passes. Its direct Tier-A, affirmative per-item current-edition evidence and final artifact checks fail.

A separate combined commit status reports a Vercel failure for the root `kost-funnel` Preview. That is not one of the five DGR Actions workflows and is not E-EXAM runtime acceptance.

## 2. Ten-function source / competency and question-bank reconciliation

The ten current matrices each use their own official task set and blueprint. Function 7.1's 44-task structure is not copied to other functions.

| Function | Official task rows | FR question IDs | Tier-A-affected IDs | FROZEN provenance exceptions | FR/EN status mismatches |
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

Interpretation:
- 287/287 official task-to-matrix rows are represented.
- 453 FR IDs and 453 EN package IDs reconcile structurally; this does not mean the English review is approved.
- 247 unique question IDs fail the direct item-specific 67th Edition 2026 Tier-A gate. Per-function counts are shown above.
- 107 historical FROZEN labels still depend on representative, batch, cross-applied or otherwise non-item-specific evidence.
- 140 overlapping FR-bank/EN-package items have stale or missing mirrored FR status.
- All 453/453 current import candidates remain `IMPORT_ELIGIBLE=NO`; the blocker field is populated for every row.
- The controlled reviewer registry is empty. No matrix row is `APPROVED`; no qualified dated FR sign-off or separate qualified dated EN sign-off is established.

### Function-specific source discipline

The matrices preserve their own source gaps and conflicts rather than filling every task with a question. Examples:
- Function 7.2 blueprint: task 0.4.3 remains a local teaching-source `SOURCE GAP`; no question should be invented to fill a quota.
- Function 7.6: tasks 0.3.2 and 4.3.3 remain local source gaps. Q-7.6-018's old cross-applied danger/risk absence claim was superseded to `SOURCE GAP UNRESOLVED — DIRECT_ITEM_EVIDENCE_REQUIRED`; a limited term search does not prove DGR-wide absence. The Table 9.3.A note discrepancy is recorded as a source conflict: the current table names Division 1.4S, not Division 4.1.
- Function 7.8 has no Block 7 task in its official task table; local reporting content must not create unofficial task identities.
- Function 7.9 keeps its own four Block 7 task identities even where local accident/incident material is a combined pool.
- Function 7.10 Q-7.10-038 retains a battery/power-bank threshold `SOURCE CONFLICT`; the 2026 ICAO TI addendum/operator-guidance lead is not a substitute for licensed IATA DGR evidence.

Each function's separate EN review package remains translation/reviewer draft material. The 140 status-mirror discrepancies must be reconciled item by item; a translation package cannot silently overwrite FR source status. No `APPROVED` status may be set without a named admitted qualified reviewer, evidence reference and actual review date, and EN review must remain a separate sign-off.

**Source-access limitation:** this audit did not have an authorized full IATA DGR 67th Edition 2026 Bookshelf/manual session for new item-by-item human verification. Public significant-change summaries and in-repository locators are not substitutes for direct licensed source review. CI validates recorded artifact structure and policy; it does not establish the truth of licensed regulatory content.

## 3. Stage 2B.1 — native E-EXAM baseline and reconciliations

Native branch `feature/kost-eexam-v2-native` remains at `e8489ee040ef7da23fcaa916c0d3ff47dfd16973` and is unprotected.

Confirmed baseline defects:
1. `lib/questions.ts::isAdmissibleWhereClause()` still uses `reviewer_status != 'REJECTED'`; PENDING questions therefore pass that legacy predicate when source status is frozen. PR #18 proposes APPROVED + review date as an interim guard, but its own description confirms the schema still lacks named reviewer identity/qualification evidence and separate EN review binding. PR #18 remains draft; no current PR-triggered workflow run was returned for its head.
2. `CreateAssessmentForm` exposes a separate scope selector; `createAssessmentAction()` reads client-controlled FormData scope and checks group access, but does not compare the requested scope to the group's persisted scope. Issue #65 remains open.
3. The native candidate individual-PDF route checks result visibility and deferred feedback but does not require a terminal attempt and completed grading before detailed correction release. PR #25 adds an answer-key visibility check but not the terminal-attempt/grading-state boundary; it remains draft and no current PR-triggered workflow run was returned for its head.

### Positive isolated E-EXAM progress — not integrated

- [PR #399](https://github.com/relaxsaadi/cbta/pull/399), head `3ea3745c5406da51dadd01719dddd6c204f1d0a5`: exact-head [E-EXAM V2 validation #42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728) completed SUCCESS (main lint/type/unit/E2E/build job and console Moodle-token-transport/lint/type/build job). It makes the candidate `auto` flag non-authoritative, derives the terminal reason from persisted expiry/server time inside `BEGIN IMMEDIATE`, and dispatches notifications only for the transition winner. It remains draft and is **190 commits ahead / 2 behind** the native branch: divergent, not a safe blind merge.
- [PR #419](https://github.com/relaxsaadi/cbta/pull/419), head `5c4fd23d2b659adb34f252679ca87ff3b3c427c2`: exact-head [E-EXAM V2 validation #45573321513](https://github.com/relaxsaadi/cbta/actions/runs/45573321513) completed SUCCESS. Its body records 751 unit tests and 93 Playwright E2E tests, console Moodle token transport, lint/type/build and a local backup/restore drill. It gates detailed candidate PDFs on terminal attempt + completed grading + answer-key/deferred-feedback policy and private/no-store response. It remains draft and is **196 commits ahead / 2 behind** the native branch: divergent, not a safe blind merge.
- Neither PR is merged, integrated into one current candidate or deployed. A local backup/restore test is not proof of independent encrypted off-site recovery.

## 4. Repository security and confidentiality

- Repository visibility is PUBLIC.
- Current `main`, DGR handoff and native E-EXAM branch objects report `protected=false`.
- `middleware.ts` on current `main` and the DGR handoff still accepts `searchParams.get('secret') === CRON_SECRET` before Basic authentication. The four dashboard pages `agent`, `intel`, `linkedin`, and `instructors` still reference `NEXT_PUBLIC_CRON_SECRET` on the DGR handoff.
- [PR #298](https://github.com/relaxsaadi/cbta/pull/298) has a separate exact-head static security workflow [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152) passing. Its branch removes the URL-secret bypass and uses a server-only Bearer exception for the seven exact scheduled GET paths. PR #298 is still draft/unmerged/undeployed; its fix is not present on current `main` or the DGR handoff. Live cron, dashboard, SSE, CSRF, external-caller and rollback acceptance remain required.
- [Issue #340](https://github.com/relaxsaadi/cbta/issues/340) remains CRITICAL OPEN: public DGR branches contain candidate-facing questions, correct-answer markers and rationales for Functions 7.1–7.10. This is a confidentiality/assessment-integrity exposure, not proof of unauthorized system access or an exposed credential. Removing files from a branch does not retract fetched copies, forks or mirrors. Exposed items must not be used in secure summative/certification exams until a documented item-level exposure decision is made; build a new non-public source-supported pool.
- [Issue #118](https://github.com/relaxsaadi/cbta/issues/118) remains open for repository protection/ruleset enforcement. PR #341's detector is detection only, not containment.

No secret values were read or reproduced. No production data was modified.

## 5. Edition transition

IATA's [Dangerous Goods Documentation / DGR Updates](https://www.iata.org/dgr-updates) currently states that the 2027 DGR (68th Edition) enters into force on **1 January 2027** and the electronic edition is available. Preserve the 67th Edition 2026 evidence and historical attempts; perform separate per-function 68th Edition impact/revalidation before 2027 use. The public update page and significant-change summary do not replace authorized full-edition evidence.

## 6. Release-gate disposition

| Gate | Disposition |
|---|---|
| Candidate workflow | PARTIAL; isolated tests pass, no reconciled release candidate |
| Production question admission | BLOCKED; PENDING passes native legacy predicate; reviewer evidence schema incomplete |
| Roles/RBAC and persisted scope | BLOCKED / NOT ACCEPTED |
| Audit trail and transition/outbox durability | PARTIAL; PR #399 addresses one race, durable notification intent remains open |
| FR source verification | BLOCKED; direct item-specific Tier-A and qualified dated human review incomplete |
| Independent EN bilingual review | BLOCKED; 140 status mirrors unresolved; reviewer registry empty |
| Moodle/console integration | PARTIAL; isolated token-transport CI passes, live staging not accepted |
| Security/confidentiality | CRITICAL BLOCKER |
| Integrated build/tests | NOT ACCEPTED on one reconciled candidate; isolated PR workflows pass |
| Deployment/runbook/monitoring | NOT ACCEPTED |
| Backup/recovery | Local drill only; independent encrypted off-site restore proof missing |

## 7. Owner-only actions

1. Enforce branch protection/required checks for `main`, the DGR release ref and the selected E-EXAM release ref.
2. Authorize confidential-bank containment and historical-copy assessment; prevent exposed items entering secure summative pools.
3. Provide authorized full 67th Edition 2026 source access and appoint named qualified FR reviewers plus separate qualified EN reviewers.
4. Reconcile PR #399/#419 and the reviewer/scope fixes into one candidate; do not merge divergent stacks blindly.
5. Complete live Moodle/staging acceptance, deployment/runbook, monitoring and independent off-site restore proof.

**Decision: PLATFORM NOT READY.** No question is approved or import-eligible. No PR is merged by this audit. No production deployment, DRM bypass, ANAC approval or IATA approval is claimed.
