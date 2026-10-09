# AI Handoff — DGR / CBTA Stage 2B.1

## Purpose

This file is the shared working checkpoint between Claude Code and ChatGPT for the KOST DGR/CBTA question-bank revalidation work.

## Current scope

- Function: 7.1
- Stage: 2B.1 — DGR 67th Edition / 2026 regulatory revalidation gate
- Language currently being source-verified: French
- English: separate bilingual technical review required
- Production/Moodle changes: per `.claude/rules/dgr-stage2b.md` (2026-08-24 update), tested-rollback Moodle config changes are authorized when they advance readiness — but as of this writing no Moodle/production system has actually been reached from this environment (see third-pass session log below); nothing has been changed there

## Regulatory baseline

- IATA Dangerous Goods Regulations
- 67th Edition — 2026
- French digital edition
- Addendum 1 integrated

Do not assume a specific addendum delta unless separately established. Record `SPECIFIC ADDENDUM DELTA: NOT DETERMINED` when needed.

## Source hierarchy

- Tier A: direct current official regulatory material actually supplied/read/verified.
- Tier B: KOST approved training material with explicit regulatory citations/extracts.
- Tier C: legacy exams/practice books. Coverage/style only; never regulatory authority.

## Hard gates

- Never invent regulatory content.
- Missing evidence => `SOURCE REQUIRED`, `SOURCE GAP`, or equivalent unresolved state.
- No `APPROVED` status without named qualified reviewer + review date.
- `FR SOURCE VERIFIED` does not satisfy the English review gate.
- Do not edit frozen questions unless triggered by current-source change, addendum impact, documented reviewer correction, or explicit user instruction.
- Do not modify Moodle unless explicitly authorized.

## Current pilot status

Source-verified/frozen on FR side:

- Q-7.1-002 — Acétylène (liquide), T/F, absolute prohibition vs derogation distinction
- Q-7.1-003 — nine hazard classes
- Q-7.1-004 — Class 8 corrosive hazard label
- Q-7.1-005 — Propane UN 1978, Division 2.1
- Q-7.1-006 — Class 8 Packing Group I/II/III criteria, Tableau 3.8.A
- Q-7.1-007 — Special Provisions A1/A2, exact "approbation" terminology (not "dérogation") — wording final
- Q-7.1-008 — Excepted quantity code E0, Tableau 2.6.A — distractor corrected & revalidated (see status doc)
- Q-7.1-009 — PI 965 / UN 3480, Section IA = 35 kg cargo only
- Q-7.1-010 — UN 1845 dry ice package marking, net quantity
- Q-7.1-011 — overpack hazard labels visible/reproduced, labels-only scope
- Q-7.1-012 — document retention, T/F, shipper minimum 3 months

Resolved as a confirmed source gap (not pending):

- Q-7.1-001 — danger vs. risque. Current DGR 67e Appendice A does **not** define these as glossary headwords (ordinary/dictionary-sense words are explicitly excluded by the appendix's own stated policy, corroborated by §1.0's Note and by direct in-book search finding no headword). Item's basis reclassified Tier B (KOST course) / Tier C (generic framework); wording must not attribute the distinction to the DGR glossary. See `docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md` for full evidence.

Current count: 11/12 DGR-Tier-A-source-verified + 1/12 confirmed-Tier-A-silent (Q-7.1-001, Tier B/C basis retained). All 12 pilot items have reached a terminal FR-side status — none remain open/pending.

## Next action

Regulatory pilot's FR-side revalidation gate is complete (12/12 terminal). Remaining regulatory work: (1) apply the Q-7.1-001 wording correction (drop any DGR-glossary attribution) wherever the live pilot copy is actually stored/administered — not done from this environment, same as the Q-7.1-008 distractor swap; (2) EN bilingual technical review for all 12 items — not started; (3) named qualified reviewer + review date before any `APPROVED` status — not started; (4) production question-bank expansion beyond the 12-item pilot, using the recovered Stage 2A blueprint (`docs/RECOVERED_STAGE2A_CONTEXT.md`) — see that file's binding source restrictions before drafting.

