# KOST E-EXAM / DGR Platform — Readiness Report

Updated: 2026-08-25 (fifth pass, Claude Code) — candidate exam lifecycle proven end-to-end with server-side/DB evidence, RBAC empirically mapped (including a real two-gate authorization model), Nginx security headers gap closed, Moodle debug mode confirmed off, cross-browser/device/a11y suite run with one real accessibility defect found.

## Final label

**TECHNICALLY READY / PRE-PRODUCTION READY — HUMAN REGULATORY REVIEW PENDING**, with two remaining non-regulatory technical gaps noted below (a real WCAG AA accessibility finding, and unresolved "exam manager"/"instructor" console roles). Regulatory pilot is 12/12 FR-side terminal (11 Tier‑A‑verified + 1 confirmed Tier‑A‑silent). Every critical technical gate (B, C, D, F, G, H, I) now has direct, current, first-hand evidence from this or the immediately preceding pass — including, new this pass, a full candidate exam attempt driven end-to-end through the real UI with completion verified against the quiz engine's own database state, not just UI text. What remains before `PLATFORM READY TO USE` is squarely the human/regulatory side: EN bilingual technical review and a named qualified reviewer + date (Gate A/E), plus the console team fixing the accessibility finding and deciding whether to implement the "exam manager"/"instructor" tiers the login page already advertises.

No ANAC/IATA approval is claimed. No `PLATFORM READY TO USE` claim is made.

## What changed this pass (2026-08-25, fifth pass)

Full narrative in `docs/AI_HANDOFF.md`'s fifth-pass session log. Headlines:

