# KOST E-EXAM / DGR Platform — Readiness Report

Updated: 2026-08-24 by ChatGPT + Claude Code shared handoff.

## Final label

**NOT READY YET — regulatory pilot is 11/12 FR source-verified; live platform gates still require current runtime verification.**

This report deliberately separates:

- **current direct evidence**;
- **historical platform evidence that must be reverified**; and
- **open gates / true blockers**.

No ANAC/IATA approval is claimed.

## Important recovered-context corrections

Two blockers reported in the previous version are now narrowed/resolved:

1. **Stage 2A / 44-subtask Function 7.1 scope is recovered.** The user does not need to resupply it. See `docs/RECOVERED_STAGE2A_CONTEXT.md`.
2. **Platform architecture is not completely unknown.** Historical project evidence identifies the Moodle/Docker/MySQL/Nginx/Hostarts architecture and prior tests/configuration. See `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`. This is historical guidance only and does not count as a current passed gate until live reverified.

`docs/LOCAL_RECOVERY_TARGETS.md` also records a high-priority prior Claude scratchpad lead named `kost-eexam-console` and other local recovery targets that must be checked before concluding live source/runtime is inaccessible.

## Gate A — Regulatory / Question Bank — PARTIALLY READY

### Current pilot status

**11/12 Function 7.1 pilot questions are FR source-verified against IATA DGR 67th Edition 2026, French, Addendum 1 integrated.**

FR source-verified/frozen:

- Q-7.1-002
- Q-7.1-003
- Q-7.1-004
- Q-7.1-005
- Q-7.1-006
- Q-7.1-007
- Q-7.1-008
- Q-7.1-009
- Q-7.1-010
- Q-7.1-011
- Q-7.1-012

Open:

- **Q-7.1-001 — danger vs risque.** The current DGR glossary location is known (`Appendice A — Glossaire`, Bookshelf p.703, referenced by §1.0), but the exact current entries still need direct Tier A reading or an evidence-based conclusion that the pilot wording must be revised. Do not force-close this from Tier B training text alone.

### Closed wording corrections

- **Q-7.1-007:** current A1/A2 wording uses **approbation**, not `dérogation`; A1's passenger-approval/cargo-normal-columns nuance and A2 cargo-only-with-approval scope are preserved.
- **Q-7.1-008:** unsupported `State derogation required` distractor was removed and replaced with a source-grounded numerical distractor from Table 2.6.A.

### Stage 1 / Stage 2A scope

Recovered controlling context establishes:

- Function 7.1 official total = **44 leaf-level sub-tasks**
- Block 0 = 17
- Block 1 = 8
- Block 2 = 19
- `0.3.2` is excluded from Function 7.1
- corrected Stage 2A blueprint is source-yield driven and provisional pending instructor validation / ANAC acceptance

See `docs/RECOVERED_STAGE2A_CONTEXT.md`.

**Production question-bank expansion may proceed from the recovered blueprint.** It is no longer blocked on the owner resupplying Stage 2A, but every current regulatory fact still needs the applicable 67e Tier A gate before production use.

### Still-open regulatory gates

- Q001 direct current evidence
- EN bilingual technical review for all questions
- named qualified reviewer + review date before any `APPROVED` status
- production-bank generation/review beyond the 12-item pilot

## Historical platform architecture evidence — GUIDE ONLY, NOT A CURRENT PASS

Recovered 2026-08-19 project evidence described:

- Moodle 5.0.1
- Docker image `bitnamilegacy/moodle`
- MySQL 8.4
- Nginx reverse proxy
- Let's Encrypt TLS
- Ubuntu 20.04
- Hostarts / Algeria VPS
- Moodle Quiz engine, question bank, gradebook/reports, native audit logs
- SSH-key server administration
- historical load test: 0 failures / 800 requests / 50 concurrent users
- **automated backups: NOT configured at that time**

This evidence is useful for recovery/discovery but must be revalidated live before Gates B–I are passed. In particular, backups remain a critical open risk until a current backup + restore test is evidenced.

## Gate B — Exam Workflow — OPEN / CURRENT LIVE TEST REQUIRED

