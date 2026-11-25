import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const readRelative = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

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
    assert.match(
      source,
      /import\s*\{[^}]*\brequireRole\b[^}]*\}\s*from\s*["']@\/lib\/rbac["']/,
      `${route} must import requireRole from the canonical RBAC module`,
    );
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
  const policy = readRelative("../../lib/report-access.ts");
  assert.match(source, /candidateCanDownloadIndividualReport\(/, "candidate report must use the shared release policy");
  assert.match(source, /showResult:\s*settings\?\.show_result/, "candidate result visibility must be passed to the policy");
  assert.match(source, /showCorrectAnswers:\s*detail\.showCorrectAnswers/, "answer-key visibility must be passed to the policy");
  assert.match(source, /attemptStatus:\s*detail\.status/, "terminal attempt status must be passed to the policy");
  assert.match(source, /gradingState:\s*detail\.grading_state/, "completed grading state must be passed to the policy");
  assert.match(policy, /showResult\s*!==\s*1/, "policy must fail closed when result visibility is disabled");
  assert.match(policy, /showCorrectAnswers\s*===\s*1/, "detailed report must require explicit answer-key release");
  assert.match(policy, /terminalAttempt\s*&&\s*gradingState\s*===\s*["']COMPLETE["']/, "detailed report must require terminal attempt and completed grading");
  assert.match(source, /["']Cache-Control["']:\s*["']private, no-store["']/, "individual PDF must not be cached publicly");
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

function routeFilesUnder(dir: string): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...routeFilesUnder(fullPath));
    } else if (entry.isFile() && (entry.name === "route.ts" || entry.name === "route.tsx")) {
      routes.push(fullPath);
    }
  }
  return routes;
}

test("non-auth API routes cannot silently reintroduce direct cookie-only getSession authorization", () => {
  const apiRoot = fileURLToPath(new URL("../../app/api/", import.meta.url));
  const directSessionRoutes = routeFilesUnder(apiRoot)
    .filter((routePath) => !relative(apiRoot, routePath).startsWith(`auth${process.platform === "win32" ? "\\" : "/"}`))
    .filter((routePath) => /\bgetSession\s*\(/.test(readFileSync(routePath, "utf8")))
    .map((routePath) => relative(apiRoot, routePath).replaceAll("\\", "/"))
    .sort();

  assert.deepEqual(
    directSessionRoutes,
    [],
    `Protected/public API routes outside app/api/auth must use an explicit shared security model instead of direct getSession(): ${directSessionRoutes.join(", ")}`,
  );
});
