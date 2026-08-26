import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn && session.role) {
    redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
  }
  return <LoginForm />;
}
