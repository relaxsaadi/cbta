# Stage 2B.1 — immutable email sender provenance (#326)

**25 October 2026 — DRAFT / NOT READY.** This is a shared E-EXAM notification fix for CBTA Functions 7.1–7.10, not a regulatory/question-bank approval, production deployment, or authorization to send mail.

## Confirmed defect and bounded remediation

Previously, an initial notification could use `getSenderExam()` or `getSenderSecurity()`, but the retry worker sent *every* FAILED message as `getSenderNotifications()`. The outbox persisted the subject/body/idempotency key but not the original From identity. This changes the retry payload for the same provider idempotency key and can misrepresent security and exam correspondence.

New enqueues persist `sender_name`, `sender_address`, and the original nullable `reply_to_address` beside the outbox record **before** provider invocation, after defensive single-header validation. Reply-To is also frozen because re-reading a changed environment variable on retry would mutate the provider request under an existing idempotency key. `processOutboxRetries()` selects only records whose original sender exactly matches a *currently configured* approved identity, and uses that stored identity for provider dispatch. New nullable columns are added idempotently to existing databases via `scripts/migrate.ts`. There is **no historical sender backfill**.

Legacy FAILED records with missing original sender data and previously configured/retired senders **remain FAILED on hold**, and are excluded in SQL so they cannot starve eligible newer records. Operators must not fabricate original From values or auto-replay them. The current retry result does not count these held records: use a read-only preflight, for example:

```sql
SELECT id, event_type, created_at
FROM notification_log
WHERE status = 'FAILED'
  AND (sender_name IS NULL OR sender_address IS NULL)
ORDER BY created_at ASC;
```

Record an audited, authorized disposition with recipient/privacy considerations before further cutover. Do not publish recipient addresses, message bodies, reset tokens or authentication material in operational reports. Historic notifications may be stale, and messages left SENDING may already have been accepted by the provider.

## Validation and unresolved release gates

Synthetic tests verify distinct Exam, Security and Notifications sender identities, original Reply-To surviving configuration rotation, actual enqueue persistence, rejection of From header injection, quarantining of legacy sender-less rows, and config-rotation holds. Require exact-head lint/TypeScript/unit/Playwright/build/backup-and-restore/Moodle-console checks and an independent staging drill before acceptance; CI does not establish provider idempotency behavior in real Resend.

This stacked draft fix **does not** install or authorize a retry runner (#99), resolve ambiguous SENDING/timeout recoveries, repair missing submission intents (#225), close signed webhook evidence reconciliation (#323), or establish independent security/backup/deployment readiness. Keep #326 open until current configuration and migration evidence are independently reviewed. The rollout plan must decide how to monitor held senders and avoid stale transactional mail.

For each CBTA function **7.1–7.10**, the separate current task/competency matrix and blueprint, direct IATA DGR 67th Edition 2026 Tier-A source evidence, explicit SOURCE GAP/CONFLICT, FR verification, separate EN bilingual review and named qualified reviewer/date remain mandatory before any APPROVED question-bank state. Do not copy 7.1's subtask structure into other functions.

**Overall release decision: NOT READY.** No secrets, real send, production data, regulatory statements, score semantics, grading or question approvals were changed by this documentation.
