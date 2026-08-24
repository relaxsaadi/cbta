# KOST E-EXAM / DGR Platform — Readiness Report

Generated: 2026-08-24, by Claude Code, against `docs/PLATFORM_READY_CHECKLIST.md` gates A–J.

## Final label

**NOT READY — multiple critical gates unverified due to a hard blocker (Gate B–I platform access) and one open content gate (Q-7.1-001).**

This is not a partial/optimistic reading: most of Gates B through I could not be evidenced at all this session, for the specific reason below, not because they were checked and found lacking.

## The hard blocker (governs Gates B, C, D, F, G, H, I)

**No source code, hosting/server access, deployment config, or credentials for `exam.kostacademy.com` (Moodle) or `console.kostacademy.com` (KOST E-EXAM) are reachable from this coding environment.**

Evidence this is a real, live system and a real, exhausted search — not a guess:

- Both URLs are live and confirmed by direct fetch:
  - `https://exam.kostacademy.com` → live Moodle install, title "KOST Academy - Plateforme E-Exam DGR", FR/EN login portal.
  - `https://console.kostacademy.com` → separate login page, "KOST E-EXAM — Aviation Compliance Systems", roles listed: administrators, exam managers, instructors, auditors; authenticates against Moodle identity; hosted in Algeria per page copy.
- Local git repos on this machine (15 found via `find ~/Documents -name .git` + `git remote -v` on each): `google-ads-dashboard`, `immigration-crm`, `kost-longevity-site`, `cbta`, `linkedin_skills`, `google-ads-factory`, `kost-erp`, `hestrade-site`, `winter-elite-link`, `strategix-web`, `kost-caisse`, `kosty`, `strategix-video-player`, plus a Remotion template. None is an exam/Moodle/console codebase.
- Full GitHub account listing (`gh repo list relaxsaadi`, 36 repos) — same result. Closest name matches checked individually and ruled out: `kost-ops` (CRM/ops tool — B2B CRM, trainers, collections, prospecting, AI; not exam delivery), `schoolvalid` (empty/stale, last touched Feb 2025).
- `gh search code --owner relaxsaadi` for `"moodle"`, `"exam.kostacademy"`, `"console.kostacademy"` — **zero hits** across the account, including private repos.
- A large local cPanel hosting-account backup was found and inspected at `/Users/mac/Documents/Fichiers/Algerie/kost academy/` (`kostacad_17001.tar.gz` ≈12 GB, `kostacad_17003.tar.gz` ≈37 MB, a 267 MB `kostacad_wp622.sql` WordPress DB dump, two unpacked `homedir/public_html` trees). This shared-hosting account carries many KOST/agency addon domains (`academykost`, `newkostacademy`, `crmacademy`, `kostgroupe`, etc.), but **every "academy"-named subdomain folder in this backup is an empty placeholder** — a cPanel-generated `.htaccess` PHP handler only, no application code. No Moodle signature files (`config.php`, `lib/moodlelib.php`, `mdl_*` tables) or exam-console code were found anywhere in it. Table names in the SQL dump were checked (`wpjr_*` prefix — WordPress + Amelia booking/payments plugin); data rows were **not** opened/dumped, and the 12 GB archive was not extracted, since this backup already doesn't contain the target application and further extraction would only risk exposing real PII for no benefit.
- `~/.ssh/config` and `~/.ssh/known_hosts` have no entry for any KOST server.

**What resolves this:** the owner needs to supply one of — the actual repository location/access for these two systems; hosting-provider, cPanel, or SSH credentials for the live servers; or an explicit statement that a third party manages this platform and further engineering audit is out of scope for this coding environment. Per `.claude/rules/dgr-stage2b.md` rule 11, this is exactly the "missing secret/credential that must be supplied by the owner" case — the standing instruction is to surface it, not keep guessing.

A related, smaller blocker: Phase 2's controlling scope document — "the frozen Stage 2A blueprint and 44-subtask competency matrix" — was also searched for (repo, filesystem, `gh search code`) and not found anywhere accessible. Building the Function 7.1 production question bank per Phase 2 needs this supplied too.

## Gate-by-gate status

### A. Regulatory / Question Bank — PARTIALLY READY (11/12), evidenced

