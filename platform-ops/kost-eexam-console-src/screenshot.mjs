import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// 1. Login page
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.screenshot({ path: "screenshots/01-login.png" });

// 2. Perform real login
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "screenshots/02-overview.png", fullPage: true });

// 3. System status
await page.goto("http://localhost:3000/system", { waitUntil: "networkidle" });
await page.screenshot({ path: "screenshots/03-system.png", fullPage: true });

// 4. A Phase 2 placeholder page
await page.goto("http://localhost:3000/exams", { waitUntil: "networkidle" });
await page.screenshot({ path: "screenshots/04-placeholder-exams.png", fullPage: true });

await browser.close();
console.log("Screenshots done.");
