import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// lib/rbac.ts imports `server-only`, so these regressions deliberately inspect
// the two authorization boundaries as source invariants rather than importing
// the Next.js guard into the Node unit-test runtime. The important contract is
// that server-side registry validation is mandatory once a cookie claims to be
// authenticated: absence of dbSessionId must fail closed, exactly like a
// revoked/expired/non-existent DB session.
const readRelative = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const mandatoryRegistryGuard = /if\s*\(\s*!session\.dbSessionId\s*\|\|\s*!isDbSessionValid\(session\.dbSessionId\)\s*\)/;
const optionalRegistryGuard = /session\.dbSessionId\s*&&\s*!isDbSessionValid\(session\.dbSessionId\)/;

test("protected app layout fails closed when dbSessionId is missing", () => {
  const source = readRelative("../../app/(app)/layout.tsx");
  assert.match(source, mandatoryRegistryGuard);
  assert.doesNotMatch(source, optionalRegistryGuard);
});

test("requireRole fails closed when dbSessionId is missing before role authorization", () => {
  const source = readRelative("../../lib/rbac.ts");
  assert.match(source, mandatoryRegistryGuard);
  assert.doesNotMatch(source, optionalRegistryGuard);

  const registryCheck = source.indexOf("!session.dbSessionId || !isDbSessionValid(session.dbSessionId)");
  const roleCheck = source.indexOf("!allowed.includes(session.role)");
  assert.ok(registryCheck >= 0 && roleCheck >= 0 && registryCheck < roleCheck, "DB-session validation must happen before role authorization");
});
