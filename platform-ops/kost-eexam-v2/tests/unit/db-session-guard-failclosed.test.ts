import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// lib/rbac.ts imports `server-only`, so these regressions deliberately inspect
// the two authorization boundaries as source invariants rather than importing
// the Next.js guard into the Node unit-test runtime. The app layout still uses
// low-level DB-session validity for navigation. The Server Action boundary is
// intentionally stronger (#56): one authoritative DB decision must bind the
// session to the current user/role AND enforce current account status plus
// `must_change_password` before business role authorization.
const readRelative = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const mandatoryRegistryGuard = /if\s*\(\s*!session\.dbSessionId\s*\|\|\s*!isDbSessionValid\(session\.dbSessionId,\s*session\.userId,\s*session\.role\)\s*\)/;
const optionalRegistryGuard = /session\.dbSessionId\s*&&\s*!isDbSessionValid/;

test("protected app layout fails closed and binds dbSessionId to cookie user + role", () => {
  const source = readRelative("../../app/(app)/layout.tsx");
  assert.match(source, mandatoryRegistryGuard);
  assert.doesNotMatch(source, optionalRegistryGuard);
});

test("requireRole evaluates authoritative DB session/user/role/password state before business-role authorization", () => {
  const source = readRelative("../../lib/rbac.ts");

  assert.match(source, /if\s*\(\s*!session\.dbSessionId\s*\)/);
  assert.match(
    source,
    /evaluateProtectedSessionAuthorization\(\s*session\.dbSessionId,\s*session\.userId,\s*session\.role\s*\)/
  );
  assert.match(source, /decision === "invalid"/);
  assert.match(source, /decision === "password_change_required"/);
  assert.doesNotMatch(source, /isDbSessionValid/);

  const registryCheck = source.indexOf("evaluateProtectedSessionAuthorization(");
  const passwordGate = source.indexOf('decision === "password_change_required"');
  const roleCheck = source.indexOf("!allowed.includes(session.role)");
  assert.ok(
    registryCheck >= 0 &&
      passwordGate >= 0 &&
      roleCheck >= 0 &&
      registryCheck < passwordGate &&
      passwordGate < roleCheck,
    "current DB session/user/role/password state must be enforced before business-role authorization"
  );
});
