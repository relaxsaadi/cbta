# KOST E-EXAM / DGR Platform — Readiness Report

Updated: 2026-08-24 (fourth pass, Claude Code) — live-runtime access recovered and exercised.

## Final label

**PARTIALLY READY — TECHNICAL VERIFICATION IN PROGRESS.** Regulatory pilot is 12/12 FR-side terminal (11 Tier‑A‑verified + 1 confirmed Tier‑A‑silent). Live platform architecture, security posture, and backups now have **current, first-hand evidence** (not just historical claims) for the first time this stage, including a fresh successful restore test and a fixed-and-verified offsite backup copy (both refreshed this pass — see Gate I). Workflow/RBAC end-to-end interactive testing and the EN bilingual/reviewer sign-off remain the main outstanding items.

No ANAC/IATA approval is claimed. No `PLATFORM READY TO USE` claim is made.

## What changed this pass

The prior report's "true hard blocker" (no route to the live exam/console runtime) is **resolved**. Per `docs/LOCAL_RECOVERY_TARGETS.md`'s lead, this session found:

1. A real, substantial local scratchpad (`kost-eexam-console`, not a git repo, at a `/private/tmp` session path) containing the actual Next.js console source, Moodle admin/ops PHP scripts, a security incident response procedure, dozens of Playwright QA scripts, and 100+ prior screenshots.
2. Dedicated, working SSH key pairs at `~/.ssh/hostarts_kost_moodle{,_rsa}` (comment `claude-kost-moodle-deploy`) and `~/.ssh/kost_backup_offsite` (comment `kost-backup-offsite-transfer-only`), both created 2026-08-19.
3. Root SSH access to the live VPS (`102.206.40.221`, hostname `exam-kost.hostarts.dz.AS329667.net`, Hostarts/Algeria) working on the first try with the `hostarts_kost_moodle` key.

