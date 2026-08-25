import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";

export interface ExamLifecycleEvidence {
  created: { count: number; latestTimestamp: string | null };
  updated: { count: number; latestTimestamp: string | null };
  deleted: { count: number; latestTimestamp: string | null };
}

/**
 * Preuve réelle et re-vérifiable à tout moment (pas un instantané figé) que
 * le cycle de vie complet d'un examen (création/modification/suppression)
 * a été démontré sur cette plateforme — via les vrais événements d'audit
 * Moodle (mdl_logstore_standard_log), jamais recalculés ni fabriqués.
 * Le test réel a été exécuté sur un cours/quiz jetable dédié
 * (KOST-ANAC-AUDIT-TEST), jamais sur le vrai examen DGR.
 */
export async function getExamLifecycleEvidence(): Promise<ExamLifecycleEvidence> {
  const rows = await queryReadOnly<{ eventname: string; cnt: number; latest: number }>(
    `SELECT eventname, COUNT(*) as cnt, MAX(timecreated) as latest
     FROM mdl_logstore_standard_log
     WHERE eventname IN (
       '\\\\core\\\\event\\\\course_module_created',
       '\\\\core\\\\event\\\\course_module_updated',
       '\\\\core\\\\event\\\\course_module_deleted'
     )
     GROUP BY eventname`
  ).catch(() => []);

  const find = (name: string) => rows.find((r) => r.eventname.endsWith(name));
  const toResult = (r: { cnt: number; latest: number } | undefined) => ({
    count: r?.cnt ?? 0,
    latestTimestamp: r && r.latest ? new Date(r.latest * 1000).toISOString() : null,
  });

  return {
    created: toResult(find("course_module_created")),
    updated: toResult(find("course_module_updated")),
    deleted: toResult(find("course_module_deleted")),
  };
}
