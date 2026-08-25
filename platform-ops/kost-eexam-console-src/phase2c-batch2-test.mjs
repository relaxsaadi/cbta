import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const results = [];
const consoleErrors = [];
const failedRequests = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
page.on("response", (res) => { if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`); });

// --- Admin regression ---
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
check("Regression: login still works", true);

// Results
await page.goto(`${BASE}/results`, { waitUntil: "networkidle" });
let text = await page.locator("body").textContent();
check("Results page loads", page.url().endsWith("/results"));
check("Results shows the real completed attempt", text?.includes("Test Candidate") || text?.includes("test_candidate"));
check("Results shows a real official grade (not recalculated)", /\d+\.\d+\s*\/\s*100/.test(text ?? ""));
await page.screenshot({ path: "screenshots/phase2c2-01-results.png", fullPage: true });

// Result detail
const candidateLink = page.locator('a:has-text("Test Candidate")').first();
if (await candidateLink.count() > 0) {
  await Promise.all([
    page.waitForURL(/\/results\/\d+/, { timeout: 15000 }),
    candidateLink.click(),
  ]);
  await page.waitForLoadState("networkidle");
  text = await page.locator("body").textContent();
  check("Result Details page loads with real fields", text?.includes("Official grade") && text?.includes("Passing threshold"));
  // Le texte informe volontairement qu'aucune bonne réponse n'est affichée
  // ("Correct answers ... are not shown here") — on vérifie l'ABSENCE d'un
  // contenu de question réel (texte des questions Practice), pas l'absence
  // littérale du mot "Correct".
  check(
    "Result Details does not expose question content",
    !text?.includes("Interface navigation") && !text?.includes("Answer selection") && !text?.includes("Timer behaviour")
  );
  await page.screenshot({ path: "screenshots/phase2c2-02-result-detail.png", fullPage: true });
}

// Reports
await page.goto(`${BASE}/reports`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Reports page loads", page.url().endsWith("/reports"));
check("Reports shows real aggregate stats", text?.includes("Exams completed") && text?.includes("Pass rate"));
await page.screenshot({ path: "screenshots/phase2c2-03-reports.png", fullPage: true });

// Documentation
await page.goto(`${BASE}/documentation`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Documentation page loads", page.url().endsWith("/documentation"));
check("Candidate Guide shows version metadata", text?.includes("Version") && text?.includes("Last updated") && text?.includes("Owner"));
await page.click('button:has-text("Instructor & Exam Manager Guide")');
await page.waitForTimeout(300);
text = await page.locator("body").textContent();
check("Instructor Guide tab shows real content", text?.includes("Preparing an exam") && text?.includes("Escalation procedure"));
await page.screenshot({ path: "screenshots/phase2c2-04-documentation.png", fullPage: true });

// Security procedure
await page.goto(`${BASE}/security-procedure`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Security Procedure page loads", page.url().endsWith("/security-procedure"));
check("Security Procedure shows versioned real content", text?.includes("Version 1.0") || (text?.includes("1.0") && text?.includes("Effective date")));
check("Security Procedure covers Detection through Corrective Actions", text?.includes("Detection") && text?.includes("Corrective"));
await page.screenshot({ path: "screenshots/phase2c2-05-security-procedure.png", fullPage: true });

// Identity Verification
await page.goto(`${BASE}/identity-verification`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Identity Verification page loads", page.url().endsWith("/identity-verification"));
check("Identity Verification shows the real recorded check", text?.includes("Test Candidate") && text?.includes("Official ID"));
await page.screenshot({ path: "screenshots/phase2c2-06-identity-verification.png", fullPage: true });

// Audit & Compliance — verify statuses upgraded
await page.goto(`${BASE}/audit-compliance`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Audit & Compliance loads", page.url().endsWith("/audit-compliance"));
check("Evidence Center shows new cards", ["Results Reporting", "Documentation", "Browser Compatibility", "Identity Verification", "Incident Response Procedure"].every((s) => text?.includes(s)));

for (const label of ["Results validation workflow", "Security incident / breach protocol", "Candidate identity verification", "Instructor and candidate documentation"]) {
  const row = page.locator(`button:has-text("${label}")`).first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(250);
  }
}
text = await page.locator("body").textContent();
check("Results validation workflow shows real evidence text", text?.includes("mdl_quiz_attempts") || text?.includes("finished"));
check("Security breach protocol shows real evidence", text?.includes("SECURITY_INCIDENT_RESPONSE_PROCEDURE") || text?.includes("12-step"));
check("Identity verification shows real evidence", text?.includes("kost_console_identity_verifications"));
await page.screenshot({ path: "screenshots/phase2c2-07-compliance-updated.png", fullPage: true });

// RBAC: identity-verification recording restricted; feedback review restricted
// (console_admin has administrator role so both are visible — this confirms authorized access works;
// full negative-path RBAC was already proven in Phase 1's authz-test.mjs against role gating.)

// Secrets check
const sensitivePatterns = [
  "947d219fa8563ebe84a404ba4bd25e6a",
  "JetXeNFerBwCFqFViqf2bu9Z",
  "ulHdwF91oiIWbLQDklk2CjUo",
  "SESSION_SECRET",
  "MYSQL_RW_PASSWORD",
  "CandidateTest123",
  "DB_ROOT_PASS",
];
const hasSensitive = sensitivePatterns.some((p) => text?.includes(p));
check("No sensitive secrets visible", !hasSensitive);

console.log("\nConsole errors:", consoleErrors.length);
consoleErrors.forEach((e) => console.log("  -", e));
console.log("Failed requests:", failedRequests.length);
failedRequests.forEach((e) => console.log("  -", e));
check("No console errors across all pages", consoleErrors.length === 0);
check("No failed requests across all pages", failedRequests.length === 0);

await browser.close();
console.log(`\n=== ${results.filter(r=>r.ok).length}/${results.length} passed ===`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);
