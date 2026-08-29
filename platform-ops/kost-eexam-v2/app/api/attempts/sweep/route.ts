import { NextResponse } from "next/server";
import { sweepExpiredAttempts } from "@/lib/attempts";
import { audit } from "@/lib/audit";
import { notifyResultAvailableForAttempt } from "@/lib/email/notify-result";

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
  // RESULT_AVAILABLE (mission email §24) — une tentative auto-soumise par
  // expiration du chronomètre a droit à la même notification qu'une
  // soumission manuelle.
  for (const { attemptId } of swept) {
    await notifyResultAvailableForAttempt(attemptId);
  }
  return NextResponse.json({ swept: swept.length });
}
