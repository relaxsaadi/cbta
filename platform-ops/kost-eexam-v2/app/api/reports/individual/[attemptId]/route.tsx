import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { formatAlgeriaDateTime } from "@/lib/timezone";
import { hasAttemptAccess } from "@/lib/tenant-scope";
import { getAttempt, getAssessmentSettingsForAttempt } from "@/lib/attempts";
import { getAttemptDetail } from "@/lib/results";
import { audit } from "@/lib/audit";
import { candidateCanDownloadIndividualReport } from "@/lib/report-access";
import { IndividualReportDocument } from "@/lib/pdf/IndividualReportDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Rapport individuel PDF (addendum §4). Périmètre d'accès :
//   - pedagogical_manager/administrator : dans leur périmètre client
//     (lib/tenant-scope.ts hasAttemptAccess) ;
//   - auditor : lecture globale (même fonction, true pour ce rôle) ;
//   - candidate : UNIQUEMENT sa propre tentative. Le rapport simple exige
//     assessments.show_result=1 et respecte la diffusion différée. Le rapport
//     détaillé, qui contient la correction question par question, exige EN PLUS
//     assessments.show_correct_answers=1. Ces deux réglages sont indépendants
//     dans le schéma : l'API les applique donc côté serveur et ne se fie jamais
//     au seul niveau choisi par l'URL/UI.
export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  const { attemptId } = await params;
  const attemptIdNum = Number(attemptId);
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") === "detailed" ? "detailed" : "simple";

  if (session.role === "candidate") {
    const attempt = getAttempt(attemptIdNum);
    if (!attempt || attempt.candidate_user_id !== session.userId) {
      return new Response("Rapport introuvable.", { status: 404 });
    }
    // Même politique A/B/C/D que l'écran "Mes résultats" (§11), appliquée
    // côté serveur pour empêcher qu'une URL ?level=detailed contourne
    // show_correct_answers lorsque seul le résultat simple est publiable.
    const settings = getAssessmentSettingsForAttempt(attemptIdNum);
    const stillDeferred = !!settings && settings.feedback_mode === "deferred" && !!settings.close_at && new Date(settings.close_at).getTime() > Date.now();
    const allowed = candidateCanDownloadIndividualReport({
      showResult: settings?.show_result,
      showCorrectAnswers: settings?.show_correct_answers,
      stillDeferred,
      level,
    });
    if (!allowed) {
      if (level === "detailed" && settings?.show_result === 1 && !stillDeferred) {
        return new Response("La correction détaillée n'est pas disponible pour cet examen.", { status: 403 });
      }
      return new Response("Le téléchargement du rapport n'est pas encore disponible pour cet examen.", { status: 403 });
    }
  } else if (!["pedagogical_manager", "administrator", "auditor"].includes(session.role)) {
    return new Response("Rôle non autorisé.", { status: 403 });
  } else if (!hasAttemptAccess({ userId: session.userId, role: session.role }, attemptIdNum)) {
    return new Response("Rapport introuvable.", { status: 404 });
  }

  const detail = getAttemptDetail(attemptIdNum);
  if (!detail) return new Response("Rapport introuvable.", { status: 404 });

  const meta: DocumentMeta = {
    docTitle: `Rapport individuel — ${level === "detailed" ? "détaillé" : "simple"}`,
    docId: `KOST-EEXAM-RI-${attemptIdNum}-${level === "detailed" ? "D" : "S"}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: formatAlgeriaDateTime(new Date(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    company: detail.company_name,
    groupOrSession: detail.group_name,
    function: detail.function_code,
    assessmentId: detail.attempt_id,
  };

  const buffer = await renderToBuffer(<IndividualReportDocument detail={detail} level={level} meta={meta} />);

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_individual_pdf_download",
    targetType: "attempt",
    targetId: attemptIdNum,
    metadata: { level },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-individuel-${attemptIdNum}-${level}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