Need current reproducible evidence for:

- assignment/start flow
- instructions
- timer behavior
- navigation / flagging
- refresh/reconnect
- autosave
- submit confirmation
- time-expiry behavior
- double-submit protection
- scoring/result lifecycle

Historical Moodle Quiz capability is not enough to pass this gate.

## Gate C — Roles / RBAC — OPEN / CURRENT LIVE TEST REQUIRED

Need role-based verification for at least:

- candidate
- instructor/reviewer
- exam manager/admin
- auditor/read-only
- system admin where applicable

Need server-side authorization evidence, not UI hiding alone.

## Gate D — Audit Trail / Integrity — OPEN / CURRENT LIVE TEST REQUIRED

Historical Moodle native logs were reported available, but current tests must verify relevant exam/question/admin actions and preservation of attempt/result history.

## Gate E — Bilingual Behavior — PARTIAL

- FR regulatory methodology: 11/12 current pilot items source-verified.
- EN technical review: not completed.
- current FR/EN rendering/error/instruction behavior in the live exam UI: must be retested.

## Gate F — Moodle / KOST E-EXAM Integration — OPEN

Both live domains were previously confirmed to exist:

- `exam.kostacademy.com` — Moodle E-Exam DGR
- `console.kostacademy.com` — KOST E-EXAM console

Need current architecture/access evidence for identity integration, permissions/scopes, retries/error handling, and data synchronization.

Before asking the owner for access again, check `docs/LOCAL_RECOVERY_TARGETS.md`, including the previously referenced Claude scratchpad path named `kost-eexam-console` and local Hostarts/Docker/SSH history leads.

## Gate G — Security / Configuration — OPEN

Need current verification of:

- TLS / HSTS / headers
- authentication/session settings
- secrets handling
- database exposure
- admin access
- debug mode
- service ports
- least privilege

Historical TLS/SSH observations are not a current pass.

## Gate H — Build / Tests — OPEN

Need current reproducible tests against the actual exam/console runtime/source, including candidate-flow E2E and critical admin/RBAC paths.

The marketing/funnel `cbta` repository is not sufficient evidence for the exam runtime itself.

## Gate I — Deployment / Operations — OPEN, BACKUPS HIGH PRIORITY

Need current evidence for:

- deployment procedure
- health check
- rollback
- logging/monitoring
- backup schedule/location
- successful restore test
- recovery/runbook

Because historical evidence explicitly said automated backups were not configured, this gate is a critical priority rather than merely unknown.

## Gate J — Final Acceptance

`PLATFORM READY TO USE` must not be declared until all critical technical gates above have concrete current evidence.

If all technical gates pass while EN / qualified-reviewer regulatory sign-off remains pending, the correct label is **TECHNICALLY READY / PRE-PRODUCTION READY — REGULATORY HUMAN REVIEW PENDING**, not regulator-approved.

## Current true blockers / next autonomous actions

1. Recover/reload chrome-devtools and finish Q-7.1-001 at Appendix A p.703 using the already-proven Bookshelf top-level ToC/search + screenshot technique.
2. Use recovered Stage 2A context to continue production-bank work without asking the owner to resupply it.
3. Check `docs/LOCAL_RECOVERY_TARGETS.md`, especially prior Claude scratchpads containing `kost-eexam-console`, plus Hostarts/Docker/SSH histories, before escalating live-runtime access to the owner.
4. If live access is recovered, immediately reverify architecture/versions and prioritize backup configuration + restore testing before other production-impacting work.
5. Continue through workflow, RBAC, audit integrity, bilingual rendering, integration, security, E2E, deployment/rollback and recovery gates.
6. Surface user action only for a genuine owner-only blocker such as MFA/login, inaccessible secret, external reviewer decision, or irreversible production action without a safe rollback.

## What is not claimed

- No ANAC or IATA approval claim.
- No question is `APPROVED` without a named reviewer/date.
- No EN bilingual review claim.
- No current security/backup/readiness claim based solely on historical evidence.
- No `PLATFORM READY TO USE` claim until the checklist is actually evidenced.
