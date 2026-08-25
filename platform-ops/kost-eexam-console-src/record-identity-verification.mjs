import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });

await page.goto(`${BASE}/identity-verification`, { waitUntil: "networkidle" });
await page.fill('input[name="candidateUsername"]', "test_candidate");
await page.fill('input[name="candidateFullName"]', "Test Candidate");
await page.fill('input[name="examName"]', "KOST E-EXAM — Practice Test");
await page.fill('input[name="sessionReference"]', "Phase 2C Batch 2 verification test — 2026-08-20");
await page.click('button:has-text("Record verification")');
await page.waitForTimeout(1200);
const text = await page.locator("body").textContent();
console.log("Success message present:", text?.includes("Verification recorded"));

await browser.close();
