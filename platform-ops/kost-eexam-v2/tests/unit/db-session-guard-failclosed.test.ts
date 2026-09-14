import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// lib/rbac.ts imports `server-only`, so these regressions deliberately inspect
// the two authorization boundaries as source invariants rather than importing
// the Next.js guard into the Node unit-test runtime. The important contract is
// that server-side registry validation is mandatory once a cookie claims to be
// authenticated: absence of dbSessionId must fail closed, the registry lookup
// must be bound to the same cookie user, and #245 additionally requires the
// current unique persisted role to match the authenticated cookie role.
const readRelative = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const mandatoryRegistryGuard = /if\s*\(\s*!session\.dbSessionId\s*\|\|\s*!isDbSessionValid\(session\.dbSessionId,\s*session\.userId,\s*session\.role\)\s*\)/;
const optionalRegistryGuard = /session\.dbSessionId\s*&&\s*!isDbSessionValid/;

test("protected app layout fails closed and binds dbSessionId to cookie user + role", () => {
  const source = readRelative("../../app/(app)/layout.tsx");
  assert.match(source, mandatoryRegistryGuard);
  assert.doesNotMatch(source, optionalRegistryGuard);
});

test("requireRole validates bound DB session and unique persisted role before role authorization", () => {
  const source = readRelative("../../lib/rbac.ts");
  assert.match(source, mandatoryRegistryGuard);
  assert.doesNotMatch(source, optionalRegistryGuard);

  const registryCheck = source.indexOf("!session.dbSessionId || !isDbSessionValid(session.dbSessionId, session.userId, session.role)");
  const roleCheck = source.indexOf("!allowed.includes(session.role)");
  assert.ok(registryCheck >= 0 && roleCheck >= 0 && registryCheck < roleCheck, "DB-session + persisted-role validation must happen before role authorization");
});
