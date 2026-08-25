// Contenu structuré du document versionné docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md
// — dupliqué ici en constante TS pour un rendu in-app fiable sans dépendre
// d'un parseur Markdown ni de la présence du fichier au runtime Docker.
// Toute modification doit être répercutée dans les deux fichiers.
export const SECURITY_PROCEDURE_META = {
  version: "1.0",
  effectiveDate: "2026-08-20",
  owner: "KOST Academy — Platform Administration",
};

export const SECURITY_PROCEDURE_SECTIONS: { title: string; body: string }[] = [
  {
    title: "Purpose",
    body: "Defines how KOST E-EXAM detects, contains, investigates, and recovers from a security incident, and how it is reported afterward. This document does not certify the platform is free of vulnerabilities — it defines the response process for when one is found or exploited.",
  },
  {
    title: "Scope",
    body: "Applies to the Next.js console, the Moodle exam engine, the underlying VPS infrastructure (Docker, MySQL, Nginx), and any KOST E-EXAM data. Excludes KOST Group's unrelated corporate systems.",
  },
  {
    title: "Roles & Responsibilities",
    body: "Platform Administrator declares the incident and owns the response. Exam Manager assesses impact on exam sessions. Technical Administrator executes containment/recovery. Management is informed of High/Critical incidents. Roles, not named individuals.",
  },
  {
    title: "Severity Levels",
    body: "Low: no candidate data or exam integrity impact. Medium: limited, contained impact. High: candidate data or exam integrity at risk. Critical: active breach or exam integrity compromised.",
  },
  {
    title: "1. Detection",
    body: "Via monitoring (Nginx/application logs, Moodle audit log, backup verification alerts), a staff report, or a candidate/instructor flag.",
  },
  {
    title: "2. Initial Assessment",
    body: "Platform Administrator confirms whether this is a real incident and assigns a preliminary severity level.",
  },
  {
    title: "3. Incident Classification",
    body: "Confirm scope (systems/accounts/data affected), assign final severity, open an Incident ID.",
  },
  {
    title: "4. Containment",
    body: "Limit ongoing impact with the minimum action that stops the incident — disable the affected account(s), restrict network access, or pause the affected service — not a blanket shutdown unless necessary.",
  },
  {
    title: "5. Evidence Preservation",
    body: "Before remediating: capture Nginx logs, application logs, Moodle audit events, console incident/verification audit trails, timestamps, related user(s), affected exam/session, and IP/device data where available. Stored outside the affected system.",
  },
  {
    title: "6. Account / Credential Revocation",
    body: "Rotate or revoke any credential plausibly exposed — Moodle account password, service tokens, DB passwords, SSH keys.",
  },
  {
    title: "7. Service Isolation",
    body: "Take the affected component off the shared Docker network or block it at Nginx if containment requires it, without unnecessarily disrupting unaffected services.",
  },
  {
    title: "8. Investigation",
    body: "Determine root cause using the preserved evidence.",
  },
  {
    title: "9. Recovery",
    body: "Restore affected service(s) from a known-good state (verified backup if data was affected), reissue credentials, re-enable accounts once safe.",
  },
  {
    title: "10. Validation",
    body: "Confirm the vulnerability/exposure is closed and the restored service behaves correctly (smoke test) before declaring recovery complete.",
  },
  {
    title: "11. Incident Closure",
    body: "Platform Administrator formally closes the incident once validation passes.",
  },
  {
    title: "12. Corrective / Preventive Actions",
    body: "Concrete follow-up (patch, config change, added monitoring) tracked to completion, not left open-ended.",
  },
  {
    title: "Escalation",
    body: "Technical Administrator → Platform Administrator → Management, by severity. High/Critical escalates to Management immediately upon classification.",
  },
  {
    title: "Post-Incident Review",
    body: "Every incident Medium or above produces a record with: Incident ID, Summary, Root cause, Actions taken, Recovery, Preventive action, Closure date.",
  },
];
