export function GuideSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3 rounded-md border border-border-subtle px-3.5 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft-bg text-[12px] font-semibold text-accent-11">{i + 1}</span>
          <span className="text-[13.5px] text-text-primary">{s}</span>
        </li>
      ))}
    </ol>
  );
}
