import Link from "next/link";
import {
  ShieldCheck,
  Monitor,
  Navigation,
  Timer,
  Flag,
  Send,
  AlertOctagon,
  LifeBuoy,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Before you start",
    body: "An instructor verifies your identity (ID document + attendance sheet) before granting access, consistent with in-person exam sessions. You will log in to a Moodle account created for you — the console itself is a staff tool, not the candidate exam interface.",
  },
  {
    icon: Monitor,
    title: "Technical requirements",
    body: "A current browser (Chrome, Firefox, Edge or Safari) and a stable internet connection for the full exam duration. The exam is served over HTTPS at exam.kostacademy.com.",
  },
  {
    icon: Navigation,
    title: "Exam navigation",
    body: "Questions are presented one at a time. Use the Previous / Next controls to move between questions — navigation mode is configured per exam in Moodle Quiz (free navigation on the current sample and practice configurations).",
  },
  {
    icon: Timer,
    title: "Timer",
    body: "Each exam has a fixed time limit, shown on screen and counting down. The current sample DGR exam is configured for 60 minutes; the Practice Test is configured for 10 minutes so you can see the same mechanism before a real exam.",
  },
  {
    icon: Flag,
    title: "Flagging questions",
    body: "Moodle Quiz supports flagging a question to revisit it later in the same attempt, using the flag icon on the question page.",
  },
  {
    icon: Send,
    title: "Submitting the examination",
    body: "You submit manually once you have answered as many questions as you intend to. A confirmation step summarizes any unanswered questions before final submission.",
  },
  {
    icon: AlertOctagon,
    title: "What happens when time expires",
    body: "If the timer reaches zero before you submit, the attempt is submitted automatically — this is Moodle's native \"autosubmit\" overdue handling, verified on the configured sample exam and Practice Test.",
  },
  {
    icon: LifeBuoy,
    title: "Troubleshooting",
    body: "If something goes wrong during a session, notify your instructor immediately. Technical issues are logged through the console's incident tracker — see Report Technical Issue.",
  },
];

export default function ExamPreparationPage() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Exam Preparation
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          What to expect before sitting a real DGR examination — describes this platform's actual
          behavior only, nothing hypothetical.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} padding="sm">
              <div className="flex gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-9">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-display text-[13.5px] font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{step.body}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          title="Try it yourself"
          description="The Practice Test lets you experience navigation, the timer, and submission with generic, non-regulatory questions."
        />
        <Link
          href="/practice-test"
          className="inline-flex w-fit items-center gap-2 rounded-md bg-accent-9 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-accent-10 transition-colors"
        >
          Go to Practice Test →
        </Link>
      </Card>
    </div>
  );
}
