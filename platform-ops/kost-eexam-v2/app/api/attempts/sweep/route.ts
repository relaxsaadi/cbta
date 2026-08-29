import { NextResponse } from "next/server";
import { sweepExpiredAttempts } from "@/lib/attempts";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { notifyResultAvailableForAttempt } from "@/lib/email/notify-result";
import { notifySubmissionEvents } from "@/lib/email/notify-submission";

// Filet de sécurité pour le chronomètre serveur (§8) : auto-soumet toute
// tentative expirée même si aucun candidat/membre du staff n'a consulté une
// page qui déclenche le balayage opportuniste. Appelée par un cron externe
// (voir deploy/crontab.example) — jamais depuis le navigateur, protégée par
// un jeton partagé plutôt qu'une session utilisateur (un cron n'a pas de
// cookie de session).
export async function POST(request: Request) {
  const token = process.env.SWEEP_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SWEEP_TOKEN non configuré côté serveur." }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const swept = sweepExpiredAttempts();
  if (swept.length > 0) {
    audit({ actorUserId: null, actorRole: null, action: "attempts_sweep_cron", metadata: { count: swept.length } });
  }
  // EXAM_SUBMITTED/EXAM_SUBMITTED_ADMIN (mission "COMPLETE CANDIDATE EXAM
  // LIFECYCLE" §20/§31-36) + RESULT_AVAILABLE (mission email §24) — une
  // tentative auto-soumise par expiration du chronomètre a droit exactement
  // aux mêmes notifications qu'une soumission manuelle. RESULT_AVAILABLE
  // uniquement si réellement finalisé (jamais un score partiel envoyé en
  // avance pendant qu'une correction manuelle reste en attente).
  for (const { attemptId } of swept) {
    await notifySubmissionEvents(attemptId);
    const result = getDb().prepare(`SELECT grading_state FROM results WHERE attempt_id = ?`).get(attemptId) as { grading_state: string } | undefined;
    if (result?.grading_state === "COMPLETE") {
      await notifyResultAvailableForAttempt(attemptId);
    }
  }
  return NextResponse.json({ swept: swept.length });
}
