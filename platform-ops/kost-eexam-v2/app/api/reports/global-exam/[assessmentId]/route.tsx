import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { formatAlgeriaDateTime, formatAlgeriaDate } from "@/lib/timezone";
import { hasAssessmentAccess } from "@/lib/tenant-scope";
import { getAssessment, getSessionReport } from "@/lib/assessments";
import { getGroup } from "@/lib/groups";
import { functionLabel } from "@/lib/questions";
import { audit } from "@/lib/audit";
import { GlobalExamReportDocument } from "@/lib/pdf/GlobalExamReportDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Rapport global d'examen PDF — version SIMPLE (mission "URGENT AUDITOR
// FOLLOW-UP" 2026-08-31, Issue 1) : même périmètre d'accès EXACTEMENT que
// /api/reports/session/[assessmentId] (responsable/admin/auditeur, jamais
// candidat), même source de données (getSessionReport(), jamais dupliquée)
// — seule la PRÉSENTATION diffère (lib/pdf/GlobalExamReportDocument.tsx,
// volontairement simple : Candidat / Résultat / Mention RÉUSSITE-ÉCHEC).
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
  const { rows } = getSessionReport(assessmentIdNum);

  // Date de l'examen — la première tentative réellement démarrée si elle
  // existe (le déroulement réel), sinon la date de publication (l'examen
  // n'a pas encore été passé) — jamais la date de génération du PDF
  // elle-même, qui n'est pas "la date de l'examen".
  const earliestStart = rows
    .map((r) => r.started_at)
    .filter((d): d is string => d !== null)
    .sort()[0];
  const examDate = formatAlgeriaDate(earliestStart ?? assessment.published_at ?? assessment.created_at, { day: "2-digit", month: "2-digit", year: "numeric" });

  const meta: DocumentMeta = {
    docTitle: `Rapport global d'examen — ${assessment.name}`,
    docId: `KOST-EEXAM-RGE-${assessmentIdNum}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: formatAlgeriaDateTime(new Date(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    company: group?.company_name,
    groupOrSession: group?.name,
    function: functionLabel(assessment.function_code),
    assessmentId: assessmentIdNum,
  };

  const buffer = await renderToBuffer(
    <GlobalExamReportDocument rows={rows} assessmentName={assessment.name} examDate={examDate} meta={meta} />
  );

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_global_exam_pdf_download",
    targetType: "assessment",
    targetId: assessmentIdNum,
    metadata: { candidateCount: rows.length },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-global-examen-${assessmentIdNum}.pdf"`,
    },
  });
}
