import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { hasFamiliarizationSessionAccess } from "@/lib/tenant-scope";
import { getFamiliarizationSession, listAttendance } from "@/lib/familiarization";
import { functionLabel } from "@/lib/questions";
import { audit } from "@/lib/audit";
import { AttendanceSheetDocument } from "@/lib/pdf/AttendanceSheetDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Feuille de présence PDF (addendum §18-21) — réservée personnel
// (responsable/admin/auditeur), scopée tenant.
export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  if (!["pedagogical_manager", "administrator", "auditor"].includes(session.role)) {
    return new Response("Rôle non autorisé.", { status: 403 });
  }
  const { sessionId } = await params;
  const sessionIdNum = Number(sessionId);

  const fs = getFamiliarizationSession(sessionIdNum);
  if (!fs || !hasFamiliarizationSessionAccess({ userId: session.userId, role: session.role }, sessionIdNum)) {
    return new Response("Session introuvable.", { status: 404 });
  }
  const attendance = listAttendance(sessionIdNum);

  const meta: DocumentMeta = {
    docTitle: `Feuille de présence — familiarisation`,
    docId: `KOST-EEXAM-PRES-${sessionIdNum}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: new Date().toLocaleString("fr-FR"),
    company: fs.company_name,
    groupOrSession: fs.group_name,
    function: functionLabel(fs.function_code),
  };

  const buffer = await renderToBuffer(
    <AttendanceSheetDocument rows={attendance} location={fs.location} heldAt={fs.held_at} endedAt={fs.ended_at} audience={fs.audience} meta={meta} />
  );

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_attendance_sheet_pdf_download",
    targetType: "familiarization_session",
    targetId: sessionIdNum,
    metadata: { candidateCount: attendance.length },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="feuille-presence-${sessionIdNum}.pdf"`,
    },
  });
}
