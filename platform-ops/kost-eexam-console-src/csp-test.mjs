import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const consoleErrors = [];
const failedRequests = [];

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("requestfailed", (req) => {
  failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
});
page.on("response", (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
});

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });
await page.waitForLoadState("networkidle");

await page.goto(`${BASE}/system`, { waitUntil: "networkidle" });
await page.goto(`${BASE}/exams`, { waitUntil: "networkidle" });

console.log("Console errors:", consoleErrors.length);
consoleErrors.forEach((e) => console.log("  -", e));
console.log("Failed/4xx-5xx requests:", failedRequests.length);
failedRequests.forEach((e) => console.log("  -", e));

await browser.close();
process.exit(consoleErrors.length > 0 || failedRequests.length > 0 ? 1 : 0);
