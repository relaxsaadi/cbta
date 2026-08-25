# Security Incident Record — Plaintext Credential Exposure

**Status:** Closed — remediated. History-purge deliberately deferred (see below).
**Severity:** High (real, active credentials in version control) — mitigated to Low upon rotation.

## Detection

- **Date/time:** 2026-08-25, during the KOST E-EXAM console finalization session, on branch `console/finalization-2026-08-25`.
- **Source:** Reported by a separate concurrent session, which flagged `smoke-test-prod.mjs` as containing a plaintext Moodle account password. Confirmed immediately, then expanded via a full structural sweep of the source tree.

## Affected accounts

- `console_admin` (Moodle `kost_console_admin_role`)
- `test_candidate` (Moodle candidate/student role)

No other accounts were found affected.

## What was exposed

Plaintext passwords for the two accounts above were hardcoded directly in source, passed to `page.fill(...)` calls in standalone Playwright scripts:

- `smoke-test-prod.mjs` — the file originally reported.
- 13 additional orphaned, one-off diagnostic scripts found via a follow-up sweep (`smoke-test-prod.mjs.bak`, `authz-test.mjs`, `auditor-role-test.mjs`, `csp-test.mjs`, `cookie-audit.mjs`, `cross-browser-test.mjs`, `record-identity-verification.mjs`, `list-partials.mjs`, `phase2-test.mjs`, `phase2b-test.mjs`, `phase2c-batch2-test.mjs`, `phase3-test.mjs`, `screenshot.mjs`, `take_practice_attempt.mjs` + its duplicate under `moodle-scripts/moodle-scripts/`).

All 14 files were tracked in git as of this branch's baseline import commit (`b81cb4e`) and had already been pushed to the `origin` remote. None of the 14 were referenced by `package.json`, `README.md`, or any other doc — all were superseded by the actively maintained Playwright suite at `platform-ops/kost-eexam-console/tests/`.

No secrets belonging to any *other* system (Moodle DB, session signing key, service tokens) were found in this sweep.

## Remediation actions taken

1. **Both affected passwords rotated** via Moodle's own official `admin/cli/reset_password.php` (never a raw SQL write). Old values are invalid as of rotation; new values were never printed to chat, logs, commits, or any tracked file — stored only in a local file outside the git repository.
2. **Plaintext removed from current source**: `smoke-test-prod.mjs` rewritten to read credentials from the environment (`CONSOLE_ADMIN_USER` / `CONSOLE_ADMIN_PASS`, loaded via Node's native `--env-file`, no hardcoded fallback); the other 13 files deleted (safe — unreferenced, superseded, recoverable from git history / the pre-finalization VPS tarball backup if ever needed).
3. **Removed from the deployed VPS copy** (`/root/kost-console-stack/app/`) via the same sync used for the rest of this session's deployments, followed by a full Docker image rebuild so no image layer retains the deleted files.
4. **Environment-variable mechanism implemented**: `.env.local.example` added (variable names only, no values); `.dockerignore` hardened (added bare `.env`, matching `.gitignore`'s existing `.env*`) so no local env file can ever be baked into the production image.
5. **`platform-ops/kost-eexam-console/.env`** (the maintained suite's local, gitignored credential file) updated with the new `test_candidate` value so that suite keeps working.

## Verification

- `smoke-test-prod.mjs`, re-run with the new `console_admin` credential via `--env-file`: **9/9 checks passed**, live against production.
- Maintained suite (`tests/smoke.spec.mjs` + `tests/rbac.spec.mjs` + `tests/mutation-rbac.spec.mjs`), using both rotated accounts: **12/12 passed**, live against production.
- Production container rebuilt and redeployed; `console.kostacademy.com/login` returns HTTP 200 post-redeploy.
- Re-confirmed once more after redeploy, on request: `console_admin` full login/session/logout cycle (9/9) and `console_auditor` login (1/1) both pass live.

## Git history exposure

The old `console_admin` password is present in one historical commit on this branch: **`b81cb4e`** (already pushed to `origin/console/finalization-2026-08-25`). That value is invalid as of the rotation above — its presence in history is no longer a live credential exposure, only a stale artifact.

**Decision:** history rewrite (`git filter-repo` / BFG + force-push) is **intentionally deferred until after the ANAC audit**, to avoid the branch-disruption and force-push risk of a history rewrite this close to the audit. Rotation is the control that actually neutralizes the exposure; the history purge is cleanup on top of an already-closed risk, not itself urgent.

## Outstanding follow-up (post-audit, not before)

- Purge commit `b81cb4e` from this branch's history (or squash/rebase it) and force-push, once the audit window has passed and there is time to safely coordinate.
- If this repository was ever cloned or forked elsewhere, that copy would still hold the old (now invalid) value in its own history — no action possible from here beyond rotation, which has already neutralized it.
