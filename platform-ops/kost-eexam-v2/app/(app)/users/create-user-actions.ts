"use server";

import { requireWriteRole } from "@/lib/rbac";
import { normalizeAccountIdentity } from "@/lib/user-input-validation";
import {
  createUserAction as createUserActionLegacy,
  type CreateUserResult,
} from "./actions";

export type { CreateUserResult } from "./actions";

/**
 * Issue #95 — canonical server-side identity/email boundary for the
 * administrator account-creation wizard. The existing action remains
 * authoritative for duplicate/tenant/provisioning/invitation semantics.
 */
export async function createUserAction(
  prev: CreateUserResult,
  formData: FormData
): Promise<CreateUserResult> {
  await requireWriteRole("administrator");

  const sendInvitation = String(formData.get("sendInvitation") ?? "true") !== "false";
  const identity = normalizeAccountIdentity(
    {
      fullName: String(formData.get("fullName") ?? ""),
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
    },
    { emailRequired: sendInvitation }
  );
  if (!identity.value) return { error: identity.error ?? "Identité de compte invalide." };

  formData.set("fullName", identity.value.fullName);
  formData.set("username", identity.value.username);
  formData.set("email", identity.value.email);
  return createUserActionLegacy(prev, formData);
}
