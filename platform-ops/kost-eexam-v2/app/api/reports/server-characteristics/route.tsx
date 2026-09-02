import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { formatAlgeriaDateTime } from "@/lib/timezone";
import { audit } from "@/lib/audit";
import { SERVER_CHARACTERISTICS_INSPECTION_DATE } from "@/lib/server-characteristics";
import { ServerCharacteristicsDocument } from "@/lib/pdf/ServerCharacteristicsDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";

// Caractéristiques de l'environnement serveur PDF (mission "URGENT
// AUDITOR FOLLOW-UP — ALGERIA TIMEZONE + SERVER CHARACTERISTICS",
// 2026-09-02, §14) — même périmètre que l'écran /system dont ce
// téléchargement dépend (administrator + auditor en lecture seule),
// jamais responsable pédagogique/candidat (infrastructure hors de leur
// périmètre métier).
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  if (!["administrator", "auditor"].includes(session.role)) {
    return new Response("Rôle non autorisé.", { status: 403 });
  }

  const meta: DocumentMeta = {
    docTitle: "Caractéristiques de l'environnement serveur",
    docId: "KOST-EEXAM-SRV-CHAR-v1",
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: formatAlgeriaDateTime(new Date(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };

  const buffer = await renderToBuffer(<ServerCharacteristicsDocument meta={meta} inspectionDate={SERVER_CHARACTERISTICS_INSPECTION_DATE} />);

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_server_characteristics_pdf_download",
    targetType: "document",
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kost-eexam-v2-caracteristiques-serveur.pdf"`,
    },
  });
}
