# DGR / KOST E-EXAM shared handoff

When working on the KOST DGR/CBTA question-bank revalidation or exam-platform readiness, first read:

- `docs/AI_HANDOFF.md`
- `docs/DGR_STAGE_2B_STATUS.md`
- `docs/DGR_SOURCE_REGISTER.md`
- `docs/RECOVERED_STAGE2A_CONTEXT.md`
- `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`
- `docs/READINESS_CORRECTIONS_2026-08-24.md`
- `docs/LOCAL_RECOVERY_TARGETS.md`
- `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` when present
- `docs/FULL_PROGRAM_READINESS_SCOPE.md` when present
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
9. Update `docs/DGR_STAGE_2B_STATUS.md`, `docs/DGR_SOURCE_REGISTER.md`, and the function-program status files after each material revalidation decision so both agents see the same state.

## Recovered-context rule

The earlier blocker “Stage 2A blueprint / 44-subtask competency matrix not found” is resolved on the documentation side. ChatGPT recovered the controlling Stage 1/2A context into `docs/RECOVERED_STAGE2A_CONTEXT.md` from the user's File Library / prior project work. Do not ask the user to resupply that blueprint/matrix before reading and using the recovered file.

Historical platform architecture evidence also exists in `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`. Treat it as historical guidance that must be reverified live, not as a current passed gate. In particular, historical automated-backup status was NOT CONFIGURED; later live evidence may supersede that historical state and must be documented explicitly.

`docs/READINESS_CORRECTIONS_2026-08-24.md` overrides stale blocker language in older readiness-report passages where applicable.

`docs/LOCAL_RECOVERY_TARGETS.md` contains high-priority local discovery leads that must be checked before concluding the exam-console source/runtime is inaccessible, including prior Claude scratchpad paths.

## Full-program scope rule — 7.1 through 7.10

The user expanded the final project scope to the entire KOST DGR/CBTA production examination program, **Functions 7.1 through 7.10**.

A prior label such as `TECHNICALLY READY / PRE-PRODUCTION READY` for the core runtime does **not** terminate the question-bank program. Read `docs/FULL_PROGRAM_READINESS_SCOPE.md` and `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` before deciding that work is complete.

Do not assume Function 7.1's 44-subtask matrix, block structure, source yield, or question volume applies to another function. For each Function 7.2–7.10, independently derive/cross-validate Stage 1, produce its own Stage 2A blueprint, then draft and source-gate the production bank. Continue numerically through the remaining functions unless a documented source dependency justifies a different order.

## Autonomous execution authorization — 2026-08-24 / expanded 2026-08-25

The user explicitly authorized Claude Code and ChatGPT to continue the KOST E-EXAM / DGR platform work autonomously toward a genuinely ready-to-use state, including remaining platform tasks and the full Functions 7.1–7.10 question-bank program.

Therefore:

10. Continue from one task to the next without stopping for routine confirmation. Do not end a work cycle merely because one subtask, batch, function, commit, test phase, or narrower-scope readiness milestone is complete.
11. Ask the user only for a **hard blocker** that cannot be resolved from the local workspace, authenticated Bookshelf, GitHub/shared state, File-Library-recovered context already committed to GitHub, or safe engineering judgment (examples: manual MFA/login, unavailable external reviewer decision, missing secret/credential that must be supplied by the owner, irreversible production action with no safe rollback).
12. Safe local/code/documentation changes, tests, migrations in a non-production/test environment, question-bank draft/review-state work, Moodle configuration that has a tested rollback path, and Git commits/pushes are authorized when they advance the readiness plan.
13. Never weaken security, expose secrets, bypass DRM/licensing, fabricate regulatory approval, or mark regulatory review complete without evidence.
14. Do not perform destructive production database writes, irreversible deployment changes, or merge/deploy a change with failing critical tests. Use backups/rollback and staged validation.
15. Work in a continuous loop: **inspect → plan → implement → test → verify → document → commit/push → inspect next blocker** until every critical readiness gate and every in-scope function pipeline in `docs/FULL_PROGRAM_READINESS_SCOPE.md` is complete or a true owner-only blocker remains.
16. `PLATFORM READY TO USE` may be declared only when the user-defined intended-use readiness checklist has concrete evidence for every critical technical/content gate. If only EN/qualified-reviewer human regulatory gates remain, use the narrower pre-production label described in `docs/FULL_PROGRAM_READINESS_SCOPE.md`; do not imply ANAC/IATA approval.
17. If a diagnostic exposes a credential in local tool output, rotate or replace that credential through a safe, tested path before final readiness when technically feasible; do not commit the secret or repeat it in documentation.
18. Real accessibility, RBAC, or cross-browser defects are not erased by high aggregate test-pass counts. Fix and re-test them, or explicitly document a formal risk acceptance by the owner before treating the affected gate as passed.