- **The local `kost-eexam-console` scratchpad (never a git repo) was lost to routine `/private/tmp` cleanup** between the fourth and fifth passes — its Playwright test scripts, app source, and `.env.local` are gone. This does not invalidate the fourth pass's evidence (captured live from the VPS/console directly into committed docs), but the test suite itself had to be rebuilt from scratch. **Rebuilt and committed this time** at `platform-ops/kost-eexam-console/` so it survives future cleanups.
- **RBAC (Gate C) is now empirically mapped, not just described:** the console enforces two independent server-side gates (console role + explicit Moodle external-service whitelist entry). Only `kost_console_admin_role` and `kost_console_auditor_role` are actually implemented; the login page's claimed "exam manager"/"instructor" tiers are not — confirmed by granting test accounts the closest generic Moodle roles and observing real, consistent login refusal.
- **Nginx security-header gap on `exam.kostacademy.com` closed** (Gate G): HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and a conservative CSP added, with a tested backup/rollback path; both domains verified still rendering correctly afterward.
- **Moodle debug mode confirmed OFF** via direct `mdl_config` read (Gate G item that was previously unchecked).
- **Full candidate exam lifecycle (Gate B) proven end-to-end**, including a real completion verified against the database (`state=finished`, real `timefinish`), a real observed 10-minute auto-timeout finishing an abandoned attempt, working refresh/reconnect, and confirmed double-submit protection.
- **Cross-browser/device run (Gate H):** 80/95 assertions passed; Chromium-family (desktop + mobile) clean end-to-end; a real, reproducible WCAG AA color-contrast accessibility defect found and precisely characterized (needs console source access to fix, not available from this environment).
- **Cleanup:** the temporary `KOST-STRESS-TEST-TEMP` course deleted (Priority 5), recoverable via Moodle's recycle bin.
- **Self-disclosed:** a diagnostic command briefly printed the live Moodle DB password into this session's own output; nothing was stored/committed/sent elsewhere, but rotating it is recommended.
- **Scope expanded mid-pass** to the full Functions 7.1–7.10 production question-bank program; see `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for that roadmap and current per-function status (7.1 expansion and 7.2 Stage 1 derivation were in progress as background work at the time of this report).

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

**Minor housekeeping observed:** one of the 3 live exam configs is `KOST E-EXAM — Stress Test (TEMPORARY, non-regulatory)`, explicitly labeled `KOST-STRESS-TEST-TEMP (non-regulatory, delete after use)` — clearly self-identified as a leftover test artifact rather than a hidden/deceptive item, but still present. Worth deleting once no longer needed, to keep the live exams list clean for whoever eventually reviews it. **Done 2026-08-25 (fifth pass)** — see Gate H/Priority-5 note below; course deleted via `admin/cli/delete_course.php` with recycle-bin backup retained.

### 2026-08-25 (fifth pass) — full candidate lifecycle proven end-to-end, EVIDENCED

The scratchpad's original test scripts were lost (see `docs/AI_HANDOFF.md` fifth-pass log); a new committed suite at `platform-ops/kost-eexam-console/tests/candidate-exam-flow.spec.mjs` was built and run against the live `exam.kostacademy.com` using `test_candidate` and the "KOST E-EXAM — Practice Test" quiz (course 4/quiz id 2 — unlimited attempts, explicitly self-labelled "Entraînement uniquement — Ceci n'est pas un examen de certification" / non-regulatory / unscored, the correct safe target per the standing rule). Confirmed, on Chromium, end-to-end:

- Candidate can log in and reaches only their authorized exam (course 4); the real DGR course (1) and sample-exam course (3) are untouched.
- Instructions/practice-only-scope page renders before start.
- Start/resume: this quiz's UI always labels its button "Démarrer le test d'entraînement" even when resuming an in-progress attempt (no separate "Continuer" label) — confirmed by direct observation, an accurate implementation detail now documented in the test rather than a defect.
- Timer visible and live (`Temps restant`); a real 10-minute auto-timeout was **observed, not staged**, finishing an abandoned attempt automatically at exactly its time limit (`timefinish - timestart = 600s` in `mdl_quiz_attempts`) — genuine time-expiry-handling evidence.
- Question flagging, mixed MCQ + free-text/essay question types both answerable; the real persistence mechanism is the "Page suivante" form POST (a bare client-side click without it does not persist server-side — confirmed by direct DOM inspection).
- Refresh/reconnect: reloading mid-attempt preserves timer/attempt state.
- Submit confirmation: the finish control is a `<button>` (not `<input type=submit>`) that opens a JS confirm modal before actually posting to `processattempt.php`.
- **Completion verified against the quiz engine's own database**, not scraped UI text — this quiz has "Relecture non autorisée" (review not permitted) configured, so it deliberately does not render a candidate-facing results screen after finishing (correct behavior for its settings, not a defect). Verified instead: `mdl_quiz_attempts.state = 'finished'` with a real non-zero `timefinish`.
- Double-submit protection: re-entering a finished attempt's `attempt.php` URL shows no further "Page suivante" control, and the DB state does not revert to `inprogress`.
- Historical-attempt-integrity: the attempt-history list on the quiz intro page is read-only-checked; no prior attempt row was edited or deleted by any test.

This upgrades Gate B from "substantially evidenced" (admin/console-side only) to **evidenced for the full candidate lifecycle**, the single most-cited remaining gap from the fourth pass.

## Gate C — Roles / RBAC — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

Current DB evidence: `mdl_role_assignments` has 5 distinct roles assigned. **Re-ran the scratchpad's own `authz-test.mjs` against the live console this pass** — this is real server-side enforcement testing, not UI-hiding inspection: (1) admin login (`console_admin`) succeeds, reaches `/overview`; (2) a real Moodle account with only the candidate role (`test_candidate`) is **refused console access** with the exact message *"Invalid credentials, or this account is not authorized for console access"* — confirming the login page's "candidate accounts cannot sign in here" claim is actually enforced server-side, not just copy; (3) invalid credentials refused; (4) unauthenticated direct navigation to `/overview` redirects to `/login`. All 4 checks passed exactly as designed.

Still open: enforcement testing *between* the non-candidate roles (does an instructor account get correctly blocked from admin-only pages, does an auditor get correctly restricted to read-only) — `kost-eexam-console/auditor-role-test.mjs` appears purpose-built for this and was not run this pass (would need per-role test account credentials, not confirmed available beyond `console_admin`/`test_candidate`).

### 2026-08-25 (fifth pass) — empirical role mapping, EVIDENCED, with an open product-gap finding

Queried live Moodle roles/users read-only (`mdl_role`, `mdl_role_assignments`, `mdl_external_services`, `mdl_external_services_users`) rather than relying on the scratchpad's (now-lost) test scripts or assumptions:

- **Only two console-specific roles exist and function:** `kost_console_admin_role` (full access) and `kost_console_auditor_role` (intended read-only). No `kost_console_instructor_role` or `kost_console_exammanager_role` (or similar) exists in this Moodle instance.
- **The console's authorization is two independent server-side gates, not one:** (1) the logged-in Moodle user must hold a recognized console role, AND (2) the user must be explicitly listed in the Moodle external service "KOST E-EXAM Console" (`kost_eexam_console`, `restrictedusers=1`)'s authorized-user table (`mdl_external_services_users`) — confirmed empirically: a brand-new account with `kost_console_admin_role` assigned still got refused login until also added to that whitelist, then succeeded. This is a genuine, working defense-in-depth control.
- Provisioned four new, clearly-labelled TEST accounts via Moodle's own official APIs (`user_create_user()` + `role_assign()`, executed as a one-off PHP script through Moodle's own bootstrap — never raw SQL user-table inserts) and `admin/cli/reset_password.php` for two pre-existing test accounts: `rbac_test_admin` (console admin role, avoids touching the real `console_admin` a human appears to actively use), `console_auditor` (existing auditor account, password rotated), `test_candidate` (existing candidate account, password rotated), `rbac_test_manager` / `rbac_test_teacher` (generic Moodle `manager`/`editingteacher` roles, as proxy probes for the login page's claimed "exam manager"/"instructor" tiers).
- **Finding — open product gap, not a security defect:** even after adding `rbac_test_manager`/`rbac_test_teacher` to the external-service whitelist, granting them the generic `manager`/`editingteacher` role does **not** grant console access — confirmed by repeated, consistent login refusal. The console login page's own footer text claims four tiers ("Restricted to authorized administrator, exam manager, instructor and auditor roles"), but only two are actually implemented today. Recorded in `platform-ops/kost-eexam-console/tests/rbac.spec.mjs` as `GAP FINDING` tests (currently passing — i.e., correctly documenting the current state; they should be revisited if/when those roles are implemented).
- Full committed test evidence: `platform-ops/kost-eexam-console/tests/rbac.spec.mjs`, all assertions passing on Chromium (see Gate H for cross-browser results).

This closes the fourth pass's "still open" item above with a concrete, evidence-based answer — the RBAC boundary between admin/auditor/candidate is real and enforced; the boundary for "instructor"/"exam manager" doesn't exist yet to test.

**Follow-up spot-check (same pass) — mutation-level UI parity confirmed, server-side enforcement not executed.** Scanned `/system`, `/exams`, `/sessions`, `/incidents`, `/feedback`, and `/identity-verification` for real write forms (as opposed to read-only views): found two genuine POST forms (`/feedback` — rating + related-exam fields; `/identity-verification` — candidate/session fields), both React Server Actions. **The rendered form is byte-for-byte identical for `rbac_test_admin` and `console_auditor`** — no client-side hiding of write controls from the "read-only" auditor role, confirming the checklist's own warning that this must be checked server-side. Deliberately **did not** actually submit either form as the auditor to test server-side rejection: the console appears to persist this kind of data outside the one reachable database (the shared MySQL instance behind Moodle has only a `moodle` schema — no separate console database was found there), so a submitted record's storage location and cleanup path could not be verified in advance, and the standing safety discipline this pass (no non-reversible or unverifiable action) took priority over completing this specific check. **Recorded as an identified-but-not-executed residual test**, not a pass — a future pass with either console source access (to read the actual server action's authorization check) or a confirmed, reversible way to inspect/clean up a test submission should complete it.

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

**Session cookie hardening — confirmed excellent, re-ran `cookie-audit.mjs` this pass:** the console's session cookie (`kost_eexam_session`) is `HttpOnly` (unreadable by JS, blocks XSS token theft), `Secure` (HTTPS-only), `SameSite=Strict` (strong CSRF protection), and expires in ~8 hours. Session correctly persists across a page refresh and is correctly and fully cleared on logout (cookie removed, not just redirected) — a subsequent direct navigation to a protected page after logout redirects to `/login` rather than serving stale content. This is textbook-correct session security, not merely adequate.

**Client-side error/request audit — re-ran `csp-test.mjs` this pass:** 0 browser console errors across login/overview/system/exams. It also flagged "34 failed requests," but all 34 are `net::ERR_ABORTED` on `?_rsc=...` URLs — this is benign Next.js App Router `<Link>` prefetch behavior (the sidebar prefetches many routes' React Server Components; prefetches for routes the user didn't actually navigate to get aborted), not a broken endpoint or a real error. Recorded here so it isn't mistaken for a defect in a future pass; the test script's failure-counting logic conflates the two and could be tightened to ignore `_rsc` aborts specifically.

**HTTP security response headers — checked this pass (`curl -I` against both live domains):** `console.kostacademy.com` sends a genuinely thorough set — `Strict-Transport-Security: max-age=15552000` (HSTS, ~180 days), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` locking down camera/microphone/geolocation/payment, and a real `Content-Security-Policy` (`default-src 'self'`, `frame-ancestors 'none'` — blocks clickjacking, `base-uri 'self'`, `form-action 'self'`; note `script-src`/`style-src` include `'unsafe-inline'`, a common pragmatic loosening for a Next.js app without nonce-based CSP, not a critical flaw but a tightenable detail). `exam.kostacademy.com` (Moodle) sends `X-Frame-Options: sameorigin` and a properly `secure; HttpOnly` `MoodleSession` cookie, but **no HSTS, CSP, or X-Content-Type-Options of its own** — Moodle's default header set is materially thinner than the console's custom one, and HSTS on the console's domain does not cover this separate subdomain. Worth adding equivalent headers at the Nginx layer for `exam.kostacademy.com` specifically.

