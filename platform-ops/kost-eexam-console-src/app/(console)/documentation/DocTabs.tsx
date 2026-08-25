"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DocTabs({ candidate, instructor }: { candidate: ReactNode; instructor: ReactNode }) {
  const [tab, setTab] = useState<"candidate" | "instructor">("candidate");
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 border-b border-border-subtle">
        <TabButton active={tab === "candidate"} onClick={() => setTab("candidate")}>
          Candidate Guide
        </TabButton>
        <TabButton active={tab === "instructor"} onClick={() => setTab("instructor")}>
          Instructor &amp; Exam Manager Guide
        </TabButton>
      </div>
      {tab === "candidate" ? candidate : instructor}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
        active ? "border-accent-9 text-text-primary" : "border-transparent text-text-tertiary hover:text-text-secondary"
      )}
    >
      {children}
    </button>
  );
}
