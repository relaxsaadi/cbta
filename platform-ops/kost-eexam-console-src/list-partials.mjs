import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://console.kostacademy.com/login", { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
await page.goto("https://console.kostacademy.com/audit-compliance", { waitUntil: "networkidle" });

// Expand every row so evidence/notes render, then dump full text per category card
const buttons = await page.locator("button").all();
for (const b of buttons) {
  const t = await b.textContent().catch(() => "");
  if (t && t.length > 10 && !t.includes("Verified") === false) {} // no-op
}
// Simpler: click all requirement rows (they are buttons containing requirement text within category cards)
const rowButtons = page.locator("div.flex.flex-col button, button");
const count = await rowButtons.count();
for (let i = 0; i < count; i++) {
  try {
    const btn = rowButtons.nth(i);
    if (await btn.isVisible()) await btn.click({ timeout: 500 }).catch(()=>{});
  } catch {}
}
await page.waitForTimeout(500);
const bodyText = await page.locator("body").innerText();
console.log(bodyText);
await browser.close();
