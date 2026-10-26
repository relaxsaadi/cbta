# Stage 2B.1 — ambiguous provider transport exception (#328)

**26 October 2026 — DRAFT / NOT READY.** Shared E-EXAM notification engine across Functions **7.1–7.10**. No real email send, deployment, regulatory bank import or qualification approval is authorized.

## Code-level finding and conservative behavior

At draft PR #327 head `872ed8de6e211a94bb786fb6910c105052285fc2`, `attemptSend()` set `providerAttempted=true` just before invoking `resend.emails.send()`, but its thrown-exception catch always wrote `FAILED`. A request may have been accepted while the response was lost in a timeout/network interruption; `FAILED` makes it eligible for an automatic retry, potentially outside a provider idempotency retention period. This is **not** evidence of an actual duplicate production email.

The proposed #328 change distinguishes:

- **Before provider invocation:** exceptions may remain `FAILED`, retaining the existing rendered-body recoverability without consuming a provider attempt.
- **After invocation, thrown/indeterminate exception:** leave the row in `SENDING`, persist only a fixed sanitized operator-action reason, and **do not** classify it as `SENT` or `FAILED`. Automatic `FAILED` retry queries never select it.
- **Explicit provider negative response:** existing bounded `FAILED` handling remains. Distinguishing definitive API rejections from indeterminate SDK-returned failures requires further provider-contract evidence, so this PR does not authorize a retry runner or close #99.

The fix preserves #325 atomic claim, #326 stored original sender/Reply-To, #323 signed webhook linkage, recipient suppression, `EMAIL_MODE` and allowlist, and no automatic replay of ambiguous historical `SENDING` rows. The application must not infer message delivery from a timeout.

## Operator and release gates

For aged `SENDING` rows, use the existing read-only monitoring. Investigate provider delivery evidence against message identifiers, candidate/exam context and authenticated events **without disclosing recipient addresses, message bodies, activation links or secrets**. A qualified operator must record an authorized disposition; never blanket-replay an ambiguous security or exam email. Verify signed webhook reconciliation and any provider retention/unknown-message policy separately.

Synthetic mocked transport tests cover both fresh and retried notifications: the provider-side fetch throws, `SENDING` is preserved, and another retry sweep makes no second provider call. Require exact-head lint, TypeScript, unit tests, Playwright E2E, backup/restore, production build and Moodle/console checks plus independent sanitized staging. CI does not prove actual Resend delivery and does not resolve Vercel, #99 scheduled runner, #225 missing-intent recovery, tenant RBAC, deployment/restore or the remaining release blockers.

Regulatory independence is unchanged: every Function **7.1–7.10** needs its own current CBTA task/competency table, source matrix and blueprint, direct IATA DGR 67th Edition 2026 Tier-A evidence, explicit SOURCE GAP/CONFLICT, verified FR, separately reviewed EN, and a named qualified reviewer/date before `APPROVED`. **Overall platform: NOT READY.**
