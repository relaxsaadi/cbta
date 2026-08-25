import { Construction } from "lucide-react";

export function PhasePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      <div className="flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-surface-raised py-16 text-center shadow-sm">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft-bg text-accent-9 ring-1 ring-accent-soft-border">
          <Construction size={18} strokeWidth={1.75} />
        </div>
        <p className="font-display text-[14.5px] font-semibold text-text-primary">
          {title} — Coming in {phase}
        </p>
        <p className="mt-2 max-w-[380px] text-[13px] leading-relaxed text-text-tertiary">
          Part of the KOST E-EXAM foundation, not yet built. No placeholder data is shown here —
          only verified information is ever displayed on this platform.
        </p>
      </div>
    </div>
  );
}
