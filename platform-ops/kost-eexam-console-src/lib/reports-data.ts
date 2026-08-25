import "server-only";
import { getResults, type ResultRecord } from "@/lib/results-data";
import { getExams } from "@/lib/exams-data";
import { DEFAULT_SCOPE_FILTER, type DataScope } from "@/lib/data-scope";

export interface ReportsData {
  examsCompleted: number;
  candidatesAssessed: number;
  passRate: number | null;
  averageScorePercent: number | null;
  averageDurationSeconds: number | null;
  byExam: {
    examName: string;
    dgrFunctions: string[];
    attempts: number;
    passRate: number | null;
    averageScorePercent: number | null;
  }[];
}

export async function getReportsData(filters?: {
  examName?: string;
  dgrFunction?: string;
  scope?: DataScope[];
}): Promise<ReportsData> {
  const [results, exams] = await Promise.all([getResults(), getExams()]);

  const scope = filters?.scope ?? DEFAULT_SCOPE_FILTER;
  let filtered = results.filter((r) => r.state === "finished" && scope.includes(r.scope));
  if (filters?.examName) {
    filtered = filtered.filter((r) => r.examName === filters.examName);
  }
  if (filters?.dgrFunction) {
    const examNamesForFunction = new Set(
      exams.filter((e) => e.dgrFunctions.includes(filters.dgrFunction!)).map((e) => e.name)
    );
    filtered = filtered.filter((r) => examNamesForFunction.has(r.examName));
  }

  const graded = filtered.filter((r) => r.officialGrade !== null);
  const passed = filtered.filter((r) => r.passFail === "pass").length;
  const withDuration = filtered.filter((r) => r.durationSeconds !== null);
  const candidateSet = new Set(filtered.map((r) => r.candidateUsername));

  const examGroups = new Map<string, ResultRecord[]>();
  for (const r of filtered) {
    const arr = examGroups.get(r.examName) ?? [];
    arr.push(r);
    examGroups.set(r.examName, arr);
  }

  const byExam = Array.from(examGroups.entries()).map(([examName, rs]) => {
    const exam = exams.find((e) => e.name === examName);
    const rsGraded = rs.filter((r) => r.officialGrade !== null);
    const rsPassed = rs.filter((r) => r.passFail === "pass").length;
    return {
      examName,
      dgrFunctions: exam?.dgrFunctions ?? [],
      attempts: rs.length,
      passRate: rs.length > 0 ? (rsPassed / rs.length) * 100 : null,
      averageScorePercent:
        rsGraded.length > 0 ? rsGraded.reduce((s, r) => s + (r.percentage ?? 0), 0) / rsGraded.length : null,
    };
  });

  return {
    examsCompleted: filtered.length,
    candidatesAssessed: candidateSet.size,
    passRate: filtered.length > 0 ? (passed / filtered.length) * 100 : null,
    averageScorePercent: graded.length > 0 ? graded.reduce((s, r) => s + (r.percentage ?? 0), 0) / graded.length : null,
    averageDurationSeconds:
      withDuration.length > 0 ? withDuration.reduce((s, r) => s + (r.durationSeconds ?? 0), 0) / withDuration.length : null,
    byExam,
  };
}
