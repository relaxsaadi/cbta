import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function POST() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
