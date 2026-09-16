// MFA post-cookie success finalization.
//
// The browser cookie cannot participate in the SQLite transaction used by
// claimMfaLogin(). Once iron-session has staged the authenticated cookie,
// the durable success evidence still has to be all-or-nothing: a recovery-
// code usage event must never survive without the matching successful login
// event, and vice versa. Callers compensate the already-created MFA claim if
// this transaction throws.
import { transaction } from "./db";
import { audit } from "./audit";
import type { MfaLoginClaim } from "./mfa-login-boundary";

export function commitMfaLoginSuccessAudit(
  claim: MfaLoginClaim,
  meta: { ip?: string }
): void {
  transaction(() => {
    if (claim.usedRecoveryCode) {
      audit({
        actorUserId: claim.userId,
        actorRole: claim.role,
        action: "mfa_recovery_code_used",
        result: "success",
        ipAddress: meta.ip,
        sessionId: claim.dbSessionId,
      });
    }

    audit({
      actorUserId: claim.userId,
      actorRole: claim.role,
      action: "login",
      result: "success",
      ipAddress: meta.ip,
      sessionId: claim.dbSessionId,
    });
  });
}
