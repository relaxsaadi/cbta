import { before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setupTestDb } from "./test-db";
import type { ConsoleRole } from "../../lib/session";

describe("Forced password change — protected authorization boundary (#56)", async () => {
  before(() => setupTestDb());

  const { createUserPendingActivation } = await import("../../lib/users");
  const { createTemporaryAccess } = await import("../../lib/temp-password");
  const { createDbSession, isDbSessionValid } = await import("../../lib/sessions-registry");
  const { evaluateProtectedSessionAuthorization } = await import(
    "../../lib/protected-session-authorization"
  );
  const { completeForcedPasswordChange } = await import("../../lib/forced-password-change");
  const { getDb } = await import("../../lib/db");

  function temporaryUser(role: ConsoleRole, suffix: string) {
    const username = `forced.authz.${role}.${suffix}`;
    const userId = createUserPendingActivation({
      username,
      fullName: username,
      role,
      email: `${username}@example.test`,
    });
    createTemporaryAccess(userId);
    const session = createDbSession({ userId });
    return { userId, dbSessionId: session.dbSessionId };
  }

  test("every role that can hold a temporary credential is denied protected operations", () => {
    const roles: ConsoleRole[] = [
      "candidate",
      "pedagogical_manager",
      "administrator",
      "auditor",
    ];

    for (const role of roles) {
      const { userId, dbSessionId } = temporaryUser(role, "all-roles");

      // The underlying session deliberately remains valid for the minimal
      // recovery surface (forced password change / logout).
      assert.equal(isDbSessionValid(dbSessionId, userId, role), true);
      assert.equal(
        evaluateProtectedSessionAuthorization(dbSessionId, userId, role),
        "password_change_required",
        `${role} must fail closed at the shared protected boundary`
      );
    }
  });

  test("successful mandatory change atomically promotes the same session to authorized", () => {
    const role: ConsoleRole = "administrator";
    const { userId, dbSessionId } = temporaryUser(role, "cleared");
    assert.equal(
      evaluateProtectedSessionAuthorization(dbSessionId, userId, role),
      "password_change_required"
    );

    const result = completeForcedPasswordChange({
      userId,
      dbSessionId,
      password: "ChosenAfterTemporary123!",
    });
    assert.equal(result.ok && result.changed, true);
    assert.equal(evaluateProtectedSessionAuthorization(dbSessionId, userId, role), "authorized");
  });

  test("current DB state wins: an existing authorized session is denied immediately if the flag returns", () => {
    const role: ConsoleRole = "pedagogical_manager";
    const { userId, dbSessionId } = temporaryUser(role, "state-flip");
    const changed = completeForcedPasswordChange({
      userId,
      dbSessionId,
      password: "InitiallyAuthorized123!",
    });
    assert.equal(changed.ok && changed.changed, true);
    assert.equal(evaluateProtectedSessionAuthorization(dbSessionId, userId, role), "authorized");

    getDb()
      .prepare(`UPDATE users SET must_change_password = 1, temp_password_expires_at = ? WHERE id = ?`)
      .run(new Date(Date.now() + 60_000).toISOString(), userId);

    assert.equal(
      evaluateProtectedSessionAuthorization(dbSessionId, userId, role),
      "password_change_required"
    );
    assert.equal(
      isDbSessionValid(dbSessionId, userId, role),
      true,
      "recovery/logout surface remains reachable while protected operations are denied"
    );
  });

  test("status and forced-password state are evaluated coherently from current DB state", () => {
    const role: ConsoleRole = "auditor";
    const { userId, dbSessionId } = temporaryUser(role, "status");
    getDb().prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(userId);

    assert.equal(evaluateProtectedSessionAuthorization(dbSessionId, userId, role), "invalid");
  });

  test("requireRole is wired to the authoritative protected decision, not low-level session validity", () => {
    const rbacPath = fileURLToPath(new URL("../../lib/rbac.ts", import.meta.url));
    const source = readFileSync(rbacPath, "utf8");

    assert.match(source, /evaluateProtectedSessionAuthorization/);
    assert.match(source, /decision === "password_change_required"/);
    assert.doesNotMatch(source, /isDbSessionValid/);
    assert.match(source, /session\.destroy\(\)[\s\S]*decision === "password_change_required"/);
  });
});
