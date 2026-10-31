# KOST DGR/CBTA Exam Platform — READY Gate

This checklist defines the end condition for the project. Do **not** claim `PLATFORM READY TO USE` until every critical gate below is supported by direct evidence.

> **Current release override — 2026-10-27: NOT READY.** Historical `[x]` entries below document earlier limited tests (mostly August 2026); they do **not** constitute fresh, integrated Stage 2B.1 staging, deployment, incident-recovery or regulator acceptance. The cross-function regulatory Tier-A and readiness checks on PR #3 still fail, and independent E-EXAM technical acceptance remains open. This checklist must be read with [`FULL_PROGRAM_READINESS_SCOPE.md`](FULL_PROGRAM_READINESS_SCOPE.md), the exact-head CI checks, and confidential-content [issue #340](https://github.com/relaxsaadi/cbta/issues/340).

## A. Regulatory / Question Bank

**Separate fail-closed checks for Functions 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9 and 7.10 — not a Function 7.1 template:**

- [ ] For **each** function, verify its own current CBTA task set, source/competency matrix and Stage 2A blueprint before judging question coverage. Do not copy Function 7.1's 44-subtask structure or mechanically assign functions by job title/sector.
- [ ] For **each** function's active question, establish direct current IATA DGR **67th Edition (2026)** Tier-A support, applicable addendum/edition state, item-specific locator, and affirmative evidence for correct answer **and distractors**. Old exams, representative examples, secondary summaries and unverified citations cannot substitute for direct evidence.
- [ ] Record `SOURCE GAP`, `SOURCE CONFLICT`, `STALE CITATION` or `PENDING` explicitly on affected FR items; unresolved states block promotion and import, even if an old staging database contains that question.
- [ ] Verify FR against its own source, then conduct a **separate** technical EN bilingual review. A translation draft is not a reviewed question.
- [ ] No `APPROVED` status for any function without an exact admitted, qualified human reviewer's name/ID, independently evidenced qualification, and actual review date (plus separate qualified FR/EN review as applicable); structural CI alone is insufficient.

- [ ] Function 7.1 pilot is fully FR source-verified against current Tier A source (IATA DGR 67th Edition 2026 / applicable current source).
- [ ] Q-7.1-001 is resolved from direct current glossary/source evidence; no inferred danger/risk definition.
- [ ] Q-7.1-007 wording reflects A1/A2 precisely; use `approbation` where source uses it and preserve A1 cargo/passenger nuance.
- [ ] Q-7.1-008 unsupported distractor (`State derogation required`) is revised/replaced before production use.
- [ ] Every active question has source location, competency/function mapping, correct answer, distractor rationale, and status.
- [ ] No `APPROVED` status exists without qualified reviewer name + review date.
- [ ] EN content remains separately flagged for bilingual technical review until actually reviewed.
- [ ] No question is promoted to production merely because a draft/pilot answer exists.

## A2. Examination confidentiality (critical release gate — #340)

- [ ] Inventory all question/answer-key material already publicly exposed, by Function 7.1–7.10, and assess item eligibility. **Already-public answer-key-bearing items are not a confidential summative examination pool.** No claim of an operational breach is implied.
- [ ] Obtain owner-authorized access-controlled storage and a reviewed plan for non-public replacement/retirement of affected items. Prevent new keys or rationales in public commits, issue comments, logs, artifacts or client bundles; a Git ignore/path-pattern detector alone is insufficient.
- [ ] Independently verify server-side candidate/non-admin access restrictions, secure exam delivery and export, new-item provenance, and the production publication path. Making the repository private does not retract its existing public history.
- [ ] Do not interpret earlier Moodle/staging imports, exam-bank draft counts, or passing structural checks as proof of confidential production item readiness.

## B. Exam Workflow

- [x] Candidate can authenticate and reach only their authorized exam. — verified 2026-08-25, live, `test_candidate` restricted to course 4
- [x] Start/resume rules are deterministic and tested. — verified 2026-08-25 (this quiz always labels its button "Démarrer...", resuming an in-progress attempt transparently)
- [ ] Timer behavior is tested for refresh, reconnect, expiry, and server/client clock mismatch. — historical 2026-08-25 refresh/reconnect and auto-timeout evidence exists; **server/client clock mismatch remains untested**, so the full gate is PENDING.
- [x] Autosave/manual save behavior is verified. — verified 2026-08-25: answers persist via the real "Page suivante" POST, confirmed by direct DOM/DB inspection
- [x] Final submission is idempotent and cannot double-submit. — verified 2026-08-25 via DB state check (`finished` does not revert to `inprogress`, no further "next" control after finishing)
- [ ] Post-submission state is immutable except through authorized review/regrade workflow. — not separately tested this pass
- [x] Navigation, unanswered-question handling, review flags, and completion confirmation are tested. — verified 2026-08-25 (question flagging, mixed MCQ/free-text navigation, finish-confirmation modal)
- [ ] Browser refresh/back-button/network-loss scenarios are tested. — refresh was verified 2026-08-25; **back-button and network-loss recovery remain untested**, so the full gate is PENDING.

