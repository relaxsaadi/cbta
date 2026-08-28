"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { completeMfaLogin } from "@/lib/auth";
import { getSession } from "@/lib/session";

export interface VerifyMfaResult {
  error?: string;
}

export async function verifyMfaAction(_prev: VerifyMfaResult, formData: FormData): Promise<VerifyMfaResult> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Code obligatoire." };

  const h = await headers();
  const result = await completeMfaLogin(code, {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const session = await getSession();
  redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
}

/** Abandon du parcours MFA — détruit la session "en attente" (jamais
 * connectée, voir lib/session.ts) et renvoie au formulaire de connexion
 * normal. */
export async function cancelMfaLoginAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
