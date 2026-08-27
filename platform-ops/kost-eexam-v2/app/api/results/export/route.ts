import { requireRole } from "@/lib/rbac";
import { listResults } from "@/lib/results";
import { toCsv, RESULTS_CSV_COLUMNS } from "@/lib/csv";
import { getDb, nowIso } from "@/lib/db";
import { audit } from "@/lib/audit";
import { scopedGroupIdsOrNull } from "@/lib/tenant-scope";

// Export CSV des résultats (§14 de la mission, obligatoire) — colonnes
// minimum exactement celles listées dans la mission.
export async function GET(request: Request) {
  const session = await requireRole("pedagogical_manager", "administrator", "auditor");
  const { searchParams } = new URL(request.url);

  // Frontière multi-client (lib/tenant-scope.ts) — voir le même
  // commentaire dans export-answers/route.ts : restrictToGroupIds vient de
  // la session, jamais de la query string.
  const results = listResults({
    companyId: searchParams.get("companyId") ? Number(searchParams.get("companyId")) : undefined,
    groupId: searchParams.get("groupId") ? Number(searchParams.get("groupId")) : undefined,
    functionCode: searchParams.get("functionCode") || undefined,
    assessmentId: searchParams.get("assessmentId") ? Number(searchParams.get("assessmentId")) : undefined,
    passed: searchParams.get("passed") === "true" ? true : searchParams.get("passed") === "false" ? false : undefined,
    restrictToGroupIds: scopedGroupIdsOrNull(session) ?? undefined,
  });

  const rows = results.map((r) => ({
    candidate_id: r.candidate_user_id,
    candidate_name: r.candidate_name,
    company: r.company_name,
    group: r.group_name,
    function: r.function_code,
    exam: r.assessment_name,
    started_at: r.started_at,
    submitted_at: r.submitted_at ?? "",
    duration:
      r.submitted_at && r.started_at ? `${Math.round((new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime()) / 60000)} min` : "",
    question_count: r.question_count,
    correct_count: r.correct_count,
    incorrect_count: r.incorrect_count,
    score_100: r.score_100 ?? "",
    percentage: r.percentage ?? "",
    pass_threshold: r.pass_threshold_pct ?? "",
    result: r.passed === null ? "" : r.passed ? "REUSSI" : "ECHOUE",
    status: r.status,
  }));

  const csv = toCsv(rows, RESULTS_CSV_COLUMNS);

  getDb()
    .prepare(`INSERT INTO exports (type, requested_by, filters_json, row_count, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run("csv_results", session.userId, JSON.stringify(Object.fromEntries(searchParams)), rows.length, nowIso());
  audit({ actorUserId: session.userId, actorRole: session.role, action: "export_csv_results", metadata: { rowCount: rows.length } });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resultats-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
