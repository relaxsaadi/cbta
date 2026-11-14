# Readiness Corrections — 2026-08-24

This file corrects two conclusions in the current `docs/PLATFORM_READINESS_REPORT.md` after ChatGPT recovered additional user-owned project context from the ChatGPT File Library.

## Correction 1 — Stage 2A / 44-subtask matrix blocker RESOLVED

The report says the frozen Stage 2A blueprint / 44-subtask Function 7.1 matrix could not be found. That is no longer true.

Recovered artifacts establish:

- official Function 7.1 total = **44** leaf-level sub-tasks
- Block 0 = 17
- Block 1 = 8
- Block 2 = 19
- `0.3.2` passenger responsibilities is excluded from Function 7.1
- corrected Stage 2A blueprint exists and is source-yield driven
- qualification columns and binding question-generation restrictions are recovered

See `docs/RECOVERED_STAGE2A_CONTEXT.md`.

**Consequence:** production-question-bank planning is no longer blocked on the owner resupplying Stage 2A. It remains subject to current 67e Tier A source revalidation and reviewer gates.

## Correction 2 — platform architecture is not entirely unknown

Historical project evidence from 2026-08-19 identifies the exam runtime architecture as Moodle 5.0.1 in Docker (`bitnamilegacy/moodle`), MySQL 8.4, Nginx, Let's Encrypt, Ubuntu 20.04, Hostarts/Algeria, with Moodle-native Quiz/audit/reporting capabilities. Historical evidence also records SSH-key admin access and a successful 50-concurrent-user / 800-request load test, but **automated backups were NOT configured** at that time.

See `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`.

**Consequence:** Gates B–I are still not passed, because the live runtime has not been re-accessed/reverified. But the blocker is narrower than “no architecture evidence”: the remaining blocker is live-runtime route/access and current verification.

## Still-open critical items

- Q-7.1-001 still needs current 67e direct evidence for the actual danger/risque glossary entries or an evidence-based decision that the pilot wording must be revised.
- EN bilingual technical review is still open.
- qualified reviewer + date is still open.
- live exam/console access is still required to verify/fix workflow, RBAC, integration, security, backups/restore, tests and deployment operations.
- backups must be treated as an active critical risk until current evidence proves they are configured and restorable.

Claude Code should update `docs/PLATFORM_READINESS_REPORT.md` on its next active pass to incorporate these corrections and continue without asking the user to resupply Stage 2A.
