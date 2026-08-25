# Security Incident Response Procedure

**Version:** 1.0
**Effective date:** 2026-08-20
**Owner:** KOST Academy — Platform Administration

---

## Purpose

Defines how KOST E-EXAM (console.kostacademy.com, exam.kostacademy.com) detects,
contains, investigates, and recovers from a security incident, and how it is
reported afterward. This document does not certify that the platform is free
of vulnerabilities — it defines the response process for when one is found or
exploited.

## Scope

Applies to: the Next.js console, the Moodle exam engine, the underlying VPS
infrastructure (Docker, MySQL, Nginx), and any KOST E-EXAM data (candidate
accounts, exam configuration, results, console-owned tables). Excludes
KOST Group's unrelated corporate systems.

## Roles & Responsibilities

Roles, not individuals — assignment may change over time:

| Role | Responsibility during an incident |
|---|---|
| **Platform Administrator** | Declares the incident, owns the response, authorizes containment actions |
| **Exam Manager** | Assesses impact on active/scheduled exam sessions, decides on session suspension |
| **Technical Administrator** | Executes containment/recovery (credential revocation, service isolation, patching) |
| **Management** | Informed of High/Critical incidents, approves external communication if required |

## Severity Levels

| Level | Definition | Example |
|---|---|---|
| **Low** | No candidate data or exam integrity impact | Single failed login burst from one IP |
| **Medium** | Limited, contained impact | One compromised non-privileged account |
| **High** | Candidate data or exam integrity at risk | Unauthorized access to a console admin account |
| **Critical** | Active breach or exam integrity compromised | Evidence of unauthorized write to Moodle grade data |

## Process

1. **Detection** — via monitoring (Nginx/application logs, Moodle audit log,
   backup verification alerts), a report from staff, or a candidate/instructor
   flag.
2. **Initial assessment** — Platform Administrator confirms whether this is a
   real incident and assigns a preliminary severity level.
3. **Incident classification** — confirm scope (which systems/accounts/data),
   assign final severity, open an Incident ID.
4. **Containment** — limit ongoing impact: disable the affected account(s),
   restrict network access, or pause the affected service — the minimum
   action that stops the incident, not a blanket shutdown unless necessary.
5. **Evidence preservation** — before remediating, capture: Nginx access/error
   logs, application logs, Moodle `mdl_logstore_standard_log` events,
   `kost_console_incident_events` audit trail, timestamps, related user(s) or
   candidate(s), affected exam/session, and IP/device data where available.
   Copies are stored outside the affected system.
6. **Credential revocation** — rotate/revoke any credential plausibly exposed
   (Moodle account password, service tokens, DB passwords, SSH keys).
7. **Service isolation** — take the affected component off the shared Docker
   network or block it at Nginx if containment requires it, without
   unnecessarily disrupting unaffected services (`exam.kostacademy.com` stays
   up whenever the incident does not require its isolation).
8. **Investigation** — determine root cause using the preserved evidence.
9. **Recovery** — restore affected service(s) from a known-good state
   (verified backup if data was affected), reissue credentials, re-enable
   accounts once safe.
10. **Validation** — confirm the vulnerability/exposure is closed and the
    restored service behaves correctly (smoke test) before declaring recovery
    complete.
11. **Incident closure** — Platform Administrator formally closes the
    incident once validation passes.
12. **Corrective / preventive actions** — concrete follow-up (patch, config
    change, added monitoring) tracked to completion, not left open-ended.

## Evidence Preservation (detail)

Every incident record retains, where applicable:

- Nginx access/error logs covering the incident window
- Application (console) logs
- Moodle `mdl_logstore_standard_log` events for the affected user(s)/context
- Related console audit trail (`kost_console_incident_events`,
  `kost_console_identity_verifications` where relevant)
- Timestamps (UTC)
- Related user / candidate account(s)
- Affected exam / session
- IP address / device data, when captured by existing logs (no new tracking
  is introduced solely for this procedure)

## Escalation

Escalation path: **Technical Administrator → Platform Administrator →
Management**, following severity — Low/Medium stays with the Technical
Administrator and Platform Administrator; High/Critical escalates to
Management immediately upon classification. Roles are used deliberately
instead of named individuals so this document does not need updating when
staff change.

## Post-Incident Review

Every incident classified Medium or above produces a written record with:

- **Incident ID**
- **Summary**
- **Root cause**
- **Actions taken**
- **Recovery** (what was restored, from what state)
- **Preventive action** (what changes to reduce recurrence)
- **Closure date**

---

**Accessible to:** Administrator, Exam Manager, Instructor, Auditor roles via
the console (`/security-procedure`). Versioned in this repository alongside
the application source.
