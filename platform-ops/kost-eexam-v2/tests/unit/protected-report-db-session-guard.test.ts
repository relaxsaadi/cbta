import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const readRelative = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const protectedReportRoutes = [
  "../../app/api/reports/session/[assessmentId]/route.tsx",
  "../../app/api/reports/global-exam/[assessmentId]/route.tsx",
  "../../app/api/reports/results-list/[assessmentId]/route.tsx",
  "../../app/api/reports/individual/[attemptId]/route.tsx",
  "../../app/api/reports/attendance-sheet/[sessionId]/route.tsx",
  "../../app/api/reports/guide/[slug]/route.tsx",
  "../../app/api/reports/incident-procedure/route.tsx",
  "../../app/api/reports/server-characteristics/route.tsx",
];

test("protected report GET routes use the authoritative DB-backed role guard", () => {
  for (const route of protectedReportRoutes) {
    const source = readRelative(route);
    assert.match(source, /import\s*\{\s*requireRole\s*\}\s*from\s*["']@\/lib\/rbac["']/, `${route} must import requireRole`);
    assert.match(source, /await\s+requireRole\(/, `${route} must invoke requireRole before serving protected content`);
    assert.doesNotMatch(source, /\bgetSession\s*\(/, `${route} must not fall back to direct cookie-only getSession authorization`);
  }
});

test("candidate individual report still preserves candidate and staff role admission", () => {
  const source = readRelative("../../app/api/reports/individual/[attemptId]/route.tsx");
  assert.match(
    source,
    /requireRole\(\s*["']candidate["']\s*,\s*["']pedagogical_manager["']\s*,\s*["']administrator["']\s*,\s*["']auditor["']\s*\)/,
  );
  assert.match(source, /attempt\.candidate_user_id\s*!==\s*session\.userId/, "candidate ownership check must remain present");
  assert.match(source, /settings\.show_result\s*!==\s*1/, "candidate result-release check must remain present");
  assert.match(source, /hasAttemptAccess\(/, "staff tenant/resource scope must remain present");
});

test("staff and operational report role scopes remain explicit", () => {
  const sessionReport = readRelative("../../app/api/reports/session/[assessmentId]/route.tsx");
  const attendance = readRelative("../../app/api/reports/attendance-sheet/[sessionId]/route.tsx");
  const serverCharacteristics = readRelative("../../app/api/reports/server-characteristics/route.tsx");

  const staffGuard = /requireRole\(\s*["']pedagogical_manager["']\s*,\s*["']administrator["']\s*,\s*["']auditor["']\s*\)/;
  assert.match(sessionReport, staffGuard);
  assert.match(attendance, staffGuard);
  assert.match(attendance, /hasFamiliarizationSessionAccess\(/, "attendance tenant scope must remain present");
  assert.match(serverCharacteristics, /requireRole\(\s*["']administrator["']\s*,\s*["']auditor["']\s*\)/);
});
