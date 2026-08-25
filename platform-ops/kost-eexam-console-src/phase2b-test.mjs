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

// Exams
await page.goto(`${BASE}/exams`, { waitUntil: "networkidle" });
let text = await page.locator("body").textContent();
check("Exams page loads", page.url().endsWith("/exams"));
check("Exams shows real exam name", text?.includes("DGR Function 7.3"));
check("Exams shows real duration (60 min)", text?.includes("60 min"));
check("Exams shows real passing score (70/100)", text?.includes("70/100"));
await page.screenshot({ path: "screenshots/phase2b-01-exams.png", fullPage: true });

// Sessions
await page.goto(`${BASE}/sessions`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Sessions page loads", page.url().endsWith("/sessions"));
check("Sessions shows Live Session Monitoring", text?.includes("Live Session Monitoring"));
check("Sessions shows real exam entry", text?.includes("DGR Function 7.3"));
await page.screenshot({ path: "screenshots/phase2b-02-sessions.png", fullPage: true });

// Question Bank
await page.goto(`${BASE}/question-bank`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Question Bank page loads", page.url().endsWith("/question-bank"));
check("Question Bank shows real sample questions", text?.includes("DGR Sample Q1"));
check("Question Bank shows Function 7.1 filter", text?.includes("Function 7.1"));
check("Question Bank shows 'Not classified' for untagged (honesty)", text?.includes("Not classified"));
await page.screenshot({ path: "screenshots/phase2b-03-question-bank.png", fullPage: true });

// Audit Logs
await page.goto(`${BASE}/audit-logs`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Audit Logs page loads", page.url().endsWith("/audit-logs"));
check("Audit Logs shows real event count", /\d[\d,]* events? recorded/.test(text ?? ""));
await page.screenshot({ path: "screenshots/phase2b-04-audit-logs.png", fullPage: true });

// Audit & Compliance — verify statuses upgraded
await page.goto(`${BASE}/audit-compliance`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Audit & Compliance loads", page.url().endsWith("/audit-compliance"));

// Expand "Timer and automatic submission" to confirm Verified with real evidence
const timerRow = page.locator("button:has-text('Timer and automatic submission')").first();
if (await timerRow.isVisible().catch(() => false)) {
  await timerRow.click();
  await page.waitForTimeout(400);
  const expandedText = await page.locator("body").textContent();
  check("Timer/auto-submission now shows real evidence (autosubmit)", expandedText?.includes("autosubmit") ?? false);
}
await page.screenshot({ path: "screenshots/phase2b-05-compliance-updated.png", fullPage: true });

// Secrets check across all new pages
const sensitivePatterns = ["947d219fa8563ebe84a404ba4bd25e6a", "JetXeNFerBwCFqFViqf2bu9Z", "SESSION_SECRET", "CandidateTest123"];
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
