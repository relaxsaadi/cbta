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
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ROLE_LABEL: Record<string, string> = {
  administrator: "Administrateur",
  exam_manager: "Responsable d'examen",
  instructor: "Instructeur",
  auditor: "Auditeur",
};

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
          Vérification d&apos;identité des candidats
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Enregistrement réel et minimal de la procédure de vérification effectivement utilisée avant un
          examen — pièce d&apos;identité officielle + contrôle supervisé, aucune biométrie, aucune copie de
          document conservée.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        {canRecord ? (
          <Card>
            <CardHeader title="Enregistrer une vérification" description="Visible uniquement pour les rôles Administrateur / Responsable d'examen / Instructeur." />
            <VerificationForm />
          </Card>
        ) : (
          <Card>
            <CardHeader title="Enregistrer une vérification" />
            <p className="text-[12.5px] text-text-tertiary">
              Votre rôle ({ROLE_LABEL[session.role ?? ""] ?? "inconnu"}) n&apos;est pas autorisé à enregistrer des vérifications d&apos;identité.
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {verifications.length === 0 ? (
            <Card>
              <EmptyState
                icon={ShieldCheck}
                title="Aucune vérification enregistrée"
                description="Dès qu'un superviseur enregistre un vrai contrôle avant une session, il apparaît ici — de façon permanente, cette table n'ayant aucun accès de modification ou de suppression."
              />
            </Card>
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-sunken/50">
                      {["Candidat", "Examen", "Session", "Vérifié par", "Méthode", "Horodatage"].map((h) => (
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
                        <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary">Pièce d&apos;identité officielle + supervisée</td>
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
