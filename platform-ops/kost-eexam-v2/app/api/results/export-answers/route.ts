import { requireRole } from "@/lib/rbac";
import { listResults, getAttemptDetail } from "@/lib/results";
import { toCsv, ANSWERS_CSV_COLUMNS } from "@/lib/csv";
import { getDb, nowIso } from "@/lib/db";
import { audit } from "@/lib/audit";

// Export CSV détaillé des réponses (§14 — une ligne par candidat → examen
// → question → réponse candidat → réponse correcte → résultat → points).
export async function GET(request: Request) {
  const session = await requireRole("pedagogical_manager", "administrator", "auditor");
  const { searchParams } = new URL(request.url);

  const results = listResults({
    companyId: searchParams.get("companyId") ? Number(searchParams.get("companyId")) : undefined,
    groupId: searchParams.get("groupId") ? Number(searchParams.get("groupId")) : undefined,
    functionCode: searchParams.get("functionCode") || undefined,
    assessmentId: searchParams.get("assessmentId") ? Number(searchParams.get("assessmentId")) : undefined,
  });

  const rows: Record<string, unknown>[] = [];
  for (const r of results) {
    const detail = getAttemptDetail(r.attempt_id);
    if (!detail) continue;
    for (const q of detail.questions) {
      rows.push({
        candidate_id: r.candidate_user_id,
        candidate_name: r.candidate_name,
        exam: r.assessment_name,
        question_position: q.position,
        question_stem: q.stem,
        candidate_answer: q.candidateAnswer.join("|"),
        correct_answer: q.correctAnswer.join("|"),
        result: q.isCorrect === null ? "" : q.isCorrect ? "CORRECT" : "INCORRECT",
        points_awarded: q.pointsAwarded ?? "",
      });
    }
  }

  const csv = toCsv(rows, ANSWERS_CSV_COLUMNS);

  getDb()
    .prepare(`INSERT INTO exports (type, requested_by, filters_json, row_count, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run("csv_answers_detail", session.userId, JSON.stringify(Object.fromEntries(searchParams)), rows.length, nowIso());
  audit({ actorUserId: session.userId, actorRole: session.role, action: "export_csv_answers", metadata: { rowCount: rows.length } });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reponses-detaillees-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
