import { createHash } from "node:crypto";
import { audit } from "./audit";
import { getDb, nowIso, transaction } from "./db";
import { hashPassword } from "./passwords";
import { revokeAllSessionsForUser } from "./sessions-registry";
import { activationDenialReason, findUserById } from "./users";
import type { ActivationTokenPurpose } from "./activation-tokens";

/**
 * Security boundary for account-setup and password-reset capabilities.
 *
 * The public server actions validate form shape, but all durable security
 * state is finalized here under one BEGIN IMMEDIATE transaction. The token
 * is re-resolved by its presented secret hash and purpose while the writer
 * lock is held, then claimed with a compare-and-set UPDATE. Any denial or
 * later persistence failure throws through transaction(), so token claim,
 * credential/lifecycle mutation, session revocation and success audit roll
 * back together.
 *
 * Password hashing intentionally happens before BEGIN IMMEDIATE: scrypt is
 * CPU-expensive but produces no durable state, so holding SQLite's writer
 * lock during hashing would only increase contention without strengthening
 * the atomicity guarantee.
 */

export interface CredentialClaimUser {
  id: number;
  email: string | null;
  username: string;
  fullName: string;
}

export type ActivationClaimFailureReason =
  | "invalid_token"
  | "account_not_found"
  | "suspended"
  | "already_active"
  | "archived"
  | "account_not_eligible";

export type PasswordResetClaimFailureReason =
  | "invalid_token"
  | "account_not_found"
  | "account_not_active";

export type ActivationClaimResult =
  | { ok: true; user: CredentialClaimUser }
  | { ok: false; reason: ActivationClaimFailureReason };

export type PasswordResetClaimResult =
  | { ok: true; user: CredentialClaimUser; changedAt: string; revokedSessions: number }
  | { ok: false; reason: PasswordResetClaimFailureReason };

class ExpectedClaimDenial extends Error {
  constructor(readonly reason: ActivationClaimFailureReason | PasswordResetClaimFailureReason) {
    super(reason);
    this.name = "ExpectedClaimDenial";
  }
}

interface ClaimableTokenRow {
  id: number;
  user_id: number;
  purpose: ActivationTokenPurpose;
}

function hashPresentedToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Claim a presented token with CAS semantics. This helper deliberately does
 * not open its own transaction; callers below invoke it only inside the
 * shared BEGIN IMMEDIATE boundary so the claim composes atomically with the
 * rest of the credential/lifecycle mutation.
 */
function claimPresentedToken(
  token: string,
  purpose: ActivationTokenPurpose,
  claimedAt: string
): ClaimableTokenRow | null {
  const db = getDb();
  const tokenHash = hashPresentedToken(token);
  const row = db
    .prepare(
      `SELECT id, user_id, purpose
       FROM activation_tokens
       WHERE token_hash = ?
         AND purpose = ?
         AND used_at IS NULL
         AND expires_at >= ?`
    )
    .get(tokenHash, purpose, claimedAt) as ClaimableTokenRow | undefined;

  if (!row) return null;

  const claim = db
    .prepare(
      `UPDATE activation_tokens
       SET used_at = ?
       WHERE id = ?
         AND token_hash = ?
         AND purpose = ?
         AND used_at IS NULL
         AND expires_at >= ?`
    )
    .run(claimedAt, row.id, tokenHash, purpose, claimedAt);

  return Number(claim.changes) === 1 ? row : null;
}

function claimUserView(userId: number): CredentialClaimUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
  };
}

export function activateAccountWithToken(token: string, plainPassword: string): ActivationClaimResult {
  const passwordHash = hashPassword(plainPassword);

  try {
    return transaction(() => {
      const claimedAt = nowIso();
      const tokenRow = claimPresentedToken(token, "account_setup", claimedAt);
      if (!tokenRow) throw new ExpectedClaimDenial("invalid_token");

      // Re-read lifecycle only after BEGIN IMMEDIATE owns the writer lock.
      // A suspension/archive that committed first therefore wins; if this
      // activation owns the lock first, the later lifecycle stop runs after
      // commit and remains authoritative.
      const user = findUserById(tokenRow.user_id);
      if (!user) throw new ExpectedClaimDenial("account_not_found");
      const denial = activationDenialReason(user.status);
      if (denial) throw new ExpectedClaimDenial(denial);

      const update = getDb()
        .prepare(
          `UPDATE users
           SET password_hash = ?, status = 'active'
           WHERE id = ? AND status = 'pending_activation'`
        )
        .run(passwordHash, user.id);
      if (Number(update.changes) !== 1) {
        throw new ExpectedClaimDenial("account_not_eligible");
      }

      audit({
        actorUserId: user.id,
        actorRole: null,
        action: "account_activated",
        targetType: "user",
        targetId: user.id,
        result: "success",
      });

      return { ok: true as const, user: claimUserView(user.id)! };
    });
  } catch (error) {
    if (error instanceof ExpectedClaimDenial) {
      return { ok: false, reason: error.reason as ActivationClaimFailureReason };
    }
    throw error;
  }
}

export function resetPasswordWithToken(token: string, plainPassword: string): PasswordResetClaimResult {
  const passwordHash = hashPassword(plainPassword);

  try {
    return transaction(() => {
      const changedAt = nowIso();
      const tokenRow = claimPresentedToken(token, "password_reset", changedAt);
      if (!tokenRow) throw new ExpectedClaimDenial("invalid_token");

      const user = findUserById(tokenRow.user_id);
      if (!user) throw new ExpectedClaimDenial("account_not_found");
      // A stale reset link must not mutate credentials for an account whose
      // lifecycle has since been administratively stopped. Reactivation or
      // restoration must happen first, through its own controlled flow.
      if (user.status !== "active") throw new ExpectedClaimDenial("account_not_active");

      const update = getDb()
        .prepare(`UPDATE users SET password_hash = ? WHERE id = ? AND status = 'active'`)
        .run(passwordHash, user.id);
      if (Number(update.changes) !== 1) {
        throw new ExpectedClaimDenial("account_not_active");
      }

      // PR #220 made this one set-based UPDATE. Because it uses the same
      // singleton SQLite connection, it participates in this transaction.
      const revokedSessions = revokeAllSessionsForUser(user.id, user.id);

      audit({
        actorUserId: user.id,
        actorRole: null,
        action: "password_reset_completed",
        targetType: "user",
        targetId: user.id,
        result: "success",
      });

      return {
        ok: true as const,
        user: claimUserView(user.id)!,
        changedAt,
        revokedSessions,
      };
    });
  } catch (error) {
    if (error instanceof ExpectedClaimDenial) {
      return { ok: false, reason: error.reason as PasswordResetClaimFailureReason };
    }
    throw error;
  }
}
