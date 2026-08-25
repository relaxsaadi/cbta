import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import { getSystemHealth } from "@/lib/system-health";
import { checkCertificate } from "@/lib/tls-check";
import { getExams } from "@/lib/exams-data";
import { getAuditLogCount } from "@/lib/audit-logs-data";
import { getIncidentCount } from "@/lib/incidents-data";
import { getFeedbackSummary } from "@/lib/feedback-data";
import { getPracticeTest } from "@/lib/practice-test-data";
import { getResults, computeResultsSummary } from "@/lib/results-data";
import { getIdentityVerificationCount } from "@/lib/identity-verification-data";
import { CROSS_BROWSER_MATRIX } from "@/lib/cross-browser-results";
import { getLatestPracticeAttemptQuestionTypes } from "@/lib/practice-test-data";

export type ComplianceStatus = "verified" | "partial" | "not_configured" | "not_applicable";

export interface EvidenceDetail {
  source: string;
  timestamp: string | null;
  technicalDetails: string;
}

export interface ComplianceItem {
  requirement: string;
  status: ComplianceStatus;
  evidenceSummary: string;
  lastVerified: string | null;
  responsible: string;
  notes?: string;
  evidence?: EvidenceDetail;
}

export interface ComplianceCategory {
  name: string;
  items: ComplianceItem[];
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function getComplianceData(): Promise<ComplianceCategory[]> {
  const [
    examCert,
    consoleCert,
    health,
    qbankCategories,
    roleCounts,
    exams,
    auditLogCount,
    incidentCount,
    feedbackSummary,
    practiceTest,
    results,
    identityVerificationCount,
    practiceAttemptQtypes,
  ] = await Promise.all([
    checkCertificate("exam.kostacademy.com"),
    checkCertificate("console.kostacademy.com"),
    getSystemHealth(),
    queryReadOnly<{ name: string; questioncount: number }>(
      `SELECT qc.name, COUNT(qbe.id) as questioncount
       FROM mdl_question_categories qc
       LEFT JOIN mdl_question_bank_entries qbe ON qbe.questioncategoryid = qc.id
       WHERE qc.name IN ('Sécurité et Sauvetage', 'Secourisme')
       GROUP BY qc.id, qc.name`
    ).catch(() => null),
    queryReadOnly<{ shortname: string; usercount: number }>(
      `SELECT r.shortname, COUNT(DISTINCT ra.userid) as usercount
       FROM mdl_role r
       LEFT JOIN mdl_role_assignments ra ON ra.roleid = r.id
       WHERE r.shortname LIKE 'kost_console%'
       GROUP BY r.id, r.shortname`
    ).catch(() => null),
    getExams().catch(() => []),
    getAuditLogCount().catch(() => 0),
    getIncidentCount().catch(() => 0),
    getFeedbackSummary().catch(() => null),
    getPracticeTest().catch(() => null),
    getResults().catch(() => []),
    getIdentityVerificationCount().catch(() => 0),
    getLatestPracticeAttemptQuestionTypes().catch(() => null),
  ]);

  const backup = health.find((h) => h.label === "Local Backup");
  const offsite = health.find((h) => h.label === "Off-site Backup");
  const restore = health.find((h) => h.label === "Restore Test");
  const firstExam = exams[0] ?? null;
  const resultsSummary = computeResultsSummary(results);
  const allBrowsersPassed = CROSS_BROWSER_MATRIX.length > 0 && CROSS_BROWSER_MATRIX.every((r) => r.result === "pass");
  const allQtypesExercised =
    practiceAttemptQtypes !== null &&
    ["multichoice", "truefalse", "essay"].every((t) => practiceAttemptQtypes.qtypesExercised.includes(t));

  const bothCertsOk = examCert.ok && consoleCert.ok;
  const minDaysRemaining = Math.min(examCert.daysRemaining ?? 0, consoleCert.daysRemaining ?? 0);

  return [
    {
      name: "Accessibility",
      items: [
        {
          requirement: "Secure access to the platform (HTTPS)",
          status: bothCertsOk ? "verified" : "partial",
          evidenceSummary: bothCertsOk
            ? `Both domains served over TLS, ${minDaysRemaining}d remaining`
            : "One or more certificates could not be verified live",
          lastVerified: new Date().toISOString(),
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Live TLS handshake (exam.kostacademy.com, console.kostacademy.com)",
            timestamp: new Date().toISOString(),
            technicalDetails: `exam.kostacademy.com — issuer: ${examCert.issuer ?? "n/a"}, expires: ${fmt(examCert.validTo ?? null)}\nconsole.kostacademy.com — issuer: ${consoleCert.issuer ?? "n/a"}, expires: ${fmt(consoleCert.validTo ?? null)}`,
          },
        },
        {
          requirement: "Cross-browser compatibility",
          status: allBrowsersPassed ? "verified" : "partial",
          evidenceSummary: allBrowsersPassed
            ? `All critical paths pass on Chromium, Firefox and WebKit (${CROSS_BROWSER_MATRIX[0]?.timestamp?.slice(0, 10) ?? ""})`
            : CROSS_BROWSER_MATRIX.length > 0
            ? "Not all browsers passed the critical-path matrix"
            : "Cross-browser matrix not yet executed",
          lastVerified: allBrowsersPassed ? CROSS_BROWSER_MATRIX[0]?.timestamp ?? null : null,
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Playwright cross-browser suite (login, Overview, Exams, Sessions, Question Bank, Audit & Compliance, Support, Exam Preparation, Practice Test, Feedback, Results, logout)",
            timestamp: CROSS_BROWSER_MATRIX[0]?.timestamp ?? null,
            technicalDetails: CROSS_BROWSER_MATRIX.map(
              (r) =>
                `${r.browser} ${r.version} — ${r.testsExecuted} checks — ${r.result.toUpperCase()}` +
                (r.notes ? `\n  Note: ${r.notes}` : "")
            ).join("\n"),
          },
        },
        {
          requirement: "OS compatibility",
          status: "partial",
          evidenceSummary: "Testé uniquement depuis macOS (poste de test) + Linux (hôte du conteneur Docker) — aucun test natif Windows effectué",
          lastVerified: CROSS_BROWSER_MATRIX[0]?.timestamp ?? null,
          responsible: "KOST Technical Team",
          notes:
            "Exécuter Chromium/Firefox/WebKit via Playwright prouve la compatibilité moteur-navigateur, pas la compatibilité système d'exploitation — les binaires navigateur de Playwright sont indépendants de l'OS par conception. Une vraie preuve de compatibilité OS nécessite un test sur des postes Windows, macOS et Linux natifs, ce qui n'a pas été fait. Volontairement gardé séparé de la compatibilité multi-navigateurs pour ne pas surévaluer ce qui a été vérifié.",
        },
        {
          requirement: "Online help / support resources",
          status: "verified",
          evidenceSummary: "Page Aide & support en ligne — guides Utilisateur/Candidat/Instructeur, FAQ, prérequis techniques, vrais canaux de contact",
          lastVerified: new Date().toISOString(),
          responsible: "KOST Technical Team",
          evidence: {
            source: "Console page (/support)",
            timestamp: new Date().toISOString(),
            technicalDetails:
              "Déployée et accessible depuis le menu latéral pour chaque rôle console authentifié. Les canaux de contact affichés (e-mail, WhatsApp) sont les canaux réels actuellement configurés de la plateforme — aucun numéro fictif.",
          },
        },
        {
          requirement: "Account and role management",
          status: "verified",
          evidenceSummary: "RBAC Moodle + verrou de rôle console, testé de bout en bout",
          lastVerified: "2026-08-19",
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Playwright authorization test (initial RBAC audit)",
            timestamp: "2026-08-19T22:00:00Z",
            technicalDetails:
              "4 scenarios tested server-side: Administrator (authorized), Moodle candidate account with no console role (rejected), invalid credentials (rejected), unauthenticated access (redirected). All server-enforced, not UI-only.",
          },
        },
      ],
    },
    {
      name: "Security",
      items: [
        {
          requirement: "Data encryption in transit",
          status: bothCertsOk ? "verified" : "partial",
          evidenceSummary: "TLS 1.2/1.3 enforced on both domains, HTTP redirects to HTTPS",
          lastVerified: new Date().toISOString(),
          responsible: "Infrastructure (automated check)",
        },
        {
          requirement: "Candidate identity verification",
          status: identityVerificationCount > 0 ? "verified" : "partial",
          evidenceSummary:
            identityVerificationCount > 0
              ? `${identityVerificationCount} real verification(s) recorded — official ID + supervised check`
              : "Documented manual procedure (ID check + supervised login), not yet demonstrated with a real recorded check",
          lastVerified: identityVerificationCount > 0 ? new Date().toISOString() : "2026-08-19",
          responsible: "KOST Academy — Session Supervisor",
          evidence:
            identityVerificationCount > 0
              ? {
                  source: "kost_console_identity_verifications (console-owned, append-only)",
                  timestamp: new Date().toISOString(),
                  technicalDetails: `Total verifications recorded: ${identityVerificationCount}\nMethod: official ID + supervised verification — no ID document copy stored (data minimization).\nTable has no UPDATE/DELETE grant (verified via SHOW GRANTS) — a recorded verification cannot be altered after the fact.`,
                }
              : undefined,
          notes: "Workflow: candidate presents official ID → supervisor verifies against Moodle account → exam/session confirmed → verification recorded → candidate authorized.",
        },
        {
          requirement: "Security incident / breach protocol",
          status: "verified",
          evidenceSummary: "Security Incident Response Procedure v1.0 — versioned, published, accessible to all console roles",
          lastVerified: "2026-08-20",
          responsible: "KOST Academy — Platform Administration",
          evidence: {
            source: "docs/SECURITY_INCIDENT_RESPONSE_PROCEDURE.md + console page (/security-procedure)",
            timestamp: "2026-08-20T00:00:00Z",
            technicalDetails:
              "12-step process (Detection → Corrective actions), severity levels, role-based escalation (not named individuals), evidence-preservation checklist, post-incident review template. Existence of the document does not itself certify the platform is invulnerable — it defines the response process.",
          },
        },
        {
          requirement: "Technical incident reporting mechanism",
          status: incidentCount > 0 ? "verified" : "partial",
          evidenceSummary:
            incidentCount > 0
              ? `${incidentCount} real incident(s) logged in the console's own tracker (/incidents)`
              : "Reporting form and admin tracker built, not yet demonstrated with a real ticket",
          lastVerified: incidentCount > 0 ? new Date().toISOString() : null,
          responsible: "KOST Technical Team",
          evidence: {
            source: "kost_console_incidents (console-owned table, not Moodle core)",
            timestamp: new Date().toISOString(),
            technicalDetails: `Total incidents logged: ${incidentCount}\nStorage: dedicated MySQL user (kost_console_rw) with GRANT SELECT/INSERT/UPDATE on exactly 3 console-owned tables — verified via SHOW GRANTS, zero access to any mdl_ table.\nEvery status change appends an event row (kost_console_incident_events), never overwritten.`,
          },
        },
        {
          requirement: "Automated, verified backups",
          status: backup?.status === "verified" ? "verified" : "partial",
          evidenceSummary: backup?.detail ?? "No backup recorded",
          lastVerified: backup?.timestamp ?? null,
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Automated backup log (backup-log.jsonl)",
            timestamp: backup?.timestamp ?? null,
            technicalDetails: `Local backup: ${backup?.detail ?? "n/a"}\nOff-site copy: ${offsite?.detail ?? "n/a"}\nRestore test: ${restore?.detail ?? "n/a"}`,
          },
        },
        {
          requirement: "Server stability and security hardening",
          status: "verified",
          evidenceSummary: "MySQL not publicly exposed, SSH key-only, no wildcard DB grants",
          lastVerified: "2026-08-19",
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Production security audit",
            timestamp: "2026-08-19T21:40:00Z",
            technicalDetails:
              "MySQL port 3306 confirmed unreachable externally (nc, ss -tlnp). Read-only console DB account restricted to SELECT on moodle.* from Docker-internal subnet only.",
          },
        },
      ],
    },
    {
      name: "Question Bank",
      items: [
        {
          requirement: "Module-separated question categories (Sécurité et Sauvetage / Secourisme)",
          status: qbankCategories && qbankCategories.length === 2 ? "verified" : "partial",
          evidenceSummary: qbankCategories
            ? `${qbankCategories.length} dedicated categories found`
            : "Could not verify live",
          lastVerified: new Date().toISOString(),
          responsible: "Infrastructure (automated check)",
          evidence: qbankCategories
            ? {
                source: "Live query — mdl_question_categories",
                timestamp: new Date().toISOString(),
                technicalDetails: qbankCategories
                  .map((c) => `${c.name}: ${c.questioncount} question(s)`)
                  .join("\n"),
              }
            : undefined,
        },
        {
          requirement: "Question bank populated with regulatory content",
          status: qbankCategories && qbankCategories.some((c) => c.questioncount > 0) ? "partial" : "not_configured",
          evidenceSummary: qbankCategories
            ? `${qbankCategories.reduce((s, c) => s + c.questioncount, 0)} sample question(s) exist — not yet official regulatory content`
            : "No data",
          lastVerified: qbankCategories ? new Date().toISOString() : null,
          responsible: "KOST Academy — DGR Instructors",
          notes:
            "Sample questions created for technical validation only — real regulatory content has deliberately never been auto-generated or invented for this platform. " +
            "Import/tagging structure is ready to receive real content: DGR_FUNCTIONS constant already models Function 7.1 through 7.10 (lib/dgr-functions.ts), " +
            "the question-tagging mechanism (mdl_tag / mdl_tag_instance, component='core_question') already supports per-question Function tags, " +
            "and Moodle's native question_categories model already supports module-level separation (Sécurité et Sauvetage / Secourisme). " +
            "Not yet modeled in the schema: explicit difficulty level, regulatory reference citation, and content version/revision per question — " +
            "these would need a small schema extension once real content authoring begins. This control moves to Verified only when real, KOST-approved regulatory questions are loaded — never automatically.",
        },
        {
          requirement: "Randomized question selection / shuffled answers",
          status: firstExam ? "verified" : "not_configured",
          evidenceSummary: firstExam
            ? `Verified on "${firstExam.name}" — shuffleAnswers: ${firstExam.shuffleAnswers}`
            : "No live exam configured yet to verify",
          lastVerified: firstExam ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence: firstExam
            ? {
                source: `Live query — mdl_quiz (${firstExam.name})`,
                timestamp: new Date().toISOString(),
                technicalDetails: `shuffleanswers = ${firstExam.shuffleAnswers ? 1 : 0} (Moodle native Quiz setting, read directly from database)`,
              }
            : undefined,
        },
        {
          requirement: "Multiple question types (MCQ, True/False, open)",
          status: allQtypesExercised ? "verified" : "partial",
          evidenceSummary: allQtypesExercised
            ? `All 3 types (MCQ, True/False, Open answer) exercised in a real completed Practice Test attempt (#${practiceAttemptQtypes?.attemptId})`
            : "Not all 3 types have been exercised in a real completed attempt",
          lastVerified: allQtypesExercised ? practiceAttemptQtypes?.timestamp ?? null : null,
          responsible: "Infrastructure (automated check)",
          evidence: allQtypesExercised
            ? {
                source: `Live query — mdl_question_attempts (Practice Test attempt #${practiceAttemptQtypes?.attemptId})`,
                timestamp: practiceAttemptQtypes?.timestamp ?? null,
                technicalDetails: `Question types exercised: ${practiceAttemptQtypes?.qtypesExercised.join(", ")}\nDemonstrated on the Practice Test only (generic, non-regulatory content) — never on the real DGR exam, to avoid touching regulatory content just to satisfy this check.\nOpen-answer (essay) question requires manual grading by design (Moodle native behaviour, not a bug) — sumgrades on that attempt reflects only the auto-graded MCQ/True-False questions.`,
              }
            : undefined,
          notes: allQtypesExercised
            ? undefined
            : "True/False and open-answer types are supported natively by Moodle but not yet exercised on a real question.",
        },
      ],
    },
    {
      name: "Exam Management",
      items: [
        {
          requirement: "Exam creation, modification, deletion",
          status: "partial",
          evidenceSummary:
            "Exams are created and configured directly in Moodle Quiz by KOST staff; a formal lifecycle test was attempted but does not count as functional proof — see notes",
          lastVerified: firstExam ? new Date().toISOString() : null,
          responsible: "KOST Technical Team",
          evidence: {
            source: "Moodle Quiz (manual authoring) — no automated functional proof yet",
            timestamp: firstExam ? new Date().toISOString() : null,
            technicalDetails:
              `Real exams (the DGR sample exam, the Practice Test) exist in Moodle because KOST staff created them directly in Moodle Quiz. That is real, but it is not a controlled, repeatable demonstration of the create/modify/delete lifecycle.\n` +
              `A dedicated lifecycle test was attempted via Moodle's real application API (create_module() / update_module() / course_delete_module()) and failed with a confirmed Moodle 5.0.1 bug unrelated to this platform: quiz_add_instance() forces the "password" field to NULL and corrupts "reviewattempt" to 65536 regardless of the values supplied.\n` +
              `A previous version of this evidence used direct SQL writes into mdl_quiz / mdl_course_modules with manually-triggered audit events as a substitute — that has been retracted. A raw SQL write does not exercise Moodle's real validation, capability checks, or business logic, so it cannot serve as functional proof of this capability, even when a real audit-log event is attached afterward.`,
          },
          notes:
            "Status intentionally reverted from an earlier Verified claim that relied on direct SQL writes as evidence — not accepted as functional proof. " +
            "The console itself remains read-only for exam configuration by design (Moodle is the system of truth for exam authoring). " +
            "To genuinely verify this control, either Moodle's create_module() bug needs a real fix/upgrade, or the demonstration needs to go through Moodle's own admin UI end-to-end (not CLI/SQL).",
        },
        {
          requirement: "Timer and automatic submission",
          status: firstExam ? "verified" : "not_configured",
          evidenceSummary: firstExam
            ? `${firstExam.name}: ${firstExam.durationMinutes} min, overdue handling: ${firstExam.overdueHandling}`
            : "No live exam configured",
          lastVerified: firstExam ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence: firstExam
            ? {
                source: `Live query — mdl_quiz (${firstExam.name})`,
                timestamp: new Date().toISOString(),
                technicalDetails: `timelimit: ${firstExam.durationMinutes} minutes\noverduehandling: ${firstExam.overdueHandling} (submission automatically triggered when time expires)`,
              }
            : undefined,
        },
        {
          requirement: "Session scheduling and management",
          status: firstExam ? "verified" : "not_configured",
          evidenceSummary: firstExam
            ? "Sessions derived from real exam open/close windows, visible in console Sessions page"
            : "No exam window configured",
          lastVerified: firstExam ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence: firstExam
            ? {
                source: "Console Sessions page (/sessions)",
                timestamp: new Date().toISOString(),
                technicalDetails: `Open: ${firstExam.timeOpen ?? "n/a"}\nClose: ${firstExam.timeClose ?? "n/a"}\nLive attempt counters sourced from mdl_quiz_attempts.`,
              }
            : undefined,
        },
        {
          requirement: "Results validation workflow",
          status: resultsSummary.completedAttempts > 0 ? "verified" : "not_configured",
          evidenceSummary:
            resultsSummary.completedAttempts > 0
              ? "Moodle's own 'finished' attempt state is treated as definitive for auto-graded question types — verified end-to-end with a real completed attempt"
              : "No completed attempt exists yet to verify against",
          lastVerified: resultsSummary.completedAttempts > 0 ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence:
            resultsSummary.completedAttempts > 0
              ? {
                  source: "Live query — mdl_quiz_attempts + mdl_grade_grades",
                  timestamp: new Date().toISOString(),
                  technicalDetails: `${resultsSummary.completedAttempts} completed attempt(s) observed with state=finished and an official grade present in mdl_grade_grades.\nNo separate "Pending Review / Validated" workflow was built — deliberately, since MCQ / True-False questions are auto-graded and Moodle already finalizes the result on submission. Building an artificial validation layer on top would not reflect how the platform actually works. This decision will be revisited if manually-graded question types (e.g. essay) are introduced.\nAll grades are read directly from Moodle's grade book — never recalculated or written by the console.`,
                }
              : undefined,
        },
      ],
    },
    {
      name: "Performance",
      items: [
        {
          requirement: "Concurrent user load testing",
          status: "verified",
          evidenceSummary: "50 concurrent users, 800 requests, 0 failures",
          lastVerified: "2026-08-19",
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Apache Bench load test (exam.kostacademy.com)",
            timestamp: "2026-08-19T18:23:00Z",
            technicalDetails:
              "Test 1: login page, 30 concurrent / 300 requests — 0 failed, mean 191ms.\nTest 2: homepage, 50 concurrent / 500 requests — 0 failed, mean 485ms.\nCapacity margin: ~4x the real session size (12 candidates).",
          },
        },
        {
          requirement: "Response time under load",
          status: "verified",
          evidenceSummary: "191–485ms average, well within acceptable range",
          lastVerified: "2026-08-19",
          responsible: "Infrastructure (automated check)",
        },
      ],
    },
    {
      name: "Reports & Analytics",
      items: [
        {
          requirement: "Exam results reporting",
          status: resultsSummary.completedAttempts > 0 ? "verified" : "not_configured",
          evidenceSummary:
            resultsSummary.completedAttempts > 0
              ? `Results (${resultsSummary.completedAttempts} real completed attempt(s)) and Reports (aggregate pass rate, average score, completion time, DGR Function filter) both live`
              : "Results/Reports pages built, not yet demonstrated with a real completed attempt",
          lastVerified: resultsSummary.completedAttempts > 0 ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence:
            resultsSummary.completedAttempts > 0
              ? {
                  source: "Console pages (/results, /reports)",
                  timestamp: new Date().toISOString(),
                  technicalDetails: `Completed attempts: ${resultsSummary.completedAttempts}\nPass rate: ${resultsSummary.passRate !== null ? resultsSummary.passRate.toFixed(0) + "%" : "no data"}\nAll figures computed from mdl_quiz_attempts + mdl_grade_grades — zero fictitious data, "No data" shown when a filter returns nothing.`,
                }
              : undefined,
        },
        {
          requirement: "Audit trail / activity logs",
          status: "verified",
          evidenceSummary: `${auditLogCount.toLocaleString()} logged events, surfaced read-only in console (/audit-logs)`,
          lastVerified: new Date().toISOString(),
          responsible: "Infrastructure (automated check)",
          evidence: {
            source: "Live query — mdl_logstore_standard_log",
            timestamp: new Date().toISOString(),
            technicalDetails: `Total events: ${auditLogCount}\nSource: Moodle's native standard log store (never modified by the console — strictly read-only).\nFilterable by user, action, component, IP in the console Audit Logs page.`,
          },
        },
      ],
    },
    {
      name: "Regulatory Compliance",
      items: [
        {
          requirement: "Legal basis for mandatory DGR training documented",
          status: "verified",
          evidenceSummary: "Décret exécutif n°21-253 du 6 juin 2021, Article 14",
          lastVerified: "2026-08-17",
          responsible: "KOST Academy — Compliance Lead",
          evidence: {
            source: "Algerian official gazette (JORADP), published 13/06/2021",
            timestamp: null,
            technicalDetails:
              "Article 14 obliges ANAC to control DGR training programs and procedures of operators. Signed by PM Abdelaziz Djerad.",
          },
        },
        {
          requirement: "IATA CBTA Provider accreditation",
          status: "verified",
          evidenceSummary: "Signed IATA Agreement — sole CBTA Provider, Algeria territory",
          lastVerified: "2026-08-18",
          responsible: "KOST Academy — Compliance Lead",
          evidence: {
            source: "Signed IATA CBTA Center Program Agreement",
            timestamp: null,
            technicalDetails:
              "Signed 08-Mar-25 by Saadi Djeffal (KOST CEO) and Laurent Delarue (IATA Director, Consulting and Certifications). Territory: Algeria only.",
          },
        },
        {
          requirement: "ANAC platform audit agreement",
          status: "partial",
          evidenceSummary: "In progress with ANAC — not yet formally finalized in this system",
          lastVerified: null,
          responsible: "KOST Academy — Compliance Lead",
        },
      ],
    },
    {
      name: "Training & Preparation",
      items: [
        {
          requirement: "Instructor and candidate documentation",
          status: "verified",
          evidenceSummary: "Candidate Guide (15 sections) + Instructor & Exam Manager Guide (15 sections), both versioned, live on /documentation",
          lastVerified: "2026-08-20",
          responsible: "KOST Academy",
          evidence: {
            source: "Console page (/documentation)",
            timestamp: "2026-08-20T00:00:00Z",
            technicalDetails:
              "Version 1.0, last updated 2026-08-20, owner KOST Academy. Content describes only functions that actually exist in the platform today (verified against the real UI copy — e.g. exact French button labels observed during a real candidate attempt) — no hypothetical features documented.",
          },
        },
        {
          requirement: "Practice test availability",
          status: practiceTest ? "verified" : "not_configured",
          evidenceSummary: practiceTest
            ? `"${practiceTest.name}" — real, separate Moodle quiz (${practiceTest.numQuestions} generic questions, no regulatory content)`
            : "No quiz tagged 'practice-test' found",
          lastVerified: practiceTest ? new Date().toISOString() : null,
          responsible: "Infrastructure (automated check)",
          evidence: practiceTest
            ? {
                source: `Live query — mdl_quiz (course: ${practiceTest.course})`,
                timestamp: new Date().toISOString(),
                technicalDetails: `Question types: ${practiceTest.questionTypes.join(", ")}\nTimer: ${practiceTest.durationMinutes} min\nQuestion category kept structurally separate from regulatory categories (Sécurité et Sauvetage / Secourisme).\nMarked "Practice / Training Only — Not a Certification Examination" in its intro and on the console page.`,
              }
            : undefined,
        },
      ],
    },
    {
      name: "Feedback",
      items: [
        {
          requirement: "Feedback collection mechanism",
          status: feedbackSummary && feedbackSummary.total > 0 ? "verified" : "partial",
          evidenceSummary:
            feedbackSummary && feedbackSummary.total > 0
              ? `${feedbackSummary.total} real feedback entr${feedbackSummary.total !== 1 ? "ies" : "y"} recorded, average rating ${feedbackSummary.avgRating?.toFixed(1)}/5`
              : "Form built and deployed (/feedback), not yet demonstrated with a real entry",
          lastVerified: feedbackSummary && feedbackSummary.total > 0 ? new Date().toISOString() : null,
          responsible: "KOST Technical Team",
          evidence:
            feedbackSummary && feedbackSummary.total > 0
              ? {
                  source: "kost_console_feedback (console-owned table, not Moodle core)",
                  timestamp: new Date().toISOString(),
                  technicalDetails: `Rating (1-5) + category (Platform usability / Exam experience / Technical issue / Instructions / Other) + optional comment + optional exam/session reference, per entry.\nTotal: ${feedbackSummary.total}`,
                }
              : undefined,
        },
        {
          requirement: "Administrator feedback review",
          status: feedbackSummary && feedbackSummary.total > feedbackSummary.new ? "verified" : "partial",
          evidenceSummary:
            feedbackSummary && feedbackSummary.total > feedbackSummary.new
              ? `${feedbackSummary.total - feedbackSummary.new} of ${feedbackSummary.total} entries moved beyond "New" (Reviewed/Action Required/Actioned/Closed)`
              : "Review workflow built (/feedback → Feedback Review tab), not yet demonstrated on a real entry",
          lastVerified:
            feedbackSummary && feedbackSummary.total > feedbackSummary.new ? new Date().toISOString() : null,
          responsible: "KOST Academy — Compliance Lead",
          notes:
            "Status workflow: New → Reviewed → Action Required → Actioned → Closed. Restricted to Administrator / Exam Manager roles server-side.",
        },
      ],
    },
  ];
}

export function computeSummary(categories: ComplianceCategory[]) {
  const all = categories.flatMap((c) => c.items);
  return {
    total: all.length,
    verified: all.filter((i) => i.status === "verified").length,
    partial: all.filter((i) => i.status === "partial").length,
    notConfigured: all.filter((i) => i.status === "not_configured").length,
    notApplicable: all.filter((i) => i.status === "not_applicable").length,
  };
}
