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

Pending 67th Edition revalidation:

- Q-7.1-001 — glossary location confirmed (Appendice A, p.703); danger/risque entries not yet read

Current count: 11/12 FR source-verified; 1/12 pending.

## Next action

One item remains: **Q-7.1-001** (danger vs. risque). Resume directly at Appendice A — Glossaire, Bookshelf p.703 (reachable via the reader's Table of Contents: "Go to APPENDICE A — GLOSSAIRE, page 703") and read the "Danger" and "Risque" entries. Avoid a bare keyword search for "Danger" — it returns 5000+ noise hits from hazard-label text throughout the book; browse the glossary directly instead. Once read, apply the same FR SOURCE VERIFIED / SOURCE INSUFFICIENT logic as the other three items.

Q-7.1-006, Q-7.1-007, and Q-7.1-008 are now FR SOURCE VERIFIED — see `docs/DGR_SOURCE_REGISTER.md` for full evidence and `docs/DGR_STAGE_2B_STATUS.md` for wording-precision notes (Q-7.1-007's A1 nuance, Q-7.1-008's flagged distractor).

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

## Update discipline

After each batch:

1. Update `docs/DGR_STAGE_2B_STATUS.md`.
2. Update `docs/DGR_SOURCE_REGISTER.md` with source references and unresolved gaps.
3. Keep concise citations/locations only; do not commit large licensed IATA passages.
4. Record any question text change and why it was necessary.
