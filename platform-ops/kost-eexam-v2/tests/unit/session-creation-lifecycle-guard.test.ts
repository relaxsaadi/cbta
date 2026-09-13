import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { setupTestDb } from "./test-db";

describe("Création de session — garde cycle de vie atomique (#52)", async () => {
  before(() => setupTestDb());

  const { createUser, createUserPendingActivation, setUserStatus } = await import("../../lib/users");
  const {
    createDbSession,
    listSessionsForUser,
    isDbSessionValid,
    SessionCreationDeniedError,
  } = await import("../../lib/sessions-registry");

  test("un compte actif peut créer une session serveur", () => {
    const userId = createUser({
      username: "session.guard.active",
      password: "MotDePasseTest123!",
      fullName: "Session Active",
      role: "candidate",
    });

    const created = createDbSession({ userId, ipAddress: "127.0.0.1", userAgent: "node:test" });
    assert.ok(created.dbSessionId > 0);
    assert.equal(listSessionsForUser(userId).length, 1);
    assert.equal(isDbSessionValid(created.dbSessionId, userId), true);
  });

  test("un compte pending_activation ne peut jamais créer de session serveur", () => {
    const userId = createUserPendingActivation({
      username: "session.guard.pending",
      fullName: "Session Pending",
      role: "candidate",
      email: "session.guard.pending@example.com",
    });

    assert.throws(
      () => createDbSession({ userId }),
      (err: unknown) => err instanceof SessionCreationDeniedError
    );
    assert.equal(listSessionsForUser(userId).length, 0);
  });

  test("si une suspension gagne avant l'INSERT de session, aucune session ne peut apparaître après le stop", () => {
    const userId = createUser({
      username: "session.guard.suspended",
      password: "MotDePasseTest123!",
      fullName: "Session Suspended",
      role: "candidate",
    });

    setUserStatus(userId, "suspended");

    assert.throws(
      () => createDbSession({ userId }),
      (err: unknown) => err instanceof SessionCreationDeniedError
    );
    assert.equal(listSessionsForUser(userId).length, 0, "aucune ligne sessions ne doit être créée après la suspension");
  });

  test("si un archivage gagne avant l'INSERT de session, aucune session ne peut apparaître après le stop", () => {
    const userId = createUser({
      username: "session.guard.archived",
      password: "MotDePasseTest123!",
      fullName: "Session Archived",
      role: "candidate",
    });

    setUserStatus(userId, "archived");

    assert.throws(
      () => createDbSession({ userId }),
      (err: unknown) => err instanceof SessionCreationDeniedError
    );
    assert.equal(listSessionsForUser(userId).length, 0, "aucune ligne sessions ne doit être créée après l'archivage");
  });

  test("une session créée avant le stop devient immédiatement inutilisable dès que le statut n'est plus actif", () => {
    const userId = createUser({
      username: "session.guard.preexisting",
      password: "MotDePasseTest123!",
      fullName: "Session Preexisting",
      role: "candidate",
    });

    const created = createDbSession({ userId });
    assert.equal(isDbSessionValid(created.dbSessionId, userId), true);

    setUserStatus(userId, "suspended");
    assert.equal(isDbSessionValid(created.dbSessionId, userId), false);
  });
});
