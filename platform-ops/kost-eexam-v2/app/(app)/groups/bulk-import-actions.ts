"use server";

import { revalidatePath } from "next/cache";
import { requireWriteRole } from "@/lib/rbac";
import { addCandidateToGroup, getGroup, isCandidateMemberOfGroup } from "@/lib/groups";
import { createUserPendingActivation, findUserById, findUserByUsername, getRoleForUser } from "@/lib/users";
import { hasGroupAccess, hasUserAccess } from "@/lib/tenant-scope";
import { audit } from "@/lib/audit";
import { createActivationToken } from "@/lib/activation-tokens";
import { notifyAccountCreated } from "@/lib/email/events";
import { auditEmailInvitationSent } from "@/lib/email/audit";
import { findDuplicateAccount, CROSS_TENANT_DUPLICATE_MESSAGE } from "@/lib/duplicate-check";
import { resendInvitation, ResendError } from "@/lib/email/resend-actions";
import { CsvParseError, parseCsv } from "@/lib/csv";
import { normalizeCandidateIdentity } from "@/lib/user-input-validation";

export interface BulkImportResult {
  error?: string;
  report?: {
    line: number;
    identifier: string;
    status: "created" | "existing_added" | "duplicate_in_group" | "error";
    detail?: string;
  }[];
}

const REQUIRED_COLUMNS = ["full_name", "username", "email"] as const;
const ALLOWED_COLUMNS = new Set(["full_name", "username", "email", "phone"]);

function deliveryPhrase(status: string | null, email: string): string {
  if (status === "SUPPRESSED") {
    return `Invitation créée pour ${email} — envoi bloqué par la politique d'envoi de cet environnement de test.`;
  }
  if (status === null) {
    return `Invitation créée pour ${email} — l'envoi n'a pas pu être préparé (voir journal serveur).`;
  }
  return `Invitation envoyée à ${email}.`;
}

async function inviteNewCandidate(params: {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  companyId: number;
  companyName: string;
  groupName: string;
  actorUserId: number;
  actorRole: "pedagogical_manager" | "administrator";
}): Promise<string> {
  const firstName = params.fullName.trim().split(/\s+/)[0] ?? params.fullName;
  const { token, expiresAt } = createActivationToken({
    userId: params.userId,
    purpose: "account_setup",
    createdBy: params.actorUserId,
  });
  const status = await notifyAccountCreated({
    userId: params.userId,
    email: params.email,
    firstName,
    companyId: params.companyId,
    companyName: params.companyName,
    groupName: params.groupName,
    usernameOrEmail: params.username,
    activationToken: token,
    expiresAt,
  });
  auditEmailInvitationSent(params.actorUserId, params.actorRole, params.userId);
  return deliveryPhrase(status, params.email);
}

function normalizeHeader(cells: string[]): string[] {
  return cells.map((cell, index) => {
    const withoutBom = index === 0 ? cell.replace(/^\uFEFF/, "") : cell;
    return withoutBom.trim().toLowerCase();
  });
}

/**
 * Issue #95 — production CSV import boundary.
 *
 * Accepted contract: UTF-8 text, comma delimiter, RFC-4180-style quoting.
 * We never guess semicolon/tab delimiters. Structural parsing and header
 * validation complete before any account/member/token/outbox side effect.
 */
