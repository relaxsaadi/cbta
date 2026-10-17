# Local Recovery Targets — KOST E-EXAM

These are targeted next-pass discovery leads recovered from earlier Claude-Code/project activity. They must be checked before concluding the console/runtime is inaccessible.

## 1. High-priority Claude scratchpad lead

An earlier Claude Code browser-capability session referenced this local path while checking installed browser tooling:

`/private/tmp/claude-501/-Users-mac-Documents-cbta/f801bd09-f7a9-4870-b58e-3e89c944df53/scratchpad/kost-eexam-console/`

That path name strongly suggests a local scratchpad/worktree or generated console project named `kost-eexam-console` existed during prior work.

Because `/private/tmp` is ephemeral, the exact UUID/session directory may no longer exist. Search safely for equivalents before declaring the console source unavailable:

- `/private/tmp/claude-*/**/scratchpad/kost-eexam-console`
- `/private/tmp/claude-*/**/*eexam*`
- `/private/tmp/claude-*/**/*moodle*`
- Claude Code task/session output files containing `kost-eexam-console`

If found:

1. inspect structure only first;
2. identify whether it is source, a build artifact, a clone, or only a test fixture;
3. locate any git remote / package metadata / deployment references;
4. do not copy secrets into Git;
5. if it is useful source, establish a safe, non-destructive source-control path and continue the readiness audit there.

## 2. Historical live-runtime lead

Recovered historical architecture evidence says the live exam environment was Moodle 5.0.1 in Docker on Ubuntu 20.04 / Hostarts Algeria with MySQL 8.4 + Nginx + Let's Encrypt. Use this to search local histories/configs for concrete deployment paths:

- shell history for `hostarts`, `docker`, `docker compose`, `moodle`, `nginx`, `mysql`, `certbot`, `exam.kostacademy.com`, `console.kostacademy.com`
- VS Code Remote SSH / terminal history
- Docker contexts and compose files
- local SSH keys/config without printing private-key material
- authenticated hosting-control-panel browser sessions, if already open

Historical claims must be live-reverified before a readiness gate is passed.

## 3. Q-7.1-001 browser recovery

The working Bookshelf method is already documented in `docs/AI_HANDOFF.md`: top-level reader controls (`Search across book`, ToC) via chrome-devtools `evaluate`, with `screenshot` for rendered IATA content. Do not retry the failed Playwright attach path unless the working MCP route is unavailable after a clean client reload.

On a fresh Claude Code/MCP session, go directly to `APPENDICE A — GLOSSAIRE`, page 703, and determine whether current Tier A DGR text actually supports the existing `danger` / `risque` pilot wording. If not, revise/replace the item rather than force-closing it.

## 4. Do not re-open resolved blockers

- Stage 2A / 44-subtask matrix is recovered in `docs/RECOVERED_STAGE2A_CONTEXT.md`.
- Do not ask the owner to resupply it.
- Q007 and Q008 are already closed FR SOURCE VERIFIED with the documented wording/distractor corrections.