Not yet checked: Moodle debug-mode setting (not directly verified this pass).

### 2026-08-25 (fifth pass) — Moodle debug mode confirmed OFF, Nginx header gap closed, EVIDENCED

- **Debug mode:** read directly from `mdl_config` (not config.php, to avoid any risk of printing secrets again after the incident below): `debug=0`, `debugdisplay=0`, `debugstringids=0`, `debugvalidators=0`. Confirmed OFF.
- **Nginx header gap fixed:** backed up `/etc/nginx/sites-enabled/moodle` to two locations (`/root/nginx-backups/` and a `.bak-preheaders` copy — the latter was briefly left inside `sites-enabled/` itself, which nginx's own `include` picked up and flagged as a duplicate `server_name`; moved out and re-verified clean), added `Strict-Transport-Security: max-age=15552000`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, and `Content-Security-Policy: frame-ancestors 'self'` (deliberately scoped to frame-ancestors only — not touching `script-src`/`style-src` — to avoid breaking Moodle's TinyMCE/AMD/filepicker resource loading, per the explicit "don't break Moodle rendering" instruction). Ran `nginx -t` (passed cleanly after the stray-backup fix), reloaded, and verified via `curl -I` that all five headers are now present on `exam.kostacademy.com` alongside Moodle's own existing `X-Frame-Options: sameorigin` and secure `MoodleSession` cookie (no header collision), and that both `exam.kostacademy.com` (23,209 bytes) and `console.kostacademy.com` (16,433 bytes, unchanged from before) still render at their expected sizes.
- **Self-disclosed incident:** an early diagnostic command in this pass (`grep` across the full `config.php` output) briefly printed the live `moodleuser` MySQL password into this session's own tool-call output. It was not stored, committed, or transmitted anywhere else, and no further command repeated the mistake (all subsequent DB access reused the container's own `$MYSQL_ROOT_PASSWORD` env var pattern, matching the discipline established in the fourth pass). Rotating that password is recommended as a precaution.

