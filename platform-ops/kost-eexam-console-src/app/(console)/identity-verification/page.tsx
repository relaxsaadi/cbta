import { ShieldCheck } from "lucide-react";
import { getIdentityVerifications } from "@/lib/identity-verification-data";
import { getSession } from "@/lib/session";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName } from "@/lib/demo-mode";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerificationForm } from "./VerificationForm";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function IdentityVerificationPage() {
  const [session, verifications, demoMode] = await Promise.all([
    getSession(),
    getIdentityVerifications(),
    isDemoModeActive(),
  ]);
  const canRecord = ["administrator", "exam_manager", "instructor"].includes(session.role ?? "");
  const displayVerifications = demoMode
    ? verifications.map((v) => ({ ...v, candidateFullName: redactName(v.candidateFullName), verifiedByFullName: redactName(v.verifiedByFullName) }))
    : verifications;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
          Candidate Identity Verification
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Real, minimal record of the actual verification procedure used before an exam — official
          ID + supervised check, no biometrics, no document copies stored.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        {canRecord ? (
          <Card>
            <CardHeader title="Record a verification" description="Only visible to Administrator / Exam Manager / Instructor roles." />
            <VerificationForm />
          </Card>
        ) : (
          <Card>
            <CardHeader title="Record a verification" />
            <p className="text-[12.5px] text-text-tertiary">
              Your role ({session.role ?? "unknown"}) is not authorized to record identity verifications.
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {verifications.length === 0 ? (
            <Card>
              <EmptyState
                icon={ShieldCheck}
                title="No verification recorded yet"
                description="Once a supervisor records a real check before a session, it appears here — permanently, since this table has no update or delete access."
              />
            </Card>
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-sunken/50">
                      {["Candidate", "Exam", "Session", "Verified by", "Method", "Timestamp"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {displayVerifications.map((v) => (
                      <tr key={v.id} className="hover:bg-surface-sunken/40 transition-colors">
                        <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary whitespace-nowrap">{v.candidateFullName}</td>
                        <td className="px-4 py-2.5 text-[12px] text-text-secondary max-w-[200px] truncate">{v.examName}</td>
                        <td className="px-4 py-2.5 text-[12px] text-text-tertiary">{v.sessionReference ?? "—"}</td>
                        <td className="px-4 py-2.5 text-[12px] text-text-secondary whitespace-nowrap">{v.verifiedByFullName}</td>
                        <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary">Official ID + supervised</td>
                        <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(v.verificationTimestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
