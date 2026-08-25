import { Card } from "@/components/ui/Card";
import { DocTabs } from "./DocTabs";

export const dynamic = "force-dynamic";

const DOC_META = { version: "1.0", lastUpdated: "2026-08-20", owner: "KOST Academy" };

function VersionBar() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-border-subtle bg-surface-sunken/50 px-3.5 py-2.5 text-[11.5px] text-text-tertiary">
      <span>Version <strong className="text-text-secondary">{DOC_META.version}</strong></span>
      <span>Last updated <strong className="text-text-secondary">{DOC_META.lastUpdated}</strong></span>
      <span>Owner <strong className="text-text-secondary">{DOC_META.owner}</strong></span>
    </div>
  );
}

const CANDIDATE_SECTIONS = [
  { title: "1. Accessing KOST E-EXAM", body: "Exams are taken on Moodle at exam.kostacademy.com, served over HTTPS. You do not use the staff console (console.kostacademy.com) — that is a separate, administrator-only tool." },
  { title: "2. Login", body: "Log in with the Moodle account created for you (username + password). There is no separate KOST E-EXAM account — identity is managed entirely by Moodle." },
  { title: "3. Before examination", body: "Arrive at your session on time. An instructor will confirm your session and exam before you are granted access." },
  { title: "4. Identity verification procedure", body: "A supervisor verifies your identity against an official ID document and your Moodle account before you start. This check is logged (candidate, exam, verifier, timestamp) — no copy of your ID is kept." },
  { title: "5. Technical requirements", body: "A current browser (Chrome, Firefox, Edge, or Safari) and a stable internet connection for the full exam duration." },
  { title: "6. Starting the examination", body: "Open the exam from your Moodle dashboard and select \"Effectuer le test\" / \"Attempt quiz now\". A confirmation dialog reminds you of the time limit before you start." },
  { title: "7. Navigation", body: "Questions are shown one per page. Use \"Page précédente\" / \"Page suivante\" (Previous page / Next page) to move between them." },
  { title: "8. Answering questions", body: "Select your answer by clicking the radio button next to it (multiple-choice) or True/False. Your selection is saved as you move between pages." },
  { title: "9. Flagging questions", body: "Use \"Marquer la question\" (Flag question) to mark a question for review before final submission." },
  { title: "10. Timer", body: "A countdown ( \"Temps restant\" ) is visible throughout the attempt. It cannot be paused once started." },
  { title: "11. Automatic submission", body: "If the timer reaches zero, your attempt is submitted automatically — you do not lose your answers." },
  { title: "12. Manual submission", body: "When finished, select \"Terminer le test...\" to review your answer summary, then \"Tout envoyer et terminer\" (Submit all and finish) to confirm." },
  { title: "13. Technical incident reporting", body: "If something goes wrong, notify your instructor immediately — they can log it in the console's incident tracker on your behalf." },
  { title: "14. Finishing the examination", body: "Once submitted, your attempt is final. Your official result is recorded directly in Moodle's grade book." },
  { title: "15. Support", body: "For general questions outside an active exam session, instructors can direct you to the console's Help & Support page (email / WhatsApp)." },
];

const INSTRUCTOR_SECTIONS = [
  { title: "1. Preparing an exam", body: "Exams are configured as Moodle Quiz activities. Confirm the quiz exists and its settings are correct before a session — the Exams page in the console mirrors the live Moodle configuration." },
  { title: "2. Candidate enrolment", body: "Candidates are enrolled in the relevant Moodle course (manual enrolment, Student role) ahead of their session." },
  { title: "3. Exam settings", body: "Duration, number of questions, and attempts allowed are all configured on the Quiz in Moodle and displayed read-only on the Exams page." },
  { title: "4. Timer", body: "Verify the configured time limit and overdue handling (auto-submit) on the Exams page before the session starts." },
  { title: "5. Passing grade", body: "The passing threshold is set on the Quiz's grade item in Moodle and shown on both the Exams and Results pages — never edited from the console." },
  { title: "6. Randomization", body: "Answer shuffling (shuffleanswers) is a real Moodle Quiz setting, visible on the Exams page for each exam." },
  { title: "7. Opening / closing windows", body: "The exam's open/close window (or lack of one) is shown on the Exams and Sessions pages, sourced live from Moodle." },
  { title: "8. Preparing an exam session", body: "Use the Sessions page to confirm the exam's window is open and monitor live attempt counts before candidates begin." },
  { title: "9. Candidate identity verification", body: "Record each candidate's identity check on the Identity Verification page before authorizing exam access." },
  { title: "10. Monitoring attempts", body: "The Sessions page shows real, live counts: started, in progress, completed — sourced from Moodle quiz attempts." },
  { title: "11. Technical incidents", body: "Log any technical issue on Report Technical Issue; review and update status on the Technical Incidents page." },
  { title: "12. Results", body: "Official results (score, grade, pass/fail, timing) are available on the Results page immediately after a candidate submits." },
  { title: "13. Audit logs", body: "All system activity is available read-only on the Audit Logs page, sourced from Moodle's native log store." },
  { title: "14. Feedback review", body: "Review and action candidate/staff feedback on the Feedback → Feedback Review tab (Administrator / Exam Manager only)." },
  { title: "15. Escalation procedure", body: "For a security incident or suspected breach, follow the Security Incident Response Procedure and notify the Platform Administrator immediately." },
];

export default function DocumentationPage() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Documentation</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Versioned guides describing exactly what this platform does today — nothing hypothetical.
        </p>
      </div>

      <DocTabs
        candidate={
          <div className="flex flex-col gap-4">
            <VersionBar />
            {CANDIDATE_SECTIONS.map((s) => (
              <Card key={s.title} padding="sm">
                <p className="font-display text-[13.5px] font-semibold text-text-primary">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
              </Card>
            ))}
          </div>
        }
        instructor={
          <div className="flex flex-col gap-4">
            <VersionBar />
            {INSTRUCTOR_SECTIONS.map((s) => (
              <Card key={s.title} padding="sm">
                <p className="font-display text-[13.5px] font-semibold text-text-primary">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
              </Card>
            ))}
          </div>
        }
      />
    </div>
  );
}
