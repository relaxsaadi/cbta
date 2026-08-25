import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_auditor");
await page.fill('input[name="password"]', "AuditorReadOnly2026!Bb");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
check("Auditor account can log in", page.url().endsWith("/overview"));

let text = await page.locator("body").textContent();
check("Role badge shows Auditor", text?.includes("Auditor"));

// Read access to the pages the spec requires
for (const [label, path] of [
  ["Audit & Compliance", "/audit-compliance"],
  ["Audit Readiness", "/audit-readiness"],
  ["Evidence Pack", "/evidence-pack"],
  ["Reports", "/reports"],
  ["System Status", "/system"],
  ["Documentation", "/documentation"],
  ["Audit Logs", "/audit-logs"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  check(`Auditor can view ${label}`, page.url().endsWith(path));
}

// Must NOT be able to record an identity verification (write action)
await page.goto(`${BASE}/identity-verification`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("Auditor cannot record identity verification (form hidden)", !(await page.locator('button:has-text("Record verification")').isVisible().catch(() => false)));
check("Auditor sees 'not authorized' message for identity verification", text?.includes("not authorized"));

// Must NOT see status-change controls on Technical Incidents
await page.goto(`${BASE}/incidents`, { waitUntil: "networkidle" });
const firstRow = page.locator("tbody tr").first();
if (await firstRow.count() > 0) {
  await firstRow.click();
  await page.waitForTimeout(400);
  const statusButtons = page.locator('button:has-text("Change status")');
  check("Auditor cannot change incident status (no status buttons)", (await page.locator("text=Change status:").count()) === 0);
}

// Must NOT see status-change controls on Feedback Review
await page.goto(`${BASE}/feedback`, { waitUntil: "networkidle" });
await page.click('button:has-text("Feedback Review")').catch(() => {});
await page.waitForTimeout(300);
text = await page.locator("body").textContent();
check("Auditor's Feedback Review tab is hidden (not admin/exam_manager)", !text?.includes("Feedback Review") || !(await page.locator('button:has-text("Feedback Review")').isVisible().catch(() => false)));

// Confirm no exam/question/settings edit controls exist anywhere reachable
await page.goto(`${BASE}/exams`, { waitUntil: "networkidle" });
text = await page.locator("body").textContent();
check("No exam edit/delete controls visible to Auditor", !text?.includes("Delete exam") && !text?.includes("Edit exam"));

await browser.close();
console.log(`\n=== ${results.filter((r) => r.ok).length}/${results.length} passed ===`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);