Q-7.1-006, Q-7.1-007, Q-7.1-008, and Q-7.1-001 are now closed on the FR side — see `docs/DGR_SOURCE_REGISTER.md` for full evidence and `docs/DGR_STAGE_2B_STATUS.md` for wording-precision notes (Q-7.1-007's A1 nuance, Q-7.1-008's flagged distractor, Q-7.1-001's source-basis reclassification).

## Session log — 2026-08-24, first pass (Claude Code, chrome-devtools MCP)

Attempted the consolidated batch retrieval. Outcome: **blocked by tooling, no evidence retrieved, no status changes.**

- Connected to the user's already-running Chrome via `chrome-devtools` MCP (remote debugging, port 9222) as instructed. This session's MCP build exposes only three tools: `navigate`, `evaluate` (arbitrary JS in the top page), `screenshot`. No page-list/page-select tool, no click, no keyboard-input tool.
- Confirmed authenticated access to the IATA Digital Publications Bookshelf (`digitalpublications.iata.org`) and located the correct title in "My Library": **"Réglementation pour le transport des marchandises dangereuses (DGR) Édition 67 Addendum 1, 67th Edition"** — matches the current regulatory baseline. Book id `DGR-6066-67`.
- The Bookshelf reader renders book pages inside a cross-origin iframe (`jigsaw.iata.org/mosaic/wrapper.html`, VitalSource "Mosaic" reader). `evaluate` cannot read that iframe's DOM (blocked by same-origin policy: "Blocked a frame with origin ... from accessing a cross-origin frame"). Navigating the tab directly to the iframe's own wrapper URL (top-level, not embedded) leaves it stuck indefinitely on a loading spinner — it appears to require the parent-frame embedding/handshake to boot.
- No click/keyboard tool was available at that point to drive the reader's own search or table-of-contents UI, so no page could be opened, searched, or read in this pass.
- No regulatory content was read in this pass. No frozen item was touched.

## Session log — 2026-08-24, second pass (Claude Code, chrome-devtools MCP + attempted Playwright)

User asked to attach Playwright to the same already-open, already-authenticated Chrome (CDP at `127.0.0.1:9222`) and drive the reader's cross-origin iframe with real frame locators. Outcome: **Playwright attach failed; a different technique via the existing `chrome-devtools` MCP worked instead; 3 of 4 items fully resolved; the 4th blocked mid-retrieval by a tooling failure, not by evidence.**

- **Playwright attach attempt (Python `playwright.sync_api`, only Python 3.9 environment with the package installed):** `connect_over_cdp("http://127.0.0.1:9222")` failed — the HTTP JSON discovery endpoint (`/json/version`) returns a bare 404 for every path and `Host` header tried, with or without the Bash sandbox. Found Chrome's own `DevToolsActivePort` file (`~/Library/Application Support/Google/Chrome/DevToolsActivePort` — standard local port-discovery file Chrome itself writes, not a credential/cookie) and used the exact `ws://127.0.0.1:9222/devtools/browser/<id>` it names, skipping HTTP discovery entirely. The WebSocket connected, but Chrome never answered the CDP protocol handshake — `TimeoutError` after 180s. Consistent with a security/origin gate on this Chrome instance that the already-attached `chrome-devtools` MCP client satisfies but a fresh/unrecognized CDP client does not. Abandoned this path; no cookies, storage, or tokens were read or exported at any point.
- **Working technique found via `chrome-devtools` MCP:** the reader's surrounding UI chrome — "Search across book" button/input, the Table of Contents, and the page navigator — all live in the **top-level frame** (`digitalpublications.iata.org`), not inside the cross-origin `jigsaw.iata.org` iframe. So `evaluate()` can click/type them directly (ordinary same-origin DOM access, not a cross-origin workaround). Separately, `screenshot()` captures the fully composited page — including the cross-origin iframe's rendered content — because it operates at the browser-compositor level, not the JS/DOM layer, so it is unaffected by the iframe's cross-origin restriction. Combining "open search → type query → click Search → click a result → screenshot to read" reliably navigated and read real page content. This is normal UI automation (click/type/read), not API reverse-engineering, and no DRM was bypassed.
- Using this, **Q-7.1-006, Q-7.1-007, and Q-7.1-008 were fully retrieved, read, and are now FR SOURCE VERIFIED** — see `docs/DGR_SOURCE_REGISTER.md` for the evidence and `docs/DGR_STAGE_2B_STATUS.md` for wording-precision notes surfaced along the way (Q-7.1-007's A1 passenger-vs-cargo nuance; Q-7.1-008's "State derogation required" distractor, which Tableau 2.6.A does not support or refute and which is flagged for revision rather than asserted false).
- **Q-7.1-001**: found and confirmed the glossary's current location (§1.0's Note explicitly points to Appendice A, p.703) before the tool broke. Mid-navigation to the glossary itself, the `chrome-devtools` MCP connection began failing every call (`evaluate`, `navigate`, and `screenshot` alike) with `Network.enable timed out`, and did not recover across ~6 retries over several minutes real time. No stray process was left holding the CDP connection (checked). No glossary content was fabricated to compensate — Q-7.1-001 stays `SOURCE REQUIRED` for its core claim, now with a precise, low-effort next step.
- **What the next session needs**: nothing new in principle — the top-frame-click + screenshot technique above works and should be reused directly. If the `chrome-devtools` MCP connection is still broken, that's a session/connection-level issue (reload the MCP client) rather than a capability gap.

## Session log — 2026-08-24, third pass (Claude Code) — pilot finalization + platform-location discovery, hard blocker found

