# DGR / KOST E-EXAM shared handoff

When working on the KOST DGR/CBTA question-bank revalidation or exam-platform readiness, first read:

- `docs/AI_HANDOFF.md`
- `docs/DGR_STAGE_2B_STATUS.md`
- `docs/DGR_SOURCE_REGISTER.md`
- `docs/RECOVERED_STAGE2A_CONTEXT.md`
- `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`
- `docs/AUTONOMOUS_PLATFORM_READINESS.md` when present
- `docs/PLATFORM_READY_CHECKLIST.md` when present
- `docs/PLATFORM_READINESS_REPORT.md` when present

These files are the shared coordination state between Claude Code and ChatGPT.

## Regulatory/source rules

1. Never infer regulatory content that is not directly supported by the supplied current source.
2. Tier A means direct current official regulatory text actually read/verified. A KOST course that cites a regulation remains Tier B evidence unless the official text itself was supplied.
3. Current regulatory baseline: IATA DGR 67th Edition 2026, French, with Addendum 1 integrated.
4. Do not mark any question `APPROVED` without a named qualified reviewer and review date.
5. French source verification and English bilingual technical review are separate gates.
6. Do not paste or commit large licensed IATA extracts. Store only concise source references, validation conclusions, and evidence metadata.
7. If evidence is missing, record `SOURCE REQUIRED`, `SOURCE GAP`, `SOURCE CONFLICT`, or another explicit unresolved state rather than guessing.
8. Before changing a frozen item, record the reason: current-source correction/addendum impact, documented reviewer correction, or explicit user instruction.
9. Update `docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md` after each material revalidation decision so both agents see the same state.

## Recovered-context rule

The earlier blocker “Stage 2A blueprint / 44-subtask competency matrix not found” is resolved on the documentation side. ChatGPT recovered the controlling Stage 1/2A context into `docs/RECOVERED_STAGE2A_CONTEXT.md` from the user's File Library / prior project work. Do not ask the user to resupply that blueprint/matrix before reading and using the recovered file.

Historical platform architecture evidence also exists in `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`. Treat it as historical guidance that must be reverified live, not as a current passed gate. In particular, historical automated-backup status was NOT CONFIGURED.

## Autonomous execution authorization — 2026-08-24

The user explicitly authorized Claude Code and ChatGPT to continue the KOST E-EXAM / DGR platform work autonomously toward a genuinely ready-to-use state, including remaining questions and application tasks.

Therefore:

10. Continue from one task to the next without stopping for routine confirmation. Do not end a work cycle merely because one subtask or batch is complete.
11. Ask the user only for a **hard blocker** that cannot be resolved from the local workspace, authenticated Bookshelf, GitHub/shared state, File-Library-recovered context already committed to GitHub, or safe engineering judgment (examples: manual MFA/login, unavailable external reviewer decision, missing secret/credential that must be supplied by the owner, irreversible production action with no safe rollback).
12. Safe local/code/documentation changes, tests, migrations in a non-production/test environment, question-bank draft/review-state work, Moodle configuration that has a tested rollback path, and Git commits/pushes are authorized when they advance the readiness plan.
13. Never weaken security, expose secrets, bypass DRM/licensing, fabricate regulatory approval, or mark regulatory review complete without evidence.
14. Do not perform destructive production database writes, irreversible deployment changes, or merge/deploy a change with failing critical tests. Use backups/rollback and staged validation.
15. Work in a continuous loop: **inspect → plan → implement → test → verify → document → commit/push → inspect next blocker** until every critical readiness gate in `docs/AUTONOMOUS_PLATFORM_READINESS.md` is passed or a true hard blocker remains.
16. `PLATFORM READY TO USE` may be declared only when the readiness checklist has concrete evidence for every critical gate. If an external qualified-reviewer/bilingual-review gate is still pending, report the platform as technically ready or pre-production ready, not regulatorily approved/production-ready.
