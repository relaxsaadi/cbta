import { requireRole } from "@/lib/rbac";
import { getGroup, listGroupMembers } from "@/lib/groups";
import { hasGroupAccess } from "@/lib/tenant-scope";
import { toCsv } from "@/lib/csv";
import { audit } from "@/lib/audit";

// Mission "PRODUCTION READINESS" §3 — export du roster d'un groupe
// (candidat/identifiant/date d'ajout), distinct de l'export résultats déjà
// existant (addendum §7). Réservé personnel, scopé tenant.
const CANDIDATES_CSV_COLUMNS = ["full_name", "username", "added_at"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("pedagogical_manager", "administrator", "auditor");
  const { id } = await params;
  const groupId = Number(id);
  const group = getGroup(groupId);
  if (!group || !hasGroupAccess(session, groupId)) {
    return new Response("Groupe introuvable.", { status: 404 });
  }
  const members = listGroupMembers(groupId);
  const rows = members.map((m) => ({ full_name: m.full_name, username: m.username, added_at: m.added_at }));
  const csv = toCsv(rows, CANDIDATES_CSV_COLUMNS);

  audit({ actorUserId: session.userId, actorRole: session.role, action: "export_csv_candidates", targetType: "group", targetId: groupId, metadata: { rowCount: members.length } });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidats-groupe-${groupId}.csv"`,
    },
  });
}
