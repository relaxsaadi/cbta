import "server-only";
import { cookies } from "next/headers";
import { DEMO_MODE_COOKIE } from "@/lib/demo-mode";

export async function isDemoModeActive(): Promise<boolean> {
  const store = await cookies();
  return store.get(DEMO_MODE_COOKIE)?.value === "1";
}
