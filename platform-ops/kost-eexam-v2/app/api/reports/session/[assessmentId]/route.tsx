import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { getAssessment, getSessionReport } from "@/lib/assessments";
import { getGroup } from "@/lib/groups";
import { functionLabel } from "@/lib/questions";
import { audit } from "@/lib/audit";
import { SessionReportDocument } from "@/lib/pdf/SessionReportDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Rapport global de session/examen PDF (addendum §5-6). Document
// responsable/admin/auditeur — jamais candidat (statistiques agrégées sur
// tout le groupe, hors périmètre self-scope d'un candidat).
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
    return new Response("Rapport introuvable.", { status: 404 });
  }
  const group = getGroup(assessment.group_id);
  const { rows, stats } = getSessionReport(assessmentIdNum);

  const meta: DocumentMeta = {
    docTitle: `Rapport global de session — ${assessment.name}`,
    docId: `KOST-EEXAM-RG-${assessmentIdNum}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: new Date().toLocaleString("fr-FR"),
    company: group?.company_name,
    groupOrSession: group?.name,
    function: functionLabel(assessment.function_code),
    assessmentId: assessmentIdNum,
  };

  const buffer = await renderToBuffer(
    <SessionReportDocument
      rows={rows}
      stats={stats}
      assessmentName={assessment.name}
      passThresholdPct={assessment.pass_threshold_pct}
      durationMinutes={assessment.duration_minutes}
      meta={meta}
    />
  );

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_session_pdf_download",
    targetType: "assessment",
    targetId: assessmentIdNum,
    metadata: { candidateCount: rows.length },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-global-${assessmentIdNum}.pdf"`,
    },
  });
}
