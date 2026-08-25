import Link from "next/link";
import { Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Help &amp; Support
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Guides, technical requirements, and real contact channels for KOST E-EXAM.
        </p>
      </div>

      {/* Guides grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader
            title="User Guide"
            description="General orientation for anyone using the KOST E-EXAM console."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Logging in with your Moodle console account</li>
            <li>• Understanding your assigned role (Administrator, Exam Manager, Instructor, Auditor)</li>
            <li>• Navigating Exams, Sessions, Question Bank and Audit Logs</li>
            <li>• Where data comes from — everything shown is read live from Moodle, nothing is simulated</li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Candidate Guide"
            description="What candidates need to know before sitting a real DGR exam."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Identity verification at the session (ID check, supervised login)</li>
            <li>• How the timer and auto-submission work</li>
            <li>• Navigating questions with the Previous / Next controls</li>
            <li>• See the <Link href="/exam-preparation" className="text-accent-9 underline underline-offset-2">Exam Preparation</Link> page for the full walkthrough</li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Instructor Guide"
            description="Responsibilities for staff supervising an exam session."
          />
          <ul className="flex flex-col gap-2 text-[13px] text-text-secondary">
            <li>• Preparing the session: verifying the exam window is open in Moodle Quiz</li>
            <li>• Candidate identity verification before granting access</li>
            <li>• Monitoring live attempts on the <Link href="/sessions" className="text-accent-9 underline underline-offset-2">Sessions</Link> page</li>
            <li>• Logging any incident via <Link href="/support/report" className="text-accent-9 underline underline-offset-2">Report Technical Issue</Link></li>
          </ul>
        </Card>

        <Card>
          <CardHeader title="FAQ" description="Common questions about the platform." />
          <div className="flex flex-col gap-3 text-[13px]">
            <div>
              <p className="font-medium text-text-primary">Is exam content stored in this console?</p>
              <p className="text-text-tertiary mt-0.5">No. The console reads exam and question data directly from Moodle, read-only. It never duplicates or stores regulatory content separately.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">What happens if the timer runs out?</p>
              <p className="text-text-tertiary mt-0.5">The attempt is submitted automatically (Moodle's autosubmit behaviour) — see <Link href="/exam-preparation" className="text-accent-9 underline underline-offset-2">Exam Preparation</Link>.</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Who can access the console?</p>
              <p className="text-text-tertiary mt-0.5">Only Moodle accounts holding a recognized console role. Regular candidate accounts are rejected — enforced server-side.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Technical requirements */}
      <Card>
        <CardHeader title="Technical Requirements" description="What's needed to run KOST E-EXAM reliably." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Browser" value="Current Chrome, Firefox, Edge, or Safari" />
          <Field label="Connection" value="Stable internet connection required for the full exam duration" />
          <Field label="Domains" value="exam.kostacademy.com (exam engine) and console.kostacademy.com (staff console) — both served over HTTPS" />
        </div>
      </Card>

      {/* Contact + report */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader title="Contact Technical Support" description="Real, currently configured contact channels — nothing else is published here." />
          <div className="flex flex-col gap-3">
            <ContactRow icon={Mail} label="Email" value="cbta@kostacademy.com" href="mailto:cbta@kostacademy.com" />
            <ContactRow icon={MessageCircle} label="WhatsApp" value="+213 542 30 53 83" href="https://wa.me/213542305383" />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Report Technical Issue"
            description="Log a real incident — stored in the console's own incident tracker, never in Moodle."
          />
          <Link
            href="/support/report"
            className="inline-flex items-center gap-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
          >
            <AlertTriangle size={14} />
            Open the incident form
          </Link>
          <p className="mt-3 text-[12px] text-text-tertiary">
            Administrators and exam managers can review all reported incidents on the{" "}
            <Link href="/incidents" className="text-accent-9 underline underline-offset-2">Technical Incidents</Link> page.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-1 text-[13px] text-text-primary leading-relaxed">{value}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-base px-3 py-2.5 hover:border-border-strong transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="text-[13px] font-medium text-text-primary truncate">{value}</p>
      </div>
    </a>
  );
}
