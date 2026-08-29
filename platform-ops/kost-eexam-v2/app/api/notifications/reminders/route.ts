import { NextResponse } from "next/server";
import { dispatchAllReminders } from "@/lib/email/reminders";
import { audit } from "@/lib/audit";

// Rappels d'examen optionnels (EXAM_OPENS_SOON / EXAM_NOW_AVAILABLE /
// EXAM_DEADLINE_REMINDER, mission email §22-23). Appelée par un cron
// externe (voir deploy/reminders.sh et crontab.example) — jamais depuis
// le navigateur, protégée par le même jeton partagé que /api/attempts/
// sweep (SWEEP_TOKEN — un seul secret de cron interne pour ces deux
// routes non exposées publiquement, cohérent avec le principe "ne pas
// multiplier les secrets sans besoin réel").
export async function POST(request: Request) {
  const token = process.env.SWEEP_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SWEEP_TOKEN non configuré côté serveur." }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const summaries = await dispatchAllReminders();
  const totalSent = summaries.reduce((acc, s) => acc + s.sent, 0);
  if (totalSent > 0) {
    audit({ actorUserId: null, actorRole: null, action: "reminders_dispatch_cron", metadata: { summaries } });
  }
  return NextResponse.json({ summaries });
}
