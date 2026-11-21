# KOST E-EXAM — Autonomous Platform Readiness Plan

Purpose: provide a single continuous execution plan for Claude Code + ChatGPT. The user should not be required to relay routine messages between agents. Work continues until all critical gates are evidenced or a true owner-only blocker remains.

## Definition of done

Do **not** declare `PLATFORM READY TO USE` from UI appearance or a partial pilot. Readiness requires concrete evidence across regulatory content, exam workflow, security, operations, and recovery.

Possible final labels:

- `PLATFORM READY TO USE` — all critical technical/content gates passed and required human review gates completed.
- `TECHNICALLY READY / REGULATORY REVIEW PENDING` — application is operational and tested, but named qualified reviewer/date and/or bilingual technical review are still outstanding.
- `NOT READY` — one or more critical technical or content gates are open.

## Phase 1 — close Stage 2B.1 pilot

1. Finish Q-7.1-001 using current direct Tier A evidence from DGR 67e Appendice A / Glossaire or determine `SOURCE INSUFFICIENT / QUESTION REQUIRES REVISION`.
2. Correct Q-7.1-008's unsupported distractor; revalidate the replacement directly against current evidence.
3. Ensure Q-7.1-007 wording reflects A1/A2 accurately: A1 passenger carriage requires prior approval while cargo may use normal K/L provisions; A2 is cargo-only and requires prior approval.
4. Produce final FR wording/status for all 12 pilot questions.
5. Preserve EN as `BILINGUAL TECHNICAL REVIEW REQUIRED` until actually reviewed.
6. Preserve approval as `PENDING QUALIFIED REVIEWER + REVIEW DATE` until actually completed.

Exit evidence: 12/12 pilot items have a defensible current FR source status, with no unsupported distractor or unresolved wording ambiguity.

## Phase 2 — Function 7.1 production question bank

Use the frozen Stage 2A blueprint and 44-subtask competency matrix as the controlling scope.

1. Reconfirm the 44-subtask matrix against shared records.
2. Build only source-supported questions; the prior ~196 figure is a provisional maximum/ceiling, not a quota.
3. Achieve enough validated bank depth to support the intended 30–40-question sittings and the documented multi-sitting rotation/full subtask coverage without relying on invented regulatory facts.
4. Maintain per-question metadata:
   - function/subtask/competency;
   - difficulty/priority;
   - FR source section/table/page metadata;
   - correct-answer evidence;
   - distractor evidence;
   - edition/addendum state;
   - EN review state;
   - reviewer name/date;
   - lifecycle state (DRAFT / SOURCE VERIFIED / REVIEWED / APPROVED / SUSPENDED).
5. Resolve source conflicts explicitly; never silently choose one source.
6. No large licensed text or screenshots committed to Git.

Exit evidence: source-controlled production bank meets the approved sitting/rotation requirements and has no unresolved critical source gaps for active questions.

## Phase 3 — locate and audit the actual exam-platform code/runtime

The current `relaxsaadi/cbta` repository may contain marketing/funnel code rather than the complete Moodle/E-EXAM runtime. Claude Code must inspect the local workspace/filesystem to locate the actual components used by:

- `exam.kostacademy.com` (Moodle exam engine);
- `console.kostacademy.com` / KOST E-EXAM admin/audit console;
- integration/configuration code connecting them.

Do not assume this GitHub repository is the entire platform. Record actual local paths/repositories and create a safe source-control/handoff path where appropriate without exposing secrets.

Exit evidence: every production-relevant component has an identified source/config/runtime location and an owner/backup path.

## Phase 4 — exam lifecycle functional gates

Verify with real test users/roles and reproducible evidence:

1. Authentication/login/logout and session handling.
2. Candidate role cannot access admin/reviewer capabilities.
3. Admin/reviewer/auditor RBAC and least privilege.
4. Exam assignment/eligibility.
5. Instructions/start flow.
6. Question rendering on desktop/tablet/mobile.
7. FR/EN behavior and mirrored question integrity.
8. Navigation/back/next/summary behavior.
9. Timer behavior, refresh/reconnect behavior, and expiry handling.
10. Answer persistence/autosave and loss prevention.
11. Randomization/sampling per blueprint without accidental duplicates or broken competency weighting.
12. Submission, forced submission at timeout if designed, and idempotency/double-submit protection.
13. Scoring/pass-threshold logic and approved rounding policy.
14. Completion/result screen behavior.
15. Reviewer workflow and audit evidence.
16. No candidate exposure of correct answers/source notes before allowed review stage.

