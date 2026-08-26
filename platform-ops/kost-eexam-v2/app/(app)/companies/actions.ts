"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { createCompany } from "@/lib/companies";
import type { Scope } from "@/lib/scope";

export async function createCompanyAction(_prev: { error?: string }, formData: FormData) {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  const name = String(formData.get("name") ?? "").trim();
  const scope = String(formData.get("scope") ?? "production") as Scope;
  if (!name) return { error: "Le nom du client est obligatoire." };

  createCompany({ name, scope, createdBy: session.userId });
  revalidatePath("/companies");
  return {};
}
