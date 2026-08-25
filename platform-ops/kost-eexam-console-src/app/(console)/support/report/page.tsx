import { Card, CardHeader } from "@/components/ui/Card";
import { IncidentForm } from "../IncidentForm";

export const dynamic = "force-dynamic";

export default function ReportIncidentPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Signaler un incident technique
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Journalisé dans le suivi d&apos;incidents propre à la console KOST E-EXAM — jamais écrit dans Moodle.
        </p>
      </div>
      <Card>
        <CardHeader title="Détails de l'incident" />
        <IncidentForm />
      </Card>
    </div>
  );
}
