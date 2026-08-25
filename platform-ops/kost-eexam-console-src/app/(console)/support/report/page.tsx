import { Card, CardHeader } from "@/components/ui/Card";
import { IncidentForm } from "../IncidentForm";

export const dynamic = "force-dynamic";

export default function ReportIncidentPage() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Report Technical Issue
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Logged in the KOST E-EXAM console's own incident tracker — never written to Moodle.
        </p>
      </div>
      <Card>
        <CardHeader title="Incident details" />
        <IncidentForm />
      </Card>
    </div>
  );
}