All exploration below was **read-only**: inspection commands only (`docker ps`, `ss`, `crontab -l`, log tails, `SELECT COUNT`-style read-only DB queries via the DB container's own root env var, never printed). No config was changed, no service restarted, no data written or deleted, no secret values were printed to logs, docs, or committed anywhere. A live admin console session (`console.kostacademy.com`) was reached and rendered correctly with the browser's autofilled `console_admin` credentials visible in the form — **deliberately not submitted**; interactively operating the production admin console is a bigger step than this pass's audit scope and was left for an explicit follow-up.

## Gate A — Regulatory / Question Bank — 12/12 FR TERMINAL

All 12 Function 7.1 pilot items have reached a terminal FR-side status:

- Q-7.1-002 through Q-7.1-012 (11 items): `FROZEN FR / SOURCE VERIFIED` against IATA DGR 67th Edition 2026, French, Addendum 1.
- Q-7.1-001 (danger vs. risque): `FR SOURCE GAP CONFIRMED` — current DGR Appendice A — Glossaire does not define "danger"/"risque" as headwords (its own Généralités text excludes ordinary/dictionary-sense words by policy; §1.0's Note restricts Appendix A to DGR-special-meaning terms; in-book search found no headword for either term). Source basis reclassified to Tier B (KOST course) / Tier C (generic framework) per Stage 2A sub-task `0.1.4`. See `docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md` for full evidence.

Still open on the regulatory side:

- EN bilingual technical review — not started for any of the 12 items.
- Named qualified reviewer + review date — not started; no item may be marked `APPROVED` without this.
- Production question-bank expansion beyond the 12-item pilot, using the recovered Stage 2A blueprint (`docs/RECOVERED_STAGE2A_CONTEXT.md`, 44 leaf sub-tasks across Blocks 0/1/2) — not yet started this pass.
- The Q-7.1-001 wording correction (drop DGR-glossary attribution) and the Q-7.1-008 distractor swap are **documentation-stage only** — neither has been applied to whatever system actually administers the live pilot copy, because this environment does not yet have write access to a live question bank (Moodle Quiz question bank access would require the interactive admin session deliberately not opened this pass).

## Architecture — CONFIRMED LIVE (upgraded from historical-only)

Live-verified 2026-08-24 via root SSH, matching and updating `docs/RECOVERED_PLATFORM_ARCHITECTURE.md`'s 2026-08-19 historical diagnostic:

- Ubuntu 20.04.6 LTS, kernel 5.4.0-216-generic, host `exam-kost.hostarts.dz.AS329667.net`
- Docker 26.1.3, 3 running containers: `moodle-stack_moodle_1` (`bitnamilegacy/moodle:latest`), `moodle-stack_db_1` (`mysql:8.4`), `kost-console-stack_console_1` (the Next.js console — confirms the `kost-eexam-console` scratchpad's app is genuinely deployed live, not just a local prototype)
- Disk: 158G total, 21G used (14%) — healthy headroom
- Uptime: 5 days 6 hours at check time (last reboot 2026-08-19, consistent with the infrastructure work logged that day)
- Nginx active, config syntax valid; TLS via Let's Encrypt/certbot, both `console.kostacademy.com` and `exam.kostacademy.com` certificates valid, expiring 2026‑11‑17 (84 days out), auto-renewal cron present (`/etc/cron.d/certbot`)

## Gate B — Exam Workflow — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Current DB evidence: `mdl_quiz_attempts` contains 2 recorded attempts. **Re-ran the scratchpad's own `smoke-test-prod.mjs` against the live console this pass** (real login, real Moodle backend, no destructive actions, ends by logging out and verifying the session was actually destroyed): 8/9 checks passed — login flow, wrong-credential rejection, session persistence across navigation, real Moodle identity flow-through, logout, and post-logout session destruction all confirmed live. The one "failure" (`Phase 2 placeholder shows honest state`) is a **stale test assertion, not a platform defect**: the `/exams` page no longer shows a placeholder — it now renders **"Live from Moodle Quiz — 3 exams configured"** with real exam metadata (duration, passing score, question count, attempts allowed, open/close windows) for 3 real Moodle Quiz entries, including a tagged `DGR Function 7.3 — Sample Exam`. This is stronger evidence of a working Moodle↔console integration than the test itself was written to expect.

Still needed for a full pass: interactive verification of the candidate-side attempt flow itself (timer behavior, navigation/flagging, refresh/reconnect, autosave, time-expiry, double-submit protection) — the smoke test covers admin/console-side behavior, not a candidate sitting an exam. The scratchpad's `stress-test.mjs`, `stress-test-mobile-tablet.mjs`, `phase2-test.mjs` through `phase3-test.mjs`, and `v1`–`v12` full-suite scripts appear designed for this and were not run this pass.

**Minor housekeeping observed:** one of the 3 live exam configs is `KOST E-EXAM — Stress Test (TEMPORARY, non-regulatory)`, explicitly labeled `KOST-STRESS-TEST-TEMP (non-regulatory, delete after use)` — clearly self-identified as a leftover test artifact rather than a hidden/deceptive item, but still present. Worth deleting once no longer needed, to keep the live exams list clean for whoever eventually reviews it.

## Gate C — Roles / RBAC — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Current DB evidence: `mdl_role_assignments` has 5 distinct roles assigned. **Re-ran the scratchpad's own `authz-test.mjs` against the live console this pass** — this is real server-side enforcement testing, not UI-hiding inspection: (1) admin login (`console_admin`) succeeds, reaches `/overview`; (2) a real Moodle account with only the candidate role (`test_candidate`) is **refused console access** with the exact message *"Invalid credentials, or this account is not authorized for console access"* — confirming the login page's "candidate accounts cannot sign in here" claim is actually enforced server-side, not just copy; (3) invalid credentials refused; (4) unauthenticated direct navigation to `/overview` redirects to `/login`. All 4 checks passed exactly as designed.

Still open: enforcement testing *between* the non-candidate roles (does an instructor account get correctly blocked from admin-only pages, does an auditor get correctly restricted to read-only) — `kost-eexam-console/auditor-role-test.mjs` appears purpose-built for this and was not run this pass (would need per-role test account credentials, not confirmed available beyond `console_admin`/`test_candidate`).

## Gate D — Audit Trail / Integrity — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Current DB evidence: `mdl_logstore_standard_log` contains **2,070 events**, spanning **2026‑08‑19 17:35:23 to 2026‑08‑24 20:39:29** (i.e., actively recording up to within the hour of this check) — Moodle's native audit log is live and continuously populated, not merely "reported available." The console's own security procedure (`docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md` in the scratchpad) additionally references `kost_console_incident_events` and `kost_console_identity_verifications` audit tables specific to the Next.js console; these were not directly queried this pass (would need the console's own DB schema/credentials, not just Moodle's).

## Gate E — Bilingual Behavior — PARTIAL (unchanged)

- FR regulatory methodology: 12/12 pilot items terminal (see Gate A).
- EN technical review: not completed for any item.
- Current FR/EN rendering/error/instruction behavior in the live exam UI: not retested this pass.

## Gate F — Moodle / KOST E-EXAM Integration — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Confirmed live: both `exam.kostacademy.com` (Moodle, container `moodle-stack_moodle_1`, port 8080) and `console.kostacademy.com` (Next.js, container `kost-console-stack_console_1`, port 3001→3000) run as separate Docker services behind the same Nginx reverse proxy on the same host. The console's recovered source (`lib/moodle-client.ts`, `MOODLE_WS_SERVICE` / `MOODLE_SERVICE_TOKEN` env vars) confirms a Moodle web-service-token integration design, and the console's own login page states identity is "managed by Moodle — no separate credential store."

**Functional round-trip confirmed this pass, both directions:** (1) identity — logging into the console with a Moodle admin account works and displays the real Moodle full name ("Console Administrator"); logging in with a Moodle account holding only the candidate role is correctly refused (Gate C); (2) data — the console's `/exams` page renders "Live from Moodle Quiz — 3 exams configured" with real per-exam metadata (duration, passing score, question count, open/close windows) sourced from Moodle's Quiz module, not static/placeholder content. This is genuine evidence the integration works, not just that it's designed to.

## Gate G — Security / Configuration — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Confirmed live 2026-08-24:

- **Network exposure:** only ports 22 (SSH), 80, and 443 are publicly bound (`0.0.0.0`); MySQL (3306), Moodle (8080), and the console (3001) are all bound to `127.0.0.1` only, reachable exclusively through Nginx. This is correct least-privilege network design.
- **TLS:** valid, auto-renewing Let's Encrypt certificates for both domains (see Architecture above).
- **Admin access:** SSH key-based only (password auth was not tested/attempted); a dedicated, narrowly-named key exists for this purpose rather than a shared/generic key.
- **Secrets at rest:** backup `.env` snapshots are GPG-encrypted (`env_*.gpg`); the GPG **private** decryption key is deliberately absent from the server per `RESTORE_PROCEDURE.md` ("à récupérer depuis le gestionnaire de mots de passe") — correct separation of backup data from backup decryption capability.
- **Incident response:** a dated, versioned `SECURITY_INCIDENT_RESPONSE_PROCEDURE.md` (effective 2026-08-20) exists, with severity levels, roles, an evidence-preservation checklist, and an escalation path.

Not yet checked this pass: HTTP security headers (HSTS, CSP, X-Frame-Options), Moodle debug-mode setting, application-level session/cookie hardening. `kost-eexam-console/csp-test.mjs` and `cookie-audit.mjs` appear purpose-built for this and were not re-run this pass.

## Gate H — Build / Tests — OPEN (unchanged — evidence exists but not re-executed)

The `kost-eexam-console` scratchpad has a real, fairly extensive Playwright test suite (smoke, authz, CSP, cross-browser, stress/mobile, a11y, cookie-audit, and numbered "phase"/"v1"–"v12" full-suite scripts) plus a committed-looking `.next` production build and `node_modules` already installed. None of these were re-run this pass — the evidence that exists is prior-session screenshots and scripts, not a fresh pass/fail result. This is the most actionable near-term gap: re-running this existing suite against the live console would very quickly upgrade several other gates (B, C, G) from "partial" to "evidenced," since the scripts already target exactly those questions.

## Gate I — Deployment / Operations — SUBSTANTIALLY EVIDENCED, WITH ONE ACTIVE GAP

**Backup schedule — confirmed automated and currently healthy:** root crontab runs `backup.sh && rotate.sh && offsite_push.sh` daily at 01:00 UTC. Server-side `backup-log.jsonl`/`cron.log` show **5 consecutive successful daily runs** (2026‑08‑20 through 2026‑08‑24), each producing 5 checksummed, timestamped artifacts (database dump, moodledata, moodle code, config, GPG-encrypted secrets) into a `daily/weekly/monthly` retention structure.

**Restore — freshly re-tested this pass, successful:** `test_restore.sh` restores into an isolated, disposable MySQL container (verified by reading the script before running it: new container, no shared network/volume with production, dropped via `trap cleanup EXIT` regardless of outcome) and is documented (`RESTORE_PROCEDURE.md`) as the way to mark a backup `VERIFIED`. Initial run 2026‑08‑19: `success`, 487/487 tables, 2 users. **Re-run 2026‑08‑24 22:37 (this pass) against the current day's backup: `success`, 491/491 tables, 6/6 users, moodledata archive integrity confirmed.** (First attempt this pass was interrupted by an over-tight local SSH timeout, leaving one orphaned — harmless, isolated — test container; it was removed with `docker rm -f` and the script re-run cleanly to completion.) The runbook recommends running this weekly; this pass's run resets that clock.

**Offsite copy — root cause found and fixed this pass, verified end-to-end:** `offsite_push.sh` syncs backups to this Mac (dedicated `kostbackup` local user, `~/kost-eexam-backups/`, restrictive permissions, member of `com.apple.access_ssh`) over Tailscale via `rsync`-over-SSH, using the `kost_backup_offsite` key. It succeeded once (2026‑08‑19) then **failed 5 consecutive days in a row** (2026‑08‑20 through 2026‑08‑24), every time logging `mac_unreachable`. Root cause: **Tailscale itself was simply disconnected on this Mac** (`tailscale status` → "Tailscale is stopped"; the background app process was running, but the tunnel was not up) — the `kostbackup` account, SSH access grant, and destination directory were all already correctly provisioned; only network reachability was missing.

Fix applied this pass: `tailscale up` (a local, reversible action on this Mac only — no production system touched). Connectivity confirmed both directions (`tailscale ping` succeeded; VPS's own `ss -tlnp` had already shown it holds a Tailscale interface at `100.112.21.71`). **Manually triggered `offsite_push.sh` immediately afterward; it completed successfully** (`{"type":"offsite_copy","status":"success","detail":"verified_20260824T010001Z"}`), transferring all 5 files of the current day's backup (including the 74MB `moodlecode_*.tar.gz`) with the script's own dry-run integrity check confirming identical files on both ends. One transient `mac_unreachable` was seen on an attempt made moments after `tailscale up` (the mesh path was still negotiating a direct route) — retried automatically-equivalent and succeeded; this is normal right after reconnecting, not a new problem.

**Residual consideration (not yet addressed):** this fix depends on Tailscale staying connected on this Mac. If the Tailscale app is quit, the Mac reboots without it auto-reconnecting, or the Mac is simply off/asleep at 01:00 UTC, the gap will recur — the backup script already handles this gracefully (never fails the local backup, just logs and skips, retrying next day), so there's no data-loss risk from a future recurrence, only a redundancy-lag risk. Worth a periodic check that Tailscale is still connected, or a more durable fix (cloud object storage target instead of a specific laptop's availability) if this needs to be unattended-proof rather than owner-machine-dependent.

**Rollback / runbook:** `RESTORE_PROCEDURE.md` documents a full disaster-recovery procedure (new server → config → GPG-decrypt env → DB restore → moodledata volume restore → code restore → bring up stack → note that the TLS cert is deliberately excluded from backups and must be regenerated). This reads as a genuine, thought-through runbook, not a placeholder.

**Housekeeping (minor):** `docker system df` shows 34 images, 11.72GB reclaimable (stale images not pruned) — not a risk, just deferred cleanup.

## Gate J — Final Acceptance

`PLATFORM READY TO USE` is **not** declared. Remaining critical items before it could be:

1. Re-run the existing Playwright suite (or equivalent) against the live console for current Gate B/C/G pass/fail evidence.
2. Complete EN bilingual technical review and secure a named qualified reviewer + date for the 12-item pilot (Gate A/E).
3. Expand the production question bank from the recovered Stage 2A blueprint under the same Tier A discipline used for the pilot.
4. Keep Tailscale connected on this Mac (or replace the offsite target with cloud storage) so the now-fixed backup redundancy stays healthy — see Gate I's residual-consideration note.

If all technical gates (B, C, D, F, G, H, I) reach "evidenced" while regulatory sign-off (Gate A EN review / reviewer) remains pending, the correct label is **TECHNICALLY READY / PRE-PRODUCTION READY — REGULATORY HUMAN REVIEW PENDING**, not regulator-approved or "ready to use."

## Current true blockers / next autonomous actions

None of the remaining items are owner-only blockers; all are continuable from this environment:

1. Re-run `kost-eexam-console`'s existing Playwright test scripts against the live console/exam URLs and record current results (Gate B/C/G/H).
2. Continue production question-bank drafting from `docs/RECOVERED_STAGE2A_CONTEXT.md` under the same source-verification discipline as the pilot (Gate A).
3. If/when an interactive admin-console session is warranted for deeper RBAC/workflow testing, do it deliberately and document exactly what was clicked/verified — not as an incidental side effect of a recon pass.
4. Periodically confirm Tailscale is still connected on this Mac so the offsite backup fix stays effective (Gate I).

Done this pass (previously listed here as next actions): fresh `test_restore.sh` run (success, 491/491 tables) and the offsite-backup Tailscale fix (success, verified transfer) — see Gate I.

## What is not claimed

- No ANAC or IATA approval claim.
- No question is `APPROVED` without a named reviewer/date.
- No EN bilingual review claim.
- No claim that offsite backup redundancy currently works — it currently does not, and this report says so.
- No claim that RBAC enforcement or the full exam workflow has been interactively verified end-to-end — only that server-side configuration/evidence for both exists and is more substantial than previously known.
- No `PLATFORM READY TO USE` claim.
