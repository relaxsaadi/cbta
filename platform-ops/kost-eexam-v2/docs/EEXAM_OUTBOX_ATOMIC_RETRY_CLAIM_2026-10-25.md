# Stage 2B.1 — outbox retry exclusive claim (#99)

**25 October 2026 — DRAFT / PRE-PRODUCTION / NOT READY.** Shared E-EXAM service for CBTA 7.1–7.10; this correction has no effect on task mappings, examination questions, scores, FR/EN source attestations, IATA/ANAC approvals, or production data.

## Observed fault

Before this change, `processOutboxRetries()` selected `FAILED` notification records and `attemptSend()` unconditionally wrote `SENDING` by ID. Two workers could select the same record and each call the provider. The outbox UNIQUE key prevents duplicate rows but not duplicate dispatch. Resend's request-level idempotency key reduces provider duplicates but is not a local exclusive-claim proof.

## Proposed defense

- A retry must **atomically** move `FAILED -> SENDING` via a conditional SQLite UPDATE before any Resend SDK invocation. The condition checks the recorded `retry_count`, `failed_at`, retry ceiling and retained body, so a worker holding a stale pre-send snapshot cannot claim a newer failure generation after another attempt completed (`FAILED -> SENDING -> FAILED` ABA).
- Policy terminalization also uses the original `FAILED` generation condition and clears the retained body without invoking the provider. The delivery policy is re-evaluated **after** a successful retry claim; stage `EMAIL_MODE=log`, the recipient allowlist and bounce/complaint suppressions remain fail-closed.
- New `QUEUED` messages also conditionally claim `SENDING` before first network dispatch. Provider invocation counters exclude claims lost to other workers and policy/configuration skips. A send-client initialization failure before invocation does not consume retry budget.
- Updates after provider response/error are conditional on `status='SENDING'`; this reduces the risk of overwriting an already-applied provider event. Terminal-body removal is conditional on an actually terminal status.
- No DB schema migration or new privileged HTTP endpoint. No runner is enabled. No production emails are sent by CI.

## Synthetic tests and limits

`tests/unit/email-outbox-claim-concurrency.test.ts` runs two **independent Node/SQLite processes** with a mocked Resend HTTP transport against the same temporary database and checks only one provider invocation. It also verifies an ambiguous `SENDING` row remains quarantined rather than being blindly replayed. Existing policy/convergence and provider-idempotency tests must continue to pass. These checks do **not** constitute a deterministic barrier proving both workers captured a stale snapshot or representative real-Resend/staging acceptance; record that independent gate separately.

## Still blocking #99 / production

1. A scheduled, authenticated retry runner is **not installed**; durable `FAILED` backlog remains operationally unprocessed. Add an owner-reviewed runbook, maximum batch, backoff, aged backlog alert and bounded retry policy, without exposing bearer tokens.
2. No automatic reclaim of `SENDING` is enabled. A process crash after the SQLite claim but before any provider acknowledgement can strand a record; after a transport timeout, provider acceptance is potentially ambiguous. Recovery requires an audited **provider-led manual disposition**, not a blind replay or a nominal lease expiry.
3. Historic `FAILED` staging notifications (six records from 2026-08-29 mentioned in #99) require owner-approved cutover reconciliation before **any** automatic runner, to prevent stale transactional mail.
4. Provider API errors/timeouts and retries after the provider idempotency retention window need separate end-to-end staging tests. A row that records `FAILED` after an ambiguous timeout is not proof that the provider rejected it; a release review must explicitly assess this residual risk.
5. #225 missing notification intents / stranded `QUEUED/SENDING`, #323 early signed webhook evidence, queued/sending operational alerts, production backup/restore and independent multi-worker cutover remain separate critical gates. Vercel checks and local CI alone are not production acceptance.

## Function-by-function regulatory release gate

Each of **7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9 and 7.10** independently requires its own current CBTA task table and source/competency matrix, function-specific blueprint, direct and current **IATA DGR 67th Edition (2026) Tier-A** evidence for every regulatory claim, explicit `SOURCE GAP` / `SOURCE CONFLICT` states, verified FR source, separate EN bilingual review, and a **named qualified human reviewer with date** before any question can be `APPROVED`. Do not assume Function 7.1's 44-subtask scheme applies elsewhere. No regulatory approval is inferred from this technical PR.

**Release decision: NOT READY.** Keep this PR stacked and DRAFT; do not merge/deploy or activate retries until independent tests, proper operator policy and all critical platform/regulatory gates pass.
