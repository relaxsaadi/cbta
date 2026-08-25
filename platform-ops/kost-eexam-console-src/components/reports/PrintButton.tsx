"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print / Export PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:border-border-strong transition-colors"
    >
      <Printer size={14} />
      {label}
    </button>
  );
}
