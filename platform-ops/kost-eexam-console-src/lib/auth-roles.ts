import "server-only";
import { queryReadOnly } from "@/lib/db-readonly";
import type { ConsoleRole } from "@/lib/session";

// Mapping shortname de rôle Moodle -> rôle console. Chaque nouveau rôle
// (Exam Manager, Instructor, Auditor) devra être créé côté Moodle puis
// ajouté ici. Un utilisateur sans rôle reconnu n'a PAS accès à la console,
// même avec des identifiants Moodle valides.
const ROLE_MAP: Record<string, ConsoleRole> = {
  kost_console_admin_role: "administrator",
  kost_console_exam_manager_role: "exam_manager",
  kost_console_instructor_role: "instructor",
  kost_console_auditor_role: "auditor",
};

export async function resolveConsoleRole(moodleUserId: number): Promise<ConsoleRole | null> {
  const rows = await queryReadOnly<{ shortname: string }>(
    `SELECT r.shortname
     FROM mdl_role_assignments ra
     JOIN mdl_role r ON r.id = ra.roleid
     WHERE ra.userid = ?`,
    [moodleUserId]
  );

  for (const row of rows) {
    const mapped = ROLE_MAP[row.shortname];
    if (mapped) return mapped;
  }
  return null;
}
