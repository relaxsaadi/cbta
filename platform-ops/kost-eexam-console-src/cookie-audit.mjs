import { chromium } from "playwright";

const BASE = "https://console.kostacademy.com";
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="username"]', "console_admin");
await page.fill('input[name="password"]', "Kcdf0583b303968ff7ee42!A1");
await page.click('button[type="submit"]');
await page.waitForURL("**/overview", { timeout: 15000 });

const cookies = await context.cookies();
const sessionCookie = cookies.find((c) => c.name === "kost_eexam_session");

console.log("=== COOKIE ATTRIBUTES ===");
console.log("Found:", !!sessionCookie);
if (sessionCookie) {
  console.log("HttpOnly:", sessionCookie.httpOnly);
  console.log("Secure:", sessionCookie.secure);
  console.log("SameSite:", sessionCookie.sameSite);
  const expiresIn = sessionCookie.expires > 0 ? (sessionCookie.expires - Date.now() / 1000) / 3600 : "session";
  console.log("Expires in (hours):", expiresIn);
}

// Refresh — session should persist
await page.reload({ waitUntil: "networkidle" });
console.log("\n=== AFTER REFRESH ===");
console.log("Still on protected page:", !page.url().includes("/login"), page.url());

// Logout
await page.locator('button[type="submit"]:has-text("Log out")').click();
await page.waitForURL("**/login", { timeout: 10000 });
const cookiesAfterLogout = await context.cookies();
const sessionAfterLogout = cookiesAfterLogout.find((c) => c.name === "kost_eexam_session");
console.log("\n=== AFTER LOGOUT ===");
console.log("Redirected to login:", page.url().endsWith("/login"));
console.log("Session cookie still present:", !!sessionAfterLogout, sessionAfterLogout?.value?.slice(0, 20));

// Try protected page after logout
await page.goto(`${BASE}/overview`, { waitUntil: "networkidle" });
console.log("\n=== ACCESS AFTER LOGOUT ===");
console.log("Redirected to login:", page.url().endsWith("/login"), page.url());

await browser.close();
