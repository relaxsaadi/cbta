import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-surface-sunken/60 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised shadow-sm ring-1 ring-black/[0.03] text-accent-9">
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <p className="font-display text-[13.5px] font-semibold text-text-primary">{title}</p>
      <p className="mt-1.5 max-w-[340px] text-[12.5px] leading-relaxed text-text-tertiary">{description}</p>
    </div>
  );
}
