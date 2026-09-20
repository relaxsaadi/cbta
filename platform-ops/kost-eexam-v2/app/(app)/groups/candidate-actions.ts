"use server";

import { requireWriteRole } from "@/lib/rbac";
import { normalizeCandidateIdentity } from "@/lib/user-input-validation";
import {
  addCandidateAction as addCandidateActionLegacy,
  type AddCandidateResult,
} from "./actions";

export type { AddCandidateResult } from "./actions";

/**
 * Issue #95 — canonical server-side identity boundary for the direct
 * group-candidate creation path. The legacy action remains authoritative for
 * tenant/RBAC/duplicate/membership/invitation behavior; this wrapper only
 * validates and normalizes identity fields before any legacy write can run.
 */
export async function addCandidateAction(
  groupId: number,
  prev: AddCandidateResult,
  formData: FormData
): Promise<AddCandidateResult> {
  await requireWriteRole("pedagogical_manager", "administrator");

  const identity = normalizeCandidateIdentity({
    fullName: String(formData.get("fullName") ?? ""),
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!identity.value) return { error: identity.error ?? "Identité candidat invalide." };

  formData.set("fullName", identity.value.fullName);
  formData.set("username", identity.value.username);
  formData.set("email", identity.value.email);
  return addCandidateActionLegacy(groupId, prev, formData);
}