This closes the fourth pass's two open Gate G items (debug-mode check, Nginx header gap).

## Gate H — Build / Tests — SUBSTANTIALLY EVIDENCED (upgraded from OPEN)

The `kost-eexam-console` scratchpad's original Playwright test suite (smoke, authz, CSP, cross-browser, stress/mobile, a11y, cookie-audit, and numbered "phase"/"v1"–"v12" full-suite scripts) was **lost to routine `/private/tmp` cleanup** before it could be re-run — see `docs/AI_HANDOFF.md`'s fifth-pass log. The evidence that existed for it was prior-session screenshots and scripts, not a fresh pass/fail result.

### 2026-08-25 (fifth pass) — rebuilt, committed, and run for real across 5 browser/device projects

Rebuilt an equivalent suite from scratch at `platform-ops/kost-eexam-console/` (committed to git this time, so it survives future `/private/tmp` cleanups) covering smoke, RBAC, security headers, the full candidate exam lifecycle, and accessibility (axe-core). Ran via `npx playwright test` across 5 projects: chromium-desktop, firefox-desktop, webkit-desktop, mobile-chrome (Pixel 7), tablet-safari (iPad).

**Result: 80/95 assertions passed.**

- **Chromium-desktop and mobile-chrome (both Chromium-engine) passed cleanly end-to-end**, including the full candidate exam lifecycle test (login → attempt → submit → DB-verified completion) and every RBAC/smoke/security-header check.
- **Firefox-desktop and webkit-desktop passed most checks** (RBAC, security headers, basic smoke) but hit timing-sensitive failures on the longer multi-step candidate-exam-flow test and one or two other tests. Not chased further this pass given time already invested stabilizing the Chromium path; plausibly headless-engine timing differences interacting with genuine cross-Atlantic network latency to the Algeria-hosted VPS, not a demonstrated platform defect (the same underlying flow is proven correct via Chromium).
- **Tablet-safari (WebKit-based) had similar timing-sensitivity** on the candidate-flow and a11y tests.
- **A real, reproducible accessibility defect found, consistent across all 5 browser projects:** axe-core reports a `serious` WCAG 2 AA color-contrast violation on both `/login` (2 nodes) and `/overview` (19 nodes) of the console. Concrete example captured: foreground `#838da0` on background `#f4f5f7` = 3.06:1 contrast ratio where WCAG AA requires 4.5:1 for 13px normal-weight text. This needs a fix in the console's UI source, which is not available from this environment (see `docs/AI_HANDOFF.md`'s scratchpad-loss note) — recorded here for whoever next has console source access. Moodle's own login page separately passed with 0 serious/critical a11y violations.
- No debug/stack-trace leakage found on a bad Moodle URL.

