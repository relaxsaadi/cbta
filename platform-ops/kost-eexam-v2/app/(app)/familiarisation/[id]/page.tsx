import { notFound } from "next/navigation";
import { guardPage } from "@/lib/rbac";
import { getFamiliarizationSession, listAttendance, getCandidateFamiliarizationHistory, listFamiliarizationEvidence } from "@/lib/familiarization";
import { hasFamiliarizationSessionAccess } from "@/lib/tenant-scope";
import { functionLabel } from "@/lib/questions";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { markAttendanceAction } from "../actions";
import { AddEvidenceForm } from "./AddEvidenceForm";

const AUDIENCE_LABELS: Record<string, string> = {
  candidats: "Candidats",
  personnel: "Personnel",
  mixte: "Mixte (personnel + candidats)",
};

export default async function FamiliarizationSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await guardPage("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const sessionId = Number(id);
  const fs = getFamiliarizationSession(sessionId);
  // Voir lib/tenant-scope.ts : introuvable, pas "refusé", pour une session
  // hors périmètre.
  if (!fs || !hasFamiliarizationSessionAccess(session, sessionId)) notFound();
  const canWrite = session.role !== "auditor";
  const attendance = listAttendance(sessionId);
  const presentCount = attendance.filter((a) => a.present).length;
  const evidence = listFamiliarizationEvidence(sessionId);

  async function toggleAttendance(formData: FormData) {
    "use server";
    await markAttendanceAction(sessionId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-text-primary">
            Familiarisation — {fs.company_name} — {fs.group_name}
          </h1>
          <p className="mt-1 text-[13px] text-text-tertiary">
            {functionLabel(fs.function_code)} — {new Date(fs.held_at).toLocaleString("fr-FR")}
            {fs.ended_at ? ` → ${new Date(fs.ended_at).toLocaleTimeString("fr-FR")}` : ""}
            {fs.location ? ` — ${fs.location}` : ""}
            {fs.audience ? ` — Public : ${AUDIENCE_LABELS[fs.audience] ?? fs.audience}` : ""}
          </p>
        </div>
        <a
          href={`/api/reports/attendance-sheet/${sessionId}`}
          className="shrink-0 rounded-md bg-accent-9 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-10"
        >
          Feuille de présence (PDF)
        </a>
      </div>

      {fs.notes && (
        <Card>
          <CardHeader title="Notes" />
          <p className="text-[13px] text-text-secondary">{fs.notes}</p>
        </Card>
      )}

      <Card>
        <CardHeader title={`Présence — ${presentCount} / ${attendance.length} présent(s)`} />
        <div className="flex flex-col gap-1.5">
          {attendance.map((a) => {
            const history = getCandidateFamiliarizationHistory(a.candidate_user_id).filter((h) => h.session_id !== sessionId);
            return (
              <div key={a.candidate_user_id} className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2">
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{a.full_name}</p>
                  <p className="text-[11.5px] text-text-tertiary">
                    {history.length === 0
                      ? "Aucune autre familiarisation dans l'historique"
                      : `${history.length} autre(s) familiarisation(s) — dernière le ${new Date(history[0]!.held_at).toLocaleDateString("fr-FR")} (${history[0]!.present ? "présent" : "absent"})`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.present ? "verified" : "neutral"}>{a.present ? "Présent" : "Absent"}</StatusBadge>
                  {canWrite && (
                    <form action={toggleAttendance}>
                      <input type="hidden" name="candidateUserId" value={a.candidate_user_id} />
                      <input type="hidden" name="present" value={a.present ? "false" : "true"} />
                      <button type="submit" className="rounded-md border border-border-default px-2.5 py-1 text-[11.5px] font-medium text-text-secondary hover:border-border-strong">
                        Marquer {a.present ? "absent" : "présent"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mission "CLOSE AUDITOR REMARKS" (2026-08-31) §20-21 — preuve/
          justificatif rattaché à la session, consultable par tout
          utilisateur autorisé (auditeur en lecture seule). Référence
          textuelle horodatée, jamais un fichier — voir
          lib/familiarization.ts pour la justification complète. */}
      <Card>
        <CardHeader title={`Preuves rattachées (${evidence.length})`} description="Référence/description de la preuve de familiarisation (ex. classement physique/numérique de la feuille de présence signée) — jamais un fichier hébergé publiquement." />
        {canWrite && <AddEvidenceForm sessionId={sessionId} />}
        {evidence.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {evidence.map((e) => (
              <div key={e.id} className="rounded-md border border-border-subtle px-3 py-2">
                <p className="text-[13px] text-text-primary">{e.description}</p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  Rattaché le {new Date(e.created_at).toLocaleString("fr-FR")}{e.recorded_by_name ? ` par ${e.recorded_by_name}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
