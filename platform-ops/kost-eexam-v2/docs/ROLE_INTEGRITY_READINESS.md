# E-EXAM V2 — Role integrity readiness inventory

This check exists for the RBAC/data-integrity invariant tracked in GitHub #245: every console identity must resolve to exactly one canonical role (`candidate`, `pedagogical_manager`, `administrator`, or `auditor`).

## Run

From `platform-ops/kost-eexam-v2` against the database being evaluated:

```bash
pnpm role-integrity:check
```

The command is **read-only**. It never deletes a `user_roles` row, never invents which role should survive, and never changes a user/session.

## Output contract

The command prints JSON with:

- `ok`: `true` only when no role-cardinality anomaly exists;
- `anomaly_count`;
- `anomalies[]`, containing only `user_id`, anomaly `category`, `role_count`, and `role_codes`.

It deliberately does **not** select or print username, email, phone, password hashes, MFA material, session tokens, or other account PII/credentials.

Categories:

- `missing_role`: zero persisted roles;
- `multiple_roles`: more than one persisted role;
- `noncanonical_role`: exactly one persisted role exists but it is not one of the four console roles accepted by the application.

The command exits non-zero when anomalies are present so it can be used as a pre-production/readiness gate.

## Remediation rule

An anomaly is evidence, not permission to auto-repair. Preserve the contradictory rows, identify the authoritative role from independent operational evidence, document that decision, and only then perform an explicit remediation. Do not silently pick the first/lowest role and do not delete contradictory rows as part of this check.

A future persisted `UNIQUE(user_id)`-style enforcement must be introduced only after this inventory has demonstrated that historical contradictions are understood/remediated. Migration/startup must fail safely if contradictions remain; it must never destructively choose a surviving role.

## Production readiness

Before a production GO, run this command against the exact database snapshot/candidate environment used for readiness. `ok: false` is a technical NO-GO until the contradictory identities are explicitly reconciled. This check is independent from the DGR regulatory question-bank gates for Functions 7.1–7.10 and does not approve or promote any regulatory content.
