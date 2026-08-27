import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { Card, CardHeader } from "@/components/ui/Card";
import { GuideSteps } from "./GuideSteps";

// Rendu écran d'un Guide (lib/guides.ts) — même source que le PDF
// téléchargeable (lib/pdf/GuideDocument.tsx), jamais un contenu ressaisi
// séparément.
export function GuideContent({ guide }: { guide: Guide }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">{guide.title}</h1>
          <p className="mt-1 text-[13px] text-text-tertiary">{guide.intro}</p>
        </div>
        <a
          href={`/api/reports/guide/${guide.slug}`}
          className="shrink-0 rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10"
        >
          Télécharger PDF
        </a>
      </div>

      {guide.sections.map((section) => (
        <Card key={section.heading}>
          <CardHeader title={section.heading} />
          <div className="flex flex-col gap-3">
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="text-[13.5px] leading-relaxed text-text-secondary">{p}</p>
            ))}
            {section.steps && <GuideSteps steps={section.steps} />}
          </div>
        </Card>
      ))}

      {guide.slug !== "session" && guide.slug !== "candidat" && (
        <Link href="/guide/session" className="text-[12.5px] font-medium text-accent-9 hover:underline">
          Voir aussi le guide de session →
        </Link>
      )}
    </div>
  );
}
