# kost-eexam-console — black-box test suite

Playwright E2E/RBAC/security test suite for the **live** KOST E-EXAM console
(`console.kostacademy.com`) and Moodle exam engine (`exam.kostacademy.com`).

## Why this exists here

An earlier session built a much larger local prototype (the actual Next.js
console source, PHP admin scripts, and an earlier test suite) in a
`/private/tmp` scratchpad. That path is **not** a git repo and its contents
were lost to routine OS temp-directory cleanup between sessions (see
`docs/AI_HANDOFF.md`'s fifth-pass log, 2026-08-25). This directory is a
from-scratch rebuild of the *test suite* only (not the console app itself,
whose source is not currently available from this environment), committed
here so it survives future cleanups.

These tests are **black-box**: they drive the real production URLs with
dedicated test accounts. There is no local dev server and nothing here
builds/runs the console application itself.

## Setup

```bash
cd platform-ops/kost-eexam-console
npm install
cp .env.example .env   # fill in real values — see below
npx playwright test    # all projects: chromium/firefox/webkit/mobile/tablet
npx playwright test --project=chromium-desktop   # fastest single run
```

Playwright browsers are expected to already be cached at
`~/Library/Caches/ms-playwright` on this Mac (chromium/firefox/webkit) — no
`npx playwright install` should be needed. If browsers are missing, run
`npx playwright install`.

## Credentials

`.env.example` documents each variable. All accounts are dedicated,
clearly-labelled TEST accounts on the live Moodle instance — never real
candidate/staff credentials:

- `RBAC_ADMIN_USER=rbac_test_admin` — `kost_console_admin_role`, created
  this pass to avoid touching the real `console_admin` a human appears to
  actively use (browser-saved password observed in an earlier session).
- `RBAC_AUDITOR_USER=console_auditor` — pre-existing account, password
  rotated to a known test value via `admin/cli/reset_password.php`.
- `RBAC_CANDIDATE_USER=test_candidate` — pre-existing account, same
  password-rotation approach. Enrolled as `student` in course 4
  (KOST-PRACTICE-TEST).
- `RBAC_MANAGER_USER=rbac_test_manager` / `RBAC_TEACHER_USER=rbac_test_teacher`
  — generic Moodle `manager`/`editingteacher` roles, created as proxy probes
  for the console login page's advertised "exam manager"/"instructor" tiers.
  **As of 2026-08-25 these do NOT grant console access** — that tier is not
  yet implemented (see `docs/PLATFORM_READINESS_REPORT.md` Gate C). Kept for
  re-testing once/if it is.

**IMPORTANT — password values containing `#`:** dotenv treats an unquoted
`#` as a comment start and silently truncates the value. Always quote
password values in `.env`, e.g. `RBAC_ADMIN_PASS="RbacTest#2026Kost!"`.

To (re)provision these accounts on the live Moodle instance, see the SSH/PHP
steps in `docs/AI_HANDOFF.md`'s fifth-pass session log — they use Moodle's
own `user_create_user()` / `role_assign()` APIs (never raw SQL user-table
inserts) plus `admin/cli/reset_password.php`, and require adding new
accounts to the `kost_eexam_console` external service's authorized-user list
(`mdl_external_services_users`) — console login has two independent
server-side gates (role + service whitelist), not just one.

## What's covered

- `tests/smoke.spec.mjs` — console login/logout/session, invalid credentials,
  unauthenticated redirect.
- `tests/rbac.spec.mjs` — server-side authorization boundaries for
  admin/auditor/candidate, plus the "GAP FINDING" probes documenting that
  generic Moodle roles don't grant console access.
- `tests/security-headers.spec.mjs` — HSTS/CSP/X-Content-Type-Options/etc.
  on both live domains.
- `tests/candidate-exam-flow.spec.mjs` — full candidate exam lifecycle
  (login → instructions → start/resume → timer → flag → answer → refresh →
  submit → DB-verified completion → double-submit protection) against the
  non-regulatory "KOST E-EXAM — Practice Test" quiz. Never touches the real
  DGR course or its historical attempts. Includes a direct, read-only SSH/DB
  check (`queryAttemptState()`) as ground truth for completion, since this
  quiz has "Relecture non autorisée" (review not permitted) configured and
  deliberately does not render a candidate-facing results screen.
- `tests/a11y-smoke.spec.mjs` — axe-core accessibility scan of console
  login/overview and the Moodle login page.

## Known residual issues (as of 2026-08-25)

- Firefox and WebKit engines hit timing-sensitive failures on the longest
  test (`candidate-exam-flow`'s full-attempt case) that Chromium and
  mobile-chrome do not. Not confirmed as a platform defect — plausibly
  headless-engine timing interacting with real network latency to the
  Algeria-hosted VPS. Not chased further; a dedicated stabilization pass
  would be needed for full cross-browser certainty.
- A real, reproducible WCAG AA color-contrast accessibility violation exists
  on the console's `/login` and `/overview` pages (see
  `docs/PLATFORM_READINESS_REPORT.md` Gate H for exact numbers). Needs a fix
  in the console's own UI source, which is not available from this
  environment.