Exit evidence: repeatable end-to-end test passes for candidate + admin/reviewer/auditor flows.

## Phase 5 — data integrity and auditability

Verify:

1. Immutable/reconstructable attempt record: candidate, exam version, question IDs/versions, answers, timestamps, score/outcome.
2. Question edits after an attempt do not corrupt historical evidence.
3. Audit log for sensitive administrative changes.
4. Reviewer decisions and approval dates are attributable.
5. Timezone/timestamp consistency.
6. Export/report needed for ANAC/audit demonstration without exposing unnecessary personal data.
7. No fabricated demo candidates/scores presented as real evidence.

Exit evidence: an auditor can reconstruct what happened in a completed attempt.

## Phase 6 — security/configuration gates

Reverify current production/test configuration rather than relying only on prior notes:

1. HTTPS/TLS and HTTP→HTTPS.
2. HSTS and appropriate security headers.
3. Debug disabled in production.
4. No exposed secrets in Git/client bundles/logs.
5. Database ports not publicly exposed; read-only boundary respected where designed.
6. CSRF/session/cookie security appropriate to Moodle/console stack.
7. Brute-force/rate-limit/account-lockout behavior where applicable.
8. File upload/download permissions if any.
9. Dependency/security scan with critical/high findings triaged.
10. Admin endpoints not exposed to candidate role.

Exit evidence: no unresolved critical security finding.

## Phase 7 — build, test, deployment and observability

For each production component:

1. Clean build/install from documented prerequisites.
2. Automated tests/lint/type checks where available.
3. Browser smoke/E2E tests at desktop/tablet/mobile.
4. Deployment/runbook documented.
5. Health checks/logging/error visibility.
6. Known warning/noise separated from real failure.
7. Production deployment only after critical test pass and rollback path.

Exit evidence: a fresh maintainer can build/test/redeploy using the runbook.

## Phase 8 — backup, restore and failure recovery

Verify with a non-destructive restore test where feasible:

1. Moodle database backup.
2. Moodle data/config backup.
3. Console database/config backup.
4. Question-bank/version metadata backup.
5. Restore procedure and recovery point expectations.
6. Recovery from interrupted exam/browser refresh/network interruption.

Exit evidence: backup exists and restore path is proven, not merely described.

## Phase 9 — audit/demo readiness

Prepare a concise, evidence-based demonstration package:

1. DGR 67e source state + Addendum 1 integrated.
2. Function 7.1 competency → source → question → reviewer → exam traceability.
3. Sample current-source-verified questions.
4. RBAC/audit-trail demonstration.
5. Real end-to-end test evidence clearly labeled as test data.
6. Known limitations and pending external reviews stated honestly.

Never claim ANAC/IATA approval unless documentary evidence supports the exact claim.

## Autonomous work loop

Claude Code should continuously:

`inspect → choose highest-risk open gate → implement/research → test → verify → document → commit/push → continue`

Do not stop after a single question, commit, or phase.

Only interrupt the user for a hard blocker such as manual authentication/MFA, unavailable qualified human reviewer decision, missing owner-controlled credential, or an irreversible production action that cannot be safely staged/rolled back.

ChatGPT monitors GitHub-side progress and may review/correct shared documentation/code. Keep shared handoff files current after material changes.

## Final readiness report required

Before any declaration of readiness, produce `docs/PLATFORM_READINESS_REPORT.md` containing:

- status of every critical gate above;
- evidence/commands/tests/URLs or artifacts used;
- unresolved blockers;
- exact content-review status (FR, EN, reviewer/date);
- deployment and backup state;
- final label: `READY`, `TECHNICALLY READY / REVIEW PENDING`, or `NOT READY`.

Only use `PLATFORM READY TO USE` if the report supports `READY` with zero open critical gates.
