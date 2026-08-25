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

// Existing regression checks
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
check("Login still works (regression)", true);

// New: Audit & Compliance page
await page.goto(`${BASE}/audit-compliance`, { waitUntil: "networkidle" });
check("Audit & Compliance page loads", page.url().endsWith("/audit-compliance"));

const pageText = await page.locator("body").textContent();
check("Page shows real category names", pageText?.includes("Question Bank") && pageText?.includes("Regulatory Compliance"));
check("Verified badge present", pageText?.includes("Verified"));
check("Not Configured badge present (honesty check)", pageText?.includes("Not Configured"));
check("No fake 'Verified' overload — Partial/Not Configured also shown", pageText?.includes("Partial"));

await page.screenshot({ path: "screenshots/phase2-01-audit-compliance-top.png" });

// Expand an evidence row
const firstExpandable = page.locator("button:has-text('Secure access to the platform')").first();
if (await firstExpandable.isVisible().catch(() => false)) {
  await firstExpandable.click();
  await page.waitForTimeout(500);
  check("Evidence row expands with technical details", await page.locator("text=Evidence").first().isVisible().catch(() => false));
}
await page.screenshot({ path: "screenshots/phase2-02-audit-compliance-expanded.png", fullPage: true });

// Sensitive data check — no secrets visible on the page
const sensitivePatterns = ["947d219fa8563ebe84a404ba4bd25e6a", "JetXeNFerBwCFqFViqf2bu9Z", "SESSION_SECRET"];
const hasSensitive = sensitivePatterns.some((p) => pageText?.includes(p));
check("No sensitive secrets visible on Audit & Compliance page", !hasSensitive);

console.log("\nConsole errors:", consoleErrors.length);
consoleErrors.forEach((e) => console.log("  -", e));
console.log("Failed requests:", failedRequests.length);
failedRequests.forEach((e) => console.log("  -", e));
check("No console errors", consoleErrors.length === 0);
check("No failed requests", failedRequests.length === 0);

await browser.close();
console.log(`\n=== ${results.filter(r=>r.ok).length}/${results.length} passed ===`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);
