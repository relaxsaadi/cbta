# Stage 2B.1 — signed Resend webhook can arrive before provider-ID linkage (#323)

**Status: DRAFT / NOT READY.** Common E-EXAM runtime, CBTA Functions 7.1–7.10. This is a technical safety change, not DGR question approval, ANAC/IATA authorization, a deployment receipt, or evidence of live delivery.

## Failure sequence and proposed guarantee

Before the patch, the send path recorded SENDING without a provider ID and awaited `resend.emails.send`. A genuine signed `email.bounced` or `email.complained` event during that await could not match a local notification and was acknowledged without persistence. A later response recorded the ID, but the original event (and suppression signal) was lost.

The draft change introduces `resend_pending_webhook_events`:

- Only after the public route's *existing* Svix signature/timestamp verification, handled events not yet matched to a local provider ID are stored durably (unique signed event ID, provider message ID, type, normalized provider timestamp, received timestamp). The handler returns 200 only **after** the SQLite commit. DB failure/capacity pressure returns 503 for provider retry. No raw payload, recipient, signed headers, credentials, full message content, or candidate answers are stored.
- On a confirmed provider response with an ID, `finalizeResendAcceptedSend` links the ID, writes the SENT snapshot, replays all matching signed events through the existing audit/suppression logic, and removes those pending entries **in a single BEGIN IMMEDIATE transaction**. If any audit/suppression write fails, all these changes roll back, the event remains pending, and the notification stays SENDING (not FAILED/retried after ambiguous acceptance).
- A response with no valid provider ID also remains SENDING pending operator investigation. It is *not* claimed SENT. A previously unmatched external message ID cannot be guessed or joined by recipient, tenant, subject, or send timestamp. The signed-ID guard rejects a conflicting type/message reusing the same `svix-id`.
- Legacy internal test callers without signed evidence retain the historical direct path; the public HTTP webhook still always requires valid signed evidence.

## Operational gates before any live enablement

1. **Preflight:** take a verified backup, test restore, run migration in isolated copy and prove old notification rows/audit log remain intact. New table is additive. Do not turn on email in staging except allowlisted provider/recipient test accounts.
2. **Race test:** orchestrate a delayed provider response while sending a valid signed provider webhook first; prove the HTTP ACK is persisted and later replay records provider history + suppression exactly once. Repeat for bounced, complained, delivered, duplicate/reordered ID, invalid signature, unknown external ID, server crash and independent SQLite writer processes.
3. **Failure atomicity:** inject an audit insert failure on replay; verify rollback of ID linkage, notification status, suppression and audits, while pending signed evidence survives a process restart. The synthetic unit tests cover this path but do **not** prove a real Resend integration.
4. **Operator visibility:** check read-only counts/age without logging raw provider payloads. For example:
   ```sql
   SELECT COUNT(*) AS unresolved_verified_events, MIN(received_at) AS oldest_received_at
   FROM resend_pending_webhook_events;
   SELECT provider_message_id, COUNT(*) AS n, MIN(received_at) AS oldest_received_at
   FROM resend_pending_webhook_events GROUP BY provider_message_id ORDER BY oldest_received_at LIMIT 50;
   ```
   There is a hard ceiling of **2,000** unresolved events. When full, webhook requests fail closed (503). Investigate whether entries belong to the same provider account, an earlier send awaiting linkage, or unrelated external messages. No automated deletion, arbitrary expiry, silent ACK, or guess-based reconciliation. Implement an **audited, access-controlled retention/disposition workflow** before production acceptance; do not manually delete uninvestigated bounce/complaint evidence.
5. **Other critical holds:** #225's stuck QUEUED/SENDING notification delivery state, rolling deployment's mixed legacy/new idempotency keys (#321), independent staging, security/RBAC, Moodle/console integration, backup/restore, monitoring and rollback all remain open. Existing emailed messages must never be blindly resent.
6. **Regulatory hold:** every Function 7.1–7.10 has a separate current CBTA task-derived source/competency matrix and blueprint, direct IATA DGR **67th Edition (2026) Tier-A** reference evidence for each regulatory claim, `SOURCE GAP` / `SOURCE CONFLICT`, FR verification, separate EN technical review, and a named qualified reviewer/date before `APPROVED`.

**Release label stays NOT READY.** The draft is not a deployment authorization. Never call the platform ready merely because this patch is merged or CI passes.
