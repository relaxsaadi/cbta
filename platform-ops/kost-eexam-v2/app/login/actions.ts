"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { login } from "@/lib/auth";
import { getSession } from "@/lib/session";

export interface LoginResult {
  error?: string;
}

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Le nom d'utilisateur et le mot de passe sont obligatoires." };
  }

  const h = await headers();
  const result = await login(username, password, {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: h.get("user-agent") ?? undefined,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const session = await getSession();
  redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
}