- [x] 11 of 12 Function 7.1 pilot items are FR source-verified against IATA DGR 67th Edition 2026 (Addendum 1 integrated), each with exact table/section and Bookshelf page. See `docs/DGR_SOURCE_REGISTER.md`.
- [ ] Q-7.1-001 (danger vs. risque) is **not** resolved — location of the answer is confirmed (Appendice A — Glossaire, p.703, per an explicit cross-reference in §1.0) but the entries themselves were not read. Blocked by a `chrome-devtools` MCP connection failure (`Network.enable timed out`, persistent across ~10+ retries / ~15 minutes real time this session), not by missing evidence in the source. No danger/risque content was fabricated to compensate.
- [x] Q-7.1-007 wording finalized: uses "approbation" (never "dérogation"), preserves the A1 passenger-approval/cargo-normal-columns nuance and A2's cargo-only-with-approval scope. See `docs/DGR_STAGE_2B_STATUS.md`.
- [x] Q-7.1-008's unsupported distractor ("State derogation required") replaced with a source-grounded one ("1 kg/1 L", E1's limit misattributed to E0), directly falsifiable from Tableau 2.6.A's own E0 row. See status doc.
- [x] Every FR-verified question has source location, correct-answer evidence, and (where applicable) distractor rationale recorded in the source register.
- [x] No question carries `APPROVED` status — all carry `PENDING REVIEWER + DATE`.
- [x] EN remains `BILINGUAL TECHNICAL REVIEW REQUIRED` for all 12 — no EN review has actually happened.
- [ ] The Function 7.1 **production** question bank (beyond this 12-item pilot) has not been started — blocked on the missing Stage 2A blueprint/competency matrix (see above).

### B. Exam Workflow — NOT EVIDENCED (hard blocker)
No access to the live candidate/exam UI or its backend. Nothing in this category was tested.

### C. Roles / RBAC — NOT EVIDENCED (hard blocker)
No access to authenticate as any role (candidate, instructor/reviewer, exam admin, system admin) or to inspect server-side authorization code.

### D. Audit Trail / Integrity — NOT EVIDENCED (hard blocker)
No access to the database, application logs, or audit-log implementation.

### E. Bilingual Behavior — PARTIALLY EVIDENCED (content side only)
- [x] FR source-verification methodology is real and evidenced for 11/12 pilot items (see Gate A).
- [ ] EN technical review has not happened for any item.
- [ ] FR/EN rendering behavior *in the actual exam UI* (question, options, instructions, errors) is not evidenced — hard blocker.

### F. Moodle / KOST E-EXAM Integration — NOT EVIDENCED (hard blocker)
No access to the integration architecture, service-account scopes, or error/retry handling between Moodle and the console.

### G. Security / Configuration — NOT EVIDENCED (hard blocker)
No access to production configuration, headers, TLS setup, secrets management, or database exposure for either system. **No claim of "secure" or "insecure" can be made — this is an open gate, not a passed one.**

### H. Build / Tests — NOT EVIDENCED (hard blocker)
No access to the exam-platform or console source repositories, so no build/lint/test/E2E run was possible. (This repository, `cbta`, is the marketing/funnel site only — its own build/lint/typecheck are unaffected and unrelated to this gate.)

### I. Deployment / Operations — NOT EVIDENCED (hard blocker)
No access to deployment procedure, environment configuration, health checks, rollback path, or backup/restore evidence for either system. The cPanel hosting-account backup found during discovery (see above) is **not confirmed to be a current or complete backup of the live exam platform** — it appears to be a different/legacy hosting account whose "academy" subdomains are empty. It should not be relied on as evidence of a working backup/restore path.

### J. Final Acceptance
Per `docs/PLATFORM_READY_CHECKLIST.md` section J: since Gates B, C, D, F, G, H, and I are entirely unevidenced (not merely incomplete), and Gate A has one open item (Q-7.1-001) and no completed EN review, the only honest final status is:

**NOT READY — blocked on (1) owner-supplied access/location for the exam.kostacademy.com and console.kostacademy.com source/runtime, (2) owner-supplied Stage 2A blueprint / 44-subtask competency matrix, (3) chrome-devtools MCP connection recovery to finish Q-7.1-001, (4) EN bilingual technical review (not yet started for any item), (5) a named qualified reviewer + date for any `APPROVED` status.**

## What is NOT claimed

- Not claiming ANAC or IATA approval of anything.
- Not claiming any question is regulator-approved — all remain `PENDING REVIEWER + DATE`.
- Not claiming the exam platform is secure, insecure, tested, or untested — Gate G/H are open, not failed.
- Not claiming the cPanel backup found during discovery is or isn't a usable backup of the live platform — insufficient evidence either way.
- Not claiming EN review happened anywhere in this pilot.

## Immediate next steps (owner-actionable)

1. Reload the `chrome-devtools` MCP client (VS Code/Claude Code) so Q-7.1-001 can be finished with the already-proven technique (top-frame search/ToC click + screenshot — see `docs/AI_HANDOFF.md` second-pass session log).
2. Supply the actual location/access for the `exam.kostacademy.com` and `console.kostacademy.com` source code and hosting (repo URL, hosting provider + credentials, or confirm third-party-managed and out of scope).
3. Supply or point to the Stage 2A blueprint and 44-subtask competency matrix for Function 7.1.
4. Identify a named qualified reviewer and schedule the FR sign-off + EN bilingual technical review for the 11 (soon 12) verified pilot items.
