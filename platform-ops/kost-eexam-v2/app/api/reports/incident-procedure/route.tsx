import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { audit } from "@/lib/audit";
import { IncidentProcedureDocument } from "@/lib/pdf/IncidentProcedureDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Procédure incident/cyberattaque/interruption de service PDF (addendum
// §9-11) — document de politique, réservé au personnel habilité aux
// incidents (même périmètre de rôles que l'écran /incidents). Contenu
// statique mais décrivant exclusivement des capacités réellement
// implémentées — voir lib/pdf/IncidentProcedureDocument.tsx.
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  if (!["pedagogical_manager", "administrator", "auditor"].includes(session.role)) {
    return new Response("Rôle non autorisé.", { status: 403 });
  }

  const meta: DocumentMeta = {
    docTitle: "Procédure incident, cyberattaque et interruption de service",
    docId: "KOST-EEXAM-PROC-INCIDENT-v1",
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: new Date().toLocaleString("fr-FR"),
  };

  const buffer = await renderToBuffer(<IncidentProcedureDocument meta={meta} />);

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_incident_procedure_pdf_download",
    targetType: "document",
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="procedure-incident.pdf"`,
    },
  });
}
