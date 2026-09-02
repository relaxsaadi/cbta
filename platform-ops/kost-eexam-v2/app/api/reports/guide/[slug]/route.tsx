import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { formatAlgeriaDateTime } from "@/lib/timezone";
import { getGuide } from "@/lib/guides";
import { audit } from "@/lib/audit";
import { GuideDocument } from "@/lib/pdf/GuideDocument";
import type { DocumentMeta } from "@/lib/pdf/DocumentChrome";
import type { ConsoleRole } from "@/lib/session";

// Périmètre de rôle par guide — reflète EXACTEMENT le guardPage() de
// chaque écran /guide/* correspondant (app/(app)/guide/*/page.tsx),
// jamais un périmètre distinct qui pourrait diverger.
const GUIDE_ROLES: Record<string, ConsoleRole[]> = {
  candidat: ["candidate", "pedagogical_manager", "administrator", "auditor"],
  "responsable-pedagogique": ["pedagogical_manager", "administrator", "auditor"],
  administrateur: ["administrator", "auditor"],
  auditeur: ["auditor", "administrator"],
  session: ["pedagogical_manager", "administrator", "auditor"],
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    return new Response("Non authentifié.", { status: 401 });
  }
  const { slug } = await params;
  const guide = getGuide(slug);
  const allowedRoles = GUIDE_ROLES[slug];
  if (!guide || !allowedRoles) return new Response("Guide introuvable.", { status: 404 });
  if (!allowedRoles.includes(session.role)) return new Response("Rôle non autorisé.", { status: 403 });

  const meta: DocumentMeta = {
    docTitle: guide.title,
    docId: `KOST-EEXAM-GUIDE-${slug}-v1`,
    generatedBy: `${session.fullName ?? session.username} (${session.role})`,
    generatedAt: formatAlgeriaDateTime(new Date(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };

  const buffer = await renderToBuffer(<GuideDocument guide={guide} meta={meta} />);

  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "report_guide_pdf_download",
    targetType: "guide",
    metadata: { slug },
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="guide-${slug}.pdf"`,
    },
  });
}
