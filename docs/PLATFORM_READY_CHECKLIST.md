## CURRENT RUN — 2026-11-24 21:30 Africa/Algiers

> **Exact live PR #3 head verified:** `64de509391682a2f9d390c0b33fd2b3f38d9bf69`, branch `ai/dgr-stage2b-handoff`, OPEN / DRAFT / UNMERGED, 755 ahead / 0 behind `main`, 249 changed files. Repository visibility remains PUBLIC.
>
> **Correction to the 21:17 snapshot above:** five newer DGR workflows did complete on the exact live head `64de5093`; the prior statement that the last completed runs were on `a202b2c6` is superseded. The Direct Tier-A job log explicitly shows checkout/ref `64de509391682a2f9d390c0b33fd2b3f38d9bf69`.
>
> - CSV import structure: **PASS** — [run #45480384521](https://github.com/relaxsaadi/cbta/actions/runs/45480384521)
> - Controlled reviewer admission: **PASS** — [run #45480384604](https://github.com/relaxsaadi/cbta/actions/runs/45480384604)
> - Governance regression integrity: **PASS** — [run #45480384515](https://github.com/relaxsaadi/cbta/actions/runs/45480384515)
> - Direct item Tier-A provenance: **FAIL** — [run #45480384611](https://github.com/relaxsaadi/cbta/actions/runs/45480384611)
> - Full DGR regulatory readiness: **FAIL** — [run #45480384751](https://github.com/relaxsaadi/cbta/actions/runs/45480384751)
>
> The direct-evidence job fails at “Reject sampled-only Tier-A promotions” and “Require affirmative current-edition per-item evidence.” The full-readiness job's governance-integrity sub-job passes, but the direct Tier-A, affirmative per-item evidence and final artifact gates fail. The exact-head artifact summary is **287/287 task-to-matrix rows**, **453 FR / 453 EN IDs** with no missing/extra IDs, **107 FROZEN provenance exceptions**, and **140 FR↔EN status-mirror discrepancies**. Direct Tier-A diagnostics identify **247 affected items** across Functions 7.1–7.10. All **453/453** import candidates remain `IMPORT_ELIGIBLE=NO`; the qualified-reviewer registry is empty; zero APPROVED questions are established. Keep all holds fail-closed.
>
> **Function coverage remains independent:** 7.1=44 tasks/19 questions; 7.2=23/49; 7.3=33/45; 7.4=37/53; 7.5=25/44; 7.6=28/56; 7.7=27/53; 7.8=23/51; 7.9=24/39; 7.10=23/44. The 44-task 7.1 structure is not imposed on other functions. Structural completeness is not regulatory correctness or approval.
>
> **Security recheck:** current `main` remains PUBLIC and `main.protected=false`; the rulesets collection is empty. The current `middleware.ts` still reads `searchParams.get('secret') === CRON_SECRET` before Basic authentication (blob `839ac0b0`), and the inspected `app/api/agents/linkedin-outreach/route.ts` still has a GET query-secret check (blob `66f7f4ac`). PR [#298](https://github.com/relaxsaadi/cbta/pull/298) remains OPEN / DRAFT / UNMERGED / UNDEPLOYED; its static tests do not replace deployed positive/negative cron, dashboard, SSE, CSRF and rollback acceptance. [Issue #340](https://github.com/relaxsaadi/cbta/issues/340) remains a critical public answer-key/licensed-reference exposure blocker; PR #341's detector pass is not containment.
>
> **Claude Code / related work:** [PR #416](https://github.com/relaxsaadi/cbta/pull/416) now has Claude-authored head commit `ba8e5f3a`, changing the Function 7.1 page title to task-based “Préparation” wording rather than a job-title label. It remains DRAFT; no integrated exam-platform acceptance follows. [PR #417](https://github.com/relaxsaadi/cbta/pull/417) remains a separate dashboard lazy-Supabase Preview correction, not E-EXAM/Moodle acceptance. No new Claude-authored DGR bank or E-EXAM implementation PR was found.
>
> **Edition transition:** IATA's [DGR Updates page](https://www.iata.org/dgr-updates) states the 68th Edition electronic edition is available and the 2027 DGR enters into force on **1 January 2027**. The 67th Edition 2026 remains the evidence baseline for 2026 sittings; preserve its records and conduct separate per-function 68th Edition impact/revalidation before 2027 use. Public significant-change summaries are not substitutes for authorized full-edition, item-specific evidence.
>
> **Release gates remain NOT ACCEPTED:** candidate workflow (partial); roles/RBAC; audit trail (partial); FR source verification; independent EN review; Moodle/console integration; security/confidentiality; integrated build/tests; deployment/runbook/monitoring; backup/recovery; notification durability. Owner-only blockers include authorized full IATA source access, appointment of qualified FR/EN reviewers, repository administration for protection/rulesets, and authorization/execution of confidential-bank containment.
>
> **Decision: PLATFORM NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## CURRENT RUN — 2026-11-24 21:17 Africa/Algiers

> **Live PR #3:** [#3](https://github.com/relaxsaadi/cbta/pull/3), branch `ai/dgr-stage2b-handoff`, OPEN / DRAFT / UNMERGED, 249 changed files. The live branch SHA and ahead/behind count are maintained in the PR description; this checklist snapshot intentionally anchors its five exact-head DGR results to the last code-bearing audit parent `a202b2c6d799382177ae04a3c5489543e252581b` (752 ahead / 0 behind `main`). The previous header incorrectly named `fdc956b1` / 751 ahead. GitHub compare confirmed the intervening code-bearing-parent update and subsequent commits changed only `docs/PLATFORM_READY_CHECKLIST.md`; the five DGR workflow results below are tied to `a202b2c6`. The checklist-only commits are outside the DGR workflows' path filters, so no fresh workflow run is claimed for those documentation descendants. No application code, question/answer content, regulatory evidence, reviewer record, import flag, Moodle data or deployment changed.

### Exact-head DGR workflows — code-bearing head `a202b2c6`

- CSV import structure: **PASS** — [run #45470152029](https://github.com/relaxsaadi/cbta/actions/runs/45470152029)
- Controlled reviewer admission: **PASS** — [run #45470151774](https://github.com/relaxsaadi/cbta/actions/runs/45470151774)
- Governance regression integrity: **PASS** — [run #45470151953](https://github.com/relaxsaadi/cbta/actions/runs/45470151953)
- Direct item Tier-A provenance: **FAIL** — [run #45470151865](https://github.com/relaxsaadi/cbta/actions/runs/45470151865)
- Full DGR regulatory readiness: **FAIL** — [run #45470151828](https://github.com/relaxsaadi/cbta/actions/runs/45470151828)

The exact Tier-A job fails at “Reject sampled-only Tier-A promotions” and “Require affirmative current-edition per-item evidence.” The full-readiness job fails at the direct Tier-A gate, affirmative current-edition per-item evidence and final artifact gate. Its separate regulatory-governance-integrity job passes. Do not weaken these fail-closed checks. The combined Vercel failure recorded on the handoff targets the separate `kost-funnel` project; it is not E-EXAM/Moodle acceptance.

### Ten-function question-bank and source-program inventory

| Function | Official tasks | FR questions | EN questions | Tier-A affected | FROZEN provenance exceptions | FR↔EN drift |
|---|---:|---:|---:|---:|---:|---:|
| 7.1 | 44 | 19 | 19 | 18 | 0 | 0 |
| 7.2 | 23 | 49 | 49 | 29 | 4 | 11 |
| 7.3 | 33 | 45 | 45 | 30 | 18 | 20 |
| 7.4 | 37 | 53 | 53 | 25 | 10 | 13 |
| 7.5 | 25 | 44 | 44 | 20 | 12 | 16 |
| 7.6 | 28 | 56 | 56 | 31 | 13 | 18 |
| 7.7 | 27 | 53 | 53 | 25 | 14 | 19 |
| 7.8 | 23 | 51 | 51 | 27 | 12 | 15 |
| 7.9 | 24 | 39 | 39 | 22 | 14 | 16 |
| 7.10 | 23 | 44 | 44 | 20 | 10 | 12 |
| **Total** | **287** | **453** | **453** | **247** | **107** | **140** |

All ten independent official task sets, source/competency matrices, Stage 2A blueprints, FR banks and separate EN review packages are present. The exact-head governance workflow confirms 287/287 task-to-matrix rows; the readiness workflow confirms 453/453 FR/EN IDs. Function 7.1's 44-task structure is not imposed on other functions.

Current FR status ledger: **246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE, 2 UNRESOLVED**. The 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies are separate findings. All **453/453** V2 candidates remain `IMPORT_ELIGIBLE=NO`; the candidate/reconciliation CSVs have matching ID populations and no blank blocker fields. The qualified-reviewer registry is empty and there are **zero established APPROVED questions**. FROZEN is not approval. No FR or EN review is final without a named qualified reviewer and actual review date.

### Current source access and edition transition

- A fresh Library search did **not** surface the licensed IATA DGR 67th Edition 2026 manual itself. It surfaced historical work records stating that the manual/Bookshelf session had not been available in those earlier reviews and that owner 2FA re-authentication was required. Those historical records are not current regulatory evidence. No new Tier-A proposition was asserted or promoted in this run.
- IATA's [official DGR Updates page](https://www.iata.org/dgr-updates) now states that the **68th Edition (2027) electronic edition is available** and the 2027 DGR enters into force on **1 January 2027**. This is an edition-transition planning gate, not permission to substitute 68th Edition evidence for 2026 sittings or to carry 2026 approvals forward. Track [issue #400](https://github.com/relaxsaadi/cbta/issues/400): preserve the 2026 evidence/attempt history and create separate per-function 68th Edition impact/revalidation for 7.1–7.10 before 2027 use.

### Security, confidentiality and repository governance

- Current `main` still has the URL-query `?secret=CRON_SECRET` authentication bypass in middleware and inspected protected handlers. [PR #298](https://github.com/relaxsaadi/cbta/pull/298) proposes exact scheduled-GET allowlisting, server-side Bearer authentication and same-origin mutation checks; its static workflow passed, but the PR remains unmerged/undeployed. [PR #348](https://github.com/relaxsaadi/cbta/pull/348) is not a safe substitute because its legacy query-token design remains.
- Repository visibility remains **PUBLIC**. [Issue #340](https://github.com/relaxsaadi/cbta/issues/340) remains a critical answer-key/licensed-reference confidentiality blocker. PR #341's detector pass is on its own candidate tree, not containment or a scan proving PR #3 safe. No history rewrite, visibility change or assessment-pool mutation was attempted.
- `main.protected=false`; repository rulesets are empty and required checks are not enforced. [Issue #118](https://github.com/relaxsaadi/cbta/issues/118) remains an owner-side governance blocker.

### New related work and Claude Code review

- [PR #417](https://github.com/relaxsaadi/cbta/pull/417) is a new stacked draft on PR #22 addressing eager Supabase initialization in two dashboard pages. Its separate `kost-funnel` Preview is reported Ready, but environment-variable presence/absence was not independently verified, the PR is not merged, and this is not E-EXAM/Moodle acceptance.
- [PR #416](https://github.com/relaxsaadi/cbta/pull/416) remains a draft metadata-only SEO correction. It does not clear underlying public page-body claims; [#401](https://github.com/relaxsaadi/cbta/pull/401) and [#414](https://github.com/relaxsaadi/cbta/pull/414) still overlap and require consolidation before either is merged. The latest Claude-coauthored `main` commit `e1151964` concerns prospect-title matching, not DGR questions or E-EXAM. No new Claude-authored DGR bank/E-EXAM implementation PR was found.
- [PR #399](https://github.com/relaxsaadi/cbta/pull/399) and [PR #415](https://github.com/relaxsaadi/cbta/pull/415) have isolated candidate-integrity/webhook validations, but remain drafts and do not establish integrated provider-signed staging. [Issue #65](https://github.com/relaxsaadi/cbta/issues/65) assessment-scope integrity and [issue #225](https://github.com/relaxsaadi/cbta/issues/225) durable notification intent remain open.

### Release gates

| Gate | Status |
|---|---|
| Candidate workflow | Partial; isolated branch validations only |
| Roles/RBAC | Not accepted |
| Audit trail | Partial |
| FR source verification | Incomplete; 247 Tier-A-affected items |
| Independent EN bilingual review | Pending; 140 status-mirror discrepancies |
| Moodle/console integration | Not accepted |
| Security/confidentiality | Critical blocker |
| Integrated build/tests | Not accepted |
| Deployment/runbook/monitoring | Not accepted |
| Backup/recovery | Not accepted |
| Notification durability | Not accepted |

**Decision: PLATFORM NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed. If critical technical gates later pass while regulatory human review remains, the maximum permitted label is **technically/pre-production ready — human review pending**.
---

## AUDIT SNAPSHOT — 2026-11-24 15:41 Africa/Algiers (exact-head baseline 598705f)

> **Timestamped exact-head snapshot, not a live-head assertion:** PR [#3](https://github.com/relaxsaadi/cbta/pull/3), branch `ai/dgr-stage2b-handoff`, was at `598705fef7dec2b7a6758b1bc289284777cd69a3` (747 commits ahead / 0 behind `main`; 249 changed files; OPEN / DRAFT / UNMERGED) when the five workflows below completed. Compared with code-bearing baseline `21eddbc096c8c01864c608654bd14ead3913188c`, this snapshot represents 9 commits and one changed file only (`docs/PLATFORM_READY_CHECKLIST.md`, +18 / -16). The subsequent documentation-only commit `c73b7f38f9b7ce313568c9dcecf265019acc47f6` changed only this checklist to correct its head/run references; it brought the branch to 748 commits ahead / 0 behind `main`, still 249 changed files. No application code, question/answer data, regulatory evidence, FR/EN status, reviewer record, import flag, Moodle data or deployment changed. Exact-head checks on `c73b7f38` were in progress when this snapshot note was prepared; the completed results immediately below are specifically for `598705f`. See the PR description and Actions page for the newest head.

> **All five DGR workflows completed on exact head `598705f`:** CSV structure PASS [#45418512343](https://github.com/relaxsaadi/cbta/actions/runs/45418512343); controlled reviewer registry PASS [#45418506892](https://github.com/relaxsaadi/cbta/actions/runs/45418506892); governance regression PASS [#45418507569](https://github.com/relaxsaadi/cbta/actions/runs/45418507569); direct Tier-A provenance FAIL [#45418507356](https://github.com/relaxsaadi/cbta/actions/runs/45418507356); full DGR readiness FAIL [#45418506728](https://github.com/relaxsaadi/cbta/actions/runs/45418506728). The Tier-A run fails specifically at “Reject sampled-only Tier-A promotions” and “Require affirmative current-edition per-item evidence.” Full readiness fails at direct item Tier-A provenance, affirmative current-edition per-item evidence, and the final artifact gate. Its separate regulatory-governance-integrity job passes. Do not weaken these validators.

> **All-function bank state:** 453 FR / 453 EN question IDs; 287 official function-specific task-to-matrix rows; zero missing/extra EN IDs and zero missing/extra matrix links. Function task counts: 7.1=44, 7.2=23, 7.3=33, 7.4=37, 7.5=25, 7.6=28, 7.7=27, 7.8=23, 7.9=24, 7.10=23. FR ledger: 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE, 2 UNRESOLVED. Strict Tier-A affected: 7.1=18, 7.2=29, 7.3=30, 7.4=25, 7.5=20, 7.6=31, 7.7=25, 7.8=27, 7.9=22, 7.10=20 (247 total). Separate diagnostics: 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies. All 453 V2 candidates remain `IMPORT_ELIGIBLE=NO`; the qualified-reviewer registry is empty; zero APPROVED questions are established. Preserve each function’s own task set, matrix, blueprint and separate EN review; no Function 7.1 structure is copied to other functions. Each regulatory claim still requires direct, item-specific IATA DGR 67th Edition 2026 Tier-A evidence and separate named/dated qualified FR and EN review.

> **New public-copy regression found on `main`:** Claude-coauthored commit [`8005a2ac`](https://github.com/relaxsaadi/cbta/commit/8005a2acf971d026a52ef0a770e5255a2fb337b3) added a homepage FAQ claim that DGR IATA is “the only” training recognized by 300+ IATA member airlines and required by ANAC. The same unsupported statement is present in both visible FAQ and FAQPage JSON-LD on current `main`. Read-only verification confirms both remediation branches already neutralize this FAQ: [PR #401](https://github.com/relaxsaadi/cbta/pull/401) and [PR #414](https://github.com/relaxsaadi/cbta/pull/414) each update `app/page.tsx` and `components/FAQ.tsx` with evidence-bounded wording. #401’s exact-head public DGR compile gate passed [#44987097818](https://github.com/relaxsaadi/cbta/actions/runs/44987097818); #414 has no exact-head Actions run. The two PRs overlap in 34 files; consolidate and reconcile unique files before merging, do not merge both wholesale. Claude-coauthored [`e1151964`](https://github.com/relaxsaadi/cbta/commit/e115196448753d2871b9885a0ea5cbdaf071790e) only adds RDF/RDFE title matching to prospect discovery; it does not change the question bank or exam platform. No new Claude-authored DGR question-bank/E-EXAM PR was found.

> **Security and Stage 2B.1:** current `main` middleware still accepts `?secret=CRON_SECRET` to bypass Basic authentication on protected routes. [PR #298](https://github.com/relaxsaadi/cbta/pull/298) proposes exact scheduled-GET path allowlisting with server-side Bearer authentication and same-origin mutation checks; its static security workflow passed [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152), but the PR remains OPEN / DRAFT / UNMERGED / UNDEPLOYED. PR #399 E-EXAM validation passed [#42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728); PR #415 E-EXAM validation passed [#45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631). Both remain draft and do not establish integrated provider-signed staging. PR #416 has no exact-head Actions run; PR #417 has no GitHub Actions run and its Preview is for the separate `kost-funnel` project, not E-EXAM/Moodle.

> **Repository and release:** repository visibility is PUBLIC. [#340](https://github.com/relaxsaadi/cbta/issues/340) remains the public exam-bank confidentiality blocker; [#118](https://github.com/relaxsaadi/cbta/issues/118), [#65](https://github.com/relaxsaadi/cbta/issues/65) and [#225](https://github.com/relaxsaadi/cbta/issues/225) remain open governance/integrity/recovery issues. Candidate/RBAC/audit, independent bilingual review, Moodle/console integration, live security, integrated build, deployment/runbook and backup/recovery are not accepted. **PLATFORM NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## CURRENT EXACT-HEAD AUDIT — 2026-11-24 (latest exact-head validation)

> **Audited PR #3 head:** `ai/dgr-stage2b-handoff` was at `1eb209ea45dbeebfeb465eed644935741486d05e` (745 commits ahead / 0 behind `main`; 249 changed files) when the five workflows below completed. Comparing code-bearing baseline `21eddbc096c8c01864c608654bd14ead3913188c` to `1eb209ea` shows seven commits and one changed file only: `docs/PLATFORM_READY_CHECKLIST.md` (+3 / -17). All seven commits are documentation-only. No application code, question/answer content, regulatory evidence, FR/EN status, reviewer record, import flag, Moodle data or deployment changed. The stale `a50d041e` audit header has been corrected; this snapshot is anchored to the verified exact head `1eb209ea`.

> **All five DGR workflows completed on exact head `1eb209ea`:** import CSV structure PASS [#45412967399](https://github.com/relaxsaadi/cbta/actions/runs/45412967399); controlled reviewer registry PASS [#45412967148](https://github.com/relaxsaadi/cbta/actions/runs/45412967148); governance regression integrity PASS [#45412967175](https://github.com/relaxsaadi/cbta/actions/runs/45412967175); direct Tier-A provenance FAIL [#45412967299](https://github.com/relaxsaadi/cbta/actions/runs/45412967299); full DGR readiness FAIL [#45412967356](https://github.com/relaxsaadi/cbta/actions/runs/45412967356). Regression fixtures, CSV structure, evidence-artifact binding, unresolved-state import guards and the 287-row matrix review-evidence structural check pass. The full artifact gate still reports 107 representative/non-item-specific FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies; direct Tier-A still rejects missing item-specific current 67th Edition 2026 evidence. Preserve all holds; do not weaken validators.

## LATEST FOLLOW-UP — 2026-11-24 (Claude metadata correction and Preview result)

> **PR #416:** latest Claude Sonnet 5 commit is `33a16a01db495b94cbb6aef8bad1e67da63e264b`. It now removes the unsupported first/exclusive, ANAC-compliance, scarcity and 300+ airline-recognition assertions from the three changed pages' ordinary and Open Graph metadata. This corrects the earlier metadata-only finding. The underlying Algeria `CountryLandingPage` data and enterprise page body still contain provider-exclusivity, certificate-equivalence, ANAC and airline-recognition claims outside this PR. Follow-up comment [#7126699034](https://github.com/relaxsaadi/cbta/pull/416#issuecomment-7126699034) records the remaining public-claims scope. #416 remains OPEN / DRAFT; latest Vercel deployment is FAILURE and no GitHub Actions build/lint result is present. Page-body remediation remains with #401/#414.
>
> **PR #417:** Vercel reports the stacked Preview deployment as READY ([deployment](https://vercel.com/saadis-projects-09874ee5/kost-funnel/GU5i54DvHa3dcLxE268ioPiYrp3K)). This is a positive deployment result after the Resend/Supabase lazy-initialization changes, but does not independently prove whether Preview env variables were absent. Missing-config runtime and normal configured-environment tests remain pending; #417 is DRAFT on #22.
>
> **PR #3:** current handoff head remains `c231c35a08b3758e16b81c3f3a219298c0e5be02` (736 ahead / 0 behind `main`, 249 files, OPEN / DRAFT). Exact-head DGR workflows are 3 PASS / 2 FAIL (CSV #45359569896, reviewer #45359569655, governance #45359569549 PASS; Tier-A #45359570491 and full readiness #45359569411 FAIL). Current Vercel status is FAILURE for separate `kost-funnel` deployment [HH9Nzy...](https://vercel.com/saadis-projects-09874ee5/kost-funnel/HH9NzyEMsu4s76YD7AzwT3k3dCHF); the immediately preceding doc-only head had SUCCESS, so the preview status is inconsistent and is not E-EXAM acceptance.
>
> All 453 question rows remain import-ineligible; no question approved, no production deployment, no PR merged, no production secrets read/added, and no ANAC/IATA approval claimed. **PLATFORM NOT READY.**

---

## STATUS CORRECTION — 2026-11-24 (latest exact-head and Preview results)

> PR #3 current head at this correction: `271025e4496bce61ef58ecefe3d89b13d393cdcf` (735 ahead / 0 behind `main`, 249 files, OPEN / DRAFT / UNMERGED). All five exact-head DGR workflows completed: CSV [#45359178707](https://github.com/relaxsaadi/cbta/actions/runs/45359178707) PASS; reviewer [#45359178732](https://github.com/relaxsaadi/cbta/actions/runs/45359178732) PASS; governance [#45359179589](https://github.com/relaxsaadi/cbta/actions/runs/45359179589) PASS; direct Tier-A [#45359179103](https://github.com/relaxsaadi/cbta/actions/runs/45359179103) FAIL; full readiness [#45359179030](https://github.com/relaxsaadi/cbta/actions/runs/45359179030) FAIL. The PR #3 Vercel status is now SUCCESS for the separate `kost-funnel` project ([deployment](https://vercel.com/saadis-projects-09874ee5/kost-funnel/8aFAPx74AheCrBcbied2kPei75yG)); this is not E-EXAM/Moodle runtime acceptance.

> **PR #417 Preview status correction:** Vercel reports its stacked Preview deployment as READY ([deployment](https://vercel.com/saadis-projects-09874ee5/kost-funnel/GU5i54DvHa3dcLxE268ioPiYrp3K), [Preview](https://kost-funnel-git-fix-dashboard-s-d64ae1-saadis-projects-09874ee5.vercel.app)). This confirms a deployment completed, but does not prove whether Supabase/Resend variables were absent during that build. PR #417 remains DRAFT, stacked on #22; separate missing-config runtime and configured-environment tests remain required. Issue #21 now records this limitation. No production secret was read or added.

> **PR #416 remains blocked:** Claude Code's metadata-only change still carries unsupported provider-exclusivity, ANAC-compliance and 300+ airline-recognition wording; its Vercel deployment failed. Review comment #7126386008 requests neutral, evidence-bounded copy and coordination with #401/#414.

> No question-bank, answer, FR/EN status, reviewer record, import flag, Moodle data or production deployment changed in these follow-ups. The all-function counts and holds above remain in force. **PLATFORM NOT READY.**

---

## FOLLOW-UP — 2026-11-24 (Preview/build signal remediation)

> PR #3 head at this follow-up: `8d67dc48a53a10af93858b0bd5478b87a90b04cd` (734 ahead / 0 behind `main`, 249 files, OPEN / DRAFT / UNMERGED). Exact-head DGR workflows completed 3 PASS / 2 FAIL: CSV [#45358147643](https://github.com/relaxsaadi/cbta/actions/runs/45358147643), reviewer admission [#45358147209](https://github.com/relaxsaadi/cbta/actions/runs/45358147209), governance [#45358147233](https://github.com/relaxsaadi/cbta/actions/runs/45358147233) PASS; direct Tier-A [#45358147188](https://github.com/relaxsaadi/cbta/actions/runs/45358147188) and full readiness [#45358147227](https://github.com/relaxsaadi/cbta/actions/runs/45358147227) FAIL. The Vercel status is FAILURE for the separate `kost-funnel` project, not E-EXAM runtime acceptance. No question-bank or application code changed on PR #3.
>
> **New root-app Preview correction:** [PR #417](https://github.com/relaxsaadi/cbta/pull/417) is a draft stacked on [PR #22](https://github.com/relaxsaadi/cbta/pull/22). It removes the two remaining module-scope Supabase client constructions from `app/dashboard/blitz/page.tsx` and `app/dashboard/proposal/page.tsx`, reuses the existing lazy `lib/supabase.ts` proxy, and handles missing-config/query failures at runtime. Exact diff against #22 is two files only; read-back confirms no page-level `createClient(` remains. PR #417 Vercel deployment was PENDING at last check. This is a code-side correction, not a build pass. #22 handles eager Resend construction; #417 handles the separate dashboard Supabase import-time failure. Keep both drafts until a Preview build without production secrets succeeds and configured-environment behavior is checked. Issue #21 has been updated with the stacked fix.
>
> **New Claude Code public-copy review:** [PR #416](https://github.com/relaxsaadi/cbta/pull/416), branch `seo/onpage-fix-2026-11-24`, commit `4ddf5667b61e155e22ff3123ecfff6eca1df2772`, changes metadata on three public pages but retains unsupported “seul centre IATA CBTA Provider”, “conforme ANAC” and “reconnu par 300+ compagnies” assertions. Review comment [#7126386008](https://github.com/relaxsaadi/cbta/pull/416#issuecomment-7126386008) requests neutral evidence-bounded copy and coordination with #401/#414. #416 remains OPEN / DRAFT; its Vercel deployment failed and no GitHub Actions build/lint result is present.
>
> Repository remains PUBLIC; #340, #118, #65 and #225 remain open owner/release blockers. No production secrets were read or added. No PR merged/deployed and no question approved/imported. **PLATFORM NOT READY.**

---

## CURRENT AUDIT — 2026-11-24 09:34 Africa/Algiers

> **Decision: PLATFORM NOT READY.** This audit is based on PR #3 head `43d4334b460f1e8f2149edd5484f97b8da7e594b` before this documentation-only publication. At that point the PR was OPEN / DRAFT / UNMERGED, 733 commits ahead / 0 behind `main`, with 249 changed files. Compare from prior described head `f9617a15` shows two commits and only two documentation files changed: `docs/DGR_TIER_A_RECONCILIATION_453.md` (+3/−0) and `docs/PLATFORM_READY_CHECKLIST.md` (+68/−0). No question, answer, FR status, EN review, reviewer record, import flag, application code, Moodle record or deployment changed.

### Exact-head DGR workflows on 43d4334b

All five workflows completed:
- CSV structure PASS — [#45352779930](https://github.com/relaxsaadi/cbta/actions/runs/45352779930)
- Controlled reviewer admission PASS — [#45352779853](https://github.com/relaxsaadi/cbta/actions/runs/45352779853)
- Governance regression integrity PASS — [#45352779858](https://github.com/relaxsaadi/cbta/actions/runs/45352779858)
- Direct Tier-A provenance FAIL — [#45352779861](https://github.com/relaxsaadi/cbta/actions/runs/45352779861)
- Full DGR readiness FAIL — [#45352779844](https://github.com/relaxsaadi/cbta/actions/runs/45352779844)

The full-readiness run's regulatory-governance-integrity job passes. Its direct item Tier-A and affirmative current-edition evidence steps fail; the artifact gate therefore fails. The Tier-A run still rejects sampled-only Tier-A promotion and missing affirmative current-edition per-item evidence. Evidence-artifact binding, explicit unresolved SOURCE GAP/CONFLICT import holds and stale V2 import-hold regressions pass. Structural/governance success is not regulatory approval.

### All-function bank state carried forward; no item data changed

The latest reconciled ledger remains 453 FR / 453 EN IDs and 287 function-specific official task-to-matrix rows with exact task-ID correspondence for all ten functions. Current FR status counts: 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE, 2 UNRESOLVED. Strict Tier-A validator: 247 affected items by function: 7.1=18, 7.2=29, 7.3=30, 7.4=25, 7.5=20, 7.6=31, 7.7=25, 7.8=27, 7.9=22, 7.10=20. Separate findings: 107 historical FROZEN provenance exceptions and 140 FR→EN status-mirror discrepancies. The V2 candidate CSV remains 453/453 `IMPORT_ELIGIBLE=NO`, with blockers populated. Controlled qualified-reviewer registry remains empty; zero established APPROVED questions.

All ten functions retain their own official task set, source/competency matrix, Stage 2A blueprint and separate EN review package. The explicit historical 66th Edition course-baseline caveat occurs in blueprints 7.3–7.10; 7.1/7.2 do not carry that same explicit caveat. Every function still requires item-specific current 67th Edition 2026 Tier-A evidence. No Function 7.1 structure is copied to other functions. EN packages remain preparatory and require separate qualified reviewer + date.

### New Claude Code PR #416 — public DGR metadata claims

[PR #416](https://github.com/relaxsaadi/cbta/pull/416), branch `seo/onpage-fix-2026-11-24`, commit `4ddf5667b61e155e22ff3123ecfff6eca1df2772`, is a new Claude Sonnet 5-authored metadata-only change to three public pages. It shortens title/description strings, but retains “seul centre IATA CBTA Provider”, “conforme ANAC” and “reconnu par 300+ compagnies” assertions in public metadata/copy. Those claims remain under evidence review in [#401](https://github.com/relaxsaadi/cbta/pull/401) and [#414](https://github.com/relaxsaadi/cbta/pull/414). I posted a review comment on #416 ([comment #7126386008](https://github.com/relaxsaadi/cbta/pull/416#issuecomment-7126386008)) requesting neutral, evidence-bounded metadata and coordination with the existing claim-remediation drafts. #416 remains OPEN / DRAFT / UNMERGED.

#416 has no GitHub Actions build/lint workflow result. Its green “Vercel Preview Comments” check is not a build pass; the Vercel Preview deployment is reported failed. The PR discussion records local build failures at eager Resend initialization without an email key and then Supabase initialization when a dummy email key is supplied. Existing draft [#22](https://github.com/relaxsaadi/cbta/pull/22) guards four Resend constructors but does not resolve the reported Supabase URL initialization failure. Do not add production secrets to Preview. The Vercel status on PR #3 head 43d4334b is also FAILURE for the separate `kost-funnel` project; its exact deployment root cause was not established in this audit. These Vercel checks are not E-EXAM runtime acceptance.

### Stage 2B.1, security and owner blockers

- PRs #394–#399: sequential candidate/manual-grading/data-integrity drafts; exact-head E-EXAM workflows previously passed, but they remain unmerged and not integrated into provider-signed staging.
- PR #415: application + console CI passed on its recorded exact head; provider-signed staging, deployment and monitoring remain pending.
- PR #298: static cron/CSRF regression passed after removing URL-token and browser-secret paths; still unmerged/undeployed. Main remains affected until owner-authorized merge and live security verification.
- PR #401: public-claims build/guard passed on its recorded exact head. PR #414 overlaps 34/37 files and requires reconciliation before either is merged.
- PR #341's public-artifact detector pass does not remove already published content/history/forks or close confidentiality issue #340.

Repository visibility remains PUBLIC. Critical owner/release blockers remain [#340](https://github.com/relaxsaadi/cbta/issues/340) (exam answer-key confidentiality), [#118](https://github.com/relaxsaadi/cbta/issues/118) (branch protection), [#65](https://github.com/relaxsaadi/cbta/issues/65) (assessment scope integrity) and [#225](https://github.com/relaxsaadi/cbta/issues/225) (durable notification intent/recovery). No deployment environment values were read.

### Branch / Claude monitoring

The DGR branch search was exhausted (129 matches across two pages); no additional page remained. The `claude` branch-name search found only the historical `audit/dgr-claude-guidance-claims-gate-20261027`; the `seo` branch search found 13 matches and was exhausted. The new Claude-authored DGR-adjacent work is PR #416 above; no new Claude-authored regulatory-bank or E-EXAM code PR was identified.

### Release gates

Candidate workflow PARTIAL; roles/RBAC NOT ACCEPTED; audit trail PARTIAL; FR source verification INCOMPLETE; separate EN bilingual review PENDING; Moodle/console integration NOT ACCEPTED; security/confidentiality BLOCKED; integrated build/tests NOT ACCEPTED; deployment/runbook/monitoring NOT ACCEPTED; production backup/recovery NOT ACCEPTED; notification durability NOT ACCEPTED.

**PLATFORM NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed. If all critical technical gates later pass while regulatory human review remains, the maximum permitted label is **technically/pre-production ready — human review pending**.

---

## CURRENT AUDIT — 2026-11-24 08:51 Africa/Algiers

> **Decision: PLATFORM NOT READY.** This is a GitHub/documentation and CI audit, not a regulatory approval, production acceptance, merge or deployment. The live PR #3 baseline checked before these documentation-only corrections was `f9617a159cefb49180864dd6e3ac849caebc235f` (731 ahead / 0 behind `main`, 249 changed files, OPEN / DRAFT / UNMERGED). Commit `63eca0349cdff14e430fce5c6d59f2ef8e3f7d6e` adds the verified historical-`Next_Action` clarification to `docs/DGR_TIER_A_RECONCILIATION_453.md`; this checklist update is also documentation-only. No question, answer, FR source state, reviewer record, import flag, application code, Moodle data or deployment was changed.

### Exact-head regulatory gates on the pre-correction PR #3 head

All five workflows completed on `f9617a15`:
- CSV structure PASS — [#45348371144](https://github.com/relaxsaadi/cbta/actions/runs/45348371144)
- Controlled reviewer admission PASS — [#45348371112](https://github.com/relaxsaadi/cbta/actions/runs/45348371112)
- Governance regression integrity PASS — [#45348371151](https://github.com/relaxsaadi/cbta/actions/runs/45348371151)
- Direct Tier-A provenance FAIL — [#45348371234](https://github.com/relaxsaadi/cbta/actions/runs/45348371234)
- Full DGR readiness FAIL — [#45348371174](https://github.com/relaxsaadi/cbta/actions/runs/45348371174)

The full-readiness governance-integrity job passes; the regulatory artifact gate fails. Direct Tier-A logs include missing explicit 67th Edition binding (for example Q-7.1-010 and Q-7.2-009), missing recorded item-specific Bookshelf evidence (Q-7.2-035/039/044/049), and representative/non-direct evidence wording (Q-7.4-032 and Q-7.8-049). These are examples, not the complete affected set.

### Function-by-function reconciliation

The current per-item FR ledger was parsed directly: 453 questions, 287 function-specific official task rows, and exact task-ID/matrix correspondence for all ten functions. Status shorthand below is **F/D/P/G/C/S/U = FROZEN / DRAFT / PARTIAL / SOURCE GAP / SOURCE CONFLICT / STALE / UNRESOLVED**. Tier-A column is the strict validator's affected-item count, not a claim that the questions are substantively wrong.

| Function | Tasks | Questions | F/D/P/G/C/S/U | Tier-A affected |
|---|---:|---:|---|---:|
| 7.1 | 44 | 19 | 18/0/0/1/0/0/0 | 18 |
| 7.2 | 23 | 49 | 27/10/5/5/0/1/1 | 29 |
| 7.3 | 33 | 45 | 31/9/2/1/0/1/1 | 30 |
| 7.4 | 37 | 53 | 25/22/3/1/0/2/0 | 25 |
| 7.5 | 25 | 44 | 20/17/4/1/1/1/0 | 20 |
| 7.6 | 28 | 56 | 31/18/5/1/0/1/0 | 31 |
| 7.7 | 27 | 53 | 25/22/5/1/0/0/0 | 25 |
| 7.8 | 23 | 51 | 27/19/3/2/0/0/0 | 27 |
| 7.9 | 24 | 39 | 22/11/2/2/1/1/0 | 22 |
| 7.10 | 23 | 44 | 20/19/2/1/1/1/0 | 20 |
| **Total** | **287** | **453** | **246/147/31/16/3/8/2** | **247** |

The current EN-package mirror validator reports **140** stale/missing FR-to-EN status mirrors (7.2:11, 7.3:20, 7.4:13, 7.5:16, 7.6:18, 7.7:19, 7.8:15, 7.9:16, 7.10:12). EN draft presence is not bilingual review. The controlled reviewer registry remains empty; zero established APPROVED questions. All 453 candidate rows are `IMPORT_ELIGIBLE=NO`, and all 453 have nonblank blockers.

### Historical import-hint correction

Commit `63eca034` records an independently reproduced correction: the current reconciliation CSV has **236** historical `Next_Action` phrases “Import-eligible for V2 (pending reviewer sign-off)” (per function 13/23/30/25/20/31/25/27/22/20), versus **237** at historical baseline `4747d7b817fd288adff19fe836a94d15b1d5d672`. The sole removed hint is Q-7.3-029. Exact ID join: 236/236 hints map to `IMPORT_ELIGIBLE=NO`; current candidate CSV is 453/453 NO with zero blank blockers. `Next_Action` is historical narrative, never current permission or approval.

### New/related DGR draft PR audit

- **[#413 — explicit 453 import blockers](https://github.com/relaxsaadi/cbta/pull/413):** do not merge as-is. Its head `edea57c8` has no associated workflow runs and its base is the old PR #3 commit `4747d7b8`. The CSV-structure checker blob is already identical to current PR #3; current PR #3 already has 453/453 NO and zero blank blockers. The only candidate-row difference is Q-7.3-029, where #413 replaces the current human-review/confidentiality hold with a Tier-A-unresolved blocker. The current exact-head Tier-A failure log does not flag Q-7.3-029, and the current per-item reason records a direct Bookshelf read for that item's claim. #413 also weakens that reason to generic live/spot-verified wording. Rebase/reconcile before any further review; do not import its row blindly.
- **[#411 — historical 237 vs current 236 hints](https://github.com/relaxsaadi/cbta/pull/411):** the count correction is now incorporated into the PR #3 reconciliation document by commit `63eca034`; no source status or import flag changed.
- **[#412 — Function 7.10 battery/power-bank blueprint caveat](https://github.com/relaxsaadi/cbta/pull/412):** its blueprint blob is already identical to current PR #3. The caveat correctly prevents the old >15 AEP / >20 battery course-slide threshold from being used as a current-2026 rule; IATA's public operator guidance is only an applicability/conflict lead, not a substitute for licensed item-specific Tier-A verification.
- **[#408](https://github.com/relaxsaadi/cbta/pull/408), [#409](https://github.com/relaxsaadi/cbta/pull/409), [#410](https://github.com/relaxsaadi/cbta/pull/410):** warning-only EN reviewer-guide corrections remain separate drafts based on old PR #3 baseline `4747d7b8`. Their governance/reviewer workflows pass, but Tier-A and full-readiness workflows fail. They correctly warn that package FR-status fields are historical mirrors, not authoritative current states. They do not complete the 140 per-item mirror corrections or any human EN review. Do not treat their historical branch-specific counts as current.

### Stage 2B.1, security and public claims

- [#399](https://github.com/relaxsaadi/cbta/pull/399) exact-head E-EXAM V2 validation [#42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728) PASS; remains OPEN/DRAFT and not integrated into provider-signed staging.
- [#415](https://github.com/relaxsaadi/cbta/pull/415) exact-head app/console validation [#45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631) PASS; remains stacked/draft, with genuine provider-signed staging, deployment and monitoring pending.
- [#298](https://github.com/relaxsaadi/cbta/pull/298) static cron-auth security workflow [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152) PASS; still OPEN/DRAFT/UNMERGED/UNDEPLOYED. Main remains affected until owner-authorized merge and live verification.
- [#401](https://github.com/relaxsaadi/cbta/pull/401) current-head public-claims build/guard [#44987097818](https://github.com/relaxsaadi/cbta/actions/runs/44987097818) PASS. [#414](https://github.com/relaxsaadi/cbta/pull/414) has no exact-head workflow run and overlaps #401; consolidate before merge.
- [#341](https://github.com/relaxsaadi/cbta/pull/341) public exam-artifact detector CI [#45090168973](https://github.com/relaxsaadi/cbta/actions/runs/45090168973) PASS, but a detector pass does not remove public history/forks/artifacts or close confidentiality issue [#340](https://github.com/relaxsaadi/cbta/issues/340).

Repository visibility is **PUBLIC**. Owner/release blockers remain #340 (exam answer-key confidentiality), #118 (branch protection), #65 (assessment scope integrity) and #225 (durable notification recovery). No deployment environment values were read.

### Claude Code / branch search

The DGR-related branch search was exhausted across **129** matching branches. The only branch name explicitly containing “claude” is the historical `audit/dgr-claude-guidance-claims-gate-20261027`; its [PR #343](https://github.com/relaxsaadi/cbta/pull/343) remains an older OPEN/DRAFT documentation proposal. No new Claude-named DGR branch or recent Claude-attributed commit was found.

### Release gates

Candidate workflow PARTIAL; RBAC NOT ACCEPTED; audit trail PARTIAL; FR source verification INCOMPLETE; EN bilingual review PENDING; Moodle/console integration NOT ACCEPTED; security/confidentiality BLOCKED; integrated build/tests NOT ACCEPTED; deployment/runbook/monitoring NOT ACCEPTED; backup/recovery NOT ACCEPTED; notification durability NOT ACCEPTED.

**Release decision remains PLATFORM NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## EXACT-HEAD RE-RUN — checklist commit a8c574c7

> The 08:16 checklist-only commit `a8c574c7ce300ba1442c7ce059b15462dd349840` is now the live PR #3 head. Compare from `257e4612` confirms exactly one changed file, `docs/PLATFORM_READY_CHECKLIST.md` (+19 / −0); the PR is 730 commits ahead / 0 behind `main`, 249 changed files, OPEN / DRAFT / UNMERGED. All five workflows on that exact head completed: CSV structure PASS [#45348066814](https://github.com/relaxsaadi/cbta/actions/runs/45348066814), controlled reviewer admission PASS [#45348066813](https://github.com/relaxsaadi/cbta/actions/runs/45348066813), governance regression PASS [#45348066807](https://github.com/relaxsaadi/cbta/actions/runs/45348066807), direct Tier-A provenance FAIL [#45348066922](https://github.com/relaxsaadi/cbta/actions/runs/45348066922), and full DGR readiness FAIL [#45348066771](https://github.com/relaxsaadi/cbta/actions/runs/45348066771). In the full-readiness run, regulatory-governance integrity passes; the full artifact gate fails with 453 FR / 453 EN IDs, 287 matrix rows, zero missing/extra EN IDs or matrix links, 107 historical FROZEN provenance exceptions and 140 FR↔EN status drifts. Direct Tier-A failure includes missing direct item evidence for the held FROZEN population and terminal records with representative/cross-applied or absent per-item evidence (including Q-7.1-011, Q-7.2-016/035/039/044/049, Q-7.4-040, Q-7.6-003 and Q-7.9-015/028). The V2 candidate population remains 453/453 `IMPORT_ELIGIBLE=NO`. No question, answer, reviewer, source status, import flag, application code or Moodle data changed in this documentation-only commit. **PLATFORM NOT READY.**

---

## CURRENT AUDIT — 2026-11-24 08:16 Africa/Algiers

> **Decision: PLATFORM NOT READY.** This audit adds current GitHub/CI evidence; it does not approve a question, alter an FR/EN source state, authorize an import, merge a PR, deploy production, or claim ANAC/IATA approval.
>
> - **PR #3 exact baseline before this checklist-only update:** branch `ai/dgr-stage2b-handoff` at `257e4612059ddd4413322b83187afcde632a7b7e`, 729 commits ahead / 0 behind `main`, 249 changed files; OPEN / DRAFT / UNMERGED. The branch's exact-head workflow set is complete: CSV structure PASS [#45339088698](https://github.com/relaxsaadi/cbta/actions/runs/45339088698), controlled reviewer admission PASS [#45339088645](https://github.com/relaxsaadi/cbta/actions/runs/45339088645), governance regression PASS [#45339088738](https://github.com/relaxsaadi/cbta/actions/runs/45339088738), direct Tier-A provenance FAIL [#45339088792](https://github.com/relaxsaadi/cbta/actions/runs/45339088792), full DGR readiness FAIL [#45339088897](https://github.com/relaxsaadi/cbta/actions/runs/45339088897). The full-readiness governance-integrity job passes, but the full artifact gate fails.
> - **All ten function structures independently rechecked:** official task-set and source/competency-matrix task IDs match exactly, with no missing/extra IDs: 7.1=44, 7.2=23, 7.3=33, 7.4=37, 7.5=25, 7.6=28, 7.7=27, 7.8=23, 7.9=24, 7.10=23 (287 total). This preserves each function's own structure; no 7.1 template is imposed on other functions.
> - **Current 453-row FR ledger:** 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 GAP, 3 CONFLICT, 8 STALE, 2 UNRESOLVED. Direct Tier-A workflow flags 247 item IDs (7.1:18, 7.2:29, 7.3:30, 7.4:25, 7.5:20, 7.6:31, 7.7:25, 7.8:27, 7.9:22, 7.10:20); it also rejects representative/batch/cross-applied evidence in terminal states. The full artifact gate reports 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies. The separate V2 candidate CSV remains 453/453 `IMPORT_ELIGIBLE=NO`.
> - **Human review:** all ten EN review packages explicitly prohibit APPROVED status in the absence of qualified human review and retain `BILINGUAL TECHNICAL REVIEW REQUIRED` / `PENDING REVIEWER + DATE`. The canonical controlled reviewer registry is empty. Zero established APPROVED questions.
> - **Stage 2B.1 additional stacked fixes:** PRs #394, #395, #396, #397 and #398 each have an exact-head E-EXAM V2 validation workflow SUCCESS (#42243884509, #42266097876, #42278909402, #42288746548, #42295521395 respectively); PR #399's later exact-head validation also SUCCESS (#42539993728). These are sequential OPEN / DRAFT branches, not merged production code or integrated staging acceptance. Separate PR #415 exact-head app/console validation passes both jobs (#45169572631); provider-signed staging, deployment and monitoring remain pending. The historical #392 console build failure is not erased by later stacked CI.
> - **Security:** PR #298 remains OPEN / DRAFT / UNMERGED / UNDEPLOYED at `8ecdc5e1c997d3fe3e6b38d2a1a04b58bb9c910c`; static cron/CSRF regression passed [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152). Read-back confirms its branch removes the middleware URL-secret bypass, four dashboard `NEXT_PUBLIC_CRON_SECRET` references and the legacy LinkedIn URL-token GET. On `main`, the middleware bypass and browser-secret references remain in Agent, Intel, LinkedIn and Instructors pages. No deployment environment values were read; no live credential exposure is asserted. Require independent review, external-caller check, deployment, live cron/browser/SSE/CSRF tests, exposure/rotation decision and rollback verification.
> - **Public-claims correction:** PR #401 head `ef721e1b909fca5e45889455d10838b1f08e4d08` has its public DGR TypeScript/build/claim-guard workflow SUCCESS [#44987097818](https://github.com/relaxsaadi/cbta/actions/runs/44987097818). PR #414 remains OPEN / DRAFT with no exact-head workflow run; it overlaps 34 of #401's 45 changed files, with only `FormationsTable.tsx`, `LeadForm.tsx`, and `TrainerBio.tsx` unique to #414. Reconcile the three unique components and run exact-head CI before considering one consolidated correction. Main remains unchanged.
> - **Confidentiality/governance:** repository metadata confirms `private=false` (PUBLIC); issue #340 remains OPEN for public draft question/answer-key exposure. PR #341's public-artifact detector workflow passes [#45090168973](https://github.com/relaxsaadi/cbta/actions/runs/45090168973), but a detector is not confidentiality remediation. Owner/release blockers #118 (branch protection), #65 (assessment scope integrity) and #225 (durable notification intent) remain OPEN.
> - **Edition transition:** IATA's official DGR updates page says the 68th Edition (2027) electronic edition is available and the 2027 regulations take effect **2027-01-01** ([IATA DGR updates](https://www.iata.org/dgr-updates)). As of this audit date, the 67th Edition (2026) remains the current baseline. Keep 2026 evidence immutable and plan a separate item-by-item 68th Edition rebaseline before any 2027 exam use; do not mix editions or treat the public significant-changes summary as licensed Tier-A evidence. See issue #400.
> - **Claude / branch watch:** pagination completed at 129 DGR-matching branch names, 57 exact `ai/` prefix names and one historical Claude-specific DGR-guidance branch. No new Claude-attributed DGR commit/branch or related PR created 2026-11-24 was identified; latest identifiable Claude co-authored main commit remains `e115196` (2026-08-23), unrelated to exam readiness.
>
> No PR merged, no deployment, no question approved/imported, no DRM bypass, and no ANAC/IATA approval claimed.

---

## CORRECTION — 66th Edition course-baseline caveat spans Functions 7.3–7.10 — 2026-11-24 07:06 Africa/Algiers

> **This corrects the earlier checklist wording that limited the 66th Edition course-baseline limitation to Functions 7.8 and 7.9.** Direct line-level inspection of all ten current Stage 2A blueprints finds the explicit statement “Course baseline is the DGR 66th Edition, not the current 67th” in Functions **7.3 (line 121), 7.4 (174), 7.5 (128), 7.6 (130), 7.7 (161), 7.8 (160), 7.9 (186) and 7.10 (215)**. The same explicit course-baseline caveat was not found in the 7.1 or 7.2 blueprints; that does not exempt any 7.1/7.2 item from direct current 67th Edition 2026 Tier-A verification. The caveat is a course/source-provenance limitation, not proof that every individual question is substantively wrong; each regulatory claim and correct answer still requires direct item-specific current-edition evidence.
>
> **Independent structural recheck:** the 10 canonical official task sets and their 10 source/competency matrices match row-for-row at 7.1=44, 7.2=23, 7.3=33, 7.4=37, 7.5=25, 7.6=28, 7.7=27, 7.8=23, 7.9=24 and 7.10=23 (287 total). Function 7.1's 44-task structure is not imposed on other functions.
>
> **Current regulatory hold remains:** exact-head Tier-A workflow on PR #3 head `ffd4d9942fe86781bcf29212de65bae8d2c17485` identifies 247 unique affected questions (7.1:18, 7.2:29, 7.3:30, 7.4:25, 7.5:20, 7.6:31, 7.7:25, 7.8:27, 7.9:22, 7.10:20). The 453-row FR ledger remains 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 GAP, 3 CONFLICT, 8 STALE and 2 UNRESOLVED. The separate 453-row V2 import CSV remains 453/453 `IMPORT_ELIGIBLE=NO`; no qualified-reviewer registry entry or established APPROVED question exists. All ten EN packages explicitly require separate qualified bilingual review and a named reviewer/date; draft translation is not approval.
>
> **Public-claims release hold:** current `main` still contains unsubstantiated “first/only” IATA CBTA Provider, certificate-equivalence, universal ANAC/operator recognition and 90% pass-rate statements in public/AI-facing copy. PR #401 has a successful exact-head TypeScript/claim-guard/Next.js build workflow (#44987097818); PR #414 overlaps 34 of 37 files with #401, has three unique component files and no exact-head workflow result. Reconcile the drafts rather than merging overlapping changes independently. Audit comments were posted on PR #3 and PR #414.
>
> **Other technical state:** PR #298's static cron/CSRF regression workflow passed after removal of the legacy LinkedIn URL-token GET handler, but #298 remains unmerged/undeployed and main still has the old middleware/browser-secret code. PR #415's app/console CI passed, but provider-signed staging, deployment and monitoring remain pending. Repository visibility remains PUBLIC; #340, #118, #65 and #225 remain open blockers.
>
> **Release remains PLATFORM NOT READY.** No PR merged, no deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## CORRECTION — exact-head DGR workflows on current PR #3 head — 2026-11-24 05:47 Africa/Algiers

> This corrects the 05:20 statement that no DGR workflow run was reported for checklist-only updates. GitHub now exposes a completed exact-head five-workflow set for current PR #3 head `763d96b7ba261e9cbee3d049594985eeb63f56e7`. The comparison from `a8bf54ae9871d1767c2eca7cbe899b5998358a2e` to this head is five commits ahead / zero behind and changes only this checklist (+19 / −0); no DGR application, question, answer, evidence, reviewer, import or Moodle data changed.

- **Exact-head workflow results on `763d96b7`:** import CSV structure PASS ([#45326309171](https://github.com/relaxsaadi/cbta/actions/runs/45326309171)); controlled reviewer admission PASS ([#45326309166](https://github.com/relaxsaadi/cbta/actions/runs/45326309166)); governance regression integrity PASS ([#45326309212](https://github.com/relaxsaadi/cbta/actions/runs/45326309212)); direct item Tier-A provenance FAIL ([#45326309240](https://github.com/relaxsaadi/cbta/actions/runs/45326309240)); full DGR readiness FAIL ([#45326309226](https://github.com/relaxsaadi/cbta/actions/runs/45326309226)). All five runs are completed; this is the current exact-head result, not merely the preceding code-identical `a8bf54ae` baseline.
- **Failure detail:** the direct Tier-A job reports missing direct item-specific current-DGR evidence for terminal rows and representative/batch/cross-applied evidence; the full-readiness job repeats the function-specific frozen-evidence and FR↔EN status-mirror findings. It reports 453 FR IDs, 453 EN IDs, zero missing/extra EN IDs, 287 matrix task rows, zero missing/extra matrix links, 107 historical FROZEN provenance exceptions and 140 FR↔EN status drifts. Its artifact gate remains FAIL. The Tier-A regression fixtures, evidence-artifact binding checks, CSV structure checks and unresolved SOURCE GAP/CONFLICT import-hold checks pass; these passing guards do not cure the missing regulatory evidence.
- **Decision unchanged:** all ten function packages remain non-approved and 453/453 import-ineligible; direct Tier-A evidence, FR/EN human review and named qualified reviewer + date remain required. Functions 7.8/7.9 retain the 66th Edition baseline limitation; Q-7.10-012 remains SOURCE CONFLICT and Q-7.10-038 remains DRAFT/Tier B only.
- **Other current exact heads unchanged:** PR #298 remains OPEN/DRAFT/UNMERGED at `8ecdc5e1c997d3fe3e6b38d2a1a04b58bb9c910c`, with static security workflow #45325913152 SUCCESS; PR #415 remains OPEN/DRAFT/UNMERGED with application and console workflow #45169572631 SUCCESS, but provider-signed staging/deployment/monitoring remain pending. Repository visibility remains PUBLIC; #340, #118, #65 and #225 remain open owner/release blockers. No new Claude-attributed DGR commit/PR was found in this check.

**Release remains PLATFORM NOT READY.** No PR merged, no deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## CURRENT AUTHORITATIVE READINESS — 2026-11-24 05:20 Africa/Algiers

> This addendum supersedes the 02:49/02:55 snapshots below. **Decision remains OPEN / DRAFT / UNMERGED / PLATFORM NOT READY.** It records a security correction on PR #298 only; no merge, deployment, question-bank approval/import or Moodle production-data change occurred.

- **PR #3 live state:** `ai/dgr-stage2b-handoff` remains OPEN / DRAFT / UNMERGED with 249 changed files. The current branch head is the checklist-only commit that publishes this addendum; use live [PR #3 metadata](https://github.com/relaxsaadi/cbta/pull/3) for its exact SHA and ahead count rather than hard-coding a pointer that each checklist update advances. Since the last code-identical regulatory audit at `a8bf54ae`, the handoff updates have changed only `docs/PLATFORM_READY_CHECKLIST.md`; no DGR application, question, answer, evidence, reviewer, import or Moodle data changed. The latest completed five-workflow regulatory set remains on that code-identical head `a8bf54ae`: import CSV structure PASS ([#45308230565](https://github.com/relaxsaadi/cbta/actions/runs/45308230565)); governance regression PASS ([#45308230706](https://github.com/relaxsaadi/cbta/actions/runs/45308230706)); controlled reviewer admission PASS ([#45308230651](https://github.com/relaxsaadi/cbta/actions/runs/45308230651)); direct Tier-A provenance FAIL ([#45308230598](https://github.com/relaxsaadi/cbta/actions/runs/45308230598)); full DGR readiness FAIL ([#45308230564](https://github.com/relaxsaadi/cbta/actions/runs/45308230564)). No new DGR workflow run is reported for the checklist-only updates; the combined status shows only a pending Vercel check for the separate `kost-funnel` project, not E-EXAM or DGR acceptance.
- **New PR #298 correction:** the unlisted legacy LinkedIn `GET ?secret=` background trigger has been removed from PR #298 branch `fix/strict-cron-bearer-boundary-20261024`. Commit `1e2bf1941358bd45a088ce41c6d37631c5b83bfc` removes the GET handler and unused `after` import; commit `8ecdc5e1c997d3fe3e6b38d2a1a04b58bb9c910c` adds regression assertions that POST remains and GET/URL-token/background execution are absent. Exact-head static workflow [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152) completed SUCCESS, including cron-boundary and dashboard-origin/CSRF tests. Read-back confirms POST remains, GET is absent, and the route contains no `searchParams.get('secret')`, `CRON_SECRET` or `after()`. The route is not one of the seven Vercel schedule targets; no in-repository caller was found. This removes an unnecessary privileged URL-token path but does not prove there are no external callers; confirm external integrations before merge.
- **PR #298 remains a proposal only:** current head `8ecdc5e1c997d3fe3e6b38d2a1a04b58bb9c910c`, 37 commits / 25 changed files, OPEN / DRAFT / UNMERGED / UNDEPLOYED. Its exact-head static CI passed. Main and PR #3 handoff still contain the old middleware URL-secret bypass and four dashboard `NEXT_PUBLIC_CRON_SECRET` references until owner-approved merge/deployment. No deployment environment values were read; no live credential exposure is asserted. Live cron, browser/SSE/CSRF, credential-exposure/rotation, rollback, manual-send consent/suppression/idempotency and external-caller checks remain pending.
- **All ten function packages remain held:** 10 official task sets, 10 source/competency matrices, 10 Stage 2A blueprints and 10 separate EN review packages (40/40). Official task rows: 7.1=44; 7.2=23; 7.3=33; 7.4=37; 7.5=25; 7.6=28; 7.7=27; 7.8=23; 7.9=24; 7.10=23 (287 total). Current 453 FR source buckets remain 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE and 2 UNRESOLVED. The separate V2 candidate CSV remains 453/453 `IMPORT_ELIGIBLE=NO`. Exact-head findings remain 247 unique Tier-A-affected IDs, 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies. Reviewer registry remains empty; zero established APPROVED questions.
- **Function-specific limitations remain:** Functions 7.8 and 7.9 identify a 66th Edition course baseline and require current 67th Edition revalidation. Q-7.10-012 remains SOURCE CONFLICT; Q-7.10-038 remains DRAFT / Tier B only / SOURCE REQUIRED for Tier A, with a power-bank addendum warning but no row-level SOURCE CONFLICT. Do not change effective status from a warning field.
- **Stage 2B.1:** PR #415 head `4f73f7ebcc20aa569d6e4c516654dc047fcaf9fe` remains OPEN / DRAFT / UNMERGED on #336; exact-head application and console validation [#45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631) passed, but genuine provider-signed staging, deployment and monitoring remain pending. PR #392's exact-head console production-build failure remains historical; later stacked #393 success does not establish integrated staging acceptance. Notification recovery remains incomplete.
- **Branch / Claude watch:** DGR branch search pagination completed at 129 names (100 + 29 + terminal 0); exact `ai/` prefix search returned 57 names and terminal 0; Claude-specific branch search returned one historical branch and terminal 0. Claude-keyword commit search shows historical matches only; latest identifiable co-authored main commit `e115196` is dated 2026-08-23 and is unrelated to DGR readiness. No PR was created on 2026-11-24; no new Claude-attributed DGR readiness commit or branch was identified.
- **Related draft PR integration audit:** #341's public-artifact path/keyed-Markdown detector has exact-head workflow [#45090168973](https://github.com/relaxsaadi/cbta/actions/runs/45090168973) PASS, but it is a post-push detective control and cannot remove already-public answers, history, forks or artifacts. PRs #411, #412 and #413 are stacked on historical PR #3 base `4747d7b817fd288adff19fe836a94d15b1d5d672`, not the current handoff head; #411 and #412 have Tier-A/full-readiness FAILs (governance/reviewer checks pass), and no workflow run was retrieved for #413. Rebase/reconcile against the current handoff and re-run exact-head checks before considering them. PR #414 is main-based (51 commits / 37 files) and its own description records nine shared-file overlaps with #401; reconcile shared files and review public claims before either is merged. These PRs remain OPEN / DRAFT / UNMERGED; none establishes question approval or public-exposure remediation.
- **Owner blockers:** #340 public answer-bank/source-reference exposure; #118 main branch protection/ruleset enforcement; #65 assessment scope integrity; #225 durable notification intent/recovery. Repository remains PUBLIC. Owner/admin action and confidentiality remediation remain required.
- **Platform gates:** candidate workflow partial; roles/RBAC not accepted; audit/reconstruction partial; bilingual human review pending; integrated Moodle/console staging not accepted; security/confidentiality critical blocker; integrated release-candidate build/tests not accepted; deployment/runbook/monitoring not accepted; production backup/recovery not accepted; notification delivery/recovery not accepted.

**Release remains PLATFORM NOT READY.** No PR merged, no deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.

---

## CURRENT AUTHORITATIVE READINESS — 2026-11-24 02:49 Africa/Algiers

> This snapshot supersedes the 01:30 snapshot below. Decision remains **OPEN / DRAFT / UNMERGED / PLATFORM NOT READY**. This is a documentation/status update only; no question, answer, evidence state, reviewer approval, import flag, application code, Moodle record or deployment was changed.

- **PR #3 live state:** `ai/dgr-stage2b-handoff` head `e6b1b91aaaf42cf53fea29633f44929b145e0ac8`; base/main `e115196448753d2871b9885a0ea5cbdaf071790e`; 721 commits ahead / 0 behind; 249 changed files. The head remains documentation-only relative to the preceding audit.
- **Exact-head DGR workflows on e6b1b91a — all five now completed:** import CSV structure PASS ([#45298062834](https://github.com/relaxsaadi/cbta/actions/runs/45298062834)); controlled reviewer admission PASS ([#45298062803](https://github.com/relaxsaadi/cbta/actions/runs/45298062803)); governance regression integrity PASS ([#45298063231](https://github.com/relaxsaadi/cbta/actions/runs/45298063231)); direct item Tier-A provenance FAIL ([#45298062957](https://github.com/relaxsaadi/cbta/actions/runs/45298062957)); full DGR readiness FAIL ([#45298062797](https://github.com/relaxsaadi/cbta/actions/runs/45298062797)). In the full-readiness run, the separate regulatory-governance-integrity job passed; the full readiness artifact job failed. The Tier-A log lists **247 unique affected question IDs** and rejects representative/batch/cross-applied or otherwise non-direct evidence wording.
- **Exact reconciliation:** 453 unique FR ledger IDs across all functions; current source buckets are 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 GAP/SOURCE GAP, 3 CONFLICT/SOURCE CONFLICT, 8 STALE and 2 UNRESOLVED. The separate V2 candidate CSV contains 453 unique IDs and **453/453 IMPORT_ELIGIBLE=NO**. Full readiness confirms 453 FR IDs, 453 EN IDs, zero missing/extra EN IDs, 287 matrix task rows, zero missing/extra matrix links, 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies. The 107 and 140 are separate validator findings, not approvals.
- **All ten functions independently checked:** 10 canonical official task sets, 10 source/competency matrices, 10 Stage 2A blueprints and 10 separate EN review packages. Official task counts are 7.1=44; 7.2=23; 7.3=33; 7.4=37; 7.5=25; 7.6=28; 7.7=27; 7.8=23; 7.9=24; 7.10=23 (287 total). The matrix files explicitly state their own function-specific derivation and retain SOURCE GAP/CONFLICT where applicable. Each EN package remains preparatory: BILINGUAL TECHNICAL REVIEW REQUIRED, PENDING REVIEWER + DATE; no package establishes qualified human review or APPROVED status. The 247 Tier-A-affected IDs by function remain 7.1:18, 7.2:29, 7.3:30, 7.4:25, 7.5:20, 7.6:31, 7.7:25, 7.8:27, 7.9:22, 7.10:20.
- **Function 7.8 and 7.9 edition limitation:** both blueprints identify a 66th Edition course baseline; references in their matrices do not replace direct item-specific IATA DGR 67th Edition 2026 Tier-A evidence. They remain provisional and non-importable.
- **Function 7.10 effective status:** Q-7.10-012 remains SOURCE CONFLICT. Q-7.10-038 remains DRAFT / Tier B only / SOURCE REQUIRED for Tier A; its power-bank addendum warning is not an effective row-level SOURCE CONFLICT. Both remain non-importable.
- **Main-branch dashboard security:** read-only source inspection confirms `middleware.ts` on `main` still accepts a matching URL `secret` parameter against server-side `CRON_SECRET`; all four dashboard client pages still reference `NEXT_PUBLIC_CRON_SECRET`. No deployment environment value was read, so no live credential exposure is asserted. PR #298 head `75bc1b722db2060a4018e7b830366a692484c213` removes the query-token bypass and all four browser references; its static boundary workflow [#45090271696](https://github.com/relaxsaadi/cbta/actions/runs/45090271696) passes. PR #298 remains OPEN / DRAFT / UNMERGED / UNDEPLOYED; independent review and deployed cron, browser, CSRF/SSE, credential-exposure and rollback tests remain pending.
- **Stage 2B.1:** PR #415 head `4f73f7ebcc20aa569d6e4c516654dc047fcaf9fe` has both application and console jobs successful in [#45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631), but remains OPEN / DRAFT / UNMERGED on #336; provider-signed staging, deployment and monitoring are pending. PR #392's exact-head [#42234634581](https://github.com/relaxsaadi/cbta/actions/runs/42234634581) has application PASS and console production-build FAIL; later stacked PR #393 [#42235683438](https://github.com/relaxsaadi/cbta/actions/runs/42235683438) passes both jobs but does not erase #392's historical failure or prove integrated staging acceptance.
- **Branch / Claude watch:** DGR branch pagination completed at 129 names (100 + 29 + terminal 0); exact `ai/` prefix search returned 57 names and terminal 0; Claude-specific branch search returned one historical branch and terminal 0. Claude-keyword commit search returned 14 historical matches; the latest identifiable co-authored main commit `e115196` is dated 2026-08-23 and concerns airline prospect-contact matching, not DGR readiness. No PR was created on 2026-11-24 in the repository search.
- **Owner blockers:** #340 public answer-bank/source-reference exposure; #118 branch-protection/ruleset enforcement; #65 candidate/company/group/assessment scope integrity; #225 durable notification intent/recovery. Repository visibility remains PUBLIC.
- **Platform gates:** candidate workflow partial; roles/RBAC not accepted; audit/reconstruction partial; bilingual human review pending; integrated Moodle/console staging not accepted; security/confidentiality critical blocker; integrated release-candidate build/tests not accepted; deployment/runbook/monitoring not accepted; production backup/recovery not accepted; notification delivery/recovery not accepted.

**Release remains PLATFORM NOT READY.** No question approved/imported, no PR merged, no deployment, no DRM bypass and no ANAC/IATA approval claimed.

---

# KOST DGR/CBTA Exam Platform — READY Gate

This checklist defines the end condition for the project. Do **not** claim `PLATFORM READY TO USE` until every critical gate below is supported by direct evidence.

> **CURRENT AUDIT OVERRIDE — 2026-11-24 01:30 Africa/Algiers: PLATFORM NOT READY.** This replaces the stale 2026-11-23 16:07 snapshot above the historical chronology. This is a documentation-only audit update; it does not approve questions, alter source/reviewer/import states, merge PRs, deploy code, or change Moodle/production data.
>
> **PR #3 / handoff baseline before this checklist-only update:** live branch `ai/dgr-stage2b-handoff` at `2a6e07c544b29703822fb4bf42d1e8996e5010ae`, base/main `e115196448753d2871b9885a0ea5cbdaf071790e`; independent compare confirms **719 commits ahead / 0 behind and 249 changed files**. PR #3 remains OPEN / DRAFT / UNMERGED. This audit found no new DGR application/question-bank commit since that head.
>
> **Exact-head DGR workflows on `2a6e07c5` — all five completed:** import CSV structure PASS ([#45282839741](https://github.com/relaxsaadi/cbta/actions/runs/45282839741)); governance regression integrity PASS ([#45282839709](https://github.com/relaxsaadi/cbta/actions/runs/45282839709)); controlled reviewer admission PASS ([#45282839603](https://github.com/relaxsaadi/cbta/actions/runs/45282839603)); direct item Tier-A provenance FAIL ([#45282839602](https://github.com/relaxsaadi/cbta/actions/runs/45282839602)); full DGR readiness FAIL ([#45282839606](https://github.com/relaxsaadi/cbta/actions/runs/45282839606)). Retrieved failure logs confirm 247 unique Tier-A-affected IDs; missing item-specific current-edition bindings and representative/batch/cross-applied evidence remain blockers. The full gate confirms 453 FR IDs, 453 EN IDs, zero missing/extra EN IDs, 287 matrix task rows, 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies.
>
> **All ten function packages and independent task structures:** 10 official task sets, 10 source/competency matrices, 10 Stage 2A blueprints and 10 separate EN review packages (40/40 documents). Task counts remain 7.1=44, 7.2=23, 7.3=33, 7.4=37, 7.5=25, 7.6=28, 7.7=27, 7.8=23, 7.9=24, 7.10=23 (287 total). Do not impose Function 7.1's 44-task structure on any other function. Current FR source-status buckets remain 246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE and 2 UNRESOLVED. The 107 historical provenance exceptions and 140 EN status-mirror drifts are separate diagnostics, not approvals. Reviewer registry is empty; zero established APPROVED; all 453 import candidates remain IMPORT_ELIGIBLE=NO.
>
> **Function 7.10 effective-state distinction:** Q-7.10-012 is the row-level SOURCE CONFLICT. Q-7.10-038 remains DRAFT / Tier B only / SOURCE REQUIRED for Tier A; its power-bank addendum warning does not change its effective row-level bucket. Both remain non-importable. The historical >15 AEP / >20 battery slide is not a universal current-2026 power-bank rule.
>
> **Critical CRM/dashboard authentication finding — main is not yet remediated:** current `main` still contains a legacy middleware path that bypasses dashboard Basic Auth when a URL `secret` parameter matches server-side CRON_SECRET, and four dashboard client pages still reference `NEXT_PUBLIC_CRON_SECRET` (agent, intel, LinkedIn and instructors). Source references are confirmed; this audit did not read deployment environment values and does not assert that a live credential was exposed. PR #298 head `75bc1b722db2060a4018e7b830366a692484c213` removes URL-secret acceptance, restricts server-only Bearer auth to seven exact scheduled GET routes, removes those client-side references, and passes static workflow [#45090271696](https://github.com/relaxsaadi/cbta/actions/runs/45090271696). PR #298 remains OPEN / DRAFT / UNMERGED / UNDEPLOYED. Require independent review, deployed positive/negative cron tests, browser/SSE/CSRF acceptance, credential-exposure assessment and rotation if the same value was configured client-side. Do not copy secrets into logs or comments.
>
> **Stage 2B.1:** PR #415 head `4f73f7eb` passes both application and console jobs in [#45169572631](https://github.com/relaxsaadi/cbta/actions/runs/45169572631), but remains OPEN / DRAFT / UNMERGED on #336; provider-signed staging, deployment and monitoring are pending. PR #392's exact-head run [#42234634581](https://github.com/relaxsaadi/cbta/actions/runs/42234634581) remains a recorded console production-build failure; later stacked PR #393's pass does not erase it or establish integrated staging acceptance. PR #399's passing run is also on a separate unmerged stack. Notification intent/recovery remains open under #99, #225, #323 and #328.
>
> **Claude / branch watch:** branch pagination is complete: 129 DGR-matching names, 57 exact `ai/` prefix branch names and one historical Claude-specific DGR-guidance branch; all terminal pages returned zero further results. No new Claude-attributed DGR readiness commit or newly created related PR was found. The latest identifiable Claude co-authored commit `e115196` is dated 2026-08-23 and concerns airline prospect-contact matching, not exam readiness. No related PR was created on 2026-11-24.
>
> **Owner blockers:** #340 public answer-bank/source-reference exposure; #118 branch protection/rulesets; #65 authoritative company→group→assessment scope integrity; #225 durable notification intent/recovery. Repository visibility remains PUBLIC. Owner-authorized confidentiality inventory/quarantine/history-fork remediation and repository-admin protection work remain necessary.
>
> **Platform gates:** candidate workflow partial; roles/RBAC not accepted; audit/reconstruction partial; bilingual human review pending with 140 status drifts; integrated Moodle/console staging not accepted; confidentiality/security critical blocker; integrated release-candidate build/tests not accepted; deployment/runbook/monitoring not accepted; production backup/restore not accepted; notification delivery/recovery not accepted.
>
> **Release decision: PLATFORM NOT READY.** No PR merged, no deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.
>
> **Historical release override — 2026-10-27:** the earlier status below is retained for chronology only; it is superseded by the current decision.
>
> **Current PR #3 pointer:** PR #3 / `ai/dgr-stage2b-handoff` remains OPEN/DRAFT/UNMERGED. The live head SHA and ahead/behind count are authoritative in the [GitHub PR metadata](https://github.com/relaxsaadi/cbta/pull/3); they are deliberately not hard-coded in this checklist because each checklist-only update itself advances the branch. The latest inspected pointer before this checklist refresh was `6e57f1df74d33a205609b42d47b0cf5a050275ff`; it changed only `docs/PLATFORM_READY_CHECKLIST.md`.
>
> **Last fully audited code/readiness baseline — 2026-11-22: NOT READY.** The code/readiness baseline is `379b827f1fe819ba7dbd67d7c66fd401544550ba`. Subsequent handoff commits `cdf5c6bf`, `65aca11` and `6e57f1df` changed only this checklist; the application, scripts, question banks, evidence records and import controls are code-identical to the audited baseline. Do not confuse a documentation-only branch-head advance with a new technical acceptance.
>
> **Exact-head DGR CI on code-identical documentation-only head `6e57f1df`:** PASS — [import CSV structure](https://github.com/relaxsaadi/cbta/actions/runs/45038403128), [governance regression integrity](https://github.com/relaxsaadi/cbta/actions/runs/45038403093), and [controlled reviewer admission](https://github.com/relaxsaadi/cbta/actions/runs/45038403130). FAIL — [direct Tier-A provenance](https://github.com/relaxsaadi/cbta/actions/runs/45038403098) and [full DGR readiness](https://github.com/relaxsaadi/cbta/actions/runs/45038403108). The latter workflow's separate regulatory-governance-integrity job passed; its full-readiness job failed. The exact-head Tier-A job log contains **247 unique affected question IDs**: 7.1: 18; 7.2: 29; 7.3: 30; 7.4: 25; 7.5: 20; 7.6: 31; 7.7: 25; 7.8: 27; 7.9: 22; 7.10: 20. The full-readiness output reports **453 FR IDs, 453 EN IDs, zero missing/extra EN IDs, 287 matrix task rows, zero missing/extra matrix links, 107 historical FROZEN provenance exceptions and 140 aggregate FR-bank↔EN status-drift findings**. These remain evidence/review blockers.
>
> **All ten function inventories:** the full-readiness output reports 453 FR-bank IDs, 453 EN-package IDs, zero missing/extra EN IDs, 287 source/competency-matrix task rows, and zero missing/extra matrix links. Function-specific official task counts are 7.1: 44; 7.2: 23; 7.3: 33; 7.4: 37; 7.5: 25; 7.6: 28; 7.7: 27; 7.8: 23; 7.9: 24; 7.10: 23 (**287 total**). Each function has its own task set, source/competency matrix, Stage 2A blueprint, production-bank draft and separate EN package. Function 7.1's 44-task structure is not imposed on other functions.
>
> The full-readiness gate reports **107 historical FROZEN provenance exceptions** and **140 FR-bank↔EN-package FR-status drift findings**, distributed as 7.1: 0; 7.2: 11; 7.3: 20; 7.4: 13; 7.5: 16; 7.6: 18; 7.7: 19; 7.8: 15; 7.9: 16; 7.10: 12. The prior 139 count is superseded. The dedicated EN mirror check passes, but aggregate status reconciliation fails; neither is qualified EN human review. Current FR reconciliation buckets: **246 FROZEN, 147 DRAFT, 31 PARTIAL, 16 SOURCE GAP, 3 SOURCE CONFLICT, 8 STALE and 2 UNRESOLVED**. These categories overlap with provenance/Tier-A diagnostics and are not approvals.
>
> The V2 import-candidate CSV has **453 rows, 453 `IMPORT_ELIGIBLE=NO`, and 0 blank blocker fields**. The CSV structure gate also validates strict quoting, stable widths, function-bound unique IDs and identical populations. Approval-chain/cross-artifact checks find **0 APPROVED items**; the controlled qualified-reviewer registry is empty. No question may be APPROVED without an admitted named qualified reviewer, evidenced qualification, actual review date, direct FR source verification and separate qualified EN bilingual review.
>
> **Function-specific follow-up:** the Function 7.10 blueprint on the handoff is byte-identical to the proposed PR #412 version. It explicitly blocks reuse of the old `>15 AEP / >20 battery` threshold as a universal current-2026 power-bank rule; `0.3.2` remains `SOURCE GAP`, and Q-7.10-012 remains `SOURCE CONFLICT` pending direct licensed 67th Edition/addendum and State/Operator review. No threshold question is approved. PR #412 is stale/diverged and is not needed to obtain that blueprint correction.
>
> **Remediation PR reconciliation:** PR #407's `public/llms.txt` blob matches the handoff. PR #413's CSV-structure script matches the handoff; its 453-row CSV differs only in the Q-7.3-029 metadata row. The handoff retains its 2026-08-25 item-specific Bookshelf locator record and reviewer/confidentiality hold; the draft branch uses a stricter unresolved-provenance blocker. The exact-head Tier-A validator does not list Q-7.3-029 among its 247 affected IDs, but the metadata disagreement must be adjudicated from authorized evidence before changing the row; do not copy licensed text from a public PR or merge #413's stale branch wholesale. PRs #408–#410 alter EN reviewer-package guidance, remain diverged **19 commits behind** the handoff, and do not constitute independent qualified EN review. Do not merge answer-bearing package changes before the owner-authorized confidentiality migration.
>
> **Stage 2B.1 — current stacked candidate-integrity evidence (2026-11-23):** PR #398 (`26e97524`) is OPEN/DRAFT/UNMERGED on top of #397; its exact-head E-EXAM V2 workflow [#42295521395](https://github.com/relaxsaadi/cbta/actions/runs/42295521395) passed. The reviewed patch binds candidate autosave to the frozen snapshot question type and unique frozen scenario subquestion IDs inside the write transaction; it rejects cross-type writes, forged IDs, malformed answer arrays and duplicate snapshot IDs without overwriting prior candidate evidence. PR #399 (`3ea3745c`) is OPEN/DRAFT/UNMERGED on top of #398; its recorded two-job E-EXAM V2 validation [#42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728) passed on 2026-11-09. Its reviewed code makes the server clock and serialized SQLite transition authoritative for expiry/winner selection and commits terminal status, grading, result and audit together; only the winning transition triggers post-commit notification orchestration. Neither draft stack is integrated E-EXAM/Moodle staging acceptance. PR #354 (`ee04a71c`) has a passing synthetic legacy-migration workflow [#41604398799](https://github.com/relaxsaadi/cbta/actions/runs/41604398799); its migration code explicitly acknowledges legacy `DROP TABLE`/`RENAME` rebuilds and reapplies schema guards afterward. This does not replace a verified production backup, representative restore drill, rollback plan or deployed migration acceptance. PR #320 (`4c54f42b`, based on #319) remains a separate unmerged opt-in/bounded missing-intent reconciler; it does not recover all ambiguous `QUEUED`/`SENDING` provider states or prove external delivery. Candidate crash recovery, deployed RBAC/scope isolation, immutable audit acceptance, browser/network recovery, provider reconciliation, production deployment and backup/restore remain open.
>
> **Stage 2B.1 — manual-grading and historical-answer integrity chain (2026-11-23 audit):** The additional stacked draft PRs #391–#398 address read-path isolation of malformed legacy scenario/manual-grade rows, validation of prior scenario subgrades, own-key handling for `__proto__` / `constructor` IDs, persisted answer-map shape validation, and frozen question-type/subquestion-ID checks at the candidate write boundary. Exact-head E-EXAM V2 workflow results: #391 `a32f02e`, run [#42223641316](https://github.com/relaxsaadi/cbta/actions/runs/42223641316) PASS; #392 `9555c78`, run [#42234634581](https://github.com/relaxsaadi/cbta/actions/runs/42234634581) FAIL (the main lint/type/unit/E2E/backup-restore/build job passed, but the console/Moodle token-transport job's production-build step failed; the contemporaneous review records a `next/font/google` / Turbopack resolution error); #393 `ca06c1e`, run [#42235683438](https://github.com/relaxsaadi/cbta/actions/runs/42235683438) PASS on both jobs, including console production build; #394 `a4e9bcb`, run [#42243884509](https://github.com/relaxsaadi/cbta/actions/runs/42243884509) PASS; #395 `af769d8`, run [#42266097876](https://github.com/relaxsaadi/cbta/actions/runs/42266097876) PASS; #396 `c2df41e`, run [#42278909402](https://github.com/relaxsaadi/cbta/actions/runs/42278909402) PASS; #397 `0a095425`, run [#42288746548](https://github.com/relaxsaadi/cbta/actions/runs/42288746548) PASS; #398 `26e97524`, run [#42295521395](https://github.com/relaxsaadi/cbta/actions/runs/42295521395) PASS; and #399 `3ea3745c`, run [#42539993728](https://github.com/relaxsaadi/cbta/actions/runs/42539993728) PASS. The #392 failure is retained as an exact-head historical failure; #393 and #399 pass on later stacked heads, but do not retroactively change #392's result or constitute independently witnessed integrated staging acceptance. The chain is stacked in order #391→#392→#393→#394→#395→#396→#397→#398→#399; do not merge a middle PR out of order. All remain OPEN/DRAFT/UNMERGED. These are synthetic CI checks; no production candidate data or examination content was changed. The #399 terminal submit winner/expiry transaction and post-commit notification orchestration remain separate from #320's outbox/provider recovery gap. Production restore, staging candidate/grader workflows, deployed RBAC, audit, deployment and all regulatory/confidentiality gates remain open.
>
> **Security — current exact-head workflow evidence (2026-11-23):** PR #298 is OPEN/DRAFT/UNMERGED/UNDEPLOYED at `75bc1b722db2060a4018e7b830366a692484c213`; its workflow [#45090271696](https://github.com/relaxsaadi/cbta/actions/runs/45090271696) passed. Its checkout v7.0.1 and setup-node v7.1.0 actions are pinned to immutable Node-24-compatible SHAs (`3d3c42e5aac5ba805825da76410c181273ba90b1` and `949feb2413d6458794dcd2491c4babbbce0c15c1`), with checkout `persist-credentials: false`; the earlier Node.js 20 deprecation warning is superseded by this exact-head run. PR #341 is OPEN/DRAFT/UNMERGED at `86545595a56a8e4365ee82591202e7853aca91db`; its detector workflow [#45090168973](https://github.com/relaxsaadi/cbta/actions/runs/45090168973) passed with the same immutable Node-24-compatible action pins. These are static workflow results only. PR #298 still needs live cron positive/negative tests, deployed authentication, CSRF/SSE/browser acceptance, credential rotation and manual-send consent/suppression/idempotency acceptance. PR #341 is a post-push detector, not a confidentiality cure: it cannot retract public history, forks, mirrors or previously fetched copies. Issue #340 remains critical. PR #401's overlapping `send-email` route must not replace #298's stricter server-only Bearer and default-deny controls.
>
> **Other current signals and owner blockers:** the combined status on `6e57f1df` is Vercel **FAILURE** for the separate `kost-funnel` project; it is not E-EXAM deployment evidence or a DGR readiness workflow. The repository remains public and answer-bearing exam material remains a critical confidentiality blocker [#340](https://github.com/relaxsaadi/cbta/issues/340). Branch-protection/ruleset enforcement remains an owner-side blocker [#118](https://github.com/relaxsaadi/cbta/issues/118); the last verified `main` state was unprotected with no rulesets. DGR branch pagination is complete (129 matching branch names); Claude-specific branch pagination is complete (one historical branch, then no further results), and no new Claude-attributed DGR readiness commit or newly created related PR was found. Candidate workflow, roles/RBAC, audit history, bilingual acceptance, integrated Moodle/console boundary, deployed security, integrated build/E2E, deployment/runbook and production backup/restore remain open. No production deployment, Moodle import, question approval or ANAC/IATA approval is claimed.
## A. Regulatory / Question Bank

> **2027 edition-transition watch (2026-11-14; prospective, NOT approval):** IATA's [official DGR documentation](https://www.iata.org/dgr-updates) states that the **68th Edition (2027)** electronic DGR is already available but **takes effect on 2027-01-01**; see also IATA's [2026-09-07 publication announcement](https://www.iata.org/en/pressroom/2026-releases/09-07-iata-releases-2027-cargo-ground-operations-manuals/). The applicable 2026 verification baseline remains the **67th Edition (2026)** as of this note. A 2027 summary or the ICAO updates must **not** be passed off as direct, item-specific current-2026 Tier A evidence. This watch does not alter any item, reviewer, import or readiness status.

- [ ] **Before any production exam release or use on/after 2027-01-01**, independently rebaseline **each Function 7.1–7.10** against the DGR edition then in force (including applicable addenda and State/Operator Variations). Recheck each regulatory question's claim, correct answer, distractors and locators; reperform qualified dated FR verification, separate dated EN review, confidential-item eligibility and release/CI gates as appropriate. Do not mechanically carry forward 2026 item approvals, treat a public significant-changes summary as the licensed 68th Edition, or silently overwrite historical 2026 evidence. This is a **future-effective-date gate**, not a claim that the 2027 edition governs November 2026 exams.

**Separate fail-closed checks for Functions 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9 and 7.10 — not a Function 7.1 template:**

- [ ] For **each** function, verify its own current CBTA task set, source/competency matrix and Stage 2A blueprint before judging question coverage. Do not copy Function 7.1's 44-subtask structure or mechanically assign functions by job title/sector.
- [ ] For **each** function's active question, establish direct current IATA DGR **67th Edition (2026)** Tier-A support, applicable addendum/edition state, item-specific locator, and affirmative evidence for correct answer **and distractors**. Old exams, representative examples, secondary summaries and unverified citations cannot substitute for direct evidence.
- [ ] Record `SOURCE GAP`, `SOURCE CONFLICT`, `STALE CITATION` or `PENDING` explicitly on affected FR items; unresolved states block promotion and import, even if an old staging database contains that question.
- [ ] Verify FR against its own source, then conduct a **separate** technical EN bilingual review. A translation draft is not a reviewed question.
- [ ] No `APPROVED` status for any function without an exact admitted, qualified human reviewer's name/ID, independently evidenced qualification, and actual review date (plus separate qualified FR/EN review as applicable); structural CI alone is insufficient.

- [ ] Function 7.1 pilot is fully FR source-verified against current Tier A source (IATA DGR 67th Edition 2026 / applicable current source).
- [ ] Q-7.1-001 is resolved from direct current glossary/source evidence; no inferred danger/risk definition.
- [ ] Q-7.1-007 wording reflects A1/A2 precisely; use `approbation` where source uses it and preserve A1 cargo/passenger nuance.
- [ ] Q-7.1-008 unsupported distractor (`State derogation required`) is revised/replaced before production use.
- [ ] Every active question has source location, competency/function mapping, correct answer, distractor rationale, and status.
- [ ] No `APPROVED` status exists without qualified reviewer name + review date.
- [ ] EN content remains separately flagged for bilingual technical review until actually reviewed.
- [ ] No question is promoted to production merely because a draft/pilot answer exists.

## A2. Examination confidentiality (critical release gate — #340)

- [ ] Inventory all question/answer-key material already publicly exposed, by Function 7.1–7.10, and assess item eligibility. **Already-public answer-key-bearing items are not a confidential summative examination pool.** No claim of an operational breach is implied.
- [ ] Obtain owner-authorized access-controlled storage and a reviewed plan for non-public replacement/retirement of affected items. Prevent new keys or rationales in public commits, issue comments, logs, artifacts or client bundles; a Git ignore/path-pattern detector alone is insufficient.
- [ ] Independently verify server-side candidate/non-admin access restrictions, secure exam delivery and export, new-item provenance, and the production publication path. Making the repository private does not retract its existing public history.
- [ ] Do not interpret earlier Moodle/staging imports, exam-bank draft counts, or passing structural checks as proof of confidential production item readiness.

## A3. Public DGR regulatory claims / sector pages (critical content gate — #402)

- [ ] Independently review and correct the current public **main** and deployed sector pages, especially pharmaceutical/biomedical and oil-and-gas: a job title, employer or sector does **not** by itself assign an IATA CBTA Function 7.1–7.10, determine training obligations, or establish approval/recognition by ANAC, IATA, carriers or clients. Validate any provider/accreditation/customer assertion with owner-authorized current evidence.
- [ ] For statements about UN 3373, PI 650, Shipper's Declarations, dry ice and related packing/documentation, perform claim-specific review against the authorized current **IATA DGR 67th Edition 2026**, applicable addenda, operator variations and other binding rules. Until verified, record **SOURCE GAP / SOURCE CONFLICT / PENDING** explicitly; a public 66th Edition PI is a discrepancy lead, **not** 2026 Tier-A approval. Do not publish a categorical rule unsupported by direct current-edition evidence.
- [ ] Reconcile visible text, FAQ, metadata, structured data/JSON-LD, social descriptions and machine-readable/SEO copy; ensure no unsupported universal certification, fixed validity, price/recognition or function-from-job claims remain.
- [ ] Independently accept the corrected public content in [draft PR #401](https://github.com/relaxsaadi/cbta/pull/401), including exact-head lint/type/build, relevant UI/SEO regression checks and actual deployment verification, before declaring this gate closed. [Issue #402](https://github.com/relaxsaadi/cbta/issues/402) records identified defects on **main**; the unmerged draft PR's successful compile check is **not** a live fix, licensed-source verification or regulatory/human approval. Keep this gate distinct from confidential exam-item integrity (#340) and technical E-EXAM acceptance.

## A4. New exact-match public DGR pages (critical content/UX gate — #404; 2026-11-11)

- [ ] Treat [PR #403](https://github.com/relaxsaadi/cbta/pull/403), merged into the **draft handoff branch** at `ff45acb`, as new **unreleased** content, not accepted `main` or production. Review all 20 added exact-match DGR pages and shared metadata, FAQ, JSON-LD, `public/llms.txt` and sitemap before release; coordinate with existing sector-claim gate [#402](https://github.com/relaxsaadi/cbta/issues/402).
- [ ] Validate every IATA-listing, ANAC-approval/reference/scope, 24-month recurrence, IT 38-25, in-person/virtual training location and territory claim against current authorized evidence, operator/local-authority rules and, where relevant, **direct IATA DGR 67th Edition 2026 Tier A**. Unverified cases remain **SOURCE GAP / CONFLICT / PENDING**; marketing claims never serve as question-bank Tier A or as human sign-off.
- [ ] Fix and test **server-rendered** HTML language for English routes: `app/layout.tsx` emits `<html lang="fr">` and `SetHtmlLang` corrects it only after client hydration. Validate no-JS output, accessibility, hreflang and bilingual navigation.
- [ ] Reconcile the new pages' **written-only** promise with shared `LeadForm` / `/merci` callback claims and French-only form UI on EN pages. The original `showPrices={false}` redirect exposed euro price `v=`; [draft fix `a1caea90`](https://github.com/relaxsaadi/cbta/commit/a1caea90b2d497559e32fbb9f9b2eff0107763ff) now suppresses `v` for unpriced pages while retaining it for priced pages (source readback only). **Test actual submission, tracking, staging and deployment** before closing this gate.
- [ ] Require separate clean exact-head Next.js dependency install, TypeScript, build/lint, route/SEO/JSON-LD tests, form smoke, staging and deploy checks. On `ff45acb`, DGR structural workflows alone do **not** establish website build acceptance. Keep gate **PENDING** until evidence is attached to [#404](https://github.com/relaxsaadi/cbta/issues/404).

## B. Exam Workflow

- [x] Candidate can authenticate and reach only their authorized exam. — verified 2026-08-25, live, `test_candidate` restricted to course 4
- [x] Start/resume rules are deterministic and tested. — verified 2026-08-25 (this quiz always labels its button "Démarrer...", resuming an in-progress attempt transparently)
- [ ] Timer behavior is tested for refresh, reconnect, expiry, and server/client clock mismatch. — historical 2026-08-25 refresh/reconnect and auto-timeout evidence exists; **server/client clock mismatch remains untested**, so the full gate is PENDING.
- [x] Autosave/manual save behavior is verified. — verified 2026-08-25: answers persist via the real "Page suivante" POST, confirmed by direct DOM/DB inspection
- [x] Final submission is idempotent and cannot double-submit. — verified 2026-08-25 via DB state check (`finished` does not revert to `inprogress`, no further "next" control after finishing)
- [ ] Post-submission state is immutable except through authorized review/regrade workflow. — not separately tested this pass
- [x] Navigation, unanswered-question handling, review flags, and completion confirmation are tested. — verified 2026-08-25 (question flagging, mixed MCQ/free-text navigation, finish-confirmation modal)
- [ ] Browser refresh/back-button/network-loss scenarios are tested. — refresh was verified 2026-08-25; **back-button and network-loss recovery remain untested**, so the full gate is PENDING.

## C. Roles / RBAC

- [ ] Candidate, instructor/reviewer, exam admin, and system admin permissions are explicitly documented and tested. — 2026-08-25 candidate/admin/auditor tests are historical partial evidence; **instructor/exam-manager roles are not implemented**, and the full role matrix is not tested (see `docs/PLATFORM_READINESS_REPORT.md` Gate C).
- [x] Least-privilege rules are enforced server-side, not only hidden in UI. — verified 2026-08-25 at both login-level (two-gate model: console role + external-service whitelist) and mutation-level (`/identity-verification` correctly refuses auditor server-side with no form rendered at all; `/feedback` is open to all authenticated roles by what appears to be design — see readiness report Gate C for the full mixed result)
- [x] Direct URL/API access cannot bypass role restrictions. — verified 2026-08-25: unauthenticated/unauthorized direct navigation redirects to login without leaking content
- [ ] Candidate cannot view answer keys, other candidates, reviewer-only data, or source notes. — not separately tested this pass
- [ ] Reviewer/admin actions are attributable to an authenticated identity. — not separately tested this pass (Moodle audit log confirmed populated in the fourth pass, Gate D)

## D. Audit Trail / Integrity

- [ ] Exam start, answers, saves, submission, grading/regrading, reviewer approval, and administrative changes have an audit trail.
- [ ] Audit records include actor, timestamp, action, relevant entity, and before/after state where appropriate.
- [ ] Question/version used for each submitted attempt is recoverable.
- [ ] Production question changes do not silently mutate historical attempts.

## E. Bilingual Behavior

- [ ] FR/EN rendering works for question, options, instructions, errors, review state, and reports.
- [ ] Language switching does not change question identity or answer mapping.
- [ ] Missing EN review cannot be presented as technically approved.
- [ ] Special DGR terminology remains source-accurate in each language.

## F. Moodle / KOST E-EXAM Integration

- [ ] Architecture boundary remains: Moodle Web Services for writes/actions; MySQL access is read-only where retained.
- [ ] No direct MySQL write path exists from the Next.js console.
- [ ] Moodle production question-bank changes have an explicit controlled publication path.
- [ ] API/service-account scopes are least privilege.
- [ ] Error/retry handling cannot create duplicate exams, attempts, grades, or questions.
- [ ] Integration failures are visible to administrators and logged.

## G. Security / Configuration

- [x] HTTPS is enforced; HTTP redirects to HTTPS. — verified (Certbot-managed 301 redirect on both domains)
- [x] HSTS and required security headers are verified in deployed environment. — console had them already; Nginx-layer gap on `exam.kostacademy.com` closed 2026-08-25 (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, scoped CSP)
- [x] Debug mode is off in production. — confirmed 2026-08-25 via `mdl_config` (`debug=0`)
- [ ] No secret/API key/password/token is committed or exposed to browser bundles/logs. — the 2026-08-25 Moodle DB diagnostic exposure was reportedly remediated through rotation (see readiness report Gate G), **but four dashboard components currently reference `NEXT_PUBLIC_CRON_SECRET`**, which is eligible for inclusion in browser JavaScript when configured. Prove production environment values and bundle contents are safe; remove client-side shared-secret use and verify server-side authentication before marking PASS. Do not assume `NEXT_PUBLIC_CRON_SECRET` equals `CRON_SECRET` without configuration evidence.
- [x] MySQL is not publicly exposed. — re-confirmed 2026-08-25, bound to container-internal only, no host port mapping
- [x] Authentication/session expiry/logout behavior is tested. — verified 2026-08-24 (cookie audit) and 2026-08-25 (full smoke suite)
- [ ] **Protected-route cron-token boundary (critical; PR #298):** on the current main and PR #3 handoff branch, middleware still accepts a matching ?secret=CRON_SECRET on protected routes and four dashboard client pages still reference NEXT_PUBLIC_CRON_SECRET. Draft PR #298 is now at exact head 0beceffed421b1ff5c74ff72087a22ed68be1d2d: it removes those four browser references and the middleware query-token bypass, restricts server-only Bearer authentication to seven exact scheduled GET paths, and applies Basic-auth plus same-origin mutation checks. It also default-denies the scheduled GET and batch POST paths for /api/agents/send-email and /api/agents/followup unless DGR_OUTBOUND_AUTOSEND_ENABLED=true. Static workflow #44878614362 passes, including the LinkedIn generated-versus-sent regression. This remains **unmerged/undeployed**: live positive/negative cron tests, deployed bundle inspection, credential-rotation decision, browser/SSE/CSRF acceptance and rollback are pending. The legacy /api/agents/linkedin-outreach URL-secret handler still needs removal/refactoring (it remains inside the proposed Basic-auth protected prefix). The single-recipient manual send in /api/agents/send-email remains outside the batch flag and needs consent/permission, suppression/opt-out, approved-copy, recipient-validation and delivery/idempotency review. PR #348 is a narrower overlapping draft; do not merge both blindly.
- [ ] **HTTP Basic-auth CSRF boundary on CRM mutations:** PR #298 adds a fail-closed same-origin Origin/Referer + Fetch Metadata policy after successful Basic authentication for protected POST/PUT/PATCH/DELETE API calls. The current exact-head static tests pass, but the middleware change is not active on main or deployed staging. Test cross-site denial and legitimate authenticated dashboard mutations against the deployed application before closing this gate. This CRM control-plane correction is separate from Moodle/E-EXAM candidate authorization and does not establish exam-platform security acceptance.
- [ ] CSRF/XSS/injection-sensitive paths are reviewed for the actual stack. — **PENDING on the integrated release candidate.** The actual Next.js console source is present on the separate E-EXAM draft stack (`platform-ops/kost-eexam-console-src/`, branch `audit/eexam-submit-transition-reconcile-20261107`, PR #399's ancestry), but is not present on this PR #3 handoff branch or `main`. Source-level security review and post-integration recheck remain required.
- [ ] Uploaded/exported data is access-controlled. — not tested this pass
- [ ] Dependency/build security findings have no unresolved critical/high issue affecting launch. — **PENDING.** The separate console source has a committed `pnpm-lock.yaml`; the recorded PR #399 workflow does not run `pnpm audit` or an equivalent dependency-vulnerability audit. Run an appropriate audit on the exact integrated release candidate and disposition any critical/high findings.

## H. Build / Tests

- [ ] Clean install succeeds from documented repository state. — the separate E-EXAM draft stack now contains the actual console source at `platform-ops/kost-eexam-console-src/`; PR #399's exact-head workflow run #42539993728 completed `pnpm install --frozen-lockfile` for both `kost-eexam-v2` and `kost-eexam-console-src`. **The console source is not yet present on PR #3's handoff branch or `main`; integrated release-candidate install remains PENDING.**
- [ ] Production build succeeds. — PR #399's separate E-EXAM draft-stack workflow #42539993728 passed `pnpm build` for `kost-eexam-v2` and the actual `kost-eexam-console-src` Next.js application. This is not a build of PR #3's handoff/main tree or a deployed production acceptance; final integrated build remains PENDING.
- [ ] Lint/type checks pass or every exception is documented and accepted. — PR #399's separate E-EXAM draft-stack workflow #42539993728 passed focused console ESLint, `next typegen` + `tsc --noEmit`, and the production build. The lint scope is deliberately focused, not a claim that all historical console lint debt is cleared; repeat/expand on the integrated release candidate.
- [x] Critical exam flows have repeatable automated tests where technically feasible. — a committed Playwright suite now exists at `platform-ops/kost-eexam-console/` (black-box, against the live URLs) covering smoke/RBAC/security-headers/full candidate lifecycle/accessibility
- [x] Desktop, tablet, and mobile exam views are verified. — 2026-08-25, 5 browser/device projects run; Chromium-family clean, Firefox/WebKit/tablet-Safari had timing-sensitive (not confirmed-defect) failures on the longest test
- [x] No critical console/runtime errors during core candidate/admin flows. — confirmed 2026-08-24 (0 browser console errors); one real non-critical finding this pass: WCAG AA color-contrast violation (see readiness report Gate H)

## I. Deployment / Operations

- [x] Deployment procedure is documented and repeatable. — Docker Compose stacks on the VPS, confirmed live 2026-08-24
- [x] Required environment variables/configuration are documented without storing secrets. — `.env.example` pattern used in the rebuilt test suite; production `.env` snapshots are GPG-encrypted on the server
- [ ] Health check / service verification steps exist. — not separately confirmed this pass
- [x] Rollback procedure exists and is tested or credibly rehearsed. — Nginx config change 2026-08-25 followed backup → `nginx -t` → reload → verify pattern; `RESTORE_PROCEDURE.md` documents full disaster recovery (fourth pass)
- [x] Backup scope covers required Moodle/database/configuration assets. — confirmed 2026-08-24 (database, moodledata, moodle code, config, GPG-encrypted secrets)
- [x] Restore procedure is documented and tested sufficiently to prove backups are usable. — fresh successful restore test 2026-08-24 (491/491 tables)
- [ ] Logging/monitoring and disk/database capacity risks are addressed. — disk headroom checked (14% used, fourth pass) but no dedicated monitoring/alerting confirmed

## J. Final Acceptance

`PLATFORM READY TO USE` may be stated only when:

1. every critical item above is checked with concrete evidence;
2. there is no unresolved blocker that can corrupt an exam, expose protected data, bypass permissions, or misstate DGR regulatory content;
3. production deployment/runbook/backup-recovery evidence exists;
4. remaining non-critical limitations are listed explicitly.

If any critical gate is open, final status must be `NOT READY — <exact blockers>` rather than a partial or optimistic readiness claim.

## Gate reassessment (2026-10-17)

The four gates above were corrected from `PASS` to `PENDING` because their own evidence records untested cases, missing roles, or unverified browser-secret isolation. These are documentation-state corrections **only**; they do not claim a new live test, a remediated code path, or production authorization. The `NEXT_PUBLIC_CRON_SECRET` references occur in `app/dashboard/{agent,intel,linkedin,instructors}/page.tsx` on this branch. `PLATFORM READY TO USE` remains blocked pending direct technical and regulatory evidence for Functions 7.1–7.10.

## Historical Stage 2B.1 snapshot (2026-08-24 — superseded; not current readiness)

> The five bullets below are preserved as an August progress record, not current FR/EN or runtime sign-off. In subsequent documentation, Q-7.1-001 was classified as a confirmed DGR-specific source gap; Q-7.1-008's distractor was corrected **in documentation only**, with actual deployed question text still unverified. See [`DGR_STAGE_2B_STATUS.md`](DGR_STAGE_2B_STATUS.md). All ten functions remain under independent direct Tier-A/qualified FR/EN/approval release holds.

- Q-7.1-006: current Tier A evidence retrieved; FR source-verified.
- Q-7.1-007: current A1/A2 evidence retrieved; FR source-verified with wording-precision note.
- Q-7.1-008: current Table 2.6.A evidence retrieved; FR source-verified, but one unsupported distractor must be revised before production.
- Q-7.1-001: glossary location known (Appendice A, p.703), but direct entries still required.
- Pilot FR source verification: 11/12 at the latest pushed evidence snapshot.

## Additional public-source exposure scan (2026-11-22; owner-blocking)

On the public handoff head `4b077f402987cc3313b61b962f4c8ea95e74d4d8`, a non-disclosing scan of the 453-row V2 import-candidate CSV and 453-row per-item reconciliation CSV found **42 quoted Bookshelf/DGR reference fields** across Functions 7.2–7.10. The per-function counts are 7.2: 8; 7.3: 5; 7.4: 5; 7.5: 8; 7.6: 2; 7.7: 1; 7.8: 7; 7.9: 2; 7.10: 4. The same 42 question IDs occur in both CSV artifacts.

**35 of those quoted substrings** were found as exact substrings in the public production-bank Markdown files for Functions 7.2–7.10 (per-function matches: 6, 5, 4, 7, 2, 1, 5, 1, 4). Seven quoted references did not match that bank-file scan; this does not establish that they are safe. One additional unquoted 278-character reference for Q-7.10-038 requires manual source/licensing review. The Function 7.1 production-bank scan found no occurrence of the same Bookshelf evidence phrase.

This is a **probable licensed-source-text exposure**, separate from the existing answer-key confidentiality gate. No licensed text is reproduced in this checklist. Treat the affected public artifacts as exposed, not as a restricted evidence store. Do not use exposed items for secure summative/certification assessments.

Owner-controlled actions: inventory branch tips, history, artifacts, forks/mirrors and staging/Moodle pools; move authorized source evidence and production items to restricted storage; re-verify each item against the licensed current DGR without copying source text into public files; classify unsupported claims as SOURCE GAP or SOURCE CONFLICT; keep IMPORT_ELIGIBLE=NO; quarantine exposed items and document the replacement pool. Any Git-history rewrite or visibility/storage change requires owner authorization and coordinated preservation/retirement planning. A new commit or private-repository setting cannot recall copies already fetched.

A separate PR #413 tip correction replaced the Q-7.3-029 quoted reference with the non-verbatim locator already present on the handoff and restored its explicit NO IMPORT action. Its historical public commit remains accessible; the correction does not resolve history exposure or the other quoted references.

**No question, answer, source conclusion, reviewer decision, import flag, runtime data or approval changed during this scan.** All 453 current import candidates remain `IMPORT_ELIGIBLE=NO`. This finding does not establish IATA/ANAC approval or clear any technical/regulatory release gate.


## Per-function effective source-state reconciliation — 2026-11-23 21:50 Africa/Algiers

This section is derived from the exact handoff-head per-item ledger `docs/DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv` at `f92b8b27727fb4cb95880a0868bc7189ced10d82`, reconciled with exact-head DGR readiness workflow #45204182577 and direct Tier-A workflow #45204182539. It is a status inventory, not a regulatory review or approval.

| Function | Official tasks | Draft questions | Tier-A affected IDs | FROZEN provenance exceptions | FR↔EN status drift | Current SOURCE GAP IDs | Current SOURCE CONFLICT IDs | STALE citation IDs |
|---|---:|---:|---:|---:|---:|---|---|---|
| 7.1 | 44 | 19 | 18 | 0 | 0 | Q-7.1-001 | — | — |
| 7.2 | 23 | 49 | 29 | 4 | 11 | Q-7.2-002, Q-7.2-008, Q-7.2-021, Q-7.2-031, Q-7.2-045 | — | Q-7.2-042 |
| 7.3 | 33 | 45 | 30 | 18 | 20 | Q-7.3-017 | — | Q-7.3-025 |
| 7.4 | 37 | 53 | 25 | 10 | 13 | Q-7.4-027 | — | Q-7.4-008, Q-7.4-028 |
| 7.5 | 25 | 44 | 20 | 12 | 16 | Q-7.5-018 | Q-7.5-011 | Q-7.5-026 |
| 7.6 | 28 | 56 | 31 | 13 | 18 | Q-7.6-018 | — | Q-7.6-001 |
| 7.7 | 27 | 53 | 25 | 14 | 19 | Q-7.7-019 | — | — |
| 7.8 | 23 | 51 | 27 | 12 | 15 | Q-7.8-018, Q-7.8-036 | — | — |
| 7.9 | 24 | 39 | 22 | 14 | 16 | Q-7.9-022, Q-7.9-023 | Q-7.9-032 | Q-7.9-008 |
| 7.10 | 23 | 44 | 20 | 10 | 12 | Q-7.10-019 | Q-7.10-012 | Q-7.10-032 |

**Current FR status-bucket totals (453 rows):** CONFLICT=3; DRAFT=147; FROZEN=246; GAP=16; PARTIAL=31; STALE=8; UNRESOLVED=2. The 107 FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies are separate exact-head validator findings; historical `FROZEN` labels are not APPROVED and do not replace item-specific direct Tier-A evidence or named/date human review.

**Interpretation guardrails:**
- The 16 current `GAP` rows and 3 current `CONFLICT` rows above are the exact effective buckets in the per-item CSV. The 8 `STALE` rows are separately listed; do not silently relabel them as the three current `CONFLICT` buckets.
- The current row-level `SOURCE CONFLICT` records are Q-7.5-011, Q-7.9-032 and Q-7.10-012. Q-7.10-038 remains `DRAFT — Tier B only. SOURCE REQUIRED for Tier A`; its reason/next-action fields warn that the historical >15 PED/>20 batteries distractor has a 2026 power-bank addendum conflict. It is non-importable, but it is not a row-level `SOURCE CONFLICT` bucket.
- The eight `STALE` citation records are Q-7.2-042, Q-7.3-025, Q-7.4-008, Q-7.4-028, Q-7.5-026, Q-7.6-001, Q-7.9-008 and Q-7.10-032. Their source/correct-answer defects remain held; this list is not a human disposition.
- All 453 import candidates remain `IMPORT_ELIGIBLE=NO`. No question is APPROVED. The reviewer registry is empty; no qualified named/date FR or separate EN sign-off is established.

The direct Tier-A validator still fails on item-specific current 67th Edition 2026 evidence, including representative/batch/cross-applied evidence. The full readiness validator still fails. Preserve all GAP/CONFLICT/STALE and import holds until authorized direct evidence, separate qualified FR and EN review, and final approval-chain evidence exist.


## Supplemental public-artifact tripwire audit — 2026-11-24 17:34 Africa/Algiers

This supplements the earlier exact-head readiness snapshot. It records a useful detection control without treating it as remediation or confidentiality acceptance.

### PR #341 — detector passes, exposure remains open

- [PR #341](https://github.com/relaxsaadi/cbta/pull/341), branch `audit/eexam-public-answer-key-ci-340-20261027`, head `86545595a56a8e4365ee82591202e7853aca91db`, remains **OPEN / DRAFT / UNMERGED**.
- Its **Public exam artifact boundary (paths and keyed Markdown)** workflow completed successfully: [run #45090168973](https://github.com/relaxsaadi/cbta/actions/runs/45090168973).
- The detector reads the tracked checkout (`git ls-files --cached`), rejects known `DGR_PRODUCTION_BANK_7.x` and `DGR_EN_REVIEW_PACKAGE_7.x` paths, and checks supported text/structured formats for high-confidence keyed DGR items. It deliberately avoids printing question/answer excerpts.
- The detector itself explicitly says it is **not** a secret scanner, retroactive content withdrawal, push-time protection, or proof that every assessment format is confidential. The added `.gitignore` patterns prevent some future accidental staging; they do not untrack existing files or erase public Git history.

### Exact branch distinction verified

- On current `main`, `docs/DGR_PRODUCTION_BANK_7.1.md` and `docs/DGR_EN_REVIEW_PACKAGE_7.1.md` are absent (GitHub contents API returned 404).
- On the publicly readable PR #3 branch `ai/dgr-stage2b-handoff`, both files are present (the bank file is 25,964 characters; the EN package is 33,425 characters). The same branch contains the all-function bank and reviewer packages.
- Therefore the green run on PR #341 proves the detector passes on **PR #341's own candidate tree only**. It is not a scan of PR #3's public handoff branch. No exact-head PR #3 run of this detector is claimed. After the detector is available from the base branch, it must be explicitly exercised against PR #3's exact head; the known restricted paths should cause a fail-closed result until the content is moved out of the public tree.
- PR #341 is detection-only. It has not removed or restricted the existing PR #3 branch, its Git objects, historical copies, forks/mirrors, artifacts, or any staging/runtime pool.

### Release disposition

[Issue #340](https://github.com/relaxsaadi/cbta/issues/340) remains **CRITICAL OPEN**. Keep secure summative/certification use blocked for exposed items until the owner-authorized containment, exposure inventory, retirement/replacement decision, restricted-storage boundary, and server-side eligibility checks are independently accepted. Do not rely on repository visibility changes or `.gitignore` alone to retract copies already fetched.

No question, answer, source status, reviewer decision, import flag, Moodle record, or production deployment was changed by this audit. No licensed text or answer content is reproduced here. The confidentiality gate remains **NOT ACCEPTED**.


## Exact-ledger and Stage 2B.1 base reconciliation — 2026-11-25 01:41 Africa/Algiers

This is a read-only evidence reconciliation recorded as documentation. It changes no question, answer, source conclusion, reviewer decision, import flag, E-EXAM runtime data, Moodle record or deployment.

### 453-row ledger: distinguish the two status columns

Both controlled CSVs were parsed with quoted/multiline CSV handling on the exact PR #3 head `c84d175751cd5c269951a6b2f1832467a960dce2`:

- `DGR_TIER_A_RECONCILIATION_453_PER_ITEM.csv`: 453 logical question rows.
- `DGR_V2_IMPORT_CANDIDATES_AFTER_RECONCILIATION.csv`: 453 logical candidate rows; `IMPORT_ELIGIBLE=NO` on all 453; zero blank `BLOCKER` cells.
- The canonical reviewer registry table remains empty. No row has a final reconciled status beginning `APPROVED`; appearances of the word APPROVED inside explanatory text are not status values.

The following are **different fields**, not contradictory totals:

| Status field | FROZEN | DRAFT | PARTIAL | GAP | CONFLICT | STALE | UNRESOLVED |
|---|---:|---:|---:|---:|---:|---:|---:|
| `Current_Individual_FR_Status_Bucket` | 246 | 147 | 31 | 16 | 3 | 8 | 2 |
| `Final_Reconciled_Status` (normalized by explicit leading state) | 242 | 151 | 31 | 18 | 11 | 0 | 0 |

The stricter final reconciliation therefore:
- downgrades four historical Function 7.2 FROZEN labels to DRAFT: `Q-7.2-035`, `Q-7.2-039`, `Q-7.2-044`, `Q-7.2-049`; each requires its own directly bound 67th Edition 2026 evidence and qualified dated FR plus independent EN review;
- treats the eight current STALE citation records as final SOURCE CONFLICT holds: `Q-7.2-042`, `Q-7.3-025`, `Q-7.4-008`, `Q-7.4-028`, `Q-7.5-026`, `Q-7.6-001`, `Q-7.9-008`, `Q-7.10-032`;
- carries the three explicit power-bank/source conflicts `Q-7.5-011`, `Q-7.9-032`, `Q-7.10-012` as final SOURCE CONFLICT; and
- carries the two unresolved current-bucket rows `Q-7.2-022` and `Q-7.3-039` as final SOURCE GAP pending direct classification.

Per-function **Final_Reconciled_Status** counts (not approvals):

| Function | FROZEN | DRAFT | PARTIAL | SOURCE GAP | SOURCE CONFLICT |
|---|---:|---:|---:|---:|---:|
| 7.1 | 18 | 0 | 0 | 1 | 0 |
| 7.2 | 23 | 14 | 5 | 6 | 1 |
| 7.3 | 31 | 9 | 2 | 2 | 1 |
| 7.4 | 25 | 22 | 3 | 1 | 2 |
| 7.5 | 20 | 17 | 4 | 1 | 2 |
| 7.6 | 31 | 18 | 5 | 1 | 1 |
| 7.7 | 25 | 22 | 5 | 1 | 0 |
| 7.8 | 27 | 19 | 3 | 2 | 0 |
| 7.9 | 22 | 11 | 2 | 2 | 2 |
| 7.10 | 20 | 19 | 2 | 1 | 2 |
| **Total** | **242** | **151** | **31** | **18** | **11** |

These are reconciliation states only. FROZEN is not APPROVED. All 453 candidates remain blocked.

### Stage 2B.1 — revalidate against the current PR #18 base, not only the historical audit SHA

Current GitHub PR metadata:
- PR #18 base branch `feature/kost-eexam-v2-native`, base SHA `c4f4dae3a1d68a97bd7edc118cfa4d7bcddb2909`; PR head `def9dc931a2fb796f910b664af3138c18c50bb03`.
- The prior Stage 2B.1 note names audit SHA `04334362f2ef028ded1ab5fd2dcc9c3b813dbd6b`. GitHub compare reports that the current PR #18 base is 337 commits behind that audit SHA. Treat the 043… note as a historical audit point, not as the current PR #18 base.
- Direct file revalidation on both refs: `lib/questions.ts` is the same blob `92edf60e` and still contains the permissive helper predicate `reviewer_status != 'REJECTED'`; `CreateAssessmentForm.tsx` is the same blob `1c48b3b2`.
- On the current c4f… base, the individual report route is blob `03bd5747` (different from the prior audit's `f32f002b`). Its candidate release check still tests ownership, `show_result`, and deferred release; it does not test terminal attempt state or completed grading, and does not itself require `show_correct_answers=1` for a detailed PDF.
- PR #18 adds a production-specific assessment query requiring active + frozen source + `reviewer_status='APPROVED'` + non-null `review_date`, and revalidates before publication. This is a useful interim guard, but the schema/workflow still lacks admitted named reviewer identity, qualification evidence/reference, and a separate EN bilingual review record. Its client-selected scope is enum-validated but is not compared server-side with the selected group's persisted scope; production/demo/test scope binding remains open.
- PR #25 (head `f77ca5c73423ff3ddcc4d3a5f61dfb15849accf8`, base `8585d226c514b74564b9e86fed15c159385e741c`) adds the `show_correct_answers` gate for detailed PDFs and `Cache-Control: private, no-store`, but still has no attempt-terminal/grading-complete input. Its base differs from PR #18's current base, so the two drafts must be reconciled on one candidate SHA before acceptance.
- No PR-triggered workflow runs are recorded for the current PR #18 or PR #25 heads. Do not infer a green E-EXAM build/test from their patches.

### Exact-head and release disposition

PR #3 remains OPEN / DRAFT / UNMERGED at `c84d175751cd5c269951a6b2f1832467a960dce2`. Its five exact-head workflows remain 3 PASS (CSV structure, controlled reviewer admission, governance integrity) and 2 FAIL (direct Tier-A provenance, full DGR readiness). PR #298 remains draft/unmerged/undeployed with only its static security workflow passing. The repository remains public; the branch-protection endpoint returned HTTP 403 to this integration and the readable rulesets collection is empty.

No new Claude-authored DGR question-bank or E-EXAM implementation PR was found. The latest main commit `e1151964` is prospect-contact matching, not exam-platform work; PR #416's Claude-authored metadata correction is SEO-only.

**Decision remains NOT READY.** No question approved or imported; no PR merged; no production deployment; no DRM bypass; no ANAC/IATA approval claimed.


## Exact-head CI rerun — 2026-11-25 02:30 Africa/Algiers

This update supersedes the earlier 01:41 note that no PR-triggered workflow run was yet attached to `84dd340d`. GitHub now confirms all five DGR workflows completed against the exact PR #3 head `84dd340dd0c5c08a4dcaf13b5bfec6deb8907cfd` (branch `ai/dgr-stage2b-handoff`, PR #3, event `pull_request`):

| Workflow | Exact-head run | Result |
|---|---:|---|
| DGR import CSV structure | [45520618599](https://github.com/relaxsaadi/cbta/actions/runs/45520618599) | PASS |
| Controlled reviewer admission | [45520618593](https://github.com/relaxsaadi/cbta/actions/runs/45520618593) | PASS |
| Governance regression integrity | [45520618721](https://github.com/relaxsaadi/cbta/actions/runs/45520618721) | PASS |
| Direct item Tier-A provenance | [45520618540](https://github.com/relaxsaadi/cbta/actions/runs/45520618540) | FAIL |
| Full DGR regulatory readiness | [45520618609](https://github.com/relaxsaadi/cbta/actions/runs/45520618609) | FAIL |

The run metadata for both failing workflows records `head_sha=84dd340d...`; the three passing workflow runs are associated with the same exact PR head. The full-readiness job's governance-integrity sub-job passes, but the final artifact gate fails closed.

The exact-head full-readiness summary reports 287/287 task-to-matrix rows and 453 FR / 453 EN IDs with zero missing or extra IDs. It still reports **107 historical FROZEN provenance exceptions** and **140 FR↔EN status-mirror discrepancies**. By function, those counts are: 7.1 (0/0), 7.2 (4/11), 7.3 (18/20), 7.4 (10/13), 7.5 (12/16), 7.6 (13/18), 7.7 (14/19), 7.8 (12/15), 7.9 (14/16), and 7.10 (10/12), where each pair is FROZEN provenance exceptions / FR↔EN drift. The direct Tier-A job continues to reject terminal records without explicit per-item 67th Edition 2026 binding and records using representative, batch or cross-applied evidence wording. Evidence-artifact binding regression fixtures pass; that does not cure missing item-level licensed evidence.

The 453 candidate rows remain `IMPORT_ELIGIBLE=NO`, with zero blank blockers. The controlled reviewer registry remains empty; zero APPROVED questions are established. No regulatory state is promoted by this CI run.

The one-commit comparison from `c84d1757` to `84dd340d` confirms only `docs/PLATFORM_READY_CHECKLIST.md` changed (+63 lines). No bank, answer, source record, reviewer decision, import flag, application code, Moodle data or deployment changed. The combined Vercel status is FAILURE for the separate `kost-funnel` project and is not E-EXAM/Moodle acceptance.

**Release decision remains NOT READY.** No PR merged, no production deployment, no question approved/imported, no DRM bypass and no ANAC/IATA approval claimed.


## Exact-head correction — 2026-11-25 03:27 Africa/Algiers

This entry supersedes the prior 02:30 note that documented the preceding `84dd340d` head. The `84dd340d` runs remain valid for that earlier commit, but they are not the latest PR #3 validation.

**Live PR #3 metadata rechecked before this update:** branch `ai/dgr-stage2b-handoff`, head `99360568b9f218046bd901ff0485e503a14432ca`, 758 commits ahead / 0 behind `main`, 249 changed files, OPEN / DRAFT / UNMERGED. GitHub run metadata independently confirms each run below has `head_sha=99360568b9f218046bd901ff0485e503a14432ca`, branch `ai/dgr-stage2b-handoff`, event `pull_request`.

| Workflow | Exact-head run | Result |
|---|---:|---|
| DGR import CSV structure | [45526554063](https://github.com/relaxsaadi/cbta/actions/runs/45526554063) | PASS |
| DGR controlled reviewer admission | [45526554091](https://github.com/relaxsaadi/cbta/actions/runs/45526554091) | PASS |
| DGR governance regression integrity | [45526554007](https://github.com/relaxsaadi/cbta/actions/runs/45526554007) | PASS |
| DGR direct item Tier-A provenance | [45526554109](https://github.com/relaxsaadi/cbta/actions/runs/45526554109) | FAIL |
| DGR full regulatory readiness | [45526554086](https://github.com/relaxsaadi/cbta/actions/runs/45526554086) | FAIL |

The direct Tier-A job fails its sampled-only promotion and affirmative per-item current-edition evidence checks. It identifies 247 distinct question IDs with terminal evidence wording that is representative, batch, cross-applied or otherwise non-direct. Evidence-artifact binding, CSV structure and explicit SOURCE GAP/CONFLICT import-hold regression checks pass; those structural tests do not supply missing licensed evidence.

The full-readiness governance-integrity sub-job passes. The full artifact gate still fails on **107 historical FROZEN provenance exceptions** and **140 FR↔EN status-mirror discrepancies**. Per-function counts (FROZEN exceptions / FR↔EN drift): 7.1 (0/0), 7.2 (4/11), 7.3 (18/20), 7.4 (10/13), 7.5 (12/16), 7.6 (13/18), 7.7 (14/19), 7.8 (12/15), 7.9 (14/16), 7.10 (10/12). The exact-head artifact still has 287/287 task-to-matrix rows and 453 FR / 453 EN IDs with no missing/extra IDs. All 453 candidates remain `IMPORT_ELIGIBLE=NO`; the controlled reviewer registry remains empty; zero APPROVED questions are established.

This is a documentation-only correction. It does not change questions, answers, source evidence, FR/EN review status, reviewer records, import flags, E-EXAM code, Moodle data or deployment. **Release remains PLATFORM NOT READY.**


## Documentation-head follow-up — 2026-11-25 03:29 Africa/Algiers

The prior exact-head correction's template placeholders have been replaced with the literal verified SHA `99360568b9f218046bd901ff0485e503a14432ca`. The five run IDs in that section were independently checked through the GitHub Actions run endpoint and each reports that exact `head_sha`, branch `ai/dgr-stage2b-handoff`, and `pull_request` event.

The preceding documentation-only update was commit `68f5a97d4dd6ba5ecc8424bc87adcff6d93bf8e6`; this follow-up corrects its self-reference. The current PR head and ahead/behind count must be taken from live PR metadata, not inferred from this static checklist. No new DGR workflow run is attached to the documentation-only descendant that contains this correction; the latest five exact-head DGR results remain the verified runs on `99360568` above. No application code, question bank, source evidence, reviewer state, import flag, Moodle data or deployment changed.


## Stage 2B.1 — current E-EXAM base revalidation — 2026-11-25 03:32 Africa/Algiers

This is a read-only current-base audit of `feature/kost-eexam-v2-native` at `04334362f2ef028ded1ab5fd2dcc9c3b813dbd6b`. It supersedes treating the older PR #18/#25 base SHAs as the current E-EXAM candidate.

### Stack/base drift

- Current feature branch: `04334362`, unprotected.
- PR #18 base: `c4f4dae3a1d68a97bd7edc118cfa4d7bcddb2909`; current feature branch is 337 commits ahead (0 behind).
- PR #25 base: `8585d226c514b74564b9e86fed15c159385e741c`; current feature branch is 336 commits ahead (0 behind).
- PR #18 remains OPEN / DRAFT / UNMERGED at `def9dc931a2fb796f910b664af3138c18c50bb03`; PR #25 remains OPEN / DRAFT / UNMERGED at `f77ca5c73423ff3ddcc4d3a5f61dfb15849accf8`. GitHub's commit-workflow lookup returns no PR-triggered Actions runs for either exact head. Neither patch is a current integrated candidate until rebased/reconciled and tested on one SHA.

### Confirmed current-base defects

- `lib/questions.ts` blob `92edf60e`: `isAdmissibleWhereClause()` still uses `reviewer_status != 'REJECTED'`; a PENDING question therefore passes this helper.
- `lib/assessments.ts` blob `d21a34f2`: `createAssessmentDraft()` builds the pool with `listAdmissibleQuestionIds()` regardless of assessment scope, and `publishAssessment()` revalidates against the same helper. The stored `scope` does not currently select a stricter production reviewer gate.
- `CreateAssessmentForm.tsx` blob `1c48b3b2` and server action `actions.ts` blob `8f8bd54b`: the client submits a scope value and the action passes it to draft creation after a group-access check, but it does not bind/compare that scope to the selected group's persisted scope. The page's group selector does not load a scope field for this check.
- Candidate individual-report route blob `f32f002b`: the candidate path checks ownership, `show_result` and deferred release, but not `show_correct_answers`, terminal attempt status or completed grading before generating the detailed report. The URL's `level=detailed` controls the report level.

### What the two drafts do — and do not — resolve

- PR #18 adds a production-specific APPROVED + non-null `review_date` query and regression tests, but it is based 337 commits behind the current feature branch. Its own description correctly says the schema still lacks persisted named reviewer identity, qualification evidence/reference and separate EN bilingual-review completion. It also does not establish selected-group scope equality.
- PR #25 adds the `show_correct_answers=1` gate for detailed candidate PDFs and private/no-store caching, but its helper has no attempt-status or grading-completion input. It is based 336 commits behind the current feature branch.
- Rebase both changes onto one current candidate, then add group-scope binding and terminal-attempt/completed-grading checks with regression tests. Do not merge either stale stack or infer validation from the other PR's tests.

No code, question bank, Moodle data, credential, reviewer record or production state was changed by this audit. **Stage 2B.1 remains NOT ACCEPTED.**


## E-EXAM public test-harness documentation exposure — 2026-11-25 05:12 Africa/Algiers

A read-only review of the public `feature/kost-eexam-v2-native` branch found that the black-box test-harness README and `.env.example` exposed live Moodle test-account identifiers, role/context and course/service-allowlist details, plus a fixed password-shaped example. No credential value is reproduced here. Treat any value that may have been used as a live credential as exposed until the owner verifies and rotates it.

### Documentation correction completed

- [Commit `2fb911a`](https://github.com/relaxsaadi/cbta/commit/2fb911ae6e795ebeb1dfe74d4017eb282c00ca6f) rewrites `platform-ops/kost-eexam-console/README.md`: removes account/provisioning details and password examples; clarifies that the black-box suite does not build the separate console source tree at `platform-ops/kost-eexam-console-src`; and limits the candidate-flow test to the designated non-regulatory practice assessment.
- [Commit `e8489ee`](https://github.com/relaxsaadi/cbta/commit/e8489ee040ef7da23fcaa916c0d3ff47dfd16973) replaces the test-account identifiers in `platform-ops/kost-eexam-console/.env.example` with nonfunctional local placeholders.
- Read-back on the new feature-branch head `e8489ee040ef7da23fcaa916c0d3ff47dfd16973` confirms no former test usernames, password-shaped example, non-placeholder username values or non-empty password values remain in those two current files.
- [Issue #418](https://github.com/relaxsaadi/cbta/issues/418) tracks the owner-side exposure response. The documentation-only commits have no PR-triggered Actions runs; they are not a build, deployment or live security acceptance result.

### Owner-side actions still required

Rotate/reset affected test credentials if any disclosed or example value was ever used; invalidate related sessions/tokens as appropriate; review Moodle role assignments, external-service allowlist membership and authentication logs; confirm no real candidate/staff credentials were reused; and assess public Git history, forks, mirrors, caches and downloaded copies. Sanitizing the current tree does not erase historical Git objects. No live Moodle account, record, token or production state was changed by this documentation work.


## Function-level reconciliation — 2026-11-25 07:29 Africa/Algiers

This addendum is a read-only reconciliation of the current PR #3 artifacts and exact-head CI. It records counts and states only; it does not reproduce licensed IATA source text, promote any question, or change examination content.

### Exact PR #3 head and workflows

- Live PR #3: `ai/dgr-stage2b-handoff`, head `86e8faff2d1b7481b0a43b8de3016e69ae3cf186`, 763 commits ahead / 0 behind `main`, 249 changed files; OPEN / DRAFT / UNMERGED.
- Repository visibility remains PUBLIC.
- Exact-head pull-request workflows on `86e8faff`:
  - CSV import structure: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45546021865
  - Controlled reviewer admission: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45546021818
  - Governance regression integrity: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45546021835
  - Direct item Tier-A provenance: FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45546021887
  - Full DGR regulatory readiness: FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45546021817
- Both failing jobs were inspected. The direct Tier-A job has 247 distinct affected question IDs; the full-readiness job's governance-integrity sub-job passes, while its direct-evidence and final-artifact gates fail.

### Per-function reconciliation

The matrix files were fetched independently from the current handoff branch. Every function has its own source/competency matrix, its own official task count, its own Stage 2A blueprint, its own production-bank population and a separate EN review package. No function inherits Function 7.1's 44-task structure.

| Function | Official tasks | Questions FR/EN | Tier-A-affected question IDs | Question SOURCE GAP | Question SOURCE CONFLICT |
|---|---:|---:|---:|---:|---:|
| 7.1 | 44 | 19 / 19 | 18 | 1 | 0 |
| 7.2 | 23 | 49 / 49 | 29 | 6 | 1 |
| 7.3 | 33 | 45 / 45 | 30 | 2 | 1 |
| 7.4 | 37 | 53 / 53 | 25 | 1 | 2 |
| 7.5 | 25 | 44 / 44 | 20 | 1 | 2 |
| 7.6 | 28 | 56 / 56 | 31 | 1 | 1 |
| 7.7 | 27 | 53 / 53 | 25 | 1 | 0 |
| 7.8 | 23 | 51 / 51 | 27 | 2 | 0 |
| 7.9 | 24 | 39 / 39 | 22 | 2 | 2 |
| 7.10 | 23 | 44 / 44 | 20 | 1 | 2 |
| **Total** | **287** | **453 / 453** | **247** | **18** | **11** |

Task-level matrix GAP/CONFLICT counts are separate from question-level reconciliation counts:

| Function | Matrix task SOURCE GAP | Matrix task SOURCE CONFLICT |
|---|---:|---:|
| 7.1 | 2 | 1 |
| 7.2 | 5 | 1 |
| 7.3 | 2 | 1 |
| 7.4 | 5 | 2 |
| 7.5 | 5 | 2 |
| 7.6 | 5 | 1 |
| 7.7 | 4 | 0 |
| 7.8 | 3 | 0 |
| 7.9 | 3 | 2 |
| 7.10 | 2 | 2 |

The 247 Tier-A-affected counts are derived from the exact-head failing workflow log, grouped by canonical question ID. They are not a count of all questions or a statement that the remaining items are approved. The matrix task GAP/CONFLICT counts are derived from the separate matrix rows and must not be added to the question-level counts.

### Current 453-row reconciliation CSV

A quotation-aware CSV parse confirms 453 unique question IDs and these current individual FR status buckets:

- FROZEN: 246
- DRAFT: 147
- PARTIAL: 31
- GAP: 16
- CONFLICT: 3
- STALE: 8
- UNRESOLVED: 2

The normalized final reconciliation field is: 242 FROZEN, 151 DRAFT, 31 PARTIALLY CONFIRMED, 18 SOURCE GAP and 11 SOURCE CONFLICT. The difference between the individual FR bucket and final reconciled status is intentional and must not be silently collapsed. The final status field includes explanatory provenance text; the counts above were normalized by status prefix, not by treating the full text as a single category.

The import-candidate CSV has 453 unique IDs, all `IMPORT_ELIGIBLE=NO`, with zero blank BLOCKER fields. The controlled reviewer registry remains empty. No item is APPROVED.

### Function-specific evidence and reviewer limitations

- All ten matrices retain explicit non-positive FR source states where evidence is incomplete; reviewer/date cells remain pending.
- All ten EN review packages exist as separate artifacts. The inspected packages retain `BILINGUAL TECHNICAL REVIEW REQUIRED` and `PENDING REVIEWER + DATE`; translation-draft presence is not EN technical review.
- The reviewer registry is governance scaffolding with an empty canonical reviewer table. CI validates recorded structure, not the real-world qualification of a person.
- Matrices for Functions 7.8, 7.9 and 7.10 explicitly identify local course material built on DGR 66th Edition and limit current 67th Edition locators to evidence leads; this does not constitute current item-level Tier-A verification. The broader program status also records that local function course materials are not a substitute for the 67th Edition 2026 baseline.
- The final question-level SOURCE GAP/CONFLICT counts remain: GAP 18; CONFLICT 11. Known power-bank conflict items include Q-7.5-011, Q-7.9-032 and Q-7.10-012; preserve their explicit hold pending the applicable 2026 source/addendum reconciliation. Do not convert a conflict into a confirmed fact by cross-function copying.

### Stage 2B.1, Claude Code and security recheck

- Current audited E-EXAM feature baseline remains `04334362f2ef028ded1ab5fd2dcc9c3b813dbd6b`. PR #18 remains draft at `def9dc93` based on `c4f4dae3`; PR #25 remains draft at `f77ca5c7` based on `8585d226`. Both are stale-base proposals without current-head PR-triggered validation. Production admission, persisted group-scope binding, and terminal-attempt/completed-grading controls for detailed candidate reports remain unresolved.
- Claude-authored PR #416 is currently at `ba8e5f3a`; its latest commit changes the Function 7.1 SEO title to task-based wording. It is metadata-only, not exam logic. No new Claude-authored DGR question-bank or E-EXAM implementation PR was found.
- PR #417 is currently at `6f32d8c5` and changes dashboard Supabase initialization/error handling in two pages. It is a separate dashboard/Preview change, not E-EXAM/Moodle acceptance; the Blitz page still contains an expired 2026-09-30 deadline constant requiring separate copy correction.
- Current `main` still contains the query-string cron-secret middleware bypass and the LinkedIn-outreach GET query-secret check. PR #298's branch removes those paths and has static tests, but remains draft/unmerged/undeployed. Repository rulesets read is empty; branch-protection administration read returns HTTP 403 to this integration. Do not claim current protection settings have been changed.
- Public examination-bank and source-reference exposure remains under issue #340. The separate test-harness documentation cleanup is current-tree remediation only; it does not erase public history or replace credential rotation/log review where applicable.

### Disposition

All 453 import candidates remain blocked. No question status is promoted. No named qualified FR/EN review or final approval is recorded. No PR is merged, no production deployment is accepted, and no ANAC/IATA approval is claimed. Release remains **PLATFORM NOT READY**.


## Exact-head CI and Stage 2B.1 stacked-candidate re-audit — 2026-11-25 08:48 Africa/Algiers

This addendum records a fresh read-only audit. It does not alter question content, source evidence, reviewer decisions, import flags, E-EXAM runtime data or Moodle data.

### PR #3 exact current head

- Live PR #3 remains OPEN / DRAFT / UNMERGED. Branch: `ai/dgr-stage2b-handoff`; exact head: `d9412881a2e4b57e6ec7b3d5f0f9f25061fb072d`; 764 commits ahead / 0 behind `main`; 249 changed files. Repository visibility remains PUBLIC.
- All five PR-triggered DGR workflows are associated with this exact SHA. Both failing job logs explicitly fetch and check out `d9412881a2e4b57e6ec7b3d5f0f9f25061fb072d`.
  - DGR controlled reviewer admission: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45561815427
  - DGR governance regression integrity: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45561815456
  - DGR import CSV row structure: PASS — https://github.com/relaxsaadi/cbta/actions/runs/45561815453
  - DGR direct item Tier-A provenance: FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45561815495
  - DGR full regulatory readiness: FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45561815433
- The direct Tier-A regression fixtures, evidence-artifact binding, CSV structure, unresolved SOURCE GAP/CONFLICT import holds and import-candidate provenance checks pass. The actual gate still fails because 247 distinct questions contain representative, batch, cross-applied or otherwise non-direct evidence wording and lack affirmative direct current-edition per-item evidence.
- The full-readiness job's governance-integrity sub-job passes. Its final artifact gate fails on 107 historical FROZEN provenance exceptions and 140 FR↔EN status-mirror discrepancies. The log confirms 287/287 task-to-matrix rows, 453 FR / 453 EN IDs, zero missing/extra IDs, and 453/453 import candidates blocked as `IMPORT_ELIGIBLE=NO` with zero blank blockers. The controlled qualified-reviewer registry remains empty; zero APPROVED questions are established.
- The ten-function matrix, blueprint, FR-bank and separate EN-package inventory recorded above remains the current structural baseline. No task structure is copied from Function 7.1 to the other functions. Structural presence is not direct regulatory evidence or human approval.

### Stage 2B.1 — later E-EXAM stacked candidate found and tested

The earlier audit of `feature/kost-eexam-v2-native` at `04334362` is not the only relevant code line. A later, substantially larger stacked audit branch exists:

- PR [#399](https://github.com/relaxsaadi/cbta/pull/399), head branch `audit/eexam-submit-transition-reconcile-20261107`, head `3ea3745c5406da51dadd01719dddd6c204f1d0a5`, base branch `audit/eexam-answer-qtype-server-boundary`, 8 commits / 5 changed files, OPEN / DRAFT / UNMERGED.
- GitHub compare reports this branch 619 commits ahead / 0 behind `main`; compared with `feature/kost-eexam-v2-native` at `04334362`, it is 190 commits ahead / 2 behind. It is a large stacked proposal, not a merged or deployed release candidate.
- PRs [#362](https://github.com/relaxsaadi/cbta/pull/362), [#363](https://github.com/relaxsaadi/cbta/pull/363), [#364](https://github.com/relaxsaadi/cbta/pull/364), [#365](https://github.com/relaxsaadi/cbta/pull/365), [#381](https://github.com/relaxsaadi/cbta/pull/381) and [#399](https://github.com/relaxsaadi/cbta/pull/399) each have a completed successful E-EXAM V2 validation workflow. The inspected jobs pass lint, typecheck, unit tests, Playwright E2E, a LOCAL backup/restore drill, production build, Moodle token-transport regression, focused lint/typecheck and console production build. These are separate branch validations; they do not prove one integrated, merged, deployed candidate. Local backup/restore is not off-site durability or disaster-recovery acceptance.
- PRs #362–#365, #381 and #399 remain OPEN / DRAFT / UNMERGED. PRs [#18](https://github.com/relaxsaadi/cbta/pull/18) and [#25](https://github.com/relaxsaadi/cbta/pull/25) remain older draft proposals with no PR-triggered Actions runs on their exact heads.

### Controls present in the #399 stack — progress, not release acceptance

Read-only source inspection of `audit/eexam-submit-transition-reconcile-20261107` confirms:

- Assessment creation/publication and new candidate starts compare persisted company, group and assessment scopes. New starts recheck current group membership and role-aware candidate membership.
- Production publication adds an APPROVED + nonblank review-date minimum. New production starts revalidate every frozen snapshot against function, active/source state, reviewer flag/date, current question version, declared count, distinct question IDs and contiguous positions.
- Candidate answer writes are serialized with submission. The submit transition uses the server clock/serialized transaction, and submission, grading, result and audit work have atomicity regression coverage.
- The generic question admissibility helper still uses a non-REJECTED reviewer predicate for general pool construction; the stricter production publication and new-start gates are separate. Do not describe the generic helper alone as production approval.
- The production reviewer flag/date is explicitly only a technical minimum. The E-EXAM schema still does not establish the named qualified reviewer, qualification evidence/reference and independent EN review required by the DGR governance program. A status flag and date cannot substitute for that chain.
- Existing in-progress attempts intentionally retain resume continuity before new-start scope/reviewer gates. Preserve that behavior only with explicit policy and regression coverage; do not silently conflate it with admission of a new attempt.

### Remaining critical report-disclosure defect

The individual candidate PDF route on the #399 stack still checks candidate ownership, `show_result` and deferred-feedback timing, but does not enforce `show_correct_answers`, terminal attempt status or completed grading before rendering the detailed question-by-question report.

PR #25's separate branch adds a server-side `show_correct_answers` gate, but its policy helper still has no attempt-status or grading-state input; it also remains draft and is not integrated into the #399 stack. Reconcile both changes on one current candidate and add tests proving that an in-progress or awaiting-manual-grading attempt cannot expose detailed corrections, even with immediate feedback or a crafted `level=detailed` URL. Do not merge the stale PR #25 stack as-is.

### Claude Code / current open work

- The latest inspected Claude-authored commit remains `ba8e5f3a453867b2abb211435e303e065f2dc02d` on PR #416, authored and committed by GitHub user `claude`. It changes public-page SEO metadata/Function 7.1 task wording only; it is not exam-bank or E-EXAM implementation.
- PR #417 is a dashboard/Preview change, not E-EXAM/Moodle acceptance. No new Claude-authored DGR question-bank or E-EXAM implementation PR was identified in the current open-PR/branch search.
- Issues #340 (public answer-key exposure), #418 (test-harness documentation exposure), #118 (repository governance) and #400 (2027 edition rollover) remain OPEN. The repository remains public. Sanitizing current files does not erase public Git history or downloaded copies.

### Disposition

The later E-EXAM stack demonstrates meaningful technical progress and successful isolated validation, but remains unmerged and incomplete. Detailed answer-key report protection, named qualified reviewer/EN evidence, confidentiality containment, one reconciled release candidate, live staging, deployment and off-site recovery acceptance remain open. All 453 DGR import candidates remain blocked. No question is approved or imported. No PR is merged or deployed. No DRM is bypassed and no ANAC/IATA approval is claimed.

**Release decision: PLATFORM NOT READY.**


## Main-branch cron credential exposure and PR #298 revalidation — 2026-11-25 08:48 Africa/Algiers

A fresh default-branch code search on `main` at `e115196448753d2871b9885a0ea5cbdaf071790e` found a broader authentication boundary issue relevant to repository security and release governance.

### Current-main source findings

- `middleware.ts` still accepts `?secret=CRON_SECRET` as a bypass for protected routes without restricting the method/path to the exact scheduled cron allowlist.
- Browser pages `app/dashboard/agent/page.tsx`, `app/dashboard/intel/page.tsx`, `app/dashboard/instructors/page.tsx` and `app/dashboard/linkedin/page.tsx` reference `NEXT_PUBLIC_CRON_SECRET`. A `NEXT_PUBLIC_` variable is eligible for inclusion in the browser bundle. If it aliases the server-side `CRON_SECRET` expected by protected routes, the privileged credential is exposed to clients. Deployment environment values were not inspected; do not assume whether the alias is currently configured.
- Main still contains query-token checks in side-effecting stream and agent routes, including LinkedIn scan, instructor scan streams, agent follow-up and related scheduled handlers. URL credentials can enter browser history, proxy logs, telemetry and referrer paths.
- This is source-level evidence on public `main`, not proof that a particular secret value has been deployed or exfiltrated. No secret value was read or reproduced.

### PR #298 — substantial proposed correction, not yet deployed

- [PR #298](https://github.com/relaxsaadi/cbta/pull/298) remains OPEN / DRAFT / UNMERGED. Branch `fix/strict-cron-bearer-boundary-20261024`; head `8ecdc5e1c997d3fe3e6b38d2a1a04b58bb9c910c`; base `main` at `e1151964`; 37 commits / 25 files.
- Its static workflow [#45325913152](https://github.com/relaxsaadi/cbta/actions/runs/45325913152) completed successfully. The job passed both the cron authentication boundary tests and dashboard mutation CSRF-origin tests.
- The patch replaces URL-token middleware bypass with an exact seven-path, GET-only Vercel Cron Bearer allowlist; scheduled handlers independently reject missing server-side `CRON_SECRET`.
- Manual dashboard POSTs and side-effecting SSE GETs use separate Basic-authenticated `requireDashboardRequest` checks, same-origin Origin/Referer and Fetch-Metadata validation, and dashboard-referrer checks for SSE.
- The patch removes `NEXT_PUBLIC_CRON_SECRET` references from the four dashboard pages and removes query credentials from the four SSE routes covered by the regression suite. It also keeps autonomous outbound batch actions disabled unless the owner explicitly opts in via `DGR_OUTBOUND_AUTOSEND_ENABLED=true`.
- The static tests explicitly check the cron path allowlist, browser-token absence, SSE URL-token absence, POST-vs-cron separation and same-origin dashboard authentication.

### PR #298 acceptance still incomplete

The only associated PR-triggered workflow found on this exact head is the static security workflow. No full application build, integrated unit/E2E suite, deployed HTTP acceptance, live Vercel Cron invocation, authenticated browser/SSE run, or production rollback test is established by that result. The patch is a strong candidate for review, not proof of deployed remediation.

PR [#348](https://github.com/relaxsaadi/cbta/pull/348) remains an older OPEN / DRAFT / UNMERGED compatibility proposal. It narrows legacy query-token middleware bypass to five exact GET paths and rejects a public/server-secret alias, but retains a temporary query-token compatibility model; it is not a substitute for the more complete server-only Bearer + human dashboard-auth boundary in PR #298.

### Required owner/security acceptance

- Verify whether any deployed `NEXT_PUBLIC_CRON_SECRET` was configured to the server-side `CRON_SECRET`; inspect deployment configuration without printing values.
- If a privileged credential was ever browser-exposed, rotate it, invalidate related sessions/tokens, and inspect access logs and deployed browser bundles.
- Review PR #298 on one current candidate; run the full build/unit/E2E suite and live positive/negative tests for each scheduled GET, manual POST, SSE stream, CSRF/origin rejection and unauthenticated request before merge/deployment.
- Confirm all Vercel cron schedules use server-only Authorization Bearer and no URL query token remains. Do not enable autonomous outbound actions merely to make a test pass.

**Disposition:** current `main` remains uncorrected because PR #298 is unmerged. Repository security remains a release blocker. No credential value was inspected, no environment setting changed, no route was deployed and no production state was modified.


## E-EXAM candidate detailed-report correction proposal — 2026-11-25 08:48 Africa/Algiers

A focused correction was opened after re-reading the current #399 stacked candidate's individual PDF route and `AttemptDetail` data contract.

- New [PR #419](https://github.com/relaxsaadi/cbta/pull/419), branch `fix/eexam-candidate-report-terminal-grading-20261125`, is stacked on PR #399's head branch `audit/eexam-submit-transition-reconcile-20261107` at `3ea3745c5406da51dadd01719dddd6c204f1d0a5`.
- PR #419 head: `ae93013bbfd2c73a8e26970602c833e147b78d88`; 3 commits / 3 files; OPEN / DRAFT / UNMERGED; GitHub reports mergeable against its declared stacked base.
- The new pure candidate-report policy keeps the existing simple-report result-visibility behavior. A candidate detailed PDF now requires `show_result=1`, deferred feedback elapsed, `show_correct_answers=1`, terminal attempt status (`submitted` or `auto_submitted`) and `grading_state=COMPLETE`. In-progress, abandoned, awaiting-manual-review and missing-result states fail closed.
- The PDF response adds `Cache-Control: private, no-store`. Staff/administrator/auditor access remains governed by the existing role and tenant checks; the new policy is candidate-only.
- Six unit cases cover explicit answer-key release, in-progress/abandoned states, pending/manual grading, deferred/hidden results, successful terminal completion and preservation of the simple-report policy.
- The E-EXAM V2 workflow [#45572009622](https://github.com/relaxsaadi/cbta/actions/runs/45572009622) started on the exact PR #419 head. The console token-transport/focused-lint/typecheck/build job passed. The main lint and typecheck steps passed; the unit-test step was still running at this audit, with E2E, local backup/restore and production build pending. No overall workflow pass is claimed.
- This proposal addresses issue [#68](https://github.com/relaxsaadi/cbta/issues/68) and the separate report gap not fixed by PR #25 alone. It is not merged, deployed or accepted. Recheck the full workflow on the exact final head before any merge consideration.

**Disposition:** candidate answer-key release remains a critical gate until PR #419's full validation passes and the change is integrated into one current E-EXAM candidate. This does not resolve DGR Tier-A evidence, named qualified FR/EN reviewer requirements, public-bank confidentiality, live staging, deployment or off-site recovery.


## Licensed 67th Edition source-access reconciliation — 2026-11-25

A Library search found the IATA Store order confirmation for the **2026 Edition 67, Digital Individual, French** DGR product, with order status Received and order date 24 August 2026. The confirmation establishes purchase, not current access to or verification of the licensed manual text. The Library search surfaced the order receipt and historical working notes, but not the full 67th Edition text, tables, packing instructions, special provisions or current addenda.

Prior Stage 2B.1 working records explicitly state that the IATA Digital Publications Bookshelf session requires the owner to manually re-authenticate with 2FA; no login attempt or DRM bypass was made. The existing per-item SOURCE REQUIRED states therefore remain correct. Do not infer that a purchase receipt, 66th Edition course deck, 2026 significant-change summary, or old addendum is direct 67th Edition Tier-A evidence.

**Owner-only blocker refined:** the edition purchase is documented; the missing step is authorized owner-side Bookshelf re-authentication/access and delivery of verifiable current-edition locations to the controlled review process. After access is restored, verify each affected item against its exact 67th Edition section/table/PI/SP and applicable 2026 addendum, record source locator and FR verification, then obtain named qualified reviewer/date and separate EN review. No copyrighted text needs to be copied into public GitHub.

No licensed source text was retrieved or reproduced in this audit. No question status changed. No DRM was bypassed.


## Exact-head DGR result and PR #419 rerun state — 2026-11-25 08:48 Africa/Algiers

### Latest PR #3 DGR head

PR #3 is OPEN / DRAFT / UNMERGED at `7e79809d35ee34f1958aa72c28c45fc050b78f53`, 768 commits ahead / 0 behind main, 249 changed files. The latest exact-head workflow set checked out this SHA in both failing logs:

- CSV import structure PASS — https://github.com/relaxsaadi/cbta/actions/runs/45572510310
- Controlled reviewer admission PASS — https://github.com/relaxsaadi/cbta/actions/runs/45572510367
- Governance regression integrity PASS — https://github.com/relaxsaadi/cbta/actions/runs/45572510337
- Direct Tier-A provenance FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45572510248
- Full DGR readiness FAIL — https://github.com/relaxsaadi/cbta/actions/runs/45572510354

The full-readiness governance-integrity sub-job passes. The direct-evidence and final artifact gates fail. The artifact summary again reports 287/287 task rows, 453/453 FR and EN IDs, zero missing/extra IDs, 107 historical FROZEN provenance exceptions and 140 FR↔EN status discrepancies. All 453 import candidates remain NO. The failure log lists the same function-level exception distribution already tabulated above (7.2: 4/11; 7.3: 18/20; 7.4: 10/13; 7.5: 12/16; 7.6: 13/18; 7.7: 14/19; 7.8: 12/15; 7.9: 14/16; 7.10: 10/12; Function 7.1: 0/0 for FROZEN exceptions / FR↔EN drift). The direct Tier-A validator still rejects representative, batch, cross-applied or missing per-item 67th Edition evidence.

### PR #419 corrected rerun

PR #419 is OPEN / DRAFT / UNMERGED at exact head `a81fc3f1e498ed83ae84dadef585f24232863d8c`, stacked on PR #399. Its first run on the prior head failed one static test because an existing guard still expected the old inline result-visibility expression; the test was updated to assert the shared fail-closed policy wiring.

The corrected exact-head run is https://github.com/relaxsaadi/cbta/actions/runs/45572275470:
- Console Moodle token-transport, focused lint, typecheck and production build: PASS.
- Main E-EXAM lint and typecheck: PASS.
- Unit tests: PASS after the static guard correction.
- Playwright E2E: IN PROGRESS at this audit.
- Local backup/restore drill and main production build: not yet run (pending behind E2E).

The earlier failed run remains failed and must not be presented as a pass. No overall PR #419 validation pass is claimed until the corrected run completes all jobs. The direct route-level candidate report regression remains a required acceptance check; the current PR adds pure-policy unit tests and static route-wiring assertions, not a live deployed candidate test.

**Release disposition unchanged:** the E-EXAM report fix is a promising unmerged proposal; DGR direct Tier-A evidence and FR/EN reviewer gates remain blocked; repository security and production integration/recovery remain unaccepted. No question approved/imported, no PR merged, no deployment.
