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

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
check("Regression: login still works", true);

// Audit Readiness Summary
await page.goto(`${BASE}/audit-readiness`, { waitUntil: "networkidle" });
let text = await page.locator("body").textContent();
check("Audit Readiness page loads", page.url().endsWith("/audit-readiness"));
check("Shows Total/Verified/Partial/Not Configured/Not Applicable", ["Total Requirements", "Verified", "Partial", "Not Configured", "Not Applicable"].every((s) => text?.includes(s)));
check("No misleading compliance percentage shown", !text?.match(/\d+%\s*compliant/i));
check("Overall Technical Audit Readiness statement present", text?.includes("Overall Technical Audit Readiness"));
await page.screenshot({ path: "screenshots/phase3-01-audit-readiness.png", fullPage: true });

// View Evidence deep link
const viewEvidenceBtn = page.locator('a:has-text("View Evidence")').first();
if (await viewEvidenceBtn.count() > 0) {
  const href = await viewEvidenceBtn.getAttribute("href");
  await viewEvidenceBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  check("View Evidence deep-links to Audit & Compliance with anchor", page.url().includes("/audit-compliance#"));
}

// Evidence Pack
await page.goto(`${BASE}/evidence-pack`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Evidence Pack page loads", page.url().endsWith("/evidence-pack"));
check("Evidence Pack covers required groups", ["TLS / HTTPS", "Backup Logs", "Load Test", "Roles / RBAC", "Security Incident Procedure", "Identity Verification"].every((s) => text?.includes(s)));
await page.screenshot({ path: "screenshots/phase3-02-evidence-pack.png", fullPage: true });

// ANAC checklist
await page.goto(`${BASE}/anac-checklist`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("ANAC Checklist page loads", page.url().endsWith("/anac-checklist"));
check("ANAC Checklist shows honest gap notes for Partial items", text?.includes("Gap") && text?.includes("None identified within current tracked scope"));
await page.screenshot({ path: "screenshots/phase3-03-anac-checklist.png", fullPage: true });

// Presentation Mode toggle
await page.goto(`${BASE}/audit-logs`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
const beforeHadRealUser = text?.includes("Console Administrator") || text?.includes("console_admin");
await page.click('button:has-text("Presentation")');
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1500);
text = await page.locator("body").textContent();
check("Presentation Mode toggle activates", text?.includes("Presentation Mode") || text?.includes("redacted"));
check("Presentation Mode redacts names on Audit Logs (no full raw username/name)", !text?.includes("test_candidate") && !text?.includes("Test Candidate"));
// turn back off for cleanliness
await page.click('button:has-text("Presentation Mode")').catch(() => {});
await page.waitForTimeout(500);

// Secrets scan across all Phase 3 pages
const sensitivePatterns = [
  "947d219fa8563ebe84a404ba4bd25e6a",
  "JetXeNFerBwCFqFViqf2bu9Z",
  "ulHdwF91oiIWbLQDklk2CjUo",
  "AuditorReadOnly2026",
  "SESSION_SECRET",
  "MYSQL_RW_PASSWORD",
  "DB_ROOT_PASS",
  "CandidateTest123",
];
for (const path of ["/audit-readiness", "/evidence-pack", "/anac-checklist", "/audit-compliance"]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const t = await page.locator("body").textContent();
  const leaked = sensitivePatterns.filter((p) => t?.includes(p));
  check(`No secrets on ${path}`, leaked.length === 0, leaked.join(", "));
}

console.log("\nConsole errors:", consoleErrors.length);
consoleErrors.forEach((e) => console.log("  -", e));
console.log("Failed requests:", failedRequests.length);
failedRequests.forEach((e) => console.log("  -", e));
check("No console errors across all pages", consoleErrors.length === 0);
check("No failed requests across all pages", failedRequests.length === 0);

await browser.close();
console.log(`\n=== ${results.filter((r) => r.ok).length}/${results.length} passed ===`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);