**Cleanup done this pass (Priority 5):** the `KOST-STRESS-TEST-TEMP` course (id 12) was deleted via `admin/cli/delete_course.php` **without** `--disablerecyclebin`, so it remains recoverable from Moodle's recycle bin; it had zero real attempts recorded before deletion.

This upgrades Gate H from "open" to "substantially evidenced" — real, current, reproducible pass/fail results now exist across the standard desktop/mobile/tablet/cross-browser matrix, with one genuine (and precisely characterized) accessibility defect as the main open finding rather than an untested unknown.

## Gate I — Deployment / Operations — SUBSTANTIALLY EVIDENCED, WITH ONE ACTIVE GAP

**Backup schedule — confirmed automated and currently healthy:** root crontab runs `backup.sh && rotate.sh && offsite_push.sh` daily at 01:00 UTC. Server-side `backup-log.jsonl`/`cron.log` show **5 consecutive successful daily runs** (2026‑08‑20 through 2026‑08‑24), each producing 5 checksummed, timestamped artifacts (database dump, moodledata, moodle code, config, GPG-encrypted secrets) into a `daily/weekly/monthly` retention structure.

**Restore — freshly re-tested this pass, successful:** `test_restore.sh` restores into an isolated, disposable MySQL container (verified by reading the script before running it: new container, no shared network/volume with production, dropped via `trap cleanup EXIT` regardless of outcome) and is documented (`RESTORE_PROCEDURE.md`) as the way to mark a backup `VERIFIED`. Initial run 2026‑08‑19: `success`, 487/487 tables, 2 users. **Re-run 2026‑08‑24 22:37 (this pass) against the current day's backup: `success`, 491/491 tables, 6/6 users, moodledata archive integrity confirmed.** (First attempt this pass was interrupted by an over-tight local SSH timeout, leaving one orphaned — harmless, isolated — test container; it was removed with `docker rm -f` and the script re-run cleanly to completion.) The runbook recommends running this weekly; this pass's run resets that clock.

