export function ReportPrintHeader({ title, generatedAt }: { title: string; generatedAt: string }) {
  return (
    <div className="hidden print:block mb-6 border-b border-border-default pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        Généré depuis KOST E-EXAM
      </p>
      <h1 className="mt-1 font-display text-[20px] font-semibold text-text-primary">{title}</h1>
      <p className="mt-1 text-[11px] text-text-tertiary">
        Préparé pour l&apos;audit de la plateforme ANAC — Version 1.0 — Généré le {generatedAt}
      </p>
    </div>
  );
}