## C. Roles / RBAC

- [ ] Candidate, instructor/reviewer, exam admin, and system admin permissions are explicitly documented and tested. — 2026-08-25 candidate/admin/auditor tests are historical partial evidence; **instructor/exam-manager roles are not implemented**, and the full role matrix is not tested (see `docs/PLATFORM_READINESS_REPORT.md` Gate C).
- [x] Least-privilege rules are enforced server-side, not only hidden in UI. — verified 2026-08-25 at both login-level (two-gate model: console role + external-service whitelist) and mutation-level (`/identity-verification` correctly refuses auditor server-side with no form rendered at all; `/feedback` is open to all authenticated roles by what appears to be design — see readiness report Gate C for the full mixed result)
- [x] Direct URL/API access cannot bypass role restrictions. — verified 2026-08-25: unauthenticated/unauthorized direct navigation redirects to login without leaking content
- [ ] Candidate cannot view answer keys, other candidates, reviewer-only data, or source notes. — not separately tested this pass
- [ ] Reviewer/admin actions are attributable to an authenticated identity. — not separately tested this pass (Moodle audit log confirmed populated in the fourth pass, Gate D)

## D. Audit Trail / Integrity

- [ ] Exam start, answers, saves, submission, grading/regrading, reviewer approval, and administrative changes have an audit trail.
- [ ] Audit records include actor, timestamp, action, relevant entity, and before/after state where appropriate.
- [ ] Question/version used for each submitted attempt is recoverable.
- [ ] Production question changes do not silently mutate historical attempts.

## E. Bilingual Behavior

- [ ] FR/EN rendering works for question, options, instructions, errors, review state, and reports.
- [ ] Language switching does not change question identity or answer mapping.
- [ ] Missing EN review cannot be presented as technically approved.
- [ ] Special DGR terminology remains source-accurate in each language.

## F. Moodle / KOST E-EXAM Integration

- [ ] Architecture boundary remains: Moodle Web Services for writes/actions; MySQL access is read-only where retained.
- [ ] No direct MySQL write path exists from the Next.js console.
- [ ] Moodle production question-bank changes have an explicit controlled publication path.
- [ ] API/service-account scopes are least privilege.
- [ ] Error/retry handling cannot create duplicate exams, attempts, grades, or questions.
- [ ] Integration failures are visible to administrators and logged.

## G. Security / Configuration

