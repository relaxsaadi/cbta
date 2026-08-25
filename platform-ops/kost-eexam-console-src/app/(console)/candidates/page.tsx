import { Users } from "lucide-react";
import { getCandidates } from "@/lib/candidates-data";
import { isDemoModeActive } from "@/lib/demo-mode-server";
import { redactName, redactEmail } from "@/lib/demo-mode";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SCOPE_LABELS, SCOPE_BADGE } from "@/lib/data-scope";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function CandidatesPage() {
  const [candidates, demoMode] = await Promise.all([getCandidates(), isDemoModeActive()]);
  const displayCandidates = demoMode
    ? candidates.map((c) => ({ ...c, fullName: redactName(c.fullName), email: redactEmail(c.email) }))
    : candidates;

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <div>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">Candidats</h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          En lecture seule, depuis les inscriptions Moodle réelles — {candidates.length} candidat
          {candidates.length !== 1 ? "s" : ""} inscrit{candidates.length !== 1 ? "s" : ""} (hors comptes techniques).
          La gestion des comptes (création, mot de passe, inscription) reste dans Moodle.
        </p>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Aucun candidat inscrit"
            description="Les candidats apparaissent ici automatiquement dès qu'un compte Moodle est inscrit à un cours d'examen."
          />
        </Card>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-raised shadow-sm ring-1 ring-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-sunken/50">
                  {["Candidat", "Identifiant", "Cours / périmètre", "Tentatives commencées", "Tentatives terminées", "Dernière tentative"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {displayCandidates.map((c) => (
                  <tr key={c.userId} className="hover:bg-surface-sunken/40 transition-colors">
                    <td className="px-4 py-2.5 text-[12.5px] font-medium text-text-primary whitespace-nowrap">{c.fullName}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-tertiary font-mono whitespace-nowrap">{c.username}</td>
                    <td className="px-4 py-2.5 text-[12px]">
                      <div className="flex flex-wrap gap-1.5">
                        {c.courses.map((course) => (
                          <span key={course.id} className="inline-flex items-center gap-1">
                            <StatusBadge status={SCOPE_BADGE[course.scope]}>{SCOPE_LABELS[course.scope]}</StatusBadge>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{c.attemptsStarted}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-primary tabular-nums">{c.attemptsCompleted}</td>
                    <td className="px-4 py-2.5 text-[11.5px] text-text-tertiary tabular-nums whitespace-nowrap">{fmtDate(c.lastAttempt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11.5px] text-text-tertiary">
        Le badge de périmètre (Production / Démo / Entraînement) indique le cours dans lequel le
        candidat est inscrit — voir « Rôle de la console » sur la Vue d&apos;ensemble. Aucune
        donnée personnelle au-delà du nom, de l&apos;identifiant Moodle et de l&apos;e-mail n&apos;est
        affichée ici.
      </p>
    </div>
  );
}
