import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function RootPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.role) redirect("/login");
  redirect(session.role === "candidate" ? "/mes-examens" : "/overview");
}
