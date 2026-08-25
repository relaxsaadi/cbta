"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeedbackTabs({
  giveFeedback,
  review,
  canReview,
}: {
  giveFeedback: ReactNode;
  review: ReactNode;
  canReview: boolean;
}) {
  const [tab, setTab] = useState<"give" | "review">("give");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 border-b border-border-subtle">
        <TabButton active={tab === "give"} onClick={() => setTab("give")}>
          Give Feedback
        </TabButton>
        {canReview && (
          <TabButton active={tab === "review"} onClick={() => setTab("review")}>
            Feedback Review
          </TabButton>
        )}
      </div>
      {tab === "give" ? giveFeedback : review}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "border-accent-9 text-text-primary"
          : "border-transparent text-text-tertiary hover:text-text-secondary"
      )}
    >
      {children}
    </button>
  );
}