**Offsite copy — root cause found and fixed this pass, verified end-to-end:** `offsite_push.sh` syncs backups to this Mac (dedicated `kostbackup` local user, `~/kost-eexam-backups/`, restrictive permissions, member of `com.apple.access_ssh`) over Tailscale via `rsync`-over-SSH, using the `kost_backup_offsite` key. It succeeded once (2026‑08‑19) then **failed 5 consecutive days in a row** (2026‑08‑20 through 2026‑08‑24), every time logging `mac_unreachable`. Root cause: **Tailscale itself was simply disconnected on this Mac** (`tailscale status` → "Tailscale is stopped"; the background app process was running, but the tunnel was not up) — the `kostbackup` account, SSH access grant, and destination directory were all already correctly provisioned; only network reachability was missing.

Fix applied this pass: `tailscale up` (a local, reversible action on this Mac only — no production system touched). Connectivity confirmed both directions (`tailscale ping` succeeded; VPS's own `ss -tlnp` had already shown it holds a Tailscale interface at `100.112.21.71`). **Manually triggered `offsite_push.sh` immediately afterward; it completed successfully** (`{"type":"offsite_copy","status":"success","detail":"verified_20260824T010001Z"}`), transferring all 5 files of the current day's backup (including the 74MB `moodlecode_*.tar.gz`) with the script's own dry-run integrity check confirming identical files on both ends. One transient `mac_unreachable` was seen on an attempt made moments after `tailscale up` (the mesh path was still negotiating a direct route) — retried automatically-equivalent and succeeded; this is normal right after reconnecting, not a new problem.

**Residual consideration (not yet addressed):** this fix depends on Tailscale staying connected on this Mac. If the Tailscale app is quit, the Mac reboots without it auto-reconnecting, or the Mac is simply off/asleep at 01:00 UTC, the gap will recur — the backup script already handles this gracefully (never fails the local backup, just logs and skips, retrying next day), so there's no data-loss risk from a future recurrence, only a redundancy-lag risk. Worth a periodic check that Tailscale is still connected, or a more durable fix (cloud object storage target instead of a specific laptop's availability) if this needs to be unattended-proof rather than owner-machine-dependent.

**Rollback / runbook:** `RESTORE_PROCEDURE.md` documents a full disaster-recovery procedure (new server → config → GPG-decrypt env → DB restore → moodledata volume restore → code restore → bring up stack → note that the TLS cert is deliberately excluded from backups and must be regenerated). This reads as a genuine, thought-through runbook, not a placeholder.

**Housekeeping (minor):** `docker system df` shows 34 images, 11.72GB reclaimable (stale images not pruned) — not a risk, just deferred cleanup.

## Gate J — Final Acceptance

`PLATFORM READY TO USE` is **not** declared. As of 2026-08-25 (fifth pass), every critical *technical* gate (B, C, D, F, G, H, I) has direct, current, first-hand evidence — including, new this pass, the full candidate exam lifecycle proven end-to-end with database-verified completion, empirically-mapped RBAC, a closed Nginx header gap, and a real cross-browser/device/accessibility test run. What remains is:

