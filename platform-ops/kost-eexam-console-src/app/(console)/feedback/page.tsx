import { getFeedback, getFeedbackSummary } from "@/lib/feedback-data";
import { getSession } from "@/lib/session";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackReviewTable } from "./FeedbackReviewTable";
import { FeedbackTabs } from "./FeedbackTabs";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const session = await getSession();
  const canReview = session.role === "administrator" || session.role === "exam_manager";
  const [entries, summary, demoMode] = await Promise.all([getFeedback(), getFeedbackSummary(), isDemoModeActive()]);
  const displayEntries = demoMode ? entries.map((e) => ({ ...e, reporterFullName: redactName(e.reporterFullName) })) : entries;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Feedback</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Real feedback entries, stored in the console's own table — reviewable and status-tracked.
        </p>
      </div>

      <FeedbackTabs
        canReview={canReview}
        giveFeedback={
          <Card className="max-w-[640px]">
            <CardHeader title="Give Feedback" description="About the platform, an exam, or a session." />
            <FeedbackForm />
          </Card>
        }
        review={
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised px-5 py-3.5 shadow-sm">
              <span className="text-[12.5px] font-medium text-text-secondary mr-1">{summary.total} entries</span>
              <StatusBadge status="critical">{summary.new} New</StatusBadge>
              <StatusBadge status="warning">{summary.reviewed} Reviewed</StatusBadge>
              <StatusBadge status="warning">{summary.actionRequired} Action Required</StatusBadge>
              <StatusBadge status="verified">{summary.actioned} Actioned</StatusBadge>
              <StatusBadge status="neutral">{summary.closed} Closed</StatusBadge>
              {summary.avgRating !== null && (
                <span className="ml-auto text-[12px] text-text-tertiary">
                  Average rating: {summary.avgRating.toFixed(1)} / 5
                </span>
              )}
            </div>
            <FeedbackReviewTable entries={displayEntries} canEdit={canReview} />
          </div>
        }
      />
    </div>
  );
}
