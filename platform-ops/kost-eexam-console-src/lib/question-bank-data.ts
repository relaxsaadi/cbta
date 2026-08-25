import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import { classifyScope, type DataScope } from "@/lib/data-scope";

export interface QuestionRecord {
  id: number;
  name: string;
  qtype: string;
  category: string;
  dgrFunctions: string[];
  tags: string[];
  lastModified: string;
  status: string;
  scope: DataScope;
}

const QTYPE_LABELS: Record<string, string> = {
  multichoice: "QCM",
  multichoiceset: "Réponses multiples",
  truefalse: "Vrai / Faux",
  essay: "Réponse libre",
  shortanswer: "Réponse courte",
};

export async function getQuestions(): Promise<QuestionRecord[]> {
  const rows = await queryReadOnly<{
    id: number;
    name: string;
    qtype: string;
    category: string;
    timemodified: number;
    status: string;
  }>(
    `SELECT
       q.id, q.name, q.qtype, qc.name as category, q.timemodified, qv.status
     FROM mdl_question q
     JOIN mdl_question_versions qv ON qv.questionid = q.id
     JOIN mdl_question_bank_entries qbe ON qbe.id = qv.questionbankentryid
     JOIN mdl_question_categories qc ON qc.id = qbe.questioncategoryid
     ORDER BY q.timemodified DESC`
  );

  const tagRows = await queryReadOnly<{ questionid: number; tagname: string }>(
    `SELECT ti.itemid as questionid, t.rawname as tagname
     FROM mdl_tag_instance ti
     JOIN mdl_tag t ON t.id = ti.tagid
     WHERE ti.component = 'core_question' AND ti.itemtype = 'question'`
  ).catch(() => []);

  return rows.map((r) => {
    const tags = tagRows.filter((t) => t.questionid === r.id).map((t) => t.tagname);
    const dgrFunctions = tags
      .filter((t) => t.startsWith("function-"))
      .map((t) => t.replace("function-", "Function "));
    return {
      id: r.id,
      name: r.name,
      qtype: QTYPE_LABELS[r.qtype] ?? r.qtype,
      category: r.category,
      dgrFunctions,
      tags: tags.filter((t) => !t.startsWith("function-")),
      lastModified: new Date(r.timemodified * 1000).toISOString(),
      status: r.status,
      scope: classifyScope(r.name, r.category),
    };
  });
}

import { DGR_FUNCTIONS } from "@/lib/dgr-functions";
export { DGR_FUNCTIONS };
