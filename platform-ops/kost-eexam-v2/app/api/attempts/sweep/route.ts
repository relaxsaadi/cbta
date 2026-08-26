import { NextResponse } from "next/server";
import { sweepExpiredAttempts } from "@/lib/attempts";
import { audit } from "@/lib/audit";

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

  const count = sweepExpiredAttempts();
  if (count > 0) {
    audit({ actorUserId: null, actorRole: null, action: "attempts_sweep_cron", metadata: { count } });
  }
  return NextResponse.json({ swept: count });
}
