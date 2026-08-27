import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { getAssessment, getSessionReport } from "@/lib/assessments";
import { getGroup } from "@/lib/groups";
import { functionLabel } from "@/lib/questions";
import { audit } from "@/lib/audit";
import { ResultsListDocument } from "@/lib/pdf/ResultsListDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Liste officielle des résultats PDF (addendum §8) — document réservé
// responsable/admin/auditeur, jamais candidat (liste nominative complète
// du groupe, hors périmètre self-scope d'un candidat). Le pendant CSV de
// ce même document (même filtre assessmentId) est déjà couvert par
// /api/results/export?assessmentId=<id> (addendum §7) — mêmes données
// authoritatives, pas un second chemin de calcul.
export async function GET(request: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  if (!["pedagogical_manager", "administrator", "auditor"].includes(session.role)) {
    return new Response("Rôle non autorisé.", { status: 403 });
  }
  const { assessmentId } = await params;
  const assessmentIdNum = Number(assessmentId);

  const assessment = getAssessment(assessmentIdNum);
  if (!assessment || !hasAssessmentAccess({ userId: session.userId, role: session.role }, assessmentIdNum)) {
    return new Response("Liste introuvable.", { status: 404 });
  }
  const group = getGroup(assessment.group_id);
  const { rows } = getSessionReport(assessmentIdNum);

  const meta: DocumentMeta = {
    docTitle: `Liste officielle des résultats — ${assessment.name}`,
    docId: `KOST-EEXAM-LR-${assessmentIdNum}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: new Date().toLocaleString("fr-FR"),
    company: group?.company_name,
    groupOrSession: group?.name,
    function: functionLabel(assessment.function_code),
    assessmentId: assessmentIdNum,
  };

  const buffer = await renderToBuffer(
    <ResultsListDocument rows={rows} assessmentName={assessment.name} passThresholdPct={assessment.pass_threshold_pct} meta={meta} />
  );

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_results_list_pdf_download",
    targetType: "assessment",
    targetId: assessmentIdNum,
    metadata: { candidateCount: rows.length },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="liste-resultats-${assessmentIdNum}.pdf"`,
    },
  });
}
