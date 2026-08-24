# KOST DGR/CBTA Exam Platform — READY Gate

This checklist defines the end condition for the project. Do **not** claim `PLATFORM READY TO USE` until every critical gate below is supported by direct evidence.

## A. Regulatory / Question Bank

- [ ] Function 7.1 pilot is fully FR source-verified against current Tier A source (IATA DGR 67th Edition 2026 / applicable current source).
- [ ] Q-7.1-001 is resolved from direct current glossary/source evidence; no inferred danger/risk definition.
- [ ] Q-7.1-007 wording reflects A1/A2 precisely; use `approbation` where source uses it and preserve A1 cargo/passenger nuance.
- [ ] Q-7.1-008 unsupported distractor (`State derogation required`) is revised/replaced before production use.
- [ ] Every active question has source location, competency/function mapping, correct answer, distractor rationale, and status.
- [ ] No `APPROVED` status exists without qualified reviewer name + review date.
- [ ] EN content remains separately flagged for bilingual technical review until actually reviewed.
- [ ] No question is promoted to production merely because a draft/pilot answer exists.

## B. Exam Workflow

- [ ] Candidate can authenticate and reach only their authorized exam.
- [ ] Start/resume rules are deterministic and tested.
- [ ] Timer behavior is tested for refresh, reconnect, expiry, and server/client clock mismatch.
- [ ] Autosave/manual save behavior is verified.
- [ ] Final submission is idempotent and cannot double-submit.
- [ ] Post-submission state is immutable except through authorized review/regrade workflow.
- [ ] Navigation, unanswered-question handling, review flags, and completion confirmation are tested.
- [ ] Browser refresh/back-button/network-loss scenarios are tested.

## C. Roles / RBAC

- [ ] Candidate, instructor/reviewer, exam admin, and system admin permissions are explicitly documented and tested.
- [ ] Least-privilege rules are enforced server-side, not only hidden in UI.
- [ ] Direct URL/API access cannot bypass role restrictions.
- [ ] Candidate cannot view answer keys, other candidates, reviewer-only data, or source notes.
- [ ] Reviewer/admin actions are attributable to an authenticated identity.

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

- [ ] HTTPS is enforced; HTTP redirects to HTTPS.
- [ ] HSTS and required security headers are verified in deployed environment.
- [ ] Debug mode is off in production.
- [ ] No secret/API key/password/token is committed or exposed to browser bundles/logs.
- [ ] MySQL is not publicly exposed.
- [ ] Authentication/session expiry/logout behavior is tested.
- [ ] CSRF/XSS/injection-sensitive paths are reviewed for the actual stack.
- [ ] Uploaded/exported data is access-controlled.
- [ ] Dependency/build security findings have no unresolved critical/high issue affecting launch.

## H. Build / Tests

- [ ] Clean install succeeds from documented repository state.
- [ ] Production build succeeds.
- [ ] Lint/type checks pass or every exception is documented and accepted.
- [ ] Critical exam flows have repeatable automated tests where technically feasible.
- [ ] Desktop, tablet, and mobile exam views are verified.
- [ ] No critical console/runtime errors during core candidate/admin flows.

## I. Deployment / Operations

- [ ] Deployment procedure is documented and repeatable.
- [ ] Required environment variables/configuration are documented without storing secrets.
- [ ] Health check / service verification steps exist.
- [ ] Rollback procedure exists and is tested or credibly rehearsed.
- [ ] Backup scope covers required Moodle/database/configuration assets.
- [ ] Restore procedure is documented and tested sufficiently to prove backups are usable.
- [ ] Logging/monitoring and disk/database capacity risks are addressed.

## J. Final Acceptance

`PLATFORM READY TO USE` may be stated only when:

1. every critical item above is checked with concrete evidence;
2. there is no unresolved blocker that can corrupt an exam, expose protected data, bypass permissions, or misstate DGR regulatory content;
3. production deployment/runbook/backup-recovery evidence exists;
4. remaining non-critical limitations are listed explicitly.

If any critical gate is open, final status must be `NOT READY — <exact blockers>` rather than a partial or optimistic readiness claim.

## Current Stage 2B.1 snapshot (2026-08-24)

- Q-7.1-006: current Tier A evidence retrieved; FR source-verified.
- Q-7.1-007: current A1/A2 evidence retrieved; FR source-verified with wording-precision note.
- Q-7.1-008: current Table 2.6.A evidence retrieved; FR source-verified, but one unsupported distractor must be revised before production.
- Q-7.1-001: glossary location known (Appendice A, p.703), but direct entries still required.
- Pilot FR source verification: 11/12 at the latest pushed evidence snapshot.
