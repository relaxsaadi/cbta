# Audit log immutability and exceptional recovery

## Normal operating invariant

`audit_logs` is append-only for ordinary application access. `lib/schema.sql` installs idempotent SQLite `BEFORE UPDATE` and `BEFORE DELETE` triggers that abort direct mutation or removal of an existing audit row. The application continues to add audit evidence through the canonical audit helpers; there is no application flag, route, environment variable, or hidden maintenance endpoint that disables these guards.

This is a **local storage-boundary control**, not a claim of protection from a fully privileged host/database administrator. An administrator who can replace the SQLite file or alter its schema can also remove a local trigger. Production assurance must therefore continue to rely on access control, verified backups/restores, the audit hash/export evidence already tracked separately, and any future off-host anchoring required by policy.

## Exceptional forensic repair / recovery

A legitimate repair must not mutate historical `audit_logs` rows in the live database. Use database replacement/recovery instead:

1. Put the E-EXAM service in maintenance mode and stop application writers.
2. Preserve the current database as read-only evidence before any repair. Record its path-independent artifact identifier, size and SHA-256 in the incident/recovery record; do not publish secrets or candidate data.
3. Select the verified backup/recovery artifact according to the backup/restore runbook. Work on an isolated copy, not the live file.
4. Run SQLite `PRAGMA integrity_check` and `PRAGMA foreign_key_check` on the isolated copy and reconcile it to the expected backup artifact/hash before accepting it.
5. Run the normal migration path against the isolated copy. `schema.sql` must install `audit_logs_no_update` and `audit_logs_no_delete` idempotently without rewriting historical audit rows.
6. Verify both trigger definitions are present in `sqlite_master`, then prove a test UPDATE and DELETE against an expendable restored/test copy are rejected while INSERT remains possible. Do not perform destructive proof attempts against production evidence.
7. Replace the operational database only through the reviewed restore/cutover procedure, preserving the displaced database as forensic evidence according to retention policy.
8. Re-run the production smoke/readiness checks and record the recovery decision, actor, date, source artifact hash and validation results in the incident/recovery evidence.

If the historical audit stream itself is suspected to be compromised, do not edit rows to make it look consistent. Escalate it as an integrity incident and reconcile from independently verified backup/off-host evidence. The open off-site disaster-recovery gate remains independent of this local trigger control.
