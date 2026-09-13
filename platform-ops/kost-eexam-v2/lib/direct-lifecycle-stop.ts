import { audit } from "./audit";
import { nowIso, transaction } from "./db";
import { revokeAllSessionsForUser } from "./sessions-registry";
import type { ConsoleRole } from "./session";
import type { UserStatus } from "./users";

export interface LifecycleStopActor {
  id: number;
  role: ConsoleRole;
}

interface LifecycleUserRow {
  id: number;
  email: string | null;
  full_name: string;
  status: UserStatus;
  archived_at: string | null;
}

export type DirectLifecycleStopResult =
  | {
      changed: false;
      reason: "user_missing" | "invalid_state";
      currentStatus: UserStatus | null;
    }
  | {
      changed: true;
      previousStatus: UserStatus;
      sessionsRevoked: number;
      user: { id: number; email: string | null; fullName: string };
    };

export type BatchArchiveResult =
  | { ok: false; reason: "user_missing"; userId: number }
  | { ok: true; archived: number; skippedAlreadyArchived: number };

function snapshot(row: LifecycleUserRow) {
  return { id: row.id, email: row.email, fullName: row.full_name };
}

/**
 * Direct administrator suspension boundary (#52).
 *
 * The lifecycle CAS, set-based session revocation and success audit are one
 * BEGIN IMMEDIATE transaction. A replay/stale action is a no-op and records
 * no success evidence. Network notification intentionally remains outside
 * this function and may only be attempted by the caller after commit.
 */
export function suspendUserAtomically(userId: number, actor: LifecycleStopActor): DirectLifecycleStopResult {
  return transaction((db) => {
    const user = db
      .prepare(`SELECT id, email, full_name, status, archived_at FROM users WHERE id = ?`)
      .get(userId) as LifecycleUserRow | undefined;

    if (!user) return { changed: false, reason: "user_missing", currentStatus: null };
    if (user.status !== "active" && user.status !== "pending_activation") {
      return { changed: false, reason: "invalid_state", currentStatus: user.status };
    }

    const result = db
      .prepare(`UPDATE users SET status = 'suspended' WHERE id = ? AND status = ?`)
      .run(userId, user.status);
    if (Number(result.changes) !== 1) {
      throw new Error("Lifecycle CAS failed during direct suspension.");
    }

    const sessionsRevoked = revokeAllSessionsForUser(userId, actor.id);
    audit({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "user_suspended",
      targetType: "user",
      targetId: userId,
      result: "success",
      metadata: { sessionsRevoked, previousStatus: user.status },
    });

    return {
      changed: true,
      previousStatus: user.status,
      sessionsRevoked,
      user: snapshot(user),
    };
  });
}

/**
 * Direct administrator archive boundary (#52).
 *
 * Archiving is valid from every non-archived lifecycle state currently
 * exposed by the UI. The row is updated with an expected-state CAS, all
 * sessions are revoked set-wise, and the success audit is persisted in the
 * same transaction. Replaying an already-archived request is a no-op with no
 * duplicate success audit.
 */
export function archiveUserAtomically(userId: number, actor: LifecycleStopActor): DirectLifecycleStopResult {
  return transaction((db) => {
    const user = db
      .prepare(`SELECT id, email, full_name, status, archived_at FROM users WHERE id = ?`)
      .get(userId) as LifecycleUserRow | undefined;

    if (!user) return { changed: false, reason: "user_missing", currentStatus: null };
    if (user.status === "archived") {
      return { changed: false, reason: "invalid_state", currentStatus: user.status };
    }

    const archivedAt = nowIso();
    const result = db
      .prepare(`UPDATE users SET status = 'archived', archived_at = ? WHERE id = ? AND status = ?`)
      .run(archivedAt, userId, user.status);
    if (Number(result.changes) !== 1) {
      throw new Error("Lifecycle CAS failed during direct archive.");
    }

    const sessionsRevoked = revokeAllSessionsForUser(userId, actor.id);
    audit({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: "user_archived",
      targetType: "user",
      targetId: userId,
      result: "success",
      metadata: { sessionsRevoked, previousStatus: user.status },
    });

    return {
      changed: true,
      previousStatus: user.status,
      sessionsRevoked,
      user: snapshot(user),
    };
  });
}

/**
 * All-or-nothing batch archive boundary (#52).
 *
 * Every selected id is first resolved while the BEGIN IMMEDIATE lock is
 * already held. A missing id therefore returns without any mutation. Only
 * after the full batch is known do we archive/revoke/audit each non-archived
 * row. Any SQLite/audit failure on a later row rolls the entire batch back,
 * including earlier status changes and session revocations.
 */
export function archiveUsersBatchAtomically(userIds: number[], actor: LifecycleStopActor): BatchArchiveResult {
  return transaction((db) => {
    const uniqueUserIds = [...new Set(userIds)];
    const users: LifecycleUserRow[] = [];

    for (const userId of uniqueUserIds) {
      const user = db
        .prepare(`SELECT id, email, full_name, status, archived_at FROM users WHERE id = ?`)
        .get(userId) as LifecycleUserRow | undefined;
      if (!user) return { ok: false, reason: "user_missing", userId };
      users.push(user);
    }

    let archived = 0;
    let skippedAlreadyArchived = 0;

    for (const user of users) {
      if (user.status === "archived") {
        skippedAlreadyArchived++;
        continue;
      }

      const archivedAt = nowIso();
      const result = db
        .prepare(`UPDATE users SET status = 'archived', archived_at = ? WHERE id = ? AND status = ?`)
        .run(archivedAt, user.id, user.status);
      if (Number(result.changes) !== 1) {
        throw new Error(`Lifecycle CAS failed during batch archive for user ${user.id}.`);
      }

      const sessionsRevoked = revokeAllSessionsForUser(user.id, actor.id);
      audit({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: "user_archived",
        targetType: "user",
        targetId: user.id,
        result: "success",
        metadata: {
          batch: true,
          sessionsRevoked,
          previousStatus: user.status,
        },
      });
      archived++;
    }

    return { ok: true, archived, skippedAlreadyArchived };
  });
}
