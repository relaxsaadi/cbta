"use server";

import { getSession } from "@/lib/session";
import { loginToMoodle, getSiteInfo, MoodleAuthError } from "@/lib/moodle-client";
import { resolveConsoleRole } from "@/lib/auth-roles";
import { redirect } from "next/navigation";

export interface LoginResult {
  error?: string;
}

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  let token: string;
  try {
    token = await loginToMoodle(username, password);
  } catch (err) {
    if (err instanceof MoodleAuthError) {
      return { error: "Invalid credentials, or this account is not authorized for console access." };
    }
    return { error: "Unable to reach the authentication service. Please try again." };
  }

  const info = await getSiteInfo(token);
  const role = await resolveConsoleRole(info.userid);

  if (!role) {
    return {
      error: "This Moodle account does not have a recognized console role. Contact an administrator.",
    };
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.userId = info.userid;
  session.username = info.username;
  session.fullName = info.fullname;
  session.role = role;
  session.moodleToken = token; // server-side only — never sent to the client
  await session.save();

  redirect("/overview");
}