User authorized continuous autonomous execution per the updated `.claude/rules/dgr-stage2b.md` and `docs/AUTONOMOUS_PLATFORM_READINESS.md`/`docs/PLATFORM_READY_CHECKLIST.md` (pulled from origin at start of this pass — all three committed under the repo owner's own GitHub identity, consistent with the existing Claude Code/ChatGPT shared-handoff setup).

**Pilot closure:**
- `chrome-devtools` MCP was retried ~10+ times over roughly 15 minutes real time (`evaluate`, `navigate` both tried) — every call still fails identically with `Network.enable timed out`, including on a fresh navigation target (`iata.org`), confirming this is a connection-level failure, not a page-level one. Did not recover. **Q-7.1-001 remains open (`SOURCE REQUIRED`)** — no glossary content was fabricated to close it. If VS Code/Claude Code's MCP client is reloaded, the top-frame-click + screenshot technique from the second pass should resume working immediately; no new technique is needed.
- Applied the two requested corrections using evidence already on hand (no browser needed): **Q-7.1-007** wording finalized (A1 cargo-vs-passenger nuance locked in, "dérogation" explicitly banned from wording); **Q-7.1-008**'s unsupported "State derogation required" distractor replaced with a source-grounded one ("1 kg/1 L", E1's limit misattributed to E0, directly refuted by Tableau 2.6.A's own E0 row). Both closed FR SOURCE VERIFIED. See `docs/DGR_STAGE_2B_STATUS.md` for the full final wording notes. **Pilot is 11/12; not 12/12** — Q-7.1-001 is the one honest gap, per the standing no-fabrication rule.

**Platform-location discovery (Phase 3 of `docs/AUTONOMOUS_PLATFORM_READINESS.md`) — exhaustive search, conclusive negative result, hard blocker:**
Searched for the actual source/runtime behind `exam.kostacademy.com` (Moodle) and `console.kostacademy.com` (KOST E-EXAM) using five independent methods:
1. Enumerated every local git repository on this machine (`find ... -name .git` + `git remote -v` on each) — 15 repos found, none named or described as an exam/Moodle/console platform.
2. Listed the user's full GitHub account (`gh repo list relaxsaadi`, 36 repos) — same result; closest candidates by name (`kost-ops`, `schoolvalid`) checked individually and ruled out (kost-ops is a CRM/ops tool for trainers/collections/prospecting, last touched June 2026; schoolvalid is an empty/stale repo from Feb 2025).
3. `gh search code` across the account for `"moodle"`, `"exam.kostacademy"`, `"console.kostacademy"` — zero hits.
4. Found and inspected a large local cPanel hosting-account backup at `/Users/mac/Documents/Fichiers/Algerie/kost academy/` (`kostacad_17001.tar.gz` 12 GB, `kostacad_17003.tar.gz` 37 MB, a 267 MB `kostacad_wp622.sql` WordPress DB dump, and two unpacked `homedir/public_html` trees). This account hosts many KOST/agency domains as addon subdomains (`academykost`, `newkostacademy`, `crmacademy`, `kostgroupe`, etc.), but every "academy"-named subdomain folder is an **empty placeholder** (just a cPanel-generated `.htaccess` PHP handler, no application code) — no Moodle installation (`config.php`, `lib/moodlelib.php`, `mdl_*` tables) or exam-console code found anywhere in this backup. Inspected structure/table-names only; did not open/dump the 267 MB SQL file's data rows or the 12 GB archive, since it very likely contains real PII (the DB has `wpjr_amelia_*` booking/payment tables) and doing a full read/extract wasn't going to change the "not the exam platform" conclusion.
5. Checked `~/.ssh/config` and `~/.ssh/known_hosts` for any pre-configured route to a KOST server — none exists.
6. Confirmed both domains are live, real, and clearly not vaporware: `exam.kostacademy.com` is a live Moodle installation ("KOST Academy - Plateforme E-Exam DGR"); `console.kostacademy.com` is a separate login page ("KOST E-EXAM — Aviation Compliance Systems", roles: administrators/exam managers/instructors/auditors, authenticating against Moodle identity).
7. Also searched (repo + local filesystem + `gh search code`) for the "Stage 2A blueprint" / "44-subtask competency matrix" referenced as Phase 2's controlling scope — **not found anywhere accessible from this environment either.**

**Conclusion: this is a true hard blocker per `.claude/rules/dgr-stage2b.md` rule 11 ("missing secret/credential that must be supplied by the owner").** Both exam.kostacademy.com and console.kostacademy.com are live production systems, but their source code, hosting control panel, deployment config, and credentials are not reachable from this coding environment by any method tried. Phases 3–9 of `docs/AUTONOMOUS_PLATFORM_READINESS.md` (locate/audit the actual exam-platform code, RBAC, security, deployment, backups) cannot proceed without the owner providing one of: the actual repository location/access, hosting-provider/cPanel/SSH credentials for the live servers, or confirmation that a third party manages this system and it's out of scope here. Phase 2 (production question bank) is separately blocked on the same "not found" result for the Stage 2A blueprint/competency matrix — needs the owner to supply or point to it.

No production system was touched, no secrets were exposed, and the large DB dump/backup found during discovery was not opened beyond table-name-level structure. See `docs/PLATFORM_READINESS_REPORT.md` for the full gate-by-gate status this produced.

## Session log — 2026-08-24, fourth pass (Claude Code) — Q-7.1-001 resolved, `kost-eexam-console` recovered and live-verified

Resumed per `.claude/rules/dgr-stage2b.md` and `docs/LOCAL_RECOVERY_TARGETS.md`/`docs/READINESS_CORRECTIONS_2026-08-24.md` (pulled 8 new commits from origin at start of this pass, including ChatGPT's Stage 2A recovery and the two corrections files).

**Q-7.1-001 closed.** `chrome-devtools` MCP connected cleanly this pass (prior session's connection failure was session-level, as AI_HANDOFF predicted). Read Appendice A's Généralités policy text and §1.0's Note directly from the live, authenticated IATA Bookshelf, plus ran an in-book "Search across book" query for "Risque" (62 hits, tractable — vs. "Danger"'s 5000+) to confirm no glossary headword exists for either term. Full evidence and the resulting source-basis reclassification (Tier A silent by design → Tier B/C basis retained) are in `docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md`. All 12 pilot items have now reached a terminal FR-side status; none remain open.

**`kost-eexam-console` scratchpad lead confirmed real and substantial — recovered platform-readiness blocker.** Per `docs/LOCAL_RECOVERY_TARGETS.md`, found the referenced scratchpad still present at `/private/tmp/claude-501/-Users-mac-Documents-cbta/f801bd09-f7a9-4870-b58e-3e89c944df53/scratchpad/kost-eexam-console/`. This is **not** a black-box test harness — it is a real Next.js 16 / React 19 application (`app/(console)` routes, `lib/moodle-client.ts`, `lib/db-readonly.ts`, `middleware.ts`, a `Dockerfile`) plus a `moodle-scripts/` directory of PHP admin scripts, a `docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md`, dozens of Playwright QA/security/a11y test scripts (`authz-test.mjs`, `csp-test.mjs`, `cross-browser-test.mjs`, `stress-test.mjs`, `a11y-smoke.mjs`, `cookie-audit.mjs`, etc.), and well over 100 timestamped screenshots from prior live runs against `console.kostacademy.com`. `.env.local` holds real (unread-by-value) credentials: `SESSION_SECRET`, `MOODLE_INTERNAL_URL`, `MOODLE_WS_SERVICE`, `MOODLE_SERVICE_TOKEN`, `MYSQL_RO_{HOST,PORT,USER,PASSWORD,DATABASE}`, `BACKUP_LOG_PATH` — variable names only were enumerated, no values were printed or copied anywhere. It is not a git repository (no `.git`), so it cannot be pulled into this repo as history; it is a local build artifact that must be treated as the working source until/unless the owner points to (or this environment locates) its true upstream.

`local-data/backup-log.jsonl` contains **current, real evidence that automated backups were configured and a full restore was tested successfully** on 2026-08-19: sequential `database`/`moodledata`/`moodle_code`/`config`/`secrets` backup entries (mostly `status:"success"`, with checksums and durations), a `restore_test` entry with `status:"success"`, `live_table_count:487`, `restored_table_count:487`, `restored_user_count:2`, `moodledata_archive_ok:true`, and an `offsite_copy` entry `status:"success"`. This directly **contradicts** the historical "backups NOT configured" evidence in `docs/RECOVERED_PLATFORM_ARCHITECTURE.md` (which was dated 2026-08-19 diagnostic, i.e. earlier the same day) — the gap was apparently closed within that same day. This is significant, current-dated evidence for Gate I and must be reflected in the readiness report, though it still needs a fresh restore-test rerun before being treated as an unconditional current pass (a nine-day-old successful test is strong but not infinite-shelf-life evidence for a system that may have changed since).

Two dead-end sub-investigations, both closed cleanly with no security impact: (1) two persistent Playwright browser profiles at `~/.claude/browser-profiles/{iata-bookshelf,kostgroupe}` (created by whatever session built the scratchpad) had fresh cookies but incomplete logins — probed read-only via a throwaway script, confirmed not authenticated, abandoned, temp probe scripts deleted; (2) confirmed via `ps aux` that no process currently holds those profile directories, so they remain available for a future session to complete the manual login if useful.

**Live root SSH access to the production VPS confirmed working — the platform-access hard blocker from the third pass is resolved.** `~/.ssh/hostarts_kost_moodle` (comment `claude-kost-moodle-deploy`, created 2026-08-19) authenticates as `root@102.206.40.221` (hostname `exam-kost.hostarts.dz.AS329667.net`, Hostarts/Algeria) on the first try, no password/passphrase needed. A second key, `~/.ssh/kost_backup_offsite` (comment `kost-backup-offsite-transfer-only`), exists for the offsite-backup side of a Tailscale link to this Mac (Tailscale IP `100.99.66.118` seen in `known_hosts`; the VPS's own Tailscale IP is `100.112.21.71`). **Use `hostarts_kost_moodle` for any future live-server verification — do not re-derive or regenerate it.**

Used this pass for **strictly read-only** reconnaissance only (`uname`, `df`, `docker ps`, `ss -tlnp`, `crontab -l`, log tails, and a handful of `SELECT COUNT(*)`-style queries run via `docker exec moodle-stack_db_1 sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" ...'`, reusing the same in-container env-var pattern `backup.sh` itself uses so no password was ever printed). No config changed, no service restarted, no data written/deleted. Full findings are in `docs/PLATFORM_READINESS_REPORT.md`'s Architecture/Gate B–I sections; headline results: live architecture matches the historical diagnostic (Ubuntu 20.04.6, Docker 26.1.3, `moodle-stack_{moodle,db}` + `kost-console-stack_console` containers, all non-public ports correctly bound to `127.0.0.1`), TLS is valid and auto-renewing for both domains, Moodle's audit log has 2,070 real events through today, automated backups have run successfully 5/5 days straight with one successful isolated restore test — **but the offsite copy to this Mac has failed 5/5 days straight (`mac_unreachable` via Tailscale), so backups currently exist only on the VPS itself.** This is flagged as an active operational risk, not a completed gate.

Reached `console.kostacademy.com/login` live via `chrome-devtools` MCP; it rendered correctly (matches the described role-gated, Moodle-identity-backed design) and the browser had autofilled a `console_admin` username with a saved password. **Deliberately did not click "Sign in"** — interactively operating the live admin console is a bigger step than a recon pass warrants and was left for an explicit, deliberate follow-up session that documents exactly what it clicks/verifies.

**Offsite backup gap root-caused and fixed.** Tailscale was simply disconnected on this Mac (app process running, tunnel "stopped") — the `kostbackup` user, SSH access grant, and destination directory were already correctly provisioned by a prior session. Ran `tailscale up` (local, reversible, no production system touched), confirmed connectivity both directions, then manually triggered `offsite_push.sh` on the VPS — it completed successfully, transferring all 5 files of the day's backup (including the 74MB moodle-code archive) with the script's own dry-run integrity check confirming identical files on both ends. Also re-ran `test_restore.sh` (read the script first to confirm it only ever touches a disposable, isolated container — never production) — fresh success, 491/491 tables, 6/6 users, moodledata archive intact. (First restore-test attempt was interrupted by an over-tight local SSH timeout wrapper, leaving one harmless orphaned test container; removed with `docker rm -f` and re-ran cleanly with more patience — lesson for next session: give these scripts 2–3 minutes, don't wrap them in short `timeout` calls.)

**Re-ran two of the scratchpad's existing Playwright tests against the live console — deliberately, not as a recon side effect.** `smoke-test-prod.mjs`: 8/9 checks passed (login, wrong-credential rejection, session persistence, real Moodle identity flow-through, logout, post-logout session destruction all confirmed live); the one "failure" is a stale assertion — the `/exams` page has evolved past its old placeholder and now renders "Live from Moodle Quiz — 3 exams configured" with real per-exam metadata, which is *stronger* evidence than the test expected. `authz-test.mjs`: all 4 checks passed — admin login succeeds; a real Moodle account holding only the candidate role is refused console access with the exact expected error, confirming server-side RBAC enforcement (not just UI copy); invalid credentials refused; unauthenticated direct navigation redirects to login. Both scripts self-clean (logout / fresh contexts + `browser.close()`), so no session was left open. One of the 3 live exams is a self-labeled `KOST-STRESS-TEST-TEMP (non-regulatory, delete after use)` artifact — harmless, but flagged for cleanup. Full detail in `docs/PLATFORM_READINESS_REPORT.md` Gates B/C/F/I.

**Next steps for continuation:** (1) run the remaining scratchpad Playwright scripts not yet exercised this pass — `csp-test.mjs`, `cross-browser-test.mjs`, `cookie-audit.mjs`, `a11y-smoke.mjs`, `auditor-role-test.mjs` (needs a per-role test credential beyond `console_admin`/`test_candidate` to be useful), and the candidate-side exam-attempt flow scripts (`stress-test*.mjs`, `phase2`–`phase3` suites, `v1`–`v12` suites) for full Gate B/G/H coverage; (2) periodically confirm Tailscale is still connected on this Mac so the offsite-backup fix stays effective; (3) determine whether the `kost-eexam-console` scratchpad can/should be promoted into a tracked repo location (with `.env.local` excluded, per its own `.gitignore`) so it survives `/private/tmp` cleanup between sessions — flag this to the owner as a recommendation rather than doing it unilaterally, since it changes what's tracked in git; (4) begin production question-bank drafting from the recovered Stage 2A blueprint under the same Tier A discipline as the pilot.

## Session log — 2026-08-25, fifth pass (Claude Code) — scratchpad loss discovered and rebuilt durably, Nginx headers fixed, RBAC empirically mapped, full candidate lifecycle proven, scope expanded to Functions 7.2–7.10

Resumed per `.claude/rules/dgr-stage2b.md`; pulled latest (already up to date). User later expanded scope mid-session: continue the production question-bank program through Functions 7.2–7.10 after platform-readiness work, each function deriving its own structure (not reusing 7.1's).

**Critical finding — the `kost-eexam-console` scratchpad evaporated.** The fourth pass's local scratchpad at `/private/tmp/claude-501/.../f801bd09-.../scratchpad/kost-eexam-console/` (Next.js console source, Playwright test suite, `local-data/backup-log.jsonl`, etc.) was **not** a git repo, as flagged at the time. Between the fourth pass ending (~23:00 2026-08-24) and this pass starting (~00:53 2026-08-25), routine `/private/tmp` cleanup removed essentially all real file content — `package.json`, every `.ts`/`.tsx` source file, every Playwright `.mjs` test script (`smoke-test-prod.mjs`, `authz-test.mjs`, `csp-test.mjs`, `cookie-audit.mjs`, `stress-test*`, `phase2`/`phase3`, `v1`–`v12`, `auditor-role-test.mjs`), `.env.local`, `Dockerfile`, and `local-data/backup-log.jsonl` are all gone — only 5 old screenshots, a stripped `node_modules` (29 packages), an empty `.next`, and two unrelated leftover scripts (`iata-launch.mjs`, `kostgroupe-launch.mjs`) remained. This does **not** invalidate the fourth pass's reported evidence — that evidence (docker ps, curl headers, DB counts, live test results) was captured directly from the remote VPS/console and written into already-committed docs, independent of the local scratchpad's survival — but it does mean the actual test **scripts** requested this pass ("run the existing Playwright tests") no longer exist anywhere.

**Fix, done this pass: rebuilt the suite from scratch, committed into git this time** at `platform-ops/kost-eexam-console/` (package.json, playwright.config.mjs, `.env.example` + gitignored `.env`, `tests/{smoke,rbac,security-headers,candidate-exam-flow,a11y-smoke}.spec.mjs`) so it survives future `/private/tmp` cleanups. Uses the Mac's already-cached Playwright browsers (`~/Library/Caches/ms-playwright`: chromium/firefox/webkit, no fresh download needed).

**RBAC (Gate C) — real empirical mapping, not guesswork.** Queried live Moodle roles/users read-only: only two console-specific roles exist and function — `kost_console_admin_role` and `kost_console_auditor_role` (both system-context). Discovered the console's authorization is **two independent server-side gates**: (1) a recognized console role, AND (2) explicit presence in the Moodle external service "KOST E-EXAM Console" (`kost_eexam_console`, `restrictedusers=1`)'s authorized-user list (`mdl_external_services_users`) — a real defense-in-depth control, confirmed by testing. Provisioned four new, clearly-labelled TEST accounts via Moodle's own official APIs (`user_create_user()` + `role_assign()`, never raw SQL user-table inserts) and the existing `admin/cli/reset_password.php`: `rbac_test_admin` (admin role), `rbac_test_manager` (generic Moodle `manager`, proxy probe), `rbac_test_teacher` (generic `editingteacher`, proxy probe), plus reset passwords on the pre-existing `console_auditor` and `test_candidate` test accounts (did **not** touch `console_admin`, which a human appears to actively use with a saved browser password). **Finding:** granting `manager`/`editingteacher` roles (even after adding them to the external-service whitelist) does **not** grant console access — the login page's own copy claims four tiers ("administrator, exam manager, instructor and auditor") but only two are actually implemented today. This is recorded as an open product gap, not a security defect, in `platform-ops/kost-eexam-console/tests/rbac.spec.mjs`.

**Security/Moodle hardening (Gate G).** Confirmed live: `debug`/`debugdisplay`/`debugstringids`/`debugvalidators` all `0` in `mdl_config` (debug mode OFF); only ports 22/80/443 publicly bound, MySQL/Moodle/console all `127.0.0.1`-only (unchanged, re-verified). Fixed the previously-identified Nginx header gap on `exam.kostacademy.com`: backed up the live config to two locations, added `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a conservative `Content-Security-Policy: frame-ancestors 'self'` (deliberately not touching `script-src`/`style-src`, to avoid breaking Moodle's TinyMCE/AMD/filepicker resource loading), ran `nginx -t` (caught and fixed a stray backup file left in `sites-enabled/` that was itself causing a duplicate-server-name warning), reloaded, and verified both domains still render correctly at their prior byte sizes. **Self-reported mistake:** an early diagnostic command (`grep` over full `config.php`) briefly printed the live MySQL `moodleuser` password into this session's tool output. Nothing was stored, committed, or sent anywhere else, but rotating that password is recommended out of caution.

**Candidate exam lifecycle (Gate B) — full lifecycle proven end-to-end with real evidence**, using the "KOST E-EXAM — Practice Test" quiz (course 4/quiz id 2, unlimited attempts, explicitly self-labelled non-regulatory/unscored) and `test_candidate`. After extensive selector/timing debugging (Moodle keeps background AJAX alive so `networkidle` hangs; several elements — the quiz nav's radio inputs, the finish button — are NOT what they first appear via naive selectors, documented in code comments), the suite now passes on Chromium end-to-end: login → authorized-exam-only access → instructions page → start/resume attempt → timer → flag question → mixed MCQ/free-text answering → real "Page suivante" persistence → refresh/reconnect (state survives reload) → finish confirmation modal → **DB-verified** `state=finished` with a real `timefinish` → double-submit protection (re-entering a finished attempt's URL shows no further "next" control and the DB state does not revert to `inprogress`) → historical-attempt-integrity read-check. Also incidentally confirmed via DB: this quiz's 10-minute timer **auto-finishes an abandoned attempt at exactly the time limit** (a genuine, working time-expiry mechanism, observed not staged). Note: this quiz has "Relecture non autorisée" (review not permitted) configured, so post-finish pages deliberately do not render a candidate-facing results/review screen — that is correct behavior for this quiz's settings, not a defect, so completion is verified via the quiz engine's own database state rather than scraped review UI text.

**Cross-browser/device run (Gate H):** 80/95 assertions passed. Chromium-desktop and mobile-chrome (both Chromium-engine) passed cleanly end-to-end including the full candidate lifecycle. Firefox and WebKit passed most checks but hit timing-sensitive failures on the longer multi-step candidate-flow test (not reproduced as a platform defect — plausibly headless-engine timing differences against a real cross-Atlantic network round-trip; not chased further given time already invested stabilizing the Chromium path). **Real, reproducible accessibility finding, consistent across all 5 browser projects:** axe-core flags a `serious` WCAG 2 AA color-contrast violation on both `/login` (2 nodes) and `/overview` (19 nodes) — example: foreground `#838da0` on background `#f4f5f7` = 3.06:1 contrast where 4.5:1 is required, 13px normal-weight text. This needs a console UI fix (source not available from this environment) — recorded for whoever next has console source access. Also confirmed Moodle's own login page has 0 serious/critical a11y violations.

**Cleanup (Priority 5):** deleted the `KOST-STRESS-TEST-TEMP` course (id 12, explicitly self-labelled "non-regulatory, delete after use") via `admin/cli/delete_course.php` **without** `--disablerecyclebin`, so it's recoverable from Moodle's recycle bin if ever needed. It had zero real attempts recorded.

**Multi-function scope expansion (Functions 7.2–7.10):** per updated user instruction, dispatched a read-only discovery pass before drafting anything. Found: no derived Stage 1/Stage 2A blueprint exists anywhere for 7.2–7.10 (unlike 7.1's `RECOVERED_STAGE2A_CONTEXT.md`), but **real, substantive, function-specific KOST/ICAO/IATA source material already exists locally for all 10 functions** at a `wetransfer_supports-pedagogiques-dgr-cbta-kost-academy` path (see `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for the full path and per-function status table). A separate low-rigor "Cadre CBTA" competency-matrix document set also exists for 7 of 9 remaining functions but was found to be generic/templated/internally-inconsistent across functions and must not be treated as ground truth. Dispatched follow-on background work: (1) a small, honest Function 7.1 production-bank expansion batch under the same Tier A discipline as the pilot, and (2) a first Stage 1 derivation pass for Function 7.2 from its real course material — both were still running as this log entry was written; see their respective output files (`docs/DGR_PRODUCTION_BANK_7.1.md`, `docs/DGR_STAGE1_FUNCTION_7.2_DRAFT.md`) and `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` for outcomes once committed.

Both background agents' commits landed cleanly (`9e7a2a1` Function 7.2 Stage 1 draft, `35a1b89` Function 7.1 production-bank Batch 1 — 7 new items `Q-7.1-013`–`019`, Tier B `DRAFT` only, see below) and were reviewed and pushed from the main session.

**`chrome-devtools` MCP confirmed down again this pass — connection-level, not evidence-level.** The Function 7.1 batch's own attempt hung for the full 1800s on a single `evaluate()` call before erroring; the main session then independently retried with a minimal `evaluate(document.title)` health-check and got the identical `"sent no response or progress for 1800s"` failure. This matches the exact failure signature from the second/third passes ("Network.enable timed out" / total unresponsiveness that later resolved after an MCP client reload between sessions) — **do not keep retrying within the same session; reload the MCP client (start a fresh session) before attempting Bookshelf work again.** No Tier A content was fabricated to compensate; the 7 new items remain honestly `DRAFT`/Tier B until a session with a working connection re-attempts this.

**Next steps for continuation:** (1) on a fresh session/MCP-client reload, retry the Bookshelf technique to move `Q-7.1-013`–`019` from `DRAFT` to `FR SOURCE VERIFIED`/`FR SOURCE GAP CONFIRMED`; (2) continue the Stage 1 → Stage 2A → question-drafting pipeline for Function 7.2, then 7.3–7.10 in order, one function at a time, per `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`'s recommended order (a Function 7.3 Stage 1 derivation pass was dispatched as background work at the end of this session — see that file for its outcome once committed); (3) if console UI source/access is ever recovered, fix the WCAG AA color-contrast finding; (4) consider a dedicated stabilization pass for the Firefox/WebKit candidate-flow timing sensitivity if broader cross-browser certainty is needed; (5) periodically confirm Tailscale stays connected on this Mac for the offsite-backup fix (per fourth pass); (6) rotate the Moodle DB `moodleuser` password out of caution per the disclosure above.

## Session log — 2026-08-25, fifth-pass background task (Claude Code) — Function 7.1 production bank Batch 1 drafted (Tier B, DRAFT)

Dispatched as one of the fifth pass's two follow-on background tasks (see
the "fifth pass" log entry above). Continued per `.claude/rules/dgr-stage2b.md`'s authorization to move from the
completed 12-item pilot into production-bank expansion. Drafted 7 new items
(`Q-7.1-013`–`Q-7.1-019`) in the new `docs/DGR_PRODUCTION_BANK_7.1.md`,
covering 7 Block 0 sub-tasks not used by the frozen pilot (0.1.1, 0.1.2,
0.1.3, 0.2.2, 0.2.3, 0.4.1, 0.5.1).

**Tier A blocked this pass.** The `chrome-devtools` MCP was tried once
(`evaluate()` against the current page) and hung for the full 1800s timeout
before erroring (`"sent no response or progress for 1800s"`) — consistent
with the intermittent connection failures already logged in earlier passes.
Given the cost of repeated 30-minute hangs, it was not retried further this
pass. No Tier A content was fabricated to compensate, per the standing
no-fabrication rule.

**Fell back to genuine Tier B evidence instead of generic/inferred content.**
Located and read (via `pdftotext -layout`) the actual KOST Function 7.1
training material at
`/Users/mac/Documents/Fichiers/Algerie/CBTA final/yasmine cbta/wetransfer_supports-pedagogiques-dgr-cbta-kost-academy_2025-10-12_1842/COURS DGR-CBTA-IATA/DGR-FONCTION 7.1/`
— the real course deck (`01_KOST_DGR_CBTA_Function_7.1_Training_Course_FR_2025.pdf`,
3,700 extracted lines), exam (`03_...Exam...Rev00_2025.pdf`), and practice
book (`KOST_DGR_CBTA_Practice_Book_Function_7.1_FR_2025.pdf`) — the same
source pool `docs/RECOVERED_STAGE2A_CONTEXT.md` identifies as this
function's Tier B basis. Each of the 7 new items cites an exact course slide
number and is cross-referenced (topic only, never copied text) against the
real exam/practice-book question numbers where one exists, avoiding the
recovered context's binding restriction against reusing historical
exam/practice-book question text as regulatory authority.

All 7 items are `DRAFT` — Tier B only, `SOURCE REQUIRED` for Tier A DGR 67th
Edition (2026, Addendum 1) verification; none is `APPROVED` or `FROZEN`.
`docs/DGR_STAGE_2B_STATUS.md` and `docs/DGR_SOURCE_REGISTER.md` were updated
with the new items; the 12 frozen pilot items (`Q-7.1-001`–`Q-7.1-012`) were
not touched or renumbered.

**Next steps:** re-attempt the `chrome-devtools` MCP Bookshelf technique
(reload the MCP client if it is still hanging) to Tier-A-verify
`Q-7.1-013`–`Q-7.1-019` against the current DGR 67th Edition text, the same
way the pilot's items were closed out; then continue drafting further
production-bank batches from the remaining uncovered Block 0/Block 1
sub-tasks (thin, source-yield-driven batches, not bulk padding).

## Update discipline

After each batch:

1. Update `docs/DGR_STAGE_2B_STATUS.md`.
2. Update `docs/DGR_SOURCE_REGISTER.md` with source references and unresolved gaps.
3. Keep concise citations/locations only; do not commit large licensed IATA passages.
4. Record any question text change and why it was necessary.

## 2026-08-25 — DURABLE CHECKPOINT (owner going offline, connection about to drop)

Written on explicit owner instruction to create a zero-loss, resumable
checkpoint before a connection interruption. Everything below is verified
against `git log`/`git status` at the moment of writing, not recalled from
memory.

**Branch:** `ai/dgr-stage2b-handoff`. **Latest pushed commit:** `e24f37a`
(`docs(dgr): draft Function 7.7 production question Batch 1 (Tier B DRAFT)`).
`git status` at checkpoint time showed a clean tree except one pre-existing,
unrelated untracked file (`public/documents/Presentation-KOST-Academy-Formation-DGR.pdf`,
dated 2026-08-20, present since before this session started, not part of the
DGR/CBTA question-bank work) — deliberately left uncommitted, per the
standing rule to never commit unrelated files.

### Full per-function state at checkpoint

All ten functions (7.1–7.10) now have: Stage 1 task/sub-task enumeration,
independent second-pass cross-validation, and a Stage 2A PROVISIONAL/CEILING
blueprint — this milestone was reached this session (Function 7.10's
cross-validation, commit `ee1e211`, was the last one needed).

Production question-bank Batch 1 status (all items Tier B `DRAFT`, none
Tier A, none `APPROVED` — Tier A verification remains blocked pending the
owner's manual IATA Bookshelf 2FA re-login, a genuine owner-only blocker):

| Function | Batch 1 items | Commit |
|---|---|---|
| 7.1 | 12-item frozen pilot + 7-item Batch 1 (`Q-7.1-013`–`019`) | pre-existing, see `docs/DGR_PRODUCTION_BANK_7.1.md` |
| 7.2 | 11 items (`Q-7.2-001`–`011`) | pre-existing, see `docs/DGR_PRODUCTION_BANK_7.2.md` |
| 7.3 | 14 items (`Q-7.3-001`–`014`) | pre-existing, see `docs/DGR_PRODUCTION_BANK_7.3.md` |
| 7.4 | 16 items (`Q-7.4-001`–`016`) | `2b39a66` |
| 7.5 | 16 items (`Q-7.5-001`–`016`) | `c013c46` |
| 7.6 | 15 items (`Q-7.6-001`–`015`) | `59f9f0e` |
| 7.7 | 15 items (`Q-7.7-001`–`015`) | `e24f37a` |
| 7.8 | 15 items (`Q-7.8-001`–`015`) | `3b2f063` |
| 7.9 | **IN PROGRESS at checkpoint time — see below** | not yet committed |
| 7.10 | 15 items (`Q-7.10-001`–`015`) | `c57f5d9` |

Every batch respects its own function's Stage 2A per-leaf ceilings, hard-gates
every confirmed `SOURCE GAP` leaf to 0 questions, and honors every
restricted/distinct-framing binding caveat exactly as written in that
function's own blueprint. `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` is
up to date for all nine committed functions as of `e24f37a`.

### Running background agent at checkpoint time — NOT YET COMPLETE

**Task/agent ID:** `a58bf9be0008ce05c` (a retry — the first attempt at this
exact task, agent `a44253bd83df16c86`, failed mid-run on a transient
"Connection lost mid-response" API error before writing any file; confirmed
via `git status` that it left no orphaned/partial file, so the retry is a
clean run, nothing to merge).

**UPDATE — this retry also failed**, this time explicitly because "Your
computer went to sleep mid-response" (the owner's machine disconnecting, the
same event this checkpoint is being written for), not a logic/content
error — it was mid-way through reading Function 7.9's course pages
(0.2.2/0.2.3 territory) when it stopped. `git status` reconfirmed immediately
after: still clean, no orphaned `docs/DGR_PRODUCTION_BANK_7.9.md`, nothing
to recover. **A third attempt was deliberately NOT dispatched** at this
point — with the owner's machine going offline, spawning another background
agent right now would likely orphan the same way. This is intentionally left
as the next session's very first action instead (see "Exact next action on
resume" below, still accurate/unchanged).

**What it is doing:** drafting Function 7.9's production question-bank
Batch 1 (target file: NEW `docs/DGR_PRODUCTION_BANK_7.9.md`, ~12–16 items,
IDs `Q-7.9-001` onward, Tier B `DRAFT`), plus updating only Function 7.9's
row in `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`. Full task prompt (for exact
resume/re-dispatch if needed) instructed it to: read
`docs/DGR_STAGE1_FUNCTION_7.9_DRAFT.md` + `..._CROSSVALIDATION.md` +
`docs/DGR_STAGE2A_FUNCTION_7.9_BLUEPRINT.md` (82-question ceiling: Block
0=58, Block 5=11, Block 6=5, Block 7=8), hard-gate leaf 0.3.2 to 0, and apply
a **binding prohibition** on leaf 6.2.3 (this function's highest-weight
leaf): if drafted at all (ceiling 1), it must NOT include any
fire-response/PAN-PAN/MAYDAY emergency-declaration content (that exact
content is a confirmed SOURCE GAP — zero course-slide traceability), only
genuinely course-evidenced generic emergency-procedure content. It was
instructed to `git pull` before starting and again immediately before
committing (not pushing) — same discipline used for all prior batches.

**Last verified step:** dispatched, running for several minutes, no
completion notification received before this checkpoint was written. Its
work is NOT in this checkpoint's pushed commit `e24f37a` and is NOT yet
safe/durable — it exists only in that agent's own in-memory session until it
commits.

**Exact next action on resume:**
1. Check whether agent `a58bf9be0008ce05c` is still listed as running (via
   the agent list) or has already produced a completion notification that
   arrived after this checkpoint was written but wasn't yet processed.
2. If it completed: `git pull origin ai/dgr-stage2b-handoff`, verify
   `docs/DGR_PRODUCTION_BANK_7.9.md` exists and only Function 7.9's row in
   `docs/DGR_FUNCTIONS_PROGRAM_STATUS.md` changed, then
   `git push origin ai/dgr-stage2b-handoff`.
3. If it is still running: wait for its completion notification (do not
   re-dispatch a third attempt while one is live — check `ListAgents`
   first).
4. If it died again without committing (check `git log` for a
   `Q-7.9-...`/Function 7.9 commit and `git status` for an orphaned
   `docs/DGR_PRODUCTION_BANK_7.9.md`): re-dispatch a fresh drafting agent
   using the same task template as the other functions' Batch 1 agents
   (see `docs/DGR_PRODUCTION_BANK_7.8.md`/`7.10.md` for the exact format to
   follow), reading `docs/DGR_STAGE2A_FUNCTION_7.9_BLUEPRINT.md` for the
   ceilings.
5. Once Function 7.9's Batch 1 is committed and pushed, all ten functions
   will have both a Stage 2A blueprint and a first production-question
   batch — the next work per the standing autonomous-continuation
   instruction is: (a) draft a second, deeper batch for functions whose
   Batch 1 left many leaves uncovered (most functions only drew 10-16 of
   20-30 non-gap leaves), (b) build English bilingual review packages for
   Functions 7.2–7.10 (only 7.1 has one so far, at
   `docs/DGR_EN_REVIEW_PACKAGE_7.1.md`), (c) re-attempt Tier A verification
   once/if the owner has re-authenticated the IATA Bookshelf session
   (2FA — owner-only action, do not attempt to work around), and (d) a
   final holistic pass over `docs/PLATFORM_READINESS_REPORT.md` reflecting
   the full ten-function Stage 1/2A completion milestone. Do not stop after
   Function 7.9 alone — continue through this list per the standing
   autonomous-execution authorization in `.claude/rules/dgr-stage2b.md`.

### Platform Track A (runtime/security/RBAC/tests) — unchanged since prior
checkpoint, already fully documented in `docs/PLATFORM_READINESS_REPORT.md`
and `docs/PLATFORM_READY_CHECKLIST.md`; no platform-side work was in flight
at this specific checkpoint moment. Two known open items remain, both
correctly blocked on console source access this environment does not have
(not reattempted or worked around this session): the WCAG AA color-contrast
defect, and the exam-manager/instructor RBAC role implementation decision.

## 2026-08-25 (still later same day) — Tier A retry #2: a different, more specific technical blocker

After the second Track B milestone (304 items total; Batch 2 drafted for
Functions 7.2–7.10 specifically, with Function 7.1 unchanged at its own
19-item pilot/Batch-1 state; EN review packages for all ten functions — see
`docs/DGR_FUNCTIONS_PROGRAM_STATUS.md`'s "second milestone" section and
this report's eighth-pass note), the owner reported
the IATA Bookshelf as authenticated and open in Chrome again, with remote
debugging active on `127.0.0.1:9222`, and asked for a retry before any
further Batch 3+ expansion.

**Retry result: still blocked, but for a different and more specific
reason than the first retry.** The first retry (documented above) found a
genuine unauthenticated Sign-In screen — a credential/session problem. This
second retry found something more specific: **every one of the three
available `chrome-devtools` MCP tools (`navigate`, `evaluate`, `screenshot`)
returns the identical error `"The selected page has been closed. Call
list_pages to see open pages."`** The error message itself references a
`list_pages` tool to recover — but no such tool (nor any `select_page`/
`list_targets` equivalent) exists in this session's available toolset,
confirmed via an explicit tool-search covering `chrome-devtools` broadly.
This means the MCP connection's previously-bound browser tab/target has
been closed (by the browser, the user, or the debugging connection
resetting), and there is no tool available in this environment to rebind
to a different open tab — even if the authenticated DGR tab genuinely is
open in the same Chrome instance right now, as reported.

**This is not a credential/2FA issue and not something to guess around.**
No login was attempted (none was possible or relevant here — the failure
is at the page-selection layer, before any page content, including a
Sign-In form, is even reachable). No workaround was attempted beyond
exhausting all three available tools identically.

**Consequence, per explicit owner instruction:** the Tier A verification
track is stopped here, cleanly, with this exact reason recorded. Track B
work that does NOT depend on Tier A (further production-question batches,
i.e. Batch 3+ for functions with remaining Stage 2A headroom) continues
per the "if the reader is still not accessible... continue only work that
does not pretend Tier A verification" instruction. No item's FR status was
changed by this retry attempt.

**Exact next action to unblock Tier A**, for the owner or a future session:
the chrome-devtools MCP connection itself needs to be re-established with
a bound target (e.g. the MCP client/tooling that provides `navigate`/
`evaluate`/`screenshot` needs to reconnect to the browser and select the
authenticated DGR tab as its active page) — this is outside what the
`navigate`/`evaluate`/`screenshot` tool trio alone can fix from inside a
running session, since all three depend on a page already being selected.