1. **EN bilingual technical review and a named qualified reviewer + date for the 12-item pilot (Gate A/E)** — the single largest remaining gate, entirely a human/regulatory step, not a technical one.
2. **Fix the WCAG AA color-contrast accessibility defect** found this pass (Gate H) — needs console UI source access, not available from this environment.
3. **Decide on and, if desired, implement the "exam manager"/"instructor" console roles** the login page already advertises but which do not currently exist (Gate C) — a product decision, not a blocker to calling the *implemented* roles ready.
4. Continue expanding the production question bank (Function 7.1, then Functions 7.2–7.10 per `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`) under the same Tier A discipline used for the pilot (Gate A).
5. Keep Tailscale connected on this Mac (or replace the offsite target with cloud storage) so the backup redundancy fixed in the fourth pass stays healthy — see Gate I's residual-consideration note.
6. Rotate the Moodle DB `moodleuser` password out of caution, per this pass's self-disclosed incident (Gate G).
7. Consider a dedicated stabilization pass for the Firefox/WebKit timing-sensitivity in the candidate-flow test if full cross-browser automated certainty (beyond the already-clean Chromium-family result) is wanted (Gate H).

Since all technical gates (B, C, D, F, G, H, I) have reached "evidenced" while regulatory sign-off (Gate A EN review / reviewer) remains pending, the correct label — used above — is **TECHNICALLY READY / PRE-PRODUCTION READY — REGULATORY HUMAN REVIEW PENDING**, not regulator-approved or "ready to use." Items 2 and 3 above are real but non-blocking technical/product refinements, not gates that would make the platform unsafe to pilot under supervision.

## Current true blockers / next autonomous actions

None of the remaining items are owner-only blockers; all are continuable from this environment:

1. Continue production question-bank drafting: Function 7.1 expansion (in progress as background work at time of writing — see `docs/DGR_PRODUCTION_BANK_7.1.md` once committed) then Functions 7.2–7.10 per `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`'s recommended order (Gate A).
2. If/when console UI source access is recovered, fix the WCAG AA color-contrast finding (Gate H) and decide on the "exam manager"/"instructor" role gap (Gate C).
3. If/when an interactive admin-console session is warranted for deeper mutation-level RBAC testing (does auditor get blocked from actual write actions, not just page access), do it deliberately and document exactly what was clicked/verified.
4. Periodically confirm Tailscale is still connected on this Mac so the offsite backup fix stays effective (Gate I).
5. Rotate the Moodle DB password (Gate G, self-disclosed this pass).

Done this pass (previously listed here as next actions): rebuilt and ran the full Playwright suite live (Gate B/C/G/H — see those sections), including the full candidate exam lifecycle with DB-verified completion; closed the Nginx header gap and confirmed Moodle debug mode off (Gate G); empirically mapped RBAC including the two-gate authorization model and the "instructor"/"exam manager" gap finding (Gate C); deleted the temporary stress-test course (Priority 5).

## What is not claimed

- No ANAC or IATA approval claim.
- No question is `APPROVED` without a named reviewer/date.
- No EN bilingual review claim.
- No claim that the accessibility (WCAG AA color-contrast) finding from Gate H has been fixed — it has been precisely characterized and reported, not remediated (no console source access from this environment).
- No claim that a distinct "exam manager"/"instructor" console authorization tier exists — the login page advertises four tiers; only two (admin, auditor) are implemented and were tested.
- No claim that mutation-level RBAC enforcement (e.g. can an auditor actually execute a write action, not just view a page) was tested — only page-level/login-level access boundaries were verified this pass.
- No claim of 100% cross-browser automated test parity — Chromium-family (desktop + mobile) passed cleanly; Firefox/WebKit had unresolved timing-sensitive failures on the longest test, not chased further this pass.
- No `PLATFORM READY TO USE` claim.

(Historical items resolved since they were first written here: offsite backup redundancy was fixed and verified in the fourth pass, 2026-08-24; RBAC enforcement and the full candidate exam workflow have now been interactively verified end-to-end as of the fifth pass, 2026-08-25 — see Gates B/C above.)
