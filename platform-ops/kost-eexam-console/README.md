# kost-eexam-console — black-box test suite

Playwright E2E/RBAC/security tests for KOST's hosted E-EXAM console and Moodle exam engine.

## Scope and source relationship

This directory is a **black-box test suite**. It does not build or run the console application itself.

The console application source is maintained separately in `platform-ops/kost-eexam-console-src`. A passing black-box test does not prove that the deployed console is built from that source tree. Before release acceptance, record and compare the deployed application commit/image digest with the reviewed source commit, and run the source tree's own build, type-check, lint and test pipeline.

The candidate-flow test is intended for a dedicated, non-regulatory practice assessment only. Verify the target host, test account and assessment scope before execution. Do not use real candidate/staff accounts, regulatory DGR examinations, or production candidate data. Mutation tests against a hosted Moodle instance require explicit owner authorization, an approved change window and a recovery plan.

## Setup

```bash
cd platform-ops/kost-eexam-console
npm install
cp .env.example .env   # set local values from an approved secret manager
npx playwright test    # all configured projects
npx playwright test --project=chromium-desktop
```

Playwright browsers may already be cached locally. If a browser is missing, install only the browser binaries required by the approved test plan.

## Credentials and test accounts

`.env.example` intentionally contains nonfunctional placeholders only. Populate the ignored local `.env` from an approved secret manager or private credential vault.

- Use dedicated, least-privileged test accounts in an isolated/staging Moodle environment wherever possible.
- If an owner-authorized hosted test instance is used, restrict tests to dedicated non-regulatory practice data and time-bound test accounts.
- Never use real candidate/staff credentials or shared human accounts.
- Do not commit usernames, passwords, tokens, account IDs, course IDs, role assignments, service-allowlist membership, browser profiles, SSH key paths, database connection strings or provisioning transcripts.
- Keep account creation, role assignment and service-allowlist instructions in a restricted operational runbook, not this public repository.
- Quote local dotenv values containing `#` so the character is not parsed as the start of a comment.
- Any credential value that has appeared in a public repository, commit history, issue, log, screenshot, artifact or chat must be treated as exposed and rotated. Editing the current file does not erase historical Git objects, forks, mirrors, caches or downloaded copies.

## What's covered

- `tests/smoke.spec.mjs` — console login/logout/session and unauthenticated redirect.
- `tests/rbac.spec.mjs` — server-side authorization boundaries for the configured test roles.
- `tests/security-headers.spec.mjs` — security-header checks on the configured hosted endpoints.
- `tests/candidate-exam-flow.spec.mjs` — candidate lifecycle against the designated non-regulatory practice quiz. It includes a read-only completion-state check; it must not be repointed to a regulatory examination.
- `tests/a11y-smoke.spec.mjs` — accessibility smoke checks for console and Moodle pages.

## Known residual observations

The 2026-08-25 test notes recorded timing-sensitive Firefox/WebKit failures on the longest candidate-flow case and a color-contrast accessibility issue on login/overview. These are historical observations, not current acceptance results. Re-run the relevant tests against the exact release candidate and record the tested commit, browser versions, target environment and results before closing either item.

A successful run of this suite alone does not establish production readiness, Moodle/console source equivalence, regulatory question-bank approval, backup/recovery acceptance or ANAC/IATA approval.