- [x] HTTPS is enforced; HTTP redirects to HTTPS. — verified (Certbot-managed 301 redirect on both domains)
- [x] HSTS and required security headers are verified in deployed environment. — console had them already; Nginx-layer gap on `exam.kostacademy.com` closed 2026-08-25 (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, scoped CSP)
- [x] Debug mode is off in production. — confirmed 2026-08-25 via `mdl_config` (`debug=0`)
- [ ] No secret/API key/password/token is committed or exposed to browser bundles/logs. — the 2026-08-25 Moodle DB diagnostic exposure was reportedly remediated through rotation (see readiness report Gate G), **but four dashboard components currently reference `NEXT_PUBLIC_CRON_SECRET`**, which is eligible for inclusion in browser JavaScript when configured. Prove production environment values and bundle contents are safe; remove client-side shared-secret use and verify server-side authentication before marking PASS. Do not assume `NEXT_PUBLIC_CRON_SECRET` equals `CRON_SECRET` without configuration evidence.
- [x] MySQL is not publicly exposed. — re-confirmed 2026-08-25, bound to container-internal only, no host port mapping
- [x] Authentication/session expiry/logout behavior is tested. — verified 2026-08-24 (cookie audit) and 2026-08-25 (full smoke suite)
- [ ] **Protected-route cron-token authorization boundary (2026-10-27 finding):** the current `main` middleware lets a valid `?secret=CRON_SECRET` query bypass Basic authentication for **every** protected route, including dashboard pages and mutation APIs, not just cron handlers. [Draft PR #348](https://github.com/relaxsaadi/cbta/pull/348) narrows this to five exact GET-only legacy cron paths and has synthetic regression tests, but is **unmerged** and is not production acceptance. Independently test deployed access denial for `/dashboard`, arbitrary protected APIs, and protected POST requests with query token; rotate/separate cron secrets when justified, eliminate browser `NEXT_PUBLIC_CRON_SECRET` reliance, and replace legacy query tokens with server-only authenticated requests before closing this gate. Neither source tests nor a scoped bypass alone prove live safety.
- [ ] **HTTP Basic-auth CSRF boundary on CRM write APIs (2026-10-28 finding):** browser-managed Basic credentials can accompany cross-origin requests to protected `/api/` mutation routes; `/api/agents/followup` accepts a bodyless POST that starts outbound activity without a per-handler origin check on `main`. [Draft PR #298](https://github.com/relaxsaadi/cbta/pull/298) now adds a fail-closed same-origin `Origin`/`Referer` + `Sec-Fetch-Site` policy at the authenticated middleware boundary for `POST/PUT/PATCH/DELETE` API calls, with synthetic unit and static-integration tests ([Actions run 40617590340](https://github.com/relaxsaadi/cbta/actions/runs/40617590340) PASS on commit `c02c7df8`). **Unmerged/undeployed**: do not claim protection is active. Before closing: exercise cross-site denial and authenticated dashboard mutations on a real staging deployment, check legitimate machine-to-machine clients are not broken, and audit any side-effecting GET endpoints separately. This is shared CRM/funnel middleware, **not** a Moodle/E-EXAM approval or technical cutover.
- [ ] CSRF/XSS/injection-sensitive paths are reviewed for the actual stack. — not separately reviewed this pass (console source unavailable, see below)
- [ ] Uploaded/exported data is access-controlled. — not tested this pass
- [ ] Dependency/build security findings have no unresolved critical/high issue affecting launch. — not run this pass (console source unavailable — `npm audit`/equivalent would need the actual console app, not the black-box test harness)

## H. Build / Tests

- [ ] Clean install succeeds from documented repository state. — not applicable this pass: the console's own source was lost to `/private/tmp` cleanup (see `docs/AI_HANDOFF.md` fifth-pass log) and is not currently available to build from this environment
- [ ] Production build succeeds. — same limitation as above
- [ ] Lint/type checks pass or every exception is documented and accepted. — same limitation as above
- [x] Critical exam flows have repeatable automated tests where technically feasible. — a committed Playwright suite now exists at `platform-ops/kost-eexam-console/` (black-box, against the live URLs) covering smoke/RBAC/security-headers/full candidate lifecycle/accessibility
- [x] Desktop, tablet, and mobile exam views are verified. — 2026-08-25, 5 browser/device projects run; Chromium-family clean, Firefox/WebKit/tablet-Safari had timing-sensitive (not confirmed-defect) failures on the longest test
- [x] No critical console/runtime errors during core candidate/admin flows. — confirmed 2026-08-24 (0 browser console errors); one real non-critical finding this pass: WCAG AA color-contrast violation (see readiness report Gate H)

## I. Deployment / Operations

- [x] Deployment procedure is documented and repeatable. — Docker Compose stacks on the VPS, confirmed live 2026-08-24
- [x] Required environment variables/configuration are documented without storing secrets. — `.env.example` pattern used in the rebuilt test suite; production `.env` snapshots are GPG-encrypted on the server
- [ ] Health check / service verification steps exist. — not separately confirmed this pass
- [x] Rollback procedure exists and is tested or credibly rehearsed. — Nginx config change 2026-08-25 followed backup → `nginx -t` → reload → verify pattern; `RESTORE_PROCEDURE.md` documents full disaster recovery (fourth pass)
- [x] Backup scope covers required Moodle/database/configuration assets. — confirmed 2026-08-24 (database, moodledata, moodle code, config, GPG-encrypted secrets)
- [x] Restore procedure is documented and tested sufficiently to prove backups are usable. — fresh successful restore test 2026-08-24 (491/491 tables)
- [ ] Logging/monitoring and disk/database capacity risks are addressed. — disk headroom checked (14% used, fourth pass) but no dedicated monitoring/alerting confirmed

## J. Final Acceptance

`PLATFORM READY TO USE` may be stated only when:

1. every critical item above is checked with concrete evidence;
2. there is no unresolved blocker that can corrupt an exam, expose protected data, bypass permissions, or misstate DGR regulatory content;
3. production deployment/runbook/backup-recovery evidence exists;
4. remaining non-critical limitations are listed explicitly.

If any critical gate is open, final status must be `NOT READY — <exact blockers>` rather than a partial or optimistic readiness claim.

## Gate reassessment (2026-10-17)

The four gates above were corrected from `PASS` to `PENDING` because their own evidence records untested cases, missing roles, or unverified browser-secret isolation. These are documentation-state corrections **only**; they do not claim a new live test, a remediated code path, or production authorization. The `NEXT_PUBLIC_CRON_SECRET` references occur in `app/dashboard/{agent,intel,linkedin,instructors}/page.tsx` on this branch. `PLATFORM READY TO USE` remains blocked pending direct technical and regulatory evidence for Functions 7.1–7.10.

## Historical Stage 2B.1 snapshot (2026-08-24 — superseded; not current readiness)

> The five bullets below are preserved as an August progress record, not current FR/EN or runtime sign-off. In subsequent documentation, Q-7.1-001 was classified as a confirmed DGR-specific source gap; Q-7.1-008's distractor was corrected **in documentation only**, with actual deployed question text still unverified. See [`DGR_STAGE_2B_STATUS.md`](DGR_STAGE_2B_STATUS.md). All ten functions remain under independent direct Tier-A/qualified FR/EN/approval release holds.

- Q-7.1-006: current Tier A evidence retrieved; FR source-verified.
- Q-7.1-007: current A1/A2 evidence retrieved; FR source-verified with wording-precision note.
- Q-7.1-008: current Table 2.6.A evidence retrieved; FR source-verified, but one unsupported distractor must be revised before production.
- Q-7.1-001: glossary location known (Appendice A, p.703), but direct entries still required.
- Pilot FR source verification: 11/12 at the latest pushed evidence snapshot.