export async function bulkImportCandidatesAction(
  groupId: number,
  _prev: BulkImportResult,
  formData: FormData
): Promise<BulkImportResult> {
  const session = await requireWriteRole("pedagogical_manager", "administrator");
  if (!hasGroupAccess(session, groupId)) {
    audit({
      actorUserId: session.userId,
      actorRole: session.role,
      action: "candidate_bulk_import_denied",
      targetType: "group",
      targetId: groupId,
      result: "failure",
    });
    return { error: "Ce groupe n'est pas dans votre périmètre." };
  }

  const csvText = String(formData.get("csv") ?? "");
  if (!csvText.trim()) {
    return { error: "Collez le contenu CSV UTF-8 délimité par des virgules (full_name,username,email)." };
  }

  const group = getGroup(groupId);
  if (!group) return { error: "Groupe introuvable." };

  let parsed;
  try {
    parsed = parseCsv(csvText);
  } catch (error) {
    const line = error instanceof CsvParseError ? error.line : 1;
    const detail = error instanceof Error ? error.message : "CSV mal formé.";
    return { report: [{ line, identifier: "?", status: "error", detail }] };
  }

  const rows = parsed.filter((row) => row.cells.some((cell) => cell.trim().length > 0));
  if (rows.length < 2) {
    return { error: "Au moins une ligne d'en-tête et une ligne de donnée sont requises." };
  }

  const header = normalizeHeader(rows[0]!.cells);
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const column of header) {
    if (seen.has(column)) duplicates.add(column);
    seen.add(column);
  }
  const unknown = header.filter((column) => !ALLOWED_COLUMNS.has(column));
  const missing = REQUIRED_COLUMNS.filter((column) => !seen.has(column));

  if (duplicates.size > 0) {
    return { error: `En-tête CSV ambigu — colonne(s) dupliquée(s) : ${[...duplicates].join(", ")}.` };
  }
  if (unknown.length > 0) {
    return { error: `En-tête CSV invalide — colonne(s) non reconnue(s) : ${unknown.join(", ")}. Délimiteur accepté : virgule.` };
  }
  if (missing.length > 0) {
    return { error: `En-tête CSV invalide — colonne(s) obligatoire(s) manquante(s) : ${missing.join(", ")}.` };
  }

  const idxFullName = header.indexOf("full_name");
  const idxUsername = header.indexOf("username");
  const idxEmail = header.indexOf("email");
  const idxPhone = header.indexOf("phone");
  const report: NonNullable<BulkImportResult["report"]> = [];

  for (const row of rows.slice(1)) {
    if (row.cells.length !== header.length) {
      report.push({
        line: row.line,
        identifier: row.cells[idxUsername]?.trim() || row.cells[idxFullName]?.trim() || "?",
        status: "error",
        detail: `Nombre de colonnes invalide : ${row.cells.length} reçu(es), ${header.length} attendu(es).`,
      });
      continue;
    }

    const identity = normalizeCandidateIdentity({
      fullName: row.cells[idxFullName] ?? "",
      username: row.cells[idxUsername] ?? "",
      email: row.cells[idxEmail] ?? "",
    });
    if (!identity.value) {
      report.push({
        line: row.line,
        identifier: row.cells[idxUsername]?.trim() || row.cells[idxFullName]?.trim() || "?",
        status: "error",
        detail: identity.error,
      });
      continue;
    }

    const { fullName, username, email } = identity.value;
    const phone = idxPhone >= 0 ? row.cells[idxPhone]!.trim() || undefined : undefined;

    try {
      let user = findUserByUsername(username);
      if (!user) {
        const duplicate = findDuplicateAccount(session, undefined, email);
        if (duplicate) {
          if (!duplicate.visible) {
            report.push({ line: row.line, identifier: username, status: "error", detail: CROSS_TENANT_DUPLICATE_MESSAGE });
            continue;
          }
          user = findUserById(duplicate.userId);
        }
      }

      if (user && !hasUserAccess(session, user.id)) {
        report.push({ line: row.line, identifier: username, status: "error", detail: CROSS_TENANT_DUPLICATE_MESSAGE });
        continue;
      }
      if (user && getRoleForUser(user.id) !== "candidate") {
        report.push({
          line: row.line,
          identifier: username,
          status: "error",
          detail: "Ce compte existe mais n'est pas un compte candidat utilisable.",
        });
        continue;
      }
      if (user && (user.status === "suspended" || user.status === "archived")) {
        report.push({
          line: row.line,
          identifier: username,
          status: "error",
          detail: `Ce compte existe mais est ${user.status === "suspended" ? "suspendu" : "archivé"}.`,
        });
        continue;
      }
      if (user && isCandidateMemberOfGroup(groupId, user.id)) {
        report.push({
          line: row.line,
          identifier: username,
          status: "duplicate_in_group",
          detail: "Déjà membre de ce groupe — ignoré.",
        });
        continue;
      }

      const isNew = !user;
      const userId = user
        ? user.id
        : createUserPendingActivation({ username, fullName, role: "candidate", email, phone });

      addCandidateToGroup(groupId, userId, session.userId);

      let importDetail: string | undefined;
      if (isNew) {
        importDetail = await inviteNewCandidate({
          userId,
          username,
          email,
          fullName,
          companyId: group.company_id,
          companyName: group.company_name,
          groupName: group.name,
          actorUserId: session.userId,
          actorRole: session.role as "pedagogical_manager" | "administrator",
        });
      } else if (user!.status === "pending_activation") {
        try {
          const status = await resendInvitation(userId, {
            id: session.userId,
            role: session.role as "pedagogical_manager" | "administrator",
          });
          importDetail = deliveryPhrase(status, user!.email ?? email);
        } catch (error) {
          importDetail = `invitation non renvoyée : ${error instanceof ResendError ? error.message : "erreur d'envoi"}`;
        }
      }

      report.push({
        line: row.line,
        identifier: username,
        status: isNew ? "created" : "existing_added",
        detail: importDetail,
      });
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      const detail = raw.includes("users.email")
        ? "Un compte utilise déjà cette adresse email."
        : raw.includes("users.username")
          ? "Cet identifiant est déjà utilisé."
          : raw || "Erreur inconnue.";
      report.push({ line: row.line, identifier: username, status: "error", detail });
    }
  }

  const created = report.filter((row) => row.status === "created").length;
  audit({
    actorUserId: session.userId,
    actorRole: session.role,
    action: "candidate_bulk_import",
    targetType: "group",
    targetId: groupId,
    metadata: {
      totalLines: rows.length - 1,
      created,
      errors: report.filter((row) => row.status === "error").length,
      parser: "comma_utf8_quote_aware",
    },
  });
  revalidatePath(`/groups/${groupId}`);
  return { report };
}
